/// <reference path="../interfaces.d.ts" />

import { Stream } from 'most'
import { RxRestProxyHandler } from './RxRestProxyHandler'
import { BodyParam, PromisableStream, RxRestCollectionInterface, RxRestItemInterface } from './interfaces';
import { RxRest } from './RxRest'

export class RxRestItem<T> extends RxRest<T> implements RxRestItemInterface<T> {
  $element: T = {} as T;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {T} [element]
   * @return {Proxy}
   */
  constructor(route: string[], element?: T) {
    super(route)

    if (element !== undefined) {
      this.element = element
    }

    const proxy = new Proxy(this.$element, new RxRestProxyHandler<T>(this))

    return <RxRestItem<T> & T> proxy
  }

  /**
   * save - POST or PUT according to $fromServer value
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  save(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST', this)
  }

  /**
   * set element
   *
   * @param {T} element
   */
  set element(element: T) {
    for (let i in element) {
      if (i === this.identifier && !this.$element[this.identifier]) {
        this.$route.push(''+element[i])
      }

      this.$element[i] = element[i]
    }
  }

  /**
   * get element
   *
   * @return {T}
   */
  get element(): T {
    return this.$element
  }

  /**
   * get plain object
   *
   * @return {T}
   */
  plain(): T {
    return this.element
  }

  /**
   * Get json string
   * @return {string}
   */
  json(): string {
    return JSON.stringify(this.plain())
  }

  /**
   * Clone
   * @return {RxRestItem<T>}
   */
  clone(): RxRestItemInterface<T> {
    let route = this.$route

    if (this.$element[this.identifier]) {
      route = route.slice(0, this.$route.length - 1)
    }

    let clone = new RxRestItem(route, this.$element)
    clone.$fromServer = this.$fromServer
    return clone
  }
}

export class RxRestCollection<T> extends RxRest<T> implements Iterable<RxRestItemInterface<T>>, RxRestCollectionInterface<T> {
  length: number;
  $elements: RxRestItemInterface<T>[] = [];
  [index: number]: RxRestItemInterface<T>;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {T[]|RxRestItem<T>[]]} [elements]
   * @return {Proxy}
   */
  constructor(route: string[], elements?: T[]|RxRestItemInterface<T>[]) {
    super(route)
    if (elements !== undefined) {
      this.elements = (elements as any).map((e: any) => e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e))
    }

    const proxy = new Proxy(this.$elements, new RxRestProxyHandler<T>(this))

    return <RxRestCollection<T> & T> proxy
  }

  [Symbol.iterator]() {
    let index = 0
    let elements = this.$elements

    return {
      next(): IteratorResult<RxRestItemInterface<T>> {
        return index < elements.length ?
          {value: elements[index++], done: false} : {value: undefined, done: true}
      }
    }
  }

  /**
   * getList - fetch a collection
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  getList(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    PromisableStream<RxRestItemInterface<T>|RxRestCollectionInterface<T>> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  /**
   * set elements
   *
   * @param {T[]} elements
   */
  set elements(elements: RxRestItemInterface<T>[]) {
    this.$elements = elements
    this.length = elements.length
  }

  /**
   * get elements
   * @return {RxRestItem<T>[]}
   */
  get elements(): RxRestItemInterface<T>[] {
    return this.$elements
  }

  /**
   * plain
   *
   * @returns {T[]}
   */
  plain(): T[] {
    return this.elements.map(e => e.plain())
  }

  /**
   * json
   *
   * @returns {String}
   */
  json(): string {
    return JSON.stringify(this.plain())
  }

  /**
   * clone
   *
   * @returns {RxRestCollection}
   */
  clone(): RxRestCollectionInterface<T> {
    return new RxRestCollection<T>(this.$route, this.$elements)
  }
}

export class NewRxRest {
  one<T>(route: string, id?: any): RxRestItemInterface<T> {
    let r = new RxRest()
    return r.one.call(r, route, id)
  }

  all<T>(route: string): RxRestCollectionInterface<T> {
    let r = new RxRest()
    return r.all.call(r, route)
  }

  fromObject<T>(route: string, element: T|T[]): RxRestItemInterface<T>|RxRestCollectionInterface<T> {
    let r = new RxRest()
    return r.fromObject.call(r, route, element)
  }
}

export {RxRest}
