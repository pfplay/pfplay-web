'use client';
import { useRouter } from 'next/navigation';
import { useSuspenseFetchMe } from '@/entities/me';
import { PartyroomMutationForm, PartyroomMutationSubmitHandler } from '@/entities/partyroom-info';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { FormItem } from '@/shared/ui/components/form-item';
import { Typography } from '@/shared/ui/components/typography';
import useCreatePartyroom from '../api/use-create-partyroom.mutation';

type Props = {
  onSuccess?: () => void;
};

export default function PartyroomCreateForm({ onSuccess }: Props) {
  const t = useI18n();
  const router = useRouter();
  const { mutate: create } = useCreatePartyroom();
  const { data: me } = useSuspenseFetchMe();

  const handleSubmit: PartyroomMutationSubmitHandler = async (values, formInstance) => {
    create(
      {
        title: values.name,
        introduction: values.introduce,
        linkDomain: values.domain,
        playbackTimeLimit: values.limit,
      },
      {
        onSuccess: (data) => {
          onSuccess?.();
          router.push(`/parties/${data.partyroomId}`);
        },
        onError: (error) => {
          if (error.response?.status === 409) {
            formInstance.setError('domain', {
              message: t.createparty.para.domain_in_use,
            });
          }
        },
      }
    );
  };

  return (
    <PartyroomMutationForm
      onSubmit={handleSubmit}
      submitText={t.createparty.btn.create_party}
      sub={
        <FormItem
          label={
            <Typography as='span' type='body2'>
              Admin
            </Typography>
          }
          classNames={{ label: 'text-gray-200' }}
        >
          <DjListItem userConfig={{ username: me.nickname, src: me.avatarIconUri }} />
        </FormItem>
      }
    />
  );
}
