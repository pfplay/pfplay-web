'use client';

import { useState } from 'react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BoldProcessor } from '@/shared/lib/localization/renderer';
import { Trans } from '@/shared/lib/localization/renderer/index.ui';
import Dialog from '@/shared/ui/components/dialog/dialog.component';
import { Typography } from '@/shared/ui/components/typography';
import type { InstallEnvironment } from '../lib/install-environment';
import { showInstallPrompt } from '../lib/install-prompt';

type Props = {
  environment: InstallEnvironment;
  onClose: () => void;
};

const IOS_STEP_KEYS = ['pwa.ios_step_1', 'pwa.ios_step_2', 'pwa.ios_step_3'] as const;

/** iOS 는 설치 API 가 없어서 사용자가 직접 눌러야 한다. 어디를 누르는지만 정확히 알려준다. */
const IosGuide = () => {
  const t = useI18n();

  return (
    <div className='flexCol gap-4'>
      <Typography type='detail1' className='text-white'>
        {t.pwa.ios_guide_title}
      </Typography>
      <ol className='flexCol gap-3'>
        {IOS_STEP_KEYS.map((key, index) => (
          <li key={key} className='flex gap-3 items-start'>
            <span className='shrink-0 w-5 h-5 rounded-full bg-gray-600 text-white flexRowCenter text-[11px]'>
              {index + 1}
            </span>
            <Typography type='detail2' className='text-gray-200'>
              <Trans i18nKey={key} processors={[new BoldProcessor()]} />
            </Typography>
          </li>
        ))}
      </ol>
    </div>
  );
};

/** 인앱 웹뷰는 설치 수단 자체가 없다. 외부 브라우저로 나가는 것 말고는 방법이 없다. */
const InAppBrowserGuide = () => {
  const t = useI18n();
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch (error) {
      console.warn('[pwa] 링크 복사 실패', error);
    }
  };

  return (
    <div className='flexCol gap-4'>
      <Typography type='detail1' className='text-white'>
        {t.pwa.in_app_title}
      </Typography>
      <Typography type='detail2' className='text-gray-300'>
        {t.pwa.in_app_description}
      </Typography>
      <button
        type='button'
        onClick={copyLink}
        className='h-11 rounded border border-gray-600 text-white active:bg-gray-900'
        data-testid='pwa-copy-link'
      >
        {copied ? t.pwa.copied : t.pwa.copy_link}
      </button>
    </div>
  );
};

const InstallGuide = ({ environment, onClose }: Props) => {
  const t = useI18n();

  const install = async () => {
    await showInstallPrompt();
    onClose();
  };

  return (
    <div className='flexCol gap-6' data-testid={`pwa-install-guide-${environment}`}>
      {environment === 'prompt' && (
        <Typography type='detail2' className='text-gray-300'>
          {t.pwa.description}
        </Typography>
      )}
      {environment === 'ios-guide' && <IosGuide />}
      {environment === 'in-app-browser' && <InAppBrowserGuide />}

      <Dialog.ButtonGroup>
        {environment === 'prompt' ? (
          <>
            <Dialog.Button onClick={onClose} color='secondary'>
              {t.common.btn.cancel}
            </Dialog.Button>
            <Dialog.Button onClick={install} data-testid='pwa-install-confirm'>
              {t.pwa.install_now}
            </Dialog.Button>
          </>
        ) : (
          <Dialog.Button onClick={onClose}>{t.common.btn.confirm}</Dialog.Button>
        )}
      </Dialog.ButtonGroup>
    </div>
  );
};

export default InstallGuide;
