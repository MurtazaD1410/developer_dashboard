import React, { useState } from "react";
import {
  GitPullRequest,
  Clock,
  X,
  Activity,
  ArrowRight,
  GitMerge,
  Users,
  Edit,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Project, type GitHubPullRequest } from "@/types/types";
import { darkenColor } from "@/lib/utils";
import HighlightBackticks from "@/components/highlight-text";
import useProject from "@/hooks/use-project";
import AvatarGroup from "@/components/avatar-group";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PrLogProps {
  prs: GitHubPullRequest[];
  onTabSelect: (tabname: string) => void;
}

const PrLog = ({ prs, onTabSelect }: PrLogProps) => {
  const { project } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const filterPrs = (prs: GitHubPullRequest[], tabName: string) => {
    let filteredPr = prs;

    // First apply tab filter
    if (tabName !== "all") {
      switch (tabName) {
        case "merged":
          filteredPr = filteredPr.filter((pr) => pr.prMergedAt !== null);
          break;
        case "open":
          filteredPr = filteredPr.filter((pr) => pr.prState === "open");
          break;
        case "closed":
          filteredPr = filteredPr.filter(
            (pr) => pr.prState === "closed" && pr.prMergedAt === null,
          );
          break;
        default:
          break;
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredPr = filteredPr.filter(
        (pr) =>
          pr.prTitle.toLowerCase().includes(query) ||
          pr.prNumber.toString().includes(query),
      );
    }

    return filteredPr;
  };

  return (
    <>
      <Card className="rounded-md">
        <CardContent className="flex flex-col gap-y-3 pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pull request by title or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
            {searchQuery && (
              <X
                className="absolute right-2 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          {searchQuery && (
            <CardDescription className="inline-flex items-center">
              {filterPrs(prs, currentTab).length} results found for "
              {searchQuery}"
              {currentTab !== "all" && ` in ${currentTab} pull requests`}
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
          <TabsTrigger value="merged">Merged</TabsTrigger>
          <TabsTrigger value="closed">Closed (Not merged) </TabsTrigger>
        </TabsList>
        <TabCustomContent
          prs={filterPrs(prs, "all")}
          tabName="all"
          project={project}
        />
        <TabCustomContent
          prs={filterPrs(prs, "open")}
          tabName="open"
          project={project}
        />
        <TabCustomContent
          prs={filterPrs(prs, "merged")}
          tabName="merged"
          project={project}
        />
        <TabCustomContent
          prs={filterPrs(prs, "closed")}
          tabName="closed"
          project={project}
        />
      </Tabs>
    </>
  );
};

interface TabCustomContentProps {
  prs: GitHubPullRequest[];
  project?: Project;
  tabName: string;
}
const TabCustomContent = ({ prs, project, tabName }: TabCustomContentProps) => {
  var sortedPrs = prs.sort(
    (a: GitHubPullRequest, b: GitHubPullRequest) =>
      new Date(b.prCreatedAt).getTime() - new Date(a.prCreatedAt).getTime(),
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (pr: GitHubPullRequest) => {
    if (pr.prMergedAt) return "text-purple-500";
    if (pr.prState === "closed") return "text-red-500";
    return "text-green-500";
  };

  const getStatusIcon = (pr: GitHubPullRequest) => {
    if (pr.prMergedAt) return <GitMerge className="h-5 w-5" />;
    if (pr.prState === "closed") return <X className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  switch (tabName) {
    case "merged":
      sortedPrs = sortedPrs.filter((pr) => pr.prMergedAt !== null);
      break;
    case "open":
      sortedPrs = sortedPrs.filter((pr) => pr.prState === "open");
      break;
    case "closed":
      sortedPrs = sortedPrs.filter(
        (pr) => pr.prState === "closed" && pr.prMergedAt === null,
      );
      break;
    default:
      break;
  }

  return (
    <TabsContent value={tabName}>
      {sortedPrs?.map((pr) => (
        <div className="mb-5" key={pr.id}>
          <Card
            className="rounded-md transition-colors hover:bg-secondary"
            onClick={() => {
              window.open(
                `${project?.githubUrl}/pull/${pr.prNumber}`,
                "_blank",
              );
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getStatusColor(pr)}`}>
                    {getStatusIcon(pr)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-medium">
                      <HighlightBackticks text={pr.prTitle} />
                      <span className="text-sm text-secondary-foreground">
                        #{pr.prNumber}
                      </span>
                    </CardTitle>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-secondary-foreground/70">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Created: {formatDate(pr.prCreatedAt.toDateString())}
                      </div>

                      {pr.prClosedAt && (
                        <div className="flex items-center">
                          <X className="mr-1 h-4 w-4" />
                          Closed: {formatDate(pr.prClosedAt.toDateString())}
                        </div>
                      )}

                      {pr.prMergedAt && (
                        <div className="flex items-center">
                          <GitMerge className="mr-1 h-4 w-4" />
                          Merged: {formatDate(pr.prMergedAt.toDateString())}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {pr.prLabel?.map((label, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      style={{
                        backgroundColor: "white",
                        borderColor: darkenColor(label.color!),
                        color: darkenColor(label.color!),
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-2 text-secondary-foreground/80">
              {pr.prDescription && (
                <CardDescription>
                  <HighlightBackticks text={pr.prDescription} isDesc />
                </CardDescription>
              )}

              {((pr.prAssignees?.length ?? 0) > 0 ||
                (pr.prReviewers?.length ?? 0) > 0) && (
                <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                  {pr.prAssignees && pr.prAssignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        <AvatarGroup users={pr.prAssignees} limit={3} />
                      </div>
                    </div>
                  )}

                  {pr.prReviewers && pr.prReviewers?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        <AvatarGroup users={pr.prReviewers} limit={3} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-secondary-foreground/60">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4" />
                  <span className="">{pr.prHeadRef}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="">{pr.prBaseRef}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </TabsContent>
  );
};

export default PrLog;
