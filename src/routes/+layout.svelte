<script>
	import "../app.css";
	import { isRTL } from "$lib/stores/i18nStore.js";
	import BottomNav from "$lib/components/BottomNav.svelte";
	import { page } from "$app/stores";

	let { children } = $props();

	// Define routes where BottomNav should NOT appear
	const hideNavRoutes = ["/login", "/register", "/forgot-password"];

	// Check if current path matches any hidden route
	let showNav = $derived(
		!hideNavRoutes.some((route) => $page.url.pathname.startsWith(route)),
	);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<div dir={$isRTL ? "rtl" : "ltr"} class="min-h-screen bg-background relative">
	{@render children()}

	{#if showNav}
		<div class="h-20"></div>
		<!-- Spacer for BottomNav -->
		<BottomNav />
	{/if}
</div>
