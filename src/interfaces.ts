import {Stream} from 'most'

export interface RxRestItemInterface {

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

export type BodyParam = RxRestItemInterface|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestBodyHandler {
  (body: BodyParam): FormData|URLSearchParams|Body|Blob|undefined|string
}

export interface ResponseBodyHandler {
  (body: Response): Promise<any>
}
