"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const AdvancedIssuesSummaryPlaceholder = () => {
  const advancedAnalytics = {
    engagementRate: {
      value: 50,
      label: "Engagement Rate",
      subtext: "Percentage of issues with comments",
      icon: Activity,
    },
    avgCommentsPerIssue: {
      value: 3,
      label: "Average Comments",
      subtext: "Comments per Issue",
      icon: MessageSquare,
    },
    avgTimeToClose: {
      value: 3,
      label: "Average Time to Close",
      subtext: "Days per issue",
      icon: Clock,
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(advancedAnalytics).map(([key, metric]) => (
        <div className="relative" key={key}>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
            <Button
              variant="default"
              className="font-semibold"
              onClick={() => redirect("/billing")}
            >
              Upgrade to Pro
            </Button>
          </div>
          <Card key={key} className="rounded-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <metric.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {metric.value}
                      {key === "avgTimeToClose" ? " days" : ""}
                      {key === "engagementRate" ? "%" : ""}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {metric.subtext}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default AdvancedIssuesSummaryPlaceholder;
