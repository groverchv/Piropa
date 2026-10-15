// Generador Sonoro Generativo Infinito (Música Ambiental Procedural)
// - No tiene bucle predeterminado: cada segundo se genera en tiempo real con variaciones aleatorias guiadas.
// - Cero monotonía: Los intervalos de tiempo fluctúan orgánicamente (como gotas o viento).
// - Progresión de 'colores de luz' armónicos (Luminoso, Íntimo, Celestial, Sereno).
// - Perfectamente armónico: Todas las combinaciones posibles suenan consonantes y preciosas si varios móviles suenan juntos.

class AmbientSoundtrack {
	constructor() {
		/** @type {AudioContext | null} */
		this.ctx = null;
		this.isPlaying = false;
		/** @type {any} */
		this.timer = null;

		// Familias armónicas complementarias (Pentatónicas puras mayores y con 9nas dulces)
		this.harmonyPalettes = [
			// Color 1: Claridad y Luz (Re Lidio/Mayor)
			[146.83, 220.00, 293.66, 369.99, 440.00, 587.33, 739.99],
			// Color 2: Ternura y Abrazo (Sol Mayor con 9na)
			[196.00, 246.94, 293.66, 392.00, 440.00, 587.33, 659.25],
			// Color 3: Paz Profunda (La Mayor / Do#)
			[220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 880.00],
			// Color 4: Serenidad y Gratitud (Si menor 7 dulce / Re)
			[123.47, 220.00, 293.66, 369.99, 440.00, 587.33, 659.25]
		];

		this.currentPaletteIndex = 0;
		this.phraseCounter = 0;
		/** @type {number[]} */
		this.lastPlayedNotes = [];
	}

	init() {
		if (!this.ctx) {
			const AudioContextClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
			this.ctx = new AudioContextClass();
		}
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume();
		}
	}

	/**
	 * Tono etéreo con doble capa senoidal y micro-modulación de fase
	 * @param {number} freq
	 * @param {number} time
	 * @param {number} [duration]
	 * @param {number} [volume]
	 */
	playGenerativeTone(freq, time, duration = 7.0, volume = 0.022) {
		if (!this.ctx) return;

		// Oscilador 1
		const osc1 = this.ctx.createOscillator();
		const gain1 = this.ctx.createGain();
		osc1.type = 'sine';
		osc1.frequency.setValueAtTime(freq, time);

		// Oscilador 2 ligeramente desafinado (0.6Hz) para calidez de coro
		const osc2 = this.ctx.createOscillator();
		const gain2 = this.ctx.createGain();
		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(freq * 1.0018, time);

		// Ataque gradual como seda (1.5s) y caída lenta
		gain1.gain.setValueAtTime(0.00001, time);
		gain1.gain.exponentialRampToValueAtTime(volume * 0.7, time + 1.4);
		gain1.gain.exponentialRampToValueAtTime(0.00001, time + duration);

		gain2.gain.setValueAtTime(0.00001, time);
		gain2.gain.exponentialRampToValueAtTime(volume * 0.35, time + 1.8);
		gain2.gain.exponentialRampToValueAtTime(0.00001, time + duration);

		osc1.connect(gain1);
		gain1.connect(this.ctx.destination);
		osc2.connect(gain2);
		gain2.connect(this.ctx.destination);

		osc1.start(time);
		osc1.stop(time + duration);
		osc2.start(time);
		osc2.stop(time + duration);
	}

	/**
	 * Campana celestial sutil y aislada
	 * @param {number} freq
	 * @param {number} time
	 * @param {number} [volume]
	 */
	playCelestialBell(freq, time, volume = 0.015) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, time);

		gain.gain.setValueAtTime(0.0001, time);
		gain.gain.linearRampToValueAtTime(volume, time + 0.08);
		gain.gain.exponentialRampToValueAtTime(0.00001, time + 3.8);

		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start(time);
		osc.stop(time + 3.8);
	}

	start() {
		this.init();
		if (this.isPlaying) return;
		this.isPlaying = true;

		// Algoritmo generativo infinito: cada paso es impredecible pero siempre armonioso
		const runGenerativeLoop = () => {
			if (!this.isPlaying || !this.ctx) return;
			const now = this.ctx.currentTime;

			// Cambiar la paleta armónica cada 3 o 4 frases para que el ambiente evolucione como un paisaje vivo
			if (this.phraseCounter % 4 === 0 && Math.random() > 0.3) {
				this.currentPaletteIndex = (this.currentPaletteIndex + 1 + Math.floor(Math.random() * 2)) % this.harmonyPalettes.length;
			}
			const palette = this.harmonyPalettes[this.currentPaletteIndex];

			// 1. Tocar un bajo profundo y cálido de forma espaciada
			if (Math.random() > 0.4) {
				const rootBass = palette[0];
				this.playGenerativeTone(rootBass, now, 8.5, 0.024);
			}

			// 2. Elegir 1 o 2 notas medias aleatorias que no se hayan repetido recientemente
			const availableNotes = palette.slice(1).filter(n => !this.lastPlayedNotes.includes(n));
			const selectedNote1 = availableNotes[Math.floor(Math.random() * availableNotes.length)] || palette[2];
			
			const noteDelay1 = Math.random() * 0.8 + 0.2;
			const noteDuration1 = Math.random() * 2.5 + 5.5;
			this.playGenerativeTone(selectedNote1, now + noteDelay1, noteDuration1, 0.02);

			if (Math.random() > 0.45) {
				const selectedNote2 = palette[Math.floor(Math.random() * (palette.length - 2)) + 2];
				const noteDelay2 = noteDelay1 + Math.random() * 1.8 + 1.2;
				this.playGenerativeTone(selectedNote2, now + noteDelay2, noteDuration1 * 0.9, 0.016);
			}

			// 3. Ocasionalmente, un destello de campana aguda espontáneo
			if (Math.random() > 0.55) {
				const highNote = palette[palette.length - 1] * (Math.random() > 0.5 ? 1 : 1.5);
				this.playCelestialBell(highNote, now + Math.random() * 2.2 + 0.6, 0.014);
			}

			// Actualizar memoria para evitar repetición
			this.lastPlayedNotes = [selectedNote1];
			this.phraseCounter++;

			// Tiempo entre eventos completamente variable (entre 3.6s y 5.8s) para romper cualquier métrica rígida
			const nextIntervalMs = Math.floor(Math.random() * 2200) + 3600;
			this.timer = setTimeout(runGenerativeLoop, nextIntervalMs);
		};

		runGenerativeLoop();
	}

	// Efecto de sonido físico al tocar el sello de cera / pergamino
	playWaxSealCrack() {
		this.init();
		if (!this.ctx) return;
		const now = this.ctx.currentTime;

		// Sonido de crujido de lacre rompiéndose
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = 'triangle';
		osc.frequency.setValueAtTime(120, now);
		osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

		gain.gain.setValueAtTime(0.08, now);
		gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

		osc.connect(gain);
		gain.connect(this.ctx.destination);

		osc.start(now);
		osc.stop(now + 0.22);

		// Campana de brillo cristalino armónica que acompaña la apertura
		setTimeout(() => {
			if (!this.ctx) return;
			const t = this.ctx.currentTime;
			[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
				this.playCelestialBell(f, t + i * 0.08, 0.02);
			});
		}, 60);
	}

	stop() {
		this.isPlaying = false;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	}

	toggle() {
		if (this.isPlaying) {
			this.stop();
			return false;
		} else {
			this.start();
			return true;
		}
	}
}

export const ambientMusic = new AmbientSoundtrack();


