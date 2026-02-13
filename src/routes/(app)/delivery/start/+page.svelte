<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import {
        deliveryStore,
        activeDelivery,
    } from "$lib/stores/deliveryStore.js";
    import { formatCurrency } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    let inputValue = $state("");
    let error = $state("");

    function startDelivery() {
        const value = parseFloat(inputValue);
        if (!value || value <= 0) {
            error = "Please enter a valid amount greater than 0";
            return;
        }
        if ($activeDelivery) {
            error = "You already have an active delivery. Finish it first.";
            return;
        }
        error = "";
        deliveryStore.startDelivery(value);
        goto("/delivery/select-client");
    }

    function handleKeydown(e) {
        if (e.key === "Enter") startDelivery();
    }
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Back -->
    <Button
        variant="ghost"
        size="sm"
        onclick={() => goto("/dashboard")}
        class="self-start gap-2"
    >
        <Icon
            icon={$isRTL ? "mdi:arrow-right" : "mdi:arrow-left"}
            class="text-xl"
        />
        <span class="text-sm">{$t("back")}</span>
    </Button>

    <!-- Title -->
    <div class="text-center animate-fade-in">
        <div
            class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4"
        >
            <Icon
                icon="mdi:truck-cargo-container"
                class="text-3xl text-primary-foreground"
            />
        </div>
        <h2 class="text-xl font-bold text-foreground">{$t("enterValue")}</h2>
        <p class="text-sm text-muted-foreground mt-1">
            How much goods are on your truck?
        </p>
    </div>

    <!-- Input -->
    <div class="animate-fade-in">
        <div class="relative">
            <span
                class="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground"
                >DZD</span
            >
            <Input
                type="number"
                bind:value={inputValue}
                onkeydown={handleKeydown}
                class="text-center text-3xl font-extrabold py-6 pl-16 pr-4 tracking-tight h-auto"
                placeholder="0.00"
                step="0.01"
                min="0"
                autofocus
            />
        </div>
        {#if error}
            <p
                class="text-xs text-destructive mt-2 text-center animate-fade-in"
            >
                {error}
            </p>
        {/if}
    </div>

    <!-- Quick amounts -->
    <div class="grid grid-cols-3 gap-2 animate-fade-in">
        {#each [10000, 25000, 50000, 75000, 100000, 150000] as amount}
            <Button
                variant="outline"
                onclick={() => (inputValue = String(amount))}
                class="py-2.5"
            >
                {formatCurrency(amount)}
            </Button>
        {/each}
    </div>

    <!-- Start Button -->
    <Button
        size="lg"
        class="w-full animate-fade-in gap-2"
        onclick={startDelivery}
        disabled={!inputValue || parseFloat(inputValue) <= 0}
    >
        <Icon icon="mdi:truck-fast" class="text-xl" />
        {$t("startDelivery")}
    </Button>
</div>
