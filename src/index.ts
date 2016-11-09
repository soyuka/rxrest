/// <reference path="interfaces.d.ts" />

import {Stream, from, throwError, of} from 'most'
import {RxRestProxyHandler} from './RxRestProxyHandler'
import {fetch} from './fetch'
import {create} from '@most/create'

const fromPromise = function(promise: Promise<any>) {
  return create((add, end, error) => {
    promise
    .then((v) => {
      add(v)
      end()
    })
    .catch(error)
  })
}


export interface RequestInterceptor {
  (request: Request): Stream<Request>|Promise<Request>|undefined|Request;
}

export interface ResponseInterceptor {
  (body: Body): Stream<Body|Object|undefined>|Promise<Body|Object|undefined>|undefined|Body;
}

export interface ErrorInterceptor {
  (response: Response): Stream<Response>;
}

export type BodyParam = RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestBodyHandler {
  (body: BodyParam): FormData|URLSearchParams|Body|Blob|undefined|string
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}

/**
 * RxRestConfiguration
 */
export class RxRestConfiguration {
  baseURL: string
  identifier: string = 'id'
  requestInterceptors: RequestInterceptor[] = []
  responseInterceptors: ResponseInterceptor[] = []
  errorInterceptors: ErrorInterceptor[] = []
  headers: Headers = new Headers()
  queryParams: URLSearchParams = new URLSearchParams()

  /**
   * requestBodyHandler
   * JSONify the body if it's an `RxRestItem` or an `Object`
   *
   * @param {FormData|URLSearchParams|Body|Blob|undefined} body
   * @returns {any}
   */
  requestBodyHandler(body: FormData|URLSearchParams|Body|Blob|undefined):
    FormData|URLSearchParams|Body|Blob|undefined|string {
    if (!body) {
      return undefined
    }

    if (body instanceof FormData || body instanceof URLSearchParams) {
      return body
    }

    return body instanceof RxRestItem ? body.json() : JSON.stringify(body)
  }

