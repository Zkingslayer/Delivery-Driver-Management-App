<script>
    import Icon from "@iconify/svelte";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import {
        debtsStore,
        totalDebt,
        transactionStore,
    } from "$lib/stores/transactionStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import StatusBadge from "$lib/components/StatusBadge.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import {
        formatCurrency,
        formatDate,
        getDueDate,
        isOverdue,
    } from "$lib/utils/helpers.js";
    import { getInitials } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import { Separator } from "$lib/components/ui/separator";

    let sortBy = $state("date");
    let showPayModal = $state(false);
    let payingDebt = $state(null);
    let payAmount = $state("");
    let selectedIds = $state(new Set());

    const sortedDebts = $derived.by(() => {
        let debts = [...$debtsStore];
        switch (sortBy) {
            case "amount":
                return debts.sort(
                    (a, b) =>
                        b.amount - b.paidAmount - (a.amount - a.paidAmount),
                );
            case "client":
                return debts.sort((a, b) => {
                    const ca =
                        $clientStore.find((c) => c.id === a.clientId)?.name ||
                        "";
                    const cb =
                        $clientStore.find((c) => c.id === b.clientId)?.name ||
                        "";
                    return ca.localeCompare(cb);
                });
            default:
                return debts.sort(
                    (a, b) =>
                        new Date(b.transactionDate) -
                        new Date(a.transactionDate),
                );
        }
    });

    function getClient(clientId) {
        return $clientStore.find((c) => c.id === clientId);
    }

    function openPayModal(debt) {
        payingDebt = debt;
        payAmount = String(debt.amount - debt.paidAmount);
        showPayModal = true;
    }

    function submitPayment() {
        if (!payingDebt || !payAmount || parseFloat(payAmount) <= 0) return;
        transactionStore.markPaid(payingDebt.id, parseFloat(payAmount));
        showPayModal = false;
        payingDebt = null;
    }

    function toggleSelect(id) {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        selectedIds = newSet;
    }

    function batchPay() {
        for (const id of selectedIds) {
            const debt = $debtsStore.find((d) => d.id === id);
            if (debt) {
                transactionStore.markPaid(id, debt.amount - debt.paidAmount);
            }
        }
        selectedIds = new Set();
    }
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Header -->
    <div
        class="flex items-center justify-between"
        class:flex-row-reverse={$isRTL}
    >
        <h2 class="text-lg font-bold text-foreground">{$t("debts")}</h2>
        {#if selectedIds.size > 0}
            <Button size="sm" onclick={batchPay} class="gap-1.5">
                <Icon icon="mdi:check-all" class="text-sm" />
                Pay {selectedIds.size} selected
            </Button>
        {/if}
    </div>

    <!-- Total -->
    {#if $debtsStore.length > 0}
        <Card.Root
            class="bg-destructive text-white border-destructive animate-fade-in"
        >
            <Card.Content class="pt-6 text-center">
                <p
                    class="text-xs uppercase tracking-wider font-medium opacity-80"
                >
                    {$t("totalDebt")}
                </p>
                <p class="text-3xl font-extrabold mt-1">
                    {formatCurrency($totalDebt)}
                </p>
                <p class="text-xs opacity-70 mt-0.5">
                    {$debtsStore.length} outstanding
                </p>
            </Card.Content>
        </Card.Root>
    {/if}

    <!-- Sort -->
    {#if $debtsStore.length > 0}
        <div
            class="flex items-center gap-2 animate-fade-in"
            class:flex-row-reverse={$isRTL}
        >
            <span class="text-xs text-muted-foreground">{$t("sortBy")}:</span>
            {#each ["date", "amount", "client"] as sortOption}
                <Button
                    variant={sortBy === sortOption ? "default" : "outline"}
                    size="sm"
                    class="rounded-full"
                    onclick={() => (sortBy = sortOption)}
                >
                    {$t(sortOption)}
                </Button>
            {/each}
        </div>
    {/if}

    <!-- Debt List -->
    {#if sortedDebts.length === 0}
        <EmptyState
            icon="mdi:check-circle-outline"
            title={$t("noDebts")}
            message={$t("allClear")}
        />
    {:else}
        <div class="flex flex-col gap-3">
            {#each sortedDebts as debt, i (debt.id)}
                {@const client = getClient(debt.clientId)}
                {@const overdue = isOverdue(debt.transactionDate)}
                <Card.Root class={overdue ? "border-destructive/30" : ""}>
                    <Card.Content class="pt-4 pb-4">
                        <div
                            class="flex items-start gap-3"
                            class:flex-row-reverse={$isRTL}
                        >
                            <!-- Select -->
                            <div class="mt-0.5 flex-shrink-0">
                                <Checkbox
                                    checked={selectedIds.has(debt.id)}
                                    onCheckedChange={() =>
                                        toggleSelect(debt.id)}
                                />
                            </div>

                            <!-- Client Avatar -->
                            <Avatar.Root
                                class="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex-shrink-0"
                            >
                                <Avatar.Fallback
                                    class="rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
                                >
                                    {client ? getInitials(client.name) : "?"}
                                </Avatar.Fallback>
                            </Avatar.Root>

                            <!-- Info -->
                            <div
                                class="flex-1 min-w-0"
                                class:text-right={$isRTL}
                            >
                                <p
                                    class="text-sm font-semibold text-foreground truncate"
                                >
                                    {client?.name || "Unknown"}
                                </p>
                                <div
                                    class="flex items-center gap-2 mt-0.5 flex-wrap"
                                >
                                    <span class="text-xs text-muted-foreground"
                                        >{formatCurrency(debt.amount)} →</span
                                    >
                                    <span
                                        class="text-xs font-bold text-destructive"
                                        >{formatCurrency(
                                            debt.amount - debt.paidAmount,
                                        )}
                                        {$t("remaining")}</span
                                    >
                                </div>
                                <div class="flex items-center gap-2 mt-1">
                                    <span
                                        class="text-[0.625rem] text-muted-foreground"
                                        >{formatDate(
                                            debt.transactionDate,
                                        )}</span
                                    >
                                    {#if overdue}
                                        <Badge
                                            variant="destructive"
                                            class="text-[0.625rem] px-1.5 py-0"
                                        >
                                            {$t("overdue")}
                                        </Badge>
                                    {/if}
                                </div>
                            </div>

                            <!-- Pay Button -->
                            <Button
                                size="sm"
                                variant="outline"
                                class="flex-shrink-0 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                onclick={() => openPayModal(debt)}
                            >
                                {$t("markPaid")}
                            </Button>
                        </div>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {/if}
</div>

<!-- Pay Modal -->
<Modal bind:open={showPayModal} title={$t("markPaid")}>
    {#if payingDebt}
        <div class="space-y-4">
            <Card.Root>
                <Card.Content class="pt-4 pb-4">
                    <p class="text-xs text-muted-foreground">
                        {$t("remaining")}
                    </p>
                    <p class="text-xl font-bold text-foreground">
                        {formatCurrency(
                            payingDebt.amount - payingDebt.paidAmount,
                        )}
                    </p>
                </Card.Content>
            </Card.Root>
            <div class="space-y-2">
                <Label for="payDebtAmount">{$t("amountPaid")}</Label>
                <Input
                    id="payDebtAmount"
                    type="number"
                    bind:value={payAmount}
                    class="text-lg"
                    step="0.01"
                    min="0"
                />
            </div>
            <div class="flex gap-2">
                <Button
                    variant="secondary"
                    class="flex-1"
                    onclick={() => (showPayModal = false)}
                    >{$t("cancel")}</Button
                >
                <Button class="flex-1" onclick={submitPayment}
                    >{$t("confirm")}</Button
                >
            </div>
        </div>
    {/if}
</Modal>
