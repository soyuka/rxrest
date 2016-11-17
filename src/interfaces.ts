export declare class Headers extends Map<string, string> {
  constructor(init?: Object);
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

export declare class URLSearchParams extends Map<string, string> {
  constructor(init?: string|URLSearchParams);
  append: (name: string, value: string) => void;
  getAll: () => string[];
  toString: () => string;
}

export declare class Body {
  bodyUsed?: boolean;
  arrayBuffer: () => Promise<ArrayBuffer>;
  blob: () => Promise<Blob>;
  formData: () => Promise<FormData>;
  json: () => Promise<Object>;
  text: () => Promise<string>;
}

export interface ResponseParams {
  status: Number;
  statusText: string;
  headers: Headers;
}

export declare class Response extends Body {
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

export interface RequestOptions {
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

export declare class Request extends Body {
  method: string;
  url: string;
  headers?: Object;
  referrer?: string;
  referrerPolicy?: string;
  mode?: string;
  credentials?: string;
  cache?: string;
  clone: () => Request;
  constructor(input: string|Request, init?: RequestOptions);
}

export var fetch: (input: string|Request, init?: RequestOptions) => Promise<Response>;

/**
 * RxRest interfaces
 */

import {Stream} from 'most'

export interface RequestInterceptor {
  (request: Request): Stream<Request>|Promise<Request>|undefined|Request;
}

export interface ResponseInterceptor {
  (body: Body): Stream<Body|Object|undefined>|Promise<Body|Object|undefined>|undefined|Body;
}

export interface ErrorInterceptor {
  (response: Response): Stream<Response>;
}

export interface RequestBodyHandler {
  (body: FormData|URLSearchParams|Body|Blob|undefined|Object): FormData|URLSearchParams|Body|Blob|undefined|string
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}

export type BodyParam = RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object;

export declare class RxRest {
  $fromServer: boolean;
  request(method: string, body?: BodyParam): Stream<RxRestItem>;
}

export declare class RxRestCollection extends RxRest implements Iterable<RxRestItem> {
    length: number;
    protected $elements: RxRestItem[];
    [index: number]: RxRestItem;
    constructor(route: string[], elements?: any[]);
    [Symbol.iterator](): {
        next(): IteratorResult<RxRestItem>;
    };
    getList(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem | RxRestCollection>;
    elements: any[];
    plain(): Object[];
    json(): String;
    clone(): RxRestCollection;
}

export declare class RxRestItem extends RxRest {
    protected $element: Object;
    constructor(route: string[], element?: Object);
    save(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem | RxRestCollection>;
    element: Object;
    plain(): Object;
    json(): string;
    clone(): RxRestItem;
}

export interface ErrorResponse extends Response {
  name: string;
}