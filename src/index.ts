import {Observable} from 'rxjs'
import {RxRestProxyHandler} from './RxRestProxyHandler'

export interface RequestInterceptor {
  (request: Request): Observable<Request>;
}

export interface ResponseInterceptor {
  (request: RxRestCollection | RxRestItem): Observable<RxRestCollection | RxRestItem>;
}

export interface ErrorInterceptor {
  (response: Response): Observable<Response>;
}

export class RxRestConfiguration {
  baseURL: string
  identifier: string = 'id'
  requestInterceptors: RequestInterceptor[] = []
  responseInterceptors: ResponseInterceptor[] = []
  errorInterceptors: ErrorInterceptor[] = []
  headers: Headers = new Headers()
  queryParams: URLSearchParams = new URLSearchParams()

  requestBodyHandler(body: any): any {
    if (!body) {
      return undefined
    }

    if (body instanceof FormData || body instanceof URLSearchParams) {
      return body
    }

    return body instanceof RxRestItem ? body.json() : JSON.stringify(body)
  }

  responseBodyHandler(body: Response): Promise<any> {
    if (!body.ok) {
      return Promise.reject(body)
    }

    return body.text()
    .then(text => {
      try {
        text = JSON.parse(text)
      } catch(e) {}

      return Promise.resolve(text)
    })
  }
}

const Config = new RxRestConfiguration()

export class RxRest {
  protected $route: string[]
  $fromServer: boolean = false
  $queryParams: URLSearchParams = new URLSearchParams()
  $headers: Headers = new Headers()

  constructor(route?: string[]) {
    this.$route = route === undefined ? [] : [...route]
  }

  one(route: string, id: any): RxRestItem {
    this.$route.push(route)
    let o = {}
    o[this.identifier] = id
    return new RxRestItem(this.$route, o)
  }

  all(route: string): RxRestCollection {
    this.$route.push(route)
    return new RxRestCollection(this.$route)
  }

  fromObject(route: string, element?: Object|Object[]): RxRestItem|RxRestCollection {
    this.$route.push(route)
    return Array.isArray(element) ? new RxRestCollection(this.$route, element) : new RxRestItem(this.$route, element);
  }

  get URL() {
    return `${Config.baseURL}${this.$route.join('/')}`
  }

  set baseURL(base: string) {
    if (base.charAt(base.length - 1) !== '/') {
      base += '/'
    }

    Config.baseURL = base
  }

  get baseURL():string {
    return Config.baseURL
  }

  set identifier(id: string) {
    Config.identifier = id
  }

  get identifier(): string {
    return Config.identifier
  }

  /**
   * @param params Object | URLSearchParams
   */
  set localQueryParams(params: any) {
    if (params instanceof URLSearchParams) {
      this.$queryParams = params
      return
    }

    this.$queryParams = new URLSearchParams()

    for (let i in params) {
      this.$queryParams.set(i, params[i])
    }
  }

  /**
   * @return URLSearchParams
   */
  get localQueryParams(): any {
    return this.$queryParams
  }

  /**
   * @param params Object | URLSearchParams
   */
  set queryParams(params: any) {
    if (params instanceof URLSearchParams) {
      for(let p of params) {
        Config.queryParams.set(p[0], p[1])
      }
      return
    }

    for (let i in params) {
      Config.queryParams.set(i, params[i])
    }
  }

  /**
   * @return URLSearchParams
   */
  get queryParams(): any {
    return Config.queryParams
  }

  get requestQueryParams(): String {
    let params = new URLSearchParams()

    for (let param of this.queryParams) {
      params.set(param[0], param[1])
    }

    for (let param of this.localQueryParams) {
      params.set(param[0], param[1])
    }

    let str = params.toString()

    if (str.length) {
      return '?'+str
    }

    return ''
  }

  /**
   * @param params Object | Headers
   */
  set localHeaders(params: Object | Headers) {
     if (params instanceof Headers) {
      this.$headers = params
      return
    }

    this.$headers = new Headers()

    for (let i in params) {
      this.$headers.set(i, params[i])
    }
 }

  /**
   * @return Headers
   */
  get localHeaders(): Object | Headers {
    return this.$headers
  }

  /**
   * @param params Object | Headers
   */
  set headers(params: Object | Headers) {
     if (params instanceof Headers) {
      for(let p of params) {
        Config.headers.set(p[0], p[1])
      }
      return
    }

    for (let i in params) {
      Config.headers.set(i, params[i])
    }
 }

  /**
   * @return Headers
   */
  get headers(): Object | Headers {
    return Config.headers
  }

  get requestHeaders(): Headers {
    let headers = new Headers()

    for(let header of Config.headers) {
      headers.set(header[0], header[1])
    }

    for(let header of this.$headers) {
      headers.set(header[0], header[1])
    }

    return headers
  }

  get requestInterceptors() {
    return Config.requestInterceptors
  }

