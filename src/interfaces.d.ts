interface Headers extends Map<string, string> {
  new (init?: Object): Headers;
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

declare var Headers: Headers;

interface URLSearchParams extends Map<string, string> {
  new (init?: string|URLSearchParams): URLSearchParams;
  append: (name: string, value: string) => void;
  getAll: () => string[];
  toString: () => string;
}

declare var URLSearchParams: URLSearchParams;

interface Body {
  bodyUsed?: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  formData: () => Promise<FormData>;
  json: () => Promise<Object>;
  text: () => Promise<string>;
}

declare var Body: Body;

interface ResponseParams {
  status: Number;
  statusText: string;
  headers: Headers;
}

declare var ResponseParams: ResponseParams;

interface Response extends Body {
  new(body?: Blob|FormData|URLSearchParams|string, init?: ResponseParams): Response;
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
}

declare var Response: Response;

interface RequestOptions {
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

declare var RequestOptions: RequestOptions;

interface Request extends Body {
  method: string,
  url: string,
  headers?: Object,
  referrer?: string,
  referrerPolicy?: string,
  mode?: string,
  credentials?: string,
  cache?: string,
  clone: () => Request,
  new (input: string|Request, init?: RequestOptions): Request
}

declare var Request: Request;

declare var fetch: (input: string|Request, init?: RequestOptions) => Promise<Response>;

declare module 'superagent' {
  export {};
}
