import { Path, Point } from '../path.js';

export class PathEditor {
	constructor(container, editor) {
		this.container = container;
		this.editor = editor;
		this.points = [];
		this.isDrawing = false;
		this.draggedElement = null;
		this.dragOffset = null;
		this.boundAnimation = null;
		this.timelineCanvas = document.querySelector('timeline-canvas');

		this.createHTML();
		this.createCanvas();
		this.createEventListeners();
	}

	createHTML() {
		const editor = document.createElement('div');
		editor.id = 'sequencer-path-editor-panel';
		editor.style.cssText = `
            background-color: #2a2a2e;
            border: 1px solid #444;
            border-radius: 8px;
            padding: 8px;
            margin-top: 10px;
        `;

		const header = document.createElement('div');
		header.style.display = 'flex';
		header.style.justifyContent = 'space-between';
		header.style.alignItems = 'center';
		header.style.marginBottom = '4px';

		const title = document.createElement('h3');
		title.textContent = 'Path Editor';
		title.style.margin = '0';
		title.style.fontSize = '14px';
		header.appendChild(title);

		const toggleBtn = document.createElement('button');
		toggleBtn.textContent = '+';
		toggleBtn.style.width = 'auto';
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
		editor.appendChild(header);

		const contentContainer = document.createElement('div');
		contentContainer.style.display = 'none';
		contentContainer.style.flexDirection = 'column';
		contentContainer.style.gap = '8px';
		editor.appendChild(contentContainer);

		const div = document.createElement('div');
		div.className = 'sequencer-panel-controls';
		div.style.display = 'flex';
		div.style.flexDirection = 'column';
		div.style.gap = '8px';
		contentContainer.appendChild(div);

		const select = document.createElement('select');
		select.style.width = '100%';
		select.style.background = '#222';
		select.style.color = '#eee';
		select.style.border = '1px solid #444';
		select.style.padding = '4px';

		select.onchange = (e) => {
			const index = e.target.value;
			if (index === '') {
				this.stopEditing();
			} else {
				const anim = this.currentPathAnimations[index];
				if (anim) this.bindAnimation(anim);
			}
		};
		div.appendChild(select);
		this.pathSelect = select;

		const btnRow = document.createElement('div');
		btnRow.style.display = 'flex';
		btnRow.style.gap = '6px';
		btnRow.style.marginTop = '6px';
		div.appendChild(btnRow);

		const doneBtn = document.createElement('button');
		doneBtn.textContent = 'Done (Esc)';
		doneBtn.style.flex = '1';
		doneBtn.style.display = 'none';
		doneBtn.onclick = () => this.stopEditing();
		btnRow.appendChild(doneBtn);

		this.container.appendChild(editor);

		this.contentContainer = contentContainer;
		this.toggleBtn = toggleBtn;
		this.currentPathAnimations = [];
		this.doneBtn = doneBtn;
		this.originalPathClone = null;
		this.selectedPointIndex = -1;

		window.addEventListener('keydown', (e) => {
			if (this.isDrawing) {
				if (e.key === 'Delete' || e.key === 'Backspace') {
					if (this.selectedPointIndex !== -1) {
						this.deletePoint(this.selectedPointIndex);
					}
				}
				if (e.key === 'Escape') {
					this.stopEditing();
				}
			}
		});
	}

	createCanvas() {
		const canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		canvas.id = 'sequencer-path-editor-canvas';
		canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.setAttribute('height', '100%');
		canvas.style.width = '100%';
		canvas.setAttribute('width', '100%');
		canvas.style.height = '100%';
		canvas.style.pointerEvents = 'none';
		canvas.style.zIndex = '1000';
		canvas.style.backgroundColor = 'rgba(0,0,0,0)';

		document.body.appendChild(canvas);
		this.canvas = canvas;
	}

	createEventListeners() {
		this.canvas.addEventListener('mousedown', (e) => {
			if (e.button !== 0) return;
			this.onMouseDown(e);
		});

		this.canvas.addEventListener('mousemove', (e) => {
			this.onMouseMove(e);
		});

		this.canvas.addEventListener('mouseup', (e) => {
			this.onMouseUp(e);
		});
	}

	startEditing() {
		this.isDrawing = true;
		if (this.boundAnimation) {
			this.doneBtn.style.display = 'block';
		}

		this.canvas.style.cursor = 'crosshair';
		this.canvas.style.pointerEvents = 'auto';

		this.contentContainer.style.display = 'flex';
		this.toggleBtn.textContent = '-';
	}

