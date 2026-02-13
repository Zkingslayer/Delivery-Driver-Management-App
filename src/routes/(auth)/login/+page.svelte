<script>
    import Icon from "@iconify/svelte";
    import { goto } from "$app/navigation";
    import { driverStore } from "$lib/stores/driverStore.js";
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Progress } from "$lib/components/ui/progress";

    let status = $state("checking"); // 'checking', 'verified', 'failed'
    let progress = $state(0);

    $effect(() => {
        // Simulate verification
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                status = "verified";
                driverStore.verify();
                setTimeout(() => goto("/dashboard"), 800);
            }
        }, 200);

        return () => clearInterval(interval);
    });

    function retry() {
        status = "checking";
        progress = 0;
    }
</script>

<div class="flex-1 flex flex-col items-center justify-center px-6">
    <!-- Background glow -->
    <div
        class="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <!-- Logo -->
    <div class="relative mb-8 animate-fade-in">
        <div
            class="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl"
        >
            <Icon
                icon="mdi:truck-delivery"
                class="text-5xl text-primary-foreground"
            />
        </div>
        {#if status === "checking"}
            <div
                class="absolute -inset-2 rounded-[1.75rem] border-2 border-primary/30 animate-pulse"
            ></div>
        {/if}
    </div>

    <!-- Title -->
    <h1 class="text-2xl font-bold text-foreground mb-1 animate-fade-in">
        Delivery Manager
    </h1>
    <p class="text-sm text-muted-foreground mb-10 animate-fade-in">
        Track • Manage • Deliver
    </p>

    <!-- Status Card -->
    <div class="w-full max-w-xs animate-fade-in">
        {#if status === "checking"}
            <Card.Root>
                <Card.Content class="pt-6 text-center">
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <Icon
                            icon="mdi:shield-check"
                            class="text-2xl text-primary animate-pulse"
                        />
                        <span class="text-sm font-medium text-muted-foreground"
                            >Checking License...</span
                        >
                    </div>
                    <!-- Progress bar -->
                    <Progress value={Math.min(progress, 100)} class="h-1.5" />
                    <p class="text-xs text-muted-foreground mt-3">
                        Verifying device identity...
                    </p>
                </Card.Content>
            </Card.Root>
        {:else if status === "verified"}
            <Card.Root class="border-emerald-300">
                <Card.Content class="pt-6 text-center">
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <div
                            class="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center"
                        >
                            <Icon
                                icon="mdi:check-circle"
                                class="text-2xl text-emerald-500"
                            />
                        </div>
                    </div>
                    <p class="text-sm font-medium text-emerald-600">
                        License Verified!
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">
                        Redirecting to dashboard...
                    </p>
                </Card.Content>
            </Card.Root>
        {:else}
            <Card.Root class="border-destructive/30">
                <Card.Content class="pt-6 text-center">
                    <div class="flex items-center justify-center gap-2 mb-3">
                        <Icon
                            icon="mdi:alert-circle"
                            class="text-2xl text-destructive"
                        />
                        <span class="text-sm font-medium text-destructive"
                            >Verification Failed</span
                        >
                    </div>
                    <p class="text-xs text-muted-foreground mb-4">
                        Could not verify your license. Please check your
                        internet connection.
                    </p>
                    <Button class="w-full gap-2" onclick={retry}>
                        <Icon icon="mdi:refresh" class="text-lg" />
                        Retry
                    </Button>
                </Card.Content>
            </Card.Root>
        {/if}
    </div>

    <!-- Offline Warning -->
    <div
        class="mt-6 flex items-center gap-2 text-xs text-amber-500/70 animate-fade-in"
    >
        <Icon icon="mdi:wifi-off" class="text-sm" />
        <span>Offline mode available after first verification</span>
    </div>
</div>
