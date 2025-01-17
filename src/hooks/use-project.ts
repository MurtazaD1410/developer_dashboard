import { api } from "@/trpc/react";
import { useParams, useRouter } from "next/navigation";

const useProject = () => {
  const params = useParams();
  const router = useRouter();

  const {
    data: projects,
    isLoading,
    isError,
  } = api.project.getProjects.useQuery();

  var projectId = params?.projectId as string;

  const project = projects?.find((project) => project.id === projectId);
  if (!projectId) {
    projectId = projects?.[0]?.id ?? "";
  }

  const setProjectId = (newProjectId: string) => {
    router.push(`/projects/${newProjectId}/dashboard`);
  };

  return { projects, project, projectId, setProjectId, isLoading, isError };
};

export default useProject;
