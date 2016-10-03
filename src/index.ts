import {Observable} from 'rxjs'
import {RxRestProxyHandler} from './RxRestProxyHandler'

export interface RequestInterceptor {
  (request: Request): Observable<Request>;
}

export interface ResponseInterceptor {
  (request: RxRestCollection | RxRestItem): Observable<RxRestCollection | RxRestItem>;
}

class RxRestConfiguration {
  baseURL: string
  identifier: string = 'id'
  requestInterceptors: RequestInterceptor[] = [];
  responseInterceptors: ResponseInterceptor[] = [];
}

const Config = new RxRestConfiguration()

export class RxRest {
  protected $route: string[];
  $fromServer: boolean = false;
  $queryParams: URLSearchParams = new URLSearchParams();
  $headers: Headers = new Headers();

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

  set queryParams(params: Object | URLSearchParams) {
    if (params instanceof URLSearchParams) {
      this.$queryParams = params
      return
    }

    this.$queryParams = new URLSearchParams()

    for (let i in params) {
      this.$queryParams.append(i, params[i])
    }
  }

  get queryParams() {
    let params = this.$queryParams.toString()
    if (params.length) {
      return '?'+params
    }

    return ''
  }

  set headers(params: Object | Headers) {
    if (params instanceof Headers) {
      this.$headers = params
      return
    }

    this.$headers = new Headers()

    for (let i in params) {
      this.$headers.append(i, params[i])
    }
  }

  get headers() {
    return this.$headers
  }

  addRequestInterceptor(requestInterceptor: RequestInterceptor): RxRest {
    Config.requestInterceptors.push(requestInterceptor)
    return this
  }

  addResponseInterceptor(responseInterceptor: ResponseInterceptor): RxRest {
    Config.responseInterceptors.push(responseInterceptor)
    return this
  }

  expandInterceptors(interceptors: RequestInterceptor[] | ResponseInterceptor[]) {
    return function(item: any) {
      let i = 0
      return Observable.of(item)
      .expand((item): any => {
        if (i > interceptors.length - 1) {
          return Observable.empty()
        }

        let response = (<any> interceptors[i++])(item)

        if (undefined === response) {
          return Observable.of(item)
        }

        if (response instanceof Observable || response instanceof Promise) {
          return response
        }

        return Observable.of(response)
      })
      .last()
    }
  }

  request(method: string, body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem): Observable<RxRestItem | RxRestCollection> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.headers,
      body: body instanceof RxRestItem ? body.plain() : body
    }

    let request = new Request(this.URL+this.queryParams, requestOptions);

    return Observable.of(request)
    .flatMap(request => this.expandInterceptors(Config.requestInterceptors)(request))
    .flatMap(request => Observable.fromPromise(fetch(request)))
    .flatMap(body => Observable.fromPromise(body.json()))
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
    // .concatMap(response => this.expandInterceptors(Config.responseInterceptors)(response))
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
    this.queryParams = queryParams
    this.headers = headers

    return this.request('GET')
  }

  post(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('POST', body ? body : this)
  }

  put(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('POST', body ? body : this)
  }

  patch(body?: Body|Blob|FormData|URLSearchParams|Object|RxRestItem, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('PATCH', body ? body : this)
  }

  remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('DELETE')
  }

  head(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('HEAD')
  }

  trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('TRACE')
  }

  options(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('OPTIONS')
  }

  clone(): RxRestItem {
    return new RxRestItem(this.$route, this.$element)
  }

  save(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Observable<RxRestItem | RxRestCollection> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST')
  }

  plain(): Object {
    return this.element
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
    this.queryParams = queryParams
    this.headers = headers

    return this.request('GET')
  }

  plain(): Object[] {
    return this.elements.map(e => e.plain())
  }

  set elements(elements: any[]) {
    this.$elements = elements.map(e => e instanceof RxRestItem ? e : new RxRestItem(this.$route, e))
    this.length = elements.length
  }

  get elements(): any[] {
    return this.$elements
  }

  clone(): RxRestCollection {
    return new RxRestCollection(this.$route, this.$elements)
  }
}
