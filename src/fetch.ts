/// <reference path="../interfaces.d.ts" />

import * as superagent from 'superagent'
import {Stream, fromPromise} from 'most'
import {create} from '@most/create'

export function fetch(input: string|Request, init?: RequestOptions): Stream<any> {

  if (!(input instanceof Request)) {
    input = new Request(input, init)
  }

  let req = superagent[input.method.toLowerCase()](input.url)

  for (let header of <Headers> input.headers) {
    req.set(header[0], header[1])
  }

  return fromPromise(input.text())
  .flatMap(body => {
    req.send(body)

    return create((add, end, error) => {
      req.end(function(err: any, res: any) {
        if (err) {
          let response = new Response(err, res)
          response.message = response.statusText
          return error(<ErrorResponse> response)
        }

        let response = new Response(res.text, res)

        add(response)
        end()
      })

      return function abort() {
        req.abort()
      }
    })
  })
}
