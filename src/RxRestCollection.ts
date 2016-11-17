import {URLSearchParams, Headers, RxRestItem} from './interfaces'
import {RxRest} from './RxRest'
import {RxRestProxyHandler} from './RxRestProxyHandler'
import {Stream} from 'most'

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