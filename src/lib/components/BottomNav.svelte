<script>
    import Icon from "@iconify/svelte";
    import { page } from "$app/stores";
    import { t, isRTL } from "$lib/stores/i18nStore.js";

    const navItems = [
        {
            href: "/dashboard",
            icon: "mdi:view-dashboard",
            iconOutline: "mdi:view-dashboard-outline",
            labelKey: "dashboard",
        },
        {
            href: "/clients",
            icon: "mdi:account-group",
            iconOutline: "mdi:account-group-outline",
            labelKey: "clients",
        },
        {
            href: "/debts",
            icon: "mdi:cash-clock",
            iconOutline: "mdi:cash-clock",
            labelKey: "debts",
        },
        {
            href: "/settings",
            icon: "mdi:cog",
            iconOutline: "mdi:cog-outline",
            labelKey: "settings",
        },
    ];

    /**
     * @param {string} href
     * @param {string} pathname
     */
    function isActive(href, pathname) {
        return pathname.startsWith(href);
    }
</script>

<nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg"
>
    <div
        class="flex items-center justify-around py-1.5 px-2 max-w-lg mx-auto"
        class:flex-row-reverse={$isRTL}
    >
        {#each navItems as item}
            {@const active = isActive(item.href, $page.url.pathname)}
            <a
                href={item.href}
                class="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[4rem] group relative"
                class:text-primary={active}
                class:text-muted-foreground={!active}
            >
                {#if active}
                    <div
                        class="absolute -top-1.5 w-8 h-1 rounded-full bg-primary"
                    ></div>
                {/if}
                <div class="relative">
                    <Icon
                        icon={active ? item.icon : item.iconOutline}
                        class="text-xl transition-transform duration-200 group-hover:scale-110"
                    />
                </div>
                <span class="text-[0.625rem] font-semibold tracking-wide"
                    >{$t(item.labelKey)}</span
                >
            </a>
        {/each}
    </div>
</nav>