	stopEditing() {
		this.isDrawing = false;
		this.canvas.style.pointerEvents = 'none';
		this.doneBtn.style.display = 'none';

		this.updateBoundAnimation();

		this.boundAnimation = null;
		this.pathSelect.value = '';

		this.points = [];
		this.redraw();

		if (this.editor.timelineUI && this.editor.timelineUI.selectAnimations) {
			this.editor.timelineUI.selectAnimations([]);
		}
	}

	clear() {
		this.stopEditing();
		this.points = [];
		this.redraw();
	}

	bindAnimation(anim) {
		this.boundAnimation = anim;
		this.originalPathClone = anim.path ? JSON.parse(JSON.stringify(anim.path)) : null;
		this.importPath(anim.path);
		this.startEditing();

		const index = this.currentPathAnimations.indexOf(anim);
		if (index !== -1) {
			this.pathSelect.value = index;
		}

		if (this.editor.timelineUI && this.editor.timelineUI.selectAnimations) {
			this.editor.timelineUI.selectAnimations([anim]);
		}
	}

	deletePoint(index) {
		if (index < 0 || index >= this.points.length) return;

		const deletedPoint = this.points[index];
		const deletedIndex = index;

		this.points.splice(index, 1);
		this.selectedPointIndex = -1;

		if (this.editor && this.editor.history) {
			const pointClone = JSON.parse(JSON.stringify(deletedPoint));
			this.editor.history.push({
				undo: () => {
					this.points.splice(deletedIndex, 0, JSON.parse(JSON.stringify(pointClone)));
					this.selectedPointIndex = deletedIndex;
					this.redraw();
					this.updateBoundAnimation();
				},
				redo: () => {
					this.points.splice(deletedIndex, 1);
					this.selectedPointIndex = -1;
					this.redraw();
					this.updateBoundAnimation();
				},
			});
		}

		this.redraw();
		this.updateBoundAnimation();
	}

	redraw() {
		this.canvas.innerHTML = '';

		if (this.points.length > 1) {
			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.classList.add('sequencer-main-path');
			path.style.fill = 'none';
			path.style.stroke = '#00aaff';
			path.style.strokeWidth = '2';

			let d = `M ${this.points[0].anchor.x} ${this.points[0].anchor.y} `;
			for (let i = 1; i < this.points.length; i++) {
				d += `C ${this.points[i - 1].cp2.x} ${this.points[i - 1].cp2.y}, `;
				d += `${this.points[i].cp1.x} ${this.points[i].cp1.y}, `;
				d += `${this.points[i].anchor.x} ${this.points[i].anchor.y} `;
			}

			path.setAttribute('d', d);
			this.canvas.appendChild(path);
		}

		for (let i = 0; i < this.points.length; i++) {
			const point = this.points[i];

			const handle1Line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			handle1Line.classList.add('sequencer-handle-line');
			handle1Line.style.stroke = '#888';
			handle1Line.setAttribute('x1', point.anchor.x);
			handle1Line.setAttribute('y1', point.anchor.y);
			handle1Line.setAttribute('x2', point.cp1.x);
			handle1Line.setAttribute('y2', point.cp1.y);
			this.canvas.appendChild(handle1Line);

			const handle2Line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			handle2Line.classList.add('sequencer-handle-line');
			handle2Line.style.stroke = '#888';
			handle2Line.setAttribute('x1', point.anchor.x);
			handle2Line.setAttribute('y1', point.anchor.y);
			handle2Line.setAttribute('x2', point.cp2.x);
			handle2Line.setAttribute('y2', point.cp2.y);
			this.canvas.appendChild(handle2Line);

			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			circle.classList.add('sequencer-anchor-point');
			circle.style.fill = i === this.selectedPointIndex ? '#ffaa00' : '#00aaff';
			circle.style.stroke = '#fff';
			circle.style.strokeWidth = '2px';
			circle.style.cursor = 'move';
			circle.setAttribute('cx', point.anchor.x);
			circle.setAttribute('cy', point.anchor.y);
			circle.setAttribute('r', 8);
			circle.dataset.index = i;
			circle.dataset.type = 'anchor';
			this.canvas.appendChild(circle);

			const control1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			control1.classList.add('sequencer-control-point');
			control1.style.fill = '#fff';
			control1.style.stroke = '#888';
			control1.style.cursor = 'grab';
			control1.setAttribute('cx', point.cp1.x);
			control1.setAttribute('cy', point.cp1.y);
			control1.setAttribute('r', 6);
			control1.dataset.index = i;
			control1.dataset.type = 'control1';
			this.canvas.appendChild(control1);

			const control2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			control2.classList.add('sequencer-control-point');
			control2.style.fill = '#fff';
			control2.style.stroke = '#888';
			control2.style.cursor = 'grab';
			control2.setAttribute('cx', point.cp2.x);
			control2.setAttribute('cy', point.cp2.y);
			control2.setAttribute('r', 6);
			control2.dataset.index = i;
			control2.dataset.type = 'control2';
			this.canvas.appendChild(control2);
		}
	}

