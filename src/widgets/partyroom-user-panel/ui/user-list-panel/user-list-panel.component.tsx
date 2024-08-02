import { ParticipantList } from '@/features/partyroom/list-participants';
import { fixturePartyroomMembers } from '@/shared/api/http/__fixture__/partyroom-participants.fixture';
import { categorizeParticipantsByGrade } from './model/user-list-panel.model';

const UserListPanel = () => {
  const categorizedParticipants = categorizeParticipantsByGrade(fixturePartyroomMembers);

  return <ParticipantList categorizedParticipants={categorizedParticipants} />;
};

export default UserListPanel;
