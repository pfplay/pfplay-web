import { useUserPreferenceStore } from './user-preference.store';

describe('user-preference store', () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useUserPreferenceStore.getState().reset();
  });

  test('초기 상태: djingGuideHidden은 false', () => {
    expect(useUserPreferenceStore.getState().djingGuideHidden).toBe(false);
  });

  describe('setDjingGuideHidden', () => {
    test('true로 설정', () => {
      useUserPreferenceStore.getState().setDjingGuideHidden(true);
      expect(useUserPreferenceStore.getState().djingGuideHidden).toBe(true);
    });

    test('false로 다시 설정', () => {
      useUserPreferenceStore.getState().setDjingGuideHidden(true);
      useUserPreferenceStore.getState().setDjingGuideHidden(false);
      expect(useUserPreferenceStore.getState().djingGuideHidden).toBe(false);
    });
  });

  describe('reset', () => {
    test('초기 상태로 복원', () => {
      useUserPreferenceStore.getState().setDjingGuideHidden(true);
      useUserPreferenceStore.getState().reset();

      expect(useUserPreferenceStore.getState().djingGuideHidden).toBe(false);
    });
  });
});
