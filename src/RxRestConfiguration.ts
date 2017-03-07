import {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from './interfaces'
import {RxRestItem} from './index'

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
  fetch: any
  abortCallback: (req: Request) => void = () => null

  /**
   * requestBodyHandler
   * JSONify the body if it's an `RxRestItem` or an `Object`
   *
   * @param {FormData|URLSearchParams|Body|Blob|undefined} body
   * @returns {any}
   */
  requestBodyHandler(body: FormData|URLSearchParams|Body|Blob|undefined):
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
  responseBodyHandler(body: Response): Promise<any> {
    return body.text()
    .then(text => {
      return text ? JSON.parse(text) : null
    })
  }
}
