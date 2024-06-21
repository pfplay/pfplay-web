import { AvatarService } from '@/shared/api/services/avatar';
import AvatarListItem from 'features/edit-profile-avatar/ui/avatar-list-item.component';

const AvatarBodyList = async () => {
  const bodyList = await AvatarService.getBodyList();

  return (
    <div className='max-h-[460px] grid grid-cols-2 gap-3 laptop:grid-cols-3 desktop:grid-cols-5 overflow-y-auto'>
      {bodyList.map((avatar) => (
        <AvatarListItem key={avatar.id} avatar={avatar} from='body' />
      ))}
    </div>
  );
};

export default AvatarBodyList;
