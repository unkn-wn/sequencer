import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';

const timeline = new Timeline();

// Get all elements
const centerBox = document.querySelector('.center-box');
const centerRing = document.querySelector('.center-ring');
const centerCore = document.querySelector('.center-core');

const bracketTL = document.querySelector('.corner-bracket.tl');
const bracketTR = document.querySelector('.corner-bracket.tr');
const bracketBL = document.querySelector('.corner-bracket.bl');
const bracketBR = document.querySelector('.corner-bracket.br');

const dotTL = document.querySelector('.corner-dot.tl');
const dotTR = document.querySelector('.corner-dot.tr');
const dotBL = document.querySelector('.corner-dot.bl');
const dotBR = document.querySelector('.corner-dot.br');

const edgeTop = document.querySelector('.edge-line.top');
const edgeBottom = document.querySelector('.edge-line.bottom');
const edgeLeft = document.querySelector('.edge-line.left');
const edgeRight = document.querySelector('.edge-line.right');

const label1 = document.querySelector('#label1');
const label2 = document.querySelector('#label2');
const label3 = document.querySelector('#label3');
const label4 = document.querySelector('#label4');

const data1 = document.querySelector('#data1');
const data2 = document.querySelector('#data2');

const prog1 = document.querySelector('#prog1');
const prog2 = document.querySelector('#prog2');

const acc1 = document.querySelector('#acc1');
const acc2 = document.querySelector('#acc2');
const accline1 = document.querySelector('#accline1');
const accline2 = document.querySelector('#accline2');

const sb1 = document.querySelector('#sb1');
const sb2 = document.querySelector('#sb2');
const sb3 = document.querySelector('#sb3');
const sb4 = document.querySelector('#sb4');

const tl1 = document.querySelector('#tl1');
const tl2 = document.querySelector('#tl2');
const tl3 = document.querySelector('#tl3');
const tl4 = document.querySelector('#tl4');

const mt1 = document.querySelector('#mt1');
const mt2 = document.querySelector('#mt2');
const mt3 = document.querySelector('#mt3');
const mt4 = document.querySelector('#mt4');

// Initialize all elements - set positions and hide
// Center elements
timeline.anim(centerBox).at(0).place(0, 0);
timeline.anim(centerBox).at(0).type('opacity').set(0);

timeline.anim(centerRing).at(0).place(0, 0);
timeline.anim(centerRing).at(0).type('opacity').set(0);

timeline.anim(centerCore).at(0).place(0, 0);
timeline.anim(centerCore).at(0).type('opacity').set(0);

// Corner brackets - positioned in corners
timeline.anim(bracketTL).at(0).place(-920, -500);
timeline.anim(bracketTL).at(0).type('opacity').set(0);

timeline.anim(bracketTR).at(0).place(920, -500);
timeline.anim(bracketTR).at(0).type('opacity').set(0);

timeline.anim(bracketBL).at(0).place(-920, 500);
timeline.anim(bracketBL).at(0).type('opacity').set(0);

timeline.anim(bracketBR).at(0).place(920, 500);
timeline.anim(bracketBR).at(0).type('opacity').set(0);

// Corner dots - positioned near brackets
timeline.anim(dotTL).at(0).place(-925, -505);
timeline.anim(dotTL).at(0).type('opacity').set(0);

timeline.anim(dotTR).at(0).place(925, -505);
timeline.anim(dotTR).at(0).type('opacity').set(0);

timeline.anim(dotBL).at(0).place(-925, 505);
timeline.anim(dotBL).at(0).type('opacity').set(0);

timeline.anim(dotBR).at(0).place(925, 505);
timeline.anim(dotBR).at(0).type('opacity').set(0);

// Edge lines - positioned on edges
timeline.anim(edgeTop).at(0).place(0, -520);
timeline.anim(edgeTop).at(0).type('opacity').set(0);

timeline.anim(edgeBottom).at(0).place(0, 520);
timeline.anim(edgeBottom).at(0).type('opacity').set(0);

timeline.anim(edgeLeft).at(0).place(-940, 0);
timeline.anim(edgeLeft).at(0).type('opacity').set(0);

timeline.anim(edgeRight).at(0).place(940, 0);
timeline.anim(edgeRight).at(0).type('opacity').set(0);

// Labels - spread around the frame (no overlaps)
timeline.anim(label1).at(0).place(-750, -360);
timeline.anim(label1).at(0).type('opacity').set(0);

timeline.anim(label2).at(0).place(650, -380);
timeline.anim(label2).at(0).type('opacity').set(0);

timeline.anim(label3).at(0).place(820, -150);
timeline.anim(label3).at(0).type('opacity').set(0);

timeline.anim(label4).at(0).place(-860, 100);
timeline.anim(label4).at(0).type('opacity').set(0);

