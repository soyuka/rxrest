'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('rxjs/add/observable/fromPromise');
require('rxjs/add/operator/mergeMap');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/concatMap');
require('rxjs/add/operator/catch');
require('rxjs/add/observable/of');
var superagent = require('superagent');
var Observable = require('rxjs/Observable');
var operators = require('rxjs/operators');
var fromPromise$1 = require('rxjs/observable/fromPromise');
var _throw$1 = require('rxjs/observable/throw');
var of$1 = require('rxjs/observable/of');

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var RxRestProxyHandler = function () {
    function RxRestProxyHandler(target) {
        classCallCheck(this, RxRestProxyHandler);

        this.$internal = [];
        this.$instance = target;
        do {
            this.$internal = this.$internal.concat(Object.getOwnPropertyNames(target), Object.getOwnPropertySymbols(target));
        } while (target = Object.getPrototypeOf(target));
    }

    createClass(RxRestProxyHandler, [{
        key: 'getPrototypeOf',
        value: function getPrototypeOf(target) {
            return Object.getPrototypeOf(this.$instance);
        }
    }, {
        key: 'defineProperty',
        value: function defineProperty$$1(target, p, attributes) {
            if (~this.$internal.indexOf(p)) {
                return true;
            }
            Object.defineProperty(target, p, attributes);
            return true;
        }
    }, {
        key: 'deleteProperty',
        value: function deleteProperty(target, p) {
            return delete target[p];
        }
    }, {
        key: 'set',
        value: function set$$1(target, p, value, receiver) {
            if (~this.$internal.indexOf(p)) {
                this.$instance[p] = value;
                return true;
            }
            if (this.$instance.$pristine === true && target[p] !== value) {
                this.$instance.$pristine = false;
            }
            target[p] = value;
            return true;
        }
    }, {
        key: 'get',
        value: function get$$1(target, p, receiver) {
            if (~this.$internal.indexOf(p)) {
                return this.$instance[p];
            }
            return target[p];
        }
    }]);
    return RxRestProxyHandler;
}();

function objectToMap(map, item) {
    for (var key in item) {
        if (Array.isArray(item[key])) {
            for (var i = 0; i < item[key].length; i++) {
                map.append(key, item[key][i]);
            }
        } else {
            map.append(key, item[key]);
        }
    }
    return map;
}
/**
 * UUID generator https://gist.github.com/jed/982883
 */
