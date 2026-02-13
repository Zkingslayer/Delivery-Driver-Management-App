<script>
    import ClientCard from "$lib/components/ClientCard.svelte";
    import { t, isRTL } from "$lib/stores/i18nStore.js";
    import { clientStore } from "$lib/stores/clientStore.js";
    import SearchBar from "$lib/components/SearchBar.svelte";
    import FloatingActionButton from "$lib/components/FloatingActionButton.svelte";
    import EmptyState from "$lib/components/EmptyState.svelte";
    import Modal from "$lib/components/Modal.svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
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

    function addClient() {
        if (!newClientName.trim()) return;
        clientStore.add({
            name: newClientName.trim(),
            phoneNumber: newClientPhone.trim(),
        });
        newClientName = "";
        newClientPhone = "";
        showAddModal = false;
    }
</script>

<div class="p-4 flex flex-col gap-6">
    <!-- Title -->
    <div
        class="flex items-center justify-between"
        class:flex-row-reverse={$isRTL}
    >
        <h2 class="text-lg font-bold text-foreground">{$t("clients")}</h2>
        <Badge variant="secondary">
            {$clientStore.length} total
        </Badge>
    </div>

    <!-- Search -->
    <SearchBar placeholder={$t("searchClients")} bind:value={searchQuery} />

    <!-- Client List -->
    {#if filteredClients.length === 0 && searchQuery === ""}
        <EmptyState
            icon="mdi:account-plus"
            title={$t("noClients")}
            message={$t("addFirstClient")}
            actionLabel={$t("addClient")}
            onaction={() => (showAddModal = true)}
        />
    {:else if filteredClients.length === 0}
        <EmptyState
            icon="mdi:magnify"
            title="No results"
            message="Try a different search term"
        />
    {:else}
        <div class="flex flex-col gap-3">
            {#each filteredClients as client, i (client.id)}
                <ClientCard {client} {i} />
            {/each}
        </div>
    {/if}
</div>

<!-- FAB -->
<FloatingActionButton
    icon="mdi:account-plus"
    label={$t("addClient")}
    onclick={() => (showAddModal = true)}
/>

<!-- Add Client Modal -->
<Modal bind:open={showAddModal} title={$t("addClient")}>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            addClient();
        }}
        class="space-y-4"
    >
        <div class="space-y-2">
            <Label for="name">{$t("clientName")}</Label>
            <Input
                id="name"
                type="text"
                bind:value={newClientName}
                placeholder="e.g. Boulangerie Ben Ali"
                required
            />
        </div>
        <div class="space-y-2">
            <Label for="phone">{$t("phoneNumber")}</Label>
            <Input
                id="phone"
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
