import { Observable } from 'rxjs/Observable'
import { RxRestItem } from './index'

export type BodyParam<T> = RxRestItem<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestInterceptor {
  (request: Request): Observable<Request>|Promise<Request>|undefined|Request|void;
}

export interface ResponseInterceptor {
  (body: Body): Observable<Body|Object|undefined>|
    Promise<Body|Object|undefined>|undefined|Body|void;
}

export interface ErrorInterceptor {
  (response: Response): Observable<Response>|void|Response|Promise<Response>;
}

export interface ErrorResponse extends Response {
  name: string;
  message: string;
}
