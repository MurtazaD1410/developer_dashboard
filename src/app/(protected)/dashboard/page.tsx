"use client";
import useProject from "@/hooks/use-project";

import {
  CircleDot,
  ExternalLink,
  Github,
  LockIcon,
  UnlockIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn, getRelativeTime } from "@/lib/utils";
import { type Url } from "next/dist/shared/lib/router/router";
import LoadingPage from "@/app/(protected)/loading";
import ArchiveButton from "./archive-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-memers";

const DashboardPage = () => {
  const { project, projectId, isLoading, isError, projects } = useProject();
  const { data: repository } = api.project.getRepository.useQuery({
    projectId,
  });

  if (isLoading) <LoadingPage />;

  if (!isLoading && !project) {
    return <div className="">No Projects Found</div>;
  }

  if (isError) {
    throw new Error("Error fetching product");
  }

  return (
    project && (
      <div className="flex flex-col gap-y-5">
        <div className="flex flex-wrap items-center justify-between gap-y-4">
          {/* github link */}
          <div className="w-fil rounded-md bg-primary px-4 py-3">
            <div className="flex items-center">
              <Github className="size-5 text-white" />
              <div className="ml-2">
                <p className="text-sm font-medium text-white">
                  This project is linked to{" "}
                  <Link
                    href={project!.githubUrl as Url}
                    className="inline-flex items-center text-white/80 hover:underline"
                  >
                    {project?.githubUrl}
                    <ExternalLink className="ml-1 size-4" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="h-4"></div>
          <div className="flex items-center gap-4">
            <TeamMembers />
            <InviteButton />
            <ArchiveButton />
          </div>
        </div>

        <Card className="rounded-md">
          <CardHeader className="">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                {repository?.repoName?.toUpperCase()}
                <Badge
                  className={cn(
                    "mx-4 gap-x-2 rounded-full p-1 px-2",
                    repository?.repoPrivate ? "bg-red-500" : "bg-green-500",
                  )}
                  variant={"default"}
                >
                  {repository?.repoPrivate ? (
                    <LockIcon size={16} />
                  ) : (
                    <UnlockIcon size={16} />
                  )}

                  {repository?.repoPrivate ? "Private" : "Public"}
                </Badge>
              </CardTitle>
              <Link
                className="py-0.5 text-sm leading-5 text-gray-500"
                target="_blank"
                href={`${project?.githubUrl}`}
              >
                <span className="inline-flex items-center">
                  go to repository <ExternalLink className="ml-1 size-4" />
                </span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              {repository &&
                repository.repoTopics &&
                repository.repoTopics?.length > 0 &&
                repository.repoTopics?.map((topic) => {
                  return (
                    <Badge
                      key={topic}
                      className="my-2"
                      variant={"outline"}
                      style={{
                        borderRadius: 5,
                        backgroundColor: `#E5E4E2`,
                        borderColor: "#000000",
                      }}
                    >
                      {topic}
                    </Badge>
                  );
                })}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-between space-y-5">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Repository Owner
              </h1>
              <Link
                href={`https://github.com/${repository?.repoOwner.userUsername}`}
                className="cursor-pointer"
              >
                <Avatar className="size-32 border border-gray-300">
                  <AvatarImage
                    src={repository?.repoOwner.userAvatar ?? undefined}
                  />
                </Avatar>
              </Link>
              <p className="font-semibold">
                {repository?.repoOwner.userUsername &&
                  repository?.repoOwner.userUsername[0]?.toUpperCase() +
                    repository?.repoOwner.userUsername.slice(1)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-between space-y-5 border-l-2 border-r-2">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Open Issues
              </h1>
              <p className="cursor-pointer text-6xl">
                {repository?.repoOpenIssues}
              </p>
              <Link
                href={`https://github.com/${repository?.repoOwner.userUsername}`}
                className="inline-flex cursor-pointer items-center gap-x-2 font-semibold"
              >
                Go to issues
                <CircleDot size={20} />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-between space-y-5">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Repository created
              </h1>
              <p className="cursor-pointer text-6xl">
                {repository?.repoCreatedAt &&
                  getRelativeTime(repository?.repoCreatedAt)}
              </p>
              <p className="font-semibold">Ago</p>
            </div>
          </CardContent>
        </Card>
        <CommitLog />
      </div>
    )
  );
};

export default DashboardPage;
