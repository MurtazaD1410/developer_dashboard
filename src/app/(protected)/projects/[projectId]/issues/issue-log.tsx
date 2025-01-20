"use client";
import AvatarGroup from "@/components/avatar-group";
import DescriptionRenderer from "@/components/decription-text";
import HighlightBackticks from "@/components/highlight-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useProject from "@/hooks/use-project";
import { darkenColor, formatRelativeDate } from "@/lib/utils";
import { type Project, type GitHubIssue } from "@/types/types";
import {
  CheckCircle2,
  CircleAlertIcon,
  CircleDotIcon,
  Clock,
  ExternalLink,
  Github,
  Search,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useState } from "react";

interface IssueLogProps {
  issues: GitHubIssue[];
  onTabSelect: (tabname: string) => void;
  onItemCountSelect: (item: number) => void;
  itemCount: number;
}

const IssueLog = ({
  issues,
  onTabSelect,
  onItemCountSelect,
  itemCount,
}: IssueLogProps) => {
  const { project } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const filterIssues = (issues: GitHubIssue[], tabName: string) => {
    let filteredIssues = issues;

    // First apply tab filter
    if (tabName !== "all") {
      filteredIssues = filteredIssues.filter(
        (issue) => issue.state === tabName,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredIssues = filteredIssues.filter(
        (issue) =>
          issue.title.toLowerCase().includes(query) ||
          issue.number.toString().includes(query),
      );
    }

    return filteredIssues;
  };

  return (
    <>
      <Card className="rounded-md">
        <CardContent className="flex flex-col gap-y-3 pt-6">
          <div className="flex gap-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues by title or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              defaultValue={itemCount.toString()}
              onValueChange={(value) => {
                onItemCountSelect(parseInt(value, 10));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select issue count" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Issues</SelectLabel>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {searchQuery && (
            <CardDescription className="inline-flex items-center">
              {filterIssues(issues, currentTab).length} results found for "
              {searchQuery}"{currentTab !== "all" && ` in ${currentTab} issues`}
            </CardDescription>
          )}
        </CardContent>
      </Card>

      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={(e) => {
          setCurrentTab;
          onTabSelect(e);
        }}
      >
        <TabsList className="mb-3 grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
        </TabsList>
        <TabCustomContent
          issues={filterIssues(issues, "all")}
          tabName="all"
          project={project}
        />
        <TabCustomContent
          issues={filterIssues(issues, "open")}
          tabName="open"
          project={project}
        />
        <TabCustomContent
          issues={filterIssues(issues, "closed")}
          tabName="closed"
          project={project}
        />
        <TabCustomContent
          issues={filterIssues(issues, "dismissed")}
          tabName="dismissed"
          project={project}
        />
      </Tabs>
    </>
  );
};

interface TabCustomContentProps {
  issues: GitHubIssue[];
  project?: Project;
  tabName: string;
}
const TabCustomContent = ({
  issues,
  project,
  tabName,
}: TabCustomContentProps) => {
  const { theme } = useTheme();

  if (tabName !== "all") {
    issues = issues.filter((issue) => issue.state === tabName);
  }

  return (
    <TabsContent value={tabName}>
      {issues.map((issue) => (
        <div className="mb-5" key={issue.id}>
          <Card className="rounded-md">
            <CardHeader className="flex flex-row items-center justify-between pb-5">
              <div className="w-fit">
                <CardTitle className="flex items-center justify-between gap-x-3">
                  <div className="flex items-center gap-x-3">
                    <HighlightBackticks text={issue.title} />{" "}
                    <Link
                      className="py-0.5 text-xs leading-5 text-secondary-foreground"
                      target="_blank"
                      href={`${project?.githubUrl}/issues/${issue.number}`}
                    >
                      <span className="inline-flex items-center">
                        go to issue <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                    {issue.state === "open" ? (
                      <Badge
                        key={issue.id}
                        className="gap-x-2 rounded-full bg-green-500 p-1 px-2"
                        variant={"default"}
                      >
                        <CircleDotIcon size={16} />
                        {issue.state}
                      </Badge>
                    ) : issue.state === "closed" ? (
                      <Badge
                        key={issue.id}
                        className="gap-x-2 rounded-full bg-purple-500 p-1 px-2"
                        variant={"default"}
                      >
                        <CheckCircle2 size={16} />
                        {issue.state}
                      </Badge>
                    ) : (
                      <Badge
                        key={issue.id}
                        className="gap-x-2 rounded-full bg-amber-500 p-1 px-2"
                        variant={"default"}
                      >
                        <CircleAlertIcon size={16} />
                        {issue.state}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="mt-2 flex items-center gap-x-2 text-secondary-foreground/70">
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-x-1">
                      <Clock className="ml-1 size-4" /> Issue created{" "}
                      {formatRelativeDate(issue.createdAt)}
                    </span>
                  </div>
                  {issue.closedAt && (
                    <div className="text-xs">
                      <span className="inline-flex items-center gap-x-1">
                        <X className="ml-1 size-4" /> Issue Closed{" "}
                        {formatRelativeDate(issue.closedAt)}
                      </span>
                    </div>
                  )}
                </CardDescription>

                <div className="flex flex-wrap items-center gap-x-2">
                  {issue?.label?.map((label) => {
                    return (
                      <Badge
                        key={label.id}
                        className="my-2"
                        variant={"outline"}
                        style={{
                          borderRadius: 5,
                          color:
                            theme === "light"
                              ? darkenColor(label.color!)
                              : label.color!,
                          borderColor:
                            theme === "light"
                              ? darkenColor(label.color!)
                              : label.color!,
                        }}
                      >
                        {label.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              {issue.state === "closed" && (
                <div className="inline-flex items-center gap-x-2">
                  <Link
                    className="py-0.5 text-xs leading-5 text-gray-500"
                    target="_blank"
                    href={`https://github.com/${issue.closedBy?.userName}`}
                  >
                    <span className="inline-flex items-center text-secondary-foreground">
                      Issue closed by <ExternalLink className="ml-1 size-4" />
                    </span>
                  </Link>
                  <Avatar className="size-14">
                    {issue.closedBy?.userAvatar ? (
                      <AvatarImage
                        src={issue.closedBy?.userAvatar}
                        className="size-14"
                      />
                    ) : (
                      <AvatarFallback className="size-14">
                        {issue.closedBy?.userName?.slice(0, 1) ?? (
                          <Github size={25} />
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
            </CardHeader>
            {(issue.description || (issue.assignees?.length ?? 0) > 0) && (
              <CardContent>
                <DescriptionRenderer description={issue.description ?? ""} />
                {(issue.assignees?.length ?? 0) > 0 && (
                  <div className="mt-2 inline-flex items-center gap-x-2">
                    <p className="text-xs text-secondary-foreground/70">
                      This issue has been assigned to
                    </p>
                    <AvatarGroup limit={3} users={issue.assignees} />
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      ))}
    </TabsContent>
  );
};

export default IssueLog;
