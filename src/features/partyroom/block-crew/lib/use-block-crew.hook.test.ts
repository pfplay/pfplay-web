jest.mock('@/shared/lib/store/stores.context');
jest.mock('@/shared/ui/components/dialog');
jest.mock('../api/use-block-crew.mutation');

import { renderHook, act } from '@testing-library/react';
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';
import useBlockCrew from './use-block-crew.hook';
import useBlockCrewMutation from '../api/use-block-crew.mutation';

const mockMutate = jest.fn();
const mockOpenAlertDialog = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useStores as jest.Mock).mockReturnValue({
    useCurrentPartyroom: (selector: (...args: any[]) => any) =>
      selector({
        crews: [
          { crewId: 1, nickname: 'Alice' },
          { crewId: 2, nickname: 'Bob' },
        ],
      }),
  });
  (useDialog as jest.Mock).mockReturnValue({ openAlertDialog: mockOpenAlertDialog });
  (useBlockCrewMutation as jest.Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useBlockCrew hook', () => {
  test('mutate를 payload와 함께 호출한다', () => {
    const { result } = renderHook(() => useBlockCrew());

    act(() => {
      result.current({ crewId: 1 });
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { crewId: 1 },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  test('성공 시 crew 닉네임으로 alert를 표시한다', () => {
    mockMutate.mockImplementation((_payload: any, options: any) => {
      options.onSuccess();
    });
    const { result } = renderHook(() => useBlockCrew());

    act(() => {
      result.current({ crewId: 1 });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith({
      content: 'Alice has been blocked.',
    });
  });

  test('crew를 찾지 못하면 기본 텍스트를 사용한다', () => {
    mockMutate.mockImplementation((_payload: any, options: any) => {
      options.onSuccess();
    });
    const { result } = renderHook(() => useBlockCrew());

    act(() => {
      result.current({ crewId: 999 });
    });

    expect(mockOpenAlertDialog).toHaveBeenCalledWith({
      content: 'Crew has been blocked.',
    });
  });
});
