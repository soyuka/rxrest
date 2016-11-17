import {RxRestItem} from './RxRestItem'
import {RxRestCollection} from './RxRestCollection'
import {RxRest} from './RxRest'

/**
 * Class that exports a new RxRest instance when one/all are called
 */
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

export {RxRest, RxRestItem, RxRestCollection}