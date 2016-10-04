const {Observable} = require('rxjs')
const chai = require('chai')
const spies = require('chai-spies')
chai.use(spies)
const expect = chai.expect
const express = require('express')

const fetch = require('node-fetch')
global.fetch = fetch
global.Response = fetch.Response
global.Request = fetch.Request
global.Headers = fetch.Headers
global.FormData = require('formdata')
require('./urlsearchparamspolyfill.js')
const {RxRest, RxRestItem, RxRestCollection} = require('../lib/index.js')
let rxrest

const temp = new RxRest()
const RxRestRequestBodyHandler = temp.requestBodyHandler
const RxRestResponseBodyHandler = temp.responseBodyHandler

describe('RxRest', function() {
  before(function(cb) {
    const app = express()
    const bodyParser = require('body-parser')

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))

    app.get('/test', function(req, res) {
     res.json([{foo: req.query.foo, id: 3}])
    })

    app.get('/test/:id', function(req, res) {
      res.json({foo: req.query.foo, id: parseInt(req.params.id)})
    })

    app.post('/test', function(req, res) {
      req.body.method = 'post'
      req.body.id = 4
      return res.status(201).json(req.body)
    })

    app.put('/test/:id', function(req, res) {
      req.body.method = 'put'
      return res.status(200).json(req.body)
    })

    app.head('/404', function(req, res) {
      res.status(404).send('fail')
    })

    app.delete('/test/:id', function(req, res) {
      res.json({'method': 'delete'})
    })

    app.listen(3333, cb)
  })

  beforeEach(function() {
    rxrest = new RxRest()
    rxrest.baseURL = 'http://localhost:3333'
    expect(rxrest.baseURL).to.equal('http://localhost:3333/')
    rxrest.identifier = 'id'
    expect(rxrest.identifier).to.equal('id')
    rxrest.requestInterceptors = []
    rxrest.responseInterceptors = []
    rxrest.errorInterceptors = []
    rxrest.queryParams = new URLSearchParams()
    rxrest.headers = new Headers()
    rxrest.requestBodyHandler = RxRestRequestBodyHandler
    rxrest.responseBodyHandler = RxRestResponseBodyHandler
  })

  it('should get one', function(cb) {
    rxrest.requestInterceptors.push(function(request) {
      expect(request.headers.has('Accept')).to.be.true
    })

    rxrest.one('test', 3)
    .get({foo: 'foo'}, {'Accept': 'application/json'})
    .subscribe(function(item) {
      expect(item.$fromServer).to.be.true
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'foo', id: 3})
      expect(item).to.have.ownProperty('foo', 'foo')

      item.bar = 'bar'
      delete item.foo

      expect(item.plain()).to.deep.equal({bar: 'bar', id: 3})

      let clone = item.clone()
      expect(clone.plain()).to.deep.equal({bar: 'bar', id: 3})
      expect(clone.$fromServer).to.equal(true)
      expect(clone.URL).to.equal('http://localhost:3333/test/3')

      cb()
    }, cb)
  })

  it('should get one with global parameters', function(cb) {
    rxrest.queryParams.set('foo', 'bar')
    rxrest.headers.set('Accept', 'application/json')

    rxrest.one('test', 3)
    .get()
    .subscribe(function(item) {
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'bar', id: 3})
      expect(item).to.have.ownProperty('foo', 'bar')
      expect(item.headers.has('Accept')).to.be.true
      cb()
    }, cb)
  })

  it('should get one with global parameters (from object)', function(cb) {
    rxrest.queryParams = {foo: 'bar'}
    rxrest.headers = {'Accept': 'application/json'}

    rxrest.one('test', 3)
    .get()
    .subscribe(function(item) {
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'bar', id: 3})
      expect(item).to.have.ownProperty('foo', 'bar')
      expect(item.headers.has('Accept')).to.be.true
      cb()
    }, cb)
  })

  it('should get all', function(cb) {
    let params = new URLSearchParams()
    params.set('foo', 'bar')

    let headers = new Headers()
    headers.set('Accept', 'application/json')

    rxrest.requestInterceptors.push(function(request) {
      expect(request.headers.has('Accept')).to.be.true
    })

    rxrest.all('test')
    .getList(params, headers)
    .subscribe(function(values) {

      expect(values).to.be.an.instanceof(RxRestCollection)
      for (let item of values) {
        expect(item).to.be.an.instanceof(RxRestItem)
        expect(item.URL).to.equal('http://localhost:3333/test/3')
        expect(item.$fromServer).to.be.true
      }

      expect(values.URL).to.equal('http://localhost:3333/test')

      expect(values.plain()).to.deep.equal([{foo: 'bar', id: 3}])
      expect(values.json()).to.equal(JSON.stringify([{foo: 'bar', id: 3}]))

      let clone = values.clone()

      expect(clone[0].$fromServer).to.be.true
      expect(clone.plain()).to.deep.equal([{foo: 'bar', id: 3}])

      cb()
    }, cb)
  })

  it('should add request interceptor', function(cb) {
    let spy = chai.spy(function() {})

    rxrest.requestInterceptors = [
      function(req) {
        spy()
        req.method = 'FOO'
        return Observable.of(req)
      },
      function(req) {
        return new Promise((resolve, reject) => {
          spy()
          expect(req.method).to.equal('FOO')
          req.method = 'GET'
          resolve(req)
        })
      },
      function(req) {
        spy()
        expect(req.method).to.equal('GET')
        req.url += '?foo=bar'
        return req
      }
    ]

    rxrest.responseInterceptors.push(function(response) {
      spy()
      expect(response).to.be.an.instanceof(RxRestItem)
      response.bar = 'foo'
    })

    rxrest.one('test', 3)
    .get()
    .subscribe(function(value) {
      expect(spy).to.have.been.called.exactly(4)
      expect(value.plain()).to.deep.equal({foo: 'bar', id: 3, bar: 'foo'})
      cb()
    }, cb)
  })

  it('should save a resource', function(cb) {
    rxrest.headers.set('Content-Type', 'application/json')

    rxrest.one('test', 3)
    .get()
    .flatMap(e => {
      e.bar = 'foo'
      return e.save()
    })
    .subscribe(e => {
      expect(e).to.deep.equal({bar: 'foo', id: 3, method: 'put'})
      cb()
    }, cb)
  })

  it('should save a resource from object', function(cb) {
    rxrest.headers.set('Content-Type', 'application/json')

    rxrest.fromObject('test', {foo: 'bar'})
    .save()
    .subscribe(e => {
      expect(e).to.deep.equal({foo: 'bar', id: 4, method: 'post'})
      cb()
    }, cb)
  })

  it('should save a resource by using post', function(cb) {
    rxrest.headers.set('Content-Type', 'application/json')

    rxrest.one('test')
    .post({bar: 'foo'})
    .subscribe(e => {
      expect(e).to.deep.equal({bar: 'foo', id: 4, method: 'post'})
      cb()
    }, cb)
  })

  it('should handle error', function(cb) {
    let spy = chai.spy(function() {})

    rxrest.errorInterceptors.push(function(response) {
      expect(response.status).to.equal(404)
      spy()
    })

    rxrest.one('404')
    .head()
    .subscribe(e => {
      expect(spy).to.have.been.called
      cb()
    })
  })

  it('should create a collection from an array', function() {
    rxrest.headers.set('Content-Type', 'application/json')

    rxrest.fromObject('test', [{foo: 'bar', id: 3}, {foo: 'foo', id: 4}])
    .map(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
    })
  })

  it('should create a custom request', function(cb) {
    rxrest.$route = ['test/3']
    rxrest.request('GET')
    .subscribe(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
      cb()
    })
  })

  it('should get one and put', function(cb) {
    rxrest.one('test', 3)
    .get()
    .flatMap(e => {
      e.foo = 'bar'
      return e.put()
    })
    .subscribe(function(e) {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(e.method).to.equal('put')
      expect(e.foo).to.equal('bar')
      cb()
    }, cb)
  })

  it('should change request/response body handlers', function(cb) {
    let spy = chai.spy(function() {})

    rxrest.requestBodyHandler = function(body) {
      spy()
      return undefined
    }

    rxrest.responseBodyHandler = function(body) {
      spy()
      return body.text()
    }

    rxrest.one('test', 3)
    .options()
    .subscribe(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(spy).to.have.been.called.exactly(2)
      cb()
    })
  })

  it('should delete and patch/trace one', function(cb) {
    rxrest
    .one('test', 3)
    .remove()
    .subscribe(function(e) {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(e.method).to.equal('delete')
      Observable.concat(
        e.patch(), e.trace()
      )
      .subscribe(function(e) {
        cb()
      }, cb)
    }, cb)
  })
})
