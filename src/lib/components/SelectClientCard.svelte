<script>
    import Icon from "@iconify/svelte";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { getClientDebt } from "$lib/stores/transactionStore.js";
    import { getInitials, formatCurrency } from "$lib/utils/helpers.js";
    import { untrack } from "svelte";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Badge } from "$lib/components/ui/badge";

    let { client, i, onSelect } = $props();

    const debtInfo = getClientDebt(untrack(() => client.id));
</script>

<button
    onclick={onSelect}
    class="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors cursor-pointer text-left animate-fade-in"
    class:flex-row-reverse={$isRTL}
    style="animation-delay: {i * 0.03}s"
>
    <Avatar.Root
        class="h-10 w-10 rounded-lg bg-primary text-primary-foreground"
    >
        <Avatar.Fallback
            class="rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
            {getInitials(client.name)}
        </Avatar.Fallback>
    </Avatar.Root>

    <div class="flex-1 min-w-0" class:text-right={$isRTL}>
        <p class="text-sm font-semibold text-foreground truncate">
            {client.name}
        </p>
        <p class="text-xs text-muted-foreground truncate">
            {client.phoneNumber || "No phone"}
        </p>
    </div>

    {#if $debtInfo.total > 0}
        <Badge variant="destructive" class="text-xs flex-shrink-0">
            {formatCurrency($debtInfo.total)} debt
        </Badge>
    {/if}

    <Icon
        icon={$isRTL ? "mdi:chevron-left" : "mdi:chevron-right"}
        class="text-lg text-muted-foreground flex-shrink-0"
    />
</button>
