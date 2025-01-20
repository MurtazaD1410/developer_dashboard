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
const chartData = [
  { month: "January", simple: 86, moderate: 80, complex: 80 },
  { month: "February", simple: 50, moderate: 20, complex: 20 },
  { month: "March", simple: 27, moderate: 120, complex: 70 },
  { month: "April", simple: 73, moderate: 19, complex: 90 },
  { month: "May", simple: 20, moderate: 30, complex: 130 },
  { month: "June", simple: 14, moderate: 40, complex: 140 },
];

const chartConfig: ChartConfig = {
  simple: { label: "Simple", color: "rgb(34 197 94)" },
  moderate: { label: "Moderate", color: "rgb(168 85 247)" },
  complex: { label: "Complex", color: "rgb(245 158 11)" },
};

const IssueComplexityDistributionBarChart = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
        <Button
          variant="default"
          className="font-semibold"
          onClick={() => redirect("/billing")}
        >
          Upgrade to Pro
        </Button>
      </div>
      <Card className="rounded-sm">
        <CardHeader>
          <CardTitle>Bar Chart - Issue Complexity Distribution</CardTitle>
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
                dataKey="simple"
                stackId="a"
                fill="var(--color-simple)"
                radius={4}
              />
              <Bar
                dataKey="moderate"
                stackId="a"
                fill="var(--color-moderate)"
                radius={4}
              />
              <Bar
                dataKey="complex"
                stackId="a"
                fill="var(--color-complex)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Issue Complexity Analysis
          </div>
          <div className="leading-none text-muted-foreground">
            Distribution of issues by complexity level to track project
            difficulty
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IssueComplexityDistributionBarChart;
