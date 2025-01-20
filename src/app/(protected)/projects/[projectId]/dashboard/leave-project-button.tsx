"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const LeaveProjectButton = () => {
  const { projectId } = useProject();
  const leaveProject = api.project.leaveProject.useMutation();

  const [LeaveProjectDialog, confirmLeaveProject] = useConfirm(
    "Leave Project",
    "This action unless you are invited again.",
    "destructive",
  );

  return (
    <>
      <LeaveProjectDialog />
      <Button
        disabled={leaveProject.isPending}
        size={"sm"}
        variant="destructive"
        onClick={async () => {
          const ok = await confirmLeaveProject();

          if (!ok) return;

          leaveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived");
                window.location.href = `/projects`;
              },
              onError: () => {
                toast.error("Failed to archive project");
              },
            },
          );
        }}
      >
        Leave Project
      </Button>
    </>
  );
};

export default LeaveProjectButton;
