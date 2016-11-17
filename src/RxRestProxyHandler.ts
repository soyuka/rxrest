import {RxRest} from './RxRest'
import {RxRestItem} from './RxRestItem'
import {RxRestCollection} from './RxRestCollection'

export class RxRestProxyHandler implements ProxyHandler<RxRest> {
  private $internal: PropertyKey[] = [];
  private $instance: RxRestItem | RxRestCollection;

  constructor(target: RxRestItem | RxRestCollection) {
    this.$instance = target
    do {
      this.$internal = this.$internal.concat(
        Object.getOwnPropertyNames(target), Object.getOwnPropertySymbols(target)
      )
    } while (target = Object.getPrototypeOf(target))
  }

  getPrototypeOf(target: any) {
    return Object.getPrototypeOf(this.$instance)
  }

  defineProperty(target: any, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    if (~this.$internal.indexOf(p)) {
      return true
    }

    Object.defineProperty(target, p, attributes)
    return true
  }

  deleteProperty(target: any, p: PropertyKey): boolean {
    return delete target[p]
  }

  set(target: any, p: PropertyKey, value: any, receiver: any): boolean {

    if (~this.$internal.indexOf(p)) {
      this.$instance[p] = value
      return true
    }

    target[p] = value
    return true
  }

  get(target: any, p: PropertyKey, receiver: any): any {
    if (~this.$internal.indexOf(p)) {
      return this.$instance[p]
    }

    return target[p]
  }
}
