"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type GitHubPullRequest } from "@/types/types";
import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const prepareChartData = (
  groupedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[],
) => {
  const reviewTimeData = groupedPrs.map((group) => {
    const avgReviewTime =
      (group.items ?? [])
        .filter((pr) => pr.mergedAt)
        .reduce((acc, pr) => {
          const created = new Date(pr.createdAt).getTime();
          const merged = new Date(pr.mergedAt!).getTime();
          return acc + (merged - created) / (1000 * 60 * 60); // Convert to hours
        }, 0) / (group.items?.filter((pr) => pr.mergedAt).length || 1);

    return {
      month: group.month,
      avgReviewTime: Math.round(avgReviewTime),
    };
  });

  return reviewTimeData;
};

// Example usage
const chartConfig = {
  avgReviewTime: {
    label: `Avg review time`,
    color: "hsl(var(--primary))",
  },
};

interface AvgReviewTimeLineChartProps {
  groupedPrs: {
    month: string;
    items: GitHubPullRequest[] | undefined;
  }[];
}

const AvgReviewTimeLineChart = ({
  groupedPrs,
}: AvgReviewTimeLineChartProps) => {
  const chartData = prepareChartData(groupedPrs).reverse();

  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>Line Chart - Average Review Time (Hours)</CardTitle>
        <CardDescription>{`${chartData?.[0]?.month} - ${chartData?.[chartData.length - 1]?.month}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
              domain={["auto", "dataMax + 2"]}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent indicator="line" className="w-36" />
              }
            />
            <Line
              dataKey="avgReviewTime"
              type="natural"
              stroke="var(--color-avgReviewTime)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Average Review Time (Hours)
        </div>
        <div className="leading-none text-muted-foreground">
          Showing the average time in hours spent in reviewing
        </div>
      </CardFooter>
    </Card>
  );
};

export default AvgReviewTimeLineChart;
