<script>
	import { onMount } from 'svelte';

	/** @type {HTMLCanvasElement | null} */
	let canvas = null;

	// --- DEFINICIONES DE CLASES EN EL NIVEL SUPERIOR (PERF_AVOID_NESTED_CLASS FIX) ---
	const petalColors = [
		{ r: 244, g: 114, b: 182 }, // Rosa suave
		{ r: 251, g: 113, b: 133 }, // Rosa coral
		{ r: 216, g: 180, b: 254 }, // Lila pastel
		{ r: 255, g: 255, b: 255 }, // Blanco pétalo
		{ r: 249, g: 168, b: 212 }  // Rosa pétalo
	];

	class Petal {
		/**
		 * @param {number} width
		 * @param {number} height
		 * @param {boolean} [initialY]
		 */
		constructor(width, height, initialY = false) {
			this.x = 0;
			this.y = 0;
			this.size = 0;
			this.speedY = 0;
			this.speedX = 0;
			this.oscillationSpeed = 0;
			this.oscillationDistance = 0;
			this.angle = 0;
			this.angleSpeed = 0;
			this.flip = 0;
			this.flipSpeed = 0;
			this.color = petalColors[0];
			this.alpha = 0.5;
			this.reset(width, height, initialY);
		}

		/**
		 * @param {number} width
		 * @param {number} height
		 * @param {boolean} [initialY]
		 */
		reset(width, height, initialY = false) {
			this.x = Math.random() * width;
			this.y = initialY ? Math.random() * height : -30;
			this.size = Math.random() * 9 + 8; // 8 - 17px
			this.speedY = Math.random() * 1.2 + 0.8;
			this.speedX = Math.random() * 0.8 - 0.2;
			this.oscillationSpeed = Math.random() * 0.025 + 0.015;
			this.oscillationDistance = Math.random() * 1.5 + 0.5;
			this.angle = Math.random() * 360;
			this.angleSpeed = Math.random() * 1.2 - 0.6;
			this.flip = Math.random() * 360;
			this.flipSpeed = Math.random() * 1.5 + 0.8;
			this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
			this.alpha = Math.random() * 0.45 + 0.45;
		}

		/**
		 * @param {number} width
		 * @param {number} height
		 */
		update(width, height) {
			this.y += this.speedY;
			this.x += Math.sin(this.y * this.oscillationSpeed) * this.oscillationDistance + this.speedX;
			this.angle += this.angleSpeed;
			this.flip += this.flipSpeed;

			if (this.y > height + 30 || this.x < -40 || this.x > width + 40) {
				this.reset(width, height, false);
			}
		}

		/**
		 * @param {CanvasRenderingContext2D} ctx
		 */
		draw(ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate((this.angle * Math.PI) / 180);
			const scaleY = Math.cos((this.flip * Math.PI) / 180);
			ctx.scale(1, scaleY);

			ctx.beginPath();
			ctx.moveTo(0, -this.size);
			ctx.bezierCurveTo(this.size * 0.9, -this.size * 0.6, this.size * 0.8, this.size * 0.7, 0, this.size);
			ctx.bezierCurveTo(-this.size * 0.8, this.size * 0.7, -this.size * 0.9, -this.size * 0.6, 0, -this.size);

			const gradient = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
			gradient.addColorStop(0, `rgba(${this.color.r + 20}, ${this.color.g + 20}, ${this.color.b + 20}, ${this.alpha})`);
			gradient.addColorStop(0.8, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.9})`);
			gradient.addColorStop(1, `rgba(${this.color.r - 20}, ${this.color.g - 20}, ${this.color.b - 20}, ${this.alpha * 0.7})`);

			ctx.fillStyle = gradient;
			ctx.fill();
			ctx.restore();
		}
	}

	const butterflyThemes = [
		{ wingColor: '#ffffff', accentColor: '#c084fc', edgeColor: '#7c3aed' }, // Blanca y violeta
		{ wingColor: '#fbcfe8', accentColor: '#f472b6', edgeColor: '#db2777' }, // Rosa floral
		{ wingColor: '#cffafe', accentColor: '#38bdf8', edgeColor: '#0284c7' }  // Celeste agua
	];

	class Butterfly {
		/**
		 * @param {number} width
		 * @param {number} height
		 */
		constructor(width, height) {
			this.x = 0;
			this.y = 0;
			this.size = 14;
			this.vx = 1;
			this.vy = 0;
			this.targetVx = 1;
			this.targetVy = 0;
			this.wingAngle = 0;
			this.wingSpeed = 0.2;
			this.theme = butterflyThemes[0];
			this.changeTimer = 60;
			this.reset(width, height, true);
		}

		/**
		 * @param {number} width
		 * @param {number} height
		 * @param {boolean} [initial]
		 */
		reset(width, height, initial = false) {
			this.x = initial ? Math.random() * width : Math.random() < 0.5 ? -40 : width + 40;
			this.y = Math.random() * (height * 0.85);
			this.size = Math.random() * 7 + 14;
			this.vx = (Math.random() * 1.5 + 0.8) * (Math.random() < 0.5 ? 1 : -1);
			this.vy = (Math.random() * 1.2 - 0.6);
			this.targetVx = this.vx;
			this.targetVy = this.vy;
			this.wingAngle = 0;
			this.wingSpeed = Math.random() * 0.22 + 0.18;
			this.theme = butterflyThemes[Math.floor(Math.random() * butterflyThemes.length)];
			this.changeTimer = Math.floor(Math.random() * 80 + 60);
		}

		/**
		 * @param {number} width
		 * @param {number} height
		 */
		update(width, height) {
			this.changeTimer--;
			if (this.changeTimer <= 0) {
				this.targetVx = (Math.random() * 1.8 + 0.6) * (Math.random() < 0.5 ? 1 : -1);
				this.targetVy = Math.random() * 1.4 - 0.7;
				this.changeTimer = Math.floor(Math.random() * 120 + 70);
			}

			this.vx += (this.targetVx - this.vx) * 0.03;
			this.vy += (this.targetVy - this.vy) * 0.03;

			this.x += this.vx;
			this.y += this.vy;
			this.wingAngle += this.wingSpeed;

			if (this.x < -80 || this.x > width + 80 || this.y < -80 || this.y > height + 80) {
				this.reset(width, height, false);
			}
		}

		/**
		 * @param {CanvasRenderingContext2D} ctx
		 */
		draw(ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);

			const flyAngle = Math.atan2(this.vy, this.vx);
			ctx.rotate(flyAngle + Math.PI / 2);

			const wingScale = Math.sin(this.wingAngle);

			ctx.fillStyle = '#4c1d95';
			ctx.beginPath();
			ctx.ellipse(0, 0, 1.8, this.size * 0.45, 0, 0, Math.PI * 2);
			ctx.fill();

			ctx.strokeStyle = '#5b21b6';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(-1, -this.size * 0.4);
			ctx.quadraticCurveTo(-4, -this.size * 0.7, -5, -this.size * 0.8);
			ctx.moveTo(1, -this.size * 0.4);
			ctx.quadraticCurveTo(4, -this.size * 0.7, 5, -this.size * 0.8);
			ctx.stroke();

			[-1, 1].forEach((side) => {
				ctx.save();
				ctx.scale(side * Math.abs(wingScale), 1);

				ctx.beginPath();
				ctx.moveTo(1, -2);
				ctx.bezierCurveTo(this.size * 0.7, -this.size * 1.1, this.size * 1.5, -this.size * 0.5, this.size * 1.3, this.size * 0.1);
				ctx.bezierCurveTo(this.size * 1.1, this.size * 0.4, this.size * 0.4, this.size * 0.3, 1, 2);
				ctx.fillStyle = this.theme.wingColor;
				ctx.globalAlpha = 0.88;
				ctx.fill();
				ctx.strokeStyle = this.theme.edgeColor;
				ctx.lineWidth = 0.8;
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(2, -1);
				ctx.bezierCurveTo(this.size * 0.4, -this.size * 0.6, this.size * 0.8, -this.size * 0.3, this.size * 0.6, 0);
				ctx.fillStyle = this.theme.accentColor;
				ctx.globalAlpha = 0.55;
				ctx.fill();

				ctx.beginPath();
				ctx.moveTo(1, 1);
				ctx.bezierCurveTo(this.size * 0.7, this.size * 0.4, this.size * 0.9, this.size * 0.8, this.size * 0.5, this.size * 1.1);
				ctx.bezierCurveTo(this.size * 0.2, this.size * 1.2, 0, this.size * 0.7, 0, 2);
				ctx.fillStyle = this.theme.wingColor;
				ctx.globalAlpha = 0.85;
				ctx.fill();
				ctx.strokeStyle = this.theme.edgeColor;
				ctx.lineWidth = 0.7;
				ctx.stroke();

				ctx.restore();
			});

			ctx.restore();
		}
	}

	onMount(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		/** @type {number} */
		let animationId;
		let width = (canvas.width = window.innerWidth);
		let height = (canvas.height = window.innerHeight);

		const handleResize = () => {
			if (!canvas) return;
			width = canvas.width = window.innerWidth;
			height = canvas.height = window.innerHeight;
		};
		window.addEventListener('resize', handleResize);

		const totalPetals = 45;
		/** @type {Petal[]} */
		const petals = [];

		const totalButterflies = 6;
		/** @type {Butterfly[]} */
		const butterflies = [];

		for (let i = 0; i < totalPetals; i++) {
			petals.push(new Petal(width, height, true));
		}
		for (let i = 0; i < totalButterflies; i++) {
			butterflies.push(new Butterfly(width, height));
		}

		function render() {
			if (!ctx) return;
			ctx.clearRect(0, 0, width, height);

			for (let p of petals) {
				p.update(width, height);
				p.draw(ctx);
			}

			for (let b of butterflies) {
				b.update(width, height);
				b.draw(ctx);
			}

			animationId = requestAnimationFrame(render);
		}

		/**
		 * @param {PointerEvent | MouseEvent | TouchEvent} e
		 */
		const handlePointerDown = (e) => {
			const clientX = 'clientX' in e ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : width / 2);
			const clientY = 'clientY' in e ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : height / 2);
			const newB = new Butterfly(width, height);
			newB.x = clientX;
			newB.y = clientY;
			newB.vx = (Math.random() - 0.5) * 3;
			newB.vy = -Math.random() * 2.5 - 1.5;
			newB.targetVx = newB.vx;
			newB.targetVy = newB.vy;
			butterflies.push(newB);
			if (butterflies.length > 15) {
				butterflies.shift();
			}
		};
		window.addEventListener('pointerdown', handlePointerDown);

		render();

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('pointerdown', handlePointerDown);
			if (animationId) cancelAnimationFrame(animationId);
		};
	});
</script>

<canvas bind:this={canvas} class="nature-canvas"></canvas>

<style>
	.nature-canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 1;
	}
</style>
