import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';
import { injectEditor } from './editor/index.js';
import { Path } from './path.js';
injectEditor();

const timeline = new Timeline();

const target = document.querySelector('.hello');

timeline.anim(target).at(1).place({ x: 400, y: 0 });
timeline.anim(target).at(1).hide();

// pos movement
timeline
	.anim(target)
	.at(1)
	.show()
	.then()
	.for(300)
	.type('translateX')
	.spline([
		{ x: 0, y: 0.5 },
		{ x: 0.4, y: 0.8 },
	])
	.to(0)
	.then()
	.for(300)
	.type('translateX')
	.spline([
		{ x: 0.6, y: 0.2 },
		{ x: 1, y: 0.5 },
	])
	.to(-400)
	.then()
	.hide();

// scaling
timeline.anim(target).at(1).type('scale').to(2).then().for(600).type('scale').spline(ease.expOut).to(1);

timeline.play();
