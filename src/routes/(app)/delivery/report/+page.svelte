<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import {
        activeDelivery,
        deliveryStore,
    } from "$lib/stores/deliveryStore.js";
    import { transactionStore } from "$lib/stores/transactionStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import StatusBadge from "$lib/components/StatusBadge.svelte";
    import {
        formatCurrency,
        getInitials,
        formatDate,
    } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";

    const delivery = $derived($activeDelivery);
    const deliveryTransactions = $derived(
        delivery
            ? $transactionStore.filter((tx) => tx.deliveryId === delivery.id)
            : [],
    );

    const stats = $derived.by(() => {
        if (!delivery) return { delivered: 0, cash: 0, debt: 0 };
        const delivered = delivery.startValue - delivery.currentValue;
        const cash = deliveryTransactions.reduce(
            (sum, tx) => sum + tx.paidAmount,
            0,
        );
        const debt = deliveryTransactions.reduce(
            (sum, tx) => sum + (tx.amount - tx.paidAmount),
            0,
        );
        return { delivered, cash, debt };
    });

    function finishDelivery() {
        deliveryStore.finishDelivery();
        goto("/dashboard");
    }

    function getClient(clientId) {
        return $clientStore.find((c) => c.id === clientId);
    }
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Back -->
    <Button
        variant="ghost"
        size="sm"
        onclick={() => goto("/delivery/select-client")}
        class="self-start gap-2"
    >
        <Icon
            icon={$isRTL ? "mdi:arrow-right" : "mdi:arrow-left"}
            class="text-xl"
        />
        <span class="text-sm">{$t("back")}</span>
    </Button>

    <h2 class="text-lg font-bold text-foreground text-center animate-fade-in">
        {$t("deliveryReport")}
    </h2>

    {#if delivery}
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 animate-fade-in">
            <Card.Root>
                <Card.Content class="pt-4 pb-4 text-center">
                    <div
                        class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2"
                    >
                        <Icon
                            icon="mdi:package-variant"
                            class="text-lg text-primary"
                        />
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {$t("startingValue")}
                    </p>
                    <p class="text-base font-bold text-foreground">
                        {formatCurrency(delivery.startValue)}
                    </p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Content class="pt-4 pb-4 text-center">
                    <div
                        class="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center mx-auto mb-2"
                    >
                        <Icon icon="mdi:truck" class="text-lg text-sky-500" />
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {$t("endingValue")}
                    </p>
                    <p class="text-base font-bold text-foreground">
                        {formatCurrency(delivery.currentValue)}
                    </p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Content class="pt-4 pb-4 text-center">
                    <div
                        class="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2"
                    >
                        <Icon
                            icon="mdi:cash"
                            class="text-lg text-emerald-500"
                        />
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {$t("cashCollected")}
                    </p>
                    <p class="text-base font-bold text-emerald-600">
                        {formatCurrency(stats.cash)}
                    </p>
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Content class="pt-4 pb-4 text-center">
                    <div
                        class="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-2"
                    >
                        <Icon
                            icon="mdi:cash-clock"
                            class="text-lg text-destructive"
                        />
                    </div>
                    <p class="text-xs text-muted-foreground">
                        {$t("debtCreated")}
                    </p>
                    <p class="text-base font-bold text-destructive">
                        {formatCurrency(stats.debt)}
                    </p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Total delivered -->
        <Card.Root
            class="bg-primary text-primary-foreground border-primary animate-fade-in"
        >
            <Card.Content class="pt-6 text-center">
                <p
                    class="text-xs uppercase tracking-wider font-medium opacity-80"
                >
                    {$t("totalDelivered")}
                </p>
                <p class="text-2xl font-extrabold mt-0.5">
                    {formatCurrency(stats.delivered)}
                </p>
                <p class="text-xs opacity-70 mt-0.5">
                    {deliveryTransactions.length} transactions
                </p>
            </Card.Content>
        </Card.Root>

        <!-- Clients Visited -->
        {#if deliveryTransactions.length > 0}
            <div class="animate-fade-in">
                <h3
                    class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3"
                >
                    {$t("clientsVisited")}
                </h3>
                <div class="flex flex-col gap-3">
                    {#each deliveryTransactions as tx (tx.id)}
                        {@const client = getClient(tx.clientId)}
                        <Card.Root>
                            <Card.Content class="py-3 flex items-center gap-3">
                                <div class:order-last={$isRTL}>
                                    <Avatar.Root
                                        class="h-10 w-10 rounded-lg bg-primary text-primary-foreground"
                                    >
                                        <Avatar.Fallback
                                            class="rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                                        >
                                            {client
                                                ? getInitials(client.name)
                                                : "?"}
                                        </Avatar.Fallback>
                                    </Avatar.Root>
                                </div>
                                <div
                                    class="flex-1 min-w-0"
                                    class:text-right={$isRTL}
                                >
                                    <p
                                        class="text-sm font-semibold text-foreground truncate"
                                    >
                                        {client?.name || "Unknown"}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {formatCurrency(tx.amount)}
                                    </p>
                                </div>
                                <StatusBadge status={tx.status} />
                            </Card.Content>
                        </Card.Root>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Actions -->
        <div class="flex gap-3 py-2 animate-fade-in">
            <Button
                variant="secondary"
                href="/delivery/select-client"
                class="flex-1 gap-1.5"
            >
                <Icon icon="mdi:plus" class="text-lg" />
                Add More
            </Button>
            <Button class="flex-1 gap-1.5" onclick={finishDelivery}>
                <Icon icon="mdi:check-all" class="text-lg" />
                {$t("finishDelivery")}
            </Button>
        </div>
    {:else}
        <div class="text-center py-16">
            <Icon
                icon="mdi:truck-check"
                class="text-5xl text-muted-foreground mb-3 mx-auto"
            />
            <p class="text-muted-foreground">No active delivery</p>
            <Button href="/delivery/start" class="mt-4">
                {$t("startDelivery")}
            </Button>
        </div>
    {/if}
</div>
