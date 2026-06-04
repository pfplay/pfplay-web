'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useUpdateMyBio } from '../api/use-update-my-bio.mutation';
import * as Form from '../model/form.model';

/**
 * 프로필 바이오(닉네임·소개) 편집 폼 로직의 단일 출처.
 * 데스크탑 `ProfileEditFormV1` 과 모바일 `MobileProfileEditForm` 이 공유한다
 * (레이아웃만 폼팩터별로 다름 — #390 `useBeAHost` 와 동일 패턴).
 */
export const useEditProfileBioForm = () => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateBio, isPending } = useUpdateMyBio();

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isValid },
  } = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.getSchema(t)),
    defaultValues: {
      nickname: me.nickname,
      introduction: me.introduction,
    },
  });

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  const onSubmit = handleSubmit((values) => {
    updateBio(values, {
      onError: (err) => {
        if (err.response?.data.code === 409) {
          setError('nickname', { message: t.settings.para.nickname_taken });
        }
      },
    });
  });

  return { control, onSubmit, errors, btnDisabled, isPending };
};
