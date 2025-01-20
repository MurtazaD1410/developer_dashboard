"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./member-avatar";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/types";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

export const MembersList = () => {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const changeMemberRole = api.project.changeMemberRole.useMutation();
  const removeMember = api.project.removeMember.useMutation();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });
  const { data: userRole } = api.user.getUserRole.useQuery({ projectId });

  // const handleChangeMemberRole = (userId: string, role: UserRole) => {
  //   if (userRole?.role === "ADMIN") {
  //     changeMemberRole.mutate(
  //       {
  //         projectId,
  //         userId,
  //         role,
  //       },
  //       {
  //         onSuccess: () => {
  //           toast.success("Member role changed");
  //           refetch();
  //         },
  //         onError: () => {
  //           toast.error("Failed to change member role");
  //         },
  //       },
  //     );
  //   } else {
  //     toast.error("You are not authorized to change the role of a member.");
  //   }
  // };

  const handleRemoveMember = (userId: string, role: UserRole) => {
    if (userRole?.role === "ADMIN") {
      const adminCount =
        members?.filter((member) => member.role === "ADMIN").length ?? 0;

      if (role === "ADMIN" && adminCount <= 1) {
        toast.error("There must be at least one admin in the project.");
        return;
      }

      removeMember.mutate(
        {
          projectId,
          userId,
        },
        {
          onSuccess: () => {
            toast.success("Member removed");
            refetch();
          },
          onError: () => {
            toast.error("Failed to remove member");
          },
        },
      );
    } else {
      toast.error("You are not authorized to remove a member.");
    }
  };

  const handleChangeMemberRole = (userId: string, role: UserRole) => {
    if (userRole?.role === "ADMIN") {
      const adminCount =
        members?.filter((member) => member.role === "ADMIN").length ?? 0;

      if (role === "MEMBER" && adminCount <= 1) {
        toast.error("There must be at least one admin in the project.");
        return;
      }

      changeMemberRole.mutate(
        {
          projectId,
          userId,
          role,
        },
        {
          onSuccess: () => {
            toast.success("Member role changed");
            refetch();
          },
          onError: () => {
            toast.error("Failed to change member role");
          },
        },
      );
    } else {
      toast.error("You are not authorized to change the role of a member.");
    }
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="felx flex-row items-center gap-x-4 space-y-0 p-7">
        <Button asChild variant={"secondary"} size={"sm"}>
          <Link href={`/dashboard`}>
            <ArrowLeftIcon className="mr-2 size-4" />
            Back
          </Link>
        </Button>
        <h1 className="mb-2 text-2xl font-semibold">Team Members</h1>
      </CardHeader>
      <div className="px-7"></div>
      <CardContent className="p-7">
        {members?.map((member, index) => (
          <Fragment key={member.id}>
            <div className="flex items-center gap-2">
              <MemberAvatar
                name={member.user.firstName ?? ""}
                imageUrl={member.user.imageUrl ?? ""}
                className="size-10"
                fallbackClassName="text-lg"
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">
                  {member.user.firstName ?? ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.user.emailAddress ?? ""}
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-3">
                <Badge
                  variant={member.role === "ADMIN" ? "destructive" : "default"}
                >
                  {member.role}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="ml-auto"
                      variant={"secondary"}
                      size="icon"
                    >
                      <MoreVerticalIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    {member.role === "MEMBER" && (
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() => {
                          handleChangeMemberRole(
                            member.user.id,
                            UserRole.admin,
                          );
                        }}
                      >
                        Set as Administrator
                      </DropdownMenuItem>
                    )}
                    {member.role === "ADMIN" && (
                      <DropdownMenuItem
                        className="font-medium"
                        onClick={() => {
                          handleChangeMemberRole(
                            member.user.id,
                            UserRole.member,
                          );
                        }}
                      >
                        Set as Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => {
                        handleRemoveMember(
                          member.user.id,
                          member.role as UserRole,
                        );
                      }}
                    >
                      Remove {member.user.firstName}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {index < members.length - 1 && <Separator className="my-2.5" />}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
