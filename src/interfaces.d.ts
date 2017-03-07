import {Stream} from 'most'

export interface RxRestInterface<T> {
  json?(): string;
  one?<T>(route: string, id?: any): RxRestItemInterface<T>;
  all?<T>(route: string): RxRestCollectionInterface<T>;
  fromObject?<T>(route: string, element: T|T[]): RxRestItemInterface<T>|RxRestCollectionInterface<T>;
  post?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  put?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  patch?(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  remove?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  get?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  head?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  trace?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  options?(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  URL?: string;
  baseURL?: string;
  identifier?: string;
  setQueryParams?(params: any): RxRestInterface<T>;
  localQueryParams?: any;
  setHeaders?(params: any): RxRestInterface<T>;
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
  request?(method: string, body?: BodyParam<T>): PromisableStream<RxRestItemInterface<T> & T>;
}

export interface RxRestItemInterface<T> extends RxRestInterface<T> {
  $element?: T;
  save?<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  clone?<T>(): RxRestItemInterface<T>;
  plain?(): T;
}

export interface RxRestCollectionInterface<T> extends RxRestInterface<T>, Iterable<RxRestItemInterface<T>> {
  $elements?: RxRestItemInterface<T>[];
  getList?<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>>;
  clone?<T>(): RxRestCollectionInterface<T>;
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

export type BodyParam<T> = RxRestItemInterface<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestBodyHandler<T> {
  (body: BodyParam<T>): FormData|URLSearchParams|Body|Blob|undefined|string|Promise<any>
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}

export interface PromisableStream<T> extends Stream<T> {
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

export interface FixedHeaders extends Map<string, string> {
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

export interface RequestWithHeaders extends Request {
  headers: FixedHeaders;
}