// Data blocks - bottom corners area
timeline.anim(data1).at(0).place(-780, 390);
timeline.anim(data1).at(0).type('opacity').set(0);

timeline.anim(data2).at(0).place(720, 390);
timeline.anim(data2).at(0).type('opacity').set(0);

// Progress bars
timeline.anim(prog1).at(0).place(-780, 450);
timeline.anim(prog1).at(0).type('opacity').set(0);

timeline.anim(prog2).at(0).place(720, -390);
timeline.anim(prog2).at(0).type('opacity').set(0);

// Accent elements - scattered around
timeline.anim(acc1).at(0).place(-510, -290);
timeline.anim(acc1).at(0).type('opacity').set(0);

timeline.anim(acc2).at(0).place(510, 290);
timeline.anim(acc2).at(0).type('opacity').set(0);

timeline.anim(accline1).at(0).place(-610, 180);
timeline.anim(accline1).at(0).type('opacity').set(0);

timeline.anim(accline2).at(0).place(610, -180);
timeline.anim(accline2).at(0).type('opacity').set(0);

// Small boxes - scattered fill elements
timeline.anim(sb1).at(0).place(-350, -420);
timeline.anim(sb1).at(0).type('opacity').set(0);

timeline.anim(sb2).at(0).place(380, -180);
timeline.anim(sb2).at(0).type('opacity').set(0);

timeline.anim(sb3).at(0).place(-280, 350);
timeline.anim(sb3).at(0).type('opacity').set(0);

timeline.anim(sb4).at(0).place(450, 420);
timeline.anim(sb4).at(0).type('opacity').set(0);

// Thin lines - more structural elements
timeline.anim(tl1).at(0).place(-450, -80);
timeline.anim(tl1).at(0).type('opacity').set(0);

timeline.anim(tl2).at(0).place(350, 250);
timeline.anim(tl2).at(0).type('opacity').set(0);

timeline.anim(tl3).at(0).place(-200, 150);
timeline.anim(tl3).at(0).type('opacity').set(0);

timeline.anim(tl4).at(0).place(550, -300);
timeline.anim(tl4).at(0).type('opacity').set(0);

// Micro text - technical details
timeline.anim(mt1).at(0).place(-600, -450);
timeline.anim(mt1).at(0).type('opacity').set(0);

timeline.anim(mt2).at(0).place(680, 80);
timeline.anim(mt2).at(0).type('opacity').set(0);

timeline.anim(mt3).at(0).place(-400, 480);
timeline.anim(mt3).at(0).type('opacity').set(0);

timeline.anim(mt4).at(0).place(300, -460);
timeline.anim(mt4).at(0).type('opacity').set(0);

// SCENE 1: System Boot - All elements appear around 1 second
// Corner brackets snap in with glitch effect
timeline.anim(bracketTL).at(900).type('opacity').for(50).move(0, 1);
timeline.anim(bracketTL).at(900).type('scale').set(0.8);
timeline.anim(bracketTL).at(900).for(200).spline(ease.snap).type('scale').move(0.8, 1);

timeline.anim(bracketTR).at(920).type('opacity').for(50).move(0, 1);
timeline.anim(bracketTR).at(920).type('scale').set(0.8);
timeline.anim(bracketTR).at(920).for(200).spline(ease.snap).type('scale').move(0.8, 1);

timeline.anim(bracketBL).at(940).type('opacity').for(50).move(0, 1);
timeline.anim(bracketBL).at(940).type('scale').set(0.8);
timeline.anim(bracketBL).at(940).for(200).spline(ease.snap).type('scale').move(0.8, 1);

timeline.anim(bracketBR).at(960).type('opacity').for(50).move(0, 1);
timeline.anim(bracketBR).at(960).type('scale').set(0.8);
timeline.anim(bracketBR).at(960).for(200).spline(ease.snap).type('scale').move(0.8, 1);

// Corner dots pulse in
timeline.anim(dotTL).at(980).type('opacity').for(100).move(0, 1);
timeline
	.anim(dotTL)
	.at(980)
	.type('scale')
	.for(200)
	.spline(ease.overshoot)
	.move(0, 1.2)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.2, 1);

timeline.anim(dotTR).at(1000).type('opacity').for(100).move(0, 1);
timeline
	.anim(dotTR)
	.at(1000)
	.type('scale')
	.for(200)
	.spline(ease.overshoot)
	.move(0, 1.2)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.2, 1);

timeline.anim(dotBL).at(1020).type('opacity').for(100).move(0, 1);
timeline
	.anim(dotBL)
	.at(1020)
	.type('scale')
	.for(200)
	.spline(ease.overshoot)
	.move(0, 1.2)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.2, 1);

