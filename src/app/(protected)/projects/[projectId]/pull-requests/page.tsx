"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import PrLog from "./pr-log";
import LoadingPage from "@/app/(protected)/loading";
import { type GitHubPullRequest } from "@/types/types";
import { groupPrsByLastSixMonths } from "./helper/group-prs-last-six-months";
import MonthlyPrsAreaChart from "./monthly-area-chart";
import PrLabelsBarChart from "./labels-bar-chart";

const PullRequestsPage = () => {
  const { projectId, isLoading, isError } = useProject();
  const { data: prs } = api.project.getPullRequests.useQuery({ projectId });
  const [chartDataTabName, setChartDataTabName] = useState<string>("all");

  if (isLoading) <LoadingPage />;

  if (!isLoading && !prs) {
    return <div className="">No Pull requests to list</div>;
  }

  if (isError) {
    throw new Error("Error fetching Pull Requests");
  }

  let groupedPrs: { month: string; items: GitHubPullRequest[] | undefined }[] =
    [];

  if (prs) groupedPrs = groupPrsByLastSixMonths(prs);

  return (
    prs &&
    groupedPrs && (
      <div className="flex flex-col gap-5">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyPrsAreaChart
            groupedPrs={groupedPrs}
            currentTab={chartDataTabName}
          />
          <PrLabelsBarChart
            prs={prs}
            currentTab={chartDataTabName}
            startMonth={groupedPrs[5]?.month ?? ""}
            endMonth={groupedPrs[0]?.month ?? ""}
          />
        </div>
        <PrLog
          prs={prs}
          onTabSelect={(tabname: string) => setChartDataTabName(tabname)}
        />
      </div>
    )
  );
};

export default PullRequestsPage;
