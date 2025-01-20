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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrLogProps {
  prs: GitHubPullRequest[];
  onTabSelect: (tabname: string) => void;
  onItemCountSelect: (item: number) => void;
  itemCount: number;
}

const PrLog = ({
  prs,
  onTabSelect,
  onItemCountSelect,
  itemCount,
}: PrLogProps) => {
  const { project } = useProject();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  const filterPrs = (prs: GitHubPullRequest[], tabName: string) => {
    let filteredPr = prs;

    // First apply tab filter
    if (tabName !== "all") {
      switch (tabName) {
        case "merged":
          filteredPr = filteredPr.filter((pr) => pr.mergedAt !== null);
          break;
        case "open":
          filteredPr = filteredPr.filter((pr) => pr.state === "open");
          break;
        case "closed":
          filteredPr = filteredPr.filter(
            (pr) => pr.state === "closed" && pr.mergedAt === null,
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
          pr.title.toLowerCase().includes(query) ||
          pr.number.toString().includes(query),
      );
    }

    return filteredPr;
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
                <SelectValue placeholder="Select pr count" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Prs</SelectLabel>
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
    if (pr.mergedAt) return "text-purple-500";
    if (pr.state === "closed") return "text-red-500";
    return "text-green-500";
  };

  const getStatusIcon = (pr: GitHubPullRequest) => {
    if (pr.mergedAt) return <GitMerge className="h-5 w-5" />;
    if (pr.state === "closed") return <X className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  switch (tabName) {
    case "merged":
      prs = prs.filter((pr) => pr.mergedAt !== null);
      break;
    case "open":
      prs = prs.filter((pr) => pr.state === "open");
      break;
    case "closed":
      prs = prs.filter((pr) => pr.state === "closed" && pr.mergedAt === null);
      break;
    default:
      break;
  }

  return (
    <TabsContent value={tabName}>
      {prs?.map((pr) => (
        <div className="mb-5" key={pr.id}>
          <Card
            className="rounded-md transition-colors hover:bg-secondary"
            onClick={() => {
              window.open(`${project?.githubUrl}/pull/${pr.number}`, "_blank");
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
                      <HighlightBackticks text={pr.title} />
                      <span className="text-sm text-secondary-foreground">
                        #{pr.number}
                      </span>
                    </CardTitle>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-secondary-foreground/70">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Created: {formatDate(pr.createdAt.toDateString())}
                      </div>

                      {pr.closedAt && (
                        <div className="flex items-center">
                          <X className="mr-1 h-4 w-4" />
                          Closed: {formatDate(pr.closedAt.toDateString())}
                        </div>
                      )}

                      {pr.mergedAt && (
                        <div className="flex items-center">
                          <GitMerge className="mr-1 h-4 w-4" />
                          Merged: {formatDate(pr.mergedAt.toDateString())}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {pr.label?.map((label, index) => (
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
              {pr.description && (
                <CardDescription>
                  <HighlightBackticks text={pr.description} isDesc />
                </CardDescription>
              )}

              {((pr.assignees?.length ?? 0) > 0 ||
                (pr.reviewers?.length ?? 0) > 0) && (
                <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
                  {pr.assignees && pr.assignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        <AvatarGroup users={pr.assignees} limit={3} />
                      </div>
                    </div>
                  )}

                  {pr.reviewers && pr.reviewers?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        <AvatarGroup users={pr.reviewers} limit={3} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-secondary-foreground/60">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4" />
                  <span className="">{pr.headRef}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span className="">{pr.baseRef}</span>
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
