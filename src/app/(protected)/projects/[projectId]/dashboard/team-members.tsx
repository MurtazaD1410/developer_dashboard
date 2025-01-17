"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";

const TeamMembers = () => {
  const { projectId } = useProject();
  const { data: members } = api.project.getTeamMembers.useQuery({ projectId });

  if (!members) {
    return null;
  }

  const visibleUsers = members.slice(0, 3);
  const remaining = Math.max(0, members.length - 3);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-4">
        {visibleUsers.map((user, i) => (
          <Avatar key={i} className="border-2 border-background">
            <AvatarImage
              src={user.user.imageUrl ?? ""}
              alt={user.user.firstName ?? ""}
            />
            <AvatarFallback>
              {user.user.firstName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        ))}
        {remaining > 0 && (
          <Avatar className="border-2 bg-muted">
            <AvatarFallback className="bg-muted text-muted-foreground">
              +{remaining}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default TeamMembers;
