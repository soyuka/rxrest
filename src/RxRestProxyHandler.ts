import {RxRest} from './RxRest'

export class RxRestProxyHandler<F, T> implements ProxyHandler<RxRest<F, T>> {
  private $internal: PropertyKey[] = [];
  private $instance: F;

  constructor(target: F) {
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

    if ((this.$instance as any).$pristine === true) {
      (this.$instance as any).$pristine = false
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
