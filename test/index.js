const {combine, of, from} = require('most')
const chai = require('chai')
const most = require('most')
const spies = require('chai-spies')
chai.use(spies)
const expect = chai.expect
const express = require('express')

const {Headers, Response, Request} = require('node-fetch');
require('./urlsearchparamspolyfill.js')

global.Headers = Headers
global.Response = Response
global.Request = Request

global.FormData = require('form-data')

const {RxRestConfiguration, RxRestItem, RxRestCollection, RxRest} = require('../lib/index.js')
const {Observable} = require('rxjs/Rx')

let temp = new RxRestConfiguration()
const fetch = temp.fetch
let rxrest
let config

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

    app.delete('/foobar', function(req, res) {
      res.set('Content-Length', 0).status(204).end()
    })

    app.get('/error', function(req, res) {
      res.status(500).send('fail')
    })

    app.get('/empty', function(req, res) {
      res.status(200).json([])
    })

    app.get('/timeout', function(req, res) {
      setTimeout(() => {
        res.status(504).end()
      }, 100)
    })

    app.listen(3333, cb)
  })

  beforeEach(function() {
    config = new RxRestConfiguration()
    config.baseURL = 'http://localhost:3333'
    expect(config.baseURL).to.equal('http://localhost:3333/')
    config.identifier = 'id'
    expect(config.identifier).to.equal('id')
    rxrest = new RxRest(config)
  })

  it.skip('should use a new instance', function() {
    let i = 0

    return rxrest.all('test')
    .get()
    .observe(e => {})
    .then((data) => {
      data.push(new RxRestItem('test', {id: 5}))

      return from(data.map(item => rxrest.one('test', item.id)))
      .flatMap(item => item.get({foo: 'bar'}))
      .observe(e => {
        if (i === 0) {
          expect(e.id).to.equal(3)
          expect(e.foo).to.equal('bar')
          i++
          return
        }

        expect(e.foo).to.equal('bar')
        expect(e.id).to.equal(5)
      })
    })
  })

  it('should get one', function() {
    config.requestInterceptors.push(function(request) {
      expect(request.headers.has('Accept')).to.be.true
    })

    return rxrest.one('test', 3)
    .get({foo: 'foo'}, {'Accept': 'application/json'})
    .observe(item => {
      expect(item.$fromServer).to.be.true
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'foo', id: 3})
      expect(item).to.have.ownProperty('foo', 'foo')

      item.bar = 'bar'
      delete item.foo

      Object.defineProperty(item, 'foobar', {
        value: 'foobar',
        enumerable: true
      })

      //can't override internal property
      Object.defineProperty(item, '$element', {
        value: 'foobar',
        enumerable: true
      })

      expect(item.plain()).to.deep.equal({bar: 'bar', id: 3, foobar: 'foobar'})

      let clone = item.clone()
      expect(clone.plain()).to.deep.equal({bar: 'bar', id: 3, foobar: 'foobar'})
      expect(clone.$fromServer).to.equal(true)
      expect(clone.URL).to.equal('http://localhost:3333/test/3')
    })
  })

  it('should get one with global parameters', function() {
    config.queryParams.set('foo', 'bar')
    config.headers.set('Accept', 'application/json')

    return rxrest.one('test', 3)
    .get()
    .observe((item) => {
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'bar', id: 3})
      expect(item).to.have.ownProperty('foo', 'bar')
    })
  })

  it('should get one with global parameters (from object)', function() {
    config.queryParams = {foo: 'bar'}
    config.headers = {'Accept': 'application/json'}

    return rxrest.one('test', 3)
    .get()
    .observe((item) => {
      expect(item).to.be.an.instanceof(RxRestItem)
      expect(item.URL).to.equal('http://localhost:3333/test/3')
      expect(item.plain()).to.deep.equal({foo: 'bar', id: 3})
      expect(item).to.have.ownProperty('foo', 'bar')
    })
  })

  it('should get all', function() {
    let params = new URLSearchParams()
    params.set('foo', 'bar')

    let headers = new Headers()
    headers.set('Accept', 'application/json')

    config.requestInterceptors.push(function(request) {
      expect(request.headers.has('Accept')).to.be.true
    })

    return rxrest.all('test')
    .getList(params, headers)
    .observe((item) => {})
    .then(function(values) {
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
    })
  })

  it('should add request interceptor', function() {
    let spy = chai.spy(function() {})

    config.requestInterceptors = [
      function(req) {
        spy()
        req.method = 'FOO'
        return of(req)
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
        return new Request(req.url + '?foo=bar')
      }
    ]

    config.responseInterceptors.push(function(response) {
      return response.text()
      .then(e => {
        let body = JSON.parse(e)
        body.bar = 'foo'
        spy()

        return new Response(JSON.stringify(body), response)
      })
    })

    return rxrest.one('test', 3)
    .get()
    .observe((value) => {
      expect(spy).to.have.been.called.exactly(4)
      expect(value.plain()).to.deep.equal({foo: 'bar', id: 3, bar: 'foo'})
    })
  })

  it('should save a resource', function() {
    config.headers.set('Content-Type', 'application/json')

    return rxrest.one('test', 3)
    .get()
    .flatMap(e => {
      e.bar = 'foo'
      return e.save()
    })
    .observe(e => {
      expect(e).to.deep.equal({bar: 'foo', id: 3, method: 'put'})
    })
  })

  it('should save a resource from object', function() {
    config.headers.set('Content-Type', 'application/json')

    return rxrest.fromObject('test', {foo: 'bar'})
    .save()
    .observe(e => {
      expect(e).to.deep.equal({foo: 'bar', id: 4, method: 'post'})
    })
  })

  it('should save a resource by using post', function() {
    config.headers.set('Content-Type', 'application/json')

    return rxrest.one('test')
    .post({bar: 'foo'})
    .observe(e => {
      expect(e).to.deep.equal({bar: 'foo', id: 4, method: 'post'})
    })
  })

  it('should handle error', function() {
    let spy = chai.spy(function() {})

    config.errorInterceptors.push(function(response) {
      expect(response.status).to.equal(404)
      spy()
    })

    return rxrest.one('404')
    .head()
    .observe(e => {
    })
    .catch((e) => {
      expect(spy).to.have.been.called
      expect(e.status).to.equal(404)
    })
  })

  it('should handle error with promise', function() {
    return rxrest.one('404')
    .head()
    .observe(() => {})
    .then(() => {})
    .catch((e) => {
      expect(e.status).to.equal(404)
    })
  })

  it('should create a collection from an array', function() {
    config.headers.set('Content-Type', 'application/json')

    rxrest.fromObject('test', [{foo: 'bar', id: 3}, {foo: 'foo', id: 4}])
    .map(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
    })
  })

  it('should create a custom request', function() {
    rxrest = rxrest.one('test')
    rxrest.$route = ['test/3']
    return rxrest.request('GET')
    .observe(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
    })
  })

  it('should get one and put', function() {
    return rxrest.one('test', 3)
    .setHeaders({'Content-Type': 'application/json'})
    .get()
    .observe(() => {})
    .then(e => {
      e.foo = 'bar'
      return e.put()
      .observe(function(e) {
        expect(e).to.be.an.instanceof(RxRestItem)
        expect(e.method).to.equal('put')
        expect(e.foo).to.equal('bar')
      })
    })
  })

  it('should change request/response body handlers', function() {
    let spy = chai.spy(function() {})

    config.requestBodyHandler = function(body) {
      spy()
      return undefined
    }

    config.responseBodyHandler = function(body) {
      spy()
      return body.text()
      .then((t) => {
        return {body: JSON.parse(t), metadata: 'foo'}
      })
    }

    return rxrest.one('test', 3)
    .get()
    .observe(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(e.$metadata).to.equal('foo')
      expect(spy).to.have.been.called.exactly(2)
    })
  })

  it('should delete and patch/trace one', function() {
    return rxrest
    .one('test', 3)
    .remove()
    .observe(function(e) {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(e.method).to.equal('delete')
      return combine(e.patch(), e.trace())
    })
  })

  it('should throw non-request errors', function(cb) {
    config.requestInterceptors.push(function(body) {
      throw TypeError('fail')
    })

    rxrest
    .one('test', 3)
    .get()
    .observe(() => {})
    .catch(e => {
      expect(e).to.be.an.instanceof(TypeError)
      cb()
    })
  })

  it('should abort a request', function(cb) {
    config.abortCallback = chai.spy()

    let t = rxrest.all('timeout')

    most.from([0, 1])
    .delay(10)
    .chain(() => t.get())
    .subscribe({
      next: () => cb(new Error('Next called')),
      error: (err) => {
        expect(err.status).to.equal(504)
        expect(config.abortCallback).to.have.been.called
        cb()
      }
    })
  })

  it('should chain query params', function() {
    let spy = chai.spy(function() {})

    config.requestInterceptors = [
      function(request) {
        spy()
        expect(request.headers.get('Content-Type')).to.equal('application/x-www-form-urlencoded')
        expect(request.method).to.equal('GET')
      },
    ]

		return rxrest.all('test')
		.setQueryParams({foo: 'bar'})
		.setHeaders({'Content-Type': 'application/x-www-form-urlencoded'})
		.request('GET')
    .observe(item => {
      expect(item.foo).to.equal('bar')
      expect(spy).to.have.been.called.exactly(1)
    })
  })

  it('should use fetch with a string', function(cb) {
    let promise = null
    fetch('http://localhost:3333/test')
    .observe(e => {
      e.json()
      .then(f => {
        expect(f).to.deep.equal([{id: 3}])
        cb()
      })
    })
  })

  it.skip('should be promise compatible', function() {
    return rxrest.one('test', 3).get()
    .then(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
      return Promise.resolve()
    })
  })

  it('should error properly', function(cb) {
    fetch('http://localhost:3333/error')
    .observe(e => {})
    .catch(e => {
      cb()
    })
  })

  it('should create a resource without id', function() {
    let item = rxrest.one('test')
    item.foo = 'bar'

    return item.save()
    .observe(() => {})
    .then(e => {
      expect(e).to.have.property('foo', 'bar')
      expect(e.$route).to.deep.equal(['test', '4'])
      return e
    })
  })

  it('should work when no response (content-length = 0)', function() {
    let item = rxrest.one('foobar')

    return item.remove()
    .observe(() => {})
    .then((e) => {
      return 'ok'
    })
  })

  it('should handle array query parameters', function() {
    let item = rxrest.one('foobar')

    item.queryParams = {
      'foo[]': [0, 1]
    }

    expect(item.queryParams.toString()).to.equal('foo%5B%5D=0&foo%5B%5D=1')
    expect(item.requestQueryParams.toString()).to.equal('?foo%5B%5D=0&foo%5B%5D=1')
  })

  it('should get end when no results', function(cb) {
    rxrest.all('empty')
    .get()
    .subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        cb()
      }
    })
  })

  it('should work with rxjs switch map and get end event on empty', function(cb) {
		var source = Observable
			.of('v')
			.switchMap(function(x) {
        return rxrest.all('empty').get()
			});

      source.subscribe((v) => {}, () => {}, () => cb())
  })

  it('should get options', function() {
    let spy = chai.spy(function() {})

    config.requestBodyHandler = function(body) {
      spy()
      return undefined
    }

    config.responseBodyHandler = function(body) {
      spy()
      return body.text()
      .then((t) => {
        return {body: t}
      })
    }

    return rxrest.one('test', 3)
    .options()
    .observe(e => {
      expect(e).to.be.an.instanceof(RxRestItem)
      expect(spy).to.have.been.called.exactly(2)
    })
  })
})
