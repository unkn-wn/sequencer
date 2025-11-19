export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	// setter and getter
	x(newX) {
		if (newX !== undefined) {
			this.x = newX;
			return this;
		}

		return this.x;
	}

	y(newY) {
		if (newY !== undefined) {
			this.y = newY;
			return this;
		}

		return this.y;
	}

	clone() {
		return new Point(this.x, this.y);
	}
}

export class Path {
	constructor() {
		this.segments = [];
		this.startPoint = null;
	}

	startAt(x, y) {
		this.startPoint = new Point(x, y);
		return this;
	}

	curveTo(cp1x, cp1y, cp2x, cp2y, xEnd, yEnd) {
		const start = this.segments.length === 0 ? this.startPoint : this.segments[this.segments.length - 1].end;
		this.segments.push({
			start: start,
			cp1: new Point(cp1x, cp1y),
			cp2: new Point(cp2x, cp2y),
			end: new Point(xEnd, yEnd),
		});
		return this;
	}

	cubicBezier(t, p1, cp1, cp2, p2) {
		const x = (1 - t) ** 3 * p1.x + 3 * (1 - t) ** 2 * t * cp1.x + 3 * (1 - t) * t ** 2 * cp2.x + t ** 3 * p2.x;
		const y = (1 - t) ** 3 * p1.y + 3 * (1 - t) ** 2 * t * cp1.y + 3 * (1 - t) * t ** 2 * cp2.y + t ** 3 * p2.y;
		return new Point(x, y);
	}

	calculatePosition(t) {
		// set global T based on num of segments, so the current segment is t (ex. 0.5) * num segments (ex 6) = 3 (globalT)
		// local T is now globalT (3) - segment index (3) = 0. so we are at start of segment, since we subtraced the floor
		const globalT = t * this.segments.length;
		const i = Math.min(Math.floor(globalT), this.segments.length - 1);
		const localT = globalT - i;

		const segment = this.segments[i];
		const point = this.cubicBezier(localT, segment.start, segment.cp1, segment.cp2, segment.end);
		return point;
	}
}
