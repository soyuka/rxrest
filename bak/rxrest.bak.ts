import {Observable} from 'rxjs'

export abstract class RxRestRequest {
  protected route: string;

  constructor(route: string) {
    this.route = route
  }

  request(requestOptions: RequestOptions): Observable<RxRestItem> | Observable<RxRestItem[]> {
    let request = new Request(this.route, requestOptions);

    return Observable.fromPromise(fetch(request))
    .map(function(body) {
      return new RxRestItem(this.route, body.json())
    })
  }

}

export class RxRestItem extends RxRestRequest {
  private element: Object;

  constructor(route: string, element?: Object) {
    super(route)
    this.element = element
  }

  get(queryParams: URLSearchParams = new URLSearchParams(), headers: Headers = new Headers()): Observable<RxRestItem> {
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
    return new RxRestItem(this.route, this.element)
  }

  plain(): Object {
    return this.element
  }

  // save(queryParams?: URLSearchParams, headers?: Headers): Observable<Response> {
  //
  // }
}

export class RxRestCollection extends RxRestRequest {
  private element: Object[];

  constructor(route: string, element?: Object[]) {
    super(route)
    this.element = element
  }

  getList(queryParams: URLSearchParams = new URLSearchParams(), headers: Headers = new Headers()): Observable<RxRestItem[]> {
    let options = {
      method: 'GET',
      body: queryParams,
      headers: headers
    }

    return this.request(options)
  }
}

export class RxRestSetup {
  one(route: string, id: any): RxRestItem {
    return new RxRestItem(`${route}/${id}`)
  }

  all(route: string): RxRestCollection {
    return new RxRestCollection(route)
  }

  fromObject(route: string, element?: Object|Object[]): RxRestCollection|RxRestItem {
    return Array.isArray(element) ? new RxRestCollection(route, element) : new RxRestItem(route, element);
  }
}
