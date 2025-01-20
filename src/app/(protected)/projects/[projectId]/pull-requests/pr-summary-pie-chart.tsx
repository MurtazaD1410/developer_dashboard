"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

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
} from "@/components/ui/chart";
import { type GitHubPullRequest } from "@/types/types";
const prepareChartData = (
  gropedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[],
) => {
  const allPrs = gropedPrs.flatMap((group) => group.items || []);

  const open = allPrs.filter((item) => item.state === "open").length;
  const closedPrs = allPrs.filter(
    (pr) => pr.state === "closed" && pr.mergedAt === null,
  ).length;
  const mergedPrs = allPrs.filter((pr) => pr.mergedAt !== null).length;

  return [
    {
      state: "open",
      prs: open,
      fill: "var(--color-created)",
    },
    {
      state: "closed",
      prs: closedPrs,
      fill: "var(--color-closed)",
    },
    {
      state: "merged",
      prs: mergedPrs,
      fill: "var(--color-merged)",
    },
  ];
};

const chartConfig = {
  created: {
    label: "Open PRs",
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

interface PrsSummaryPieChartProps {
  groupedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[];
}

const PrsSummaryPieChart = ({ groupedPrs }: PrsSummaryPieChartProps) => {
  const chartData = prepareChartData(groupedPrs);
  const totalPrs = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.prs, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col justify-between gap-0 rounded-md">
      <CardHeader className="items-center">
        <CardTitle>Pie Chart - Pull Requests Summary</CardTitle>
        <CardDescription>{`${groupedPrs?.[groupedPrs.length - 1]?.month} - ${groupedPrs?.[0]?.month}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!chartData.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const { state, prs } = payload[0]?.payload;
                  return (
                    <div className="rounded-md border bg-white p-2 shadow-sm">
                      <div className="text-xs font-semibold text-gray-700">
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500">{prs} Prs</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="prs"
              nameKey="prs"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalPrs.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Pull Requests
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-center font-medium leading-none">
          Pull Requests Summary
        </div>
        <div className="text-center leading-none text-muted-foreground">
          Showing the open, closed and merged pull requests for the project
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrsSummaryPieChart;
