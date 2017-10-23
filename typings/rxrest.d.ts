export as namespace RxRest
export = RxRest

import { Stream } from 'most'

declare namespace RxRest {
  function fetch(input: string | Request,
                 init?: RequestOptions,
                 abortCallback?: (req: Request) => void
                ): Stream<any>;

  class RxRest {
    constructor (config: RxRestConfiguration);
    one<T>(route: string, id?: any): RxRestItem<T> & T;
    all<T>(route: string, asIterable?: boolean): RxRestCollection<T> & T[];
    fromObject<T>(route: string, element: T|T[]): (RxRestItem<T> & T)|(RxRestCollection<T> & T[]);
  }

  class AbstractRxRest<F, T> {
    constructor (route?: string[], config?: RxRestConfiguration);
    private config;
    json(): string;
    one<T>(route: string, id?: any): RxRestItem<T>;
    all<T>(route: string, asIterable?: boolean): RxRestCollection<T>;
    asIterable(): this;
    fromObject<T>(route: string, element: T|T[]): RxRestItem<T>|RxRestCollection<T>;
    post(
      body?: BodyParam<T>,
      queryParams?: Object|URLSearchParams,
      headers?: Object|Headers): Stream<F>;
    put(
      body?: BodyParam<T>,
      queryParams?: Object|URLSearchParams,
      headers?: Object|Headers): Stream<F>;
    patch(
      body?: BodyParam<T>,
      queryParams?: Object|URLSearchParams,
      headers?: Object|Headers): Stream<F>;
    remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<F>;
    get(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<F>;
    head(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<F>;
    trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<F>;
    options(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<F>;
    URL: string;
    baseURL: string;
    identifier: string;
    setQueryParams(params: any): AbstractRxRest<F, T>;
    localQueryParams: any;
    setHeaders(params: any): AbstractRxRest<F, T>;
    localHeaders: any;
    headers: any;
    queryParams: any;
    readonly requestQueryParams: any;
    readonly requestHeaders: any;
    requestInterceptors: RequestInterceptor[];
    responseInterceptors: ResponseInterceptor[];
    errorInterceptors: ErrorInterceptor[];
    fetch: any
    requestBodyHandler: RequestBodyHandler<T>;
    responseBodyHandler: ResponseBodyHandler;
    request(method: string, body?: BodyParam<T>): Stream<F>;
    $route: string[];
    $fromServer: boolean;
    $pristine: boolean;
    $queryParams: URLSearchParams;
    $headers: Headers;
    $metadata: any;
    $asIterable: boolean;
    abortCallback: (req: Request) => void;
  }

  class RxRestItem<T> extends AbstractRxRest<RxRestItem<T> & T, T> {
    $element: T;
    save<T>(
      queryParams?: Object|URLSearchParams,
      headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    clone<T>(): RxRestItem<T> & T;
    plain(): T;
  }

  class RxRestCollection<T>
    extends AbstractRxRest<RxRestCollection<T> & T[] & T, T>
    implements Iterable<RxRestItem<T>> {
    length: number;
    [Symbol.iterator]: () => Iterator<RxRestItem<T>>;
    $elements: RxRestItem<T>[];
    getList<T>(
      queryParams?: Object|URLSearchParams,
      headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    clone<T>(): RxRestCollection<T> & T[];
    plain(): T[];
  }

  interface RequestInterceptor {
    (request: Request): Stream<Request>|Promise<Request>|undefined|Request|void;
  }

  interface ResponseInterceptor {
    (body: Body): Stream<Body|Object|undefined>|Promise<Body|Object|undefined>|undefined|Body|void;
  }

  interface ErrorInterceptor {
    (response: Response): Stream<Response>|void|Response|Promise<Response>;
  }

  type BodyParam<T> = RxRestItem<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

  interface RequestBodyHandler<T> {
    (body: BodyParam<T>): FormData|URLSearchParams|Body|Blob|undefined|string|Promise<any>
  }

  interface ResponseBodyHandler {
    (body: Response): Promise<any>
  }

  interface ErrorResponse extends Response {
    name: string;
    message: string;
  }

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

  class RxRestConfiguration {
      constructor();
      baseURL: string;
      identifier: string;
      requestInterceptors: RequestInterceptor[];
      responseInterceptors: ResponseInterceptor[];
      errorInterceptors: ErrorInterceptor[];
      headers: Headers;
      queryParams: URLSearchParams;
      fetch: any;
      abortCallback: (req: Request) => void;
      requestBodyHandler(body: FormData | URLSearchParams | Body | Blob | undefined):
        FormData | URLSearchParams | Body | Blob | undefined | string | Promise<any>;
      responseBodyHandler(body: Response): Promise<any>;
  }
}
