<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import {
        activeDelivery,
        deliveryStore,
    } from "$lib/stores/deliveryStore.js";
    import { transactionStore } from "$lib/stores/transactionStore.js";
    import { getInitials, formatCurrency } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Textarea } from "$lib/components/ui/textarea";

    const clientId = $derived($page.url.searchParams.get("clientId") || "");
    const client = $derived($clientStore.find((c) => c.id === clientId));

    let amount = $state("");
    let paymentStatus = $state("paid");
    let paidAmount = $state("");
    let notes = $state("");
    let error = $state("");

    const newTruckValue = $derived.by(() => {
        if (!$activeDelivery || !amount)
            return $activeDelivery?.currentValue || 0;
        return Math.max(
            0,
            $activeDelivery.currentValue - parseFloat(amount || "0"),
        );
    });

    function completeTransaction() {
        const txAmount = parseFloat(amount);
        if (!txAmount || txAmount <= 0) {
            error = "Please enter a valid transaction amount";
            return;
        }
        if ($activeDelivery && txAmount > $activeDelivery.currentValue) {
            error = "Transaction amount exceeds remaining truck value";
            return;
        }
        error = "";

        let paid = 0;
        if (paymentStatus === "paid") paid = txAmount;
        else if (paymentStatus === "partially_paid")
            paid = parseFloat(paidAmount || "0");

        transactionStore.add({
            deliveryId: $activeDelivery?.id || "unknown",
            clientId: clientId,
            amount: txAmount,
            paidAmount: paid,
            notes: notes,
        });

        if ($activeDelivery) {
            deliveryStore.subtractValue($activeDelivery.id, txAmount);
        }

        goto("/delivery/select-client");
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

    <!-- Client Info -->
    {#if client}
        <Card.Root class="animate-fade-in">
            <Card.Content class="pt-4 pb-4 flex items-center gap-3">
                <div class:order-last={$isRTL}>
                    <Avatar.Root
                        class="h-12 w-12 rounded-xl bg-primary text-primary-foreground"
                    >
                        <Avatar.Fallback
                            class="rounded-xl bg-primary text-primary-foreground text-base font-bold"
                        >
                            {getInitials(client.name)}
                        </Avatar.Fallback>
                    </Avatar.Root>
                </div>
                <div class="flex-1" class:text-right={$isRTL}>
                    <p class="text-base font-bold text-foreground">
                        {client.name}
                    </p>
                    <p class="text-xs text-muted-foreground">
                        {client.phoneNumber || "No phone"}
                    </p>
                </div>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Truck Value Preview -->
    {#if $activeDelivery}
        <Card.Root class="animate-fade-in">
            <Card.Content class="pt-4 pb-4">
                <div
                    class="flex items-center justify-between mb-1"
                    class:flex-row-reverse={$isRTL}
                >
                    <span class="text-xs text-muted-foreground"
                        >{$t("truckValue")}</span
                    >
                </div>
                <div
                    class="flex items-center gap-3 justify-center"
                    class:flex-row-reverse={$isRTL}
                >
                    <span class="text-lg font-bold text-muted-foreground"
                        >{formatCurrency($activeDelivery.currentValue)}</span
                    >
                    <Icon
                        icon="mdi:arrow-right"
                        class="text-muted-foreground"
                    />
                    <span class="text-lg font-extrabold text-primary"
                        >{formatCurrency(newTruckValue)}</span
                    >
                </div>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Transaction Form -->
    <div class="flex flex-col gap-4 animate-fade-in">
        <!-- Amount -->
        <div class="space-y-2">
            <Label for="txAmount">{$t("transactionAmount")}</Label>
            <Input
                id="txAmount"
                type="number"
                bind:value={amount}
                class="text-center font-bold text-lg h-12"
                placeholder="0.00"
                step="0.01"
                min="0"
            />
        </div>

        <!-- Payment Status -->
        <div>
            <span class="block text-sm font-medium text-foreground mb-2"
                >{$t("paymentStatus")}</span
            >
            <div class="flex flex-col gap-3">
                {#each [{ value: "paid", label: "fullyPaid", icon: "mdi:check-circle", color: "text-emerald-500", bg: "bg-emerald-500/10" }, { value: "partially_paid", label: "partiallyPaid", icon: "mdi:circle-half-full", color: "text-amber-500", bg: "bg-amber-500/10" }, { value: "unpaid", label: "fullyUnpaid", icon: "mdi:close-circle", color: "text-destructive", bg: "bg-destructive/10" }] as option}
                    <button
                        onclick={() => (paymentStatus = option.value)}
                        class="w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer {paymentStatus ===
                        option.value
                            ? 'bg-accent border-primary'
                            : 'border-border hover:bg-accent/50'}"
                    >
                        <div
                            class="w-8 h-8 rounded-lg {option.bg} flex items-center justify-center"
                        >
                            <Icon icon={option.icon} class={option.color} />
                        </div>
                        <span class="text-sm font-medium text-foreground"
                            >{$t(option.label)}</span
                        >
                        <div
                            class="ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            class:border-primary={paymentStatus ===
                                option.value}
                            class:border-border={paymentStatus !== option.value}
                        >
                            {#if paymentStatus === option.value}
                                <div
                                    class="w-2.5 h-2.5 rounded-full bg-primary"
                                ></div>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Partial Amount -->
        {#if paymentStatus === "partially_paid"}
            <div class="animate-fade-in space-y-2">
                <Label for="paidAmt">{$t("amountPaid")}</Label>
                <Input
                    id="paidAmt"
                    type="number"
                    bind:value={paidAmount}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                />
            </div>
        {/if}

        <!-- Notes -->
        <div class="space-y-2">
            <Label for="txNotes">{$t("notes")}</Label>
            <Textarea
                id="txNotes"
                bind:value={notes}
                class="min-h-[5rem] resize-none"
                placeholder="Optional notes..."
            />
        </div>

        <!-- Error -->
        {#if error}
            <p class="text-xs text-destructive text-center animate-fade-in">
                {error}
            </p>
        {/if}

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
            <Button
                variant="secondary"
                class="flex-1"
                onclick={() => goto("/delivery/select-client")}
            >
                {$t("cancel")}
            </Button>
            <Button class="flex-1 gap-1.5" onclick={completeTransaction}>
                <Icon icon="mdi:check" class="text-lg" />
                {$t("complete")}
            </Button>
        </div>
    </div>
</div>
