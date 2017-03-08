import { RequestOptions, ErrorResponse, RequestWithHeaders } from './interfaces'
import superagent from 'superagent'
import {Stream, fromPromise} from 'most'
import {create} from '@most/create'

export function fetch(
  input: string|RequestWithHeaders,
  init?: RequestOptions,
  abortCallback?: (req: Request) => void
): Stream<any> {

  if (!(input instanceof Request)) {
    input = new Request(input, init) as RequestWithHeaders
  }

  let req = superagent[input.method.toLowerCase()](input.url)

  for (let header of input.headers) {
    req.set(header[0], header[1])
  }

  return fromPromise(input.text())
  .flatMap(body => {
    req.send(body)

    return create((add, end, error) => {
      req.end(function(err: any, res: any) {
        if (err) {
          let response = new Response(err, res) as ErrorResponse
          response.message = response.statusText
          return error(response)
        }

        if (res.noContent === true) {
          add(new Response())
          return end()
        }

        let response = new Response(res.text, res)

        add(response)
        end()
      })

      return function abort() {
        req.abort()
        abortCallback(req)
      }
    })
  })
}
