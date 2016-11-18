/// <reference path="../interfaces.d.ts" />

import {Stream} from 'most'
import {RxRestProxyHandler} from './RxRestProxyHandler'
import {BodyParam, RxRestItemInterface} from './interfaces'
import {RxRest} from './RxRest'

export class RxRestItem extends RxRest implements RxRestItemInterface {
  protected $element: Object = {};

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {Object} [element]
   * @return {Proxy}
   */
  constructor(route: string[], element?: Object) {
    super(route)

    if (element !== undefined) {
      this.element = element
    }

    const proxy = new Proxy(this.$element, new RxRestProxyHandler(this))

    return <RxRestItem> proxy
  }

  /**
   * save - POST or PUT according to $fromServer value
   *
   * @param {Object|URLSearchParams} [queryParams]
   * @param {Object|Headers} [headers]
   * @returns {Stream<RxRestItem|RxRestCollection>}
   */
  save(queryParams?: Object|URLSearchParams, headers?: Object|Headers):
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST', this)
  }

  /**
   * set element
   *
   * @param {Object} element
   */
  set element(element: Object) {
    for (let i in element) {
      if (i === this.identifier && !this.$element[this.identifier]) {
        this.$route.push(element[i])
      }

      this.$element[i] = element[i]
    }
  }

  /**
   * get element
   *
   * @return {Object}
   */
  get element(): Object {
    return this.$element
  }

  /**
   * get plain object
   *
   * @return {Object}
   */
  plain(): Object {
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
   * @return {RxRestItem}
   */
  clone(): RxRestItem {
    let route = this.$route

    if (this.$element[this.identifier]) {
      route = route.slice(0, this.$route.length - 1)
    }

    let clone = new RxRestItem(route, this.$element)
    clone.$fromServer = this.$fromServer
    return clone
  }
}

export class RxRestCollection extends RxRest implements Iterable<RxRestItem> {
  length: number;
  protected $elements: RxRestItem[] = [];
  [index: number]: RxRestItem;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {Object} [elements]
   * @return {Proxy}
   */
  constructor(route: string[], elements?: any[]) {
    super(route)
    if (elements !== undefined) {
      this.elements = elements
    }

    const proxy = new Proxy(this.$elements, new RxRestProxyHandler(this))

    return <RxRestCollection> proxy
  }

  [Symbol.iterator]() {
    let index = 0
    let elements = this.$elements

    return {
      next(): IteratorResult<RxRestItem> {
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
    Stream<RxRestItem|RxRestCollection> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  /**
   * set elements
   *
   * @param {Object[]|RxRestItem[]} elements
   */
  set elements(elements: any[]) {
    this.$elements = elements.map(e =>
      e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e)
    )

    this.length = elements.length
  }

  /**
   * get elements
   * @return {RxRestItem[]}
   */
  get elements(): any[] {
    return this.$elements
  }

  /**
   * plain
   *
   * @returns {Object[]}
   */
  plain(): Object[] {
    return this.elements.map(e => e.plain())
  }

  /**
   * json
   *
   * @returns {String}
   */
  json(): String {
    return JSON.stringify(this.plain())
  }

  /**
   * clone
   *
   * @returns {RxRestCollection}
   */
  clone(): RxRestCollection {
    return new RxRestCollection(this.$route, this.$elements)
  }
}

export class NewRxRest {
  one(): RxRestItem {
    let r = new RxRest()
    return r.one.apply(r, arguments)
  }

  all(): RxRestCollection {
    let r = new RxRest()
    return r.all.apply(r, arguments)
  }
}

export {RxRest}