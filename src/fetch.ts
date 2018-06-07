import {ErrorResponse} from './interfaces'
import * as superagent from 'superagent'
import {Observable, Observer, from as fromPromise} from 'rxjs'
import {mergeMap} from 'rxjs/operators'

export function fetch(
  input: string|Request,
  init?: RequestInit,
  abortCallback?: (req: Request) => void
): Observable<any> {

  if (!(input instanceof Request)) {
    input = new Request(input, init)
  }

  let req = superagent[input.method.toLowerCase()](input.url)

  for (let header of input.headers) {
    req.set(header[0], header[1])
  }

  return fromPromise(input.text())
  .pipe(
    mergeMap(body => {
      req.send(body)

      return Observable.create((observer: Observer<any>) => {
        req.end(function(err: any, res: any) {
          if (err) {
            return observer.error(res)
          }

          if (res.noContent === true) {
            observer.next(new Response())
            return observer.complete()
          }

          res.url = (input as Request).url
          let response = new Response(res.text, res)

          observer.next(response)
          observer.complete()
        })

        return function abort() {
          req.abort()
          if (abortCallback) {
            abortCallback(req)
          }
        }
      })
    })
  )
}