  set requestInterceptors(requestInterceptors: RequestInterceptor[]) {
    Config.requestInterceptors = requestInterceptors
  }

  get responseInterceptors() {
    return Config.responseInterceptors
  }

  set responseInterceptors(responseInterceptor: ResponseInterceptor[]) {
    Config.responseInterceptors = responseInterceptor
  }

  get errorInterceptors() {
    return Config.errorInterceptors
  }

  set errorInterceptors(errorInterceptors: ErrorInterceptor[]) {
    Config.errorInterceptors = errorInterceptors
  }

  set requestBodyHandler(fn: any) {
    Config.requestBodyHandler = fn
  }

  get requestBodyHandler(): any {
    return Config.requestBodyHandler
  }

  set responseBodyHandler(fn: any) {
    Config.responseBodyHandler = fn
  }

  get responseBodyHandler(): any {
    return Config.responseBodyHandler
  }

  expandInterceptors(interceptors: RequestInterceptor[] | ResponseInterceptor[] | ErrorInterceptor[]) {
    return function(origin: any): Observable<any> {
      return (<any>interceptors).reduce((obs: Observable<any>, interceptor: any) => obs.concatMap(value => {
        let result = interceptor(value)
        if (result === undefined) {
          return Observable.of(value)
        }

        if (result instanceof Observable || result instanceof Promise) {
          return result
        }

        return Observable.of(result)
      }), Observable.of(origin))
    }
  }

  request(method: string, body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem): Observable<RxRestItem | RxRestCollection> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.requestHeaders,
      body: this.requestBodyHandler(body)
    }

    let request = new Request(this.URL+this.requestQueryParams, requestOptions);

    return Observable.of(request)
    .flatMap(this.expandInterceptors(Config.requestInterceptors))
    .flatMap(request => Observable.fromPromise(fetch(request)))
    .flatMap(body => Observable.fromPromise(this.responseBodyHandler(body)))
    .map(e => {
      if (!Array.isArray(e)) {
        let item: RxRestItem

        if (this instanceof RxRestItem) {
          item = this
          item.element = e
        } else {
          item = new RxRestItem(this.$route, e)
        }

        item.$fromServer = true
        return item
      }

      return new RxRestCollection(this.$route, e.map(e => {
        let item = new RxRestItem(this.$route, e)
        item.$fromServer = true
        return item
      }))
    })
    .flatMap(this.expandInterceptors(Config.responseInterceptors))
    .catch(body => {
      return Observable.of(body)
      .flatMap(this.expandInterceptors(Config.errorInterceptors))
    })
  }
}

export class RxRestItem extends RxRest {
  protected $element: Object = {};

  constructor(route: string[], element?: Object) {
    super(route)

    if (element !== undefined) {
      this.element = element
    }

    const proxy = new Proxy(this.$element, new RxRestProxyHandler(this))

    return <RxRestItem> proxy
  }

  get(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  post(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('POST', body ? body : this)
  }

  put(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('POST', body ? body : this)
  }

  patch(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('PATCH', body ? body : this)
  }

  remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('DELETE')
  }

  head(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('HEAD')
  }

  trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('TRACE')
  }

  options(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('OPTIONS')
  }

  save(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST', this)
  }

  set element(element: Object) {
    for(let i in element) {
      if (i === this.identifier && !this.$element[this.identifier]) {
        this.$route.push(element[i])
      }

      this.$element[i] = element[i]
    }
  }

  get element(): Object {
    return this.$element
  }

  plain(): Object {
    return this.element
  }

  json(): String {
    return JSON.stringify(this.element)
  }

  clone(): RxRestItem {
    return new RxRestItem(this.$route, this.$element)
  }
}

export class RxRestCollection extends RxRest implements Iterable<RxRestItem> {
  private length: number;
  protected $elements: RxRestItem[] = [];

  constructor(route: string[], elements?: any[]) {
    super(route)
    if (elements !== undefined) {
      this.elements = elements
    }

    const proxy = new Proxy(this.$elements, new RxRestProxyHandler(this))

    return <RxRestCollection> proxy
  }

  [Symbol.iterator]() {
    let index = 0
    let elements = this.$elements

    return {
      next(): IteratorResult<RxRestItem> {
        return index < elements.length ? {value: elements[index++], done: false} : {value: undefined, done: true}
      }
    }
  }

  getList(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  set elements(elements: any[]) {
    this.$elements = elements.map(e => e instanceof RxRestItem ? e : new RxRestItem(this.$route, e))
    this.length = elements.length
  }

  get elements(): any[] {
    return this.$elements
  }

  plain(): Object[] {
    return this.elements.map(e => e.plain())
  }

  json(): String {
    return JSON.stringify(this.elements)
  }

  clone(): RxRestCollection {
    return new RxRestCollection(this.$route, this.$elements)
  }
}
