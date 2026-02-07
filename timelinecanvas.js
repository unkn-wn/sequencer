export class TimelineCanvas extends HTMLElement {
	scale;

	constructor() {
		super();

		this.setAttribute('id', 'sequencer-timeline-canvas');

		this.width = this.getAttribute('width') || 500;
		this.height = this.getAttribute('height') || 500;

		const ratio = this.getAttribute('ratio');
		if (ratio !== null) {
			if (ratio.includes('/')) {
				const [num, den] = ratio.split('/').map(Number);
				this.ratio = num / den;
			} else {
				this.ratio = parseFloat(ratio);
			}
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;
			if (screenWidth / screenHeight > this.ratio) {
				this.height = screenHeight;
				this.width = screenHeight * this.ratio;
			} else {
				this.width = screenWidth;
				this.height = screenWidth / this.ratio;
			}
		}

		if (this.getAttribute('border')) {
			this.style.border = '1px solid white';
		}
		this.style.width = this.width + 'px';
		this.style.height = this.height + 'px';

		this.style.position = 'absolute';
		this.style.left = '50%';
		this.style.top = '50%';
		this.style.overflow = 'hidden';

		this.resize = this.resize.bind(this);
	}

	connectedCallback() {
		for (const child of this.children) {
			child.style.position = 'absolute';
			child.style.top = '50%';
			child.style.left = '50%';
			child.style.transform = 'translate(-50%, -50%)';
		}

		this.resize();
		window.addEventListener('resize', () => this.resize());
		this.addEventListener('click', this.handleClick);
	}

	disconnectedCallback() {
		window.removeEventListener('resize', this.resize);
	}

	handleClick = (e) => {
		// deselect everything when clicking bg
		if (e.target === this) {
			this.deselectAll();
		}
	};

	deselectAll = () => {
		if (window.sequencerEditor) {
			window.sequencerEditor.selectElement(null);
		}
	};

	resize() {
		const screenX = window.innerWidth;
		const screenY = window.innerHeight;

		if (screenX > this.width && screenY > this.height) return;

		const scaleX = screenX / this.width;
		const scaleY = screenY / this.height;
		const scale = Math.min(scaleX, scaleY) - 0.005;
		this.scale = scale;

		this.style.transform = `translate(-50%, -50%) scale(${scale})`;
	}
}

customElements.define('timeline-canvas', TimelineCanvas);
