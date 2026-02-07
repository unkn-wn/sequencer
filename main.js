import { Timeline } from './timeline.js';
import { ease } from './animation.js';
import { TimelineCanvas } from './timelinecanvas.js';
import { injectEditor } from './editor/index.js';
import { Path } from './path.js';
injectEditor();

const timeline = new Timeline();

timeline.play();
