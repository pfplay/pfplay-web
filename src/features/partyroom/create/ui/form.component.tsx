'use client';
import { useRouter } from 'next/navigation';
import { PartyroomMutationForm, PartyroomMutationSubmitHandler } from '@/entities/partyroom-info';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import useCreatePartyroom from '../api/use-create-partyroom.mutation';

type Props = {
  onSuccess?: () => void;
};

export default function PartyroomCreateForm({ onSuccess }: Props) {
  const t = useI18n();
  const router = useRouter();
  const { mutate: create } = useCreatePartyroom();

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
    <PartyroomMutationForm onSubmit={handleSubmit} submitText={t.createparty.btn.create_party} />
  );
}
