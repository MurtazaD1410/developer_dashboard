"use client";

import React, { useState } from "react";
import IssueLog from "./issue-log";
import MonthlyIssuesAreaChart from "./monthly-area-chart";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import IssuesSummaryPieChart from "./issues-summary-pie-chart";

import { type GitHubIssue } from "@/types/types";
import LoadingPage from "@/app/(protected)/loading";
import { groupIssuesByDateRange } from "./helper/group-issues-last-six-months";
import IssueLabelsBarChart from "./labels-bar-chart";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { BugIcon, PlusCircle } from "lucide-react";

import BasicIssuesSummary from "./issues-summary-basic";
import AdvancedIssuesSummary from "./issues-summary-advanced";
import AdvancedIssuesSummaryPlaceholder from "./issues-summary-advanced-placeholder";

import IssueResolutionDistributionBarChart from "./issue-resolution-time-distribution";
import IssueComplexityDistributionBarChart from "./issue-complexity-bar-chart";
import IssueComplexityDistributionPlaceholderBarChart from "./issue-complexity-bar-chart-placeholder";
import IssueResolutionDistributionPlaceholderBarChart from "./issue-resolution-time-distribution-placeholder";

const IssuesPage = () => {
  const { projectId, isLoading, isError } = useProject();
  const [page, setPage] = useState(1);
  const { data: user } = api.user.getUser.useQuery();
  const [itemCount, setItemCount] = useState<number>(25);
  const { data, isLoading: issuesLoading } = api.project.getIssues.useQuery({
    projectId,
    page,
    limit: itemCount,
  });
  const [chartDataTabName, setChartDataTabName] = useState<string>("all");
  // Show loading state
  if (issuesLoading || isLoading) {
    return <LoadingPage />;
  }

  const issues = data?.issues;
  const totalPages = data?.totalPages ?? 0;

  // Show loading state
  if (isLoading || issuesLoading) {
    return <LoadingPage />;
  }

  // Handle error state
  if (isError) {
    return <div className="text-red-500">Error fetching Issues</div>;
  }

  // Handle no issues case
  if (!issues || issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <BugIcon className="size-28" />
        <h2 className="text-lg font-semibold text-muted-foreground">
          No Issues Found
        </h2>
        <p className="text-sm text-muted-foreground">
          There are no issues to display for the selected project. Create a new
          issue or select a different project.
        </p>
        <Button
          variant="outline"
          onClick={() => console.log("Navigate to create issue")}
        >
          <PlusCircle className="mr-2" /> Create New Issue
        </Button>
      </div>
    );
  }

  let groupedIssues: { month: string; items: GitHubIssue[] | undefined }[] = [];

  if (issues) groupedIssues = groupIssuesByDateRange(issues);

  return (
    issues &&
    groupedIssues && (
      <div className="flex flex-col gap-5">
        <BasicIssuesSummary groupedIssues={groupedIssues} issues={issues} />
        {user?.tier === "basic" && <AdvancedIssuesSummaryPlaceholder />}
        {user?.tier !== "basic" && (
          <AdvancedIssuesSummary
            groupedIssues={groupedIssues}
            issues={issues}
          />
        )}
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <div className="lg:col-span-2 2xl:col-span-1">
            <MonthlyIssuesAreaChart
              groupedIssues={groupedIssues}
              currentTab={chartDataTabName}
            />
          </div>
          <IssuesSummaryPieChart groupedIssues={groupedIssues} />
          <IssueLabelsBarChart
            issues={issues}
            currentTab={chartDataTabName}
            startMonth={groupedIssues[groupedIssues.length - 1]?.month ?? ""}
            endMonth={groupedIssues[0]?.month ?? ""}
          />
          {user?.tier === "basic" ? (
            <IssueComplexityDistributionPlaceholderBarChart />
          ) : (
            <IssueComplexityDistributionBarChart
              groupedIssues={groupedIssues}
            />
          )}
          {user?.tier === "basic" ? (
            <IssueResolutionDistributionPlaceholderBarChart />
          ) : (
            <IssueResolutionDistributionBarChart
              groupedIssues={groupedIssues}
            />
          )}
        </div>
        <IssueLog
          issues={issues}
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

export default IssuesPage;
