<script>
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import {
        transactionStore,
        getClientDebt,
    } from "$lib/stores/transactionStore.js";
    import StatusBadge from "$lib/components/StatusBadge.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import {
        getInitials,
        formatCurrency,
        formatDate,
    } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import * as Tabs from "$lib/components/ui/tabs";
    import * as Avatar from "$lib/components/ui/avatar";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Badge } from "$lib/components/ui/badge";
    import { Separator } from "$lib/components/ui/separator";

    const clientId = $derived($page.params.id);
    const clientDerived = $derived($clientStore.find((c) => c.id === clientId));
    const clientTransactions = $derived(
        $transactionStore
            .filter((tx) => tx.clientId === clientId)
            .sort(
                (a, b) =>
                    new Date(b.transactionDate) - new Date(a.transactionDate),
            ),
    );
    const debtInfo = $derived.by(() => {
        const debts = $transactionStore.filter(
            (tx) =>
                tx.clientId === clientId &&
                (tx.status === "unpaid" || tx.status === "partially_paid"),
        );
        return {
            debts,
            total: debts.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0),
            count: debts.length,
        };
    });

    let activeTab = $state("info");
    let editing = $state(false);
    let editName = $state("");
    let editPhone = $state("");
    let showPayModal = $state(false);
    let payingDebt = $state(null);
    let payAmount = $state("");

    function startEdit() {
        if (!clientDerived) return;
        editName = clientDerived.name;
        editPhone = clientDerived.phoneNumber || "";
        editing = true;
    }

    function saveEdit() {
        if (!editName.trim()) return;
        clientStore.updateClient(clientId, {
            name: editName.trim(),
            phoneNumber: editPhone.trim(),
        });
        editing = false;
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
</script>

{#if clientDerived}
    <div class="px-4 py-4 flex flex-col gap-4">
        <!-- Back + Header -->
        <div class="flex items-center gap-3" class:flex-row-reverse={$isRTL}>
            <Button
                variant="ghost"
                size="icon"
                onclick={() => goto("/clients")}
            >
                <Icon
                    icon={$isRTL ? "mdi:arrow-right" : "mdi:arrow-left"}
                    class="text-xl"
                />
            </Button>
            <div
                class="flex-1 flex items-center gap-3"
                class:flex-row-reverse={$isRTL}
            >
                <Avatar.Root
                    class="h-12 w-12 rounded-xl bg-primary text-primary-foreground"
                >
                    <Avatar.Fallback
                        class="rounded-xl bg-primary text-primary-foreground text-base font-bold"
                    >
                        {getInitials(clientDerived.name)}
                    </Avatar.Fallback>
                </Avatar.Root>
                <div class:text-right={$isRTL}>
                    <h2 class="text-lg font-bold text-foreground">
                        {clientDerived.name}
                    </h2>
                    <p class="text-xs text-muted-foreground">
                        {clientDerived.phoneNumber || "No phone number"}
                    </p>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <Tabs.Root bind:value={activeTab}>
            <Tabs.List class="grid w-full grid-cols-3">
                <Tabs.Trigger value="info">{$t("info")}</Tabs.Trigger>
                <Tabs.Trigger value="transactions"
                    >{$t("transactions")}</Tabs.Trigger
                >
                <Tabs.Trigger value="debts">{$t("debts")}</Tabs.Trigger>
            </Tabs.List>

            <!-- Info Tab -->
            <Tabs.Content value="info" class="space-y-4 mt-4">
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-3">
                    <Card.Root>
                        <Card.Content class="pt-4 pb-4 text-center">
                            <p class="text-2xl font-bold text-foreground">
                                {clientTransactions.length}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                {$t("totalTransactions")}
                            </p>
                        </Card.Content>
                    </Card.Root>
                    <Card.Root>
                        <Card.Content class="pt-4 pb-4 text-center">
                            <p class="text-2xl font-bold text-destructive">
                                {formatCurrency(debtInfo.total)}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                {$t("totalDebt")}
                            </p>
                        </Card.Content>
                    </Card.Root>
                </div>

                <!-- Editable Info -->
                {#if editing}
                    <Card.Root>
                        <Card.Content class="pt-4 space-y-3">
                            <div class="space-y-2">
                                <Label>{$t("clientName")}</Label>
                                <Input type="text" bind:value={editName} />
                            </div>
                            <div class="space-y-2">
                                <Label>{$t("phoneNumber")}</Label>
                                <Input type="tel" bind:value={editPhone} />
                            </div>
                            <div class="flex gap-2">
                                <Button
                                    variant="secondary"
                                    class="flex-1"
                                    onclick={() => (editing = false)}
                                    >{$t("cancel")}</Button
                                >
                                <Button class="flex-1" onclick={saveEdit}
                                    >{$t("save")}</Button
                                >
                            </div>
                        </Card.Content>
                    </Card.Root>
                {:else}
                    <Card.Root>
                        <Card.Header>
                            <div class="flex items-center justify-between">
                                <Card.Title class="text-sm"
                                    >Client Details</Card.Title
                                >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onclick={startEdit}
                                    class="gap-1"
                                >
                                    <Icon icon="mdi:pencil" class="text-sm" />
                                    {$t("edit")}
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Content class="space-y-3">
                            <div class="flex items-center gap-3">
                                <Icon
                                    icon="mdi:account"
                                    class="text-muted-foreground"
                                />
                                <span class="text-sm text-foreground"
                                    >{clientDerived.name}</span
                                >
                            </div>
                            <Separator />
                            <div class="flex items-center gap-3">
                                <Icon
                                    icon="mdi:phone"
                                    class="text-muted-foreground"
                                />
                                <span class="text-sm text-foreground"
                                    >{clientDerived.phoneNumber || "—"}</span
                                >
                            </div>
                            <Separator />
                            <div class="flex items-center gap-3">
                                <Icon
                                    icon="mdi:calendar"
                                    class="text-muted-foreground"
                                />
                                <span class="text-sm text-foreground"
                                    >Since {formatDate(
                                        clientDerived.createdAt,
                                    )}</span
                                >
                            </div>
                        </Card.Content>
                    </Card.Root>
                {/if}
            </Tabs.Content>

            <!-- Transactions Tab -->
            <Tabs.Content value="transactions" class="space-y-2.5 mt-4">
                {#if clientTransactions.length === 0}
                    <div class="text-center py-10">
                        <Icon
                            icon="mdi:swap-horizontal"
                            class="text-4xl text-muted-foreground mb-2 mx-auto"
                        />
                        <p class="text-sm text-muted-foreground">
                            No transactions yet
                        </p>
                    </div>
                {:else}
                    {#each clientTransactions as tx, i (tx.id)}
                        <Card.Root
                            class="animate-fade-in"
                            style="animation-delay: {i * 0.03}s"
                        >
                            <Card.Content class="pt-4 pb-4">
                                <div
                                    class="flex items-center justify-between mb-1.5"
                                >
                                    <p
                                        class="text-sm font-semibold text-foreground"
                                    >
                                        {formatCurrency(tx.amount)}
                                    </p>
                                    <StatusBadge status={tx.status} />
                                </div>
                                <div class="flex items-center justify-between">
                                    <p class="text-xs text-muted-foreground">
                                        {formatDate(tx.transactionDate, true)}
                                    </p>
                                    {#if tx.status !== "paid"}
                                        <p class="text-xs text-amber-500">
                                            Paid: {formatCurrency(
                                                tx.paidAmount,
                                            )}
                                        </p>
                                    {/if}
                                </div>
                                {#if tx.notes}
                                    <p
                                        class="text-xs text-muted-foreground mt-1.5 bg-muted px-2 py-1 rounded"
                                    >
                                        {tx.notes}
                                    </p>
                                {/if}
                            </Card.Content>
                        </Card.Root>
                    {/each}
                {/if}
            </Tabs.Content>

            <!-- Debts Tab -->
            <Tabs.Content value="debts" class="space-y-2.5 mt-4">
                {#if debtInfo.count === 0}
                    <div class="text-center py-10">
                        <div
                            class="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3"
                        >
                            <Icon
                                icon="mdi:check-circle"
                                class="text-3xl text-emerald-500"
                            />
                        </div>
                        <p class="text-sm font-medium text-emerald-600">
                            No outstanding debts!
                        </p>
                    </div>
                {:else}
                    <!-- Total -->
                    <Card.Root class="bg-destructive/5 border-destructive/20">
                        <Card.Content class="pt-4 pb-4 text-center">
                            <p
                                class="text-xs text-destructive/70 uppercase tracking-wider font-medium"
                            >
                                {$t("totalDebt")}
                            </p>
                            <p
                                class="text-2xl font-extrabold text-destructive mt-0.5"
                            >
                                {formatCurrency(debtInfo.total)}
                            </p>
                        </Card.Content>
                    </Card.Root>

                    {#each debtInfo.debts as debt, i (debt.id)}
                        <Card.Root
                            class="animate-fade-in"
                            style="animation-delay: {i * 0.03}s"
                        >
                            <Card.Content class="pt-4 pb-4">
                                <div
                                    class="flex items-center justify-between mb-1.5"
                                >
                                    <div>
                                        <p
                                            class="text-sm font-semibold text-foreground"
                                        >
                                            {formatCurrency(debt.amount)}
                                        </p>
                                        <p
                                            class="text-xs text-muted-foreground"
                                        >
                                            {$t("remaining")}: {formatCurrency(
                                                debt.amount - debt.paidAmount,
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        class="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                                        onclick={() => openPayModal(debt)}
                                    >
                                        {$t("markPaid")}
                                    </Button>
                                </div>
                                <p class="text-xs text-muted-foreground">
                                    {formatDate(debt.transactionDate)}
                                </p>
                            </Card.Content>
                        </Card.Root>
                    {/each}
                {/if}
            </Tabs.Content>
        </Tabs.Root>
    </div>
{:else}
    <div class="flex items-center justify-center h-64">
        <p class="text-muted-foreground">Client not found</p>
    </div>
{/if}

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
                <Label for="payAmount">{$t("amountPaid")}</Label>
                <Input
                    id="payAmount"
                    type="number"
                    bind:value={payAmount}
                    class="text-lg"
                    step="0.01"
                    min="0"
                    max={payingDebt.amount - payingDebt.paidAmount}
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
