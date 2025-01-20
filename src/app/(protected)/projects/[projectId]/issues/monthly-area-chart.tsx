"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
        items: group.items?.filter((item) => item.state === currentTab).length,
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
  items: {
    label: "Issues",
  },
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

const MonthlyIssuesAreaChart = ({
  groupedIssues,
  currentTab,
}: MonthlyIssueChartProps) => {
  const chartData = prepareChartData(groupedIssues, currentTab);

  return (
    <Card className="h-full rounded-md">
      <CardHeader>
        <CardTitle>Area Chart - Issues</CardTitle>
        <CardDescription>{`${chartData?.[0]?.month} - ${chartData?.[chartData.length - 1]?.month}`}</CardDescription>
      </CardHeader>
      <CardContent className="">
        {!chartData.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
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
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleString("en-US", { month: "short" })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="items"
              type="natural"
              fill="var(--color-issue)"
              fillOpacity={0.4}
              stroke="var(--color-issue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Issues Over Time
        </div>
        <div className="leading-none text-muted-foreground">
          Tracking the volume of issues created and resolved across the project
          timeline
        </div>
      </CardFooter>
    </Card>
  );
};

export default MonthlyIssuesAreaChart;
