import { Stream } from 'most'
import { RxRestProxyHandler } from './RxRestProxyHandler'
import { RxRest as AbstractRxRest } from './RxRest'
import { RxRestConfiguration } from './RxRestConfiguration';

export class RxRestItem<T> extends AbstractRxRest<RxRestItem<T> & T, T> {
  $element: T = {} as T;

  /**
   * constructor
   *
   * @param {string[]} route
   * @param {T} [element]
   * @return {Proxy}
   */
  constructor(route: string[], element?: T, config?: RxRestConfiguration, metadata?: any) {
    super(config, route, metadata)

    if (element !== undefined) {
      this.element = element
    }

    const proxy = new Proxy(this.$element, new RxRestProxyHandler<RxRestItem<T>, T>(this))

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
    this.queryParams = queryParams
    this.headers = headers

    return this.request(this.$fromServer === true ? 'PUT' : 'POST', this)
  }

  /**
   * set element
   *
   * @param {T} element
   */
  set element(element: T) {
    for (let i in element) {
      if (i === this.config.identifier && !this.$element[this.config.identifier]) {
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
  clone(): RxRestItem<T> & T {
    let route = this.$route

    if (this.$element[this.config.identifier]) {
      route = route.slice(0, this.$route.length - 1)
    }

    let clone = new RxRestItem(route, this.$element, this.config)
    clone.$fromServer = this.$fromServer
    return clone as RxRestItem<T> & T
  }
}

export class RxRestCollection<T> extends AbstractRxRest<RxRestCollection<T> & T[] & T, T>
  implements Iterable<RxRestItem<T>> {
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
  constructor(
    route: string[],
    elements?: T[]|RxRestItem<T>[],
    config?: RxRestConfiguration,
    metadata?: any,
    asIterable: boolean = false
  ) {
    super(config, route, metadata)

    if (elements !== undefined) {
      this.elements = (elements as any).map((e: any) =>
        e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e)
      )
    }

    this.$asIterable = asIterable

    const proxy = new Proxy(this.$elements, new RxRestProxyHandler<RxRestCollection<T>, T>(this))

    return <RxRestCollection<T> & T[]> proxy
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
    this.queryParams = queryParams
    this.headers = headers

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
  clone(): RxRestCollection<T> & T[] {
    return new RxRestCollection<T>(this.$route, this.$elements, this.config) as RxRestCollection<T> & T[]
  }
}

export class RxRest {
  constructor(private config: RxRestConfiguration) {
  }

  one<T>(route: string, id?: any): RxRestItem<T> & T {
    let r = new AbstractRxRest(this.config)
    return r.one.call(r, route, id)
  }

  all<T>(route: string, asIterable: boolean = false): RxRestCollection<T> & T[] {
    let r = new AbstractRxRest(this.config)
    return r.all.call(r, route, asIterable)
  }

  fromObject<T>(route: string, element: T|T[]): (RxRestItem<T> & T) | (RxRestCollection<T> & T[]) {
    let r = new AbstractRxRest(this.config)
    return r.fromObject.call(r, route, element)
  }
}

export { RxRestConfiguration }
