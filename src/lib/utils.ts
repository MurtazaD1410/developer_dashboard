import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} months ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }); // e.g., "Jan 10, 2025"
  }
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""}`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? "s" : ""}`;
  }
}

export const darkenColor = (color: string, amount = 0.2) => {
  // Remove the hash if it exists
  color = color.replace("#", "");

  // Convert to RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Darken each component
  r = Math.floor(r * (1 - amount));
  g = Math.floor(g * (1 - amount));
  b = Math.floor(b * (1 - amount));

  // Ensure values don't go below 0
  r = Math.max(r, 0);
  g = Math.max(g, 0);
  b = Math.max(b, 0);

  // Convert back to hex
  const darkerColor =
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");

  return darkerColor;
};

export function generateInviteCode(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdZabcdefghijklmnopqrstuvwxy0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
