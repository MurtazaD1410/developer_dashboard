"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
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

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const refetch = useRefetch();

  function onSubmit(data: FormInput) {
    createProject.mutate(
      {
        githubUrl: data.repoUrl,
        name: data.projectName,
        defaultBranch: data.branch,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully!");
          refetch();
          reset();
        },
        onError: () => {
          toast.error("Failed to create project!");
        },
      },
    );

    return true;
  }

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
          <div className="h-4"></div>
          <Button type="submit" disabled={createProject.isPending}>
            Create Project
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
