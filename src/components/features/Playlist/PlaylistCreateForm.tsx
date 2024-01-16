import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { ErrorResponse } from '@/api/@types/@shared';
import { useCreatePlaylistMutation } from '@/api/query-temp/playlist/useCreatePlaylistMutation.tsx';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './PlaylistForm';

type PlaylistCreateFormProps = Pick<PlaylistFormProps, 'onCancel'>;
const PlaylistCreateForm = (props: PlaylistCreateFormProps) => {
  const { mutate } = useCreatePlaylistMutation();

  const handleSubmit: SubmitHandler<PlaylistFormType> = async ({ name }) => {
    mutate(
      { name },
      {
        onError: (err) => {
          if (isAxiosError<ErrorResponse>(err)) {
            // FIXME: 다국어 에러처리 필요.
            alert(err.response?.data.data.message);
          }
        },
        onSettled: () => props.onCancel?.(),
      }
    );
  };
  return <PlaylistForm onSubmit={handleSubmit} {...props} />;
};

export default PlaylistCreateForm;
