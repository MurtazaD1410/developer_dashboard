"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { type GitHubPullRequest } from "@/types/types";

const prepareChartData = (
  groupedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[],
  currentTab: string,
) => {
  switch (currentTab) {
    case "all":
      return groupedPrs
        .map((group) => {
          const items = group.items || [];

          return {
            month: group.month,
            created: items.length, // Total PRs created
            merged: items.filter((pr) => pr.prMergedAt !== null).length, // PRs that were merged
            closed: items.filter((pr) => pr.prClosedAt !== null).length, // PRs that were closed
          };
        })
        .reverse();
    case "open":
      return groupedPrs
        .map((group) => {
          const items = group.items || [];
          return {
            month: group.month,
            created: items.filter((item) => item.prState === "open").length,
          };
        })
        .reverse();
    case "closed":
      return groupedPrs
        .map((group) => {
          const items = group.items || [];
          return {
            month: group.month,
            closed: items.filter(
              (pr) => pr.prState === "closed" && pr.prMergedAt === null,
            ).length,
          };
        })
        .reverse();
    case "merged":
      return groupedPrs
        .map((group) => {
          const items = group.items || [];
          return {
            month: group.month,
            merged: items.filter((pr) => pr.prMergedAt !== null).length,
          };
        })
        .reverse();

    default:
      break;
  }
};

const chartConfig = {
  created: {
    label: "Created PRs",
    color: "rgb(34 197 94 / var(--tw-text-opacity, 1))",
  },
  merged: {
    label: "Merged PRs",
    color: "rgb(168 85 247 / var(--tw-text-opacity, 1))",
  },
  closed: {
    label: "Closed PRs",
    color: "rgb(239 68 68 / var(--tw-text-opacity, 1))",
  },
} satisfies ChartConfig;

interface MonthlyIssueChartProps {
  groupedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[];
  currentTab: string;
}

const MonthlyPrsChart = ({
  groupedPrs,
  currentTab,
}: MonthlyIssueChartProps) => {
  const chartData = prepareChartData(groupedPrs, currentTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Pull Requests</CardTitle>
        <CardDescription>{`${chartData?.[5]?.month} - ${chartData?.[0]?.month}`}</CardDescription>
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
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="created" fill="var(--color-created)" radius={4} />
            <Bar dataKey="merged" fill="var(--color-merged)" radius={4} />
            <Bar dataKey="closed" fill="var(--color-closed)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlyPrsChart;
