import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './interfaces';
/**
 * RxRestConfiguration
 */
export declare class RxRestConfiguration {
    baseURL: string;
    identifier: string;
    requestInterceptors: RequestInterceptor[];
    responseInterceptors: ResponseInterceptor[];
    errorInterceptors: ErrorInterceptor[];
    headers: Headers;
    queryParams: URLSearchParams;
    fetch: any;
    abortCallback: (req: Request) => void;
    /**
     * requestBodyHandler
     * JSONify the body if it's an `RxRestItem` or an `Object`
     *
     * @param {FormData|URLSearchParams|Body|Blob|undefined} body
     * @returns {any}
     */
    requestBodyHandler(body: FormData | URLSearchParams | Body | Blob | undefined): FormData | URLSearchParams | Body | Blob | undefined | string | Promise<any>;
    /**
     * responseBodyHandler
     * transforms the response to a json object
     *
     * @param {Response} body
     * @reject when response is an error
     * @returns {Promise<any>}
     */
    responseBodyHandler(body: Response): Promise<any>;
}
