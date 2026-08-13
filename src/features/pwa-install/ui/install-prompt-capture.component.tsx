'use client';

// import 만으로 리스너가 붙는다 (install-prompt 모듈 최상단 참고).
import '../lib/install-prompt';

/**
 * 렌더하는 것은 없다. 루트 레이아웃에 두어 `beforeinstallprompt` 리스너를 앱 부팅 시점에
 * 붙이는 것이 목적이다. 이 이벤트는 로드 직후 한 번만 발생해서, 메뉴가 열릴 때 붙이면 늦는다.
 */
const InstallPromptCapture = () => null;

export default InstallPromptCapture;
