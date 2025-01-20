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

const prepareComplexityData = (
  groupedIssues: { month: string; items: GitHubIssue[] | undefined }[],
) => {
  return groupedIssues.map((group) => {
    const complexityMetrics = {
      simple: 0, // 0-2 comments, 0-1 labels
      moderate: 0, // 3-5 comments, 2-3 labels
      complex: 0, // >5 comments or >3 labels
    };

    group.items?.forEach((issue) => {
      const commentCount = issue.comments;
      const labelCount = issue.label?.length || 0;

      if (commentCount <= 2 && labelCount <= 1) complexityMetrics.simple++;
      else if (commentCount <= 5 && labelCount <= 3)
        complexityMetrics.moderate++;
      else complexityMetrics.complex++;
    });

    return {
      month: group.month,
      ...complexityMetrics,
    };
  });
};

interface IssueComplexityDistributionBarChartProps {
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

const IssueComplexityDistributionBarChart = ({
  groupedIssues,
}: IssueComplexityDistributionBarChartProps) => {
  const complexityData = useMemo(
    () => prepareComplexityData(groupedIssues.reverse()),
    [groupedIssues],
  );

  const chartConfig: ChartConfig = {
    simple: { label: "Simple", color: "rgb(34 197 94)" },
    moderate: { label: "Moderate", color: "rgb(168 85 247)" },
    complex: { label: "Complex", color: "rgb(245 158 11)" },
  };

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Bar Chart - Issue Complexity Distribution</CardTitle>
        <CardDescription>
          {`${groupedIssues?.[groupedIssues.length - 1]?.month} - ${groupedIssues?.[0]?.month}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!complexityData.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <BarChart data={complexityData} layout="horizontal" margin={{}}>
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
              dataKey="simple"
              stackId="a"
              fill="rgb(34 197 94)"
              name="Simple"
              radius={4}
            />
            <Bar
              dataKey="moderate"
              stackId="a"
              fill="rgb(168 85 247)"
              name="Moderate"
              radius={4}
            />
            <Bar
              dataKey="complex"
              stackId="a"
              fill="rgb(245 158 11)"
              name="Complex"
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
          Distribution of issues by complexity level to track project difficulty
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueComplexityDistributionBarChart;
