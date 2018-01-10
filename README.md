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
import { RxRest, RxRestConfig } from 'rxrest'

const config = new RxRestConfig()
config.baseURL = 'http://localhost/api'

const rxrest = new RxRest(config)
rxrest.all('cars')
.get()
.subscribe((cars: Car[]) => {
  /**
   * `cars` is:
   * RxRestCollection [
   *   RxRestItem { name: 'Polo', id: 1, brand: 'Audi' },
   *   RxRestItem { name: 'Golf', id: 2, brand: 'Volkswagen' }
   * ]
   */

  cars[0].brand = 'Volkswagen'

  cars[0].save()
  .subscribe(result => {
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
-  [One-event Stream instead of multiple events](#one-event-stream-instead-of-multiple-events)
-  [Object state (`$fromServer`, `$pristine`, `$uuid`)](#object-state-fromserver-pristine-uuid)
-  [Configuration](#configuration)
-  [Interceptors](#interceptors)
-  [Handlers](#handlers)
-  [API](#api)
-  [Typings](#typings)
-  [Angular 2 configuration example](#angular-2-configuration-example)

## Technical concepts

This library uses a [`fetch`-like](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch) library to perform HTTP requests. It has the same api as fetch but uses XMLHttpRequest so that requests have a cancellable ability! It also makes use of [`Proxy`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Proxy) and implements an [`Iterator`](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/iterateurs_et_generateurs) on `RxRestCollection`.

Because it uses fetch, the RxRest library uses it's core concepts. It will add an `Object` compatibility layer to [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams) for query parameters and [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers).
It is also familiar with `Body`-like object, as `FormData`, `Response`, `Request` etc.

This script depends on `superagent` (for a easier XMLHttpRequest usage, compatible in both node and the browser) and `rxjs` for the reactive part.

<sup>[^ Back to menu](#menu)</sup>

## Promise compatibility

Just use the `toPromise` utility:

```javascript

rxrest.one('foo')
.get()
.toPromise()
.then(item => {
  console.log(item)
})
```

<sup>[^ Back to menu](#menu)</sup>
## One-event Stream instead of multiple events

Sometimes, you may want RxRest to emit one event per item in the collection:

To do so, just call `asIterable(false)`:

```javascript
rxrest.all('cars')
.asIterable(false)
.get()
// next() is called with every car available
.subscribe((e) => {})
```

Or use the second argument of `.all` instead of `asIterable`:

```javascript
rxrest.all('cars', false)
.get()
// next() is called with every car available
.subscribe((e) => {})
```

## Object state (`$fromServer`, `$pristine`, `$uuid`)

Thanks to the Proxy, we can get metadata informations about the current object and it's state.

When you instantiate an object, it's `$pristine`. When it gets modified it's dirty:

```javascript
const rxrest = new RxRest()
const car = rxrest.one('cars', 1)

assert(car.$prisine === true)

car.brand = 'Ford'

assert(car.$prisine === false)
```

You can also check that the item comes from the server:

```javascript
const rxrest = new RxRest()
const car = rxrest.one('cars', 1)

assert(car.$fromServer === false) // we just instantiated it in the client

car.save()
.subscribe((car) => {
  assert(car.$fromServer === true) //now it's from the server
  assert(car.$prisine === true) //it's also pristine!
})
```

<sup>[^ Back to menu](#menu)</sup>
## Configuration

Setting up `RxRest` is done via `RxRestConfiguration`:

```javascript
const config = new RxRestConfiguration()
```

#### `baseURL`

It is the base url prepending your routes. For example :

```javascript
//set the url
config.baseURL = 'http://localhost/api'

const rxrest = new RxRest(config)
//this will request GET http://localhost/api/cars/1
rxrest.one('cars', 1)
.get()
```

#### `identifier='id'`

This is the key storing your identifier in your api objects. It defaults to `id`.

```javascript
config.identifier = '@id'

const rxrest = new RxRest(config)
rxrest.one('cars', 1)

> RxRestItem { '@id': 1 }
```

#### `headers`

You can set headers through the configuration, but also change them request-wise:

```javascript
config.headers
config.headers.set('Authorization', 'foobar')
config.headers.set('Content-Type', 'application/json')

const rxrest = new RxRest(config)

// Performs a GET request on /cars/1 with Authorization and an `application/json` content type header
rxrest.one('cars', 1).get()

// Performs a POST request on /cars with Authorization and an `application/x-www-form-urlencoded` content type header
rxrest.all('cars')
.post(new FormData(), null, {'Content-Type': 'application/x-www-form-urlencoded'})
```

#### `queryParams`

You can set query parameters through the configuration, but also change them request-wise:

```javascript
config.queryParams.set('bearer', 'foobar')

const rxrest = new RxRest(config)

// Performs a GET request on /cars/1?bearer=foobar
rxrest.one('cars', 1).get()

// Performs a GET request on /cars?bearer=barfoo
rxrest.all('cars')
.get({bearer: 'barfoo'})
```

#### `uuid`

It tells RxRest to add an uuid to every resource. This is great if you need a unique identifier that's not related to the data of a collection (useful in forms):

```javascript
//set the url
config.uuid = true

const rxrest = new RxRest(config)
rxrest.one('cars', 1)
.get()
.subscribe((car: Car) => {
  console.log(car.$uuid)
})
```

Also works in a non-`$fromServer` resource:

```
const car = rxrest.fromObject('cars')
console.log(car.$uuid)
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
config.requestInterceptors.push(function(request) {
  request.headers.set('foo', 'bar')
})

// This alters the body (note that ResponseBodyHandler below is more appropriate to do so)
config.responseInterceptors.push(function(response) {
  return response.text(
  .then(data => {
    data = JSON.parse(data)
    data.foo = 'bar'
    //We can read the body only once (see Body.bodyUsed), here we return a new Response
    return new Response(JSON.stringify(body), response)
  })
})

// Performs a GET request with a 'foo' header having `bar` as value
const rxrest = new RxRest(config)

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
config.requestBodyHandler = function(body) {
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
 * should return Promise<{body: any, metadata: any}>
 */
config.responseBodyHandler = function(body) {
  return body.text()
  .then(text => {
    return {body: text ? JSON.parse(text) : null, metadata: null}
  })
}
```

In the `responseBodyHandler`, you can note that we're returning an object containing:

1. `body` - the javascript Object or Array that will be transformed in a RxRestItem or RxRestCollection
2. `metadata` - an API request sometimes gives us metadata (for example pagination metadata), add it here to be able to retrieve `item.$metadata` later

<sup>[^ Back to menu](#menu)</sup>

## API

There are two prototypes:
  - RxRestItem
  - RxRestCollection - an iterable collection of RxRestItem

### Available on both RxRestItem and RxRestCollection

#### `one(route: string, id: any): RxRestItem`

Creates an RxRestItem on the requested route.

#### `all(route: string, asIterable: boolean = false): RxRestCollection`

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
.subscribe(e => console.log(e))

GET /cars/1?brand=Volkswagen

> RxRestItem<Car> {id: 1, brand: 'Volkswagen', name: 'Polo'}
```

#### `post(body?: BodyParam, queryParams?: Object|URLSearchParams, headers?: Object|Headers): Stream<RxRestItem|RxRestCollection>`

Performs a `POST` request, for example:

```javascript
const car = new Car({brand: 'Audi', name: 'A3'})
rxrest.all('cars').post(car)
.subscribe(e => console.log(e))

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
.subscribe((e: RxRestItem<Car>) => console.log(e.json()))

> {id: 1, brand: 'Volkswagen', name: 'Polo'}
```

#### `plain(): Object|Object[]`

This gives you the original object (ie: not an instance of RxRestItem or RxRestCollection):

```javascript
rxrest.one('cars', 1)
.get()
.subscribe((e: RxRestItem<Car>) => console.log(e.plain()))

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

Interfaces:

```typescript
import { RxRest, RxRestItem, RxRestConfig } from 'rxrest';

const config = new RxRestConfig()
config.baseURL = 'http://localhost'

interface Car {
  id: number;
  name: string;
  model: string;
}

const rxrest = new RxRest(config)

rxrest.one<Car>('/cars', 1)
.get()
.subscribe((item: Car) => {
  console.log(item.model)
  item.model = 'audi'

  item.save()
})
```

If you work with [Hypermedia-Driven Web APIs (Hydra)](http://www.markus-lanthaler.com/hydra/), you can extend a default typing for you items to avoid repetitions:

```typescript
interface HydraItem<T> {
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

To know more about typings and rxrest, please check out [the typings example](https://github.com/soyuka/rxrest/blob/master/test/typings.ts).

<sup>[^ Back to menu](#menu)</sup>

## Angular 2 configuration example

First, let's declare our providers:

```typescript
import { Injectable, NgModule, Component, OnInit } from '@angular/core'
import { RxRest, RxRestConfiguration } from 'rxrest'

@Injectable()
export class AngularRxRestConfiguration extends RxRestConfiguration {
  constructor() {
    super()
    this.baseURL = 'localhost/api'
  }
}

@Injectable()
export class AngularRxRest extends RxRest {
  constructor(config: RxRestConfiguration) {
    super(config)
  }
}

@NgModule({
  providers: [
    {provide: RxRest, useClass: AngularRxRest},
    {provide: RxRestConfiguration, useClass: AngularRxRestConfiguration},
  ]
})
export class SomeModule {
}

```

Then, just inject `RxRest`:

```typescript
export interface Car {
  name: string
}

@Component({
  template: '<ul><li *ngFor="let car of cars | async">{{car.name}}</li></ul>'
})
export class FooComponent implements OnInit {
  constructor(private rxrest: RxRest) {
  }

  ngOnInit() {
    this.cars = this.rxrest.all<Car>('cars', true).get()
  }
}
```

[Full example featuring jwt authentication, errors handling, body parsers for JSON-LD](https://gist.github.com/soyuka/c2e89ebf3c7a33f8d059c567aefd471c)

<sup>[^ Back to menu](#menu)</sup>

## Test

Testing can be done using [`rxrest-assert`](https://github.com/soyuka/rxrest-assert).

## Licence

MIT
