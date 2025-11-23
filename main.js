import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';
import { injectEditor } from './editor.js';
import { Path } from './path.js';
injectEditor();

const timeline = new Timeline();

// Get elements
const coreSquare = document.querySelector('#core-square');
const ring1 = document.querySelector('#ring1');
const ring2 = document.querySelector('#ring2');
const orb1 = document.querySelector('#orb1');
const sparks = document.querySelectorAll('.spark');
const bars = document.querySelectorAll('.bar');

// --- Define Paths ---
const orbPath = new Path()
	.startAt(0, -300)
	.curveTo(400, -300, 400, 300, 0, 300)
	.curveTo(-400, 300, -400, -300, 0, -300);

const sparkPath1 = new Path().startAt(0, 0).curveTo(100, 0, 300, -400, 600, -500);
const sparkPath2 = new Path().startAt(0, 0).curveTo(-100, 0, -300, 400, -600, 500);
const sparkPaths = [sparkPath1, sparkPath2, sparkPath1, sparkPath2, sparkPath1, sparkPath2];

// --- Initialize Elements ---
[coreSquare, ring1, ring2, orb1, ...sparks, ...bars].forEach((el) => {
	timeline.anim(el).at(0).type('opacity').set(0);
	timeline.anim(el).at(0).type('scale').set(0);
});

// --- Animation Sequence (5 seconds) ---

// 0ms: Core build-up
timeline.anim(coreSquare).at(100).for(800).spline(ease.overshoot).type(['scale', 'opacity']).move(0, 1);
timeline.anim(coreSquare).at(100).for(5000).type('rotate').move(0, 360);

// 500ms: Rings expand
timeline.anim(ring1).at(500).for(1000).spline(ease.expOut).type(['scale', 'opacity']).move(0.5, 1);
timeline.anim(ring2).at(600).for(1200).spline(ease.expOut).type(['scale', 'opacity']).move(0.5, 1);
timeline.anim(ring2).at(600).for(4400).type('rotate').move(0, -90);

// 1000ms: Orb begins its path
timeline.anim(orb1).at(1000).for(500).spline(ease.smooth).type(['scale', 'opacity']).move(0, 1);
timeline.anim(orb1).at(1000).for(4000).spline(ease.smooth).path(orbPath);

// 1500ms: Bars shoot in and rotate
bars.forEach((bar, i) => {
	const angle = i * 90;
	const startX = Math.cos((angle * Math.PI) / 180) * 1200;
	const startY = Math.sin((angle * Math.PI) / 180) * 1200;
	timeline.anim(bar).at(0).place(startX, startY);
	timeline.anim(bar).at(0).type('rotate').set(angle);

	timeline.anim(bar).at(1500 + i * 50).for(500).spline(ease.expOut).type(['scale', 'opacity']).move(0, 1);
	timeline.anim(bar).at(2000).for(1000).spline(ease.smooth).type('rotate').moveBy(90);
	timeline.anim(bar).at(4000).for(500).spline(ease.expIn).type(['translateX', 'translateY']).moveTo(0);
	timeline.anim(bar).at(4500).for(200).type('opacity').moveTo(0);
});

// 2000ms: Spark burst
sparks.forEach((spark, i) => {
	timeline
		.anim(spark)
		.at(2000 + i * 80)
		.for(300)
		.spline(ease.expOut)
		.type(['scale', 'opacity'])
		.move(0, 1)
		.then()
		.for(1500)
		.spline(ease.expIn)
		.path(sparkPaths[i])
		.then()
		.for(100)
		.type('opacity')
		.moveTo(0);
});

// 4500ms: Final pulse and collapse
timeline.anim(coreSquare).at(4500).for(500).spline(ease.expIn).type('scale').move(1, 0);
timeline.anim(ring1).at(4500).for(500).spline(ease.expIn).type('scale').move(1, 0);
timeline.anim(ring2).at(4500).for(500).spline(ease.expIn).type('scale').move(1, 0);
timeline.anim(orb1).at(4500).for(500).spline(ease.expIn).type('scale').moveTo(0);

timeline.play();
