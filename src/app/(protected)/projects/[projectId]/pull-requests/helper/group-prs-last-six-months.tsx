import { type GitHubPullRequest } from "@/types/types";

export const groupPrsByLastSixMonths = (prs: GitHubPullRequest[]) => {
  const today = new Date();
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  });

  // Initialize the result object with empty arrays for each month
  const groupedPrs: Record<string, GitHubPullRequest[]> = {};
  lastSixMonths.forEach((month) => {
    groupedPrs[month] = [];
  });

  // Group the issues by month
  prs.forEach((pr) => {
    const prDate = pr.createdAt;
    const monthYear = prDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Only add if it's within the last 6 months
    if (lastSixMonths.includes(monthYear)) {
      if (!groupedPrs[monthYear]) {
        groupedPrs[monthYear] = [];
      }
      groupedPrs[monthYear].push(pr);
    }
  });

  // Convert to array format and sort
  const result = lastSixMonths.map((month) => ({
    month,
    items: groupedPrs[month],
  }));

  return result;
};
