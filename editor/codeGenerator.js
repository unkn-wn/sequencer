import { ease, getState } from '../animation.js';

export class CodeGenerator {
	static generate(target, animations, controller = null) {
		const targetAnims = animations.filter((a) => a.target === target);

		if (targetAnims.length === 0) return '';

		targetAnims.sort((a, b) => a.startTime - b.startTime);

		let code = '';

		// determine initial state
		let initialState = { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };
		if (controller && controller.initialStates && controller.initialStates.has(target)) {
			const is = controller.initialStates.get(target);
			initialState = { ...is };
		} else {
			const s = getState(target);
			initialState = { x: s.x, y: s.y, scale: s.scale, rotation: s.rotation, opacity: s.opacity };
		}

		// overlay initial setup animations
		const initialAnims = targetAnims.filter((a) => a.startTime === 0 && a.duration <= 1);
		const mapping = {
			translateX: 'x',
			translateY: 'y',
			scale: 'scale',
			rotate: 'rotation',
			opacity: 'opacity',
		};

		for (const anim of initialAnims) {
			const prop = mapping[anim.type];
			if (prop) {
				initialState[prop] = anim.endValue;
			}
		}

		// generate place()
		const placeObj = {
			x: Math.round(initialState.x),
			y: Math.round(initialState.y),
			scale: Math.round(initialState.scale * 100) / 100,
			rotate: Math.round(initialState.rotation * 100) / 100,
			opacity: Math.round(initialState.opacity * 100) / 100,
		};

		const placeStr = Object.entries(placeObj)
			.map(([k, v]) => `${k}: ${v}`)
			.join(', ');

		// path definitions
		const pathAnims = targetAnims.filter((a) => a.type === 'path');
		if (pathAnims.length > 0) {
			const uniquePaths = new Set(pathAnims.map((a) => a.path));
			let pIndex = 1;
			for (const pathObj of uniquePaths) {
				code += this.generatePathCode(pathObj, uniquePaths.size > 1 ? pIndex : '') + '\n';
				pIndex++;
			}
		}

		code += `timeline.anim(target).place({ ${placeStr} })`;

		// filter out initial animations
		const animsToProcess = targetAnims.filter((a) => !(a.startTime === 0 && a.duration <= 1));

		let currentTime = 0;

		// group by start time
		const groups = new Map();
		for (const anim of animsToProcess) {
			if (!groups.has(anim.startTime)) {
				groups.set(anim.startTime, []);
			}
			groups.get(anim.startTime).push(anim);
		}

		const sortedTimes = Array.from(groups.keys()).sort((a, b) => a - b);

		for (const time of sortedTimes) {
			const group = groups.get(time);

			// determine time method
			if (Math.abs(time - currentTime) < 1 && currentTime > 0) {
				code += `\n\t.then()`;
			} else {
				if (time !== 0 || currentTime !== 0) {
					code += `\n\t.at(${Math.round(time)})`;
				}
			}
			currentTime = time;

			// group by duration & spline
			const subGroups = new Map();

			for (const anim of group) {
				const splineName = this.getSplineName(anim.spline);
				const key = `${anim.duration}|${splineName}`;
				if (!subGroups.has(key)) subGroups.set(key, []);
				subGroups.get(key).push(anim);
			}

			for (const [key, anims] of subGroups) {
				const [durStr, splineName] = key.split('|');
				const duration = parseFloat(durStr);

				if (duration > 0) {
					code += `.for(${Math.round(duration)})`;
				}

				if (splineName !== 'linear') {
					if (splineName === 'custom') {
						const s = anims[0].spline;
						code += `.spline([{x: ${s[0].x}, y: ${s[0].y}}, {x: ${s[1].x}, y: ${s[1].y}}])`;
					} else {
						code += `.spline(ease.${splineName})`;
					}
				}

				for (const anim of anims) {
					if (anim.type === 'path') {
						code += `\n\t\t.type('path').path(path)`;
					} else if (anim.type === 'color') {
						code += `\n\t\t.type('color').set('${anim.endValue}')`;
					} else {
						code += `\n\t\t.type('${anim.type}')`;
						if (duration === 0) {
							code += `.set(${this.formatVal(anim.endValue)})`;
						} else {
							if (anim.startValue !== null && anim.startValue !== undefined) {
								code += `.fromTo(${this.formatVal(anim.startValue)}, ${this.formatVal(anim.endValue)})`;
							} else {
								code += `.to(${this.formatVal(anim.endValue)})`;
							}
						}
					}
				}

				currentTime += duration;
			}
		}

		code += ';';
		return code;
	}

	static generatePathCode(pathObj, suffix = '') {
		if (!pathObj || !pathObj.segments) return '';

		let str = `const path${suffix} = new Path()`;
		if (pathObj.startPoint) {
			str += `\n\t.startAt(${this.formatVal(pathObj.startPoint.x)}, ${this.formatVal(pathObj.startPoint.y)})`;
		}

		for (const seg of pathObj.segments) {
			str += `\n\t.curveTo(${this.formatVal(seg.cp1.x)}, ${this.formatVal(seg.cp1.y)}, ${this.formatVal(seg.cp2.x)}, ${this.formatVal(
				seg.cp2.y
			)}, ${this.formatVal(seg.end.x)}, ${this.formatVal(seg.end.y)})`;
		}

		return str + ';';
	}

	static getSplineName(spline) {
		if (!spline) return 'linear';
		if (
			spline.linear ||
			(Array.isArray(spline) && spline.length === 2 && spline[0].x === 0 && spline[0].y === 0 && spline[1].x === 1 && spline[1].y === 1)
		)
			return 'linear';

		for (const [key, val] of Object.entries(ease)) {
			if (val === spline) return key;
			if (val[0].x === spline[0].x && val[0].y === spline[0].y && val[1].x === spline[1].x && val[1].y === spline[1].y) return key;
		}
		return 'custom';
	}

	static formatVal(val) {
		if (typeof val === 'number') return Math.round(val * 100) / 100;
		return `'${val}'`;
	}
}
