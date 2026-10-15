<script>
	import { onMount, onDestroy } from 'svelte';
	import confetti from 'canvas-confetti';
	import { toPng } from 'html-to-image';
	import { ambientMusic } from '#lib/ambientMusic.js';

	let sobreAbierto = $state(false);
	let abriendoSobre = $state(false);
	let cargando = $state(false);
	let showMensaje = $state(false);
	let showVersiculo = $state(false);
	let guardandoImagen = $state(false);
	/** @type {HTMLElement | null} */
	let postalRef = $state(null);
	/** @type {{ titulo?: string, pregunta?: string, mensaje: string, versiculo: string, cita: string } | null} */
	let mensajeData = $state(null);
	let copiado = $state(false);
	let musicaActiva = $state(false);

	onMount(() => {
		// Pre-cargar el mensaje para que esté listo al abrir el sobre
		cargarMensaje();

		// Iniciar música automáticamente siempre
		intentarIniciarMusica();

		// Los navegadores modernos bloquean el audio si no hubo interacción previa.
		const desbloquearAudio = () => {
			if (!musicaActiva) {
				ambientMusic.start();
				musicaActiva = true;
			}
			window.removeEventListener('pointerdown', desbloquearAudio);
			window.removeEventListener('click', desbloquearAudio);
			window.removeEventListener('keydown', desbloquearAudio);
			window.removeEventListener('touchstart', desbloquearAudio);
		};

		window.addEventListener('pointerdown', desbloquearAudio);
		window.addEventListener('click', desbloquearAudio);
		window.addEventListener('keydown', desbloquearAudio);
		window.addEventListener('touchstart', desbloquearAudio);
	});

	onDestroy(() => {
		ambientMusic.stop();
	});

	function intentarIniciarMusica() {
		ambientMusic.start();
		musicaActiva = true;
	}

	async function cargarMensaje() {
		try {
			const res = await fetch('/api/generar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nombre: 'Amada Mujer', tono: 'virtuosa' })
			});
			mensajeData = await res.json();
		} catch (e) {
			console.error('Error precargando mensaje:', e);
		}
	}

	function alternarMusica() {
		musicaActiva = ambientMusic.toggle();
	}

	// Respuesta háptica en dispositivos móviles (vibración sutil)
	/**
	 * @param {number | number[]} patron
	 */
	function vibrar(patron) {
		try {
			if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
				navigator.vibrate(patron);
			}
		} catch (_) {}
	}

	async function abrirCarta() {
		if (abriendoSobre || sobreAbierto) return;
		abriendoSobre = true;
		showMensaje = false;
		showVersiculo = false;

		// Sonido físico de lacre / crujido de pergamino
		ambientMusic.playWaxSealCrack();

		// Micropulso háptico al romper el sello de cera
		vibrar([35, 60, 45]);

		// Asegurar que la música esté siempre encendida
		if (!musicaActiva) {
			ambientMusic.start();
			musicaActiva = true;
		}

		// Tiempo para que la solapa se levante en 3D y la carta emerja deslizándose desde adentro
		setTimeout(() => {
			sobreAbierto = true;
			abriendoSobre = false;

			// Confeti de celebración en el clímax de la apertura
			confetti({
				particleCount: 75,
				spread: 85,
				origin: { y: 0.55 },
				colors: ['#c4b5fd', '#67e8f9', '#f472b6', '#ffffff', '#fb7185', '#fef08a']
			});

			// A los 10 segundos: revelar el mensaje lentamente de invisible a visible
			setTimeout(() => {
				showMensaje = true;
				// Vibración sutil de acompañamiento al aparecer el mensaje
				vibrar(25);

				// Luego pasan 10 segundos más (a los 20 segundos total): revelar el versículo
				setTimeout(() => {
					showVersiculo = true;
					// Doble micropulso celestial al concluir con el versículo
					vibrar([30, 80, 40]);
					confetti({
						particleCount: 35,
						spread: 70,
						origin: { y: 0.7 },
						colors: ['#c4b5fd', '#f472b6', '#fef08a']
					});
				}, 10000);
			}, 10000);
		}, 1400);
	}

	async function descargarPostal() {
		if (!postalRef || guardandoImagen) return;
		guardandoImagen = true;
		vibrar(30);

		try {
			const dataUrl = await toPng(postalRef, {
				cacheBust: true,
				quality: 1,
				pixelRatio: 3,
				backgroundColor: '#fffdfa',
				filter: (node) => {
					// Filtrar cualquier botón o elemento interactivo por precaución
					return !(node instanceof HTMLElement && node.classList.contains('save-postal-btn'));
				}
			});

			const enlace = document.createElement('a');
			enlace.download = `Elogio_Bendicion_${new Date().toISOString().slice(0, 10)}.png`;
			enlace.href = dataUrl;
			enlace.click();

			confetti({
				particleCount: 45,
				spread: 60,
				origin: { y: 0.8 },
				colors: ['#fb7185', '#c4b5fd', '#fef08a']
			});
		} catch (err) {
			console.error('Error guardando la postal:', err);
		} finally {
			guardandoImagen = false;
		}
	}

	async function generarOtra() {
		cargando = true;
		try {
			const res = await fetch('/api/generar', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nombre: 'Amada Mujer', tono: 'virtuosa' })
			});
			mensajeData = await res.json();

			confetti({
				particleCount: 50,
				spread: 70,
				origin: { y: 0.6 },
				colors: ['#c4b5fd', '#67e8f9', '#f472b6', '#ffffff']
			});
		} catch (e) {
			console.error(e);
		} finally {
			cargando = false;
		}
	}

	function compartirWhatsApp() {
		if (!mensajeData) return;
		const texto = `🌸 *Elogios de Gracia* 🌸\n\n"${mensajeData.mensaje}"\n\n📖 *${mensajeData.versiculo}*: "${mensajeData.cita}"\n\n✨ Para una mujer virtuosa ✨`;
		window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
	}

	function copiarMensaje() {
		if (!mensajeData) return;
		const texto = `"${mensajeData.mensaje}" — ${mensajeData.versiculo}: "${mensajeData.cita}"`;
		navigator.clipboard.writeText(texto);
		copiado = true;
		setTimeout(() => { copiado = false; }, 2500);
	}
