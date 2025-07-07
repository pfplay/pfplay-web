import { useCallback } from 'react';
import { captureDOMToBlob, convertToFormData } from '@/shared/lib/functions/capture-dom';
import { useSelectedAvatarState } from './selected-avatar-state.context';

export const useAvatarCapture = () => {
  const { avatarDOM } = useSelectedAvatarState();

  const captureAvatar = useCallback(async () => {
    try {
      if (!avatarDOM.current) {
        throw new Error('avatarDOM is not found');
      }
      const blob = await captureDOMToBlob(avatarDOM);
      const formData = convertToFormData(blob);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'avatar.webp';
      a.click();

      return { formData };
    } catch (error) {
      console.error('Avatar capture failed:', error);
      throw error;
    }
  }, [avatarDOM]);

  return { captureAvatar };
};
