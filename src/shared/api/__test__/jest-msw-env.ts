import type { JestEnvironmentConfig, EnvironmentContext } from '@jest/environment';
import JsdomEnvironment from 'jest-environment-jsdom';

/**
 * Custom Jest environment that restores Node.js fetch globals (Request, Response, etc.)
 * which jsdom does not provide. Required for MSW v2 to work in jsdom tests.
 */
export default class MswJsdomEnvironment extends JsdomEnvironment {
  public constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);

    // Restore Node.js built-in fetch globals that jsdom strips
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.ReadableStream = ReadableStream;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder as typeof this.global.TextDecoder;
    this.global.BroadcastChannel = BroadcastChannel;
    this.global.TransformStream = TransformStream as any;
    this.global.WritableStream = WritableStream as any;

    // Set API base URL so axios baseURL resolves correctly
    this.global.process.env.NEXT_PUBLIC_API_HOST_NAME = 'http://localhost:8080/api/';
  }
}
