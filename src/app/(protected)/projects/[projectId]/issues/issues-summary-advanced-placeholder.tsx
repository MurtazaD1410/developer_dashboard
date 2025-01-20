import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const AdvancedIssuesSummaryPlaceholder = () => {
  return (
    <div className="space-y-6 filter">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-background/80">
            <Button variant="default" className="font-semibold">
              Upgrade to Pro
            </Button>
          </div>
          <Card className="rounded-md blur-[2px]">
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{50}%</p>
              <p className="text-sm text-gray-500">
                Percentage of issues with comments
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80">
            <Button variant="default" className="font-semibold">
              Upgrade to Pro
            </Button>
          </div>
          <Card className="rounded-md blur-[2px]">
            <CardHeader>
              <CardTitle>Average Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{0.3}</p>
              <p className="text-sm text-gray-500">Comments per issue</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedIssuesSummaryPlaceholder;
