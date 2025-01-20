"use client";

import React, { useState } from "react";
import IssueLog from "./issue-log";
import MonthlyIssuesAreaChart from "./monthly-area-chart";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import IssuesSummaryPieChart from "./issues-summary-pie-chart";

import { type GitHubIssue } from "@/types/types";
import LoadingPage from "@/app/(protected)/loading";
import { groupIssuesByLastSixMonths } from "./helper/group-issues-last-six-months";
import IssueLabelsBarChart from "./labels-bar-chart";

const IssuesPage = () => {
  const { projectId, isLoading, isError } = useProject();
  const { data: issues } = api.project.getIssues.useQuery({ projectId });
  const [chartDataTabName, setChartDataTabName] = useState<string>("all");
  // Show loading state
  if (isLoading) {
    return <LoadingPage />;
  }

  // Handle error state
  if (isError) {
    return <div className="text-red-500">Error fetching Issues</div>;
  }

  // Handle no issues case
  if (!issues || issues.length === 0) {
    return <div>No Issues to list</div>;
  }

  let groupedIssues: { month: string; items: GitHubIssue[] | undefined }[] = [];

  if (issues) groupedIssues = groupIssuesByLastSixMonths(issues);

  return (
    issues &&
    groupedIssues && (
      <div className="flex flex-col gap-5">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <MonthlyIssuesAreaChart
            groupedIssues={groupedIssues}
            currentTab={chartDataTabName}
          />
          <IssuesSummaryPieChart groupedIssues={groupedIssues} />
          <IssueLabelsBarChart
            issues={issues}
            currentTab={chartDataTabName}
            startMonth={groupedIssues[5]?.month ?? ""}
            endMonth={groupedIssues[0]?.month ?? ""}
          />
        </div>
        <IssueLog
          issues={issues}
          onTabSelect={(tabname: string) => setChartDataTabName(tabname)}
        />
      </div>
    )
  );
};

export default IssuesPage;
