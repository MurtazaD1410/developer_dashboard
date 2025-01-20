"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const AvgReviewTimeLineChartPlaceholder = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
        <Button variant="default" className="font-semibold">
          Upgrade to Pro
        </Button>
      </div>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Line Chart - Average Review Time (Hours)</CardTitle>
          <CardDescription>January 2024 - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="desktop"
                type="natural"
                stroke="var(--color-desktop)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Average Review Time (Hours)
          </div>
          <div className="leading-none text-muted-foreground">
            Showing the average time in hours spent in reviewing
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AvgReviewTimeLineChartPlaceholder;
