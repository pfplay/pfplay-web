import { usePathname } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { bugReportsService } from '@/shared/api/http/services';

function extractPartyroomIdFromPath(pathname: string | null): number | undefined {
  if (!pathname) return undefined;
  const match = pathname.match(/^\/parties\/(\d+)/);
  if (!match) return undefined;
  const id = Number(match[1]);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

export function useSubmitBugReport() {
  const pathname = usePathname();
  return useMutation({
    mutationFn: (input: { content: string }) =>
      bugReportsService.submit({
        content: input.content,
        partyroomId: extractPartyroomIdFromPath(pathname),
      }),
  });
}
