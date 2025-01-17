"use client";
import HighlightBackticks from "@/components/highlight-text";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import { cn, formatRelativeDate } from "@/lib/utils";
import { api } from "@/trpc/react";
import { type GitHubCommit } from "@/types/types";
import { ExternalLink, Search, Timer } from "lucide-react";
import Link from "next/link";

import React, { useState } from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });
  const [searchQuery, setSearchQuery] = useState("");

  if (!commits || commits?.length <= 0) {
    return <h1>No commits to list</h1>;
  }

  const sortedCommits = commits.sort(
    (a: GitHubCommit, b: GitHubCommit) =>
      new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime(),
  );

  const filterCommits = (commits: GitHubCommit[]) => {
    if (!searchQuery) return commits;

    const query = searchQuery.toLowerCase();
    return commits.filter(
      (commit) =>
        commit.commitMessage.toLowerCase().includes(query) ||
        commit.commitHash.toString().includes(query),
    );
  };

  return (
    <>
      <Card className="rounded-md">
        <CardContent className="flex flex-col gap-y-3 pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search commit by message or commit hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchQuery && (
            <CardDescription className="inline-flex items-center">
              {filterCommits(sortedCommits).length} results found for "
              {searchQuery}" .
            </CardDescription>
          )}
        </CardContent>
      </Card>
      <ul className="space-y-6">
        {filterCommits(sortedCommits)?.map((commit, commitIdx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === filterCommits(sortedCommits).length - 1
                    ? "h-6"
                    : "-bottom-6",
                  "absolute left-0 top-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-secondary-foreground/30"></div>
              </div>
              <>
                <img
                  src={commit.commitAuthorAvatar}
                  alt=""
                  className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
                />
                <div className="flex-auto rounded-md bg-secondary p-3 ring-1 ring-inset ring-secondary-foreground/30">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      className="py-0.5 text-xs leading-5 text-secondary-foreground"
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                    >
                      <span className="font-medium text-secondary-foreground">
                        {commit.commitAuthorName}
                      </span>{" "}
                      <span className="inline-flex items-center">
                        committed <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                    <div className="text-xs text-secondary-foreground">
                      <span className="inline-flex items-center gap-x-1">
                        <Timer className="ml-1 size-4" /> Committed{" "}
                        {formatRelativeDate(commit.commitDate)}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold">
                    <HighlightBackticks text={commit.commitMessage} />
                  </span>
                  <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary-foreground/80">
                    <HighlightBackticks text={commit.summary} isDesc />
                  </pre>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