	getTimelineCoordinates(point) {
		if (!this.timelineCanvas) {
			this.timelineCanvas = document.querySelector('timeline-canvas');
		}
		if (!this.timelineCanvas) return point;

		const rect = this.timelineCanvas.getBoundingClientRect();
		const scale = this.timelineCanvas.scale || 1;

		const x = (point.x - rect.left - rect.width / 2) / scale;
		const y = (point.y - rect.top - rect.height / 2) / scale;
		return new Point(x, y);
	}

	getScreenCoordinates(point) {
		if (!this.timelineCanvas) {
			this.timelineCanvas = document.querySelector('timeline-canvas');
		}
		if (!this.timelineCanvas) return point;

		const rect = this.timelineCanvas.getBoundingClientRect();
		const scale = this.timelineCanvas.scale || 1;

		const x = point.x * scale + rect.left + rect.width / 2;
		const y = point.y * scale + rect.top + rect.height / 2;
		return new Point(x, y);
	}

	getPathData() {
		if (this.points.length === 0) return null;

		const path = new Path();
		const firstPoint = this.points[0];
		const timelineAnchor = this.getTimelineCoordinates(firstPoint.anchor);
		path.startAt(timelineAnchor.x, timelineAnchor.y);

		for (let i = 1; i < this.points.length; i++) {
			const curTimelineCP1 = this.getTimelineCoordinates(this.points[i].cp1);
			const prevTimelineCP2 = this.getTimelineCoordinates(this.points[i - 1].cp2);
			const curTimelineAnchor = this.getTimelineCoordinates(this.points[i].anchor);

			path.curveTo(prevTimelineCP2.x, prevTimelineCP2.y, curTimelineCP1.x, curTimelineCP1.y, curTimelineAnchor.x, curTimelineAnchor.y);
		}
		return path;
	}

	importPath(pathObj) {
		if (!pathObj || !pathObj.segments || pathObj.segments.length === 0) return;

		this.points = [];

		const startSeg = pathObj.segments[0];
		const startAnchor = this.getScreenCoordinates(startSeg.start);
		const startCp2 = this.getScreenCoordinates(startSeg.cp1);
		const startCp1 = new Point(startAnchor.x - (startCp2.x - startAnchor.x), startAnchor.y - (startCp2.y - startAnchor.y));

		this.points.push({
			anchor: startAnchor,
			cp1: startCp1,
			cp2: startCp2,
		});

		for (let i = 0; i < pathObj.segments.length; i++) {
			const seg = pathObj.segments[i];
			const nextSeg = pathObj.segments[i + 1];

			const anchor = this.getScreenCoordinates(seg.end);
			const cp1 = this.getScreenCoordinates(seg.cp2);

			let cp2;
			if (nextSeg) {
				cp2 = this.getScreenCoordinates(nextSeg.cp1);
			} else {
				cp2 = new Point(anchor.x + (anchor.x - cp1.x), anchor.y + (anchor.y - cp1.y));
			}

			this.points.push({
				anchor: anchor,
				cp1: cp1,
				cp2: cp2,
			});
		}

		this.redraw();
	}

	onMouseDown(e) {
		if (!this.isDrawing) return;

		const target = e.target;
		if (target.dataset.type === 'anchor' || target.dataset.type === 'control1' || target.dataset.type === 'control2') {
			this.draggedElement = target;

			this.selectedPointIndex = parseInt(target.dataset.index);

			const mousePoint = new Point(e.clientX, e.clientY);
			const anchorPoint = this.points[parseInt(this.draggedElement.dataset.index)];

			this.dragStartPoint = JSON.parse(JSON.stringify(anchorPoint));
			this.dragStartIndex = parseInt(this.draggedElement.dataset.index);

			if (this.draggedElement.dataset.type === 'anchor') {
				this.dragOffset = mousePoint.offsetTo(anchorPoint.anchor);
			} else if (this.draggedElement.dataset.type === 'control1') {
				this.dragOffset = mousePoint.offsetTo(anchorPoint.cp1);
			} else if (this.draggedElement.dataset.type === 'control2') {
				this.dragOffset = mousePoint.offsetTo(anchorPoint.cp2);
			}
		} else {
			this.selectedPointIndex = -1;

			const canvasPoint = new Point(e.clientX, e.clientY);

			const handleDistance = 50;
			const cp1 = new Point(canvasPoint.x - handleDistance, canvasPoint.y);
			const cp2 = new Point(canvasPoint.x + handleDistance, canvasPoint.y);

			if (this.points.length > 0) {
				const lastPoint = this.points[this.points.length - 1];

				const directionVector = canvasPoint.subtract(lastPoint.anchor).normalize();

				cp1.x = canvasPoint.x - directionVector.x * handleDistance;
				cp1.y = canvasPoint.y - directionVector.y * handleDistance;

				cp2.x = canvasPoint.x + directionVector.x * handleDistance;
				cp2.y = canvasPoint.y + directionVector.y * handleDistance;
			}

			const newPoint = { anchor: canvasPoint, cp1: cp1, cp2: cp2 };
			this.points.push(newPoint);
			this.selectedPointIndex = this.points.length - 1;

			if (this.editor && this.editor.history) {
				const pointClone = JSON.parse(JSON.stringify(newPoint));
				this.editor.history.push({
					undo: () => {
						this.points.pop();
						this.selectedPointIndex = -1;
						this.redraw();
						this.updateBoundAnimation();
					},
					redo: () => {
						this.points.push(JSON.parse(JSON.stringify(pointClone)));
						this.selectedPointIndex = this.points.length - 1;
						this.redraw();
						this.updateBoundAnimation();
					},
				});
			}

			this.updateBoundAnimation();
		}

		this.redraw();
	}

