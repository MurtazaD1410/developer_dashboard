"use client";

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
import { type GitHubPullRequest } from "@/types/types";

const prepareChartData = (prs: GitHubPullRequest[], currentTab: string) => {
  let labeledPrs = prs.flatMap((pr) =>
    pr.label
      ? pr.label.map((label) => ({
          label: label,
          pr,
        }))
      : [],
  );

  switch (currentTab) {
    case "open":
      labeledPrs = prs
        .filter((pr) => pr.state === "open")
        .flatMap((pr) =>
          pr.label
            ? pr.label.map((label) => ({
                label: label,
                pr,
              }))
            : [],
        );
      break;
    case "closed":
      labeledPrs = prs
        .filter((pr) => pr.state === "closed" && pr.mergedAt === null)
        .flatMap((pr) =>
          pr.label
            ? pr.label.map((label) => ({
                label: label,
                pr,
              }))
            : [],
        );
      break;

    case "merged":
      labeledPrs = prs
        .filter((pr) => pr.mergedAt !== null)
        .flatMap((pr) =>
          pr.label
            ? pr.label.map((label) => ({
                label: label,
                pr,
              }))
            : [],
        );
      break;

    default:
      break;
  }

  const groupedByLabel = labeledPrs.reduce(
    (
      acc: Record<
        string,
        { label: string; prs: GitHubPullRequest[]; fill: string }
      >,
      { label, pr },
    ) => {
      label.name?.split(",").forEach((labelName) => {
        if (!acc[labelName]) {
          acc[labelName] = {
            label: labelName,
            prs: [],
            fill: label.color ?? "",
          };
        }
        acc[labelName]?.prs.push(pr);
      });
      return acc;
    },
    {},
  );

  const result = Object.values(groupedByLabel).map(({ label, prs, fill }) => ({
    label,
    prs: prs.length,
    fill: `#${fill}`,
  }));

  return result;
};

const generateChartConfig = (labels: string[]): ChartConfig => {
  const baseConfig: ChartConfig = {
    prs: {
      label: "Prs",
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
  prs: GitHubPullRequest[];
  currentTab: string;
  startMonth: string;
  endMonth: string;
}

const PrLabelsBarChart = ({
  prs,
  currentTab,
  startMonth,
  endMonth,
}: LabelsBarChartProps) => {
  const chartData = prepareChartData(prs, currentTab);
  const chartConfig = generateChartConfig(
    chartData.map((labelGroup) => labelGroup.label),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Pull Request Labels</CardTitle>
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
            <XAxis dataKey="prs" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="prs" layout="vertical" radius={5}></Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Distribution of pull requests for different labels
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total pull requests for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrLabelsBarChart;
