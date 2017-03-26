export as namespace RxRest
export = RxRest

import { Stream } from 'most'

declare namespace RxRest {
  function fetch(input: string | RequestWithHeaders, init?: RequestOptions, abortCallback?: (req: Request) => void): Stream<any>;

  class RxRest<T> {
    constructor (config: RxRestConfiguration);
    one<T>(route: string, id?: any): RxRestItem<T> & T;
    all<T>(route: string): RxRestCollection<T> & T;
    fromObject<T>(route: string, element: T|T[]): RxRestItem<T> & T|RxRestCollection<T> & T;
  }

  class AbstractRxRest<T> {
    constructor (route?: string[], config?: RxRestConfiguration);
    private config;
    json(): string;
    one<T>(route: string, id?: any): RxRestItem<T>;
    all<T>(route: string): RxRestCollection<T>;
    fromObject<T>(route: string, element: T|T[]): RxRestItem<T>|RxRestCollection<T>;
    post(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    put(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    patch(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    get(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    head(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    options(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    URL: string;
    baseURL: string;
    identifier: string;
    setQueryParams(params: any): AbstractRxRest<T>;
    localQueryParams: any;
    setHeaders(params: any): AbstractRxRest<T>;
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
    request(method: string, body?: BodyParam<T>): Stream<RxRestItem<T> & T>;
    $route: string[];
    $fromServer: boolean;
    $queryParams: URLSearchParams;
    $headers: Headers;
    abortCallback: (req: Request) => void;
  }

  class RxRestItem<T> extends AbstractRxRest<T> {
    $element: T;
    save<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    clone<T>(): RxRestItem<T>;
    plain(): T;
  }

  class RxRestCollection<T> extends AbstractRxRest<T> implements Iterable<RxRestItem<T>> {
    length: number;
    [Symbol.iterator]: () => Iterator<RxRestItem<T>>;
    $elements: RxRestItem<T>[];
    getList<T>(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem<T>|RxRestCollection<T>>;
    clone<T>(): RxRestCollection<T>;
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

  /**
   * @TODO, should be Headers but it doesn't use Symbol.Iterable?
   */
  interface FixedHeaders extends Map<string, string> {
    append: (name: string, value: string) => void;
    getAll: () => Object[];
  }

  interface RequestWithHeaders extends Request {
    headers: FixedHeaders;
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
      requestBodyHandler(body: FormData | URLSearchParams | Body | Blob | undefined): FormData | URLSearchParams | Body | Blob | undefined | string | Promise<any>;
      responseBodyHandler(body: Response): Promise<any>;
  }

  class NewRxRest {
      constructor();
      one<T>(route: string, id?: any): RxRestItem<T> & T;
      all<T>(route: string): RxRestCollection<T> & T;
      fromObject<T>(route: string, element: T | T[]): (RxRestItem<T> & T) | (RxRestCollection<T> & T);
  }
}
