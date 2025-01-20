"use client";

import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

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
            merged: items.filter((pr) => pr.mergedAt !== null).length, // PRs that were merged
            closed: items.filter((pr) => pr.closedAt !== null).length, // PRs that were closed
          };
        })
        .reverse();
    case "open":
      return groupedPrs
        .map((group) => {
          const items = group.items || [];
          return {
            month: group.month,
            created: items.filter((item) => item.state === "open").length,
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
              (pr) => pr.state === "closed" && pr.mergedAt === null,
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
            merged: items.filter((pr) => pr.mergedAt !== null).length,
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

const MonthlyPrsAreaChart = ({
  groupedPrs,
  currentTab,
}: MonthlyIssueChartProps) => {
  const chartData = prepareChartData(groupedPrs, currentTab);

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Area Chart - Monthly Pull Request Statistics</CardTitle>
        <CardDescription>{`${chartData?.[0]?.month} - ${chartData?.[chartData.length - 1]?.month}`}</CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData?.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
              domain={["auto", "dataMax + 2"]}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="created"
              type="natural"
              fill="var(--color-created)"
              fillOpacity={0.4}
              stroke="var(--color-created)"
              stackId="a"
            />
            <Area
              dataKey="closed"
              type="natural"
              fill="var(--color-closed)"
              fillOpacity={0.4}
              stroke="var(--color-closed)"
              stackId="a"
            />
            <Area
              dataKey="merged"
              type="natural"
              fill="var(--color-merged)"
              fillOpacity={0.4}
              stroke="var(--color-merged)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Monthly Pull Request Statistics
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total statistics for the selected timeframe
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlyPrsAreaChart;