function uuid() {
    var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    for (; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-') {}
    return b;
}

function fetch(input, init, abortCallback) {
    if (!(input instanceof Request)) {
        input = new Request(input, init);
    }
    var req = superagent[input.method.toLowerCase()](input.url);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = input.headers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var header = _step.value;

            req.set(header[0], header[1]);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return Observable.Observable.fromPromise(input.text()).mergeMap(function (body) {
        req.send(body);
        return Observable.Observable.create(function (observer) {
            req.end(function (err, res) {
                if (err) {
                    var _response = new Response(err, res);
                    _response.message = _response.statusText;
                    return observer.error(_response);
                }
                if (res.noContent === true) {
                    observer.next(new Response());
                    return observer.complete();
                }
                res.url = input.url;
                var response = new Response(res.text, res);
                observer.next(response);
                observer.complete();
            });
            return function abort() {
                req.abort();
                if (abortCallback) {
                    abortCallback(req);
                }
            };
        });
    });
}

/**
 * RxRestConfiguration
 */

var RxRestConfiguration$$1 = function () {
    function RxRestConfiguration$$1() {
        classCallCheck(this, RxRestConfiguration$$1);

        this.$headers = new Headers();
        this.$queryParams = new URLSearchParams();
        this.identifier = 'id';
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];
        this.abortCallback = function () {
            return null;
        };
        this.uuid = false;
        this.fetch = fetch;
    }
    /**
     * requestBodyHandler
     * JSONify the body if it's an `RxRestItem` or an `Object`
     *
     * @param {FormData|URLSearchParams|Body|Blob|undefined} body
     * @returns {any}
     */


    createClass(RxRestConfiguration$$1, [{
        key: '_requestBodyHandler',
        value: function _requestBodyHandler(body) {
            if (!body) {
                return undefined;
            }
            if (body instanceof FormData || body instanceof URLSearchParams) {
                return body;
            }
            return body instanceof RxRestItem ? body.json() : JSON.stringify(body);
        }
        /**
         * responseBodyHandler
         * transforms the response to a json object
         *
         * @param {Response} body
         * @reject when response is an error
         * @returns {Promise<any>}
         */

    }, {
        key: '_responseBodyHandler',
        value: function _responseBodyHandler(body) {
            return body.text().then(function (text) {
                return { body: text ? JSON.parse(text) : null, metadata: null };
            });
        }
    }, {
        key: 'responseBodyHandler',
        get: function get$$1() {
            return this._responseBodyHandler;
        },
        set: function set$$1(responseBodyHandler) {
            this._responseBodyHandler = responseBodyHandler;
        }
    }, {
        key: 'requestBodyHandler',
        get: function get$$1() {
            return this._requestBodyHandler;
        },
        set: function set$$1(requestBodyHandler) {
            this._requestBodyHandler = requestBodyHandler;
        }
        /**
         * set baseURL
         *
         * @param {String} base
         * @returns
         */

    }, {
        key: 'baseURL',
        set: function set$$1(base) {
            if (base.charAt(base.length - 1) !== '/') {
                base += '/';
            }
            this.$baseURL = base;
        }
        /**
         * get baseURL
         *
         * @returns {string}
         */
        ,
        get: function get$$1() {
            return this.$baseURL;
        }
        /**
         * Set global query params
         * @param {Object|URLSearchParams} params
         */

    }, {
        key: 'queryParams',
        set: function set$$1(params) {
            if (params instanceof URLSearchParams) {
                this.$queryParams = params;
                return;
            }
            if (typeof params === 'string') {
                this.$queryParams = new URLSearchParams(params);
                return;
            }
            this.$queryParams = objectToMap(new URLSearchParams(), params);
        }
        /**
         * Get global query params
         * @return {URLSearchParams}
         */
        ,
        get: function get$$1() {
            return this.$queryParams;
        }
        /**
         * set global headers
         * @param {Object|Headers} params
         */

    }, {
        key: 'headers',
        set: function set$$1(params) {
            if (params instanceof Headers) {
                this.$headers = params;
                return;
            }
            this.$headers = objectToMap(new Headers(), params);
        }
        /**
         * Get global headers
         * @return Headers
         */
        ,
        get: function get$$1() {
            return this.$headers;
        }
    }]);
    return RxRestConfiguration$$1;
}();

// const fromPromise = function(promise: Promise<any>) {
//   return Observable.create((observer: Observer<any>) => {
//     promise
//     .then((v) => {
//       observer.next(v)
//       observer.complete()
//     })
//     .catch(observer.error)
//   })
// }

