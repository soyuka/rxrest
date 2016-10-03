import {Observable} from 'rxjs'

export abstract class RxRestRequest {
  protected route: string;

  constructor(route: string) {
    this.route = route
  }

  request(requestOptions: RequestOptions): Observable<RxRestItem | RxRestCollection> {
    let request = new Request(this.route, requestOptions);

    return Observable.fromPromise(fetch(request))
    .flatMap(body => Observable.fromPromise(body.json()))
    .map(e => {
      if (!Array.isArray(e)) {
        let item = new RxRestItem(this.route, e)
        item._fromServer = true
        return item
      }

      return new RxRestCollection(this.route, e.map(e => {
        let item = new RxRestItem(this.route, e)
        item._fromServer = true
        return item
      }))
    })
  }

}

export class RxRestItem extends RxRestRequest {
  private _element: Object;
  public _fromServer: boolean;

  constructor(route: string, element?: Object) {
    super(route)
    this._element = element

    for(let i in this._element) {
      if (i === '_fromServer' || !(this.hasOwnProperty(i))) {
        this[i] = element[i]
      }
    }
  }

  get(queryParams: URLSearchParams = new URLSearchParams(), headers: Headers = new Headers()): Observable<RxRestItem | RxRestCollection> {
    let options = {
      method: 'GET',
      body: queryParams,
      headers: headers
    }

    return this.request(options)
  }

  // put(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // post(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // remove(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // head(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // trace(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // options(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
  //
  // patch(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }

  clone(): RxRestItem {
    return new RxRestItem(this.route, this._element)
  }

  plain(): Object {
    return this._element
  }

  save(queryParams: URLSearchParams = new URLSearchParams(), headers: Headers = new Headers()): Observable<RxRestItem | RxRestCollection> {
    let options = {
      method: this._fromServer === true ? 'PUT' : 'POST',
      body: queryParams,
      headers: headers
    }

    return this.request(options)
  }
}

export class RxRestCollection extends RxRestRequest implements Iterable<RxRestItem> {
  private _elements: RxRestItem[];
  private length: number;

  constructor(route: string, elements?: any[]) {
    super(route)
    if (elements) {
      this._elements = elements.map(e => {
        return e instanceof RxRestItem ? e : new RxRestItem(route, e)
      })

      this.length = 0
      for (let i of elements) {
        this[this.length++] = i
      }
    }
  }

  [Symbol.iterator]() {
    let index = 0
    let elements = this

    return {
      next(): IteratorResult<RxRestItem> {
        return index < elements.length ? {value: elements[index++], done: false} : {value: undefined, done: true}
      }
    }
  }

  getList(queryParams: URLSearchParams = new URLSearchParams(), headers: Headers = new Headers()): Observable<RxRestItem | RxRestCollection> {
    let options = {
      method: 'GET',
      body: queryParams,
      headers: headers
    }

    return this.request(options)
  }
}

export class RxRestSetup {
  baseURL: string;

  one(route: string, id: any): RxRestItem {
    return new RxRestItem(`${this.baseURL}${route}/${id}`)
  }

  all(route: string): RxRestCollection {
    return new RxRestCollection(`${this.baseURL}${route}`)
  }

  fromObject(route: string, element?: Object|Object[]): RxRestItem|RxRestCollection {
    return Array.isArray(element) ? new RxRestCollection(route, element) : new RxRestItem(route, element);
  }
}
