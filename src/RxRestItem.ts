import {URLSearchParams, Headers} from './interfaces'
import {RxRest} from './RxRest'
import {RxRestProxyHandler} from './RxRestProxyHandler'
import {Stream} from 'most'

export class RxRestItem extends RxRest {
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
    Stream<any> {
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