  /**
   * responseBodyHandler
   * transforms the response to a json object
   *
   * @param {Response} body
   * @reject when response is an error
   * @returns {Promise<any>}
   */
  responseBodyHandler(body: Response): Promise<any> {
    if (body.bodyUsed) {
      return Promise.resolve(body.body)
    }

    return body.text()
    .then(text => {
      try {
        text = JSON.parse(text)
      } catch (e) {
        //silent catch
      }

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

  /**
   * constructor
   *
   * @param {String} [route] the resource route
   */
  constructor(route?: string[]) {
    this.$route = route === undefined ? [] : [...route]
  }

  addRoute(route: string): void {
    this.$route.push.apply(this.$route, route.split('/'))
  }

  /**
   * one
   *
   * @param {String} route
   * @param {any} id
   * @returns {RxRestItem}
   */
  one(route: string, id: any): RxRestItem {
    this.addRoute(route)
    let o = {}
    o[this.identifier] = id
    return new RxRestItem(this.$route, o)
  }

  /**
   * all
   *
   * @param {String} route
   * @returns {RxRestCollection}
   */
  all(route: string): RxRestCollection {
    this.addRoute(route)
    return new RxRestCollection(this.$route)
  }

  /**
   * fromObject
   *
   * @param {String} route
   * @param {Object|Object[]} element
   * @returns {RxRestItem|RxRestCollection}
   */
  fromObject(route: string, element: Object|Object[]): RxRestItem|RxRestCollection {
    this.addRoute(route)
    return Array.isArray(element) ?
      new RxRestCollection(this.$route, element) : new RxRestItem(this.$route, element);
  }

  /**
   * @access private
   * @param {BodyParam} body
   * @return {BodyParam|RxRestItem}
   */
  withBody(body: BodyParam) {
    return body ? body : this
  }

  /**
   * post
   *
   * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  post(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('POST', this.withBody(body))
  }

  /**
   * remove
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('DELETE')
  }

  /**
   * get
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  get(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  /**
   * put
   *
   * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  put(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('PUT', this.withBody(body))
  }

  /**
   * patch
   *
   * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  patch(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('PATCH', this.withBody(body))
  }

  /**
   * head
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  head(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('HEAD')
  }

  /**
   * trace
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('TRACE')
  }

  /**
   * options
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  options(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('OPTIONS')
  }

  /**
   * URL
   *
   * @returns {string}
   */
  get URL(): string {
    return `${Config.baseURL}${this.$route.join('/')}`
  }

  /**
   * set baseURL
   *
   * @param {String} base
   * @returns
   */
  set baseURL(base: string) {
    if (base.charAt(base.length - 1) !== '/') {
      base += '/'
    }

    Config.baseURL = base
  }

  /**
   * get baseURL
   *
   * @returns {string}
   */
  get baseURL(): string {
    return Config.baseURL
  }

  /**
   * Set identifier key
   *
   * @param {String} id
   */
  set identifier(id: string) {
    Config.identifier = id
  }

  /**
   * Get identifier key
   */
  get identifier(): string {
    return Config.identifier
  }

  /**
   * set local query params
   * @param {Object|URLSearchParams} params
   */
  set localQueryParams(params: any) {
    if (!params) {
      return
    }

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
   * Sets local query params useful to add params to a custom request
   * @param {Object|URLSearchParams}
   * @return this
   */
  setQueryParams(params: any): RxRest {
    this.localQueryParams = params
    return this
  }

  /**
   * Sets local headers useful to add headers to a custom request
   * @param {Object|URLSearchParams}
   * @return this
   */
  setHeaders(params: any): RxRest {
    this.localHeaders = params
    return this
  }

  /**
   * Get local query params
   * @return URLSearchParams
   */
  get localQueryParams(): any {
    return this.$queryParams
  }

  /**
   * Set global query params
   * @param {Object|URLSearchParams} params
   */
  set queryParams(params: any) {
    if (params instanceof URLSearchParams) {
      Config.queryParams = params
      return
    }

    Config.queryParams = new URLSearchParams()

    for (let i in params) {
      Config.queryParams.set(i, params[i])
    }
  }

  /**
   * Get global query params
   * @return {URLSearchParams}
   */
  get queryParams(): any {
    return Config.queryParams
  }

  /**
   * Get request query params
   * Combine local and global query params
   * Local query params are overriding global params
   * @return {String}
   */
  get requestQueryParams(): string {
    let params = new URLSearchParams()

    for (let param of this.queryParams) {
      params.set(param[0], param[1])
    }

    for (let param of this.localQueryParams) {
      params.set(param[0], param[1])
    }

    let str = params.toString()

    if (str.length) {
      return '?' + str
    }

    return ''
  }

  /**
   * Set local headers
   * @param {Object|Headers} params
   */
  set localHeaders(params: any) {
    if (!params) {
      return
    }

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
   * Get local headers
   * @return Headers
   */
  get localHeaders(): any {
    return this.$headers
  }

  /**
   * set global headers
   * @param {Object|Headers} params
   */
  set headers(params: any) {
     if (params instanceof Headers) {
      Config.headers = params
      return
    }

    Config.headers = new Headers()

    for (let i in params) {
      Config.headers.set(i, params[i])
    }
 }

  /**
   * Get global headers
   * @return Headers
   */
  get headers(): any {
    return Config.headers
  }

  /**
   * get request Headers
   * Combine local and global headers
   * Local headers are overriding global headers
   *
   * @returns {Headers}
   */
  get requestHeaders(): Headers {
    let headers = new Headers()

    for (let header of this.headers) {
      headers.set(header[0], header[1])
    }

    for (let header of this.localHeaders) {
      headers.set(header[0], header[1])
    }

    return headers
  }

  /**
   * get requestInterceptors
   *
   * @returns {RequestInterceptor[]}
   */
  get requestInterceptors(): RequestInterceptor[] {
    return Config.requestInterceptors
  }

  /**
   * set requestInterceptors
   *
   * @param {RequestInterceptor[]} requestInterceptors
   */
  set requestInterceptors(requestInterceptors: RequestInterceptor[]) {
    Config.requestInterceptors = requestInterceptors
  }

  /**
   * get responseInterceptors
   *
   * @returns {ResponseInterceptor[]}
   */
  get responseInterceptors(): ResponseInterceptor[] {
    return Config.responseInterceptors
  }

  /**
   * set responseInterceptors
   *
   * @param {ResponseInterceptor[]} responseInterceptor
   */
  set responseInterceptors(responseInterceptor: ResponseInterceptor[]) {
    Config.responseInterceptors = responseInterceptor
  }

  /**
   * get errorInterceptors
   *
   * @returns {ErrorInterceptor[]}
   */
  get errorInterceptors(): ErrorInterceptor[] {
    return Config.errorInterceptors
  }

  /**
   * set errorInterceptors
   *
   * @param {ErrorInterceptor[]} errorInterceptors
   */
  set errorInterceptors(errorInterceptors: ErrorInterceptor[]) {
    Config.errorInterceptors = errorInterceptors
  }

  /**
   * set requestBodyHandler
   *
   * @param {Function} fn
   */
  set requestBodyHandler(fn: RequestBodyHandler) {
    Config.requestBodyHandler = fn
  }

  /**
   * requestBodyHandler
   *
   * @returns {Function}
   */
  get requestBodyHandler(): RequestBodyHandler {
    return Config.requestBodyHandler
  }

  /**
   * set responseBodyHandler
   * @param {ResponseBodyHandler} fn
   */
  set responseBodyHandler(fn: ResponseBodyHandler) {
    Config.responseBodyHandler = fn
  }

  /**
   * get responseBodyHandler
   *
   * @returns {ResponseBodyHandler}
   */
  get responseBodyHandler(): ResponseBodyHandler {
    return Config.responseBodyHandler
  }

  /**
   * expandInterceptors
   *
   * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
   * @returns {Stream<any>} fn
   */
  expandInterceptors(interceptors: RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]) {
    return function(origin: any): Stream<any> {
      return (<any>interceptors).reduce(
        (obs: Stream<any>, interceptor: any) =>
          obs.concatMap(value => {
            let result = interceptor(value)
            if (result === undefined) {
              return of(value)
            }

            if (result instanceof Promise) {
              return fromPromise(result)
            }

            if (result instanceof Stream) {
              return result
            }

            return of(result)
          }),
        of(origin)
      )
    }
  }

  /**
   * request
   *
   * @param {string} method
   * @param {RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object} [body]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  request(method: string, body?: BodyParam): Stream<RxRestItem> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.requestHeaders,
      body: this.requestBodyHandler(body)
    }

    let request = new Request(this.URL + this.requestQueryParams, requestOptions);

    return <Stream<RxRestItem>> of(request)
    .flatMap(this.expandInterceptors(Config.requestInterceptors))
    .flatMap(request => fetch(request))
    .flatMap(this.expandInterceptors(Config.responseInterceptors))
    .flatMap(body => fromPromise(this.responseBodyHandler(body)))
    .flatMap(body => {
      if (!Array.isArray(body)) {
        let item: RxRestItem

        if (this instanceof RxRestItem) {
          item = this
          item.element = body
        } else {
          item = new RxRestItem(this.$route, body)
        }

        item.$fromServer = true
        return of(item)
      }

      let collection = new RxRestCollection(this.$route, body.map(e => {
        let item = new RxRestItem(this.$route, e)
        item.$fromServer = true
        return item
      }))

      return create((add, end, error) => {
        for (let item of collection) {
          add(item)
        }

        end(collection)
      })
    })
    .recoverWith(body => {
      if (!(body instanceof Response)) {
        return throwError(<Error> body)
      }

      return of(body)
      .flatMap(this.expandInterceptors(Config.errorInterceptors))
    })
  }
}

export class RxRestItem extends RxRest {
  protected $element: Object = {};

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {Object} [element]
   * @return {Proxy}
   */
  constructor(route: string[], element?: Object) {
    super(route)

    if (element !== undefined) {
      this.element = element
    }

    const proxy = new Proxy(this.$element, new RxRestProxyHandler(this))

    return <RxRestItem> proxy
  }

  /**
   * save - POST or PUT according to $fromServer value
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  save(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST', this)
  }

  /**
   * set element
   *
   * @param {Object} element
   */
  set element(element: Object) {
    for (let i in element) {
      if (i === this.identifier && !this.$element[this.identifier]) {
        this.$route.push(element[i])
      }

      this.$element[i] = element[i]
    }
  }

  /**
   * get element
   *
   * @return {Object}
   */
  get element(): Object {
    return this.$element
  }

  /**
   * get plain object
   *
   * @return {Object}
   */
  plain(): Object {
    return this.element
  }

  /**
   * Get json string
   * @return {string}
   */
  json(): string {
    return JSON.stringify(this.plain())
  }

  /**
   * Clone
   * @return {RxRestItem}
   */
  clone(): RxRestItem {
    let route = this.$route

    if (this.$element[this.identifier]) {
      route = route.slice(0, this.$route.length - 1)
    }

    let clone = new RxRestItem(route, this.$element)
    clone.$fromServer = this.$fromServer
    return clone
  }
}

export class RxRestCollection extends RxRest implements Iterable<RxRestItem> {
  length: number;
  protected $elements: RxRestItem[] = [];
  [index: number]: RxRestItem;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {Object} [elements]
   * @return {Proxy}
   */
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
        return index < elements.length ?
          {value: elements[index++], done: false} : {value: undefined, done: true}
      }
    }
  }

  /**
   * getList - fetch a collection
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  getList(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  /**
   * set elements
   *
   * @param {Object[]|RxRestItem[]} elements
   */
  set elements(elements: any[]) {
    this.$elements = elements.map(e =>
      e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e)
    )

    this.length = elements.length
  }

  /**
   * get elements
   * @return {RxRestItem[]}
   */
  get elements(): any[] {
    return this.$elements
  }

  /**
   * plain
   *
   * @returns {Object[]}
   */
  plain(): Object[] {
    return this.elements.map(e => e.plain())
  }

  /**
   * json
   *
   * @returns {String}
   */
  json(): String {
    return JSON.stringify(this.plain())
  }

  /**
   * clone
   *
   * @returns {RxRestCollection}
   */
  clone(): RxRestCollection {
    return new RxRestCollection(this.$route, this.$elements)
  }
}

export class NewRxRest {
  one(): RxRestItem {
    let r = new RxRest()
    return r.one.apply(r, arguments)
  }

  all(): RxRestCollection {
    let r = new RxRest()
    return r.all.apply(r, arguments)
  }
}
