// import { db } from "@/server/db";
// import { auth, clerkClient } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";

// interface JoinHandlerProps {
//   params: Promise<{ projectId: string; inviteCode: string }>;
// }

// const JoinHandler = async ({ params }: JoinHandlerProps) => {
//   const { projectId, inviteCode } = await params;
//   const { userId } = await auth();

//   if (!userId) return redirect("/sign-in");

//   const project = await db.project.findUnique({
//     where: {
//       id: projectId,
//     },
//   });

//   if (!project) return redirect("/projects");

//   if (inviteCode !== project.inviteCode) {
//     throw new Error("Invite code has expired");
//   }

//   const dbUser = await db.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });
//   const client = await clerkClient();
//   const user = await client.users.getUser(userId);

//   if (!dbUser) {
//     await db.user.create({
//       data: {
//         id: userId,
//         emailAddress: user.emailAddresses[0]!.emailAddress,
//         imageUrl: user.imageUrl,
//         firstName: user.firstName,
//         lastName: user.lastName,
//       },
//     });
//   }

//   try {
//     await db.userToProject.create({
//       data: {
//         projectId,
//         userId,
//       },
//     });
//   } catch (error) {
//     console.log("user already in project");
//   }

//   return (window.location.href = /projects/${projectId}/dashboard);
// };

// export default JoinHandler;

import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface JoinHandlerProps {
  params: Promise<{ projectId: string; inviteCode: string }>;
}

const JoinHandler = async ({ params }: JoinHandlerProps) => {
  const { projectId, inviteCode } = await params;
  const { userId } = await auth();

  if (!userId) return redirect("/sign-in");

  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      userToProject: {
        where: {
          role: {
            equals: "ADMIN",
          },
        },
        include: {
          user: true,
        },
      },
    },
  });

  if (!project) return redirect("/projects");

  if (inviteCode !== project.inviteCode) {
    throw new Error("Invite code has expired");
  }

  const dbUser = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        emailAddress: user.emailAddresses[0]!.emailAddress,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  // Check the user's tier
  const tier = project?.userToProject[0]?.user.tier || "basic"; // Assume "basic" if no tier is set
  const allowedTeamSize = tier === "premium" ? 5 : tier === "pro" ? 3 : 0;

  // Get the current number of teammates in the project
  const currentTeamSize = await db.userToProject.count({
    where: {
      projectId,
    },
  });

  if (currentTeamSize >= allowedTeamSize) {
    throw new Error(
      `You cannot add more teammates. The ${tier} tier allows up to ${allowedTeamSize} teammates.`,
    );
  }

  try {
    await db.userToProject.create({
      data: {
        projectId,
        userId,
      },
    });
  } catch (error) {
    console.log("User already in project");
  }

  window.location.href = `/projects/${projectId}/dashboard`;
};

export default JoinHandler;
