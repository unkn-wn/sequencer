import { ease } from '../animation.js';

export class EasingEditor {
	constructor(container, editor) {
		this.container = container;
		this.editor = editor;
		this.width = 200;
		this.height = 200;
		this.padding = 20;
		this.controlPoints = [
			{ x: 0.25, y: 0.1 },
			{ x: 0.25, y: 1.0 },
		];
		this.selectedPoint = -1;
		this.isDragging = false;

		this.createHTML();
		this.draw();
	}

	createHTML() {
		const panel = document.createElement('div');
		panel.style.cssText = `
            background: #2a2a2e;
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;

		const title = document.createElement('div');
		title.textContent = 'Easing Editor';
		title.style.fontSize = '14px';
		title.style.fontWeight = 'bold';
		panel.appendChild(title);

		const canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		canvas.style.background = '#333';
		canvas.style.border = '1px solid #555';
		canvas.style.cursor = 'pointer';
		panel.appendChild(canvas);
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		const presetsDiv = document.createElement('div');
		presetsDiv.style.display = 'flex';
		presetsDiv.style.flexWrap = 'wrap';
		presetsDiv.style.gap = '4px';

		for (const key in ease) {
			const btn = document.createElement('button');
			btn.textContent = key;
			btn.style.fontSize = '10px';
			btn.style.padding = '2px 4px';
			btn.onclick = () => {
				const val = ease[key];
				this.controlPoints = [
					{ x: val[0].x, y: val[0].y },
					{ x: val[1].x, y: val[1].y },
				];
				this.draw();
				this.applyToAnimation();
			};
			presetsDiv.appendChild(btn);
		}
		panel.appendChild(presetsDiv);

		this.container.appendChild(panel);

		canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
		window.addEventListener('mousemove', (e) => this.onMouseMove(e));
		window.addEventListener('mouseup', (e) => this.onMouseUp(e));
	}

	draw() {
		const ctx = this.ctx;
		const w = this.width;
		const h = this.height;
		const p = this.padding;
		const drawW = w - p * 2;
		const drawH = h - p * 2;

		ctx.clearRect(0, 0, w, h);

		// grid
		ctx.strokeStyle = '#444';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(p, p);
		ctx.lineTo(p, h - p);
		ctx.lineTo(w - p, h - p);
		ctx.lineTo(w - p, p);
		ctx.lineTo(p, p);
		ctx.stroke();

		// curve
		const startX = p;
		const startY = h - p;
		const endX = w - p;
		const endY = p;

		const cp1x = p + this.controlPoints[0].x * drawW;
		const cp1y = h - p - this.controlPoints[0].y * drawH;
		const cp2x = p + this.controlPoints[1].x * drawW;
		const cp2y = h - p - this.controlPoints[1].y * drawH;

		// handles
		ctx.strokeStyle = '#666';
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(cp1x, cp1y);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(endX, endY);
		ctx.lineTo(cp2x, cp2y);
		ctx.stroke();

		// bezier
		ctx.strokeStyle = '#00aaff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
		ctx.stroke();

		// points
		this.drawPoint(cp1x, cp1y, 0);
		this.drawPoint(cp2x, cp2y, 1);
	}

	drawPoint(x, y, index) {
		const ctx = this.ctx;
		ctx.fillStyle = this.selectedPoint === index ? '#fff' : '#00aaff';
		ctx.beginPath();
		ctx.arc(x, y, 4, 0, Math.PI * 2);
		ctx.fill();
	}

	getMousePos(e) {
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};
	}

	onMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();
		const pos = this.getMousePos(e);
		const w = this.width;
		const h = this.height;
		const p = this.padding;
		const drawW = w - p * 2;
		const drawH = h - p * 2;

		const cp1x = p + this.controlPoints[0].x * drawW;
		const cp1y = h - p - this.controlPoints[0].y * drawH;
		const cp2x = p + this.controlPoints[1].x * drawW;
		const cp2y = h - p - this.controlPoints[1].y * drawH;

		if (Math.hypot(pos.x - cp1x, pos.y - cp1y) < 10) {
			this.selectedPoint = 0;
			this.isDragging = true;
		} else if (Math.hypot(pos.x - cp2x, pos.y - cp2y) < 10) {
			this.selectedPoint = 1;
			this.isDragging = true;
		}
		this.draw();
	}

	onMouseMove(e) {
		if (!this.isDragging) return;
		e.preventDefault();

		const pos = this.getMousePos(e);
		const w = this.width;
		const h = this.height;
		const p = this.padding;
		const drawW = w - p * 2;
		const drawH = h - p * 2;

		let nx = (pos.x - p) / drawW;
		let ny = (h - p - pos.y) / drawH;

		this.controlPoints[this.selectedPoint] = { x: nx, y: ny };
		this.draw();
		this.applyToAnimation();
	}

	onMouseUp(e) {
		this.isDragging = false;
		this.selectedPoint = -1;
		this.draw();
	}

	setAnimation(anims) {
		this.currentAnims = anims;
		if (anims && anims.length > 0) {
			const spline = anims[0].spline;
			if (spline && Array.isArray(spline) && spline.length === 2) {
				this.controlPoints = [
					{ x: spline[0].x, y: spline[0].y },
					{ x: spline[1].x, y: spline[1].y },
				];
			} else {
				this.controlPoints = [
					{ x: 0, y: 0 },
					{ x: 1, y: 1 },
				];
			}
			this.draw();
		}
	}

	applyToAnimation() {
		if (this.currentAnims) {
			for (const anim of this.currentAnims) {
				anim.spline = [
					{ x: this.controlPoints[0].x, y: this.controlPoints[0].y },
					{ x: this.controlPoints[1].x, y: this.controlPoints[1].y },
				];
			}
			if (this.editor.inspector) this.editor.inspector.updateCode();
		}
	}
}
