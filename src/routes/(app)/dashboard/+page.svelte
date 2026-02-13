<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { driverStore } from "$lib/stores/driverStore.js";
    import { activeDelivery } from "$lib/stores/deliveryStore.js";
    import { totalDebt } from "$lib/stores/transactionStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import { formatCurrency, timeAgo } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Progress } from "$lib/components/ui/progress";

    const quickActions = [
        {
            icon: "mdi:truck-fast",
            label: "startDelivery",
            href: "/delivery/start",
            color: "bg-primary text-primary-foreground",
        },
        {
            icon: "mdi:account-group",
            label: "viewClients",
            href: "/clients",
            color: "bg-amber-500 text-white",
        },
        {
            icon: "mdi:cash-clock",
            label: "viewDebts",
            href: "/debts",
            color: "bg-destructive text-white",
        },
    ];

    const deliveryProgress = $derived(
        $activeDelivery
            ? Math.round(
                  (1 -
                      $activeDelivery.currentValue /
                          $activeDelivery.startValue) *
                      100,
              )
            : 0,
    );
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Welcome Section -->
    <div class="animate-fade-in" class:text-right={$isRTL}>
        <p class="text-sm text-muted-foreground">{$t("welcome")},</p>
        <h2 class="text-xl font-bold text-foreground">
            {$driverStore.name} 👋
        </h2>
    </div>

    <!-- Active Delivery Card -->
    {#if $activeDelivery}
        <Card.Root
            class="relative overflow-hidden border-primary/30 animate-fade-in"
        >
            <div
                class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"
            ></div>
            <Card.Content class="pt-6">
                <div
                    class="flex items-start justify-between mb-4"
                    class:flex-row-reverse={$isRTL}
                >
                    <div>
                        <p
                            class="text-xs text-primary font-semibold uppercase tracking-wider"
                        >
                            {$t("currentDelivery")}
                        </p>
                        <p class="text-3xl font-extrabold text-foreground mt-1">
                            {formatCurrency($activeDelivery.currentValue)}
                        </p>
                        <p class="text-xs text-muted-foreground mt-0.5">
                            {$t("truckValue")}
                        </p>
                    </div>
                    <div
                        class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center"
                    >
                        <Icon
                            icon="mdi:truck"
                            class="text-2xl text-primary-foreground"
                        />
                    </div>
                </div>
                <!-- Progress -->
                <div class="mb-4">
                    <div
                        class="flex justify-between text-xs text-muted-foreground mb-2"
                    >
                        <span>{formatCurrency($activeDelivery.startValue)}</span
                        >
                        <span>{deliveryProgress}% delivered</span>
                    </div>
                    <Progress value={deliveryProgress} class="h-2" />
                </div>
                <div class="flex gap-2" class:flex-row-reverse={$isRTL}>
                    <Button href="/delivery/select-client" class="flex-1">
                        {$t("continueDelivery")}
                    </Button>
                    <Button
                        variant="secondary"
                        href="/delivery/report"
                        class="flex-1"
                    >
                        {$t("finishDelivery")}
                    </Button>
                </div>
            </Card.Content>
        </Card.Root>
    {:else}
        <button
            onclick={() => goto("/delivery/start")}
            class="w-full animate-fade-in cursor-pointer"
        >
            <Card.Root
                class="border-dashed border-primary/30 hover:bg-accent transition-colors"
            >
                <Card.Content class="pt-6 flex items-center gap-4">
                    <div
                        class="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0"
                        class:order-last={$isRTL}
                    >
                        <Icon
                            icon="mdi:plus"
                            class="text-2xl text-primary-foreground"
                        />
                    </div>
                    <div class:text-right={$isRTL}>
                        <p class="text-sm font-semibold text-foreground">
                            {$t("startDelivery")}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            Begin tracking a new delivery run
                        </p>
                    </div>
                </Card.Content>
            </Card.Root>
        </button>
    {/if}

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-4 animate-fade-in">
        <Card.Root>
            <Card.Content class="pt-6 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"
                    class:order-last={$isRTL}
                >
                    <Icon
                        icon="mdi:account-group"
                        class="text-lg text-amber-500"
                    />
                </div>
                <div class:text-right={$isRTL}>
                    <p class="text-lg font-bold text-foreground">
                        {$clientStore.length}
                    </p>
                    <p
                        class="text-[0.625rem] text-muted-foreground uppercase tracking-wide"
                    >
                        {$t("clients")}
                    </p>
                </div>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Content class="pt-6 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0"
                    class:order-last={$isRTL}
                >
                    <Icon icon="mdi:cash-minus" class="text-lg text-red-500" />
                </div>
                <div class:text-right={$isRTL}>
                    <p class="text-lg font-bold text-foreground">
                        {formatCurrency($totalDebt)}
                    </p>
                    <p
                        class="text-[0.625rem] text-muted-foreground uppercase tracking-wide"
                    >
                        {$t("totalDebt")}
                    </p>
                </div>
            </Card.Content>
        </Card.Root>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-col gap-4">
        <h3
            class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            class:text-right={$isRTL}
        >
            Quick Actions
        </h3>
        <div class="flex flex-col gap-3">
            {#each quickActions as action, i}
                <a
                    href={action.href}
                    class="block animate-fade-in"
                    style="animation-delay: {i * 0.05}s"
                >
                    <Card.Root class="hover:bg-accent transition-colors">
                        <Card.Content class="py-4 flex items-center gap-4">
                            <div
                                class="w-11 h-11 rounded-xl {action.color} flex items-center justify-center flex-shrink-0"
                                class:order-last={$isRTL}
                            >
                                <Icon icon={action.icon} class="text-xl" />
                            </div>
                            <p
                                class="text-sm font-medium text-foreground flex-1"
                                class:text-right={$isRTL}
                            >
                                {$t(action.label)}
                            </p>
                            <Icon
                                icon={$isRTL
                                    ? "mdi:chevron-left"
                                    : "mdi:chevron-right"}
                                class="text-xl text-muted-foreground"
                            />
                        </Card.Content>
                    </Card.Root>
                </a>
            {/each}
        </div>
    </div>

    <!-- Last Sync -->
    <div class="text-center pt-2">
        <p class="text-xs text-muted-foreground">
            Last synced {timeAgo($driverStore.lastSync)}
        </p>
    </div>
</div>
