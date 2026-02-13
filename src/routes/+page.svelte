<script>
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(() => {
        goto("/dashboard");
    });
</script>

<div class="min-h-screen bg-background flex items-center justify-center">
    <div class="animate-pulse text-muted-foreground text-sm">Loading...</div>
</div>
