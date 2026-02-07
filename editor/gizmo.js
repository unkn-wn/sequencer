import { getState, applyState } from '../animation.js';

export class Gizmo {
	constructor(editor) {
		this.editor = editor;
		this.element = null;
		this.overlay = document.createElement('div');
		this.overlay.className = 'sequencer-gizmo';
		this.overlay.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10002;
            display: none;
            border: 1px solid #00aaff;
            box-sizing: border-box;
        `;

		// handles
		this.createHandle('tl', 'nw-resize');
		this.createHandle('tr', 'ne-resize');
		this.createHandle('bl', 'sw-resize');
		this.createHandle('br', 'se-resize');

		// rotate handle
		this.rotateHandle = document.createElement('div');
		this.rotateHandle.className = 'sequencer-gizmo-handle rotate';
		this.rotateHandle.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: #fff;
            border: 1px solid #00aaff;
            border-radius: 50%;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            cursor: grab;
            pointer-events: auto;
        `;
		this.overlay.appendChild(this.rotateHandle);

		// rotate line
		const line = document.createElement('div');
		line.style.cssText = `
            position: absolute;
            width: 1px;
            height: 20px;
            background: #00aaff;
            top: -20px;
            left: 50%;
        `;
		this.overlay.appendChild(line);

		document.body.appendChild(this.overlay);

		this.setupInteractions();

		this.update = this.update.bind(this);
		requestAnimationFrame(this.update);
	}

	createHandle(pos, cursor) {
		const handle = document.createElement('div');
		handle.className = `sequencer-gizmo-handle ${pos}`;
		handle.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: #fff;
            border: 1px solid #00aaff;
            cursor: ${cursor};
            pointer-events: auto;
        `;

		if (pos.includes('t')) handle.style.top = '-4px';
		else handle.style.bottom = '-4px';

		if (pos.includes('l')) handle.style.left = '-4px';
		else handle.style.right = '-4px';

		handle.dataset.pos = pos;
		this.overlay.appendChild(handle);
	}

	attach(element) {
		this.element = element;
		if (element) {
			this.overlay.style.display = 'block';
			this.update();
		} else {
			this.overlay.style.display = 'none';
		}
	}

	update() {
		if (!this.element) {
			requestAnimationFrame(this.update);
			return;
		}

		const rect = this.element.getBoundingClientRect();
		const state = getState(this.element);

		const scaleX = state.scaleX !== undefined ? state.scaleX : 1;
		const scaleY = state.scaleY !== undefined ? state.scaleY : 1;
		const scale = state.scale !== undefined ? state.scale : 1;

		const width = this.element.offsetWidth * scaleX * scale;
		const height = this.element.offsetHeight * scaleY * scale;

		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		this.overlay.style.width = width + 'px';
		this.overlay.style.height = height + 'px';
		this.overlay.style.left = cx - width / 2 + 'px';
		this.overlay.style.top = cy - height / 2 + 'px';
		this.overlay.style.transform = `rotate(${state.rotation || 0}deg)`;

		requestAnimationFrame(this.update);
	}

	setupInteractions() {
		let isDragging = false;
		let mode = null;
		let startX, startY;
		let startScale, startRotation;
		let startDist, startAngle;

		this.overlay.addEventListener('mousedown', (e) => {
			if (e.target.classList.contains('sequencer-gizmo-handle')) {
				isDragging = true;
				e.stopPropagation();
				e.preventDefault();

				startX = e.clientX;
				startY = e.clientY;
				const state = getState(this.element);

				if (e.target.classList.contains('rotate')) {
					mode = 'rotate';
					startRotation = state.rotation || 0;

					const rect = this.overlay.getBoundingClientRect();
					const cx = rect.left + rect.width / 2;
					const cy = rect.top + rect.height / 2;
					startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
				} else {
					mode = 'scale';
					startScale = state.scale !== undefined ? state.scale : 1;
					const rect = this.overlay.getBoundingClientRect();
					const cx = rect.left + rect.width / 2;
					const cy = rect.top + rect.height / 2;
					startDist = Math.hypot(e.clientX - cx, e.clientY - cy);
				}
			}
		});

		document.addEventListener('mousemove', (e) => {
			if (!isDragging || !this.element) return;

			const state = getState(this.element);
			const rect = this.overlay.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;

			if (mode === 'rotate') {
				const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
				const deg = ((angle - startAngle) * 180) / Math.PI;
				state.rotation = startRotation + deg;
			} else if (mode === 'scale') {
				const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
				if (startDist > 0.1) {
					const ratio = dist / startDist;
					state.scale = startScale * ratio;
				}
			}

			applyState(this.element, state);
			if (this.editor.inspector) this.editor.inspector.refreshValues();
		});

		document.addEventListener('mouseup', () => {
			isDragging = false;
			mode = null;
		});
	}
}
