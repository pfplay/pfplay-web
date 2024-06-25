export function safeDecodeURI(uri: string): string {
  try {
    return decodeURI(uri);
  } catch (e) {
    return e instanceof URIError ? decodeMalformedURI(uri) : uri;
  }
}

function decodeMalformedURI(encodedURI: string): string {
  const uriPattern = /(%[0-9A-Fa-f]{2}|%[^0-9A-Fa-f]|%$|%[0-9A-Fa-f]?|[^%]+)/g;
  let match: RegExpExecArray | null;
  const fixedURI: string[] = [];

  while ((match = uriPattern.exec(encodedURI)) !== null) {
    const segment = match[0];
    fixedURI.push(tryDecodeURIComponent(segment));
  }

  return fixedURI.join('');
}

function tryDecodeURIComponent(segment: string): string {
  if (isValidPercentEncoded(segment)) {
    try {
      return decodeURIComponent(segment);
    } catch (e) {
      if (e instanceof URIError) {
        return segment;
      }
      throw e;
    }
  } else {
    return segment;
  }
}

function isValidPercentEncoded(segment: string): boolean {
  return /^%[0-9A-Fa-f]{2}$/.test(segment);
}
