import { Animation, animationLoop, ease, getState, applyState, setState, bezierEase, parseColor, mapping } from './animation.js';
import { Path } from './path.js';

requestAnimationFrame(animationLoop);

// FOR EDITING
function createController(animations) {
	const controller = {
		animations: animations,
		initialStates: new Map(),
		currentTime: 0,
		isPlaying: false,
		duration: 0,
		fixedDuration: null,
		ease: ease,
		_startTimestamp: 0,
		onFinish: null,

		sortAnimations() {
			this.animations.sort((a, b) => a.startTime - b.startTime);
		},

		calculateDuration() {
			this.duration = 0;
			for (const anim of this.animations) {
				const end = anim.startTime + anim.duration;
				if (end > this.duration) this.duration = end;
			}
			if (this.fixedDuration && this.fixedDuration > this.duration) {
				this.duration = this.fixedDuration;
			}
		},

		captureInitialStates() {
			for (const anim of this.animations) {
				if (!this.initialStates.has(anim.target)) {
					const state = getState(anim.target);
					this.initialStates.set(anim.target, JSON.parse(JSON.stringify(state)));
				}
			}
		},

		refresh() {
			this.sortAnimations();
			this.calculateDuration();
			this.captureInitialStates();
		},

		play() {
			if (this.isPlaying) return;
			
			// Wait for everything to be ready before starting
			const waitForReady = () => {
				Promise.all([
					document.fonts.ready,
					customElements.whenDefined('timeline-canvas'),
				]).then(() => {
					// Wait 2 frames for layout to fully settle
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							this._startPlayback();
						});
					});
				});
			};

			// If page is still loading, wait for load event
			if (document.readyState !== 'complete') {
				window.addEventListener('load', waitForReady, { once: true });
			} else {
				waitForReady();
			}
		},

		_startPlayback() {
			if (this.isPlaying) return;
			this.isPlaying = true;

			const start = performance.now() - this.currentTime;
			this._startTimestamp = start;

			// Spawn Animation instances for playback
			for (const anim of this.animations) {
				if (this.currentTime >= anim.startTime + anim.duration) continue;

				new Animation(
					anim.target,
					anim.type,
					anim.startValue,
					anim.endValue,
					anim.startTime + start,
					anim.duration,
					anim.spline,
					anim.state,
					anim.path,
				);
			}

			this._trackLoop();
		},

		_trackLoop() {
			if (!this.isPlaying) return;

			this.currentTime = performance.now() - this._startTimestamp;

			if (this.currentTime >= this.duration) {
				this.currentTime = this.duration;
				this.pause();
				if (this.onFinish) this.onFinish();
				return;
			}

			requestAnimationFrame(() => this._trackLoop());
		},

		pause() {
			this.isPlaying = false;
		},

		seek(time) {
			this.currentTime = Math.max(0, Math.min(time, this.duration));
			this._renderPreview();
		},

		_renderPreview() {
			// Reset to initial
			for (const [element, initialState] of this.initialStates) {
				const currentState = getState(element);
				Object.assign(currentState, JSON.parse(JSON.stringify(initialState)));
			}

			// Apply animations up to currentTime
			for (const anim of this.animations) {
				if (this.currentTime < anim.startTime) continue;

				const elapsed = this.currentTime - anim.startTime;
				let progress = anim.duration === 0 ? 1 : Math.min(1, elapsed / anim.duration);
				const easeValue = anim.spline ? bezierEase(progress, anim.spline) : progress;

				let start = anim.startValue;
				let end = anim.endValue;
				const currentState = getState(anim.target);
				const prop = mapping[anim.type];

				if (anim.state === 'to') {
					start = currentState[prop];
				} else if (anim.state === 'by') {
					start = currentState[prop];
					end = start + anim.endValue;
				}

				let val;
				if (anim.type === 'path') {
					val = anim.path.calculatePosition(easeValue);
				} else if (anim.type === 'color') {
					const s = parseColor(start);
					const e = parseColor(end);
					val = {
						r: s.r + (e.r - s.r) * easeValue,
						g: s.g + (e.g - s.g) * easeValue,
						b: s.b + (e.b - s.b) * easeValue,
						a: s.a + (e.a - s.a) * easeValue,
					};
				} else if (anim.type === 'audioStart' || anim.type === 'audioStop') {
					continue;
				} else {
					val = start + (end - start) * easeValue;
				}

				setState(currentState, anim.type, val);
			}

			// Apply states
			for (const [element, _] of this.initialStates) {
				applyState(element, getState(element));
			}
		},
	};

	controller.sortAnimations();
	controller.calculateDuration();
	controller.captureInitialStates();

	return controller;
}
export class Timeline {
	constructor() {
		this.animations = [];
	}

