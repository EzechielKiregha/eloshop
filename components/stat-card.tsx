import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
            {description && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>}
          </div>
          <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">
            <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
