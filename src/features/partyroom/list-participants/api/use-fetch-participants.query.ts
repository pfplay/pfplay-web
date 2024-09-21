import { fixturePartyroomCrews } from '@/shared/api/http/__fixture__/partyroom-participants.fixture';

export default function useFetchParticipants() {
  // TODO: 향후 api 연결 시 삭제
  return fixturePartyroomCrews;

  // TODO: 향후 api 연결 시 uncomment 후 로직 완성
  // return useQuery({
  //   queryKey: [QueryKeys.Participants],
  //   queryFn: () => fetchParticipants(),
  // });
}
