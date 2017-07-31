/// <reference path="../superagent.d.ts" />
/// <reference path="../src/interfaces.d.ts" />
import { RxRest, RxRestCollection, RxRestConfiguration, RxRestItem } from '../src/index'

const configuration = new RxRestConfiguration()
const rxrest = new RxRest(configuration)

interface Foo {
  id: number
}

interface Bar extends RxRestItem<Bar> {
  id: number
  foo: string
}

const foo: Foo = {id: 1}

// Retrieve a collection, when the second argument is "true", the stream is Stream<Foo[]>
rxrest.all<Foo>('foos', true).get()
// Adding the RxRestCollection<Foo> type so that `e.$metadata` is a known property
.observe((e: Foo[] & RxRestCollection<Foo>) => {
  console.log(e.filter(e => {}))
  console.log(e.$metadata)
})
.then((e: Foo[]) => {
})

// Retrieve a collection, the stream is Stream<Foo>
rxrest.all<Foo>('foos').get()
.observe((e: Foo) => {
  console.log(e)
})
// Still, the promise returns a collection
.then((e: Foo[]) => {
})

rxrest.one<Foo>('foos', 1).get()
.observe((e: Foo) => {
  console.log(e)
})
.then((e: Foo) => {
})

// When using fromObject you have to say if you're expecting a collection or an item
let t = (rxrest.fromObject<Foo>('foos', foo) as RxRestItem<Foo>)
.get()
.observe((e: Foo) => {})
.then((e: Foo) => {})

let e = (rxrest.fromObject<Foo>('foos', [foo]) as RxRestCollection<Foo>)
.get()
.observe((e: Foo) => {})
.then((e: Foo) => {})


let f  = rxrest.one<Foo>('foos', 1)
// f is Foo
console.log(f.id)
// f is RxRestItem<foo>
console.log(f.$fromServer)

// clone is Foo & RxRestItem<Foo>
let fclone = f.clone()
console.log(fclone.$fromServer)
console.log(fclone.id)

// Bar extends rxrestitem
let x: Bar = {id: 1, foo: ''} as Bar
let z = rxrest.fromObject<Bar>('bars', x) as Bar
console.log(z.clone().plain())

