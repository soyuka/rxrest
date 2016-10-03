const {RxRest, RxRestItem, RxRestCollection} = require('../lib/index.js')
const {Observable} = require('rxjs')
const chai = require('chai')
const spies = require('chai-spies')
chai.use(spies)
const expect = chai.expect
const express = require('express')
require('isomorphic-fetch')
global.URLSearchParams = require('urlsearchparams').URLSearchParams
let rxrest

describe('RxRest', function() {
  before(function(cb) {
    const app = express()

    app.get('/test', function(req, res) {
     res.json([{foo: req.query.foo, id: 3}])
    })

    app.get('/test/:id', function(req, res) {
     res.json({foo: req.query.foo, id: parseInt(req.params.id)})
    })

    app.listen(3333, cb)
  })

  beforeEach(function() {
    rxrest = new RxRest()
    rxrest.baseURL = 'http://localhost:3333'
  })

  it('should get one', function(cb) {
    rxrest.one('test', 3)
    .get({foo: 'foo'})
    .subscribe(function(item) {
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'foo', id: 3})
      expect(item).to.have.ownProperty('foo', 'foo')

      item.bar = 'bar'
      delete item.foo

      expect(item.plain()).to.deep.equal({bar: 'bar', id: 3})

      cb()
    })
  })

  it('should get all', function(cb) {
    rxrest.all('test')
    .getList({foo: 'bar'})
    .subscribe(function(values) {
      expect(values).to.be.an.instanceof(RxRestCollection)
      for (let item of values) {
        expect(item).to.be.an.instanceof(RxRestItem)
        expect(item.URL).to.equal('http://localhost:3333/test/3')
      }

      expect(values.URL).to.equal('http://localhost:3333/test')

      expect(values.plain()).to.deep.equal([{foo: 'bar', id: 3}])

      cb()
    })
  })

  it('should add request interceptor', function(cb) {
    let spy = chai.spy(function() {})

    // rxrest.addRequestInterceptor(function(req) {
    //   spy()
    //   req.method = 'FOO'
    //   return Observable.of(req)
    // })
    rxrest.addRequestInterceptor(function(req) {
      return new Promise((resolve, reject) => {
        spy()
        // expect(req.method).to.equal('FOO')
        req.method = 'GET'
        console.log('test2');

        resolve(req)
      })
    })
    // .addRequestInterceptor(function(req) {
    //   spy()
    //   expect(req.method).to.equal('GET')
    //   // req.path += '?foo=foobar'
    //   // console.log(req);
    //   // return req
    // })

    let i = 0

    rxrest.one('test', 3)
    .get()
    .subscribe(function(value) {
      console.log(i++);
      // expect(spy).to.have.been.called.exactly(3)
      console.log(value);

    }, function(err) {
      console.log(i++);
      cb(err)
    }, function() {
      cb()
    })
  })
})
