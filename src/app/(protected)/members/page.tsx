import { MembersList } from "./members-list";

const WorkspaceIdMembersPage = async () => {
  return (
    <div className="flex w-full justify-center">
      <div className="w-full lg:max-w-lg">
        <MembersList />
      </div>
    </div>
  );
};

export default WorkspaceIdMembersPage;
