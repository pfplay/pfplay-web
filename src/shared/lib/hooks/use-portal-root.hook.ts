import { useState } from 'react';
import { DomId } from '@/shared/config/dom-id';
import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import useDidMountEffect from './use-did-mount-effect';

export default function usePortalRoot(id: string) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useDidMountEffect(() => {
    const root = document.getElementById(DomId.DrawerRoot);
    if (root) {
      setRoot(root);
    } else {
      log(`Cannot find portal root element. id: ${id}`);
    }
  }, []);

  return root;
}

const logger = withDebugger(0);
const log = logger(errorLog);
