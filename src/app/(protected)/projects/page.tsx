"use client";

import { redirect } from "next/navigation";

import { useAuth } from "@clerk/nextjs";
import useProject from "@/hooks/use-project";

export default function Home() {
  const user = useAuth();

  if (!user) redirect("/sign-in");

  const { projects, projectId, setProjectId } = useProject();

  if (projects?.length === 0) {
    redirect("/create");
  } else {
    redirect(`/projects/${projects![0]!.id}/dashboard`);
  }
}
