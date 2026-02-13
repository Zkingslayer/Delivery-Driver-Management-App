<script>
    import Icon from "@iconify/svelte";
    import {
        t,
        currentLanguage,
        languages,
        isRTL,
    } from "$lib/stores/i18nStore.js";
    import { driverStore } from "$lib/stores/driverStore.js";
    import { theme } from "$lib/stores/themeStore.js";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Badge } from "$lib/components/ui/badge";
</script>

<header
    class="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-card/80 backdrop-blur-lg border-b border-border"
    class:flex-row-reverse={$isRTL}
>
    <div class="flex items-center gap-3" class:flex-row-reverse={$isRTL}>
        <div
            class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center"
        >
            <Icon
                icon="mdi:truck-delivery"
                class="text-primary-foreground text-lg"
            />
        </div>
        <h1 class="text-base font-bold text-foreground tracking-tight">
            Delivery Manager
        </h1>
    </div>

    <div class="flex items-center gap-2" class:flex-row-reverse={$isRTL}>
        <!-- Sync Status -->
        <Badge variant="outline" class="gap-1.5 px-2.5 py-1.5">
            {#if $driverStore.syncStatus === "online"}
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                ></span>
                <span class="text-xs text-emerald-600 font-medium"
                    >{$t("online")}</span
                >
            {:else if $driverStore.syncStatus === "syncing"}
                <Icon
                    icon="mdi:sync"
                    class="text-sm text-sky-500 animate-spin"
                />
                <span class="text-xs text-sky-500 font-medium"
                    >{$t("syncing")}</span
                >
            {:else}
                <span class="w-2 h-2 rounded-full bg-muted-foreground"></span>
                <span class="text-xs text-muted-foreground font-medium"
                    >{$t("offline")}</span
                >
            {/if}
        </Badge>

        <!-- Theme Toggle -->
        <Button
            variant="outline"
            size="icon"
            class="h-8 w-8 relative overflow-hidden"
            onclick={() => theme.toggle()}
        >
            <Icon
                icon={$theme === "dark"
                    ? "mdi:weather-sunny"
                    : "mdi:weather-night"}
                class="text-sm text-muted-foreground transition-transform duration-300 {$theme ===
                'dark'
                    ? 'rotate-0 scale-100'
                    : 'rotate-0 scale-100'}"
            />
        </Button>

        <!-- Language Dropdown -->
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Button
                        variant="outline"
                        size="sm"
                        {...props}
                        class="gap-1 px-2.5"
                    >
                        <Icon
                            icon="mdi:translate"
                            class="text-sm text-muted-foreground"
                        />
                        <span class="text-xs font-medium uppercase"
                            >{$currentLanguage}</span
                        >
                    </Button>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" class="min-w-[9rem]">
                {#each languages as lang}
                    <DropdownMenu.Item
                        class="cursor-pointer {$currentLanguage === lang.code
                            ? 'bg-accent'
                            : ''}"
                        onclick={() => {
                            $currentLanguage = lang.code;
                        }}
                    >
                        {lang.name}
                        {#if $currentLanguage === lang.code}
                            <Icon
                                icon="mdi:check"
                                class="ml-auto text-primary text-sm"
                            />
                        {/if}
                    </DropdownMenu.Item>
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
</header>
