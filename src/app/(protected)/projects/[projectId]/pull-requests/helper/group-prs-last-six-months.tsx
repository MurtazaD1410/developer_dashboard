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

    // Only add if it's within the given time frame
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

export const groupIssuesByDateRange = (prs: GitHubPullRequest[]) => {
  if (!prs || prs.length === 0) {
    console.log("No issues provided.");
    return [];
  }

  // Sort issues by `createdAt` date to find the range
  const sortedPrs = [...prs].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  const startDate = new Date(sortedPrs[0]!.createdAt); // Earliest date
  const endDate = new Date(sortedPrs[sortedPrs.length - 1]!.createdAt); // Latest date

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
  const groupedPrs: Record<string, GitHubPullRequest[]> = {};
  monthsInRange.forEach((month) => {
    groupedPrs[month] = [];
  });

  // Group issues by their creation month
  prs.forEach((pr) => {
    const monthYear = new Date(pr.createdAt).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (groupedPrs[monthYear]) {
      groupedPrs[monthYear].push(pr);
    }
  });

  const result = monthsInRange.map((month) => ({
    month,
    items: groupedPrs[month],
  }));

  return result.reverse();
};
