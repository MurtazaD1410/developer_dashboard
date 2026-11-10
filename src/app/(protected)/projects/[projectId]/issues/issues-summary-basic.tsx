import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { type GitHubIssue } from "@/types/types";
import {
  Circle,
  CheckCircle,
  Clock,
  FileText,
  List,
  CircleDot,
} from "lucide-react";

interface BasicIssuesSummaryProps {
  issues: GitHubIssue[];
}

const BasicIssuesSummary = ({ issues }: BasicIssuesSummaryProps) => {
  const basicAnalytics = useMemo(() => {
    const totalIssues = issues.length;
    const openIssues = issues.filter((issue) => issue.state === "open").length;
    const closedIssues = issues.filter(
      (issue) => issue.state === "closed",
    ).length;

    return {
      totalIssues: {
        value: totalIssues,
        label: "Total Issues",
        subtext: "All time issues",
        icon: List,
      },
      openIssues: {
        value: openIssues,
        label: "Open Issues",
        subtext: "Currently active",
        icon: CircleDot,
      },
      closedIssues: {
        value: closedIssues,
        label: "Closed Issues",
        subtext: "Resolved issues",
        icon: CheckCircle,
      },
    };
  }, [issues]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(basicAnalytics).map(([key, metric]) => (
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

export default BasicIssuesSummary;
