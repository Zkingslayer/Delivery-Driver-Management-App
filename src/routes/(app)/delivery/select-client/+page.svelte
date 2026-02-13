<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import { activeDelivery } from "$lib/stores/deliveryStore.js";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import SelectClientCard from "$lib/components/SelectClientCard.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { getInitials, formatCurrency } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    let searchQuery = $state("");
    let showAddModal = $state(false);
    let newClientName = $state("");
    let newClientPhone = $state("");

    const filteredClients = $derived(
        searchQuery.trim() === ""
            ? $clientStore
            : $clientStore.filter(
                  (c) =>
                      c.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                      (c.phoneNumber && c.phoneNumber.includes(searchQuery)),
              ),
    );

    function selectClient(clientId) {
        goto(`/delivery/transaction?clientId=${clientId}`);
    }

    function addAndSelect() {
        if (!newClientName.trim()) return;
        const newClient = clientStore.add({
            name: newClientName.trim(),
            phoneNumber: newClientPhone.trim(),
        });
        showAddModal = false;
        newClientName = "";
        newClientPhone = "";
        selectClient(newClient.id);
    }
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Back -->
    <div
        class="flex items-center justify-between"
        class:flex-row-reverse={$isRTL}
    >
        <Button
            variant="ghost"
            size="sm"
            onclick={() => goto("/dashboard")}
            class="gap-2"
        >
            <Icon
                icon={$isRTL ? "mdi:arrow-right" : "mdi:arrow-left"}
                class="text-xl"
            />
            <span class="text-sm">{$t("back")}</span>
        </Button>
        {#if $activeDelivery}
            <Badge variant="secondary" class="gap-1">
                {$t("truckValue")}: {formatCurrency(
                    $activeDelivery.currentValue,
                )}
            </Badge>
        {/if}
    </div>

    <!-- Title -->
    <h2 class="text-lg font-bold text-foreground" class:text-right={$isRTL}>
        {$t("selectClient")}
    </h2>

    <!-- Search -->
    <SearchBar placeholder={$t("searchClients")} bind:value={searchQuery} />

    <!-- Add New Client Button -->
    <button onclick={() => (showAddModal = true)} class="w-full cursor-pointer">
        <Card.Root
            class="border-dashed border-primary/30 hover:bg-accent transition-colors"
        >
            <Card.Content class="py-3 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
                    class:order-last={$isRTL}
                >
                    <Icon
                        icon="mdi:account-plus"
                        class="text-lg text-primary"
                    />
                </div>
                <p class="text-sm font-medium text-primary">
                    {$t("addClient")}
                </p>
            </Card.Content>
        </Card.Root>
    </button>

    <!-- Client List -->
    <div class="flex flex-col gap-3">
        {#each filteredClients as client, i (client.id)}
            <SelectClientCard
                {client}
                {i}
                onSelect={() => selectClient(client.id)}
            />
        {/each}
    </div>
</div>

<!-- Add Client Modal -->
<Modal bind:open={showAddModal} title={$t("addClient")}>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            addAndSelect();
        }}
        class="space-y-4"
    >
        <div class="space-y-2">
            <Label for="newName">{$t("clientName")}</Label>
            <Input
                id="newName"
                type="text"
                bind:value={newClientName}
                placeholder="e.g. Boulangerie Ben Ali"
                required
            />
        </div>
        <div class="space-y-2">
            <Label for="newPhone">{$t("phoneNumber")}</Label>
            <Input
                id="newPhone"
                type="tel"
                bind:value={newClientPhone}
                placeholder="+213 555 012 345"
            />
        </div>
        <div class="flex gap-2 pt-2">
            <Button
                type="button"
                variant="secondary"
                class="flex-1"
                onclick={() => (showAddModal = false)}>{$t("cancel")}</Button
            >
            <Button type="submit" class="flex-1">{$t("save")}</Button>
        </div>
    </form>
</Modal>
