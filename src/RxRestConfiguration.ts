import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from './interfaces'
import { RxRestItem } from './index'
import { BodyParam } from './interfaces'
import { objectToMap } from './utils'
import { fetch } from './fetch';

export interface RequestBodyHandler<T> {
  (body: BodyParam<T>): FormData|URLSearchParams|Body|Blob|undefined|string|Promise<any>
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}

/**
 * RxRestConfiguration
 */
export class RxRestConfiguration {
  private $baseURL: string
  private $headers: Headers = new Headers()
  private $queryParams: URLSearchParams = new URLSearchParams()
  public identifier: string = 'id'
  public requestInterceptors: RequestInterceptor[] = []
  public responseInterceptors: ResponseInterceptor[] = []
  public errorInterceptors: ErrorInterceptor[] = []
  public fetch: any
  public abortCallback: (req: Request) => void = () => null
  public uuid: boolean = false

  constructor() {
      this.fetch = fetch
  }

  /**
   * requestBodyHandler
   * JSONify the body if it's an `RxRestItem` or an `Object`
   *
   * @param {FormData|URLSearchParams|Body|Blob|undefined} body
   * @returns {any}
   */
  _requestBodyHandler(body: FormData|URLSearchParams|Body|Blob|undefined):
    FormData|URLSearchParams|Body|Blob|undefined|string|Promise<any> {
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
  _responseBodyHandler(body: Response): Promise<{body: any, metadata: any}> {
    return body.text()
    .then(text => {
      return {body: text ? JSON.parse(text) : null, metadata: null}
    })
  }

  get responseBodyHandler(): ResponseBodyHandler {
    return this._responseBodyHandler
  }

  set responseBodyHandler(responseBodyHandler: ResponseBodyHandler) {
    this._responseBodyHandler = responseBodyHandler
  }

  get requestBodyHandler(): RequestBodyHandler<any> {
    return this._requestBodyHandler
  }

  set requestBodyHandler(requestBodyHandler: RequestBodyHandler<any>) {
    this._requestBodyHandler = requestBodyHandler
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

    this.$baseURL = base
  }

  /**
   * get baseURL
   *
   * @returns {string}
   */
  get baseURL(): string {
    return this.$baseURL
  }

  /**
   * Set global query params
   * @param {Object|URLSearchParams} params
   */
  set queryParams(params: any) {
    if (params instanceof URLSearchParams) {
      this.$queryParams = params
      return
    }

    if (typeof params === 'string') {
      this.$queryParams = new URLSearchParams(params)
      return
    }

    this.$queryParams = objectToMap(new URLSearchParams(), params)
  }

  /**
   * Get global query params
   * @return {URLSearchParams}
   */
  get queryParams(): any {
    return this.$queryParams
  }

  /**
   * set global headers
   * @param {Object|Headers} params
   */
  set headers(params: any) {
     if (params instanceof Headers) {
      this.$headers = params
      return
    }

    this.$headers = objectToMap(new Headers(), params)
 }

  /**
   * Get global headers
   * @return Headers
   */
  get headers(): any {
    return this.$headers
  }
}
