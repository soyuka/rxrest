/// <reference path="../interfaces.d.ts" />
import { PromisableStream, RxRestCollectionInterface, RxRestItemInterface } from './interfaces';
import { RxRest } from './RxRest';
export declare class RxRestItem<T> extends RxRest<T> implements RxRestItemInterface<T> {
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
    save(queryParams?: Object | URLSearchParams, headers?: Object | Headers): PromisableStream<RxRestItemInterface<T> | RxRestCollectionInterface<T>>;
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
    clone(): RxRestItemInterface<T>;
}
export declare class RxRestCollection<T> extends RxRest<T> implements Iterable<RxRestItemInterface<T>>, RxRestCollectionInterface<T> {
    length: number;
    $elements: RxRestItemInterface<T>[];
    [index: number]: RxRestItemInterface<T>;
    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T[]|RxRestItem<T>[]]} [elements]
     * @return {Proxy}
     */
    constructor(route: string[], elements?: T[] | RxRestItemInterface<T>[]);
    [Symbol.iterator](): {
        next(): IteratorResult<RxRestItemInterface<T>>;
    };
    /**
     * getList - fetch a collection
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    getList(queryParams?: Object | URLSearchParams, headers?: Object | Headers): PromisableStream<RxRestItemInterface<T> | RxRestCollectionInterface<T>>;
    /**
     * get elements
     * @return {RxRestItem<T>[]}
     */
    /**
     * set elements
     *
     * @param {T[]} elements
     */
    elements: RxRestItemInterface<T>[];
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
    clone(): RxRestCollectionInterface<T>;
}
export declare class NewRxRest {
    one<T>(route: string, id?: any): RxRestItemInterface<T>;
    all<T>(route: string): RxRestCollectionInterface<T>;
    fromObject<T>(route: string, element: T | T[]): RxRestItemInterface<T> | RxRestCollectionInterface<T>;
}
export { RxRest };
