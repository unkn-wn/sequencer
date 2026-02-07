export class HistoryManager {
	constructor(editor) {
		this.editor = editor;
		this.undoStack = [];
		this.redoStack = [];
		this.maxHistory = 50;
	}

	push(action) {
		this.undoStack.push(action);
		if (this.undoStack.length > this.maxHistory) {
			this.undoStack.shift();
		}
		this.redoStack = [];
	}

	undo() {
		if (this.undoStack.length === 0) return;
		const action = this.undoStack.pop();
		action.undo();
		this.redoStack.push(action);
		this.refresh();
	}

	redo() {
		if (this.redoStack.length === 0) return;
		const action = this.redoStack.pop();
		action.redo();
		this.undoStack.push(action);
		this.refresh();
	}

	refresh() {
		if (this.editor.inspector) this.editor.inspector.updateCode();
		if (this.editor.timelineUI) this.editor.timelineUI.renderMarkers();
		if (this.editor.pathEditor) this.editor.pathEditor.redraw();
	}
}
