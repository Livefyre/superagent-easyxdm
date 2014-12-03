/**
* Create a superagent plugin that will use the provided easyXDM.RPC
* instance to invoke the 'request' method, which is assumed to behave like
* the 'request' described here: https://github.com/oyvindkinsey/easyXDM#the-shipped-cors-interface
*/
exports.rpcRequest = function (rpcRequest) {
  return function (request) {
    var fakeXhr = request.xhr = {};
    request.end = function (fn) {
      var url = request.url;
      var method = request.method;
      var data = this._formData || this._data;
      var headers = this.header;
      var query = this._query;

      // store end callback (required by downstream superagent internals)
      this._callback = fn || function () {};

      // append this._query to querystring
      if (query) {
        query = query.join('&');
        url += ~url.indexOf('?')
          ? '&' + query
          : '?' + query;
      }

      // request body
      var shouldSendBody = ['GET','HEAD','OPTIONS'].indexOf(method) === -1;
      if (shouldSendBody && 'string' != typeof data) {
        data = serialize(this) || data;
      }

      // ok do the request using rpcRequest
      rpcRequest({
          url: url,
          method: method,
          headers: headers,
          data: data
      }, onRequestSuccess, onRequestError);

      /**
       * TODO: Handle all cases
       * Timeout Error (upstream)
       * Timeout based on config passed to superagent
       * CrossDomain Error
       * Progress?
       */
      function onRequestSuccess(res) {
        fakeXhr.responseText = res.data;
        fakeXhr.status = res.status;
        fakeXhr.getAllResponseHeaders = function () {
          return getAllResponseHeaders(res);
        };
        fakeXhr.getResponseHeader = function (headerName) {
          return getResponseHeader(res, headerName);
        };
        request.emit('end');
      }
      function onRequestError(err) {
        request.callback(err);
      }
      return this;
    }
  }
}

/**
 * Provided an easyXDM.request response,
 * return like the standard XHR#getAllResponseHeaders
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#getAllResponseHeaders()
 */
function getAllResponseHeaders(res) {
  var headerDelim = '\r\n';
  var headers = res.headers;
  var allResponseHeaders = Object.keys(headers)
  // Map each header to "Header: Header Value"
  .map(function (headerName) {
    var headerVal = headers[headerName];
    return [headerName, headerVal].join(': ');
  })
  .join(headerDelim);
  // Should always have trailing \r\n
  allResponseHeaders += headerDelim;
  return allResponseHeaders;
}

/**
 * Provided an easyXDM.request response and a header name,
 * return the header like standard XHR#getResponseHeader
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#getResponseHeader()
 */
function getResponseHeader(res, headerName) {
  var originalHeaders = res.headers;
  var lowercaseHeaderObj = Object.keys(originalHeaders)
  .reduce(function (headers, headerName) {
    headers[headerName.toLowerCase()] = originalHeaders[headerName];
    return headers;
  }, {})
  return lowercaseHeaderObj[headerName.toLowerCase()] || null;
};

/**
 * Map of request content-type strings to a function that can be used to
 * serialize an object to a valid string for that content-type
 */
var serializations = {
  'application/x-www-form-urlencoded': serializeObjToFormData,
  'application/json': JSON.stringify
};

/**
 * Serialize the data of a superagent request.
 * To JSON, if content-type is application/json
 * Else to x-www-form-urlencoded
 */
function serialize(req) {
  var serializeForType = serializations[req.getHeader('content-type')];
  if ( ! serializeForType) {
    return;
  }
  /**
   * TODO. Will this work for FormData?
   */
  return serializeForType(req._data);
}

/**
 * Serialize the given `obj` to a form-urlencoded string
 * From https://github.com/visionmedia/superagent/blob/master/lib/client.js#L95
 * @param {Object} obj
 * @return {String}
 * @api private
 */
function serializeObjToFormData(obj) {
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}
