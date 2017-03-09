'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var superagent = _interopDefault(require('superagent'));
var most = require('most');
var _most_create = require('@most/create');

class RxRestProxyHandler {
    constructor(target) {
        this.$internal = [];
        this.$instance = target;
        do {
            this.$internal = this.$internal.concat(Object.getOwnPropertyNames(target), Object.getOwnPropertySymbols(target));
        } while (target = Object.getPrototypeOf(target));
    }
    getPrototypeOf(target) {
        return Object.getPrototypeOf(this.$instance);
    }
    defineProperty(target, p, attributes) {
        if (~this.$internal.indexOf(p)) {
            return true;
        }
        Object.defineProperty(target, p, attributes);
        return true;
    }
    deleteProperty(target, p) {
        return delete target[p];
    }
    set(target, p, value, receiver) {
        if (~this.$internal.indexOf(p)) {
            this.$instance[p] = value;
            return true;
        }
        target[p] = value;
        return true;
    }
    get(target, p, receiver) {
        if (~this.$internal.indexOf(p)) {
            return this.$instance[p];
        }
        return target[p];
    }
}

/**
 * RxRestConfiguration
 */
class RxRestConfiguration {
    constructor() {
        this.identifier = 'id';
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];
        this.headers = new Headers();
        this.queryParams = new URLSearchParams();
        this.abortCallback = () => null;
    }
    /**
     * requestBodyHandler
     * JSONify the body if it's an `RxRestItem` or an `Object`
     *
     * @param {FormData|URLSearchParams|Body|Blob|undefined} body
     * @returns {any}
     */
    requestBodyHandler(body) {
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
    responseBodyHandler(body) {
        return body.text()
            .then(text => {
            return text ? JSON.parse(text) : null;
        });
    }
}

function fetch(input, init, abortCallback) {
    if (!(input instanceof Request)) {
        input = new Request(input, init);
    }
    let req = superagent[input.method.toLowerCase()](input.url);
    for (let header of input.headers) {
        req.set(header[0], header[1]);
    }
    return most.fromPromise(input.text())
        .flatMap(body => {
        req.send(body);
        return _most_create.create((add, end, error) => {
            req.end(function (err, res) {
                if (err) {
                    let response = new Response(err, res);
                    response.message = response.statusText;
                    return error(response);
                }
                if (res.noContent === true) {
                    add(new Response());
                    return end();
                }
                let response = new Response(res.text, res);
                add(response);
                end();
            });
            return function abort() {
                req.abort();
                abortCallback(req);
            };
        });
    });
}

