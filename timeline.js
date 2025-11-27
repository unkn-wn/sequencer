import { Animation, animationLoop, ease } from './animation.js';
import { Path } from './path.js';

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

			// instant place x,y
			place(x, y) {
				timeline.animations.push({
					target: target,
					type: 'translateX',
					startValue: x,
					endValue: x,
					startTime: startTime,
					duration: 1,
				});
				timeline.animations.push({
					target: target,
					type: 'translateY',
					startValue: y,
					endValue: y,
					startTime: startTime,
					duration: 1,
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
						duration: 1,
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
					duration: 1,
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
					duration: 1,
				});

				if (duration > 0) {
					timeline.animations.push({
						target: audio,
						type: 'audioStop',
						startTime: startTime + duration,
						duration: 1,
					});
				}
				return this;
			},

			pause() {
				timeline.animations.push({
					target: audio,
					type: 'audioStop',
					startTime: startTime,
					duration: 1,
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
		const start = performance.now();

		for (const animation of this.animations) {
			new Animation(
				animation.target,
				animation.type,
				animation.startValue,
				animation.endValue,
				animation.startTime + start,
				animation.duration,
				animation.spline,
				animation.state,
				animation.path
			);
		}

		requestAnimationFrame(animationLoop);
	}
}
