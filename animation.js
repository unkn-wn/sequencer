const animations = [];
const elements = new WeakMap();

export const ease = {
    linear: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
    ],
    smooth: [
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
    ],
    smoothL: [
        { x: 0.75, y: 0 },
        { x: 0.25, y: 1 },
    ],
    easeIn: [
        { x: 0.6, y: 0 },
        { x: 1, y: 1 },
    ],
    easeOut: [
        { x: 0, y: 0 },
        { x: 0.4, y: 1 },
    ],
    overshoot: [
        { x: 0.68, y: -0.55 },
        { x: 0.27, y: 1.55 },
    ],
    bounce: [
        { x: 0.34, y: 1.56 },
        { x: 0.64, y: 1 },
    ],
    snap: [
        { x: 0.95, y: 0.05 },
        { x: 0.05, y: 0.95 },
    ],
    expIn: [
        { x: 0.7, y: 0 },
        { x: 0.9, y: 0.5 },
    ],
    expOut: [
        { x: 0.1, y: 0.5 },
        { x: 0.3, y: 1 },
    ],
};

const mapping = {
    translateX: "x",
    translateY: "y",
    opacity: "opacity",
    scale: "scale",
    scaleX: "scaleX",
    scaleY: "scaleY",
    rotate: "rotation",
};

export class Animation {
    constructor(target, type, startValue, endValue, startTime, duration, spline = ease.linear, moveType = null) {
        this.target = target;
        this.type = type;

        // maybe coordinates? type could be translateX and translateY, etc, for some coordinate (problem with diff screeen sizes though)
        this.startValue = startValue;
        this.endValue = endValue;
        this.startTime = startTime;
        this.duration = duration;
        this.spline = spline; // size 2 array of bezier curve control points. (0,0) and (1,1) are implicit endpoints.

        this.moveType = moveType; // moveTo or moveBy

        animations.push(this);
    }
}

export function getState(element) {
    if (!elements.has(element)) {
        elements.set(element, {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
        });
    }

    return elements.get(element);
}

export function applyState(element, state) {
    const css = `translate(-50%, -50%) translateX(${state.x}px) translateY(${state.y}px) scale(${state.scale}) scaleX(${state.scaleX}) scaleY(${state.scaleY}) rotate(${state.rotation}deg)`;
    element.style.transform = css;
    element.style.opacity = state.opacity;
}

// function animate(options) {
//     const element = document.querySelector(options.target);
//     const anims = Object.keys(options.anims);
//     // anims: { translateX: 1000 (duration), opacity: 250, ... }

//     for (const anim of anims) {
//         const duration = anims[anim];

//         new Animation(element, anim, options.startValue, options.endValue, options.startTime, duration, options.spline);
//     }
// }

// let frameDur = 1000 / 30;
// let lastFrame = 0;
// export function setFPS(fps) {
//     frameDur = 1000 / fps;
// }

export function animationLoop(currentTime) {
    requestAnimationFrame(animationLoop);

    // if (currentTime - lastFrame < frameDur) return;
    // lastFrame = currentTime;

    for (let i = animations.length - 1; i >= 0; i--) {
        const animation = animations[i];

        if (currentTime < animation.startTime) continue;

        if (animation.moveType === "moveTo") {
            animation.startValue = getState(animation.target)[mapping[animation.type]];
        } else if (animation.moveType === "moveBy") {
            animation.startValue = getState(animation.target)[mapping[animation.type]];
            animation.endValue = animation.startValue + animation.endValue;
        }

        const elapsed = currentTime - animation.startTime;
        const progress = Math.min(1, elapsed / animation.duration);

        const value = bezierEase(progress, animation.spline);
        const currentValue = animation.startValue + (animation.endValue - animation.startValue) * value;

        const state = getState(animation.target);
        setState(state, animation.type, currentValue);
        applyState(animation.target, state);

        if (progress >= 1) {
            animations.splice(i, 1);
        }
    }
}

export function setState(state, type, value) {
    switch (type) {
        case "translateX":
            state.x = value;
            break;
        case "translateY":
            state.y = value;
            break;
        case "opacity":
            state.opacity = value;
            break;
        case "scale":
            state.scale = value;
            break;
        case "scaleX":
            state.scaleX = value;
            break;
        case "scaleY":
            state.scaleY = value;
            break;
        case "rotate":
            state.rotation = value;
            break;
    }
}

// function addTransform(original, type, value) {
//     if (original.includes(type)) {
//         original = original.replace(new RegExp(`${type}\\([^)]*\\)`), `${type}(${value})`);
//     } else {
//         original += ` ${type}(${value})`;
//     }

//     return original;
// }

function bezierEaseX(progress, spline) {
    // what i understand is a bezier curve has 4 points, where the lines are
    // 1. line from (0,0) to control point 1
    // 2. line from control point 1 to control point 2
    // 3. line from control point 2 to (1,1)
    // then, get the progress along each line,
    // 4. line from line 1 progress to line 2 progress
    // 5. line from line 2 progress to line 3 progress
    // finally,
    // 6. line from line 4 progress to line 5 progress gives the value at progress

    const line1 = [spline[0].x * progress, spline[0].y * progress];
    const line2 = [(spline[1].x - spline[0].x) * progress + spline[0].x, (spline[1].y - spline[0].y) * progress + spline[0].y];
    const line3 = [(1 - spline[1].x) * progress + spline[1].x, (1 - spline[1].y) * progress + spline[1].y];

    const line4 = [(line2[0] - line1[0]) * progress + line1[0], (line2[1] - line1[1]) * progress + line1[1]];
    const line5 = [(line3[0] - line2[0]) * progress + line2[0], (line3[1] - line2[1]) * progress + line2[1]];

    const lineX = (line5[0] - line4[0]) * progress + line4[0];
    return lineX;
}

function bezierEaseY(progress, spline) {
    const line1 = [spline[0].x * progress, spline[0].y * progress];
    const line2 = [(spline[1].x - spline[0].x) * progress + spline[0].x, (spline[1].y - spline[0].y) * progress + spline[0].y];
    const line3 = [(1 - spline[1].x) * progress + spline[1].x, (1 - spline[1].y) * progress + spline[1].y];

    const line4 = [(line2[0] - line1[0]) * progress + line1[0], (line2[1] - line1[1]) * progress + line1[1]];
    const line5 = [(line3[0] - line2[0]) * progress + line2[0], (line3[1] - line2[1]) * progress + line2[1]];

    const lineY = (line5[1] - line4[1]) * progress + line4[1];
    return lineY;
}

function bezierEase(progress, spline) {
    // binary search?
    let low = 0,
        high = 1,
        t = progress;
    for (let i = 0; i < 10; i++) {
        const x = bezierEaseX(t, spline);
        if (Math.abs(x - progress) < 0.001) break;

        if (x < progress) low = t;
        else high = t;

        t = (low + high) / 2;
    }

    return bezierEaseY(t, spline);
}
