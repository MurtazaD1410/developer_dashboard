import React from "react";
import { Clock, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const AdvancedPrsSummaryPlaceholder = () => {
  // Calculate metrics
  const metrics = {
    avgTimeToMerge: {
      value: 50,
      label: "Time to Merge",
      subtext: "Average hours",
      icon: Clock,
    },
    approvalRate: {
      value: 75,
      label: "Approval Rate",
      subtext: "First-time approvals",
      icon: CheckCircle2,
    },
    avgReviewers: {
      value: 1,
      label: "Reviewers",
      subtext: "Average per PR",
      icon: Users,
    },
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Object.entries(metrics).map(([key, metric]) => (
        <div className="relative" key={key}>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
            <Button
              variant="default"
              className="font-semibold"
              onClick={() => {
                redirect("/billing");
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
          <Card className="rounded-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <metric.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {metric.value}
                      {key === "mergeRate" || key === "approvalRate" ? "%" : ""}
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

export default AdvancedPrsSummaryPlaceholder;
