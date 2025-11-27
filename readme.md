1. if you want to rotate around an origin, translate the object, then rotate, then translate away after a couple ms
2. if rotate in place, translate, then rotate after a couple ms
3. when flashing objects like scaling up and down in 1 ms, make sure to keep around 5 ms or more in between
4. timeline.anim(circ2).at(2800).for(500).spline(ease.smooth).type(["translateX", "translateY"]).to(0);. you can use multiple types in array or a single string as the type. there is fromTo(start, end), to(end), and by(delta). there is also place(x, y) to place an object at a certain time.
5. at(), for() (except when using place() and set()), and type() (except for place()) are required. default spline is linear.
6. use then() to chain animations after one another
7. background can be set with timeline.background().at(ms).set(hex/rgba)
8. element's background-color can be set with .type('color').set() or .fromTo()
9. audio can be added with timeline.audio(file) - can use at(), for(), spline(), play(), pause(), volume(val)
10. timelinecanvas can use width and height, or just set ratio attribute to some string ex "16/9"