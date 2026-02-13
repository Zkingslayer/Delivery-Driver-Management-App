<script>
    import { Badge } from "$lib/components/ui/badge";
    import { getStatusInfo } from "$lib/utils/helpers.js";

    let { status = "unpaid" } = $props();

    const info = $derived(getStatusInfo(status));
    const variant = $derived(
        status === "paid"
            ? "outline"
            : status === "partially_paid"
              ? "secondary"
              : "destructive",
    );
</script>

<Badge
    {variant}
    class={status === "paid"
        ? "text-emerald-600 border-emerald-300"
        : status === "partially_paid"
          ? "text-amber-600"
          : ""}
>
    {info.label}
</Badge>
