<script>
    import Icon from "@iconify/svelte";
    import {
        t,
        isRTL,
        currentLanguage,
        languages,
    } from "$lib/stores/i18nStore.js";
    import { driverStore } from "$lib/stores/driverStore.js";
    import { timeAgo } from "$lib/utils/helpers.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Switch } from "$lib/components/ui/switch";
    import * as Select from "$lib/components/ui/select";
    import { Separator } from "$lib/components/ui/separator";
    import { Label } from "$lib/components/ui/label";

    let autoSync = $state(true);
    let syncInterval = $state("15");

    const settingsGroups = [
        {
            title: "language",
            icon: "mdi:translate",
            items: "languages",
        },
    ];
</script>

<div class="container max-w-2xl mx-auto p-4 flex flex-col gap-6 pb-24">
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold tracking-tight">{$t("settings")}</h2>
    </div>

    <!-- Language -->
    <Card.Root>
        <Card.Header>
            <div class="flex items-center gap-2">
                <Icon icon="mdi:translate" class="text-xl text-primary" />
                <Card.Title>{$t("language")}</Card.Title>
            </div>
        </Card.Header>
        <Card.Content>
            <div class="grid grid-cols-2 gap-4">
                {#each languages as lang}
                    <Button
                        variant={$currentLanguage === lang.code
                            ? "default"
                            : "outline"}
                        class="h-auto py-4 justify-start gap-3 relative"
                        onclick={() => ($currentLanguage = lang.code)}
                    >
                        <span class="flex-1 text-left">{lang.name}</span>
                        {#if $currentLanguage === lang.code}
                            <Icon icon="mdi:check" class="text-lg" />
                        {/if}
                    </Button>
                {:else}
                    <p>No languages available.</p>
                {/each}
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Sync Settings -->
    <Card.Root>
        <Card.Header>
            <div class="flex items-center gap-2">
                <Icon icon="mdi:sync" class="text-xl text-primary" />
                <Card.Title>{$t("syncSettings")}</Card.Title>
            </div>
        </Card.Header>
        <Card.Content class="space-y-6">
            <!-- Auto Sync -->
            <div class="flex items-center justify-between space-x-2">
                <Label for="auto-sync" class="flex flex-col space-y-1">
                    <span>{$t("autoSync")}</span>
                    <span class="font-normal text-muted-foreground text-xs">
                        Automatically sync data in background
                    </span>
                </Label>
                <Switch id="auto-sync" bind:checked={autoSync} />
            </div>

            <Separator />

            <!-- Sync Interval -->
            <div class="flex items-center justify-between space-x-2">
                <Label for="sync-interval">{$t("syncInterval")}</Label>
                <Select.Root type="single" bind:value={syncInterval}>
                    <Select.Trigger class="w-[180px]">
                        {syncInterval === "5"
                            ? "5 min"
                            : syncInterval === "15"
                              ? "15 min"
                              : syncInterval === "30"
                                ? "30 min"
                                : "1 hour"}
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="5">5 min</Select.Item>
                        <Select.Item value="15">15 min</Select.Item>
                        <Select.Item value="30">30 min</Select.Item>
                        <Select.Item value="60">1 hour</Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>

            <Separator />

            <!-- Last Sync & Force Sync -->
            <div class="space-y-4">
                <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Last synchronized</span>
                    <span class="font-medium"
                        >{timeAgo($driverStore.lastSync)}</span
                    >
                </div>
                <Button
                    variant="secondary"
                    class="w-full gap-2"
                    onclick={() => {
                        driverStore.setSyncing();
                        setTimeout(() => {
                            driverStore.setOnline();
                            driverStore.updateLastSync();
                        }, 2000);
                    }}
                >
                    <Icon icon="mdi:sync" class="text-lg" />
                    Force Sync Now
                </Button>
            </div>
        </Card.Content>
    </Card.Root>

    <!-- Data Management -->
    <Card.Root>
        <Card.Header>
            <div class="flex items-center gap-2">
                <Icon icon="mdi:database-cog" class="text-xl text-primary" />
                <Card.Title>Data Management</Card.Title>
            </div>
        </Card.Header>
        <Card.Content class="space-y-2">
            <Button variant="ghost" class="w-full justify-start gap-3">
                <Icon
                    icon="mdi:download"
                    class="text-lg text-muted-foreground"
                />
                {$t("exportData")}
            </Button>
            <Button
                variant="ghost"
                class="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
                <Icon icon="mdi:delete-sweep" class="text-lg" />
                {$t("clearData")}
            </Button>
        </Card.Content>
    </Card.Root>

    <!-- About -->
    <Card.Root>
        <Card.Header>
            <div class="flex items-center gap-2">
                <Icon icon="mdi:information" class="text-xl text-primary" />
                <Card.Title>{$t("about")}</Card.Title>
            </div>
        </Card.Header>
        <Card.Content class="space-y-4 text-sm">
            <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">{$t("version")}</span>
                <span>1.0.0</span>
            </div>
            <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Build</span>
                <span>2026.02.12</span>
            </div>
            <div class="flex justify-between">
                <span class="text-muted-foreground">Driver ID</span>
                <span class="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {$driverStore.id}
                </span>
            </div>
        </Card.Content>
    </Card.Root>

    <div class="text-center py-6">
        <p class="text-xs text-muted-foreground">
            Delivery Driver Management App
        </p>
        <p class="text-[10px] text-muted-foreground/60 mt-1">
            © 2026 All rights reserved
        </p>
    </div>
</div>
