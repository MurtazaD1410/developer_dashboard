import React from "react";
import { Clock, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type GitHubPullRequest } from "@/types/types";

const AdvancedPrsSummary = ({
  pullRequests,
}: {
  pullRequests: GitHubPullRequest[];
}) => {
  // Calculate metrics
  const metrics = {
    avgTimeToMerge: {
      value: Math.round(
        pullRequests
          .filter((pr) => pr.mergedAt)
          .reduce(
            (acc, pr) =>
              acc +
              (new Date(pr.mergedAt!).getTime() -
                new Date(pr.createdAt).getTime()) /
                (1000 * 60 * 60),
            0,
          ) / pullRequests.filter((pr) => pr.mergedAt).length,
      ),
      label: "Time to Merge",
      subtext: "Average hours",
      icon: Clock,
    },
    approvalRate: {
      value: Math.round(
        (pullRequests.filter((pr) =>
          pr.reviews.some((review) => review.state === "APPROVED"),
        ).length /
          pullRequests.length) *
          100,
      ),
      label: "Approval Rate",
      subtext: "First-time approvals",
      icon: CheckCircle2,
    },
    avgReviewers: {
      value: (
        pullRequests.reduce((acc, pr) => acc + (pr.reviewers?.length || 0), 0) /
        pullRequests.length
      ).toFixed(1),
      label: "Reviewers",
      subtext: "Average per PR",
      icon: Users,
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

export default AdvancedPrsSummary;
