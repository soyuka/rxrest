RxRest [![Build Status](https://travis-ci.org/soyuka/rxrest.svg?branch=master)](https://travis-ci.org/soyuka/rxrest)
======

> A reactive REST utility

Highly inspirated by [Restangular](https://github.com/mgonto/restangular), this library implements a natural way to interact with a REST API.

## Install

```
npm install rxrest --save
```

## Example

```javascript
const {RxRest} = require('rxrest')

const rxrest = new RxRest()

rxrest.baseURL = 'http://localhost/api'

rxrest.all('cars')
.getList()
.observe(result => {
  console.log(result) // RxRestItem
})
.then(collection => {
  /**
   * `collection` is:
   * RxRestCollection [
   *   RxRestItem { name: 'Polo', id: 1, brand: 'Audi' },
   *   RxRestItem { name: 'Golf', id: 2, brand: 'Volkswagen' }
   * ]
   */

  collection[0].brand = 'Volkswagen'

  collection[0].save()
  .observe(result => {
    console.log(result)
    /**
     * outputs: RxRestItem { name: 'Polo', id: 1, brand: 'Volkswagen' }
     */
  })
})
```

## Menu

-  [Technical concepts](#technical-concepts)
-  [Promise compatibility](#promise-compatibility)
-  [Configuration](#configuration)
-  [Instance lifecycle](#instance-lifecycle)
-  [Interceptors](#interceptors)
-  [Handlers](#handlers)
-  [API](#api)
-  [Typings](#typings)
-  [Angular 2 configuration example](#angular-2-configuration-example)

## Technical concepts

This library uses a [`fetch`-like](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch) library to perform HTTP requests. It has the same api as fetch but uses XMLHttpRequest so that requests have a cancellable ability! It also makes use of [`Proxy`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Proxy) and implements an [`Iterator`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/iterateurs_et_generateurs) on `RxRestCollection`.

Because it uses fetch, the RxRest library uses it's core concepts. It will add an `Object` compatibility layer to [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) for query parameters and [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers).
It is also familiar with `Body`-like object, as `FormData`, `Response`, `Request` etc.

This script depends on `superagent` (for a easier XMLHttpRequest usage, compatible in both node and the browser) and `most.js` for the reactive part.

<sup>[^ Back to menu](#menu)</sup>

## Promise compatibility

Sometimes you don't need to subscribe/observe the response. Mostjs already leverage the feature:

```javascript

rxrest.one('foo')
.get()
.observe(() => {})
.then(item => {
  console.log(item)
})
```

<sup>[^ Back to menu](#menu)</sup>

## Configuration

When setting one of those parameters, it'll be stored globally for every future request made with RxRest.

#### `baseURL`

It is the base url prepending your routes. For example :

```javascript
//set the url
rxrest.baseURL = 'http://localhost/api'

//this will request GET http://localhost/api/car/1
rxrest.one('car', 1)
.get()
```

#### `identifier='id'`

This is the key storing your identifier in your api objects. It defaults to `id`.

```javascript
rxrest.identifier = '@id'

rxrest.one('car', 1)

> RxRestItem { '@id': 1 }
```

#### `headers`

Global headers to add to every request. Those will be overriden by local headers. Accepts an `Object` or an `Headers` instance.

```javascript
const headers = new Headers()
headers.set('Authorization', 'foobar')
headers.set('Content-Type', 'application/json')

// Performs a GET request on /cars/1 with Authorization and an `application/json` content type header
rxrest.one('cars', 1).get()

// Performs a POST request on /cars with Authorization and an `application/x-www-form-urlencoded` content type header
rxrest.all('cars')
.post(new FormData(), null, {'Content-Type': 'application/x-www-form-urlencoded'})
```

#### `queryParams`

Global query parameters to add to every request. Those will be overriden by local query params. Accepts an `Object` or an `URLSearchParams` instance.

```javascript
const params = new URLSearchParams()
params.set('bearer', 'foobar')

// Performs a GET request on /cars/1?bearer=foobar
rxrest.one('cars', 1).get()

// Performs a GET request on /cars?bearer=barfoo
rxrest.all('cars')
.get({bearer: 'barfoo'})
```

<sup>[^ Back to menu](#menu)</sup>

## Instance lifecycle

As a resource evolves through time, when an instance of RxRest is created, it'll always have the same basis.

For example you might try to do something like this:

```javascript
const rxrest = new RxRest()

rxrest.all('buses')
.observe(() => {
  //do something

  //Here, your RxRest item will have the following url: `/buses/cars/1`
  rxrest.one('cars/1')
})
```

If you want that rxrest creates a new instance every time you use `one` or `all`, you should rather use `NewRxRest`:

```javascript
import { RxRest, NewRxRest } from 'rxrest'

const RxRestConfig = new RxRest()
RxRestConfig.baseURL = 'http://localhost/api'

const rxrest = new NewRxRest()

rxrest.all('buses')
.observe(() => {
  //do something on /cars/1
  rxrest.one('cars/1')
})
```

<sup>[^ Back to menu](#menu)</sup>

## Interceptors

You can add custom behaviors on every state of the request. In order those are:
  1. Request
  2. Response
  3. Error

To alter those states, you can add interceptors having the following signature:
  1. `requestInterceptor(request: Request)`
  2. `responseInterceptor(request: Body)`
  3. `errorInterceptor(error: Response)`

Each of those can return a Stream, a Promise, their initial altered value, or be void (ie: return nothing).

For example, let's alter the request and the response:

```javascript
rxrest.requestInterceptors.push(function(request) {
  request.headers.set('foo', 'bar')
})

// This alters the body (note that ResponseBodyHandler below is more appropriate to do so)
rxrest.responseInterceptors.push(function(response) {
  return response.text(
  .then(data => {
    data = JSON.parse(data)
    data.foo = 'bar'
    //We can read the body only once (see Body.bodyUsed), here we return a new Response
    return new Response(JSON.stringify(body), response)
  })
})

// Performs a GET request with a 'foo' header having `bar` as value

rxrest.one('cars', 1)
.get()

> RxRestItem<Car> {id: 1, brand: 'Volkswagen', name: 'Polo', foo: 1}
```

<sup>[^ Back to menu](#menu)</sup>

## Handlers

Handlers allow you to transform the Body before or after a request is issued.

Those are the default values:

```javascript
/**
 * This method transforms the requested body to a json string
 */
rxrest.requestBodyHandler = function(body) {
  if (!body) {
    return undefined
  }

  if (body instanceof FormData || body instanceof URLSearchParams) {
    return body
  }

  return body instanceof RxRestItem ? body.json() : JSON.stringify(body)
}

/**
 * This transforms the response in an Object (ie JSON.parse on the body text)
 * should return Promise<Object|Object[]>
 */
rxrest.responseBodyHandler = function(body) {
  return body.text()
  .then(text => {
    return text ? JSON.parse(text) : null
  })
}
```

[Here is an example](https://gist.github.com/soyuka/f58ae748d7010d625d981d24be6210ae) where handlers are used to parse JSON-Ld in combination with [api-platform](https://github.com/api-platform/api-platform).

<sup>[^ Back to menu](#menu)</sup>

## API

There are two prototypes:
  - RxRestItem
  - RxRestCollection - an iterable collection of RxRestItem

### Available on both RxRestItem and RxRestCollection

#### `one(route: string, id: any): RxRestItem`

Creates an RxRestItem on the requested route.

#### `all(route: string): RxRestCollection`

Creates an RxRestCollection on the requested route

Note that this allows url composition:

```javascript
rxrest.all('cars').one('audi', 1).URL

> cars/audi/1
```

#### `fromObject(route: string, element: Object|Object[]): RxRestItem|RxRestCollection`

Depending on whether element is an `Object` or an `Array`, it returns an RxRestItem or an RxRestCollection.

For example:

```javascript
const car = rxrest.fromObject('cars', {id: 1, brand: 'Volkswagen', name: 'Polo'})

> RxRestItem<Car> {id: 1, brand: 'Volkswagen', name: 'Polo'}

car.URL

> cars/1
```

RxRest automagically binds the id in the route, note that the identifier property is configurable.

#### `get(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `GET` request, for example:

```javascript
rxrest.one('cars', 1).get({brand: 'Volkswagen'})
.observe(e => console.log(e))

GET /cars/1?brand=Volkswagen

> RxRestItem<Car> {id: 1, brand: 'Volkswagen', name: 'Polo'}
```

#### `post(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `POST` request, for example:

```javascript
const car = new Car({brand: 'Audi', name: 'A3'})
rxrest.all('cars').post(car)
.observe(e => console.log(e))

> RxRestItem<Car> {id: 3, brand: 'Audi', name: 'A3'}
```

#### `remove(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `DELETE` request

#### `patch(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `PATCH` request

#### `head(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `HEAD` request

#### `trace(queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `TRACE` request

#### `request(method: string, body?: BodyParam): Stream<RxRestItem|RxRestCollection>`

This is useful when you need to do a custom request, note that we're adding query parameters and headers

```javascript
rxrest.all('cars/1/audi')
.setQueryParams({foo: 'bar'})
.setHeaders({'Content-Type': 'application/x-www-form-urlencoded'})
.request('GET')
```

This will do a `GET` request on `cars/1/audi?foo=bar` with a `Content-Type` header having a `application/x-www-form-urlencoded` value.

#### `json(): string`

Output a `JSON` string of your RxRest element.

```javascript
rxrest.one('cars', 1)
.get()
.observe((e: RxRestItem<Car>) => console.log(e.json()))

> {id: 1, brand: 'Volkswagen', name: 'Polo'}
```

#### `plain(): Object|Object[]`

This gives you the original object (ie: not an instance of RxRestItem or RxRestCollection):

```javascript
rxrest.one('cars', 1)
.get()
.observe((e: RxRestItem<Car>) => console.log(e.plain()))

> {id: 1, brand: 'Volkswagen', name: 'Polo'}
```

#### `clone(): RxRestItem|RxRestCollection`

Clones the current instance to a new one.

### RxRestCollection

#### `getList(): Stream<RxRestCollection>`

Just a reference to Restangular ;). It's an alias to `get()`.

### RxRestItem

#### `save(): RxRestCollection`

Do a `POST` or a `PUT` request according to whether the resource came from the server or not. This is due to an internal property `fromServer`, which is set when parsing the request result.

<sup>[^ Back to menu](#menu)</sup>

## Typings

Interfaces inheritance:

```typescript
import { NewRxRest } from 'rxrest';
import { RxRestItemInterface } from 'rxrest/typings/main'

interface Car extends RxRestItemInterface<Car> {
  id: number;
  name: string;
  model: string;
}

const rxrest = new NewRxRest()

rxrest.one('/cars', 1)
.get()
.observe((item: Car) => {
  console.log(item.model)
  item.model = 'audi'

  item.save()
})
```

If you work with [Hypermedia-Driven Web APIs (Hydra)](http://www.markus-lanthaler.com/hydra/), you can extend a default typing for you items to avoid repetitions:

```typescript
interface HydraItem<T> extends RxRestItemInterface<T> {
  '@id': string;
  '@context': string;
  '@type': string;
}

interface Car extends HydraItem<Car> {
  name: string;
  model: Model;
  color: string;
}

interface Model extends HydraItem<Model> {
  name: string;
}
```

<sup>[^ Back to menu](#menu)</sup>

## Angular 2 configuration example

```javascript
import { ApplicationRef } from '@angular/core';
import { RxRest, NewRxRest } from 'rxrest'
import { baseURL } from './config'

const rxrest = new RxRest()
rxrest.baseURL = baseURL + '/api'

@NgModule({
  //...
  providers: [
    //...
    {provide: NewRxRest, useClass: NewRxRest},
    {provide: 'RxRestInstance', useValue: rxrest},
  ]
})
```

<sup>[^ Back to menu](#menu)</sup>

## Test

Testing can be done using [`rxrest-assert`](https://github.com/soyuka/rxrest-assert).

## Licence

MIT
