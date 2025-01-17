import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = ({
  name,
  imageUrl,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  return (
    <Avatar
      className={cn(
        "size-5 rounded-full border border-neutral-300 transition",
        className,
      )}
    >
      <AvatarImage
        src={imageUrl}
        className={cn(
          "flex items-center justify-center bg-neutral-200 font-medium text-neutral-500",
          fallbackClassName,
        )}
      />
      <AvatarFallback
        className={cn(
          "flex items-center justify-center bg-neutral-200 font-medium text-neutral-500",
          fallbackClassName,
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
