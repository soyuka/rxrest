/// <reference path="../interfaces.d.ts" />
import { Stream } from 'most';
import { RxRest } from './RxRest';
export declare type BodyParam<T> = RxRestItem<T> | FormData | URLSearchParams | Body | Blob | undefined | Object;
export declare class RxRestItem<T> extends RxRest<T> {
    $element: T;
    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T} [element]
     * @return {Proxy}
     */
    constructor(route: string[], element?: T);
    /**
     * save - POST or PUT according to $fromServer value
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    save(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * get element
     *
     * @return {T}
     */
    /**
     * set element
     *
     * @param {T} element
     */
    element: T;
    /**
     * get plain object
     *
     * @return {T}
     */
    plain(): T;
    /**
     * Get json string
     * @return {string}
     */
    json(): string;
    /**
     * Clone
     * @return {RxRestItem<T>}
     */
    clone(): RxRestItem<T>;
}
export declare class RxRestCollection<T> extends RxRest<T> implements Iterable<RxRestItem<T>>, RxRestCollection<T> {
    length: number;
    $elements: RxRestItem<T>[];
    [index: number]: RxRestItem<T>;
    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T[]|RxRestItem<T>[]]} [elements]
     * @return {Proxy}
     */
    constructor(route: string[], elements?: T[] | RxRestItem<T>[]);
    [Symbol.iterator](): {
        next(): IteratorResult<RxRestItem<T>>;
    };
    /**
     * getList - fetch a collection
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    getList(queryParams?: Object | URLSearchParams, headers?: Object | Headers): Stream<RxRestItem<T> | RxRestCollection<T>>;
    /**
     * get elements
     * @return {RxRestItem<T>[]}
     */
    /**
     * set elements
     *
     * @param {T[]} elements
     */
    elements: RxRestItem<T>[];
    /**
     * plain
     *
     * @returns {T[]}
     */
    plain(): T[];
    /**
     * json
     *
     * @returns {String}
     */
    json(): string;
    /**
     * clone
     *
     * @returns {RxRestCollection}
     */
    clone(): RxRestCollection<T>;
}
export declare class NewRxRest {
    one<T>(route: string, id?: any): RxRestItem<T>;
    all<T>(route: string): RxRestCollection<T>;
    fromObject<T>(route: string, element: T | T[]): RxRestItem<T> | RxRestCollection<T>;
}
export { RxRest };
