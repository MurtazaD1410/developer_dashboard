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

export const MembersList = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

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
                      <DropdownMenuItem className="font-medium">
                        Set as Administrator
                      </DropdownMenuItem>
                    )}
                    {member.role === "ADMIN" && (
                      <DropdownMenuItem className="font-medium">
                        Set as Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="font-medium text-amber-700">
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
