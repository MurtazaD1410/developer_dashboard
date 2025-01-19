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

export const groupIssuesByDateRange = (issues: GitHubIssue[]) => {
  if (!issues || issues.length === 0) {
    console.log("No issues provided.");
    return [];
  }

  // Sort issues by `createdAt` date to find the range
  const sortedIssues = [...issues].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const startDate = new Date(sortedIssues[0]!.createdAt); // Earliest date
  const endDate = new Date(sortedIssues[sortedIssues.length - 1]!.createdAt); // Latest date

  // Generate all months within the range
  const monthsInRange: string[] = [];
  let currentDate = new Date(startDate);
  currentDate.setDate(1); // Normalize to the first day of the month

  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    monthsInRange.push(monthYear);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Initialize the result object with empty arrays for each month
  const groupedIssues: Record<string, GitHubIssue[]> = {};
  monthsInRange.forEach((month) => {
    groupedIssues[month] = [];
  });

  // Group issues by their creation month
  issues.forEach((issue) => {
    const monthYear = new Date(issue.createdAt).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (groupedIssues[monthYear]) {
      groupedIssues[monthYear].push(issue);
    }
  });

  const result = monthsInRange.map((month) => ({
    month,
    items: groupedIssues[month],
  }));

  return result.reverse();
};
