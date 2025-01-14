"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
import { type GitHubIssue } from "@/types/types";
import { calculateTrend } from "@/lib/utils";

const prepareChartData = (
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[],
  currentTab: string,
) => {
  if (currentTab !== "all") {
    return groupedIssues
      .map((group) => ({
        month: group.month,
        items: group.items?.filter((item) => item.issueState === currentTab)
          .length,
      }))
      .reverse();
  }

  return groupedIssues
    .map((group) => ({
      month: group.month,
      items: group.items?.length,
    }))
    .reverse();
};

const chartConfig = {
  issue: {
    label: "Issues",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface MonthlyIssueChartProps {
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
  currentTab: string;
}

const MonthlyIssuesChart = ({
  groupedIssues,
  currentTab,
}: MonthlyIssueChartProps) => {
  const chartData = prepareChartData(groupedIssues, currentTab);
  const { trend, isPositive } = calculateTrend(chartData);

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Bar Chart - Issues</CardTitle>
        <CardDescription>{`${chartData?.[0]?.month} - ${chartData?.[5]?.month}`}</CardDescription>
      </CardHeader>
      <CardContent className="">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="items" fill="var(--color-issue)" radius={4}>
              {/* <LabelList
                position="insideTopRight"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              /> */}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {isPositive ? "up" : "down"} by {trend}% this month{" "}
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total Issues for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlyIssuesChart;
