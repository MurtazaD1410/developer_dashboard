import React from "react";
import {
  Activity,
  GitMerge,
  MessageSquare,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type GitHubPullRequest } from "@/types/types";

interface BasicPrsSummaryprops {
  pullRequests: GitHubPullRequest[];
}

const BasicPrsSummary = ({ pullRequests }: BasicPrsSummaryprops) => {
  // Calculate metrics
  const metrics = {
    mergeRate: {
      value: Math.round(
        (pullRequests.filter((pr) => pr.mergedAt).length /
          pullRequests.length) *
          100,
      ),
      label: "Merge Rate",
      subtext: "Of total PRs merged",
      icon: GitMerge,
    },
    avgChanges: {
      value: Math.round(
        pullRequests.reduce((acc, pr) => acc + pr.additions + pr.deletions, 0) /
          pullRequests.length,
      ),
      label: "Average Changes",
      subtext: "Lines per PR",
      icon: Activity,
    },
    avgReviewComments: {
      value: (
        pullRequests.reduce((acc, pr) => acc + pr.commentsCount, 0) /
        pullRequests.length
      ).toFixed(1),
      label: "Review Comments",
      subtext: "Comments per PR",
      icon: MessageSquare,
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Object.entries(metrics).map(([key, metric]) => (
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
                    {key === "mergeRate" || key === "approvalRate" ? "%" : ""}
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

export default BasicPrsSummary;
