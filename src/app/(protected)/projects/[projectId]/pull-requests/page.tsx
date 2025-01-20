"use client";

import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import PrLog from "./pr-log";
import LoadingPage from "@/app/(protected)/loading";
import { type GitHubPullRequest } from "@/types/types";
import {
  groupIssuesByDateRange,
  groupPrsByLastSixMonths,
} from "./helper/group-prs-last-six-months";
import MonthlyPrsAreaChart from "./monthly-area-chart";
import PrLabelsBarChart from "./labels-bar-chart";
import PrsSummaryPieChart from "./pr-summary-pie-chart";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { GitPullRequest, PlusCircle, SearchCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrSizeDistributionBarChart from "./pr-size-distribution-bar-chart";
import AvgReviewTimeLineChart from "./avg-review-time-line-chart";
import PrBasicSummary from "./pr-summary-basic";
import AvgReviewTimeLineChartPlaceholder from "./avg-review-time-line-chart-placeholder";
import PrSizeDistributionBarChartPlaceholder from "./pr-size-distribution-bar-chart-placeholder";

const PullRequestsPage = () => {
  const { projectId, isLoading, isError } = useProject();
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState<number>(25);
  const { data, isLoading: prsIsLoading } =
    api.project.getPullRequests.useQuery({
      projectId,
      page,
      limit: itemCount,
    });
  const { data: user } = api.user.getUser.useQuery();
  const [chartDataTabName, setChartDataTabName] = useState<string>("all");

  if (isLoading || prsIsLoading) return <LoadingPage />;

  const prs = data?.prs;
  const totalPages = data?.totalPages ?? 0;

  // Handle no issues case
  if (!prs || prs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <GitPullRequest className="size-28" />
        <h2 className="text-lg font-semibold text-muted-foreground">
          No Pull requests Found
        </h2>
        <p className="text-sm text-muted-foreground">
          There are no pull requests to display for the selected project. Create
          a new issue or select a different project.
        </p>
        <Button
          variant="outline"
          onClick={() => console.log("Navigate to create issue")}
        >
          <PlusCircle className="mr-2" /> Create New Pull Request
        </Button>
      </div>
    );
  }

  if (isError) {
    throw new Error("Error fetching Pull Requests");
  }

  let groupedPrs: { month: string; items: GitHubPullRequest[] | undefined }[] =
    [];

  if (prs) groupedPrs = groupIssuesByDateRange(prs);

  return (
    prs &&
    groupedPrs && (
      <div className="flex flex-col gap-5">
        <PrBasicSummary groupedPrs={groupedPrs} />
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <div className="lg:col-span-2 2xl:col-span-1">
            <MonthlyPrsAreaChart
              groupedPrs={groupedPrs}
              currentTab={chartDataTabName}
            />
          </div>
          <PrsSummaryPieChart groupedPrs={groupedPrs} />
          <PrLabelsBarChart
            prs={prs}
            currentTab={chartDataTabName}
            startMonth={groupedPrs[groupedPrs.length - 1]?.month ?? ""}
            endMonth={groupedPrs[0]?.month ?? ""}
          />

          {user?.tier === "basic" ? (
            <AvgReviewTimeLineChartPlaceholder />
          ) : (
            <AvgReviewTimeLineChart groupedPrs={groupedPrs} />
          )}
          {user?.tier === "basic" ? (
            <PrSizeDistributionBarChartPlaceholder />
          ) : (
            <PrSizeDistributionBarChart groupedPrs={groupedPrs} />
          )}
        </div>
        <PrLog
          prs={prs}
          onTabSelect={(tabname: string) => setChartDataTabName(tabname)}
          onItemCountSelect={(count: number) => setItemCount(count)}
          itemCount={itemCount}
        />
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={
                      page === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= page - 2 && i <= page + 2)
                  ) {
                    return (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (i === page - 3 || i === page + 3) {
                    return <p key={`ellipsis-${i}`}>...</p>;
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  );
};

export default PullRequestsPage;
