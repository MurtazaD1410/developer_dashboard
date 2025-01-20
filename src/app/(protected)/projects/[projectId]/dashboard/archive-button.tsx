"use client";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const { projectId } = useProject();
  const archiveProject = api.project.archiveProject.useMutation();
  const { data: userRole } = api.user.getUserRole.useQuery({ projectId });

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Leave Project",
    "This action cannot be undone.",
    "destructive",
  );
  return (
    <>
      <DeleteDialog />
      <Button
        disabled={archiveProject.isPending}
        size={"sm"}
        variant="destructive"
        onClick={async () => {
          const ok = await confirmDelete();

          if (!ok) return;

          if (userRole?.role === "ADMIN") {
            archiveProject.mutate(
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
          } else {
            toast.error("You are not authorized to archive this project.");
          }
        }}
      >
        Archive
      </Button>
    </>
  );
};

export default ArchiveButton;
