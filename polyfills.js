const {Headers, Response, Request} = require('node-fetch');
require('./test/urlsearchparamspolyfill.js')
global.Headers = Headers
global.Response = Response
global.Request = Request
global.FormData = require('form-data')