</script>

<div class="envelope-experience-viewport">
	<main class="content-container">
		{#if !sobreAbierto}
			<!-- SOBRE CERRADO CON EFECTO REALISTA 3D -->
			<div class="envelope-wrapper {abriendoSobre ? 'opening' : ''}">
				<div class="envelope-outer" onclick={abrirCarta} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && abrirCarta()}>
					<!-- Fondo interior del sobre -->
					<div class="envelope-interior"></div>

					<!-- Carta de papel deslizándose desde el interior del sobre hacia arriba -->
					<div class="envelope-letter-paper">
						<div class="paper-preview-line line-1"></div>
						<div class="paper-preview-line line-2"></div>
						<div class="paper-preview-line line-3"></div>
					</div>

					<!-- Bolsillo frontal del sobre -->
					<div class="envelope-pocket"></div>

					<!-- Solapa superior con perspectiva 3D -->
					<div class="envelope-flap"></div>

					<!-- Sello de cera dorada interactivo -->
					<div class="wax-seal">
						<div class="wax-seal-inner">
							<span class="seal-symbol">🕊️</span>
						</div>
						<div class="seal-glow"></div>
					</div>
				</div>

				<p class="envelope-hint">
					<svg class="hint-sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
					</svg>
					<span>Toca el sobre para abrir tu carta</span>
					<svg class="hint-sparkle-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
					</svg>
				</p>
			</div>
		{:else}
			<!-- CARTA ABIERTA Y REVELADA -->
			<section class="reveal-section">
				{#if cargando}
					<div class="loading-card">
						<div class="spinner"></div>
						<p>Inspirando una nueva bendición...</p>
					</div>
				{:else if mensajeData}
					<div class="postal-card letter-open-anim" bind:this={postalRef}>
						<div class="letter-top-glow">✦ ✧ ✦</div>
						
						{#if mensajeData.pregunta}
							<!-- Pregunta profunda que sale directo -->
							<div class="reflection-question-box">
								<p class="reflection-question">
									"{mensajeData.pregunta}"
								</p>
							</div>
						{/if}

						{#if !showMensaje}
							<!-- Indicador de respiración suave durante los 10 segundos -->
							<div class="reflection-breathing-guide">
								<span class="breathing-dot"></span>
								<span class="breathing-text">Tómate un instante para sentirlo...</span>
							</div>
						{/if}

						{#if showMensaje}
							<!-- Mensaje que aparece a los 10 segundos -->
							<p class="postal-message fade-in-section">
								{mensajeData.mensaje}
							</p>
						{/if}

						{#if showVersiculo}
							<!-- Versículo que aparece 10 segundos después -->
							<div class="postal-divider fade-in-section"></div>

							<div class="postal-verse-box fade-in-section">
								<div class="postal-verse-ref">
									<svg class="mini-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
										<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
									</svg>
									<span>{mensajeData.versiculo}</span>
								</div>
								<div class="postal-verse-quote">«{mensajeData.cita}»</div>
							</div>

							<!-- Toque de bendición final dorada y sutil -->
							<p class="postal-blessing-footer fade-in-section">
								<span>✦ Guardada en gracia y bendición eterna ✦</span>
							</p>
						{/if}
					</div>

					{#if showVersiculo}
						<!-- Botón elegante y sutil colocado fuera de la tarjeta para que la imagen quede 100% limpia -->
						<div class="postal-actions-wrapper fade-in-section">
							<button class="save-postal-btn" onclick={descargarPostal} disabled={guardandoImagen}>
								{#if guardandoImagen}
									<span>Guardando en tu galería...</span>
								{:else}
									<svg class="mini-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
										<polyline points="7 10 12 15 17 10"/>
										<line x1="12" y1="15" x2="12" y2="3"/>
									</svg>
									<span>Guardar esta postal en mi celular</span>
								{/if}
							</button>
						</div>
					{/if}
				{/if}
			</section>
		{/if}
	</main>
</div>

<style>
	.envelope-experience-viewport {
		min-height: 100dvh;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1.2rem 1rem 3.5rem;
		position: relative;
		overflow-x: hidden;
		background: transparent;
		box-sizing: border-box;
	}

	.content-container {
		max-width: 500px;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		z-index: 2;
		margin: auto 0;
	}



	/* SOBRE DE CARTA ESTÉTICO */
	.envelope-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		cursor: pointer;
		animation: pulseCard 3s ease-in-out infinite alternate;
	}
	@keyframes pulseCard {
		from { transform: translateY(0); }
		to { transform: translateY(-6px); }
	}

	.envelope-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
		cursor: pointer;
		perspective: 1200px;
		animation: pulseCard 3.5s ease-in-out infinite alternate;
	}
	@keyframes pulseCard {
		from { transform: translateY(0); }
		to { transform: translateY(-6px); }
	}

	.envelope-outer {
		position: relative;
		width: min(90vw, 400px);
		height: clamp(220px, 58vw, 260px);
		border-radius: 24px;
		perspective: 1000px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 25px 60px rgba(91, 33, 182, 0.22), 0 0 35px rgba(244, 114, 182, 0.25);
	}
	.envelope-outer:hover {
		transform: scale(1.02);
	}

	/* Fondo interior del sobre (cavidad) */
	.envelope-interior {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%);
		border-radius: 24px;
		box-shadow: inset 0 10px 30px rgba(76, 29, 149, 0.4);
		z-index: 1;
	}

	/* Papel que se desliza desde dentro del sobre */
	.envelope-letter-paper {
		position: absolute;
		width: 86%;
		height: 82%;
		background: #ffffff;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
		z-index: 2;
		top: 10%;
		display: flex;
		flex-direction: column;
		padding: 1.2rem;
		box-sizing: border-box;
		gap: 0.6rem;
		transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.paper-preview-line {
		height: 8px;
		border-radius: 4px;
		background: #ede9fe;
	}
	.paper-preview-line.line-1 { width: 45%; background: #c4b5fd; }
	.paper-preview-line.line-2 { width: 85%; }
	.paper-preview-line.line-3 { width: 70%; }

	/* Bolsillo frontal del sobre */
	.envelope-pocket {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100%;
		background: linear-gradient(0deg, #ffffff 0%, #f5f3ff 60%, #ede9fe 100%);
		clip-path: polygon(0 100%, 100% 100%, 100% 35%, 50% 62%, 0 35%);
		border-radius: 24px;
		z-index: 3;
		box-shadow: 0 -4px 15px rgba(91, 33, 182, 0.08);
	}

	/* Solapa superior del sobre con bisagra 3D */
	.envelope-flap {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 140px;
		background: linear-gradient(180deg, #ede9fe 0%, #ddd6fe 100%);
		clip-path: polygon(0 0, 100% 0, 50% 100%);
		transform-origin: top center;
		transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.2s 0.35s;
		z-index: 5;
		filter: drop-shadow(0 4px 8px rgba(91, 33, 182, 0.15));
	}

	/* Sello de cera dorada */
	.wax-seal {
		position: absolute;
		top: 135px;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 76px;
		height: 76px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fde047 0%, #eab308 50%, #ca8a04 100%);
		box-shadow: 0 8px 24px rgba(202, 138, 4, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 6;
		border: 3px solid #fef08a;
		transition: transform 0.4s ease, opacity 0.4s ease;
	}
	.wax-seal-inner {
		width: 54px;
		height: 54px;
		border-radius: 50%;
		border: 1.5px dashed rgba(113, 63, 18, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: #78350f;
	}
	.seal-symbol {
		font-size: 1.6rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
	}
	.seal-glow {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(254, 240, 138, 0.5) 0%, transparent 70%);
		animation: pulseGlow 2s ease-in-out infinite alternate;
	}

	/* --- ANIMACIÓN REALISTA DE APERTURA AL TOCAR --- */
	.envelope-wrapper.opening .wax-seal {
		transform: translate(-50%, -50%) scale(1.3) rotate(15deg);
		opacity: 0;
		filter: blur(4px);
		transition: transform 0.45s ease-out, opacity 0.45s ease-out;
	}
	.envelope-wrapper.opening .envelope-flap {
		transform: rotateX(180deg);
		z-index: 1;
		transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s 0.3s;
	}
	.envelope-wrapper.opening .envelope-letter-paper {
		transform: translateY(-85%) scale(1.05);
		box-shadow: 0 20px 45px rgba(91, 33, 182, 0.25);
		transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.35s;
		z-index: 4;
	}
	.envelope-wrapper.opening .envelope-outer {
		animation: envelopeRecede 1.4s ease forwards;
	}
	@keyframes envelopeRecede {
		0% { transform: scale(1); opacity: 1; }
		65% { transform: scale(1.04) translateY(10px); opacity: 1; }
		100% { transform: scale(1.1) translateY(40px); opacity: 0; }
	}
	@keyframes pulseGlow {
		from { opacity: 0.4; transform: scale(0.95); }
		to { opacity: 0.9; transform: scale(1.1); }
	}

	.envelope-hint {
		font-size: 0.95rem;
		font-weight: 600;
		color: #5b21b6;
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.8);
		padding: 0.5rem 1.3rem;
		border-radius: 999px;
		box-shadow: 0 4px 16px rgba(91, 33, 182, 0.1);
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
	}
	.hint-sparkle-icon {
		width: 15px;
		height: 15px;
		color: #a855f7;
		flex-shrink: 0;
		animation: sparklePulse 1.8s ease-in-out infinite alternate;
	}
	@keyframes sparklePulse {
		from { transform: scale(0.9) rotate(0deg); opacity: 0.7; }
		to { transform: scale(1.15) rotate(15deg); opacity: 1; }
	}

	.mini-svg-icon {
		width: 17px;
		height: 17px;
		vertical-align: -2px;
		display: inline-block;
		margin-right: 0.35rem;
	}

	/* REVELACIÓN DE LA CARTA */
	.reveal-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
		width: 100%;
	}

	.letter-open-anim {
		animation: letterUnfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	@keyframes letterUnfold {
		0% { opacity: 0; transform: translateY(30px) scale(0.9); }
		100% { opacity: 1; transform: translateY(0) scale(1); }
	}

	.fade-in-section {
		animation: revealSlowFadeIn 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		will-change: opacity, transform;
	}
	@keyframes revealSlowFadeIn {
		0% {
			opacity: 0;
			transform: translateY(8px);
		}
		20% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.45;
		}
		80% {
			opacity: 0.85;
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.loading-card {
		background: rgba(255, 255, 255, 0.7);
		border-radius: 24px;
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		color: #5b21b6;
		font-style: italic;
	}

	.spinner {
		width: 44px;
		height: 44px;
		border: 3px solid rgba(139, 92, 246, 0.2);
		border-top-color: #8b5cf6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.postal-card {
		width: 100%;
		/* Fondo de pergamino de lujo iridiscente con brillo suave */
		background: linear-gradient(145deg, #ffffff 0%, #fff7ed 40%, #fdf4ff 80%, #f5f3ff 100%);
		border: 2px solid rgba(251, 191, 36, 0.45);
		border-radius: clamp(22px, 5vw, 32px);
		padding: clamp(1.6rem, 5vw, 2.6rem) clamp(1.2rem, 4vw, 2rem);
		text-align: center;
		/* Sombras elegantes con toque dorado y violeta */
		box-shadow: 
			0 20px 45px rgba(112, 26, 117, 0.12),
			0 4px 15px rgba(245, 158, 11, 0.15),
			inset 0 0 40px rgba(254, 243, 199, 0.4);
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
	}

	/* Borde decorativo interior tipo marco de pergamino fino */
	.postal-card::before {
		content: '';
		position: absolute;
		inset: 8px;
		border: 1px dashed rgba(217, 119, 6, 0.28);
		border-radius: clamp(16px, 4vw, 24px);
		pointer-events: none;
	}

	.letter-top-glow {
		color: #d97706;
		letter-spacing: 0.35em;
		font-size: 0.95rem;
		margin-bottom: 1.2rem;
		filter: drop-shadow(0 1px 2px rgba(217, 119, 6, 0.25));
	}

	.reflection-question-box {
		/* Tarjeta de pregunta con fondo cálido aperlado y acento rosado/ámbar */
		background: linear-gradient(135deg, #fef2f2 0%, #fffbeb 50%, #faf5ff 100%);
		border: 1.5px solid rgba(244, 114, 182, 0.35);
		border-radius: 18px;
		padding: 1.1rem 1.3rem;
		margin-bottom: 1.25rem;
		box-shadow: 0 4px 16px rgba(225, 29, 72, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.reflection-question {
		font-family: var(--font-serif);
		font-size: clamp(1.15rem, 3.5vw, 1.4rem);
		line-height: 1.45;
		color: #831843;
		font-style: italic;
		font-weight: 600;
	}

	.reflection-breathing-guide {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		margin: 0.8rem auto 1rem;
		padding: 0.45rem 1.1rem;
		border-radius: 999px;
		background: rgba(254, 242, 242, 0.8);
		border: 1px solid rgba(244, 114, 182, 0.3);
		animation: breathingPulse 3.5s ease-in-out infinite;
	}

	.breathing-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #ec4899;
		box-shadow: 0 0 8px #f472b6;
	}

	.breathing-text {
		font-size: 0.85rem;
		color: #9d174d;
		font-style: italic;
		letter-spacing: 0.02em;
		font-weight: 500;
	}

	@keyframes breathingPulse {
		0%, 100% {
			opacity: 0.55;
			transform: scale(0.97);
		}
		50% {
			opacity: 1;
			transform: scale(1.02);
		}
	}

	.postal-message {
		font-family: var(--font-serif);
		font-size: clamp(1.1rem, 3.2vw, 1.35rem);
		line-height: 1.55;
		color: #3b0764;
		margin-bottom: 1.25rem;
		font-weight: 500;
		text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
	}

	.postal-divider {
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.4), rgba(236, 72, 153, 0.4), transparent);
		margin: 1.2rem auto;
		width: 65%;
	}

	.postal-verse-box {
		/* Caja del versículo con fondo marfil enriquecido y borde dorado */
		background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fef3c7 100%);
		border: 1.5px solid rgba(217, 119, 6, 0.35);
		border-radius: 16px;
		padding: 1rem 1.25rem;
		margin: 0 auto;
		box-shadow: 0 6px 18px rgba(180, 83, 9, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.postal-verse-ref {
		font-weight: 700;
		color: #b45309;
		font-size: 0.92rem;
		margin-bottom: 0.3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		letter-spacing: 0.02em;
	}

	.postal-verse-quote {
		color: #451a03;
		font-size: 0.92rem;
		line-height: 1.45;
		font-style: italic;
		font-weight: 500;
	}

	.postal-blessing-footer {
		margin-top: 1.1rem;
		font-size: 0.82rem;
		color: #b45309;
		letter-spacing: 0.08em;
		font-weight: 600;
		text-transform: uppercase;
		opacity: 0.85;
	}

	/* Botón para guardar postal */
	.postal-actions-wrapper {
		margin-top: 1.25rem;
		display: flex;
		justify-content: center;
	}
	.save-postal-btn {
		background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
		color: #ffffff;
		border: none;
		border-radius: 999px;
		padding: 0.65rem 1.4rem;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 6px 20px rgba(236, 72, 153, 0.28);
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
		outline: none;
	}
	.save-postal-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
	}
	.save-postal-btn:active {
		transform: translateY(0);
	}

	/* Ajustes táctiles ultra-responsivos para móviles pequeños (iPhone SE / Galaxy) */
	@media (max-height: 700px) {
		.envelope-experience-viewport {
			padding: 0.8rem 0.8rem 1.2rem;
			justify-content: flex-start;
		}
		.postal-card {
			padding: 1.2rem 1rem;
		}
		.postal-message {
			font-size: 1.02rem;
			margin-bottom: 0.8rem;
		}
	}
</style>
