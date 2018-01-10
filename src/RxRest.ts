import './rxjs'
import { RxRestConfiguration } from './RxRestConfiguration'
import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  ErrorResponse,
  BodyParam
} from './interfaces'
import { RxRestCollection, RxRestItem } from './index'
import { Observable } from 'rxjs/Observable'
import { Observer } from 'rxjs/Observer'

import { objectToMap, uuid } from './utils'

const fromPromise = function(promise: Promise<any>) {
  return Observable.create((observer: Observer<any>) => {
    promise
    .then((v) => {
      observer.next(v)
      observer.complete()
    })
    .catch(observer.error)
  })
}

export class RxRest<F, T> {
  protected $route: string[]
  $fromServer: boolean = false
  $asIterable: boolean = true
  $queryParams: URLSearchParams = new URLSearchParams()
  $headers: Headers = new Headers()
  config: RxRestConfiguration
  $metadata: any
  $pristine: boolean = true
  $uuid?: string;

  /**
   * constructor
   *
   * @param {String} [route] the resource route
   */
  constructor(
    config: RxRestConfiguration = new RxRestConfiguration(),
    route?: string[],
    metadata?: any
  ) {
    this.$route = route === undefined ? [] : [...route]
    this.config = config
    this.$metadata = metadata
    if (config.uuid) {
      this.$uuid = uuid()
    }
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
  one<T>(route: string, id?: any): RxRestItem<T> {
    this.addRoute(route)
    let o = {} as T
    if (id) {
      o[this.config.identifier] = id
    }

    return new RxRestItem<T>(this.$route, o, this.config)
  }

  /**
   * all
   *
   * @param {String} route
   * @param {boolean} [asIterable=true] - forces the next request to return an Observable<Array>
   *                               instead of emitting multiple events
   * @returns {RxRestCollection}
   */
  all<T>(route: string, asIterable: boolean = true): RxRestCollection<T> {
    this.addRoute(route)
    return new RxRestCollection<T>(this.$route, undefined, this.config, null, asIterable)
  }

  /**
   * asIterable - sets the flag $asIterable
   * instead of emitting multiple events
   *
   * @returns {self}
   */
  asIterable(value = true): this {
    this.$asIterable = value
    return this
  }

  /**
   * fromObject
   *
   * @param {String} route
   * @param {Object|Object[]} element
   * @returns {RxRestItem|RxRestCollection}
   */
  fromObject<T>(route: string, element: T|T[]): RxRestItem<T>|RxRestCollection<T> {
    this.addRoute(route)
    if (Array.isArray(element)) {
      return new RxRestCollection<T>(this.$route, element, this.config)
    }

    return new RxRestItem<T>(this.$route, element, this.config)
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
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  post(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('POST', this.withBody(body))
  }

  /**
   * remove
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('DELETE')
  }

  /**
   * get
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  get(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('GET')
  }

  /**
   * put
   *
   * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  put(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('PUT', this.withBody(body))
  }

  /**
   * patch
   *
   * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  patch(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('PATCH', this.withBody(body))
  }

  /**
   * head
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  head(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('HEAD')
  }

  /**
   * trace
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('TRACE')
  }

  /**
   * options
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  options(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Observable<F> {
    this.queryParams = queryParams
    this.headers = headers

    return this.request('OPTIONS')
  }

  /**
   * URL
   *
   * @returns {string}
   */
  get URL(): string {
    return `${this.config.baseURL}${this.$route.join('/')}`
  }

  /**
   * set local query params
   * @param {Object|URLSearchParams} params
   */
  set queryParams(params: any) {
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
  setQueryParams(params: any): this {
    this.queryParams = params
    return this
  }

  /**
   * Sets local headers useful to add headers to a custom request
   * @param {Object|URLSearchParams}
   * @return this
   */
  setHeaders(params: any): this {
    this.headers = params
    return this
  }

  /**
   * Get local query params
   * @return URLSearchParams
   */
  get queryParams(): any {
    return this.$queryParams
  }

  /**
   * Get request query params
   * Combine local and global query params
   * Local query params are overriding global params
   * @return {String}
   */
  get requestQueryParams(): string {
    let params = new URLSearchParams()

    for (let param of this.config.queryParams) {
      params.append(param[0], param[1])
    }

    for (let param of this.queryParams) {
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
  set headers(params: any) {
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
  get headers(): any {
    return this.$headers
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

    for (let header of this.config.headers) {
      headers.append(header[0], header[1])
    }

    return headers
  }

  /**
   * expandInterceptors
   *
   * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
   * @returns {Observable<any>} fn
   */
  private expandInterceptors(
    interceptors: RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]
  ) {
    return function(origin: any): Observable<any> {
      return (<any>interceptors).reduce(
        (obs: Observable<any>, interceptor: any) =>
          obs.concatMap(value => {
            let result = interceptor(value)
            if (result === undefined) {
              return Observable.of(value)
            }

            if (result instanceof Promise) {
              return fromPromise(result)
            }

            if (result instanceof Observable) {
              return result
            }

            return Observable.of(result)
          }),
        Observable.of(origin)
      )
    }
  }

  /**
   * request
   *
   * @param {string} method
   * @param {RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object} [body]
   * @returns {Observable<RxRestItem|RxRestCollection>}
   */
  request(method: string, body?: BodyParam<T>): Observable<F> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.requestHeaders,
      body: this.config.requestBodyHandler(body)
    }

    let request = new Request(this.URL + this.requestQueryParams, requestOptions);

    let stream = <Observable<F>> Observable.of(request)
    .mergeMap(this.expandInterceptors(this.config.requestInterceptors))
    .mergeMap(request => this.config.fetch(request, null, this.config.abortCallback))
    .mergeMap(this.expandInterceptors(this.config.responseInterceptors))
    .mergeMap(body => fromPromise(this.config.responseBodyHandler(body)))
    .mergeMap(({body, metadata}) => {
      if (!Array.isArray(body)) {
        let item: RxRestItem<T>
        if (this instanceof RxRestItem) {
          item = this
          item.element = body as T
          item.$metadata = metadata
        } else {
          item = new RxRestItem<T>(this.$route, body, this.config, metadata)
        }

        item.$fromServer = true
        item.$pristine = true

        return Observable.create((observer: Observer<RxRestItem<T>>) => {
          observer.next(item)
          observer.complete()
        })
      }

      let collection = new RxRestCollection<T>(this.$route, body.map((e: T) => {
        let item = new RxRestItem<T>(this.$route, e, this.config, metadata)
        item.$fromServer = true
        item.$pristine = true
        return item
      }), this.config, metadata)

      collection.$pristine = true

      return Observable.create((observer: Observer<RxRestItem<T>|RxRestCollection<T>>) => {
        if (this.$asIterable) {
          observer.next(collection)
        } else {
          for (let item of collection) {
            observer.next(item)
          }
        }

        observer.complete()
      })
    })
    .catch((body) => {
      return Observable.of(body)
      .mergeMap(this.expandInterceptors(this.config.errorInterceptors))
      .mergeMap((body: ErrorResponse) => {
        return Observable.throw(body)
      })
    })

    return stream
  }
}
