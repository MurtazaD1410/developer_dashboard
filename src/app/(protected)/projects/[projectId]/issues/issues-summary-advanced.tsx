import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type GitHubIssue } from "@/types/types";

interface AdvancedIssuesSummaryProps {
  issues: GitHubIssue[];
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

interface LabelCounts {
  [key: string]: number;
}

interface MonthlyIssues {
  [key: string]: number;
}

const AdvancedIssuesSummary = ({
  groupedIssues,
}: AdvancedIssuesSummaryProps) => {
  const advancedAnalytics = useMemo(() => {
    // Issues count by month
    const issuesByMonth = groupedIssues.reduce((acc: MonthlyIssues, group) => {
      acc[group.month] = group.items?.length || 0;
      return acc;
    }, {});

    // Count issues by label
    const issuesByLabel = groupedIssues.reduce((acc: LabelCounts, group) => {
      group.items?.forEach((issue) => {
        issue.label?.forEach((label) => {
          if (label.name) {
            acc[label.name] = (acc[label.name] || 0) + 1;
          }
        });
      });
      return acc;
    }, {});

    // Calculate response times and engagement
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

    return {
      issuesByMonth: Object.entries(issuesByMonth).map(([month, count]) => ({
        month,
        count,
      })),
      issuesByLabel: Object.entries(issuesByLabel).map(([label, count]) => ({
        label,
        count,
      })),
      engagementRate: (responseMetrics.withComments / allIssuesCount) * 100,
      avgCommentsPerIssue: responseMetrics.totalComments / allIssuesCount,
    };
  }, [groupedIssues]);

  return (
    <div className="space-y-6">
      {/* Advanced Analytics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {advancedAnalytics.engagementRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              Percentage of issues with comments
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Average Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {advancedAnalytics.avgCommentsPerIssue.toFixed(1)}
            </p>
            <p className="text-sm text-gray-500">Comments per issue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedIssuesSummary;