var RxRest = function () {
    /**
     * constructor
     *
     * @param {String} [route] the resource route
     */
    function RxRest() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new RxRestConfiguration$$1();
        var route = arguments[1];
        var metadata = arguments[2];
        classCallCheck(this, RxRest);

        this.$fromServer = false;
        this.$asIterable = true;
        this.$queryParams = new URLSearchParams();
        this.$headers = new Headers();
        this.$pristine = true;
        this.$route = route === undefined ? [] : [].concat(toConsumableArray(route));
        this.config = config;
        this.$metadata = metadata;
        if (config.uuid) {
            this.$uuid = uuid();
        }
    }

    createClass(RxRest, [{
        key: 'addRoute',
        value: function addRoute(route) {
            this.$route.push.apply(this.$route, route.split('/'));
        }
        /**
         * one
         *
         * @param {String} route
         * @param {any} id
         * @returns {RxRestItem}
         */

    }, {
        key: 'one',
        value: function one(route, id) {
            this.addRoute(route);
            var o = {};
            if (id) {
                o[this.config.identifier] = id;
            }
            return new RxRestItem(this.$route, o, this.config);
        }
        /**
         * all
         *
         * @param {String} route
         * @param {boolean} [asIterable=true] - forces the next request to return an Observable<Array>
         *                               instead of emitting multiple events
         * @returns {RxRestCollection}
         */

    }, {
        key: 'all',
        value: function all(route) {
            var asIterable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            this.addRoute(route);
            return new RxRestCollection(this.$route, undefined, this.config, null, asIterable);
        }
        /**
         * asIterable - sets the flag $asIterable
         * instead of emitting multiple events
         *
         * @returns {self}
         */

    }, {
        key: 'asIterable',
        value: function asIterable() {
            var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this.$asIterable = value;
            return this;
        }
        /**
         * fromObject
         *
         * @param {String} route
         * @param {Object|Object[]} element
         * @returns {RxRestItem|RxRestCollection}
         */

    }, {
        key: 'fromObject',
        value: function fromObject(route, element) {
            this.addRoute(route);
            if (Array.isArray(element)) {
                return new RxRestCollection(this.$route, element, this.config);
            }
            return new RxRestItem(this.$route, element, this.config);
        }
        /**
         * @access private
         * @param {BodyParam} body
         * @return {BodyParam|RxRestItem}
         */

    }, {
        key: 'withBody',
        value: function withBody(body) {
            return body ? body : this;
        }
        /**
         * post
         *
         * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'post',
        value: function post(body, queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('POST', this.withBody(body));
        }
        /**
         * remove
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'remove',
        value: function remove(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('DELETE');
        }
        /**
         * get
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'get',
        value: function get$$1(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('GET');
        }
        /**
         * put
         *
         * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'put',
        value: function put(body, queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('PUT', this.withBody(body));
        }
        /**
         * patch
         *
         * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'patch',
        value: function patch(body, queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('PATCH', this.withBody(body));
        }
        /**
         * head
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'head',
        value: function head(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('HEAD');
        }
        /**
         * trace
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'trace',
        value: function trace(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('TRACE');
        }
        /**
         * options
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'options',
        value: function options(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('OPTIONS');
        }
        /**
         * URL
         *
         * @returns {string}
         */

    }, {
        key: 'setQueryParams',

        /**
         * Sets local query params useful to add params to a custom request
         * @param {Object|URLSearchParams}
         * @return this
         */
        value: function setQueryParams(params) {
            this.queryParams = params;
            return this;
        }
        /**
         * Sets local headers useful to add headers to a custom request
         * @param {Object|URLSearchParams}
         * @return this
         */

    }, {
        key: 'setHeaders',
        value: function setHeaders(params) {
            this.headers = params;
            return this;
        }
        /**
         * Get local query params
         * @return URLSearchParams
         */

    }, {
        key: 'expandInterceptors',

        /**
         * expandInterceptors
         *
         * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
         * @returns {Observable<any>} fn
         */
        value: function expandInterceptors(interceptors) {
            return function (origin) {
                return interceptors.reduce(function (obs, interceptor) {
                    return obs.concatMap(function (value) {
                        var result = interceptor(value);
                        if (result === undefined) {
                            return of$1.of(value);
                        }
                        if (result instanceof Promise) {
                            return fromPromise$1.fromPromise(result);
                        }
                        if (result instanceof Observable.Observable) {
                            return result;
                        }
                        return of$1.of(result);
                    });
                }, of$1.of(origin));
            };
        }
        /**
         * request
         *
         * @param {string} method
         * @param {RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object} [body]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'request',
        value: function request(method, body) {
            var _this = this;

            var requestOptions = {
                method: method,
                headers: this.requestHeaders,
                body: this.config.requestBodyHandler(body)
            };
            var request = new Request(this.URL + this.requestQueryParams, requestOptions);
            var stream = Observable.Observable.of(request).pipe(operators.mergeMap(this.expandInterceptors(this.config.requestInterceptors)), operators.mergeMap(function (request) {
                return _this.config.fetch(request, null, _this.config.abortCallback);
            }), operators.mergeMap(this.expandInterceptors(this.config.responseInterceptors)), operators.mergeMap(function (body) {
                return fromPromise$1.fromPromise(_this.config.responseBodyHandler(body));
            }), operators.mergeMap(function (_ref) {
                var body = _ref.body,
                    metadata = _ref.metadata;

                if (!Array.isArray(body)) {
                    var item = void 0;
                    if (_this instanceof RxRestItem) {
                        item = _this;
                        item.element = body;
                        item.$metadata = metadata;
                    } else {
                        item = new RxRestItem(_this.$route, body, _this.config, metadata);
                    }
                    item.$fromServer = true;
                    item.$pristine = true;
                    return Observable.Observable.create(function (observer) {
                        observer.next(item);
                        observer.complete();
                    });
                }
                var collection = new RxRestCollection(_this.$route, body.map(function (e) {
                    var item = new RxRestItem(_this.$route, e, _this.config, metadata);
                    item.$fromServer = true;
                    item.$pristine = true;
                    return item;
                }), _this.config, metadata);
                collection.$pristine = true;
                return Observable.Observable.create(function (observer) {
                    if (_this.$asIterable) {
                        observer.next(collection);
                    } else {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = collection[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _item = _step.value;

                                observer.next(_item);
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                    observer.complete();
                });
            }), operators.catchError(function (body) {
                return of$1.of(body).pipe(operators.mergeMap(_this.expandInterceptors(_this.config.errorInterceptors)), operators.mergeMap(function (body) {
                    return _throw$1._throw(body);
                }));
            }));
            return stream;
        }
    }, {
        key: 'URL',
        get: function get$$1() {
            return '' + this.config.baseURL + this.$route.join('/');
        }
        /**
         * set local query params
         * @param {Object|URLSearchParams} params
         */

    }, {
        key: 'queryParams',
        set: function set$$1(params) {
            if (!params) {
                return;
            }
            if (params instanceof URLSearchParams) {
                this.$queryParams = params;
                return;
            }
            this.$queryParams = objectToMap(new URLSearchParams(), params);
        },
        get: function get$$1() {
            return this.$queryParams;
        }
        /**
         * Get request query params
         * Combine local and global query params
         * Local query params are overriding global params
         * @return {String}
         */

    }, {
        key: 'requestQueryParams',
        get: function get$$1() {
            var params = new URLSearchParams();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.config.queryParams[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var param = _step2.value;

                    params.append(param[0], param[1]);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.queryParams[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _param = _step3.value;

                    params.append(_param[0], _param[1]);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var str = params.toString();
            if (str.length) {
                return '?' + str;
            }
            return '';
        }
        /**
         * Set local headers
         * @param {Object|Headers} params
         */

    }, {
        key: 'headers',
        set: function set$$1(params) {
            if (!params) {
                return;
            }
            if (params instanceof Headers) {
                this.$headers = params;
                return;
            }
            this.$headers = objectToMap(new Headers(), params);
        }
        /**
         * Get local headers
         * @return Headers
         */
        ,
        get: function get$$1() {
            return this.$headers;
        }
        /**
         * get request Headers
         * Combine local and global headers
         * Local headers are overriding global headers
         *
         * @returns {Headers}
         */

    }, {
        key: 'requestHeaders',
        get: function get$$1() {
            var headers = new Headers();
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = this.headers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var header = _step4.value;

                    headers.append(header[0], header[1]);
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this.config.headers[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _header = _step5.value;

                    headers.append(_header[0], _header[1]);
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return headers;
        }
    }]);
    return RxRest;
}();

var RxRestItem = function (_AbstractRxRest) {
    inherits(RxRestItem, _AbstractRxRest);

    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T} [element]
     * @return {Proxy}
     */
    function RxRestItem(route, element, config, metadata) {
        var _ret;

        classCallCheck(this, RxRestItem);

        var _this = possibleConstructorReturn(this, (RxRestItem.__proto__ || Object.getPrototypeOf(RxRestItem)).call(this, config, route, metadata));

        _this.$element = {};
        if (element !== undefined) {
            _this.element = element;
        }
        var proxy = new Proxy(_this.$element, new RxRestProxyHandler(_this));
        return _ret = proxy, possibleConstructorReturn(_this, _ret);
    }
    /**
     * save - POST or PUT according to $fromServer value
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Observable<RxRestItem|RxRestCollection>}
     */


    createClass(RxRestItem, [{
        key: 'save',
        value: function save(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request(this.$fromServer === true ? 'PUT' : 'POST', this);
        }
        /**
         * set element
         *
         * @param {T} element
         */

    }, {
        key: 'plain',

        /**
         * get plain object
         *
         * @return {T}
         */
        value: function plain() {
            return this.element;
        }
        /**
         * Get json string
         * @return {string}
         */

    }, {
        key: 'json',
        value: function json() {
            return JSON.stringify(this.plain());
        }
        /**
         * Clone
         * @return {RxRestItem<T>}
         */

    }, {
        key: 'clone',
        value: function clone() {
            var route = this.$route;
            if (this.$element[this.config.identifier]) {
                route = route.slice(0, this.$route.length - 1);
            }
            var clone = new RxRestItem(route, this.$element, this.config);
            clone.$fromServer = this.$fromServer;
            return clone;
        }
    }, {
        key: 'element',
        set: function set$$1(element) {
            for (var i in element) {
                if (i === this.config.identifier && !this.$element[this.config.identifier]) {
                    this.$route.push('' + element[i]);
                }
                this.$element[i] = element[i];
            }
        }
        /**
         * get element
         *
         * @return {T}
         */
        ,
        get: function get$$1() {
            return this.$element;
        }
    }]);
    return RxRestItem;
}(RxRest);

var RxRestCollection = function (_AbstractRxRest2) {
    inherits(RxRestCollection, _AbstractRxRest2);

    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T[]|RxRestItem<T>[]]} [elements]
     * @return {Proxy}
     */
    function RxRestCollection(route, elements, config, metadata) {
        var _ret2;

        var asIterable = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
        classCallCheck(this, RxRestCollection);

        var _this2 = possibleConstructorReturn(this, (RxRestCollection.__proto__ || Object.getPrototypeOf(RxRestCollection)).call(this, config, route, metadata));

        _this2.$elements = [];
        if (elements !== undefined) {
            _this2.elements = elements.map(function (e) {
                return e instanceof RxRestItem ? e.clone() : new RxRestItem(_this2.$route, e);
            });
        }
        _this2.$asIterable = asIterable;
        var proxy = new Proxy(_this2.$elements, new RxRestProxyHandler(_this2));
        return _ret2 = proxy, possibleConstructorReturn(_this2, _ret2);
    }

    createClass(RxRestCollection, [{
        key: Symbol.iterator,
        value: function value() {
            var index = 0;
            var elements = this.$elements;
            return {
                next: function next() {
                    return index < elements.length ? { value: elements[index++], done: false } : { value: undefined, done: true };
                }
            };
        }
        /**
         * getList - fetch a collection
         *
         * @param {Object|URLSearchParams} [queryParams]
         * @param {Object|Headers} [headers]
         * @returns {Observable<RxRestItem|RxRestCollection>}
         */

    }, {
        key: 'getList',
        value: function getList(queryParams, headers) {
            this.queryParams = queryParams;
            this.headers = headers;
            return this.request('GET');
        }
        /**
         * set elements
         *
         * @param {T[]} elements
         */

    }, {
        key: 'plain',

        /**
         * plain
         *
         * @returns {T[]}
         */
        value: function plain() {
            return this.elements.map(function (e) {
                return e.plain();
            });
        }
        /**
         * json
         *
         * @returns {String}
         */

    }, {
        key: 'json',
        value: function json() {
            return JSON.stringify(this.plain());
        }
        /**
         * clone
         *
         * @returns {RxRestCollection}
         */

    }, {
        key: 'clone',
        value: function clone() {
            return new RxRestCollection(this.$route, this.$elements, this.config);
        }
    }, {
        key: 'elements',
        set: function set$$1(elements) {
            this.$elements = elements;
            this.length = elements.length;
        }
        /**
         * get elements
         * @return {RxRestItem<T>[]}
         */
        ,
        get: function get$$1() {
            return this.$elements;
        }
    }]);
    return RxRestCollection;
}(RxRest);

var RxRest$1 = function () {
    function RxRest$$1(config) {
        classCallCheck(this, RxRest$$1);

        this.config = config;
    }

    createClass(RxRest$$1, [{
        key: 'one',
        value: function one(route, id) {
            var r = new RxRest(this.config);
            return r.one.call(r, route, id);
        }
    }, {
        key: 'all',
        value: function all(route) {
            var asIterable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var r = new RxRest(this.config);
            return r.all.call(r, route, asIterable);
        }
    }, {
        key: 'fromObject',
        value: function fromObject(route, element) {
            var r = new RxRest(this.config);
            return r.fromObject.call(r, route, element);
        }
    }]);
    return RxRest$$1;
}();

exports.RxRestConfiguration = RxRestConfiguration$$1;
exports.RxRestItem = RxRestItem;
exports.RxRestCollection = RxRestCollection;
exports.RxRest = RxRest$1;
//# sourceMappingURL=rxrest.js.map