const fromPromise$1 = function (promise) {
    return _most_create.create((add, end, error) => {
        promise
            .then((v) => {
            add(v);
            end();
        })
            .catch(error);
    });
};
function objectToMap(map, item) {
    for (let key in item) {
        if (Array.isArray(item[key])) {
            for (let i = 0; i < item[key].length; i++) {
                map.append(key, item[key][i]);
            }
        }
        else {
            map.append(key, item[key]);
        }
    }
    return map;
}
const Config = new RxRestConfiguration();
class RxRest$$1 {
    /**
     * constructor
     *
     * @param {String} [route] the resource route
     */
    constructor(route) {
        this.$fromServer = false;
        this.$queryParams = new URLSearchParams();
        this.$headers = new Headers();
        this.$route = route === undefined ? [] : [...route];
    }
    addRoute(route) {
        this.$route.push.apply(this.$route, route.split('/'));
    }
    /**
     * one
     *
     * @param {String} route
     * @param {any} id
     * @returns {RxRestItem}
     */
    one(route, id) {
        this.addRoute(route);
        let o = {};
        if (id) {
            o[this.identifier] = id;
        }
        return new RxRestItem(this.$route, o);
    }
    /**
     * all
     *
     * @param {String} route
     * @returns {RxRestCollection}
     */
    all(route) {
        this.addRoute(route);
        return new RxRestCollection(this.$route);
    }
    /**
     * fromObject
     *
     * @param {String} route
     * @param {Object|Object[]} element
     * @returns {RxRestItem|RxRestCollection}
     */
    fromObject(route, element) {
        this.addRoute(route);
        return Array.isArray(element) ?
            new RxRestCollection(this.$route, element) : new RxRestItem(this.$route, element);
    }
    /**
     * @access private
     * @param {BodyParam} body
     * @return {BodyParam|RxRestItem}
     */
    withBody(body) {
        return body ? body : this;
    }
    /**
     * post
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    post(body, queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('POST', this.withBody(body));
    }
    /**
     * remove
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    remove(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('DELETE');
    }
    /**
     * get
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    get(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('GET');
    }
    /**
     * put
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    put(body, queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('PUT', this.withBody(body));
    }
    /**
     * patch
     *
     * @param {Body|Blob|FormData|URLSearchParams|Object|RxRestItem} [body]
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    patch(body, queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('PATCH', this.withBody(body));
    }
    /**
     * head
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    head(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('HEAD');
    }
    /**
     * trace
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    trace(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('TRACE');
    }
    /**
     * options
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    options(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('OPTIONS');
    }
    /**
     * URL
     *
     * @returns {string}
     */
    get URL() {
        return `${Config.baseURL}${this.$route.join('/')}`;
    }
    /**
     * set baseURL
     *
     * @param {String} base
     * @returns
     */
    set baseURL(base) {
        if (base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        Config.baseURL = base;
    }
    /**
     * get baseURL
     *
     * @returns {string}
     */
    get baseURL() {
        return Config.baseURL;
    }
    /**
     * Set identifier key
     *
     * @param {String} id
     */
    set identifier(id) {
        Config.identifier = id;
    }
    /**
     * Get identifier key
     */
    get identifier() {
        return Config.identifier;
    }
    /**
     * set local query params
     * @param {Object|URLSearchParams} params
     */
    set localQueryParams(params) {
        if (!params) {
            return;
        }
        if (params instanceof URLSearchParams) {
            this.$queryParams = params;
            return;
        }
        this.$queryParams = objectToMap(new URLSearchParams(), params);
    }
    /**
     * Sets local query params useful to add params to a custom request
     * @param {Object|URLSearchParams}
     * @return this
     */
    setQueryParams(params) {
        this.localQueryParams = params;
        return this;
    }
    /**
     * Sets local headers useful to add headers to a custom request
     * @param {Object|URLSearchParams}
     * @return this
     */
    setHeaders(params) {
        this.localHeaders = params;
        return this;
    }
    /**
     * Get local query params
     * @return URLSearchParams
     */
    get localQueryParams() {
        return this.$queryParams;
    }
    /**
     * Set global query params
     * @param {Object|URLSearchParams} params
     */
    set queryParams(params) {
        if (params instanceof URLSearchParams) {
            Config.queryParams = params;
            return;
        }
        if (typeof params === 'string') {
            Config.queryParams = new URLSearchParams(params);
            return;
        }
        Config.queryParams = objectToMap(new URLSearchParams(), params);
    }
    /**
     * Get global query params
     * @return {URLSearchParams}
     */
    get queryParams() {
        return Config.queryParams;
    }
    /**
     * Get request query params
     * Combine local and global query params
     * Local query params are overriding global params
     * @return {String}
     */
    get requestQueryParams() {
        let params = new URLSearchParams();
        for (let param of this.queryParams) {
            params.append(param[0], param[1]);
        }
        for (let param of this.localQueryParams) {
            params.append(param[0], param[1]);
        }
        let str = params.toString();
        if (str.length) {
            return '?' + str;
        }
        return '';
    }
    /**
     * Set local headers
     * @param {Object|Headers} params
     */
    set localHeaders(params) {
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
    get localHeaders() {
        return this.$headers;
    }
    /**
     * set global headers
     * @param {Object|Headers} params
     */
    set headers(params) {
        if (params instanceof Headers) {
            Config.headers = params;
            return;
        }
        Config.headers = objectToMap(new Headers(), params);
    }
    /**
     * Get global headers
     * @return Headers
     */
    get headers() {
        return Config.headers;
    }
    /**
     * get request Headers
     * Combine local and global headers
     * Local headers are overriding global headers
     *
     * @returns {Headers}
     */
    get requestHeaders() {
        let headers = new Headers();
        for (let header of this.headers) {
            headers.append(header[0], header[1]);
        }
        for (let header of this.localHeaders) {
            headers.append(header[0], header[1]);
        }
        return headers;
    }
    /**
     * get requestInterceptors
     *
     * @returns {RequestInterceptor[]}
     */
    get requestInterceptors() {
        return Config.requestInterceptors;
    }
    /**
     * set requestInterceptors
     *
     * @param {RequestInterceptor[]} requestInterceptors
     */
    set requestInterceptors(requestInterceptors) {
        Config.requestInterceptors = requestInterceptors;
    }
    /**
     * get responseInterceptors
     *
     * @returns {ResponseInterceptor[]}
     */
    get responseInterceptors() {
        return Config.responseInterceptors;
    }
    /**
     * set responseInterceptors
     *
     * @param {ResponseInterceptor[]} responseInterceptor
     */
    set responseInterceptors(responseInterceptor) {
        Config.responseInterceptors = responseInterceptor;
    }
    /**
     * get errorInterceptors
     *
     * @returns {ErrorInterceptor[]}
     */
    get errorInterceptors() {
        return Config.errorInterceptors;
    }
    /**
     * set errorInterceptors
     *
     * @param {ErrorInterceptor[]} errorInterceptors
     */
    set errorInterceptors(errorInterceptors) {
        Config.errorInterceptors = errorInterceptors;
    }
    /**
     * set requestBodyHandler
     *
     * @param {Function} fn
     */
    set requestBodyHandler(fn) {
        Config.requestBodyHandler = fn;
    }
    /**
     * requestBodyHandler
     *
     * @returns {Function}
     */
    get requestBodyHandler() {
        return Config.requestBodyHandler;
    }
    /**
     * set responseBodyHandler
     * @param {ResponseBodyHandler} fn
     */
    set responseBodyHandler(fn) {
        Config.responseBodyHandler = fn;
    }
    /**
     * get responseBodyHandler
     *
     * @returns {ResponseBodyHandler}
     */
    get responseBodyHandler() {
        return Config.responseBodyHandler;
    }
    /**
     * @param fn the callback that will be called on request abortion
     */
    set abortCallback(fn) {
        Config.abortCallback = fn;
    }
    /**
     * @return fn the current cancel callback
     */
    get abortCallback() {
        return Config.abortCallback;
    }
    get fetch() {
        return Config.fetch ? Config.fetch : fetch;
    }
    set fetch(fn) {
        Config.fetch = fn;
    }
    /**
     * expandInterceptors
     *
     * @param {RequestInterceptor[]|ResponseInterceptor[]|ErrorInterceptor[]} interceptors
     * @returns {Stream<any>} fn
     */
    expandInterceptors(interceptors) {
        return function (origin) {
            return interceptors.reduce((obs, interceptor) => obs.concatMap(value => {
                let result = interceptor(value);
                if (result === undefined) {
                    return most.of(value);
                }
                if (result instanceof Promise) {
                    return fromPromise$1(result);
                }
                if (result instanceof most.Stream) {
                    return result;
                }
                return most.of(result);
            }), most.of(origin));
        };
    }
    /**
     * request
     *
     * @param {string} method
     * @param {RxRestItem|FormData|URLSearchParams|Body|Blob|undefined|Object} [body]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    request(method, body) {
        let requestOptions = {
            method: method,
            headers: this.requestHeaders,
            body: this.requestBodyHandler(body)
        };
        let request = new Request(this.URL + this.requestQueryParams, requestOptions);
        let stream = most.of(request)
            .flatMap(this.expandInterceptors(Config.requestInterceptors))
            .flatMap(request => this.fetch(request, null, this.abortCallback))
            .flatMap(this.expandInterceptors(Config.responseInterceptors))
            .flatMap(body => fromPromise$1(this.responseBodyHandler(body)))
            .flatMap(body => {
            if (!Array.isArray(body)) {
                let item;
                if (this instanceof RxRestItem) {
                    item = this;
                    item.element = body;
                }
                else {
                    item = new RxRestItem(this.$route, body);
                }
                item.$fromServer = true;
                return _most_create.create((add, end, error) => {
                    add(item);
                    end(item);
                });
            }
            let collection = new RxRestCollection(this.$route, body.map((e) => {
                let item = new RxRestItem(this.$route, e);
                item.$fromServer = true;
                return item;
            }));
            return _most_create.create((add, end, error) => {
                for (let item of collection) {
                    add(item);
                }
                end(collection);
            });
        })
            .recoverWith(body => {
            return most.of(body)
                .flatMap(this.expandInterceptors(Config.errorInterceptors))
                .flatMap((body) => most.throwError(body));
        });
        return stream;
    }
}

class RxRestItem extends RxRest$$1 {
    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T} [element]
     * @return {Proxy}
     */
    constructor(route, element) {
        super(route);
        this.$element = {};
        if (element !== undefined) {
            this.element = element;
        }
        const proxy = new Proxy(this.$element, new RxRestProxyHandler(this));
        return proxy;
    }
    /**
     * save - POST or PUT according to $fromServer value
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    save(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request(this.$fromServer === true ? 'PUT' : 'POST', this);
    }
    /**
     * set element
     *
     * @param {T} element
     */
    set element(element) {
        for (let i in element) {
            if (i === this.identifier && !this.$element[this.identifier]) {
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
    get element() {
        return this.$element;
    }
    /**
     * get plain object
     *
     * @return {T}
     */
    plain() {
        return this.element;
    }
    /**
     * Get json string
     * @return {string}
     */
    json() {
        return JSON.stringify(this.plain());
    }
    /**
     * Clone
     * @return {RxRestItem<T>}
     */
    clone() {
        let route = this.$route;
        if (this.$element[this.identifier]) {
            route = route.slice(0, this.$route.length - 1);
        }
        let clone = new RxRestItem(route, this.$element);
        clone.$fromServer = this.$fromServer;
        return clone;
    }
}
class RxRestCollection extends RxRest$$1 {
    /**
     * constructor
     *
     * @param {string[]} route
     * @param {T[]|RxRestItem<T>[]]} [elements]
     * @return {Proxy}
     */
    constructor(route, elements) {
        super(route);
        this.$elements = [];
        if (elements !== undefined) {
            this.elements = elements.map((e) => e instanceof RxRestItem ? e.clone() : new RxRestItem(this.$route, e));
        }
        const proxy = new Proxy(this.$elements, new RxRestProxyHandler(this));
        return proxy;
    }
    [Symbol.iterator]() {
        let index = 0;
        let elements = this.$elements;
        return {
            next() {
                return index < elements.length ?
                    { value: elements[index++], done: false } : { value: undefined, done: true };
            }
        };
    }
    /**
     * getList - fetch a collection
     *
     * @param {Object|URLSearchParams} [queryParams]
     * @param {Object|Headers} [headers]
     * @returns {Stream<RxRestItem|RxRestCollection>}
     */
    getList(queryParams, headers) {
        this.localQueryParams = queryParams;
        this.localHeaders = headers;
        return this.request('GET');
    }
    /**
     * set elements
     *
     * @param {T[]} elements
     */
    set elements(elements) {
        this.$elements = elements;
        this.length = elements.length;
    }
    /**
     * get elements
     * @return {RxRestItem<T>[]}
     */
    get elements() {
        return this.$elements;
    }
    /**
     * plain
     *
     * @returns {T[]}
     */
    plain() {
        return this.elements.map(e => e.plain());
    }
    /**
     * json
     *
     * @returns {String}
     */
    json() {
        return JSON.stringify(this.plain());
    }
    /**
     * clone
     *
     * @returns {RxRestCollection}
     */
    clone() {
        return new RxRestCollection(this.$route, this.$elements);
    }
}
class NewRxRest {
    one(route, id) {
        let r = new RxRest$$1();
        return r.one.call(r, route, id);
    }
    all(route) {
        let r = new RxRest$$1();
        return r.all.call(r, route);
    }
    fromObject(route, element) {
        let r = new RxRest$$1();
        return r.fromObject.call(r, route, element);
    }
}

exports.RxRest = RxRest$$1;
exports.RxRestItem = RxRestItem;
exports.RxRestCollection = RxRestCollection;
exports.NewRxRest = NewRxRest;
//# sourceMappingURL=rxrest.js.map
