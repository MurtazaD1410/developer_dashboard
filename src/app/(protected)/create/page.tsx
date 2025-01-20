"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { generateInviteCode } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Info, Loader } from "lucide-react";
import Image from "next/image";

import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInput = {
  repoUrl: string;
  projectName: string;
  branch?: string;
  githubToken?: string;
};

const CreatePageClient = () => {
  const { register, handleSubmit } = useForm<FormInput>();
  const { projects } = useProject();
  const createProject = api.project.createProject.useMutation();
  const { data: user } = api.user.getUser.useQuery();
  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    if (user?.tier === "basic" && (projects?.length ?? 0) >= 3) {
      toast.error("Please upgrade plan to create more projects!");
      return;
    }
    if (user?.tier === "pro" && (projects?.length ?? 0) >= 5) {
      toast.error("Please upgrade plan to create more projects!");
      return;
    }
    if (user?.tier === "premium" && (projects?.length ?? 0) >= 10) {
      toast.error("Please upgrade plan to create more projects!");
      return;
    }

    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        inviteCode: generateInviteCode(6),
        defaultBranch: data.branch,
        githubToken: data.githubToken,
      },
      {
        onSuccess: ({ id }) => {
          toast.success("Project created successfully!");
          refetch();
          window.location.href = `/projects/${id}/dashboard`;
        },
        onError: (e) => {
          toast.error(e.message ?? "Failed to create project!");
        },
      },
    );
    return true;
  }

  const canCreateProject = () => {
    if (user?.tier === "basic" && (projects?.length ?? 0) >= 3) {
      return false;
    }
    if (user?.tier === "pro" && (projects?.length ?? 0) >= 5) {
      return false;
    }
    if (user?.tier === "premium" && (projects?.length ?? 0) >= 10) {
      return false;
    }

    return true;
  };

  const remainingLimit = () => {
    if (user?.tier === "basic") {
      return 3 - (projects?.length ?? 0);
    }
    if (user?.tier === "pro") {
      return 5 - (projects?.length ?? 0);
    }
    if (user?.tier === "premium") {
      return 10 - (projects?.length ?? 0);
    }
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <Image src={"/hero.svg"} height={350} width={350} alt="Hero" />
      <div className="">
        <div className="">
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to DevDash
          </p>
        </div>
        <div className="h-4"></div>
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("projectName", { required: true })}
            placeholder="Project Name"
            required
          />
          <div className="h-2"></div>
          <Input
            {...register("repoUrl", { required: true })}
            placeholder="Repository URL"
            type="url"
            required
          />
          <div className="h-2"></div>
          <Input
            {...register("githubToken")}
            placeholder="GitHub Token (Optional)"
          />
          <>
            <div className="mt-4 rounded-md border-2 border-primary/60 bg-primary/10 px-4 py-2 text-secondary-foreground">
              <div className="flex items-center gap-2">
                <Info className="size-4" />
                <p className="text-sm">
                  You have created or are a part {projects?.length}{" "}
                  {(projects?.length ?? 0) > 0 ? "projects" : "project"}
                </p>
              </div>
              <p className="ml-6 text-sm text-secondary-foreground">
                You have {remainingLimit()} projects remaining.
              </p>
            </div>
          </>

          <div className="h-4"></div>
          <Button
            type="submit"
            disabled={createProject.isPending || !canCreateProject()}
          >
            {createProject.isPending ? (
              <div className="inline-flex items-center gap-x-2">
                <Loader className="size-8 animate-spin" />
                <span>Creating Project</span>
              </div>
            ) : (
              "Creat Project"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePageClient;
