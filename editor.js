// inject html
// have addPoint, onMousemove etc, click to add point, show bezier handles, calculate the points, generate path code
// eventually undo redo

import { Path, Point } from './path.js';

const timelineCanvas = document.querySelector('timeline-canvas');
const points = [];
let isDrawing = false;

export function injectEditor() {
	createHTML();
	createCanvas();
	createCSS();
	createEventListeners();
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
	const canvas = document.createElement('svg');
	canvas.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
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
		onMouseDown(e);
	});

	canvas.addEventListener('mousemove', (e) => {
		// move point
	});

	canvas.addEventListener('mouseup', (e) => {
		// release point
	});

	document.addEventListener('keydown', (e) => {
		// detect undo for later
	});
}

function redraw() {
	// clear canvas, then draw paths, draw points
	const canvas = document.getElementById('sequencer-path-editor-canvas');
	canvas.innerHTML = '';

	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.classList.add('sequencer-anchor-point');
		circle.setAttribute('cx', point.anchor.x);
		circle.setAttribute('cy', point.anchor.y);
		circle.setAttribute('r', 6);
		circle.dataset.index = i;
		canvas.appendChild(circle);
	}
}

function getTimelineCoordinates(e) {
	const rect = timelineCanvas.getBoundingClientRect();

	const x = (e.clientX - rect.left - rect.width / 2) / timelineCanvas.scale;
	const y = (e.clientY - rect.top - rect.height / 2) / timelineCanvas.scale;

	return new Point(x, y);
}

function onMouseDown(e) {
	if (!isDrawing) return;

	const canvasPoint = new Point(e.clientX, e.clientY);
	const timelinePoint = getTimelineCoordinates(e);
	points.push({ anchor: canvasPoint, timelinePoints: timelinePoint, cp1: null, cp2: null });
	redraw();
	console.log('Added point at:', canvasPoint.x, canvasPoint.y);

	const target = e.target;
}
