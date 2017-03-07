import { Stream } from 'most'
import { RxRestProxyHandler } from './RxRestProxyHandler'
import { RxRest } from './RxRest'

export type BodyParam<T> = RxRestItem<T>|FormData|URLSearchParams|Body|Blob|undefined|Object;

export class RxRestItem<T> extends RxRest<T> {
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
    Stream<RxRestItem<T>|RxRestCollection<T>> {
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
        this.$route.push('' + element[i])
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
  clone(): RxRestItem<T> {
    let route = this.$route

    if (this.$element[this.identifier]) {
      route = route.slice(0, this.$route.length - 1)
    }

    let clone = new RxRestItem(route, this.$element)
    clone.$fromServer = this.$fromServer
    return clone
  }
}

export class RxRestCollection<T> extends RxRest<T>
  implements Iterable<RxRestItem<T>>, RxRestCollection<T> {
  length: number;
  $elements: RxRestItem<T>[] = [];
  [index: number]: RxRestItem<T>;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {T[]|RxRestItem<T>[]]} [elements]
   * @return {Proxy}
   */
  constructor(route: string[], elements?: T[]|RxRestItem<T>[]) {
    super(route)
    if (elements !== undefined) {
      this.elements = (elements as any).map((e: any) =>
        e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e)
      )
    }

    const proxy = new Proxy(this.$elements, new RxRestProxyHandler<T>(this))

    return <RxRestCollection<T> & T> proxy
  }

  [Symbol.iterator]() {
    let index = 0
    let elements = this.$elements

    return {
      next(): IteratorResult<RxRestItem<T>> {
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
    Stream<RxRestItem<T>|RxRestCollection<T>> {
    this.localQueryParams = queryParams
    this.localHeaders = headers

    return this.request('GET')
  }

  /**
   * set elements
   *
   * @param {T[]} elements
   */
  set elements(elements: RxRestItem<T>[]) {
    this.$elements = elements
    this.length = elements.length
  }

  /**
   * get elements
   * @return {RxRestItem<T>[]}
   */
  get elements(): RxRestItem<T>[] {
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
  clone(): RxRestCollection<T> {
    return new RxRestCollection<T>(this.$route, this.$elements)
  }
}

export class NewRxRest {
  one<T>(route: string, id?: any): RxRestItem<T> {
    let r = new RxRest()
    return r.one.call(r, route, id)
  }

  all<T>(route: string): RxRestCollection<T> {
    let r = new RxRest()
    return r.all.call(r, route)
  }

  fromObject<T>(route: string, element: T|T[]): RxRestItem<T>|RxRestCollection<T> {
    let r = new RxRest()
    return r.fromObject.call(r, route, element)
  }
}

export {RxRest}
