"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { type UserTier } from "@/types/types";
import { Copy, RefreshCcw } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface InviteButtonProps {
  canInviteMembers: boolean;
  tier: UserTier;
}

const InviteButton = ({ canInviteMembers, tier }: InviteButtonProps) => {
  const { projectId, project } = useProject();
  const refetch = useRefetch();
  const [open, setOpen] = useState(false);
  const [openUpgradeDialog, setOpenUpgradeDialog] = useState(false);
  const { data: userRole } = api.user.getUserRole.useQuery({ projectId });
  const resetInviteLink = api.project.resetInviteLink.useMutation();

  const [ResetInviteCodeDialog, confirmResetInviteCode] = useConfirm(
    "Reset Invite Code",
    "This will disable all existing links",
    "destructive",
  );

  return (
    <>
      <ResetInviteCodeDialog />
      <Dialog open={openUpgradeDialog} onOpenChange={setOpenUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upgrade to {tier === "basic" ? "Pro" : "Premium"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary-foreground/80">
            Upgrade your tier to add more members to your project.
          </p>
          <div className="flex items-center justify-end gap-x-2">
            <Button
              variant={"outline"}
              onClick={() => {
                setOpenUpgradeDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={"default"}
              onClick={() => {
                redirect("/billing");
              }}
            >
              Upgrade Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-secondary-foreground/80">
            Ask them copy and paste this link
          </p>
          <div className="flex items-center gap-x-2">
            <Input
              readOnly
              className=""
              value={`${window.location.origin}/projects/${projectId}/join/${project?.inviteCode}`}
            />
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={async () => {
                const ok = await confirmResetInviteCode();

                if (!ok) return;

                if (userRole?.role === "ADMIN") {
                  resetInviteLink.mutate(
                    { projectId },
                    {
                      onSuccess: () => {
                        toast.success("Invite code reset was successful");
                        refetch();
                      },
                      onError: () => {
                        toast.error("Failed to reset project invite code");
                      },
                    },
                  );
                } else {
                  toast.error(
                    "You are not authorized to reset the invite code of this project.",
                  );
                }
              }}
            >
              <RefreshCcw className="size-5" />
            </Button>
            <Button
              variant={"outline"}
              size={"icon"}
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/projects/${projectId}/join/${project?.inviteCode}`,
                );
                toast.success("copied to clipboard");
              }}
            >
              <Copy className="size-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {
          canInviteMembers ? setOpen(true) : setOpenUpgradeDialog(true);
        }}
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
