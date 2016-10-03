const test = {
  foo: 'bar'
}

const proxy = new Proxy(test, {
  get (target, poperty) {
    console.log('test get', property);
  },
  set (target, property, value) {
    console.log('test set', property, value);
  }
})

proxy.test = 'test'
