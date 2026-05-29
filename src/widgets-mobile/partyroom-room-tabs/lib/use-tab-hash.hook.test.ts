/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import useTabHash, { TabKey } from './use-tab-hash.hook';

beforeEach(() => {
  window.history.replaceState(null, '', '/parties/1');
});

describe('useTabHash', () => {
  test('초기값은 hash 없으면 chat (default)', () => {
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('chat');
  });

  test('mount 시점 hash = #crew 면 crew 로 초기화', () => {
    window.history.replaceState(null, '', '/parties/1#crew');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('crew');
  });

  test('mount 시점 hash = #queue 면 queue', () => {
    window.history.replaceState(null, '', '/parties/1#queue');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('queue');
  });

  test('알 수 없는 hash 는 chat 으로 fallback', () => {
    window.history.replaceState(null, '', '/parties/1#bogus');
    const { result } = renderHook(() => useTabHash());
    expect(result.current.activeTab).toBe<TabKey>('chat');
  });

  test('setActiveTab 호출 시 hash 가 갱신된다', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('crew'));
    expect(window.location.hash).toBe('#crew');
    expect(result.current.activeTab).toBe('crew');
  });

  test('chat 으로 돌아가면 hash 제거', () => {
    window.history.replaceState(null, '', '/parties/1#crew');
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('chat'));
    expect(window.location.hash).toBe('');
    expect(result.current.activeTab).toBe('chat');
  });

  test('hashchange 이벤트 (뒤로/앞으로) 발생 시 state 동기화', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => {
      window.history.pushState(null, '', '/parties/1#queue');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(result.current.activeTab).toBe('queue');
  });

  test('동일 탭 재클릭은 history 항목을 추가하지 않는다 (idempotence guard)', () => {
    const { result } = renderHook(() => useTabHash());
    act(() => result.current.setActiveTab('crew'));
    const lengthAfterFirst = window.history.length;
    act(() => result.current.setActiveTab('crew'));
    act(() => result.current.setActiveTab('crew'));
    expect(window.history.length).toBe(lengthAfterFirst);
    expect(result.current.activeTab).toBe('crew');
  });

  test('invalid hash 진입 후 chat 탭 클릭 → URL 정규화 (#bogus 제거)', () => {
    window.history.replaceState(null, '', '/parties/1#bogus');
    const { result } = renderHook(() => useTabHash());
    // mount 후 readHashAsTab fallback 으로 'chat' state 정착, URL 은 여전히 #bogus
    expect(result.current.activeTab).toBe('chat');
    expect(window.location.hash).toBe('#bogus');
    // chat 탭 명시적 클릭 → 정규화 발동
    act(() => result.current.setActiveTab('chat'));
    expect(window.location.hash).toBe('');
    expect(result.current.activeTab).toBe('chat');
  });
});
