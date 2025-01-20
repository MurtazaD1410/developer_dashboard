"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
const chartData = [
  { month: "January", quick: 186, medium: 80, long: 80 },
  { month: "February", quick: 305, medium: 200, long: 200 },
  { month: "March", quick: 237, medium: 120, long: 120 },
  { month: "April", quick: 73, medium: 190, long: 190 },
  { month: "May", quick: 209, medium: 130, long: 130 },
  { month: "June", quick: 214, medium: 140, long: 140 },
];

const chartConfig: ChartConfig = {
  quick: { label: "< 1 day", color: "rgb(34 197 94)" },
  medium: { label: "1-7 days", color: "rgb(168 85 247)" },
  long: { label: "> 7 days", color: "rgb(245 158 11)" },
};

const IssueResolutionDistributionPlaceholderBarChart = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
        <Button variant="default" className="font-semibold">
          Upgrade to Pro
        </Button>
      </div>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Bar Chart - Issue Resolution Times</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="quick"
                stackId="a"
                fill="var(--color-quick)"
                radius={4}
              />
              <Bar
                dataKey="medium"
                stackId="a"
                fill="var(--color-medium)"
                radius={4}
              />
              <Bar
                dataKey="long"
                stackId="a"
                fill="var(--color-long)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Resolution Time Analysis
          </div>
          <div className="leading-none text-muted-foreground">
            Time taken to resolve issues grouped by duration ranges
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IssueResolutionDistributionPlaceholderBarChart;
