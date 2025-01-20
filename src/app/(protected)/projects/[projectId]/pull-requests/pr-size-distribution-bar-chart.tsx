import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { type GitHubPullRequest } from "@/types/types";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

const prepareChartData = (
  groupedPrs: { month: string; items: GitHubPullRequest[] | undefined }[],
) => {
  const prSizeData = groupedPrs.map((group) => {
    const sizes = {
      small: 0,
      medium: 0,
      large: 0,
    };

    // Filter based on the current tab state
    const filteredPrs = group.items;

    // Calculate sizes for the filtered PRs
    filteredPrs?.forEach((pr) => {
      const totalChanges = pr.additions + pr.deletions;
      if (totalChanges < 50) sizes.small++;
      else if (totalChanges < 300) sizes.medium++;
      else sizes.large++;
    });

    return {
      month: group.month,
      ...sizes,
    };
  });

  return prSizeData;
};

const chartConfig = {
  small: {
    label: "Small (<50 changes)",
    color: "#82ca9d",
  },
  medium: {
    label: "Medium (50-300 changes)",
    color: "#8884d8",
  },
  large: {
    label: "Large (>300 changes)",
    color: "#ffc658",
  },
};

interface PrSizeDistributionBarChartProps {
  groupedPrs: { month: string; items: GitHubPullRequest[] | undefined }[];
}

const PrSizeDistributionBarChart = ({
  groupedPrs,
}: PrSizeDistributionBarChartProps) => {
  const chartData = prepareChartData(groupedPrs);

  return (
    <div className="space-y-6">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Bar Chart - PR Size Distribution Over Time</CardTitle>
          <CardDescription>{`${chartData?.[0]?.month} - ${chartData?.[chartData.length - 1]?.month}`}</CardDescription>
        </CardHeader>

        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
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
                content={
                  <ChartTooltipContent indicator="line" className="w-52" />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="small"
                stackId="a"
                type="natural"
                fill="var(--color-small)"
                stroke="var(--color-small)"
                radius={4}
              />
              <Bar
                dataKey="medium"
                type="natural"
                fill="var(--color-medium)"
                stroke="var(--color-medium)"
                stackId="a"
                radius={4}
              />
              <Bar
                dataKey="large"
                type="natural"
                fill="var(--color-large)"
                stroke="var(--color-large)"
                stackId="a"
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

export default PrSizeDistributionBarChart;
