import { type GitHubIssue } from "@/types/types";

export const groupIssuesByLastSixMonths = (issues: GitHubIssue[]) => {
  const today = new Date();
  const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() - i);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  });

  // Initialize the result object with empty arrays for each month
  const groupedIssues: Record<string, GitHubIssue[]> = {};
  lastSixMonths.forEach((month) => {
    groupedIssues[month] = [];
  });

  // Group the issues by month
  issues.forEach((issues) => {
    const issueDate = issues.createdAt;
    const monthYear = issueDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (lastSixMonths.includes(monthYear)) {
      if (!groupedIssues[monthYear]) {
        groupedIssues[monthYear] = [];
      }
      groupedIssues[monthYear].push(issues);
    }
  });

  // Convert to array format and sort
  const result = lastSixMonths.map((month) => ({
    month,
    items: groupedIssues[month],
  }));

  return result;
};
