<script>
    import Icon from "@iconify/svelte";
    import { Button } from "$lib/components/ui/button";

    let {
        icon = "mdi:package-variant",
        title = "Nothing here",
        message = "",
        actionLabel = "",
        onaction = undefined,
    } = $props();
</script>

<div
    class="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in"
>
    <div
        class="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4"
    >
        <Icon {icon} class="text-4xl text-muted-foreground" />
    </div>
    <h3 class="text-lg font-semibold text-foreground mb-1">{title}</h3>
    {#if message}
        <p class="text-sm text-muted-foreground max-w-xs">{message}</p>
    {/if}
    {#if actionLabel && onaction}
        <Button class="mt-4" onclick={onaction}>
            {actionLabel}
        </Button>
    {/if}
</div>
