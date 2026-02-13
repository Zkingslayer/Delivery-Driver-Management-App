<script>
    import Icon from "@iconify/svelte";
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";

    let {
        placeholder = "Search...",
        value = $bindable(""),
        oninput = undefined,
    } = $props();
</script>

<div class="relative">
    <Icon
        icon="mdi:magnify"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none"
    />
    <Input type="text" bind:value {placeholder} {oninput} class="pl-10 pr-9" />
    {#if value}
        <button
            onclick={() => {
                value = "";
                oninput?.();
            }}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
            <Icon icon="mdi:close-circle" class="text-lg" />
        </button>
    {/if}
</div>
