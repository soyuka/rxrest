import { Stream } from 'most';

export function fetch(input: string | RequestWithHeaders, init?: RequestOptions, abortCallback?: (req: Request) => void): Stream<any>;

export class RxRest<T> {
  constructor(route?: string[]);
  json?(): string;
  one?<T>(route: string, id?: any): RxRestItem<T>;
  all?<T>(route: string): RxRestCollection<T>;
  fromObject?<T>(route: string, element: T|T[]): RxRestItem<T>|RxRestCollection<T>;
  post?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  put?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  patch?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  remove?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  get?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  head?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  trace?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  options?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  URL?: string;
  baseURL?: string;
  identifier?: string;
  setQueryParams?(params: any): RxRest<T>;
  localQueryParams?: any;
  setHeaders?(params: any): RxRest<T>;
  localHeaders?: any;
  headers?: any;
  queryParams?: any;
  readonly requestQueryParams?: any;
  readonly requestHeaders?: any;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  errorInterceptors?: ErrorInterceptor[];
  fetch?: any
  requestBodyHandler?: RequestBodyHandler<T>;
  responseBodyHandler?: ResponseBodyHandler;
  request?(method: string, body?: BodyParam<T>): Stream<RxRestItem<T> & T>;
  $route: string[];
  $fromServer: boolean;
  $queryParams: URLSearchParams;
  $headers: Headers;
  abortCallback: (req: Request) => void;
}

export class RxRestItem<T> extends RxRest<T> {
  $element?: T;
  save?<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  clone?<T>(): RxRestItem<T>;
  plain?(): T;
}

export class RxRestCollection<T> extends RxRest<T> implements Iterable<RxRestItem<T>> {
  length: number;
  [Symbol.iterator]: () => Iterator<RxRestItem<T>>;
  $elements?: RxRestItem<T>[];
  getList?<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
  clone?<T>(): RxRestCollection<T>;
  plain?(): T[];
}

export interface RequestInterceptor {
  (request: Request): Stream<Request>|Promise<Request>|undefined|Request|void;
}

export interface ResponseInterceptor {
  (body: Body): Stream<Body|Object|undefined>|Promise<Body|Object|undefined>|undefined|Body|void;
}

export interface ErrorInterceptor {
  (response: Response): Stream<Response>|void|Response|Promise<Response>;
}

export type BodyParam<T> = RxRestItem<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestBodyHandler<T> {
  (body: BodyParam<T>): FormData|URLSearchParams|Body|Blob|undefined|string|Promise<any>
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}

export interface Stream<T> extends Stream<T> {
  then: (resolve: (value?: any) => void) => void
}

export interface ErrorResponse extends Response {
  name: string;
  message: string;
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

/**
 * @TODO, should be Headers but it doesn't use Symbol.Iterable?
 */
export interface FixedHeaders extends Map<string, string> {
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

export interface RequestWithHeaders extends Request {
  headers: FixedHeaders;
}

export interface RxRestConfiguration {
    baseURL: string;
    identifier: string;
    requestInterceptors: RequestInterceptor[];
    responseInterceptors: ResponseInterceptor[];
    errorInterceptors: ErrorInterceptor[];
    headers: Headers;
    queryParams: URLSearchParams;
    fetch: any;
    abortCallback: (req: Request) => void;
    requestBodyHandler(body: FormData | URLSearchParams | Body | Blob | undefined): FormData | URLSearchParams | Body | Blob | undefined | string | Promise<any>;
    responseBodyHandler(body: Response): Promise<any>;
}

export class NewRxRest {
    one<T>(route: string, id?: any): RxRestItem<T>;
    all<T>(route: string): RxRestCollection<T>;
    fromObject<T>(route: string, element: T | T[]): RxRestItem<T> | RxRestCollection<T>;
}
