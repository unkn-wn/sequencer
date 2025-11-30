import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';
import { injectEditor } from './editor.js';
import { Path } from './path.js';
injectEditor();

const timeline = new Timeline();

const square = document.querySelector('.square');

const path = new Path()
	.startAt(432.7415, -388.3886)
	.curveTo(784.5485, -545.6121, 993.142, -513.0283, 1204.8488, -319.8953)
	.curveTo(1416.5556, -126.7623, 1358.7472, 236.1679, 994.6986, 382.162)
	.curveTo(630.6501, 528.1561, 247.7092, 281.4058, 1.5445, -21.015);

timeline.anim(square).at(500).for(1000).spline(ease.expIn).path(path);

timeline.play();