timeline.anim(dotBR).at(1040).type('opacity').for(100).move(0, 1);
timeline
	.anim(dotBR)
	.at(1040)
	.type('scale')
	.for(200)
	.spline(ease.overshoot)
	.move(0, 1.2)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.2, 1);

// Edge lines expand from center
timeline.anim(edgeTop).at(1060).type('opacity').for(50).move(0, 1);
timeline.anim(edgeTop).at(1060).type('scaleX').for(400).spline(ease.expOut).move(0, 1);

timeline.anim(edgeBottom).at(1080).type('opacity').for(50).move(0, 1);
timeline.anim(edgeBottom).at(1080).type('scaleX').for(400).spline(ease.expOut).move(0, 1);

timeline.anim(edgeLeft).at(1100).type('opacity').for(50).move(0, 1);
timeline.anim(edgeLeft).at(1100).type('scaleY').for(400).spline(ease.expOut).move(0, 1);

timeline.anim(edgeRight).at(1120).type('opacity').for(50).move(0, 1);
timeline.anim(edgeRight).at(1120).type('scaleY').for(400).spline(ease.expOut).move(0, 1);

// Center elements appear
// Center ring expands in with very slow rotation
timeline.anim(centerRing).at(950).type('opacity').for(200).move(0, 0.6);
timeline.anim(centerRing).at(950).type('scale').for(600).spline(ease.expOut).move(0, 1);
timeline.anim(centerRing).at(950).for(10000).type('rotate').move(0, 90);

// Center box appears with subtle rotation
timeline.anim(centerBox).at(1000).type('opacity').for(200).move(0, 1);
timeline.anim(centerBox).at(1000).type('scale').for(500).spline(ease.overshoot).move(0, 1);
timeline.anim(centerBox).at(1000).for(10000).type('rotate').move(0, 120);

// Center core pulses in
timeline.anim(centerCore).at(1050).type('opacity').for(200).move(0, 1);
timeline.anim(centerCore).at(1050).type('scale').for(400).spline(ease.overshoot).move(0, 1);

// Core continuous pulse
timeline
	.anim(centerCore)
	.at(2000)
	.for(300)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.3)
	.then()
	.for(300)
	.spline(ease.smooth)
	.type('scale')
	.move(1.3, 1);

// UI Elements populate around 1 second
// Labels appear with slide
timeline.anim(label1).at(900).type('opacity').for(200).move(0, 1);
timeline.anim(label1).at(900).type('translateX').for(400).spline(ease.expOut).move(-100, 0);

timeline.anim(label2).at(920).type('opacity').for(200).move(0, 1);
timeline.anim(label2).at(920).type('translateX').for(400).spline(ease.expOut).move(100, 0);

timeline.anim(label3).at(940).type('opacity').for(200).move(0, 1);
timeline.anim(label3).at(940).type('translateY').for(400).spline(ease.expOut).move(-100, 0);

timeline.anim(label4).at(960).type('opacity').for(200).move(0, 1);
timeline.anim(label4).at(960).type('translateY').for(400).spline(ease.expOut).move(100, 0);

// Data blocks snap in
timeline.anim(data1).at(1000).type('opacity').for(100).move(0, 1);
timeline.anim(data1).at(1000).type('scale').for(300).spline(ease.snap).move(0.7, 1);

timeline.anim(data2).at(1020).type('opacity').for(100).move(0, 1);
timeline.anim(data2).at(1020).type('scale').for(300).spline(ease.snap).move(0.7, 1);

// Progress bars expand
timeline.anim(prog1).at(1040).type('opacity').for(100).move(0, 1);
timeline.anim(prog1).at(1040).type('scaleX').for(600).spline(ease.expOut).move(0, 1);

timeline.anim(prog2).at(1060).type('opacity').for(100).move(0, 1);
timeline.anim(prog2).at(1060).type('scaleX').for(600).spline(ease.expOut).move(0, 1);

// Accent elements appear
timeline.anim(acc1).at(1080).type('opacity').for(150).move(0, 1);
timeline.anim(acc1).at(1080).type('scale').for(300).spline(ease.overshoot).move(0, 1);
timeline.anim(acc1).at(1200).for(10000).type('rotate').move(0, 35);

timeline.anim(acc2).at(1100).type('opacity').for(150).move(0, 1);
timeline.anim(acc2).at(1100).type('scale').for(300).spline(ease.overshoot).move(0, 1);
timeline.anim(acc2).at(1200).for(10000).type('rotate').move(0, -35);

timeline.anim(accline1).at(1120).type('opacity').for(100).move(0, 1);
timeline.anim(accline1).at(1120).type('scaleX').for(400).spline(ease.expOut).move(0, 1);

