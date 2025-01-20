import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type GitHubIssue } from "@/types/types";

interface BasicIssuesSummaryProps {
  issues: GitHubIssue[];
  groupedIssues: {
    month: string;
    items: GitHubIssue[] | undefined;
  }[];
}

const BasicIssuesSummary = ({ issues }: BasicIssuesSummaryProps) => {
  // Basic Analytics Calculations
  const basicAnalytics = useMemo(() => {
    const totalIssues = issues.length;
    const openIssues = issues.filter((issue) => issue.state === "open").length;
    const closedIssues = issues.filter(
      (issue) => issue.state === "closed",
    ).length;

    // Average time to close (in days)
    const avgTimeToClose =
      issues
        .filter((issue) => issue.state === "closed" && issue.closedAt !== null)
        .reduce((acc, issue) => {
          const created = new Date(issue.createdAt).getTime();
          const closed = new Date(issue.closedAt!).getTime(); // We can use ! here because we filtered null values
          return acc + (closed - created) / (1000 * 60 * 60 * 24);
        }, 0) / closedIssues || 0; // Add || 0 to handle division by zero

    return {
      totalIssues,
      openIssues,
      closedIssues,
      avgTimeToClose: Math.round(avgTimeToClose),
    };
  }, [issues]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{basicAnalytics.totalIssues}</p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {basicAnalytics.openIssues}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Closed Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {basicAnalytics.closedIssues}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Avg. Time to Close</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {basicAnalytics.avgTimeToClose} days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BasicIssuesSummary;
