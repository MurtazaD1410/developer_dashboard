"use client";

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
import { type GitHubIssue } from "@/types/types";
import React, { useMemo } from "react";
import { useTheme } from "next-themes";

const prepareResolutionData = (
  groupedIssues: { month: string; items: GitHubIssue[] | undefined }[],
) => {
  return groupedIssues.map((group) => {
    const resolutionTimes = {
      quick: 0,
      medium: 0,
      long: 0,
    };

    group.items?.forEach((issue) => {
      if (issue.state === "closed" && issue.closedAt) {
        const timeToResolve =
          (new Date(issue.closedAt).getTime() -
            new Date(issue.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);

        if (timeToResolve < 1) resolutionTimes.quick++;
        else if (timeToResolve < 7) resolutionTimes.medium++;
        else resolutionTimes.long++;
      }
    });

    return {
      month: group.month,
      ...resolutionTimes,
    };
  });
};

interface IssueResolutionDistributionBarChartProps {
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

const IssueResolutionDistributionBarChart = ({
  groupedIssues,
}: IssueResolutionDistributionBarChartProps) => {
  const { theme } = useTheme();
  const resolutionData = useMemo(
    () => prepareResolutionData(groupedIssues.reverse()),
    [groupedIssues],
  );

  const chartConfig: ChartConfig = {
    quick: {
      label: "< 1 day",
      color: theme === "dark" ? "#38B2AC" : "#81E6D9",
    },
    medium: {
      label: "1-7 days",
      color: theme === "dark" ? "#D69E2E" : "#FBBF24",
    },
    long: {
      label: "> 7 days",
      color: theme === "dark" ? "#6B46C1" : "#B794F4",
    },
  };

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Bar Chart - Issue Resolution Times</CardTitle>
        <CardDescription>
          {`${groupedIssues?.[groupedIssues.length - 1]?.month} - ${groupedIssues?.[0]?.month}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!resolutionData.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <BarChart data={resolutionData} layout="horizontal" margin={{}}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleString("en-US", { month: "short" })
              }
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="quick"
              stackId="a"
              fill="var(--color-quick)"
              name="< 1 day"
              radius={4}
            />
            <Bar
              dataKey="medium"
              stackId="b"
              fill="var(--color-medium)"
              name="1-7 days"
              radius={4}
            />
            <Bar
              dataKey="long"
              stackId="c"
              fill="var(--color-long)"
              name="> 7 days"
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
  );
};

export default IssueResolutionDistributionBarChart;
