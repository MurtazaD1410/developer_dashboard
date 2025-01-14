import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const {
    data: projects,
    isLoading,
    isError,
  } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("devDash-project-id", "");
  const project = projects?.find((project) => project.id === projectId);

  return { projects, project, projectId, setProjectId, isLoading, isError };
};

export default useProject;
