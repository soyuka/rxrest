/// <reference path="interfaces.d.ts" />

import * as superagent from 'superagent'
import {Observable, Observer} from 'rxjs'

export function fetch(input: string|Request, init?: RequestOptions): Observable<any> {

  if (!(input instanceof Request)) {
    input = new Request(input, init)
  }

  let req = superagent[input.method.toLowerCase()](input.url)

  for (let header of <Headers> input.headers) {
    req.set(header[0], header[1])
  }

  return Observable.fromPromise(input.text())
  .flatMap(body => {
    req.send(body)

    return Observable.create((observer: Observer<Response>) => {
      req.end(function(err: any, res: any) {
        if (err) {
          let response = new Response(err, err)
          return observer.error(response)
        }

        let response = new Response(res.text, res)

        observer.next(response)
        observer.complete()
      })

      return function abort() {
        req.abort()
      }
    })
  })
}
