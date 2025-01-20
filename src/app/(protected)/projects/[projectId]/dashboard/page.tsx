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
import React, { useEffect } from "react";
import CommitLog from "./commit-log";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn, getRelativeTime } from "@/lib/utils";
import { type Url } from "next/dist/shared/lib/router/router";
import LoadingPage from "@/app/(protected)/loading";
import LeaveProjectButton from "./leave-project-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";
import useRefetch from "@/hooks/use-refetch";
import ArchiveButton from "./archive-button";
import { type UserTier } from "@/types/types";

const DashboardPage = () => {
  const { project, projectId, isLoading, isError } = useProject();
  const refetch = useRefetch();
  const { data: repository } = api.project.getRepository.useQuery({
    projectId,
  });
  const { data: userRole } = api.user.getUserRole.useQuery({ projectId });
  const { data: user } = api.user.getUser.useQuery();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  if (isLoading) <LoadingPage />;

  if (!isLoading && !project) {
    return <div className="">No Projects Found</div>;
  }

  useEffect(() => {
    refetch();
  }, []);

  if (isError) {
    throw new Error("Error fetching product");
  }

  const canInviteMembers = () => {
    if (user?.tier === "basic" && (members?.length ?? 0) >= 3) {
      return false;
    }
    if (user?.tier === "pro" && (members?.length ?? 0) >= 5) {
      return false;
    }
    if (user?.tier === "premium" && (members?.length ?? 0) >= 10) {
      return false;
    }

    return true;
  };

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
            {userRole?.role === "MEMBER" && <LeaveProjectButton />}
            {userRole?.role === "ADMIN" && (
              <InviteButton
                canInviteMembers={canInviteMembers()}
                tier={user?.tier as UserTier}
              />
            )}
            {userRole?.role === "ADMIN" && <ArchiveButton />}
          </div>
        </div>

        <Card className="rounded-md">
          <CardHeader className="">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">
                {repository?.name?.toUpperCase()}
                <Badge
                  className={cn(
                    "mx-4 gap-x-2 rounded-full p-1 px-2",
                    repository?.private ? "bg-red-500" : "bg-green-500",
                  )}
                  variant={"default"}
                >
                  {repository?.private ? (
                    <LockIcon size={16} />
                  ) : (
                    <UnlockIcon size={16} />
                  )}

                  {repository?.private ? "Private" : "Public"}
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
                repository.topics &&
                repository.topics?.length > 0 &&
                repository.topics?.map((topic) => {
                  return (
                    <Badge
                      key={topic}
                      className="my-2 border-2 border-secondary-foreground"
                      variant={"outline"}
                    >
                      {topic}
                    </Badge>
                  );
                })}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3">
            <div className="flex flex-col items-center justify-between space-y-5 pb-10 lg:pb-0">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Repository Owner
              </h1>
              <Link
                href={`https://github.com/${repository?.owner.userName}`}
                className="cursor-pointer"
              >
                <Avatar className="size-32 border border-none">
                  <AvatarImage
                    src={repository?.owner.userAvatar ?? undefined}
                  />
                </Avatar>
              </Link>
              <p className="font-semibold">
                {repository?.owner.userName &&
                  repository?.owner.userName[0]?.toUpperCase() +
                    repository?.owner.userName.slice(1)}
              </p>
            </div>
            <div className="flex flex-col items-center justify-between space-y-5 border-b-2 border-t-2 py-10 lg:border-b-0 lg:border-l-2 lg:border-r-2 lg:border-t-0 lg:p-0">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Open Issues
              </h1>
              <p className="cursor-pointer text-6xl">
                {repository?.openIssues}
              </p>
              <Link
                href={`https://github.com/${repository?.owner.userName}`}
                className="inline-flex cursor-pointer items-center gap-x-2 font-semibold"
              >
                Go to issues
                <CircleDot size={20} />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-between space-y-5 pt-10 lg:pt-0">
              <h1 className="text-lg font-semibold text-muted-foreground">
                Repository created
              </h1>
              <p className="cursor-pointer text-center text-6xl">
                {repository?.createdAt &&
                  getRelativeTime(repository?.createdAt)}
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
