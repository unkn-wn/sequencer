import { createTimelineUI } from './timelineUI.js';
import { createInspector } from './inspector.js';
import { getState, applyState } from '../animation.js';
import { Gizmo } from './gizmo.js';
import { HistoryManager } from './history.js';

// inject editor into window
export function injectEditor() {
	const editor = new Editor();
	window.sequencerEditor = editor;
	editor.init();
}

// main editor class
class Editor {
	constructor() {
		this.controller = null;
		this.selectedElement = null;
		this.gizmo = null;
		this.history = new HistoryManager(this);
	}

	// initialize components and listeners
	init() {
		this.createStyles();
		this.timelineUI = createTimelineUI(this);
		this.inspector = createInspector(this);
		this.gizmo = new Gizmo(this);

		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey || e.metaKey) {
				if (e.code === 'KeyZ') {
					e.preventDefault();
					if (e.shiftKey) {
						this.history.redo();
					} else {
						this.history.undo();
					}
				}
			}
		});

		let isDragging = false;
		let startX, startY;
		let initialElementX, initialElementY;

		document.addEventListener('mousedown', (e) => {
			if (
				e.target.closest('.sequencer-ui-panel') ||
				e.target.closest('#sequencer-path-editor-panel') ||
				e.target.closest('.sequencer-gizmo')
			)
				return;

			if (
				e.target.id?.startsWith('sequencer-') ||
				(e.target.className && typeof e.target.className === 'string' && e.target.className.startsWith('sequencer-')) ||
				(e.target.classList && e.target.classList.contains('sequencer-anchor-point')) ||
				(e.target.classList && e.target.classList.contains('sequencer-control-point')) ||
				(e.target.classList && e.target.classList.contains('sequencer-handle-line'))
			) {
				return;
			}

			if (
				e.target.tagName.toLowerCase() === 'timeline-canvas' ||
				e.target.id === 'sequencer-path-editor-canvas' ||
				e.target.closest('svg#sequencer-path-editor-canvas') ||
				e.target === document.body ||
				e.target === document.documentElement
			) {
				if (this.selectedElement) {
					if (e.target.id !== 'sequencer-path-editor-canvas' && !e.target.closest('svg#sequencer-path-editor-canvas')) {
						this.selectElement(null);
					}
				}
				return;
			}

			this.selectElement(e.target);

			isDragging = true;
			startX = e.clientX;
			startY = e.clientY;

			const state = getState(e.target);
			initialElementX = state.x;
			initialElementY = state.y;

			e.preventDefault();
		});

		document.addEventListener('mousemove', (e) => {
			if (!isDragging || !this.selectedElement) return;

			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			const state = getState(this.selectedElement);
			state.x = initialElementX + dx;
			state.y = initialElementY + dy;

			applyState(this.selectedElement, state);

			this.inspector.refreshValues();
		});

		document.addEventListener('mouseup', () => {
			isDragging = false;
		});
	}

	// create css styles
	createStyles() {
		const style = document.createElement('style');
		style.textContent = `
            .sequencer-ui-panel {
                font-family: 'Segoe UI', sans-serif;
                color: #e0e0e0;
                box-sizing: border-box;
                user-select: none;
                font-size: 12px;
            }
            .sequencer-ui-panel h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #fff;
                border-bottom: 1px solid #444;
                padding-bottom: 5px;
                font-weight: 600;
            }
            .sequencer-ui-panel button {
                background: #3a3a3e;
                border: 1px solid #555;
                color: #eee;
                padding: 4px 8px;
                cursor: pointer;
                border-radius: 3px;
                font-size: 11px;
                font-family: 'Segoe UI', sans-serif;
                transition: background 0.1s;
            }
            .sequencer-ui-panel button:hover {
                background: #4a4a4e;
                border-color: #666;
            }
            .sequencer-ui-panel button:active {
                background: #2a2a2e;
            }
            .sequencer-ui-panel input[type="range"] {
                width: 100%;
                accent-color: #00aaff;
                cursor: pointer;
            }
            .sequencer-ui-panel input[type="number"], .sequencer-ui-panel input[type="text"], .sequencer-ui-panel select {
                background: #1a1a1d;
                border: 1px solid #333;
                color: #eee;
                padding: 3px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 11px;
            }
            .sequencer-ui-panel input:focus, .sequencer-ui-panel select:focus {
                outline: 1px solid #00aaff;
                border-color: #00aaff;
            }
            .sequencer-ui-panel label {
                color: #aaa;
                font-size: 11px;
            }
            .sequencer-selected {
                outline: 2px solid #00aaff;
                box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
            }
            .sequencer-keyframe-marker {
                transition: transform 0.1s, background 0.1s;
            }
            .sequencer-keyframe-marker:hover {
                transform: scale(1.2);
                background: #fff !important;
            }
        `;
		document.head.appendChild(style);
	}

	// attach controller to ui
	attachController(controller) {
		this.controller = controller;
		this.timelineUI.attachController(controller);
	}

	// select element and update ui
	selectElement(element) {
		if (this.selectedElement) {
			this.selectedElement.classList.remove('sequencer-selected');
		}

		if (!element) {
			this.timelineUI.selectAnimations([]);
		}

		this.selectedElement = element;

		if (element) {
			element.classList.add('sequencer-selected');
		}

		this.inspector.update(element);
		this.timelineUI.renderMarkers();
		this.gizmo.attach(element);
	}
}
