import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { VisitRecord } from "@/utils/vms";

const chartConfig = {
  visits: { label: "Kunjungan", color: "var(--primary)" },
} satisfies ChartConfig;

const dateOptions: Intl.DateTimeFormatOptions = {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

function jakartaDateKey(date: Date | string) {
  const parts = new Intl.DateTimeFormat("en-CA", dateOptions).formatToParts(new Date(date));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00+07:00`).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    month: "short",
    day: "numeric",
  });
}

export function ChartAreaInteractive({ visits }: { visits: VisitRecord[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");
  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const chartData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const today = jakartaDateKey(new Date());
    const todayStart = new Date(`${today}T00:00:00+07:00`);
    const dates = Array.from({ length: days }, (_, index) =>
      jakartaDateKey(new Date(todayStart.getTime() - (days - index - 1) * 24 * 60 * 60 * 1000)),
    );
    const counts = new Map(dates.map((date) => [date, 0]));
    visits.forEach((visit) => {
      const date = jakartaDateKey(visit.scheduled_start);
      if (counts.has(date)) counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return dates.map((date) => ({ date, visits: counts.get(date) ?? 0 }));
  }, [timeRange, visits]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren kunjungan</CardTitle>
        <CardDescription>Jumlah kunjungan terjadwal menurut tanggal (WIB).</CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[timeRange]}
            onValueChange={(value) => setTimeRange(value[0] ?? "30d")}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">90 hari</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 hari</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 hari</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
            <SelectTrigger className="w-28 @[767px]/card:hidden" size="sm" aria-label="Pilih rentang waktu">
              <SelectValue placeholder="30 hari" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">90 hari</SelectItem>
              <SelectItem value="30d">30 hari</SelectItem>
              <SelectItem value="7d">7 hari</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={chartData} accessibilityLayer>
            <defs>
              <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDate}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(String(value))}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="visits"
              type="monotone"
              fill="url(#fillVisits)"
              stroke="var(--color-visits)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