timeline.anim(accline2).at(1140).type('opacity').for(100).move(0, 1);
timeline.anim(accline2).at(1140).type('scaleX').for(400).spline(ease.expOut).move(0, 1);

// SCENE 4: Active state animations (4000-6000ms)
// Box subtle continuing tilt
timeline
	.anim(centerBox)
	.at(4600)
	.for(400)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.15)
	.then()
	.for(400)
	.spline(ease.smooth)
	.type('scale')
	.move(1.15, 1);

// Core mega pulse
timeline
	.anim(centerCore)
	.at(4400)
	.for(400)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.8)
	.then()
	.for(400)
	.spline(ease.smooth)
	.type('scale')
	.move(1.8, 1);

// Dots pulse sequence
timeline
	.anim(dotTL)
	.at(4800)
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.5)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.5, 1);
timeline
	.anim(dotTR)
	.at(4900)
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.5)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.5, 1);
timeline
	.anim(dotBR)
	.at(5000)
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.5)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.5, 1);
timeline
	.anim(dotBL)
	.at(5100)
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.5)
	.then()
	.for(200)
	.spline(ease.smooth)
	.type('scale')
	.move(1.5, 1);

// Small boxes fade in and subtle animations (10 seconds with increased amplitude)
timeline.anim(sb1).at(950).type('opacity').for(300).move(0, 0.6);
timeline.anim(sb1).at(950).type('scale').for(400).spline(ease.overshoot).move(0, 1);
timeline.anim(sb1).at(1200).for(10000).type('rotate').move(0, 30);

timeline.anim(sb2).at(980).type('opacity').for(300).move(0, 0.6);
timeline.anim(sb2).at(980).type('scale').for(400).spline(ease.overshoot).move(0, 1);
timeline.anim(sb2).at(1200).for(10000).type('rotate').move(0, -25);

timeline.anim(sb3).at(1010).type('opacity').for(300).move(0, 0.6);
timeline.anim(sb3).at(1010).type('scale').for(400).spline(ease.overshoot).move(0, 1);
timeline.anim(sb3).at(1200).for(10000).type('rotate').move(0, 35);

timeline.anim(sb4).at(1040).type('opacity').for(300).move(0, 0.6);
timeline.anim(sb4).at(1040).type('scale').for(400).spline(ease.overshoot).move(0, 1);
timeline.anim(sb4).at(1200).for(10000).type('rotate').move(0, -20);

// Thin lines expand slowly
timeline.anim(tl1).at(1000).type('opacity').for(200).move(0, 0.5);
timeline.anim(tl1).at(1000).type('scaleX').for(800).spline(ease.expOut).move(0, 1);

timeline.anim(tl2).at(1020).type('opacity').for(200).move(0, 0.5);
timeline.anim(tl2).at(1020).type('scaleX').for(800).spline(ease.expOut).move(0, 1);

timeline.anim(tl3).at(1040).type('opacity').for(200).move(0, 0.5);
timeline.anim(tl3).at(1040).type('scaleY').for(800).spline(ease.expOut).move(0, 1);

timeline.anim(tl4).at(1060).type('opacity').for(200).move(0, 0.5);
timeline.anim(tl4).at(1060).type('scaleY').for(800).spline(ease.expOut).move(0, 1);

// Micro text fade in with very subtle drift (10 seconds with increased amplitude)
timeline.anim(mt1).at(1000).type('opacity').for(400).move(0, 0.7);
timeline.anim(mt1).at(1200).for(10000).type('translateY').move(0, -20);

timeline.anim(mt2).at(1020).type('opacity').for(400).move(0, 0.7);
timeline.anim(mt2).at(1200).for(10000).type('translateX').move(0, 18);

timeline.anim(mt3).at(1040).type('opacity').for(400).move(0, 0.7);
timeline.anim(mt3).at(1200).for(10000).type('translateY').move(0, 25);

timeline.anim(mt4).at(1060).type('opacity').for(400).move(0, 0.7);
timeline.anim(mt4).at(1200).for(10000).type('translateX').move(0, -15);

// Final core pulse
timeline
	.anim(centerCore)
	.at(5600)
	.for(300)
	.spline(ease.smooth)
	.type('scale')
	.move(1, 1.4)
	.then()
	.for(300)
	.spline(ease.smooth)
	.type('scale')
	.move(1.4, 1);

import { Path } from './path.js';
const path = new Path()
	.startAt(-695.0, 170.5)
	.curveTo(-506.0, 117.5, 268.0, 24.5, 553.0, 89.5)
	.curveTo(838.0, 154.5, 871.0, 335.5, 571.0, 408.5)
	.curveTo(271.0, 481.5, 9.0, 319.5, -37.0, 185.5);

timeline.anim(centerCore).at(1500).for(1000).spline(ease.smoothL).path(path);

timeline.play();
