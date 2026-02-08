import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';
import { injectEditor } from './editor/index.js';
import { Path } from './path.js';
// injectEditor();

const timeline = new Timeline();
timeline.background().at(1).set('#000');

const HELLO = document.querySelector('.hello');
const square = document.querySelector('.square');

timeline.anim(HELLO).at(1).place({ x: 200, y: 0 });
timeline.anim(HELLO).at(1).hide();

timeline.anim(square).at(1).place({ x: 200, y: 0 });
timeline.anim(square).at(1).hide();

// pos movement
timeline
	.anim(HELLO)
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
	.to(-200)
	.then()
	.hide();

// scaling
timeline.anim(HELLO).at(1).type('scale').to(2).then().for(600).type('scale').spline(ease.expOut).to(1);
timeline.anim(HELLO)
	.at(1).type('scaleY').set(2)
	.then().at(50).type('scaleY').set(5)
	.then().at(100).type('scaleY').set(4)
	.then().at(150).type('scaleY').set(3)
	.then().at(200).type('scaleY').set(1);

timeline.anim(HELLO)
	.at(400).type('scaleX').set(0.5)
	.then().at(450).type('scaleX').set(5)
	.then().at(500).type('scaleX').set(2)
	.then().at(550).type('scaleX').set(0.1);

// elements
timeline.anim(square).at(100).show().type('scale').set(2).then().at(150).hide();
timeline.anim(square).at(550).place({x: -200, y: 0}).show().type('scaleX').set(5).type('scaleY').set(0.1).then().at(600).hide();

// HELLO LEAVES at 600

// I AM starts --------------------------------------------

const IAM = document.querySelector('.iam');
timeline.anim(IAM).at(1).hide();

timeline.background().at(600).set('#ffffff');
timeline.anim(IAM).at(600).place({x: 200, y:0}).show();
timeline
	.anim(IAM)
	.at(600)
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
	.to(-200)
	.then()
	.hide();

const charI = document.querySelector('#char-I');
const charApos = document.querySelector('#char-apos');
const charM = document.querySelector('#char-M');

timeline.anim(charI).at(1).hide();
timeline.anim(charApos).at(1).hide();
timeline.anim(charM).at(1).hide();

[charI, charApos, charM].forEach((char) => {
	timeline.anim(char).at(600).place({x: 200, y:0});
	timeline
		.anim(char)
		.at(600)
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
		.to(-200)
		.then()
		.hide();
});

timeline.anim(charI).at(600).show();
timeline.anim(charApos).at(700).show();
timeline.anim(charM).at(800).show();

// color?
timeline.anim(IAM)
	.at(650)
	.type('color')
	.set('#6064ea')
	.then()
	.at(720)
	.type('color')
	.set('#ffffff');

// elements

const blackSquare = document.querySelector('.blackSquare');
timeline.anim(blackSquare).at(1).hide();

timeline.anim(blackSquare).at(600)
	.type('scaleY').set(0.2)
	.type('scaleX').set(3)
	.place({x: 200, y:0}).show()
	.then().for(100).type('translateX').to(-200)
	.then().at(650).hide();



// SECTION ENDS AT 1200

// NAME COMES IN --------------------------------------------
timeline.background().at(1200).set('#000');

const customEase = [{ x: 0, y: 0.5 }, { x: 0.2, y: 1 }];
const customEaseFast = [{ x: 0, y: 0.8 }, { x: 0.2, y: 1 }];

const nameContainer = document.querySelector('.name');

timeline.anim(nameContainer).at(1).hide();
timeline.anim(nameContainer).at(1200).place({x: 600, y: 0}).show();
timeline.anim(nameContainer).at(1200).then().for(1600).type('translateX')
	.spline([{ x: 0, y: 0.8 }, { x: 0.2, y: 1 }]).to(0);

timeline.anim(nameContainer).at(1200).type('scale').set(10)
	.then().at(1250).type('scale').set(5)
	.then().at(1300).type('scale').set(2)
	.then().at(1350).type('scale').set(1.5)
	.then().at(1400).type('scale').set(1)
	.then().at(1750).type('scale').set(0.3);

const layers = [
	['.name-shadow2', 200],
	['.name-shadow1', 100],
	['.name-main', 0],
];

layers.forEach(([selector, offset]) => {
	const layer = document.querySelector(selector);
	const n1 = layer.querySelector('.name1');
	const n2 = layer.querySelector('.name2');
	const n3 = layer.querySelector('.name3');
	const n4 = layer.querySelector('.name4');
	const n5 = layer.querySelector('.name5');
	const n6 = layer.querySelector('.name6');
	const n7 = layer.querySelector('.name7');
	const n8 = layer.querySelector('.name8');
	const n9 = layer.querySelector('.name9');
	const n10 = layer.querySelector('.name10');

	[n1, n2, n3, n4, n5, n6, n7, n8, n9, n10].forEach(el => {
		timeline.anim(el).at(1).hide();
	});

	// L
	timeline.anim(n1).at(1900 + offset).place({x: 1000, y: 0}).show().type('scaleX').set(8)
		.then().for(1000).type('translateX').spline(customEaseFast).to(0)
		.for(1000).type('scaleX').spline(customEaseFast).to(1);

	timeline.anim(n2).at(1365 + offset).place({x: 0, y: -150}).show()
		.then().for(500).type('translateY').spline(customEase).to(0);

	// E
	timeline.anim(n3).at(1525 + offset).place({x: 0, y: 150}).show()
		.then().for(500).type('translateY').spline(customEase).to(0);

	timeline.anim(n4).at(1350 + offset).place({x: 200, y: 0}).show()
		.then().for(500).type('translateX').spline(customEase).to(0);

	timeline.anim(n5).at(1600 + offset).place({x: -200, y: 0}).show()
		.then().for(500).type('translateX').spline(customEase).to(0);

	timeline.anim(n6).at(1450 + offset).place({x: 200, y: 0}).show()
		.then().for(500).type('translateX').spline(customEase).to(0);

	// O
	timeline.anim(n7).at(1205 + offset).place({x: 0, y: -150}).show()
		.then().for(500).type('translateY').spline(customEase).to(0);

	// N
	timeline.anim(n8).at(1620 + offset).place({x: 0, y: -150}).show()
		.then().for(800).type('translateY').spline(customEase).to(0);

	timeline.anim(n9).at(1720 + offset).place({x: -126, y: -155}).type('rotate').set(-39).show()
		.then().for(500).type('translateX').spline(customEase).to(0)
		.type('translateY').spline(customEase).to(0);

	timeline.anim(n10).at(1310 + offset).place({x: 0, y: 150}).show()
		.then().for(500).type('translateY').spline(customEase).to(0);
});

// mask
const mask1 = document.querySelector('#mask1');
const mask2 = document.querySelector('#mask2');

timeline.anim(mask1).at(1).hide();
timeline.anim(mask2).at(1).hide();

[mask1, mask2].forEach(mask => {
	timeline.anim(mask).at(1).type('rotate').set(-39);
});

timeline.anim(mask1).at(1745).show().place({x: 898, y: -18});
timeline.anim(mask2).at(1745).show().place({x: 1060, y: 329});


// MAIN ANIM DONE NOW ---------------------------------------------------------------------


timeline.play();

