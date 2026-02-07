export function createTimelineUI(editor) {
	const container = document.createElement('div');
	container.className = 'sequencer-ui-panel';
	container.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 60px;
        background: #2a2a2e;
        border-top: 1px solid #444;
        display: flex;
        align-items: center;
        padding: 0 20px;
        gap: 10px;
        z-index: 10000;
    `;

	const playBtn = document.createElement('button');
	playBtn.textContent = 'Play';
	playBtn.style.minWidth = '60px';

	const slider = document.createElement('input');
	slider.type = 'range';
	slider.min = 0;
	slider.value = 0;
	slider.style.flex = '1';

	const timeDisplay = document.createElement('span');
	timeDisplay.textContent = '0ms';
	timeDisplay.style.minWidth = '50px';
	timeDisplay.style.textAlign = 'right';

	const durationInput = document.createElement('input');
	durationInput.type = 'number';
	durationInput.placeholder = 'Duration';
	durationInput.style.width = '60px';
	durationInput.style.background = '#1a1a1d';
	durationInput.style.color = '#eee';
	durationInput.style.border = '1px solid #333';
	durationInput.style.padding = '2px 4px';
	durationInput.style.borderRadius = '3px';
	durationInput.style.fontFamily = 'monospace';
	durationInput.title = 'Total Duration (ms)';

	durationInput.onchange = (e) => {
		if (!controller) return;
		const val = parseFloat(e.target.value);
		if (!isNaN(val) && val > 0) {
			controller.fixedDuration = val;
		}
		controller.calculateDuration();
		slider.max = controller.duration;
		ui.renderMarkers();
	};

	const dopeSheet = document.createElement('div');
	dopeSheet.style.cssText = `
        position: absolute;
        top: -10px;
        left: 0;
        width: 100%;
        height: 10px;
        pointer-events: none;
    `;

	const sliderContainer = document.createElement('div');
	sliderContainer.style.cssText = `
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
    `;

	sliderContainer.appendChild(dopeSheet);
	sliderContainer.appendChild(slider);

	const elementSelect = document.createElement('select');
	elementSelect.style.cssText = `
        background: #444;
        color: white;
        border: 1px solid #555;
        padding: 4px;
        border-radius: 4px;
        max-width: 150px;
    `;
	const defaultOption = document.createElement('option');
	defaultOption.value = '';
	defaultOption.textContent = 'Select Element...';
	elementSelect.appendChild(defaultOption);

	elementSelect.onchange = (e) => {
		if (!controller) return;
		const selectedIndex = elementSelect.selectedIndex;
		if (selectedIndex > 0) {
			const target = elementSelect.options[selectedIndex].targetRef;
			if (target && window.sequencerEditor) {
				window.sequencerEditor.selectElement(target);
			}
		} else {
			if (window.sequencerEditor) {
				window.sequencerEditor.selectElement(null);
			}
		}
	};

	container.appendChild(playBtn);
	container.appendChild(elementSelect);
	container.appendChild(sliderContainer);
	container.appendChild(timeDisplay);
	container.appendChild(durationInput);
	document.body.appendChild(container);

	let controller = null;
	let isDragging = false;
	const selectedAnimations = new Set();

	playBtn.onclick = () => {
		if (!controller) return;

		if (controller.currentTime >= controller.duration && !controller.isPlaying) {
			controller.seek(0);
			controller.play();
			playBtn.textContent = 'Pause';
			return;
		}

		if (controller.isPlaying) {
			controller.pause();
			playBtn.textContent = 'Play';
		} else {
			controller.play();
			playBtn.textContent = 'Pause';
		}
	};

	slider.oninput = (e) => {
		if (!controller) return;
		isDragging = true;
		controller.pause();
		playBtn.textContent = 'Play';
		const time = parseFloat(e.target.value);
		controller.seek(time);
		timeDisplay.textContent = Math.round(time) + 'ms';
	};

	slider.onchange = () => {
		isDragging = false;
	};

	function update() {
		if (controller && !isDragging && controller.isPlaying) {
			slider.value = controller.currentTime;
			timeDisplay.textContent = Math.round(controller.currentTime) + 'ms';
		}
		requestAnimationFrame(update);
	}
	requestAnimationFrame(update);

	// key handler
	document.addEventListener('keydown', (e) => {
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

		if (e.code === 'Space') {
			e.preventDefault();
			playBtn.click();
			return;
		}

		if ((e.key === 'Delete' || e.key === 'Backspace') && selectedAnimations.size > 0) {
			if (!controller) return;

			if (window.sequencerEditor && window.sequencerEditor.inspector) {
				const pathPanel = document.getElementById('sequencer-path-editor-panel');
				const canvas = document.getElementById('sequencer-path-editor-canvas');
				if (canvas && canvas.style.pointerEvents === 'auto') {
					return;
				}
			}

			const removed = Array.from(selectedAnimations);
			controller.animations = controller.animations.filter((a) => !selectedAnimations.has(a));
			selectedAnimations.clear();
			controller.sortAnimations();
			controller.calculateDuration();

			ui.renderMarkers();
			if (window.sequencerEditor && window.sequencerEditor.inspector) {
				window.sequencerEditor.inspector.updateCode();
				window.sequencerEditor.inspector.updateSelectedAnimations([]);
			}

			if (window.sequencerEditor && window.sequencerEditor.history) {
				window.sequencerEditor.history.push({
					undo: () => {
						controller.animations.push(...removed);
						controller.sortAnimations();
						controller.calculateDuration();
						ui.renderMarkers();
						if (window.sequencerEditor.inspector) window.sequencerEditor.inspector.updateCode();
					},
					redo: () => {
						controller.animations = controller.animations.filter((a) => !removed.includes(a));
						controller.sortAnimations();
						controller.calculateDuration();
						ui.renderMarkers();
						if (window.sequencerEditor.inspector) window.sequencerEditor.inspector.updateCode();
					},
				});
			}
		}
	});

	const ui = {
		// attach controller to ui
		attachController(e) {
			controller = e;
			if (!controller.fixedDuration) {
				controller.fixedDuration = Math.max(2000, controller.duration);
				controller.calculateDuration();
			}
			slider.max = controller.duration;
			durationInput.value = controller.duration;

			controller.onFinish = () => {
				playBtn.textContent = 'Play';
			};

			this.updateDropdown();
			this.renderMarkers();
		},

		// update element dropdown
		updateDropdown() {
			if (!controller) return;

			const currentTarget = elementSelect.selectedIndex > 0 ? elementSelect.options[elementSelect.selectedIndex].targetRef : null;

			while (elementSelect.options.length > 1) {
				elementSelect.remove(1);
			}

			const targets = new Set();
			for (const anim of controller.animations) {
				targets.add(anim.target);
			}

			if (window.sequencerEditor && window.sequencerEditor.selectedElement) {
				targets.add(window.sequencerEditor.selectedElement);
			}

			for (const target of targets) {
				const opt = document.createElement('option');
				const name = target.tagName.toLowerCase() + (target.id ? '#' + target.id : '') + (target.className ? '.' + target.className : '');
				opt.textContent = name;
				opt.targetRef = target;
				elementSelect.appendChild(opt);
			}

			if (currentTarget) {
				for (let i = 0; i < elementSelect.options.length; i++) {
					if (elementSelect.options[i].targetRef === currentTarget) {
						elementSelect.selectedIndex = i;
						break;
					}
				}
			}
		},

		// select animations
		selectAnimations(anims) {
			selectedAnimations.clear();
			if (anims) {
				for (const a of anims) selectedAnimations.add(a);
			}
			this.renderMarkers();

			if (window.sequencerEditor && window.sequencerEditor.inspector) {
				window.sequencerEditor.inspector.updateSelectedAnimations(Array.from(selectedAnimations));
			}
		},

		// render timeline markers
		renderMarkers() {
			dopeSheet.innerHTML = '';
			if (!controller) return;

			const selectedElement = window.sequencerEditor ? window.sequencerEditor.selectedElement : null;

			const timeGroups = new Map();

			for (const anim of controller.animations) {
				if (selectedElement && anim.target !== selectedElement) continue;

				if (anim.startTime === 0 && anim.duration === 0) continue;

				const t = anim.startTime;
				if (!timeGroups.has(t)) timeGroups.set(t, []);
				timeGroups.get(t).push({ anim, type: 'start' });

				if (anim.duration > 0) {
					const endT = anim.startTime + anim.duration;
					if (!timeGroups.has(endT)) timeGroups.set(endT, []);
					timeGroups.get(endT).push({ anim, type: 'end' });
				}
			}

			for (const [time, items] of timeGroups) {
				const pct = (time / controller.duration) * 100;
				const markerContainer = document.createElement('div');
				markerContainer.style.cssText = `
                    position: absolute;
                    left: ${pct}%;
                    top: 0;
                    width: 20px;
                    height: 20px;
                    transform: translateX(-50%);
                    cursor: pointer;
                    z-index: 2;
                    pointer-events: auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;

				const marker = document.createElement('div');
				marker.className = 'sequencer-keyframe-marker';
				marker.style.cssText = `
                    width: 8px;
                    height: 8px;
                    background: #00aaff;
                    border: 1px solid white;
                    border-radius: 50%;
                `;

				const anims = items.map((i) => i.anim);
				const isSelected = anims.some((a) => selectedAnimations.has(a));

				const isEnd = items.every((i) => i.type === 'end');
				if (isEnd) {
					marker.style.borderRadius = '0';
					marker.style.transform = 'rotate(45deg)';
				}

				if (isSelected) {
					marker.style.background = '#ffaa00';
					marker.style.borderColor = '#ffaa00';
					markerContainer.style.zIndex = 3;
				}

				markerContainer.onmousedown = (e) => {
					e.stopPropagation();

					if (!e.shiftKey) {
						selectedAnimations.clear();
					}

					const endItems = items.filter((i) => i.type === 'end');
					const startItems = items.filter((i) => i.type === 'start');

					let targetAnims = [];
					let context = 'end';

					if (endItems.length > 0) {
						targetAnims = endItems.map((i) => i.anim);
						context = 'end';
					} else {
						targetAnims = startItems.map((i) => i.anim);
						context = 'start';
					}

					for (const a of targetAnims) selectedAnimations.add(a);
					this.renderMarkers();

					if (window.sequencerEditor && window.sequencerEditor.inspector) {
						window.sequencerEditor.inspector.updateSelectedAnimations(Array.from(selectedAnimations), context);
					}

					if (!isEnd) {
						const pathAnim = anims.find((a) => a.type === 'path');
						if (pathAnim && window.sequencerEditor && window.sequencerEditor.inspector) {
							window.sequencerEditor.inspector.loadPath(pathAnim.path);
						}
					}

					const startX = e.clientX;
					const originalTime = time;
					const originalStates = new Map();
					for (const item of items) {
						originalStates.set(item.anim, {
							startTime: item.anim.startTime,
							duration: item.anim.duration,
						});
					}

					const onMove = (moveEvent) => {
						const rect = sliderContainer.getBoundingClientRect();
						const x = moveEvent.clientX - rect.left;
						const newPct = Math.max(0, x / rect.width);
						let newTime = newPct * controller.duration;

						newTime = Math.round(newTime / 10) * 10;

						if (newTime > controller.duration) {
							newTime = controller.duration;
						}

						for (const item of items) {
							if (item.type === 'start') {
								item.anim.startTime = Math.max(0, newTime);
							} else {
								const newDuration = Math.max(0, newTime - item.anim.startTime);
								item.anim.duration = newDuration;
							}
						}

						controller.sortAnimations();
						controller.calculateDuration();
						this.renderMarkers();

						if (window.sequencerEditor && window.sequencerEditor.inspector) {
							window.sequencerEditor.inspector.updateCode();
							window.sequencerEditor.inspector.updateSelectedAnimations(Array.from(selectedAnimations));
						}
					};

					const onUp = () => {
						document.removeEventListener('mousemove', onMove);
						document.removeEventListener('mouseup', onUp);

						if (window.sequencerEditor && window.sequencerEditor.history) {
							const newStates = new Map();
							for (const item of items) {
								newStates.set(item.anim, {
									startTime: item.anim.startTime,
									duration: item.anim.duration,
								});
							}

							let changed = false;
							for (const item of items) {
								const oldState = originalStates.get(item.anim);
								const newState = newStates.get(item.anim);
								if (Math.abs(oldState.startTime - newState.startTime) > 1 || Math.abs(oldState.duration - newState.duration) > 1) {
									changed = true;
									break;
								}
							}

							if (changed) {
								window.sequencerEditor.history.push({
									undo: () => {
										for (const item of items) {
											const s = originalStates.get(item.anim);
											item.anim.startTime = s.startTime;
											item.anim.duration = s.duration;
										}
										controller.sortAnimations();
										controller.calculateDuration();
										this.renderMarkers();
										if (window.sequencerEditor.inspector) window.sequencerEditor.inspector.updateCode();
									},
									redo: () => {
										for (const item of items) {
											const s = newStates.get(item.anim);
											item.anim.startTime = s.startTime;
											item.anim.duration = s.duration;
										}
										controller.sortAnimations();
										controller.calculateDuration();
										this.renderMarkers();
										if (window.sequencerEditor.inspector) window.sequencerEditor.inspector.updateCode();
									},
								});
							}
						}
					};

					document.addEventListener('mousemove', onMove);
					document.addEventListener('mouseup', onUp);
				};

				markerContainer.appendChild(marker);
				dopeSheet.appendChild(markerContainer);
			}

			if (selectedElement) {
				let found = false;
				for (let i = 0; i < elementSelect.options.length; i++) {
					if (elementSelect.options[i].targetRef === selectedElement) {
						elementSelect.selectedIndex = i;
						found = true;
						break;
					}
				}
				if (!found) {
					this.updateDropdown();
					for (let i = 0; i < elementSelect.options.length; i++) {
						if (elementSelect.options[i].targetRef === selectedElement) {
							elementSelect.selectedIndex = i;
							break;
						}
					}
				}
			} else {
				elementSelect.selectedIndex = 0;
			}
		},
	};

	return ui;
}
