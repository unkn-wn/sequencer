// inject html
// have addPoint, onMousemove etc, click to add point, show bezier handles, calculate the points, generate path code
// eventually undo redo

import { Path, Point } from './path.js';

const timelineCanvas = document.querySelector('timeline-canvas');
let points = [];
let isDrawing = false;

let draggedElement = null;
let dragOffset = null;

export function injectEditor() {
	createHTML();
	createCanvas();
	createCSS();
	createEventListeners();

	addStateToHistory();
}

function createHTML() {
	const editor = document.createElement('div');
	editor.id = 'sequencer-path-editor-panel';

	const title = document.createElement('h3');
	title.textContent = 'Path Editor';
	editor.appendChild(title);

	const output = document.createElement('textarea');
	output.id = 'sequencer-path-output';
	output.readOnly = true;
	editor.appendChild(output);

	const div = document.createElement('div');
	div.className = 'sequencer-panel-controls';
	editor.appendChild(div);

	const beginButton = document.createElement('button');
	beginButton.id = 'sequencer-begin-path-editing';
	beginButton.textContent = 'Edit';
	div.appendChild(beginButton);

	const copyButton = document.createElement('button');
	copyButton.id = 'sequencer-copy-path-data';
	copyButton.textContent = 'Copy';
	div.appendChild(copyButton);

	document.body.appendChild(editor);
}

function createCSS() {
	const style = document.createElement('style');
	const css = `
		#sequencer-path-editor-panel {
			position: fixed;
			bottom: 20px;
			right: 20px;
			width: 280px;
			background-color: #2a2a2e;
			border: 1px solid #444;
			border-radius: 8px;
			color: #e0e0e0;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
			z-index: 10001;
			box-shadow: 0 5px 15px rgba(0,0,0,0.3);
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding: 8px;
		}
		
		#sequencer-path-editor-panel h3 {
			margin: 0 0 4px 0;
			font-size: 16px;
			font-weight: 600;
			color: #fff;
			text-align: center;
		}

		#sequencer-path-editor-panel .sequencer-panel-controls {
			display: flex;
			flex-direction: row;
			justify-content: space-around;
			gap: 8px;
		}
		
		#sequencer-path-editor-panel button {
			background-color: #4a4a4e;
			color: #e0e0e0;
			border: 1px solid #666;
			padding: 6px 12px;
			border-radius: 5px;
			cursor: pointer;
			font-size: 14px;
			width: 100%;
			transition: background-color 0.2s, color 0.2s;
		}
		
		#sequencer-path-editor-panel button:hover {
			background-color: #5a5a5e;
		}
		
		#sequencer-path-editor-panel button#sequencer-begin-path-editing.active {
			background-color: #e74c3c;
			color: #fff;
			border-color: #c0392b;
		}
		
		#sequencer-path-editor-panel textarea {
			width: 100%;
			height: 120px;
			box-sizing: border-box; /* Important for padding and border */
			resize: none;
			background-color: #1e1e1e;
			border: 1px solid #444;
			color: #a9dc76; /* Greenish text for code */
			font-family: "Fira Code", "Courier New", monospace;
			font-size: 12px;
			padding: 8px;
			border-radius: 5px;
		}
		
		/* For the SVG elements */
		.sequencer-main-path {
			fill: none;
			stroke: #00aaff;
			stroke-width: 2;
		}
		.sequencer-handle-line {
			fill: none;
			stroke: #888;
			stroke-width: 1;
		}
		.sequencer-anchor-point {
			fill: #00aaff;
			stroke: #fff;
			stroke-width: 2px;
			cursor: move;
		}
		.sequencer-control-point {
			fill: #fff;
			stroke: #888;
			stroke-width: 1px;
			cursor: grab;
		}
    `;

	style.innerHTML = css;
	document.head.appendChild(style);
}

function createCanvas() {
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

	// document.querySelector('timeline-canvas').appendChild(canvas);
	document.body.appendChild(canvas);
}

function createEventListeners() {
	const beginButton = document.getElementById('sequencer-begin-path-editing');
	const copyButton = document.getElementById('sequencer-copy-path-data');
	const output = document.getElementById('sequencer-path-output');
	const canvas = document.getElementById('sequencer-path-editor-canvas');

	beginButton.addEventListener('click', () => {
		isDrawing = !isDrawing;
		if (isDrawing) {
			beginButton.textContent = 'Stop';
			beginButton.classList.add('active');
			canvas.style.cursor = 'crosshair';
			canvas.style.pointerEvents = 'auto';
		} else {
			beginButton.textContent = 'Edit';
			beginButton.classList.remove('active');
			canvas.style.pointerEvents = 'none';
		}
	});

	copyButton.addEventListener('click', () => {
		output.select();
		navigator.clipboard.writeText(output.value);
	});

	canvas.addEventListener('mousedown', (e) => {
		if (e.button !== 0) return;
		onMouseDown(e);
	});

	canvas.addEventListener('mousemove', (e) => {
		onMouseMove(e);
	});

	canvas.addEventListener('mouseup', (e) => {
		onMouseUp(e);
	});

	document.addEventListener('keydown', (e) => {
		onKeyDown(e);
	});
}

