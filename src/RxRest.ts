import { RxRestConfiguration } from './RxRestConfiguration'
import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  ErrorResponse,
  BodyParam
} from './interfaces'
import { RxRestCollection, RxRestItem } from './index'
import { Stream, throwError, of } from 'most'
import { create } from '@most/create'
import { objectToMap } from './utils'

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

export class RxRest<F, T> {
  protected $route: string[]
  $fromServer: boolean = false
  $asIterable: boolean = false
  $queryParams: URLSearchParams = new URLSearchParams()
  $headers: Headers = new Headers()
  config: RxRestConfiguration
  $metadata: any

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
   * @param {boolean} asIterable - forces the next request to return an Observable<Array>
   *                               instead of emitting multiple events
   * @returns {RxRestCollection}
   */
  all<T>(route: string, asIterable: boolean = false): RxRestCollection<T> {
    this.addRoute(route)
    return new RxRestCollection<T>(this.$route, undefined, this.config, null, asIterable)
  }

  /**
   * asIterable - forces the next request to return an Observable<Array>
   * instead of emitting multiple events
   *
   * @returns {self}
   */
  asIterable(): this {
    this.$asIterable = true
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
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  post(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<F> {
    this.queryParams = queryParams
    this.headers = headers

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
    Stream<F> {
    this.queryParams = queryParams
    this.headers = headers

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
    Stream<F> {
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
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  put(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<F> {
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
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  patch(body?: BodyParam<T>, queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<F> {
    this.queryParams = queryParams
    this.headers = headers

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
    Stream<F> {
    this.queryParams = queryParams
    this.headers = headers

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
    Stream<F> {
    this.queryParams = queryParams
    this.headers = headers

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
    Stream<F> {
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
   * @returns {Stream<any>} fn
   */
  private expandInterceptors(
    interceptors: RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]
  ) {
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
  request(method: string, body?: BodyParam<T>): Stream<F> {
    let requestOptions = {
      method: method,
      headers: <Headers> this.requestHeaders,
      body: this.config.requestBodyHandler(body)
    }

    let request = new Request(this.URL + this.requestQueryParams, requestOptions);

    let stream = <Stream<F>> of(request)
    .flatMap(this.expandInterceptors(this.config.requestInterceptors))
    .flatMap(request => this.config.fetch(request, null, this.config.abortCallback))
    .flatMap(this.expandInterceptors(this.config.responseInterceptors))
    .flatMap(body => fromPromise(this.config.responseBodyHandler(body)))
    .flatMap(({body, metadata}) => {
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

        return create((add, end, error) => {
          add(item)
          end(item)
        })
      }

      let collection = new RxRestCollection<T>(this.$route, body.map((e: T) => {
        let item = new RxRestItem<T>(this.$route, e, this.config, metadata)
        item.$fromServer = true
        return item
      }), this.config, metadata)

      return create((add, end, error) => {
        if (this.$asIterable) {
          add(collection)
        } else {
          for (let item of collection) {
            add(item)
          }
        }

        end(collection)
      })
    })
    .recoverWith(body => {
      return of(body)
      .flatMap(this.expandInterceptors(this.config.errorInterceptors))
      .flatMap((body: ErrorResponse) => throwError(body))
    })

    return stream
  }
}
