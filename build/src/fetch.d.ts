/// <reference path="../interfaces.d.ts" />
import { RequestOptions, RequestWithHeaders } from './interfaces';
import { Stream } from 'most';
export declare function fetch(input: string | RequestWithHeaders, init?: RequestOptions, abortCallback?: (req: Request) => void): Stream<any>;
