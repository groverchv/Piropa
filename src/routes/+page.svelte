<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	let qrDataUrl = $state('');

	onMount(async () => {
		const baseUrl = window.location.origin;
		const destinoUrl = `${baseUrl}/mensaje`;

		try {
			qrDataUrl = await QRCode.toDataURL(destinoUrl, {
				width: 520,
				margin: 1,
				color: {
					dark: '#581c87',
					light: '#ffffff'
				}
			});
		} catch (e) {
			console.error('Error generando QR', e);
		}
	});
</script>

<div class="qr-only-viewport">
	<div class="qr-container">
		{#if qrDataUrl}
			<div class="qr-card">
				<img src={qrDataUrl} alt="Escanear Código QR" class="qr-image" />
			</div>
		{:else}
			<div class="qr-loading"></div>
		{/if}

		<a href="/mensaje" class="next-step-btn">
			<span>Siguiente</span>
			<span class="arrow">➜</span>
		</a>
	</div>
</div>

<style>
	:global(body, html) {
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.qr-only-viewport {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		position: relative;
		overflow: hidden;
	}

	.qr-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2.2rem;
		z-index: 2;
	}

	.qr-card {
		background: rgba(255, 255, 255, 0.88);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		padding: 1.5rem;
		border-radius: 32px;
		border: 2px solid rgba(255, 255, 255, 0.95);
		box-shadow: 0 20px 50px rgba(91, 33, 182, 0.22), 0 0 35px rgba(103, 232, 249, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		animation: pulseGlow 4s ease-in-out infinite alternate;
	}

	@keyframes pulseGlow {
		from {
			box-shadow: 0 16px 40px rgba(91, 33, 182, 0.2), 0 0 30px rgba(103, 232, 249, 0.35);
		}
		to {
			box-shadow: 0 24px 60px rgba(91, 33, 182, 0.32), 0 0 55px rgba(244, 114, 182, 0.45);
		}
	}

	.qr-image {
		width: min(72vw, 68vh, 390px);
		height: min(72vw, 68vh, 390px);
		display: block;
		border-radius: 16px;
	}

	.next-step-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
		color: #ffffff;
		text-decoration: none;
		font-weight: 700;
		font-size: 1.15rem;
		letter-spacing: 0.03em;
		padding: 0.95rem 2.8rem;
		border-radius: 999px;
		border: 1.5px solid rgba(255, 255, 255, 0.5);
		box-shadow: 0 10px 25px rgba(139, 92, 246, 0.35);
		transition: all 0.25s ease;
	}

	.next-step-btn:hover {
		transform: translateY(-2px) scale(1.03);
		box-shadow: 0 14px 35px rgba(236, 72, 153, 0.5);
	}

	.arrow {
		font-size: 1.2rem;
		transition: transform 0.2s ease;
	}

	.next-step-btn:hover .arrow {
		transform: translateX(4px);
	}

	.qr-loading {
		width: 50px;
		height: 50px;
		border: 3px solid rgba(255, 255, 255, 0.4);
		border-top-color: #8b5cf6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
