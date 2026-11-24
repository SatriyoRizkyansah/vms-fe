import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type DashboardMetric = {
  label: string;
  value: string;
  badge: string;
  description: string;
  icon: ReactNode;
};

export function SectionCards({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, badge, description, icon }) => (
        <Card key={label} className="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="gap-1.5">
                {icon}
                {badge}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            {description}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
