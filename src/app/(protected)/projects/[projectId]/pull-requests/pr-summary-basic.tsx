import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { type GitHubPullRequest } from "@/types/types";

interface PrBasicSummaryProps {
  groupedPrs: { month: string; items: GitHubPullRequest[] | undefined }[];
}

const PrBasicSummary = ({ groupedPrs: groupedPRs }: PrBasicSummaryProps) => {
  const analytics = useMemo(() => {
    const allPRs = groupedPRs.flatMap((group) => group.items || []);

    // 1. PR Size Analysis (based on changes)
    const prSizeData = groupedPRs.map((group) => {
      const sizes = {
        small: 0, // < 50 changes
        medium: 0, // 50-300 changes
        large: 0, // > 300 changes
      };

      group.items?.forEach((pr) => {
        const totalChanges = pr.additions + pr.deletions;
        if (totalChanges < 50) sizes.small++;
        else if (totalChanges < 300) sizes.medium++;
        else sizes.large++;
      });

      return {
        month: group.month,
        ...sizes,
      };
    });

    // 2. Review Time Analysis
    const reviewTimeData = groupedPRs.map((group) => {
      const avgReviewTime =
        (group.items ?? [])
          .filter((pr) => pr.mergedAt)
          .reduce((acc, pr) => {
            const created = new Date(pr.createdAt).getTime();
            const merged = new Date(pr.mergedAt!).getTime();
            return acc + (merged - created) / (1000 * 60 * 60); // in hours
          }, 0) / (group.items?.filter((pr) => pr.mergedAt).length || 1);

      return {
        month: group.month,
        avgReviewTime: Math.round(avgReviewTime),
      };
    });

    // 3. PR Analysis
    const prMetrics = allPRs.reduce(
      (acc, pr) => {
        acc.totalPRs++;
        if (pr.mergedAt) acc.mergedPRs++;
        if (pr.state === "closed" && !pr.mergedAt) acc.closedWithoutMerge++;
        acc.totalComments += pr.commentsCount + (pr.reviewCommentsCount || 0);
        acc.totalChanges += pr.additions + pr.deletions;
        return acc;
      },
      {
        totalPRs: 0,
        mergedPRs: 0,
        closedWithoutMerge: 0,
        totalComments: 0,
        totalChanges: 0,
      },
    );

    return {
      prSizeData,
      reviewTimeData,
      prMetrics,
    };
  }, [groupedPRs]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="col-span-1 rounded-md">
        <CardHeader>
          <CardTitle>Merge Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {Math.round(
              (analytics.prMetrics.mergedPRs / analytics.prMetrics.totalPRs) *
                100,
            )}
            %
          </p>
          <p className="text-sm text-gray-500">Of total PRs merged</p>
        </CardContent>
      </Card>
      <Card className="col-span-1 rounded-md">
        <CardHeader>
          <CardTitle>Average Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {Math.round(
              analytics.prMetrics.totalChanges / analytics.prMetrics.totalPRs,
            )}
          </p>
          <p className="text-sm text-gray-500">Lines per PR</p>
        </CardContent>
      </Card>
      <Card className="col-span-1 rounded-md">
        <CardHeader>
          <CardTitle>Review Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {(
              analytics.prMetrics.totalComments / analytics.prMetrics.totalPRs
            ).toFixed(1)}
          </p>
          <p className="text-sm text-gray-500">Comments per PR</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrBasicSummary;
