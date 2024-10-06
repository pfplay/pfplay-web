'use client';
import {
  PartyroomMutationForm,
  PartyroomMutationFormModel,
  PartyroomMutationSubmitHandler,
} from '@/entities/partyroom-info';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import useEditPartyroom from '../api/use-edit-partyroom.mutation';

type Props = {
  onSuccess?: () => void;
  defaultValues?: PartyroomMutationFormModel;
};

export default function PartyroomEditForm({ onSuccess, defaultValues }: Props) {
  const t = useI18n();
  const { mutate: edit } = useEditPartyroom();

  const handleSubmit: PartyroomMutationSubmitHandler = async (values, formInstance) => {
    // TODO: defaultValues 와 payload 같으면 onSuccess만 호출하고 return

    edit(
      {
        title: values.name,
        introduction: values.introduce,
        linkDomain: values.domain,
        playbackTimeLimit: values.limit,
      },
      {
        onSuccess,
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

  return <PartyroomMutationForm onSubmit={handleSubmit} defaultValues={defaultValues} />;
}
