declare class Headers extends Map<string, string> {
  constructor (init?: Object);
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

declare class URLSearchParams extends Map<string, string> {
  constructor (init?: string|URLSearchParams);
  append: (name: string, value: string) => void;
  getAll: () => string[];
  toString: () => string;
}

declare class Body {
  bodyUsed?: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  formData: () => Promise<FormData>;
  json: () => Promise<Object>;
  text: () => Promise<string>;
}

interface ResponseParams {
  status: Number;
  statusText: string;
  headers: Headers;
}

declare var ResponseParams: ResponseParams;

declare class Response extends Body {
  constructor(body?: Blob|FormData|URLSearchParams|string, init?: ResponseParams);
  headers: Headers;
  ok: boolean;
  status: Number;
  statusText: string;
  message: string;
  type: string;
  url: string;
  useFinalUrl: boolean;
  clone: () => Response;
  error: () => Response;
  redirect: (url: string, status: Number) => Response;
  body: any;
}

declare class ErrorResponse extends Response {
  name: string;
}

declare class RequestOptions {
  method: string;
  headers?: Headers;
  body?: Body|Blob|FormData|URLSearchParams|Object;
  mode?: string;
  credentials?: string;
  cache?: string;
  redirect?: string;
  referrer?: string;
  integrity?: string;
}

declare class Request extends Body {
  constructor (input: string|Request, init?: RequestOptions);
  method: string;
  url: string;
  headers?: Object;
  referrer?: string;
  referrerPolicy?: string;
  mode?: string;
  credentials?: string;
  cache?: string;
  clone: () => Request;
}

declare var fetch: (input: string|Request, init?: RequestOptions) => Promise<Response>;

declare module 'superagent' {
  export {};
}