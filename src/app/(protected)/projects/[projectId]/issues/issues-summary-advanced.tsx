import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type GitHubIssue } from "@/types/types";
import { Activity, Clock, MessageSquare } from "lucide-react";

interface AdvancedIssuesSummaryProps {
  issues: GitHubIssue[];
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

const AdvancedIssuesSummary = ({
  groupedIssues,
  issues,
}: AdvancedIssuesSummaryProps) => {
  const advancedAnalytics = useMemo(() => {
    const responseMetrics = groupedIssues.reduce(
      (acc: { withComments: number; totalComments: number }, group) => {
        group.items?.forEach((issue) => {
          if (issue.comments > 0) {
            acc.withComments++;
            acc.totalComments += issue.comments;
          }
        });
        return acc;
      },
      { withComments: 0, totalComments: 0 },
    );

    const allIssuesCount = groupedIssues.reduce(
      (count, group) => count + (group.items?.length || 0),
      0,
    );

    const closedIssues = issues.filter(
      (issue) => issue.state === "closed",
    ).length;

    const avgTimeToClose =
      issues
        .filter((issue) => issue.state === "closed" && issue.closedAt !== null)
        .reduce((acc, issue) => {
          const created = new Date(issue.createdAt).getTime();
          const closed = new Date(issue.closedAt!).getTime();
          return acc + (closed - created) / (1000 * 60 * 60 * 24);
        }, 0) / closedIssues || 0;

    return {
      engagementRate: {
        value: (responseMetrics.withComments / allIssuesCount) * 100,
        label: "Engagement Rate",
        subtext: "Percentage of issues with comments",
        icon: Activity,
      },
      avgCommentsPerIssue: {
        value: responseMetrics.totalComments / allIssuesCount,
        label: "Average Comments",
        subtext: "Comments per Issue",
        icon: MessageSquare,
      },
      avgTimeToClose: {
        value: Math.round(avgTimeToClose),
        label: "Average Time to Close",
        subtext: "Days per issue",
        icon: Clock,
      },
    };
  }, [groupedIssues]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(advancedAnalytics).map(([key, metric]) => (
        <Card key={key} className="rounded-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <metric.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {metric.value}
                    {key === "avgTimeToClose" ? " days" : ""}
                    {key === "engagementRate" ? "%" : ""}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {metric.subtext}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdvancedIssuesSummary;
