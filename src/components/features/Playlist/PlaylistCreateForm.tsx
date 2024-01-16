import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import PlaylistForm, { PlaylistFormProps, PlaylistFormType } from './PlaylistForm';

type PlaylistCreateFormProps = Pick<PlaylistFormProps, 'onCancel'>;
const PlaylistCreateForm = (props: PlaylistCreateFormProps) => {
  const handleSubmit: SubmitHandler<PlaylistFormType> = ({ title }) => {
    alert(title);
  };
  return <PlaylistForm onSubmit={handleSubmit} {...props} />;
};

export default PlaylistCreateForm;