	updateBoundAnimation() {
		if (this.boundAnimation) {
			this.boundAnimation.path = this.getPathData();
			this.boundAnimation.endValue = this.boundAnimation.path;
			if (this.editor.inspector) this.editor.inspector.updateCode();
		}
	}

	onMouseMove(e) {
		if (!this.draggedElement) return;

		const mousePoint = new Point(e.clientX, e.clientY);
		const i = parseInt(this.draggedElement.dataset.index);
		const anchorPoint = this.points[i];

		const newX = mousePoint.x - this.dragOffset.dx;
		const newY = mousePoint.y - this.dragOffset.dy;

		if (this.draggedElement.dataset.type === 'anchor') {
			anchorPoint.cp1.x += newX - anchorPoint.anchor.x;
			anchorPoint.cp1.y += newY - anchorPoint.anchor.y;

			anchorPoint.cp2.x += newX - anchorPoint.anchor.x;
			anchorPoint.cp2.y += newY - anchorPoint.anchor.y;

			anchorPoint.anchor.x = newX;
			anchorPoint.anchor.y = newY;
		} else if (this.draggedElement.dataset.type === 'control1') {
			anchorPoint.cp1.x = newX;
			anchorPoint.cp1.y = newY;

			if (!e.shiftKey) {
				anchorPoint.cp2.x = anchorPoint.anchor.x - (newX - anchorPoint.anchor.x);
				anchorPoint.cp2.y = anchorPoint.anchor.y - (newY - anchorPoint.anchor.y);
			}
		} else if (this.draggedElement.dataset.type === 'control2') {
			anchorPoint.cp2.x = newX;
			anchorPoint.cp2.y = newY;

			if (!e.shiftKey) {
				anchorPoint.cp1.x = anchorPoint.anchor.x - (newX - anchorPoint.anchor.x);
				anchorPoint.cp1.y = anchorPoint.anchor.y - (newY - anchorPoint.anchor.y);
			}
		}

		this.points[i] = anchorPoint;

		this.redraw();
	}

	onMouseUp(e) {
		if (this.draggedElement) {
			if (this.editor && this.editor.history && this.dragStartPoint) {
				const index = this.dragStartIndex;
				const oldPoint = this.dragStartPoint;
				const newPoint = JSON.parse(JSON.stringify(this.points[index]));

				if (JSON.stringify(oldPoint) !== JSON.stringify(newPoint)) {
					this.editor.history.push({
						undo: () => {
							this.points[index] = oldPoint;
							this.redraw();
							this.updateBoundAnimation();
						},
						redo: () => {
							this.points[index] = newPoint;
							this.redraw();
							this.updateBoundAnimation();
						},
					});
				}
			}

			this.updateBoundAnimation();
			this.draggedElement = null;
			this.dragStartPoint = null;
			this.dragStartIndex = null;
		}
	}

	refreshPathList(animations) {
		this.pathSelect.innerHTML = '';
		this.currentPathAnimations = [];

		const defaultOpt = document.createElement('option');
		defaultOpt.value = '';
		defaultOpt.textContent = 'Select Path to Edit...';
		this.pathSelect.appendChild(defaultOpt);

		if (!animations) return;

		const pathAnims = animations.filter((a) => a.type === 'path');
		this.currentPathAnimations = pathAnims;

		pathAnims.forEach((anim, i) => {
			const opt = document.createElement('option');
			opt.value = i;
			opt.textContent = `Path ${i + 1} (Start: ${Math.round(anim.startTime)}ms)`;
			this.pathSelect.appendChild(opt);
		});
	}
}
