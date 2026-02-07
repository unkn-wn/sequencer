import { getState, applyState } from '../animation.js';
import { CodeGenerator } from './codeGenerator.js';
import { PathEditor } from './pathEditor.js';
import { EasingEditor } from './easingEditor.js';
import { Path } from '../path.js';

// create inspector ui
export function createInspector(editor) {
	const container = document.createElement('div');
	container.className = 'sequencer-ui-panel';
	container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 280px;
        background: #2a2a2e;
        border: 1px solid #444;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 10000;
        display: none; 
    `;

	const title = document.createElement('h3');
	title.textContent = 'Inspector';
	title.style.margin = '0';
	title.style.fontSize = '16px';

	const header = document.createElement('div');
	header.style.display = 'flex';
	header.style.justifyContent = 'space-between';
	header.style.alignItems = 'center';
	header.style.marginBottom = '10px';
	header.appendChild(title);

	const toggleBtn = document.createElement('button');
	toggleBtn.textContent = '-';
	toggleBtn.style.padding = '0 5px';
	toggleBtn.onclick = () => {
		if (contentContainer.style.display === 'none') {
			contentContainer.style.display = 'flex';
			toggleBtn.textContent = '-';
		} else {
			contentContainer.style.display = 'none';
			toggleBtn.textContent = '+';
		}
	};
	header.appendChild(toggleBtn);
	container.appendChild(header);

	const contentContainer = document.createElement('div');
	contentContainer.style.display = 'flex';
	contentContainer.style.flexDirection = 'column';
	contentContainer.style.gap = '10px';
	container.appendChild(contentContainer);

	const propsContainer = document.createElement('div');
	propsContainer.style.display = 'flex';
	propsContainer.style.flexDirection = 'column';
	propsContainer.style.gap = '5px';
	contentContainer.appendChild(propsContainer);

	const objectStateTitle = document.createElement('div');
	objectStateTitle.textContent = 'Object State';
	objectStateTitle.style.fontSize = '12px';
	objectStateTitle.style.fontWeight = 'bold';
	objectStateTitle.style.marginBottom = '5px';
	propsContainer.appendChild(objectStateTitle);

	const btnRow = document.createElement('div');
	btnRow.style.display = 'flex';
	btnRow.style.gap = '5px';
	contentContainer.appendChild(btnRow);

	const keyframeBtn = document.createElement('button');
	keyframeBtn.textContent = 'Add Keyframe';
	keyframeBtn.style.flex = '1';
	btnRow.appendChild(keyframeBtn);

	const pathKeyframeBtn = document.createElement('button');
	pathKeyframeBtn.textContent = 'Add Path Anim';
	pathKeyframeBtn.style.flex = '1';
	btnRow.appendChild(pathKeyframeBtn);

	const pathEditorContainer = document.createElement('div');
	contentContainer.appendChild(pathEditorContainer);
	const pathEditor = new PathEditor(pathEditorContainer, editor);

	const easingEditorContainer = document.createElement('div');
	easingEditorContainer.style.display = 'none';
	contentContainer.appendChild(easingEditorContainer);
	const easingEditor = new EasingEditor(easingEditorContainer, editor);

	const codeContainer = document.createElement('div');
	codeContainer.style.position = 'relative';
	contentContainer.appendChild(codeContainer);

	const codeOutput = document.createElement('textarea');
	codeOutput.style.height = '100px';
	codeOutput.style.width = '100%';
	codeOutput.style.boxSizing = 'border-box';
	codeOutput.style.background = '#111';
	codeOutput.style.color = '#afa';
	codeOutput.style.border = '1px solid #444';
	codeOutput.style.marginTop = '10px';
	codeOutput.style.fontFamily = 'monospace';
	codeOutput.style.fontSize = '11px';
	codeContainer.appendChild(codeOutput);

	const copyBtn = document.createElement('button');
	copyBtn.textContent = 'Copy';
	copyBtn.style.position = 'absolute';
	copyBtn.style.top = '15px';
	copyBtn.style.right = '5px';
	copyBtn.style.fontSize = '10px';
	copyBtn.style.padding = '2px 5px';
	copyBtn.style.opacity = '0.8';

	copyBtn.onclick = () => {
		codeOutput.select();
		navigator.clipboard.writeText(codeOutput.value).then(() => {
			const originalText = copyBtn.textContent;
			copyBtn.textContent = 'Copied!';
			setTimeout(() => (copyBtn.textContent = originalText), 1500);
		});
	};
	codeContainer.appendChild(copyBtn);

	document.body.appendChild(container);

	let currentElement = null;

	// create input field
	function createInput(label, prop, step = 1) {
		const row = document.createElement('div');
		row.style.display = 'flex';
		row.style.justifyContent = 'space-between';
		row.style.alignItems = 'center';

		const lbl = document.createElement('label');
		lbl.textContent = label;
		lbl.style.fontSize = '12px';

		const input = document.createElement('input');
		input.type = 'number';
		input.step = step;

		input.oninput = (e) => {
			if (!currentElement) return;
			const val = parseFloat(e.target.value);
			const state = getState(currentElement);
			state[prop] = val;
			applyState(currentElement, state);
		};

		row.appendChild(lbl);
		row.appendChild(input);
		propsContainer.appendChild(row);
		return input;
	}

	const inputs = {
		x: createInput('X', 'x'),
		y: createInput('Y', 'y'),
		scale: createInput('Scale', 'scale', 0.1),
		rotation: createInput('Rotation', 'rotation'),
		opacity: createInput('Opacity', 'opacity', 0.1),
	};

	const animPropsContainer = document.createElement('div');
	animPropsContainer.style.borderTop = '1px solid #444';
	animPropsContainer.style.marginTop = '10px';
	animPropsContainer.style.paddingTop = '10px';
	animPropsContainer.style.display = 'none';
	animPropsContainer.style.flexDirection = 'column';
	animPropsContainer.style.gap = '5px';
	contentContainer.appendChild(animPropsContainer);

	const animTitle = document.createElement('div');
	animTitle.textContent = 'Keyframe Properties';
	animTitle.style.fontSize = '12px';
	animTitle.style.fontWeight = 'bold';
	animTitle.style.marginBottom = '5px';
	animPropsContainer.appendChild(animTitle);

	const valuesContainer = document.createElement('div');
	valuesContainer.style.display = 'flex';
	valuesContainer.style.flexDirection = 'column';
	valuesContainer.style.gap = '5px';
	valuesContainer.style.marginBottom = '10px';
	animPropsContainer.appendChild(valuesContainer);

	let currentSelectedAnims = [];

	// create animation property input
	function createAnimInput(label, prop) {
		const row = document.createElement('div');
		row.style.display = 'flex';
		row.style.justifyContent = 'space-between';
		row.style.alignItems = 'center';

		const lbl = document.createElement('label');
		lbl.textContent = label;
		lbl.style.fontSize = '12px';

		const input = document.createElement('input');
		input.type = 'number';
		input.step = 10;

		input.oninput = (e) => {
			if (!currentSelectedAnims.length) return;
			const val = parseFloat(e.target.value);

			for (const anim of currentSelectedAnims) {
				anim[prop] = val;
			}

			if (editor.controller) {
				editor.controller.sortAnimations();
				editor.controller.calculateDuration();
				editor.timelineUI.renderMarkers();
			}
			updateCode();
		};

		row.appendChild(lbl);
		row.appendChild(input);
		animPropsContainer.appendChild(row);
		return input;
	}

	const animInputs = {
		start: createAnimInput('Start (ms)', 'startTime'),
		duration: createAnimInput('Duration (ms)', 'duration'),
	};

	const editPathBtn = document.createElement('button');
	editPathBtn.textContent = 'Edit Path';
	editPathBtn.style.marginTop = '5px';
	editPathBtn.style.display = 'none';
	animPropsContainer.appendChild(editPathBtn);

	editPathBtn.onclick = () => {
		const pathAnim = currentSelectedAnims.find((a) => a.type === 'path');
		if (pathAnim) {
			pathEditor.bindAnimation(pathAnim);
		}
	};

	keyframeBtn.onclick = () => {
		addKeyframe(false);
	};

	pathKeyframeBtn.onclick = () => {
		addKeyframe(true);
	};

	// add keyframe to timeline
	function addKeyframe(isPath) {
		if (!currentElement || !editor.controller) return;

		const currentTime = Math.round(editor.controller.currentTime);
		const currentState = getState(currentElement);

		const targetAnims = editor.controller.animations.filter((a) => a.target === currentElement);

		let lastTime = 0;
		if (isPath) {
			lastTime = currentTime;
		} else {
			for (const anim of targetAnims) {
				const end = anim.startTime + anim.duration;
				if (end > lastTime && end <= currentTime) {
					lastTime = end;
				}
			}
		}

		const duration = currentTime - lastTime;
		const newAnims = [];
		const removedAnims = [];

		if (isPath) {
			let path = pathEditor.getPathData();
			let isNewPath = false;
			if (!path) {
				path = new Path();
				path.startAt(0, 0);
				path.curveTo(50, 0, 50, 50, 100, 50);
				isNewPath = true;
			}

			const existing = targetAnims.find((a) => a.type === 'path' && Math.abs(a.startTime - lastTime) < 1);
			if (existing) {
				removedAnims.push(existing);
				editor.controller.animations = editor.controller.animations.filter((a) => a !== existing);
			}

			newAnims.push({
				target: currentElement,
				type: 'path',
				startValue: null,
				endValue: path,
				startTime: lastTime,
				duration: duration > 0 ? duration : 1000,
				spline: editor.controller.ease ? editor.controller.ease.linear : { linear: true },
				path: path,
			});

			if (!isNewPath) {
				pathEditor.stopEditing();
			}
		} else {
			const props = ['x', 'y', 'scale', 'rotation', 'opacity'];
			const mapping = {
				x: 'translateX',
				y: 'translateY',
				scale: 'scale',
				rotation: 'rotate',
				opacity: 'opacity',
			};

			for (const prop of props) {
				const val = currentState[prop];
				const type = mapping[prop];

				const existing = targetAnims.find((a) => a.type === type && Math.abs(a.startTime - lastTime) < 1);
				if (existing) {
					removedAnims.push(existing);
					editor.controller.animations = editor.controller.animations.filter((a) => a !== existing);
				}

				newAnims.push({
					target: currentElement,
					type: type,
					startValue: null,
					endValue: val,
					startTime: lastTime,
					duration: duration,
					spline: editor.controller.ease ? editor.controller.ease.linear : { linear: true },
					state: 'to',
				});
			}
		}

		editor.controller.animations.push(...newAnims);
		editor.controller.refresh();
		editor.timelineUI.attachController(editor.controller);
		updateCode();

		if (isPath && newAnims.length > 0) {
			if (!pathEditor.isDrawing) {
				pathEditor.bindAnimation(newAnims[0]);
			}
		}

		if (editor.timelineUI && editor.timelineUI.selectAnimations) {
			editor.timelineUI.selectAnimations(newAnims);
		}

		if (editor.history) {
			editor.history.push({
				undo: () => {
					editor.controller.animations = editor.controller.animations.filter((a) => !newAnims.includes(a));
					editor.controller.animations.push(...removedAnims);
					editor.controller.refresh();
					editor.timelineUI.renderMarkers();
					updateCode();
					editor.timelineUI.selectAnimations([]);
				},
				redo: () => {
					editor.controller.animations = editor.controller.animations.filter((a) => !removedAnims.includes(a));
					editor.controller.animations.push(...newAnims);
					editor.controller.refresh();
					editor.timelineUI.renderMarkers();
					updateCode();
					editor.timelineUI.selectAnimations(newAnims);
				},
			});
		}
	}

	// update generated code
	function updateCode() {
		if (!currentElement || !editor.controller) return;
		const code = CodeGenerator.generate(currentElement, editor.controller.animations, editor.controller);
		codeOutput.value = code;
	}

	// refresh input values
	function refreshValues() {
		if (!currentElement) return;
		const state = getState(currentElement);
		inputs.x.value = Math.round(state.x * 100) / 100;
		inputs.y.value = Math.round(state.y * 100) / 100;
		inputs.scale.value = Math.round(state.scale * 100) / 100;
		inputs.rotation.value = Math.round(state.rotation * 100) / 100;
		inputs.opacity.value = Math.round(state.opacity * 100) / 100;
	}

	return {
		// update inspector state
		update(element) {
			if (currentElement !== element) {
				pathEditor.clear();
				this.updateSelectedAnimations([]);
				if (editor.timelineUI && editor.timelineUI.selectAnimations) {
					editor.timelineUI.selectAnimations([]);
				}
			}
			currentElement = element;
			if (element) {
				container.style.display = 'flex';
				title.textContent =
					element.tagName.toLowerCase() + (element.id ? '#' + element.id : '') + (element.className ? '.' + element.className : '');
				this.refreshValues();
				updateCode();

				if (editor.controller) {
					const targetAnims = editor.controller.animations.filter((a) => a.target === element);
					pathEditor.refreshPathList(targetAnims);

					const hasPath = targetAnims.some((a) => a.type === 'path');
					pathEditorContainer.style.display = hasPath ? 'block' : 'none';
				}
			} else {
				container.style.display = 'none';
			}
		},

		refreshValues,

		loadPath(path) {
			if (editor.controller) {
				const anim = editor.controller.animations.find((a) => a.path === path);
				if (anim) pathEditor.bindAnimation(anim);
			}
		},

		updateCode,

		// update selected animations ui
		updateSelectedAnimations(anims, context = 'end') {
			currentSelectedAnims = anims || [];
			if (currentSelectedAnims.length === 0) {
				animPropsContainer.style.display = 'none';
				easingEditorContainer.style.display = 'none';
				return;
			}
			animPropsContainer.style.display = 'flex';
			easingEditorContainer.style.display = 'block';

			const first = currentSelectedAnims[0];
			const allSameStart = currentSelectedAnims.every((a) => Math.abs(a.startTime - first.startTime) < 1);
			const allSameDur = currentSelectedAnims.every((a) => Math.abs(a.duration - first.duration) < 1);

			if (allSameStart) animInputs.start.value = Math.round(first.startTime);
			else animInputs.start.value = '';

			if (allSameDur) animInputs.duration.value = Math.round(first.duration);
			else animInputs.duration.value = '';

			const propGroups = new Map();
			currentSelectedAnims.forEach((anim) => {
				if (anim.type === 'path') return;
				if (!propGroups.has(anim.type)) {
					propGroups.set(anim.type, []);
				}
				propGroups.get(anim.type).push(anim);
			});

			valuesContainer.innerHTML = '';

			propGroups.forEach((groupAnims, type) => {
				const targetAnim = groupAnims[0];

				const row = document.createElement('div');
				row.style.display = 'flex';
				row.style.justifyContent = 'space-between';
				row.style.alignItems = 'center';

				const lbl = document.createElement('label');
				lbl.textContent = type + (context === 'start' ? ' (start)' : ' (end)');
				lbl.style.fontSize = '12px';
				lbl.style.textTransform = 'capitalize';

				const input = document.createElement('input');
				input.type = 'number';
				input.step = type === 'scale' || type === 'opacity' ? 0.1 : 1;
				input.style.width = '60px';

				let val;
				if (context === 'start') {
					val = targetAnim.startValue;
					if (val === null || val === undefined) {
						if (type === 'scale' || type === 'opacity') val = 1;
						else val = 0;
					}
				} else {
					val = targetAnim.endValue;
				}
				input.value = Math.round(val * 100) / 100;

				input.oninput = (e) => {
					const newVal = parseFloat(e.target.value);
					if (context === 'start') {
						targetAnim.startValue = newVal;
					} else {
						targetAnim.endValue = newVal;
						if (editor.controller) {
							const targetAnims = editor.controller.animations.filter((a) => a.target === targetAnim.target && a.type === targetAnim.type);
							const next = targetAnims.find((a) => Math.abs(a.startTime - (targetAnim.startTime + targetAnim.duration)) < 1);
							if (next && next.startValue !== null) {
								next.startValue = newVal;
							}
						}
					}

					if (editor.controller) {
						editor.controller.refresh();
						refreshValues();
					}
					updateCode();
				};

				row.appendChild(lbl);
				row.appendChild(input);
				valuesContainer.appendChild(row);
			});

			const hasPath = currentSelectedAnims.some((a) => a.type === 'path');
			editPathBtn.style.display = hasPath ? 'block' : 'none';

			easingEditor.setAnimation(currentSelectedAnims);
		},
	};
}
