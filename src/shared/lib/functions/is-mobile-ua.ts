const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const isMobileUA = (ua: string): boolean => MOBILE_UA_REGEX.test(ua);
