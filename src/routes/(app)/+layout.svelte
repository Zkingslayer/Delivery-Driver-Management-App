<script>
    import Header from "$lib/components/Header.svelte";

    let { children } = $props();
</script>

<div class="min-h-screen bg-background flex flex-col">
    <Header />
    <main class="flex-1 overflow-y-auto">
        {@render children()}
    </main>
</div>
