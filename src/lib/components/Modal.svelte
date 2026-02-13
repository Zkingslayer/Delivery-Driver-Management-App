<script>
    import Icon from "@iconify/svelte";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Button } from "$lib/components/ui/button";

    let { open = $bindable(false), title = "", children } = $props();
</script>

<Sheet.Root bind:open>
    <Sheet.Content side="bottom" class="rounded-t-2xl max-h-[90vh]">
        {#if title}
            <Sheet.Header>
                <Sheet.Title>{title}</Sheet.Title>
            </Sheet.Header>
        {/if}
        <div class="px-4 pb-6 pt-2 overflow-y-auto">
            {@render children()}
        </div>
    </Sheet.Content>
</Sheet.Root>
