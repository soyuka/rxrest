/// <reference path="../interfaces.d.ts" />
import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './interfaces';
import { RxRestCollection, RxRestItem, BodyParam } from './index';
import { Stream } from 'most';
export interface RequestBodyHandler<T> {
    (body: BodyParam<T>): FormData | URLSearchParams | Body | Blob | undefined | string | Promise<any>;
}
export interface ResponseBodyHandler {
    (body: Response): Promise<any>;
}
export declare class RxRest<T> {
    protected $route: string[];
    $fromServer: boolean;
    $queryParams: URLSearchParams;
    $headers: Headers;
    /**
     * constructor
     *
     * @param {String} [route] the resource route
     */
    constructor(route?: string[]);
    protected addRoute(route: string): void;
    /**
     * one
     *
     * @param {String} route
     * @param {any} id
     * @returns {RxRestItem}
     */
    one<T>(route: string, id?: any): RxRestItem<T>;
    /**
     * all
     *
     * @param {String} route
     * @returns {RxRestCollection}
     */
    all<T>(route: string): RxRestCollection<T>;
    /**
     * fromObject
     *
     * @param {String} route
     * @param {Object|Object[]} element
     * @returns {RxRestItem|RxRestCollection}
     */
    fromObject<T>(route: string, element: T | T[]): RxRestItem<T> | RxRestCollection<T>;
    /**
     * @access private
     * @param {BodyParam} body
     * @return {BodyParam|RxRestItem}
     */
    protected withBody(body: BodyParam<T>): BodyParam<T>;
    /**
     * post
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    post(body?: BodyParam<T>, queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * remove
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    remove(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * get
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    get(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * put
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    put(body?: BodyParam<T>, queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * patch
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    patch(body?: BodyParam<T>, queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * head
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    head(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * trace
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    trace(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * options
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    options(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * URL
     *
     * @returns {string}
     */
    readonly URL: string;
    /**
     * get baseURL
     *
     * @returns {string}
     */
    /**
     * set baseURL
     *
     * @param {String} base
     * @returns
     */
    baseURL: string;
    /**
     * Get identifier key
     */
    /**
     * Set identifier key
     *
     * @param {String} id
     */
    identifier: string;
    /**
     * Get local query params
     * @return URLSearchParams
     */
    /**
     * set local query params
     * @param {Object|URLSearchParams} params
     */
    localQueryParams: any;
    /**
     * Sets local query params useful to add params to a custom request
     * @param {Object|URLSearchParams}
     * @return this
     */
    setQueryParams(params: any): RxRest<T>;
    /**
     * Sets local headers useful to add headers to a custom request
     * @param {Object|URLSearchParams}
     * @return this
     */
    setHeaders(params: any): RxRest<T>;
    /**
     * Get global query params
     * @return {URLSearchParams}
     */
    /**
     * Set global query params
     * @param {Object|URLSearchParams} params
     */
    queryParams: any;
    /**
     * Get request query params
     * Combine local and global query params
     * Local query params are overriding global params
     * @return {String}
     */
    readonly requestQueryParams: string;
    /**
     * Get local headers
     * @return Headers
     */
    /**
     * Set local headers
     * @param {Object|Headers} params
     */
    localHeaders: any;
    /**
     * Get global headers
     * @return Headers
     */
    /**
     * set global headers
     * @param {Object|Headers} params
     */
    headers: any;
    /**
     * get request Headers
     * Combine local and global headers
     * Local headers are overriding global headers
     *
     * @returns {Headers}
     */
    readonly requestHeaders: Headers;
    /**
     * get requestInterceptors
     *
     * @returns {RequestInterceptor[]}
     */
    /**
     * set requestInterceptors
     *
     * @param {RequestInterceptor[]} requestInterceptors
     */
    requestInterceptors: RequestInterceptor[];
    /**
     * get responseInterceptors
     *
     * @returns {ResponseInterceptor[]}
     */
    /**
     * set responseInterceptors
     *
     * @param {ResponseInterceptor[]} responseInterceptor
     */
    responseInterceptors: ResponseInterceptor[];
    /**
     * get errorInterceptors
     *
     * @returns {ErrorInterceptor[]}
     */
    /**
     * set errorInterceptors
     *
     * @param {ErrorInterceptor[]} errorInterceptors
     */
    errorInterceptors: ErrorInterceptor[];
    /**
     * requestBodyHandler
     *
     * @returns {Function}
     */
    /**
     * set requestBodyHandler
     *
     * @param {Function} fn
     */
    requestBodyHandler: RequestBodyHandler<T>;
    /**
     * get responseBodyHandler
     *
     * @returns {ResponseBodyHandler}
     */
    /**
     * set responseBodyHandler
     * @param {ResponseBodyHandler} fn
     */
    responseBodyHandler: ResponseBodyHandler;
    /**
     * @return fn the current cancel callback
     */
    /**
     * @param fn the callback that will be called on request abortion
     */
    abortCallback: (req: Request) => void;
    fetch: any;
    /**
     * expandInterceptors
     *
     * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
     * @returns {Stream<any>} fn
     */
    private expandInterceptors(interceptors);
    /**
     * request
     *
     * @param {string} method
     * @param {RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object} [body]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    request(method: string, body?: BodyParam<T>): Stream<RxRestItem<T> & T>;
}
