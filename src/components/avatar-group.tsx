import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { type AssigneeOrReviewer } from "@/types/types";

const AvatarGroup = ({
  users = [],
  limit = 3,
  remainingLabel = true,
}: {
  users?: AssigneeOrReviewer[] | null;
  limit: number;
  remainingLabel?: boolean;
}) => {
  if (!users) {
    return null;
  }

  const visibleUsers = users.slice(0, limit);
  const remaining = Math.max(0, users.length - limit);

  return (
    <div className="flex -space-x-4">
      {visibleUsers.map((user, i) => (
        <Avatar key={i} className="border-2 border-background">
          <AvatarImage
            src={user.assigneeOrReviewerAvatar ?? ""}
            alt={user.assigneeOrReviewerUsername ?? ""}
          />
          <AvatarFallback>
            {user.assigneeOrReviewerUsername?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && remainingLabel && (
        <Avatar className="border-2 bg-muted">
          <AvatarFallback className="bg-muted text-muted-foreground">
            +{remaining}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default AvatarGroup;
