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
import { redirect } from "next/navigation";
import { useTheme } from "next-themes";
const chartData = [
  { month: "January", small: 186, medium: 80, large: 80 },
  { month: "February", small: 305, medium: 200, large: 200 },
  { month: "March", small: 237, medium: 120, large: 120 },
  { month: "April", small: 73, medium: 190, large: 190 },
  { month: "May", small: 209, medium: 130, large: 130 },
  { month: "June", small: 214, medium: 140, large: 140 },
];

const PrSizeDistributionBarChartPlaceholder = () => {
  const { theme } = useTheme();

  const chartConfig = {
    small: {
      label: "Small (<50 changes)",
      color: theme === "dark" ? "#2B6CB0" : "#63B3ED", // Blue
    },
    medium: {
      label: "Medium (50-300 changes)",
      color: theme === "dark" ? "#D69E2E" : "#F6E05E", // Yellow
    },
    large: {
      label: "Large (>300 changes)",
      color: theme === "dark" ? "#E53E3E" : "#FC8181", // Red
    },
  } satisfies ChartConfig;

  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
        <Button
          variant="default"
          className="font-semibold"
          onClick={() => {
            redirect("/billing");
          }}
        >
          Upgrade to Pro
        </Button>
      </div>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Bar Chart - PR Size Distribution Over Time</CardTitle>
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
                dataKey="small"
                stackId="a"
                fill="var(--color-small)"
                radius={4}
              />
              <Bar
                dataKey="medium"
                stackId="a"
                fill="var(--color-medium)"
                radius={4}
              />
              <Bar
                dataKey="large"
                stackId="a"
                fill="var(--color-large)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Pull Request Size Distribution Over Time
          </div>
          <div className="leading-none text-muted-foreground">
            Categorizing into size depending on the changes made
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PrSizeDistributionBarChartPlaceholder;
