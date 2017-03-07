/// <reference path="../interfaces.d.ts" />

import { RxRestConfiguration } from './RxRestConfiguration'
import { RequestInterceptor, RequestBodyHandler, ResponseInterceptor, ResponseBodyHandler, ErrorInterceptor, BodyParam, RxRestItemInterface, PromisableStream, RxRestInterface, RxRestCollectionInterface, ErrorResponse } from './interfaces';
import { RxRestCollection, RxRestItem } from './index'
import { fetch as superAgentFetch } from './fetch'
import { Stream, from, throwError, of } from 'most'
import { create } from '@most/create'

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

function objectToMap(map: URLSearchParams | Headers, item: any): any {
  for (let key in item) {
    if (Array.isArray(item[key])) {
      for (let i = 0; i < item[key].length; i++) {
        map.append(key, item[key][i])
      }
    } else {
      map.append(key, item[key])
    }
  }

  return map
}

const Config = new RxRestConfiguration()

export class RxRest<T> implements RxRestInterface<T> {
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

  protected addRoute(route: string): void {
    this.$route.push.apply(this.$route, route.split('/'))
  }

  /**
   * one
   *
   * @param {String} route
   * @param {any} id
   * @returns {RxRestItem}
   */
  one<T>(route: string, id?: any): RxRestItemInterface<T> {
    this.addRoute(route)
    let o = {} as T
    if (id) {
      o[this.identifier] = id
    }

    return new RxRestItem<T>(this.$route, o)
  }

  /**
   * all
   *
   * @param {String} route
   * @returns {RxRestCollection}
   */
  all<T>(route: string): RxRestCollectionInterface<T> {
    this.addRoute(route)
    return new RxRestCollection<T>(this.$route)
  }

  /**
   * fromObject
   *
   * @param {String} route
   * @param {Object|Object[]} element
   * @returns {RxRestItem|RxRestCollection}
   */
  fromObject<T>(route: string, element: T|T[]): RxRestItemInterface<T>|RxRestCollectionInterface<T> {
    this.addRoute(route)
    return Array.isArray(element) ?
      new RxRestCollection<T>(this.$route, element) : new RxRestItem<T>(this.$route, element);
  }

  /**
   * @access private
   * @param {BodyParam} body
   * @return {BodyParam|RxRestItem}
   */
  protected withBody(body: BodyParam<T>) {
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
  post(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
  put(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
  patch(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
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

    this.$queryParams = objectToMap(new URLSearchParams(), params)
  }

  /**
   * Sets local query params useful to add params to a custom request
   * @param {Object|URLSearchParams}
   * @return this
   */
  setQueryParams(params: any): RxRest<T> {
    this.localQueryParams = params
    return this
  }

  /**
   * Sets local headers useful to add headers to a custom request
   * @param {Object|URLSearchParams}
   * @return this
   */
  setHeaders(params: any): RxRest<T> {
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

    if (typeof params === 'string') {
      Config.queryParams = new URLSearchParams(params)
      return
    }

    Config.queryParams = objectToMap(new URLSearchParams(), params)
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
      params.append(param[0], param[1])
    }

    for (let param of this.localQueryParams) {
      params.append(param[0], param[1])
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

    this.$headers = objectToMap(new Headers(), params)
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

    Config.headers = objectToMap(new Headers(), params)
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
      headers.append(header[0], header[1])
    }

    for (let header of this.localHeaders) {
      headers.append(header[0], header[1])
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
  set requestBodyHandler(fn: RequestBodyHandler<T>) {
    Config.requestBodyHandler = fn
  }

  /**
   * requestBodyHandler
   *
   * @returns {Function}
   */
  get requestBodyHandler(): RequestBodyHandler<T> {
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
   * @param fn the callback that will be called on request abortion
   */
  set abortCallback(fn: (req: Request) => void) {
    Config.abortCallback = fn
  }

  /**
   * @return fn the current cancel callback
   */
  get abortCallback(): (req: Request) => void {
    return Config.abortCallback
  }

  get fetch(): any {
    return Config.fetch ? Config.fetch : superAgentFetch
  }

  set fetch(fn: any) {
    Config.fetch = fn
  }

  /**
   * expandInterceptors
   *
   * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
   * @returns {Stream<any>} fn
   */
  private expandInterceptors(interceptors: RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]) {
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
  request(method: string, body?: BodyParam<T>): PromisableStream<RxRestItemInterface<T> & T> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.requestHeaders,
      body: this.requestBodyHandler(body)
    }

    let request = new Request(this.URL + this.requestQueryParams, requestOptions);

    let stream = <PromisableStream<RxRestItem<T> & T>> of(request)
    .flatMap(this.expandInterceptors(Config.requestInterceptors))
    .flatMap(request => this.fetch(request, null, this.abortCallback))
    .flatMap(this.expandInterceptors(Config.responseInterceptors))
    .flatMap(body => fromPromise(this.responseBodyHandler(body)))
    .flatMap(body => {
      if (!Array.isArray(body)) {
        let item: RxRestItem<T>
        if (this instanceof RxRestItem) {
          item = this
          item.element = body as T
        } else {
          item = new RxRestItem(this.$route, body as T)
        }

        item.$fromServer = true
        return create((add, end, error) => {
          add(item)
          end(item)
        })
      }

      let collection = new RxRestCollection<T>(this.$route, body.map((e: T) => {
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
      return of(body)
      .flatMap(this.expandInterceptors(Config.errorInterceptors))
      .flatMap((body: ErrorResponse) => throwError(body))
    })

    stream['then'] = function(resolve: (value?: any) => void) {
      console.warn('Method deprecated, please use .observe().then().catch()')
      return stream.observe(e => {}).then(resolve)
    }

    return stream
  }
}
