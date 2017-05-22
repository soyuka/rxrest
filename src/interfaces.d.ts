import { Stream } from 'most'
import { RxRestItem } from './index'

export type BodyParam<T> = RxRestItem<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

export interface RequestInterceptor {
  (request: Request): Stream<Request>|Promise<Request>|undefined|Request|void;
}

export interface ResponseInterceptor {
  (body: Body): Stream<Body|Object|undefined>|Promise<Body|Object|undefined>|undefined|Body|void;
}

export interface ErrorInterceptor {
  (response: Response): Stream<Response>|void|Response|Promise<Response>;
}

export interface ErrorResponse extends Response {
  name: string;
  message: string;
}

export interface FixedHeaders extends Map<string, string> {
  append: (name: string, value: string) => void;
  getAll: () => Object[];
}

export interface RequestWithHeaders extends Request {
  headers: FixedHeaders;
  url: string;
}
