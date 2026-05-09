import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SystemAnnouncementDisplay from './system-announcement-display';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot, MaintenanceState } from '../model/system-announcement.types';

vi.mock('./maintenance-overlay', () => ({
  default: ({ maintenance }: { maintenance: MaintenanceState }) => (
    <div data-testid='m-overlay'>{maintenance.phase}</div>
  ),
}));
vi.mock('./maintenance-planned-banner', () => ({
  default: ({ snapshot }: { snapshot: AnnouncementSnapshot }) => (
    <div data-testid='planned'>{snapshot.announcementId}</div>
  ),
}));
vi.mock('./event-toast', () => ({
  default: ({ snapshot }: { snapshot: AnnouncementSnapshot }) => (
    <div data-testid='toast'>{snapshot.announcementId}</div>
  ),
}));
vi.mock('./emergency-banner', () => ({
  default: ({ snapshot }: { snapshot: AnnouncementSnapshot }) => (
    <div data-testid='emergency'>{snapshot.announcementId}</div>
  ),
}));

const mk = (id: number, overrides: Partial<AnnouncementSnapshot> = {}): AnnouncementSnapshot => ({
  announcementId: id,
  type: 'EVENT',
  severity: 'INFO',
  titleKo: '제목',
  titleEn: 'Title',
  messageKo: '내용',
  messageEn: 'Content',
  scheduledStartAt: null,
  scheduledEndAt: null,
  expiresAt: null,
  sentAt: '2026-05-03T15:00:00',
  ...overrides,
});

const ACTIVE: MaintenanceState = {
  phase: 'ACTIVE',
  startAt: '2026-05-04T03:00:00',
  endAt: '2026-05-04T04:00:00',
  messageKo: 'ko',
  messageEn: 'en',
};

beforeEach(() => {
  useSystemAnnouncementStore.setState({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,
  });
});

describe('SystemAnnouncementDisplay', () => {
  test('maintenance.phase===ACTIVE 면 MaintenanceOverlay 1개 mount', () => {
    useSystemAnnouncementStore.setState({ maintenance: ACTIVE });
    render(<SystemAnnouncementDisplay />);
    expect(screen.getAllByTestId('m-overlay')).toHaveLength(1);
  });

  test('maintenance===null 이면 overlay 미마운트', () => {
    render(<SystemAnnouncementDisplay />);
    expect(screen.queryByTestId('m-overlay')).not.toBeInTheDocument();
  });

  test('MAINTENANCE_NOTICE 2개 → MaintenancePlannedBanner 2개', () => {
    useSystemAnnouncementStore.setState({
      announcements: new Map([
        [1, mk(1, { type: 'MAINTENANCE_NOTICE' })],
        [2, mk(2, { type: 'MAINTENANCE_NOTICE' })],
      ]),
    });
    render(<SystemAnnouncementDisplay />);
    expect(screen.getAllByTestId('planned')).toHaveLength(2);
  });

  test('EMERGENCY 1개 → EmergencyBanner 1개', () => {
    useSystemAnnouncementStore.setState({
      announcements: new Map([[3, mk(3, { type: 'EMERGENCY', severity: 'CRITICAL' })]]),
    });
    render(<SystemAnnouncementDisplay />);
    expect(screen.getAllByTestId('emergency')).toHaveLength(1);
  });

  test('EVENT(INFO/WARN) 3개 → EventToast 3개', () => {
    useSystemAnnouncementStore.setState({
      announcements: new Map([
        [4, mk(4, { type: 'EVENT', severity: 'INFO' })],
        [5, mk(5, { type: 'EVENT', severity: 'WARN' })],
        [6, mk(6, { type: 'EVENT', severity: 'INFO' })],
      ]),
    });
    render(<SystemAnnouncementDisplay />);
    expect(screen.getAllByTestId('toast')).toHaveLength(3);
  });

  test('ACTIVE 점검 + EMERGENCY 1 + EVENT 2 → 4개 모두 mount', () => {
    useSystemAnnouncementStore.setState({
      maintenance: ACTIVE,
      announcements: new Map([
        [7, mk(7, { type: 'EMERGENCY', severity: 'CRITICAL' })],
        [8, mk(8, { type: 'EVENT', severity: 'INFO' })],
        [9, mk(9, { type: 'EVENT', severity: 'WARN' })],
      ]),
    });
    render(<SystemAnnouncementDisplay />);
    expect(screen.getAllByTestId('m-overlay')).toHaveLength(1);
    expect(screen.getAllByTestId('emergency')).toHaveLength(1);
    expect(screen.getAllByTestId('toast')).toHaveLength(2);
    expect(screen.queryByTestId('planned')).not.toBeInTheDocument();
  });
});
