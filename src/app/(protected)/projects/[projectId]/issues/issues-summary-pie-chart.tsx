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
import { type GitHubIssue } from "@/types/types";
import { useTheme } from "next-themes";
const prepareChartData = (
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[],
) => {
  const allIssues = groupedIssues.flatMap((group) => group.items || []);

  const openIssues = allIssues.filter((issue) => issue.state === "open").length;
  const closedIssues = allIssues.filter(
    (issue) => issue.state === "closed",
  ).length;
  const dismissedIssues = allIssues.filter(
    (issue) => issue.state === "dismissed",
  ).length;

  return [
    {
      state: "open",
      issues: openIssues,
      fill: "var(--color-open)",
    },
    {
      state: "closed",
      issues: closedIssues,
      fill: "var(--color-closed)",
    },
    {
      state: "dismissed",
      issues: dismissedIssues,
      fill: "var(--color-dismissed)",
    },
  ];
};

interface IssuesSummaryPieChartProps {
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

const IssuesSummaryPieChart = ({
  groupedIssues,
}: IssuesSummaryPieChartProps) => {
  const { theme } = useTheme();
  const chartData = prepareChartData(groupedIssues);
  const totalIssues = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.issues, 0);
  }, [chartData]);

  const chartConfig = {
    issues: {
      label: "Issues",
    },
    open: {
      label: "Open",
      color: theme === "dark" ? "#38B2AC" : "#81E6D9",
    },
    closed: {
      label: "Closed",
      color: theme === "dark" ? "#5A67D8" : "#A3BFFA",
    },
    dismissed: {
      label: "Dismissed",
      color: theme === "dark" ? "#F56565" : "#FBB6B6",
    },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col justify-between gap-0 rounded-md">
      <CardHeader className="items-center">
        <CardTitle>Pie Chart - Issues Summary</CardTitle>
        <CardDescription>{`${groupedIssues?.[groupedIssues.length - 1]?.month} - ${groupedIssues?.[0]?.month}`}</CardDescription>
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
                  const { state, issues } = payload[0]?.payload;
                  return (
                    <div className="rounded-md border bg-white p-2 shadow-sm">
                      <div className="text-xs font-semibold text-gray-700">
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {issues} Issues
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              dataKey="issues"
              nameKey="issues"
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
                          {totalIssues.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Issues
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
          Issues Distribution
        </div>
        <div className="text-center leading-none text-muted-foreground">
          Showing the proportion of open vs closed issues in the project
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssuesSummaryPieChart;
