"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function DashboardRefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    toast.info("Actualizando…");
    router.refresh();
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Datos actualizados");
    }, 800);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-none border-2 border-[#111111] gap-2"
      onClick={handleRefresh}
      disabled={refreshing}
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
      {refreshing ? "Actualizando…" : "Actualizar"}
    </Button>
  );
}
