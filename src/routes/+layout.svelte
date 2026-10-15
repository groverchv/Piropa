<script>
	import '../app.css';
	import NatureCanvas from '#lib/NatureCanvas.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#d8b4fe" />
</svelte:head>

<!-- Fondo vivo con caída infinita de pétalos y vuelo realista de mariposas -->
<NatureCanvas />

<main class="app-layout">
	{@render children()}
</main>

<style>
	.app-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 2;
	}
</style>