function redraw() {
	// clear canvas, then draw paths, draw points
	const canvas = document.getElementById('sequencer-path-editor-canvas');
	canvas.innerHTML = '';

	if (points.length === 0) {
		updateOutput();
		return;
	}

	if (points.length > 1) {
		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.classList.add('sequencer-main-path');

		let d = `M ${points[0].anchor.x} ${points[0].anchor.y} `;
		for (let i = 1; i < points.length; i++) {
			d += `C ${points[i - 1].cp2.x} ${points[i - 1].cp2.y}, `;
			d += `${points[i].cp1.x} ${points[i].cp1.y}, `;
			d += `${points[i].anchor.x} ${points[i].anchor.y} `;
		}

		path.setAttribute('d', d);
		canvas.appendChild(path);
	}

	for (let i = 0; i < points.length; i++) {
		const point = points[i];

		const handle1Line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		handle1Line.classList.add('sequencer-handle-line');
		handle1Line.setAttribute('x1', point.anchor.x);
		handle1Line.setAttribute('y1', point.anchor.y);
		handle1Line.setAttribute('x2', point.cp1.x);
		handle1Line.setAttribute('y2', point.cp1.y);
		canvas.appendChild(handle1Line);

		const handle2Line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		handle2Line.classList.add('sequencer-handle-line');
		handle2Line.setAttribute('x1', point.anchor.x);
		handle2Line.setAttribute('y1', point.anchor.y);
		handle2Line.setAttribute('x2', point.cp2.x);
		handle2Line.setAttribute('y2', point.cp2.y);
		canvas.appendChild(handle2Line);

		// anchor
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.classList.add('sequencer-anchor-point');
		circle.setAttribute('cx', point.anchor.x);
		circle.setAttribute('cy', point.anchor.y);
		circle.setAttribute('r', 8);
		circle.dataset.index = i;
		circle.dataset.type = 'anchor';
		canvas.appendChild(circle);

		const control1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		control1.classList.add('sequencer-control-point');
		control1.setAttribute('cx', point.cp1.x);
		control1.setAttribute('cy', point.cp1.y);
		control1.setAttribute('r', 6);
		control1.dataset.index = i;
		control1.dataset.type = 'control1';
		canvas.appendChild(control1);

		const control2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		control2.classList.add('sequencer-control-point');
		control2.setAttribute('cx', point.cp2.x);
		control2.setAttribute('cy', point.cp2.y);
		control2.setAttribute('r', 6);
		control2.dataset.index = i;
		control2.dataset.type = 'control2';
		canvas.appendChild(control2);
	}

	updateOutput();
}

function getTimelineCoordinates(point) {
	const rect = timelineCanvas.getBoundingClientRect();

	const x = (point.x - rect.left - rect.width / 2) / timelineCanvas.scale;
	const y = (point.y - rect.top - rect.height / 2) / timelineCanvas.scale;

	return new Point(x, y);
}

function onMouseDown(e) {
	if (!isDrawing) return;

	const target = e.target;
	if (target.dataset.type === 'anchor' || target.dataset.type === 'control1' || target.dataset.type === 'control2') {
		draggedElement = target;

		const mousePoint = new Point(e.clientX, e.clientY);
		const anchorPoint = points[parseInt(draggedElement.dataset.index)];

		if (draggedElement.dataset.type === 'anchor') {
			dragOffset = mousePoint.offsetTo(anchorPoint.anchor);
		} else if (draggedElement.dataset.type === 'control1') {
			dragOffset = mousePoint.offsetTo(anchorPoint.cp1);
		} else if (draggedElement.dataset.type === 'control2') {
			dragOffset = mousePoint.offsetTo(anchorPoint.cp2);
		}
	} else {
		const canvasPoint = new Point(e.clientX, e.clientY);

		const handleDistance = 50;
		const cp1 = new Point(canvasPoint.x - handleDistance, canvasPoint.y);
		const cp2 = new Point(canvasPoint.x + handleDistance, canvasPoint.y);

		if (points.length > 0) {
			const lastPoint = points[points.length - 1];

			const directionVector = canvasPoint.subtract(lastPoint.anchor).normalize();

			cp1.x = canvasPoint.x - directionVector.x * handleDistance;
			cp1.y = canvasPoint.y - directionVector.y * handleDistance;

			cp2.x = canvasPoint.x + directionVector.x * handleDistance;
			cp2.y = canvasPoint.y + directionVector.y * handleDistance;
		}
		points.push({ anchor: canvasPoint, cp1: cp1, cp2: cp2 });
	}

	redraw();
}