	anim(target) {
		let startTime = 0;
		let duration = 0;
		let spline = ease.linear;
		let type = [];

		const timeline = this;

		return {
			// required
			at(time) {
				startTime = time;
				spline = ease.linear;
				duration = 0;
				type = [];
				return this;
			},

			// required, but not for place() and set()
			for(dur) {
				duration = dur;
				return this;
			},

			// optional, default is linear
			spline(s) {
				spline = s;
				return this;
			},

			// required, can be array or string
			type(t) {
				if (Array.isArray(t)) {
					type = t;
				} else {
					type = [];
					type.push(t);
				}
				return this;
			},

			then() {
				startTime += duration;
				spline = ease.linear;
				duration = 0;
				type = [];
				return this;
			},

			// instant place x,y or object
			place(x, y) {
				if (typeof x === 'object') {
					const props = x;
					if (props.x !== undefined)
						timeline.animations.push({
							target,
							type: 'translateX',
							startValue: props.x,
							endValue: props.x,
							startTime: startTime,
							duration: 0,
						});
					if (props.y !== undefined)
						timeline.animations.push({
							target,
							type: 'translateY',
							startValue: props.y,
							endValue: props.y,
							startTime: startTime,
							duration: 0,
						});
					if (props.scale !== undefined)
						timeline.animations.push({
							target,
							type: 'scale',
							startValue: props.scale,
							endValue: props.scale,
							startTime: startTime,
							duration: 0,
						});
					if (props.rotate !== undefined)
						timeline.animations.push({
							target,
							type: 'rotate',
							startValue: props.rotate,
							endValue: props.rotate,
							startTime: startTime,
							duration: 0,
						});
					if (props.opacity !== undefined)
						timeline.animations.push({
							target,
							type: 'opacity',
							startValue: props.opacity,
							endValue: props.opacity,
							startTime: startTime,
							duration: 0,
						});
					return this;
				}

				timeline.animations.push({
					target: target,
					type: 'translateX',
					startValue: x,
					endValue: x,
					startTime: startTime,
					duration: 0,
				});
				timeline.animations.push({
					target: target,
					type: 'translateY',
					startValue: y,
					endValue: y,
					startTime: startTime,
					duration: 0,
				});
				return this;
			},

			// set instantly, repeating for each animation type
			set(val) {
				for (const t of type) {
					timeline.animations.push({
						target: target,
						type: t,
						startValue: val,
						endValue: val,
						startTime: startTime,
						duration: 0,
					});
				}
				return this;
			},

			// move from start to end, repeating for each animation type
			fromTo(start, end) {
				for (const t of type) {
					timeline.animations.push({
						target: target,
						type: t,
						startValue: start,
						endValue: end,
						startTime: startTime,
						duration: duration,
						spline: spline,
					});
				}
				return this;
			},

			// move from current to end, repeating for each type
			to(end) {
				for (const t of type) {
					timeline.animations.push({
						target,
						type: t,
						startValue: null,
						endValue: end,
						startTime: startTime,
						duration: duration,
						spline: spline,
						state: 'to',
					});
				}
				return this;
			},

			// move from current by delta, repeating for each type
			by(delta) {
				for (const t of type) {
					timeline.animations.push({
						target,
						type: t,
						startValue: null,
						endValue: delta,
						startTime: startTime,
						duration: duration,
						spline: spline,
						state: 'by',
					});
				}
				return this;
			},

			// SEND TO PATH case
			path(path) {
				timeline.animations.push({
					target: target,
					type: 'path',
					startValue: null,
					endValue: path,
					startTime: startTime,
					duration: duration,
					spline: spline,
					path: path,
				});

				return this;
			},

			// hide element
			hide() {
				timeline.animations.push({
					target: target,
					type: 'opacity',
					startValue: null,
					endValue: 0,
					startTime: startTime,
					duration: 0,
				});
				return this;
			},

			// unhide
			show() {
				timeline.animations.push({
					target: target,
					type: 'opacity',
					startValue: null,
					endValue: 1,
					startTime: startTime,
					duration: 0,
				});
				return this;
			},
		};
	}

	background() {
		const timeline = this;

		const target = document.querySelector('timeline-canvas');

		let startTime = 0;
		let duration = 0;
		let spline = ease.linear;

		return {
			at(time) {
				startTime = time;
				spline = ease.linear;
				duration = 0;
				return this;
			},

			// optional, only need for fade
			for(dur) {
				duration = dur;
				return this;
			},

			spline(s) {
				spline = s;
				return this;
			},

			// either hex as string or rgb array
			set(color) {
				timeline.animations.push({
					target: target,
					type: 'color',
					startValue: color,
					endValue: color,
					startTime: startTime,
					duration: 0,
				});
				return this;
			},

			fade(fromColor, toColor) {
				timeline.animations.push({
					target: target,
					type: 'color',
					startValue: fromColor,
					endValue: toColor,
					startTime: startTime,
					duration: duration,
					spline: spline,
				});
				return this;
			},
		};
	}

	audio(file) {
		const timeline = this;

		const audio = new Audio(file);
		let startTime = 0;
		let duration = 0;
		let spline = ease.linear;

		return {
			at(time) {
				startTime = time;
				spline = ease.linear;
				duration = 0;
				return this;
			},

			for(dur) {
				duration = dur;
				return this;
			},

			spline(s) {
				spline = s;
				return this;
			},

			play() {
				timeline.animations.push({
					target: audio,
					type: 'audioStart',
					startTime: startTime,
					duration: 0,
				});

				if (duration > 0) {
					timeline.animations.push({
						target: audio,
						type: 'audioStop',
						startTime: startTime + duration,
						duration: 0,
					});
				}
				return this;
			},

			pause() {
				timeline.animations.push({
					target: audio,
					type: 'audioStop',
					startTime: startTime,
					duration: 0,
				});
				return this;
			},

			volume(val) {
				timeline.animations.push({
					target: audio,
					type: 'volume',
					startValue: null,
					endValue: val,
					startTime: startTime,
					duration: duration,
					spline: spline,
				});
				return this;
			},
		};
	}

	play() {
		const controller = createController(this.animations);
		controller.play();

		if (window.sequencerEditor) {
			window.sequencerEditor.attachController(controller);
		}

		return controller;
	}
}
