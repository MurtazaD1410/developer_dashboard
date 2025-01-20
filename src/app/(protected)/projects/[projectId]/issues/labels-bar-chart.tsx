"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import _ from "lodash";
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

const prepareChartData = (issues: GitHubIssue[], currentTab: string) => {
  let labeledIssues = issues.flatMap((issue) =>
    issue.label
      ? issue.label.map((label) => ({
          label: label,
          issue,
        }))
      : [],
  );

  if (currentTab !== "all") {
    labeledIssues = issues
      .filter((item) => item.state === currentTab)
      .flatMap((issue) =>
        issue.label
          ? issue.label.map((label) => ({
              label: label,
              issue,
            }))
          : [],
      );
  }

  const groupedByLabel = labeledIssues.reduce(
    (
      acc: Record<
        string,
        { label: string; issues: GitHubIssue[]; fill: string }
      >,
      { label, issue },
    ) => {
      label.name?.split(",").forEach((labelName) => {
        if (!acc[labelName]) {
          acc[labelName] = {
            label: labelName,
            issues: [],
            fill: label.color ?? "",
          };
        }
        acc[labelName]?.issues.push(issue);
      });
      return acc;
    },
    {},
  );

  const result = Object.values(groupedByLabel).map(
    ({ label, issues, fill }) => ({
      label,
      issues: issues.length,
      fill: `#${fill}`,
    }),
  );

  return result;
};

const generateChartConfig = (labels: string[]): ChartConfig => {
  const baseConfig: ChartConfig = {
    issues: {
      label: "Issues",
    },
  };

  // Add dynamic entries for each label
  const labelConfigs = labels.reduce((acc: ChartConfig, label, index) => {
    acc[label] = {
      label: label,
      color: `hsl(var(--chart-${index + 1}))`,
    };
    return acc;
  }, {});

  return {
    ...baseConfig,
    ...labelConfigs,
  };
};

interface LabelsBarChartProps {
  issues: GitHubIssue[];
  currentTab: string;
  startMonth: string;
  endMonth: string;
}

const IssueLabelsBarChart = ({
  issues,
  currentTab,
  startMonth,
  endMonth,
}: LabelsBarChartProps) => {
  const chartData = prepareChartData(issues, currentTab);
  const chartConfig = generateChartConfig(
    chartData.map((labelGroup) => labelGroup.label),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Issue Labels</CardTitle>
        <CardDescription>
          {startMonth} - {endMonth}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData.length && (
          <div>No data available for the selected timeframe.</div>
        )}
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 50,
            }}
          >
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={({ x, y, payload }) => {
                const maxLength = 15; // Maximum length for labels
                const label =
                  payload.value.length > maxLength
                    ? `${payload.value.slice(0, maxLength)}...`
                    : payload.value;

                return (
                  <text
                    x={x}
                    y={y}
                    dy={3}
                    textAnchor="end"
                    fill="#000"
                    fontSize="12"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {label}
                  </text>
                );
              }}
            />
            <XAxis dataKey="issues" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="issues" layout="vertical" radius={5}></Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Distribution of issues for different labels
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total issues for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default IssueLabelsBarChart;
