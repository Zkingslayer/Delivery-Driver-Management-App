<script>
    import Icon from "@iconify/svelte";
    import { Button } from "$lib/components/ui/button";

    let { icon = "mdi:plus", onclick, label = "" } = $props();
</script>

<Button
    {onclick}
    size="icon"
    class="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 cursor-pointer group"
    title={label}
>
    <Icon
        {icon}
        class="text-2xl transition-transform group-hover:rotate-90 duration-300"
    />
</Button>