function onMouseMove(e) {
	if (!draggedElement) return;

	const mousePoint = new Point(e.clientX, e.clientY);
	const i = parseInt(draggedElement.dataset.index);
	const anchorPoint = points[i];

	const newX = mousePoint.x - dragOffset.dx;
	const newY = mousePoint.y - dragOffset.dy;

	if (draggedElement.dataset.type === 'anchor') {
		anchorPoint.cp1.x += newX - anchorPoint.anchor.x;
		anchorPoint.cp1.y += newY - anchorPoint.anchor.y;

		anchorPoint.cp2.x += newX - anchorPoint.anchor.x;
		anchorPoint.cp2.y += newY - anchorPoint.anchor.y;

		anchorPoint.anchor.x = newX;
		anchorPoint.anchor.y = newY;
	} else if (draggedElement.dataset.type === 'control1') {
		anchorPoint.cp1.x = newX;
		anchorPoint.cp1.y = newY;

		if (!e.shiftKey) {
			anchorPoint.cp2.x = anchorPoint.anchor.x - (newX - anchorPoint.anchor.x);
			anchorPoint.cp2.y = anchorPoint.anchor.y - (newY - anchorPoint.anchor.y);
		}
	} else if (draggedElement.dataset.type === 'control2') {
		anchorPoint.cp2.x = newX;
		anchorPoint.cp2.y = newY;

		if (!e.shiftKey) {
			anchorPoint.cp1.x = anchorPoint.anchor.x - (newX - anchorPoint.anchor.x);
			anchorPoint.cp1.y = anchorPoint.anchor.y - (newY - anchorPoint.anchor.y);
		}
	}

	points[i] = anchorPoint;

	redraw();
}

function onMouseUp(e) {
	if (draggedElement) draggedElement = null;

	addStateToHistory();
}

function updateOutput() {
	const output = document.getElementById('sequencer-path-output');

	if (points.length === 0) {
		output.value = '';
		return;
	}

	let outputString = '';

	const firstPoint = points[0];
	const timelineAnchor = getTimelineCoordinates(firstPoint.anchor);
	outputString += `const path = new Path()\n\t.startAt(${timelineAnchor.x.toFixed(4)}, ${timelineAnchor.y.toFixed(4)})`;

	//cp1x, cp1y, cp2x, cp2y, xEnd, yEnd
	for (let i = 0; i < points.length; i++) {
		if (i === 0) continue;
		const curTimelineCP1 = getTimelineCoordinates(points[i].cp1);
		const prevTimelineCP2 = getTimelineCoordinates(points[i - 1].cp2);
		const curTimelineAnchor = getTimelineCoordinates(points[i].anchor);

		outputString += `\n\t.curveTo(${prevTimelineCP2.x.toFixed(4)}, ${prevTimelineCP2.y.toFixed(4)}, `;
		outputString += `${curTimelineCP1.x.toFixed(4)}, ${curTimelineCP1.y.toFixed(4)}, `;
		outputString += `${curTimelineAnchor.x.toFixed(4)}, ${curTimelineAnchor.y.toFixed(4)})`;
	}
	output.value = outputString + ';';
}

// --- HISTORY MANAGEMENT --------------

const history = [];
let historyIndex = -1;

function onKeyDown(e) {
	if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyZ') {
		e.preventDefault();
		redo();
	} else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
		e.preventDefault();
		undo();
	}
}

function undo() {
	if (historyIndex == 0) return;
	historyIndex--;
	const historicalState = history[historyIndex];
	points = JSON.parse(JSON.stringify(historicalState)).map((p) => ({
		anchor: new Point(p.anchor.x, p.anchor.y),
		cp1: new Point(p.cp1.x, p.cp1.y),
		cp2: new Point(p.cp2.x, p.cp2.y),
	}));
	redraw();
}

function redo() {
	if (historyIndex >= history.length - 1) return;
	historyIndex++;
	const historicalState = history[historyIndex];
	points = JSON.parse(JSON.stringify(historicalState)).map((p) => ({
		anchor: new Point(p.anchor.x, p.anchor.y),
		cp1: new Point(p.cp1.x, p.cp1.y),
		cp2: new Point(p.cp2.x, p.cp2.y),
	}));
	redraw();
}

function addStateToHistory() {
	history.splice(historyIndex + 1);
	const state = JSON.parse(JSON.stringify(points));
	history.push(state);
	historyIndex++;
}
