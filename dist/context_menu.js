/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "./node_modules/axios/lib/defaults/transitional.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "./node_modules/axios/lib/defaults/transitional.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/form-data/lib/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/form-data/lib/browser.js ***!
  \***********************************************/
/***/ ((module) => {

/* eslint-env browser */
module.exports = typeof self == 'object' ? self.FormData : window.FormData;


/***/ }),

/***/ "./node_modules/openai/dist/api.js":
/*!*****************************************!*\
  !*** ./node_modules/openai/dist/api.js ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OpenAIApi = exports.OpenAIApiFactory = exports.OpenAIApiFp = exports.OpenAIApiAxiosParamCreator = exports.CreateImageRequestResponseFormatEnum = exports.CreateImageRequestSizeEnum = exports.ChatCompletionResponseMessageRoleEnum = exports.ChatCompletionRequestMessageRoleEnum = void 0;
const axios_1 = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
// Some imports not used depending on template conditions
// @ts-ignore
const common_1 = __webpack_require__(/*! ./common */ "./node_modules/openai/dist/common.js");
// @ts-ignore
const base_1 = __webpack_require__(/*! ./base */ "./node_modules/openai/dist/base.js");
exports.ChatCompletionRequestMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.ChatCompletionResponseMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.CreateImageRequestSizeEnum = {
    _256x256: '256x256',
    _512x512: '512x512',
    _1024x1024: '1024x1024'
};
exports.CreateImageRequestResponseFormatEnum = {
    Url: 'url',
    B64Json: 'b64_json'
};
/**
 * OpenAIApi - axios parameter creator
 * @export
 */
exports.OpenAIApiAxiosParamCreator = function (configuration) {
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('cancelFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/cancel`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer: (createAnswerRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createAnswerRequest' is not null or undefined
            common_1.assertParamExists('createAnswer', 'createAnswerRequest', createAnswerRequest);
            const localVarPath = `/answers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createAnswerRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion: (createChatCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createChatCompletionRequest' is not null or undefined
            common_1.assertParamExists('createChatCompletion', 'createChatCompletionRequest', createChatCompletionRequest);
            const localVarPath = `/chat/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createChatCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification: (createClassificationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createClassificationRequest' is not null or undefined
            common_1.assertParamExists('createClassification', 'createClassificationRequest', createClassificationRequest);
            const localVarPath = `/classifications`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createClassificationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion: (createCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createCompletionRequest' is not null or undefined
            common_1.assertParamExists('createCompletion', 'createCompletionRequest', createCompletionRequest);
            const localVarPath = `/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit: (createEditRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEditRequest' is not null or undefined
            common_1.assertParamExists('createEdit', 'createEditRequest', createEditRequest);
            const localVarPath = `/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEditRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding: (createEmbeddingRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEmbeddingRequest' is not null or undefined
            common_1.assertParamExists('createEmbedding', 'createEmbeddingRequest', createEmbeddingRequest);
            const localVarPath = `/embeddings`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEmbeddingRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile: (file, purpose, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createFile', 'file', file);
            // verify required parameter 'purpose' is not null or undefined
            common_1.assertParamExists('createFile', 'purpose', purpose);
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (purpose !== undefined) {
                localVarFormParams.append('purpose', purpose);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune: (createFineTuneRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createFineTuneRequest' is not null or undefined
            common_1.assertParamExists('createFineTune', 'createFineTuneRequest', createFineTuneRequest);
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createFineTuneRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage: (createImageRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createImageRequest' is not null or undefined
            common_1.assertParamExists('createImage', 'createImageRequest', createImageRequest);
            const localVarPath = `/images/generations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createImageRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit: (image, prompt, mask, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'image', image);
            // verify required parameter 'prompt' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'prompt', prompt);
            const localVarPath = `/images/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (mask !== undefined) {
                localVarFormParams.append('mask', mask);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation: (image, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageVariation', 'image', image);
            const localVarPath = `/images/variations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration: (createModerationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createModerationRequest' is not null or undefined
            common_1.assertParamExists('createModeration', 'createModerationRequest', createModerationRequest);
            const localVarPath = `/moderations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createModerationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch: (engineId, createSearchRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('createSearch', 'engineId', engineId);
            // verify required parameter 'createSearchRequest' is not null or undefined
            common_1.assertParamExists('createSearch', 'createSearchRequest', createSearchRequest);
            const localVarPath = `/engines/{engine_id}/search`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createSearchRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription: (file, model, prompt, responseFormat, temperature, language, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranscription', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranscription', 'model', model);
            const localVarPath = `/audio/transcriptions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            if (language !== undefined) {
                localVarFormParams.append('language', language);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation: (file, model, prompt, responseFormat, temperature, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranslation', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranslation', 'model', model);
            const localVarPath = `/audio/translations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('deleteFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('deleteModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('downloadFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}/content`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/engines`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents: (fineTuneId, stream, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('listFineTuneEvents', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/events`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            if (stream !== undefined) {
                localVarQueryParameter['stream'] = stream;
            }
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/models`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine: (engineId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('retrieveEngine', 'engineId', engineId);
            const localVarPath = `/engines/{engine_id}`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('retrieveFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('retrieveFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('retrieveModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
    };
};
/**
 * OpenAIApi - functional programming interface
 * @export
 */
exports.OpenAIApiFp = function (configuration) {
    const localVarAxiosParamCreator = exports.OpenAIApiAxiosParamCreator(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.cancelFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createAnswer(createAnswerRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createChatCompletion(createChatCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createClassification(createClassificationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createCompletion(createCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEdit(createEditRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEmbedding(createEmbeddingRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFile(file, purpose, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFineTune(createFineTuneRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImage(createImageRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageVariation(image, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createModeration(createModerationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createSearch(engineId, createSearchRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranscription(file, model, prompt, responseFormat, temperature, language, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranslation(file, model, prompt, responseFormat, temperature, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.downloadFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listEngines(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFiles(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTuneEvents(fineTuneId, stream, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTunes(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listModels(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveEngine(engineId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
    };
};
/**
 * OpenAIApi - factory interface
 * @export
 */
exports.OpenAIApiFactory = function (configuration, basePath, axios) {
    const localVarFp = exports.OpenAIApiFp(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return localVarFp.cancelFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return localVarFp.createAnswer(createAnswerRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return localVarFp.createChatCompletion(createChatCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return localVarFp.createClassification(createClassificationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return localVarFp.createCompletion(createCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return localVarFp.createEdit(createEditRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return localVarFp.createEmbedding(createEmbeddingRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return localVarFp.createFile(file, purpose, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return localVarFp.createFineTune(createFineTuneRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return localVarFp.createImage(createImageRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return localVarFp.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return localVarFp.createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return localVarFp.createModeration(createModerationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return localVarFp.createSearch(engineId, createSearchRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return localVarFp.createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return localVarFp.createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return localVarFp.deleteFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return localVarFp.deleteModel(model, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return localVarFp.downloadFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return localVarFp.listEngines(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return localVarFp.listFiles(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return localVarFp.listFineTuneEvents(fineTuneId, stream, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return localVarFp.listFineTunes(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return localVarFp.listModels(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return localVarFp.retrieveEngine(engineId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return localVarFp.retrieveFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return localVarFp.retrieveFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return localVarFp.retrieveModel(model, options).then((request) => request(axios, basePath));
        },
    };
};
/**
 * OpenAIApi - object-oriented interface
 * @export
 * @class OpenAIApi
 * @extends {BaseAPI}
 */
class OpenAIApi extends base_1.BaseAPI {
    /**
     *
     * @summary Immediately cancel a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to cancel
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    cancelFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).cancelFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
     * @param {CreateAnswerRequest} createAnswerRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createAnswer(createAnswerRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createAnswer(createAnswerRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the chat message
     * @param {CreateChatCompletionRequest} createChatCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createChatCompletion(createChatCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createChatCompletion(createChatCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
     * @param {CreateClassificationRequest} createClassificationRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createClassification(createClassificationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createClassification(createClassificationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the provided prompt and parameters
     * @param {CreateCompletionRequest} createCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createCompletion(createCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createCompletion(createCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a new edit for the provided input, instruction, and parameters.
     * @param {CreateEditRequest} createEditRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEdit(createEditRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEdit(createEditRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an embedding vector representing the input text.
     * @param {CreateEmbeddingRequest} createEmbeddingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEmbedding(createEmbeddingRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEmbedding(createEmbeddingRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
     * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
     * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFile(file, purpose, options) {
        return exports.OpenAIApiFp(this.configuration).createFile(file, purpose, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {CreateFineTuneRequest} createFineTuneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFineTune(createFineTuneRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createFineTune(createFineTuneRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an image given a prompt.
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImage(createImageRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createImage(createImageRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an edited or extended image given an original image and a prompt.
     * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
     * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
     * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a variation of a given image.
     * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageVariation(image, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies if text violates OpenAI\'s Content Policy
     * @param {CreateModerationRequest} createModerationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createModeration(createModerationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createModeration(createModerationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
     * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
     * @param {CreateSearchRequest} createSearchRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createSearch(engineId, createSearchRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createSearch(engineId, createSearchRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Transcribes audio into the input language.
     * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
        return exports.OpenAIApiFp(this.configuration).createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Translates audio into into English.
     * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranslation(file, model, prompt, responseFormat, temperature, options) {
        return exports.OpenAIApiFp(this.configuration).createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).deleteFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
     * @param {string} model The model to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).deleteModel(model, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the contents of the specified file
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    downloadFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).downloadFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listEngines(options) {
        return exports.OpenAIApiFp(this.configuration).listEngines(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a list of files that belong to the user\'s organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFiles(options) {
        return exports.OpenAIApiFp(this.configuration).listFiles(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get fine-grained status updates for a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to get events for.
     * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTuneEvents(fineTuneId, stream, options) {
        return exports.OpenAIApiFp(this.configuration).listFineTuneEvents(fineTuneId, stream, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary List your organization\'s fine-tuning jobs
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTunes(options) {
        return exports.OpenAIApiFp(this.configuration).listFineTunes(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listModels(options) {
        return exports.OpenAIApiFp(this.configuration).listModels(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
     * @param {string} engineId The ID of the engine to use for this request
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveEngine(engineId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveEngine(engineId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns information about a specific file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {string} fineTuneId The ID of the fine-tune job
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
     * @param {string} model The ID of the model to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveModel(model, options).then((request) => request(this.axios, this.basePath));
    }
}
exports.OpenAIApi = OpenAIApi;


/***/ }),

/***/ "./node_modules/openai/dist/base.js":
/*!******************************************!*\
  !*** ./node_modules/openai/dist/base.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RequiredError = exports.BaseAPI = exports.COLLECTION_FORMATS = exports.BASE_PATH = void 0;
const axios_1 = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
exports.BASE_PATH = "https://api.openai.com/v1".replace(/\/+$/, "");
/**
 *
 * @export
 */
exports.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};
/**
 *
 * @export
 * @class BaseAPI
 */
class BaseAPI {
    constructor(configuration, basePath = exports.BASE_PATH, axios = axios_1.default) {
        this.basePath = basePath;
        this.axios = axios;
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
}
exports.BaseAPI = BaseAPI;
;
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
class RequiredError extends Error {
    constructor(field, msg) {
        super(msg);
        this.field = field;
        this.name = "RequiredError";
    }
}
exports.RequiredError = RequiredError;


/***/ }),

/***/ "./node_modules/openai/dist/common.js":
/*!********************************************!*\
  !*** ./node_modules/openai/dist/common.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRequestFunction = exports.toPathString = exports.serializeDataIfNeeded = exports.setSearchParams = exports.setOAuthToObject = exports.setBearerAuthToObject = exports.setBasicAuthToObject = exports.setApiKeyToObject = exports.assertParamExists = exports.DUMMY_BASE_URL = void 0;
const base_1 = __webpack_require__(/*! ./base */ "./node_modules/openai/dist/base.js");
/**
 *
 * @export
 */
exports.DUMMY_BASE_URL = 'https://example.com';
/**
 *
 * @throws {RequiredError}
 * @export
 */
exports.assertParamExists = function (functionName, paramName, paramValue) {
    if (paramValue === null || paramValue === undefined) {
        throw new base_1.RequiredError(paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
    }
};
/**
 *
 * @export
 */
exports.setApiKeyToObject = function (object, keyParamName, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.apiKey) {
            const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                ? yield configuration.apiKey(keyParamName)
                : yield configuration.apiKey;
            object[keyParamName] = localVarApiKeyValue;
        }
    });
};
/**
 *
 * @export
 */
exports.setBasicAuthToObject = function (object, configuration) {
    if (configuration && (configuration.username || configuration.password)) {
        object["auth"] = { username: configuration.username, password: configuration.password };
    }
};
/**
 *
 * @export
 */
exports.setBearerAuthToObject = function (object, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const accessToken = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken()
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + accessToken;
        }
    });
};
/**
 *
 * @export
 */
exports.setOAuthToObject = function (object, name, scopes, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken(name, scopes)
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + localVarAccessTokenValue;
        }
    });
};
function setFlattenedQueryParams(urlSearchParams, parameter, key = "") {
    if (parameter == null)
        return;
    if (typeof parameter === "object") {
        if (Array.isArray(parameter)) {
            parameter.forEach(item => setFlattenedQueryParams(urlSearchParams, item, key));
        }
        else {
            Object.keys(parameter).forEach(currentKey => setFlattenedQueryParams(urlSearchParams, parameter[currentKey], `${key}${key !== '' ? '.' : ''}${currentKey}`));
        }
    }
    else {
        if (urlSearchParams.has(key)) {
            urlSearchParams.append(key, parameter);
        }
        else {
            urlSearchParams.set(key, parameter);
        }
    }
}
/**
 *
 * @export
 */
exports.setSearchParams = function (url, ...objects) {
    const searchParams = new URLSearchParams(url.search);
    setFlattenedQueryParams(searchParams, objects);
    url.search = searchParams.toString();
};
/**
 *
 * @export
 */
exports.serializeDataIfNeeded = function (value, requestOptions, configuration) {
    const nonString = typeof value !== 'string';
    const needsSerialization = nonString && configuration && configuration.isJsonMime
        ? configuration.isJsonMime(requestOptions.headers['Content-Type'])
        : nonString;
    return needsSerialization
        ? JSON.stringify(value !== undefined ? value : {})
        : (value || "");
};
/**
 *
 * @export
 */
exports.toPathString = function (url) {
    return url.pathname + url.search + url.hash;
};
/**
 *
 * @export
 */
exports.createRequestFunction = function (axiosArgs, globalAxios, BASE_PATH, configuration) {
    return (axios = globalAxios, basePath = BASE_PATH) => {
        const axiosRequestArgs = Object.assign(Object.assign({}, axiosArgs.options), { url: ((configuration === null || configuration === void 0 ? void 0 : configuration.basePath) || basePath) + axiosArgs.url });
        return axios.request(axiosRequestArgs);
    };
};


/***/ }),

/***/ "./node_modules/openai/dist/configuration.js":
/*!***************************************************!*\
  !*** ./node_modules/openai/dist/configuration.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Configuration = void 0;
const packageJson = __webpack_require__(/*! ../package.json */ "./node_modules/openai/package.json");
class Configuration {
    constructor(param = {}) {
        this.apiKey = param.apiKey;
        this.organization = param.organization;
        this.username = param.username;
        this.password = param.password;
        this.accessToken = param.accessToken;
        this.basePath = param.basePath;
        this.baseOptions = param.baseOptions;
        this.formDataCtor = param.formDataCtor;
        if (!this.baseOptions) {
            this.baseOptions = {};
        }
        this.baseOptions.headers = Object.assign({ 'User-Agent': `OpenAI/NodeJS/${packageJson.version}`, 'Authorization': `Bearer ${this.apiKey}` }, this.baseOptions.headers);
        if (this.organization) {
            this.baseOptions.headers['OpenAI-Organization'] = this.organization;
        }
        if (!this.formDataCtor) {
            this.formDataCtor = __webpack_require__(/*! form-data */ "./node_modules/form-data/lib/browser.js");
        }
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
}
exports.Configuration = Configuration;


/***/ }),

/***/ "./node_modules/openai/dist/index.js":
/*!*******************************************!*\
  !*** ./node_modules/openai/dist/index.js ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./api */ "./node_modules/openai/dist/api.js"), exports);
__exportStar(__webpack_require__(/*! ./configuration */ "./node_modules/openai/dist/configuration.js"), exports);


/***/ }),

/***/ "./src/storage_key.js":
/*!****************************!*\
  !*** ./src/storage_key.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   key: () => (/* binding */ key)
/* harmony export */ });
const key = "upwork_cover_letter_generator_data";


/***/ }),

/***/ "./node_modules/openai/package.json":
/*!******************************************!*\
  !*** ./node_modules/openai/package.json ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"openai","version":"3.2.1","description":"Node.js library for the OpenAI API","repository":{"type":"git","url":"git@github.com:openai/openai-node.git"},"keywords":["openai","open","ai","gpt-3","gpt3"],"author":"OpenAI","license":"MIT","main":"./dist/index.js","types":"./dist/index.d.ts","scripts":{"build":"tsc --outDir dist/"},"dependencies":{"axios":"^0.26.0","form-data":"^4.0.0"},"devDependencies":{"@types/node":"^12.11.5","typescript":"^3.6.4"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./src/context_menu.js ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! openai */ "./node_modules/openai/dist/index.js");
/* harmony import */ var openai__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(openai__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _storage_key__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./storage_key */ "./src/storage_key.js");



let configuration;
let openai;

console.log("changes!");
(async () => {
    const key = 
        await fetch(chrome.runtime.getURL('../.open_api_key_file'))
        .then(response => response.text())
        .then(text => {
            console.log(text);
        })
        .catch(err => console.error(err));

    configuration = new openai__WEBPACK_IMPORTED_MODULE_0__.Configuration({
        apiKey: key
    });
    openai = new openai__WEBPACK_IMPORTED_MODULE_0__.OpenAIApi(configuration);
})();


async function callApi(req, res) {
    if (!configuration.apiKey) {
        console.error("OpenAI API key not configured, please follow instructions in README.md");
        return;
    }

    const jobDescription = "ATTENTION: PLACEHOLDER";
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(jobDescription),
            temperature: 0.6,
        });
        res.status(200).json({ result: completion.data.choices[0].text });
    } catch(error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.',
                }
            });
        }
    }
}

// Patch the job description into my resume.
function generatePrompt(jobDescription) {
}

// Store text to persist while plugin is loaded or until reset. 
async function store(text) {

    const o = await chrome.storage.local.get([_storage_key__WEBPACK_IMPORTED_MODULE_1__.key]);

    const oldStore = o[_storage_key__WEBPACK_IMPORTED_MODULE_1__.key];

    if (oldStore === undefined) {
        chrome.storage.local.set({ [_storage_key__WEBPACK_IMPORTED_MODULE_1__.key]: [text] });

    } else {
        const newStore = [...oldStore, text];

        chrome.storage.local.set({ [_storage_key__WEBPACK_IMPORTED_MODULE_1__.key]: newStore });
    }
}

function contextOnClick(info) {
    switch (info.menuItemId) {
        case 'selection':
            store(info.selectionText);
            break;
        case 'editable':
            break;
        default:
            // Standard context menu item function
            console.error('No action for this menu item.');
    }
}

chrome.contextMenus.onClicked.addListener(contextOnClick);

chrome.runtime.onInstalled.addListener(function () {

    let contexts = [
        'selection',
        'editable',
    ];

    for (let i = 0; i < contexts.length; i++) {
        let context = contexts[i];
        let title = "Test '" + context + "' menu item";
        chrome.contextMenus.create({
            title: title,
            contexts: [context],
            id: context,
        });
    }
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dF9tZW51LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLDRGQUF1Qzs7Ozs7Ozs7Ozs7QUNBMUI7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZO0FBQ2hDLGFBQWEsbUJBQU8sQ0FBQyxpRUFBa0I7QUFDdkMsY0FBYyxtQkFBTyxDQUFDLHlFQUFzQjtBQUM1QyxlQUFlLG1CQUFPLENBQUMsMkVBQXVCO0FBQzlDLG9CQUFvQixtQkFBTyxDQUFDLDZFQUF1QjtBQUNuRCxtQkFBbUIsbUJBQU8sQ0FBQyxtRkFBMkI7QUFDdEQsc0JBQXNCLG1CQUFPLENBQUMseUZBQThCO0FBQzVELGtCQUFrQixtQkFBTyxDQUFDLHlFQUFxQjtBQUMvQywyQkFBMkIsbUJBQU8sQ0FBQyxtRkFBMEI7QUFDN0QsYUFBYSxtQkFBTyxDQUFDLG1FQUFrQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw2Q0FBNkM7QUFDN0M7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ25OYTs7QUFFYixZQUFZLG1CQUFPLENBQUMsa0RBQVM7QUFDN0IsV0FBVyxtQkFBTyxDQUFDLGdFQUFnQjtBQUNuQyxZQUFZLG1CQUFPLENBQUMsNERBQWM7QUFDbEMsa0JBQWtCLG1CQUFPLENBQUMsd0VBQW9CO0FBQzlDLGVBQWUsbUJBQU8sQ0FBQyw4REFBWTs7QUFFbkM7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLG1CQUFPLENBQUMsa0VBQWlCO0FBQ3hDLG9CQUFvQixtQkFBTyxDQUFDLDRFQUFzQjtBQUNsRCxpQkFBaUIsbUJBQU8sQ0FBQyxzRUFBbUI7QUFDNUMsZ0JBQWdCLHVGQUE2Qjs7QUFFN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFPLENBQUMsb0VBQWtCOztBQUV6QztBQUNBLHFCQUFxQixtQkFBTyxDQUFDLGdGQUF3Qjs7QUFFckQ7O0FBRUE7QUFDQSx5QkFBc0I7Ozs7Ozs7Ozs7OztBQ3hEVDs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsU0FBUztBQUNwQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7Ozs7Ozs7Ozs7OztBQ2xCYTs7QUFFYixhQUFhLG1CQUFPLENBQUMsMkRBQVU7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3RIYTs7QUFFYjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ0phOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMseUVBQXFCO0FBQzVDLHlCQUF5QixtQkFBTyxDQUFDLGlGQUFzQjtBQUN2RCxzQkFBc0IsbUJBQU8sQ0FBQywyRUFBbUI7QUFDakQsa0JBQWtCLG1CQUFPLENBQUMsbUVBQWU7QUFDekMsZ0JBQWdCLG1CQUFPLENBQUMsMkVBQXNCOztBQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0Q7QUFDaEQ7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7Ozs7QUNuSmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsVUFBVTtBQUNyQjtBQUNBLFlBQVksUUFBUTtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7Ozs7Ozs7Ozs7O0FDckRhOztBQUViLG9CQUFvQixtQkFBTyxDQUFDLG1GQUEwQjtBQUN0RCxrQkFBa0IsbUJBQU8sQ0FBQywrRUFBd0I7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbkJhOztBQUViLG1CQUFtQixtQkFBTyxDQUFDLHFFQUFnQjs7QUFFM0M7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDakJhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxvQkFBb0IsbUJBQU8sQ0FBQyx1RUFBaUI7QUFDN0MsZUFBZSxtQkFBTyxDQUFDLHVFQUFvQjtBQUMzQyxlQUFlLG1CQUFPLENBQUMsK0RBQWE7QUFDcEMsYUFBYSxtQkFBTyxDQUFDLG1FQUFrQjs7QUFFdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CLHVDQUF1QztBQUN2QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7Ozs7Ozs7Ozs7OztBQ3RGYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLE9BQU87QUFDbEIsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsT0FBTztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDMUNhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxtREFBVTs7QUFFOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTiwyQkFBMkI7QUFDM0IsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7Ozs7Ozs7Ozs7O0FDbEdhOztBQUViLGtCQUFrQixtQkFBTyxDQUFDLG1FQUFlOztBQUV6QztBQUNBO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsV0FBVyxVQUFVO0FBQ3JCLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDeEJhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxxREFBWTtBQUNoQyxlQUFlLG1CQUFPLENBQUMsK0RBQWE7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsZUFBZTtBQUMxQixXQUFXLE9BQU87QUFDbEIsV0FBVyxnQkFBZ0I7QUFDM0IsYUFBYSxHQUFHO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7Ozs7Ozs7Ozs7O0FDckJhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxtREFBVTtBQUM5QiwwQkFBMEIsbUJBQU8sQ0FBQywrRkFBZ0M7QUFDbEUsbUJBQW1CLG1CQUFPLENBQUMsMkVBQXNCO0FBQ2pELDJCQUEyQixtQkFBTyxDQUFDLHlFQUFnQjs7QUFFbkQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLG1CQUFPLENBQUMsaUVBQWlCO0FBQ3ZDLElBQUk7QUFDSjtBQUNBLGNBQWMsbUJBQU8sQ0FBQyxrRUFBa0I7QUFDeEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQSxDQUFDOztBQUVEOzs7Ozs7Ozs7Ozs7QUNsSWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDRmE7O0FBRWI7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGlCQUFpQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNWYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7O0FDckVhOztBQUViO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDYmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsMkNBQTJDO0FBQzNDLFNBQVM7O0FBRVQ7QUFDQSw0REFBNEQsd0JBQXdCO0FBQ3BGO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLGdDQUFnQyxjQUFjO0FBQzlDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7OztBQ3BEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNiYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDWmE7O0FBRWIsWUFBWSxtQkFBTyxDQUFDLHFEQUFZOztBQUVoQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFFBQVE7QUFDdEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYyxRQUFRO0FBQ3RCLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7Ozs7O0FDbkVhOztBQUViLFlBQVksbUJBQU8sQ0FBQyxtREFBVTs7QUFFOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOzs7Ozs7Ozs7Ozs7QUNYYTs7QUFFYixZQUFZLG1CQUFPLENBQUMscURBQVk7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0I7O0FBRWxCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3BEYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQSxXQUFXLFVBQVU7QUFDckIsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDMUJhOztBQUViLGNBQWMsd0ZBQThCOztBQUU1Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxtQkFBbUI7QUFDOUIsV0FBVyxTQUFTO0FBQ3BCLFdBQVcsU0FBUztBQUNwQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFVBQVU7QUFDckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ2pGYTs7QUFFYixXQUFXLG1CQUFPLENBQUMsZ0VBQWdCOztBQUVuQzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFNBQVM7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFFBQVE7QUFDbkIsYUFBYSxRQUFRO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxjQUFjO0FBQ3pCLFdBQVcsVUFBVTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0NBQW9DLE9BQU87QUFDM0M7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFNBQVMsR0FBRyxTQUFTO0FBQzVDLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sNEJBQTRCO0FBQzVCLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUEsd0NBQXdDLE9BQU87QUFDL0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQzVWQTtBQUNBOzs7Ozs7Ozs7Ozs7QUNEYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxpQkFBaUIsR0FBRyx3QkFBd0IsR0FBRyxtQkFBbUIsR0FBRyxrQ0FBa0MsR0FBRyw0Q0FBNEMsR0FBRyxrQ0FBa0MsR0FBRyw2Q0FBNkMsR0FBRyw0Q0FBNEM7QUFDMVIsZ0JBQWdCLG1CQUFPLENBQUMsNENBQU87QUFDL0I7QUFDQTtBQUNBLGlCQUFpQixtQkFBTyxDQUFDLHNEQUFVO0FBQ25DO0FBQ0EsZUFBZSxtQkFBTyxDQUFDLGtEQUFRO0FBQy9CLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLGlEQUFpRDtBQUNqRDtBQUNBO0FBQ0EsK0NBQStDLGFBQWE7QUFDNUQsMkJBQTJCLEVBQUUsZ0JBQWdCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHFCQUFxQjtBQUN4QyxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBLHdEQUF3RDtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZ0JBQWdCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkJBQTZCO0FBQ2hELG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLHdFQUF3RTtBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZ0JBQWdCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkJBQTZCO0FBQ2hELG1CQUFtQixHQUFHO0FBQ3RCO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0Esd0VBQXdFO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix5QkFBeUI7QUFDNUMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0EsZ0VBQWdFO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0Esb0RBQW9EO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix3QkFBd0I7QUFDM0MsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0EsOERBQThEO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNLDhHQUE4RyxjQUFjLG1CQUFtQixrQkFBa0IsMkNBQTJDLGdCQUFnQixhQUFhLG9CQUFvQjtBQUN0UixtQkFBbUIsUUFBUSxzRUFBc0UsbUJBQW1CO0FBQ3BILG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGdCQUFnQjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1R0FBdUc7QUFDdkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUJBQXVCO0FBQzFDLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLDREQUE0RDtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZ0JBQWdCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsb0JBQW9CO0FBQ3ZDLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZ0JBQWdCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsTUFBTTtBQUN6QixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsTUFBTSx5R0FBeUcsWUFBWSxpR0FBaUcsV0FBVztBQUMxUCxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsUUFBUSw4REFBOEQsYUFBYSxRQUFRLGFBQWEsV0FBVyxlQUFlO0FBQ3JKLG1CQUFtQixRQUFRLDZGQUE2RixVQUFVLFNBQVMsY0FBYztBQUN6SixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSwwRkFBMEY7QUFDMUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUdBQXVHO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekIsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVEsOERBQThELGFBQWEsUUFBUSxhQUFhLFdBQVcsZUFBZTtBQUNySixtQkFBbUIsUUFBUSw2RkFBNkYsVUFBVSxTQUFTLGNBQWM7QUFDekosbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0EsaUZBQWlGO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxnQkFBZ0I7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUdBQXVHO0FBQ3ZHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHlCQUF5QjtBQUM1QyxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSxnRUFBZ0U7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGdCQUFnQjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVEsb0ZBQW9GLFNBQVMsUUFBUSxhQUFhLFFBQVEsV0FBVyxXQUFXLGFBQWE7QUFDeEwsbUJBQW1CLHFCQUFxQjtBQUN4QyxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBLGtFQUFrRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxVQUFVO0FBQ3RELDJCQUEyQixFQUFFLGFBQWE7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGdCQUFnQjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekIsbUJBQW1CLFFBQVEseUNBQXlDLGdCQUFnQjtBQUNwRixtQkFBbUIsUUFBUSxvREFBb0Q7QUFDL0UsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0Esc0dBQXNHO0FBQ3RHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZ0JBQWdCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVHQUF1RztBQUN2RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNO0FBQ3pCLG1CQUFtQixRQUFRLHlDQUF5QyxnQkFBZ0I7QUFDcEYsbUJBQW1CLFFBQVEsb0RBQW9EO0FBQy9FLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLDBGQUEwRjtBQUMxRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGdCQUFnQjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1R0FBdUc7QUFDdkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQTtBQUNBLDBDQUEwQyxRQUFRO0FBQ2xELDJCQUEyQixFQUFFLFdBQVc7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGtCQUFrQjtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSx5Q0FBeUM7QUFDekM7QUFDQTtBQUNBLDJDQUEyQyxNQUFNO0FBQ2pELDJCQUEyQixFQUFFLFNBQVM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGtCQUFrQjtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBLDBDQUEwQyxRQUFRO0FBQ2xELDJCQUEyQixFQUFFLFdBQVc7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGVBQWU7QUFDeEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEdBQUc7QUFDdEI7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQSxrQ0FBa0M7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZUFBZTtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZUFBZTtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsU0FBUyxrVEFBa1QsbUJBQW1CO0FBQ2pXLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLDZEQUE2RDtBQUM3RDtBQUNBO0FBQ0EsK0NBQStDLGFBQWE7QUFDNUQsMkJBQTJCLEVBQUUsZ0JBQWdCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxlQUFlO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxlQUFlO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLGlDQUFpQztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxlQUFlO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQSw0Q0FBNEMsVUFBVTtBQUN0RCwyQkFBMkIsRUFBRSxhQUFhO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxlQUFlO0FBQ3hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUZBQXlGO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0EsMENBQTBDLFFBQVE7QUFDbEQsMkJBQTJCLEVBQUUsV0FBVztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZUFBZTtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSxtREFBbUQ7QUFDbkQ7QUFDQTtBQUNBLCtDQUErQyxhQUFhO0FBQzVELDJCQUEyQixFQUFFLGdCQUFnQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RUFBeUUsZUFBZTtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RjtBQUN6RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBLDJDQUEyQyxNQUFNO0FBQ2pELDJCQUEyQixFQUFFLFNBQVM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLGVBQWU7QUFDeEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHFCQUFxQjtBQUN4QyxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkJBQTZCO0FBQ2hELG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkJBQTZCO0FBQ2hELG1CQUFtQixHQUFHO0FBQ3RCO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix5QkFBeUI7QUFDNUMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtQkFBbUI7QUFDdEMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix3QkFBd0I7QUFDM0MsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNLDhHQUE4RyxjQUFjLG1CQUFtQixrQkFBa0IsMkNBQTJDLGdCQUFnQixhQUFhLG9CQUFvQjtBQUN0UixtQkFBbUIsUUFBUSxzRUFBc0UsbUJBQW1CO0FBQ3BILG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUJBQXVCO0FBQzFDLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsb0JBQW9CO0FBQ3ZDLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsTUFBTTtBQUN6QixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsTUFBTSx5R0FBeUcsWUFBWSxpR0FBaUcsV0FBVztBQUMxUCxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsUUFBUSw4REFBOEQsYUFBYSxRQUFRLGFBQWEsV0FBVyxlQUFlO0FBQ3JKLG1CQUFtQixRQUFRLDZGQUE2RixVQUFVLFNBQVMsY0FBYztBQUN6SixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekIsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVEsOERBQThELGFBQWEsUUFBUSxhQUFhLFdBQVcsZUFBZTtBQUNySixtQkFBbUIsUUFBUSw2RkFBNkYsVUFBVSxTQUFTLGNBQWM7QUFDekosbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix5QkFBeUI7QUFDNUMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRLG9GQUFvRixTQUFTLFFBQVEsYUFBYSxRQUFRLFdBQVcsV0FBVyxhQUFhO0FBQ3hMLG1CQUFtQixxQkFBcUI7QUFDeEMsbUJBQW1CLEdBQUc7QUFDdEI7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekIsbUJBQW1CLFFBQVEseUNBQXlDLGdCQUFnQjtBQUNwRixtQkFBbUIsUUFBUSxvREFBb0Q7QUFDL0UsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNO0FBQ3pCLG1CQUFtQixRQUFRLHlDQUF5QyxnQkFBZ0I7QUFDcEYsbUJBQW1CLFFBQVEsb0RBQW9EO0FBQy9FLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFNBQVMsa1RBQWtULG1CQUFtQjtBQUNqVyxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHFCQUFxQjtBQUN4QyxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDZCQUE2QjtBQUNoRCxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQiw2QkFBNkI7QUFDaEQsbUJBQW1CLEdBQUc7QUFDdEI7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix5QkFBeUI7QUFDNUMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsbUJBQW1CO0FBQ3RDLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHdCQUF3QjtBQUMzQyxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNLDhHQUE4RyxjQUFjLG1CQUFtQixrQkFBa0IsMkNBQTJDLGdCQUFnQixhQUFhLG9CQUFvQjtBQUN0UixtQkFBbUIsUUFBUSxzRUFBc0UsbUJBQW1CO0FBQ3BILG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVCQUF1QjtBQUMxQyxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixvQkFBb0I7QUFDdkMsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsTUFBTTtBQUN6QixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsTUFBTSx5R0FBeUcsWUFBWSxpR0FBaUcsV0FBVztBQUMxUCxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsUUFBUSw4REFBOEQsYUFBYSxRQUFRLGFBQWEsV0FBVyxlQUFlO0FBQ3JKLG1CQUFtQixRQUFRLDZGQUE2RixVQUFVLFNBQVMsY0FBYztBQUN6SixtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNO0FBQ3pCLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixRQUFRLDhEQUE4RCxhQUFhLFFBQVEsYUFBYSxXQUFXLGVBQWU7QUFDckosbUJBQW1CLFFBQVEsNkZBQTZGLFVBQVUsU0FBUyxjQUFjO0FBQ3pKLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHlCQUF5QjtBQUM1QyxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRLG9GQUFvRixTQUFTLFFBQVEsYUFBYSxRQUFRLFdBQVcsV0FBVyxhQUFhO0FBQ3hMLG1CQUFtQixxQkFBcUI7QUFDeEMsbUJBQW1CLEdBQUc7QUFDdEI7QUFDQSxvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixNQUFNO0FBQ3pCLG1CQUFtQixRQUFRLHlDQUF5QyxnQkFBZ0I7QUFDcEYsbUJBQW1CLFFBQVEsb0RBQW9EO0FBQy9FLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE1BQU07QUFDekIsbUJBQW1CLFFBQVEseUNBQXlDLGdCQUFnQjtBQUNwRixtQkFBbUIsUUFBUSxvREFBb0Q7QUFDL0UsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsR0FBRztBQUN0QjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsU0FBUyxrVEFBa1QsbUJBQW1CO0FBQ2pXLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsUUFBUTtBQUMzQixtQkFBbUIsR0FBRztBQUN0QixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixRQUFRO0FBQzNCLG1CQUFtQixHQUFHO0FBQ3RCLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFFBQVE7QUFDM0IsbUJBQW1CLEdBQUc7QUFDdEIsb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHFCQUFxQjtBQUNwQyxlQUFlLEdBQUc7QUFDbEI7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNkJBQTZCO0FBQzVDLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNkJBQTZCO0FBQzVDLGVBQWUsR0FBRztBQUNsQjtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSx5QkFBeUI7QUFDeEMsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEMsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSx3QkFBd0I7QUFDdkMsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxNQUFNLDhHQUE4RyxjQUFjLG1CQUFtQixrQkFBa0IsMkNBQTJDLGdCQUFnQixhQUFhLG9CQUFvQjtBQUNsUixlQUFlLFFBQVEsc0VBQXNFLG1CQUFtQjtBQUNoSCxlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHVCQUF1QjtBQUN0QyxlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9CQUFvQjtBQUNuQyxlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE1BQU07QUFDckIsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsTUFBTSx5R0FBeUcsWUFBWSxpR0FBaUcsV0FBVztBQUN0UCxlQUFlLFFBQVE7QUFDdkIsZUFBZSxRQUFRLDhEQUE4RCxhQUFhLFFBQVEsYUFBYSxXQUFXLGVBQWU7QUFDakosZUFBZSxRQUFRLDZGQUE2RixVQUFVLFNBQVMsY0FBYztBQUNySixlQUFlLFFBQVE7QUFDdkIsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxNQUFNO0FBQ3JCLGVBQWUsUUFBUTtBQUN2QixlQUFlLFFBQVEsOERBQThELGFBQWEsUUFBUSxhQUFhLFdBQVcsZUFBZTtBQUNqSixlQUFlLFFBQVEsNkZBQTZGLFVBQVUsU0FBUyxjQUFjO0FBQ3JKLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHlCQUF5QjtBQUN4QyxlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVEsb0ZBQW9GLFNBQVMsUUFBUSxhQUFhLFFBQVEsV0FBVyxXQUFXLGFBQWE7QUFDcEwsZUFBZSxxQkFBcUI7QUFDcEMsZUFBZSxHQUFHO0FBQ2xCO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE1BQU07QUFDckIsZUFBZSxRQUFRLHlDQUF5QyxnQkFBZ0I7QUFDaEYsZUFBZSxRQUFRLG9EQUFvRDtBQUMzRSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE1BQU07QUFDckIsZUFBZSxRQUFRLHlDQUF5QyxnQkFBZ0I7QUFDaEYsZUFBZSxRQUFRLG9EQUFvRDtBQUMzRSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQjtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsU0FBUyxrVEFBa1QsbUJBQW1CO0FBQzdWLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEI7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsUUFBUTtBQUN2QixlQUFlLEdBQUc7QUFDbEIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLFFBQVE7QUFDdkIsZUFBZSxHQUFHO0FBQ2xCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxRQUFRO0FBQ3ZCLGVBQWUsR0FBRztBQUNsQixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOzs7Ozs7Ozs7Ozs7QUNyL0RKO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QscUJBQXFCLEdBQUcsZUFBZSxHQUFHLDBCQUEwQixHQUFHLGlCQUFpQjtBQUN4RixnQkFBZ0IsbUJBQU8sQ0FBQyw0Q0FBTztBQUMvQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7Ozs7Ozs7Ozs7OztBQzFEUjtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCw2QkFBNkIsR0FBRyxvQkFBb0IsR0FBRyw2QkFBNkIsR0FBRyx1QkFBdUIsR0FBRyx3QkFBd0IsR0FBRyw2QkFBNkIsR0FBRyw0QkFBNEIsR0FBRyx5QkFBeUIsR0FBRyx5QkFBeUIsR0FBRyxzQkFBc0I7QUFDelIsZUFBZSxtQkFBTyxDQUFDLGtEQUFRO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBLHdFQUF3RSxXQUFXLHFDQUFxQyxhQUFhO0FBQ3JJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRIQUE0SCxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsV0FBVztBQUNySztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlEO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQSwrREFBK0Qsd0JBQXdCLDJIQUEySDtBQUNsTjtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3RKYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELHFCQUFxQjtBQUNyQixvQkFBb0IsbUJBQU8sQ0FBQywyREFBaUI7QUFDN0M7QUFDQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCwrQkFBK0Isb0JBQW9CLDhCQUE4QixZQUFZLEdBQUc7QUFDbko7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsbUJBQU8sQ0FBQywwREFBVztBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNERBQTRELFdBQVcsc0JBQXNCO0FBQzdGO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjs7Ozs7Ozs7Ozs7O0FDckRSO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLG9DQUFvQyxnQkFBZ0I7QUFDdkYsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGFBQWEsbUJBQU8sQ0FBQyxnREFBTztBQUM1QixhQUFhLG1CQUFPLENBQUMsb0VBQWlCOzs7Ozs7Ozs7Ozs7Ozs7O0FDMUIvQjs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDQVA7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7OztBQ05rRDtBQUNkO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLHdCQUF3QixpREFBYTtBQUNyQztBQUNBLEtBQUs7QUFDTCxpQkFBaUIsNkNBQVM7QUFDMUIsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsK0JBQStCLHlDQUF5QztBQUN4RSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1YsNERBQTRELGNBQWM7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4Qyw2Q0FBRztBQUNqRDtBQUNBLHVCQUF1Qiw2Q0FBRztBQUMxQjtBQUNBO0FBQ0EsbUNBQW1DLENBQUMsNkNBQUcsV0FBVztBQUNsRDtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsbUNBQW1DLENBQUMsNkNBQUcsYUFBYTtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2FkYXB0ZXJzL3hoci5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9DYW5jZWxUb2tlbi5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NhbmNlbC9pc0NhbmNlbC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL0ludGVyY2VwdG9yTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvYnVpbGRGdWxsUGF0aC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvZW5oYW5jZUVycm9yLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9tZXJnZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvc2V0dGxlLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS90cmFuc2Zvcm1EYXRhLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9kZWZhdWx0cy90cmFuc2l0aW9uYWwuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9lbnYvZGF0YS5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYmluZC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvYnVpbGRVUkwuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2NvbWJpbmVVUkxzLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9jb29raWVzLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0Fic29sdXRlVVJMLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9pc0F4aW9zRXJyb3IuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbi5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZS5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvcGFyc2VIZWFkZXJzLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL3V0aWxzLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9mb3JtLWRhdGEvbGliL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyLy4vbm9kZV9tb2R1bGVzL29wZW5haS9kaXN0L2FwaS5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvb3BlbmFpL2Rpc3QvYmFzZS5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9ub2RlX21vZHVsZXMvb3BlbmFpL2Rpc3QvY29tbW9uLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9vcGVuYWkvZGlzdC9jb25maWd1cmF0aW9uLmpzIiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL25vZGVfbW9kdWxlcy9vcGVuYWkvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvLi9zcmMvc3RvcmFnZV9rZXkuanMiLCJ3ZWJwYWNrOi8vY292ZXItbGV0dGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NvdmVyLWxldHRlci93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9jb3Zlci1sZXR0ZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NvdmVyLWxldHRlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NvdmVyLWxldHRlci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NvdmVyLWxldHRlci8uL3NyYy9jb250ZXh0X21lbnUuanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9heGlvcycpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xudmFyIHRyYW5zaXRpb25hbERlZmF1bHRzID0gcmVxdWlyZSgnLi4vZGVmYXVsdHMvdHJhbnNpdGlvbmFsJyk7XG52YXIgQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL0NhbmNlbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgdmFyIG9uQ2FuY2VsZWQ7XG4gICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnVuc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY29uZmlnLnNpZ25hbCkge1xuICAgICAgICBjb25maWcuc2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0Jywgb25DYW5jZWxlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEocmVxdWVzdERhdGEpKSB7XG4gICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddOyAvLyBMZXQgdGhlIGJyb3dzZXIgc2V0IGl0XG4gICAgfVxuXG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgICBpZiAoY29uZmlnLmF1dGgpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IGNvbmZpZy5hdXRoLnVzZXJuYW1lIHx8ICcnO1xuICAgICAgdmFyIHBhc3N3b3JkID0gY29uZmlnLmF1dGgucGFzc3dvcmQgPyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoY29uZmlnLmF1dGgucGFzc3dvcmQpKSA6ICcnO1xuICAgICAgcmVxdWVzdEhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYnRvYSh1c2VybmFtZSArICc6JyArIHBhc3N3b3JkKTtcbiAgICB9XG5cbiAgICB2YXIgZnVsbFBhdGggPSBidWlsZEZ1bGxQYXRoKGNvbmZpZy5iYXNlVVJMLCBjb25maWcudXJsKTtcbiAgICByZXF1ZXN0Lm9wZW4oY29uZmlnLm1ldGhvZC50b1VwcGVyQ2FzZSgpLCBidWlsZFVSTChmdWxsUGF0aCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLCB0cnVlKTtcblxuICAgIC8vIFNldCB0aGUgcmVxdWVzdCB0aW1lb3V0IGluIE1TXG4gICAgcmVxdWVzdC50aW1lb3V0ID0gY29uZmlnLnRpbWVvdXQ7XG5cbiAgICBmdW5jdGlvbiBvbmxvYWRlbmQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gUHJlcGFyZSB0aGUgcmVzcG9uc2VcbiAgICAgIHZhciByZXNwb25zZUhlYWRlcnMgPSAnZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJyBpbiByZXF1ZXN0ID8gcGFyc2VIZWFkZXJzKHJlcXVlc3QuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpIDogbnVsbDtcbiAgICAgIHZhciByZXNwb25zZURhdGEgPSAhcmVzcG9uc2VUeXBlIHx8IHJlc3BvbnNlVHlwZSA9PT0gJ3RleHQnIHx8ICByZXNwb25zZVR5cGUgPT09ICdqc29uJyA/XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUZXh0IDogcmVxdWVzdC5yZXNwb25zZTtcbiAgICAgIHZhciByZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcmVzcG9uc2VEYXRhLFxuICAgICAgICBzdGF0dXM6IHJlcXVlc3Quc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0OiByZXF1ZXN0LnN0YXR1c1RleHQsXG4gICAgICAgIGhlYWRlcnM6IHJlc3BvbnNlSGVhZGVycyxcbiAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgIHJlcXVlc3Q6IHJlcXVlc3RcbiAgICAgIH07XG5cbiAgICAgIHNldHRsZShmdW5jdGlvbiBfcmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSwgZnVuY3Rpb24gX3JlamVjdChlcnIpIHtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0sIHJlc3BvbnNlKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKCdvbmxvYWRlbmQnIGluIHJlcXVlc3QpIHtcbiAgICAgIC8vIFVzZSBvbmxvYWRlbmQgaWYgYXZhaWxhYmxlXG4gICAgICByZXF1ZXN0Lm9ubG9hZGVuZCA9IG9ubG9hZGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTGlzdGVuIGZvciByZWFkeSBzdGF0ZSB0byBlbXVsYXRlIG9ubG9hZGVuZFxuICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiBoYW5kbGVMb2FkKCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIHJlcXVlc3QgZXJyb3JlZCBvdXQgYW5kIHdlIGRpZG4ndCBnZXQgYSByZXNwb25zZSwgdGhpcyB3aWxsIGJlXG4gICAgICAgIC8vIGhhbmRsZWQgYnkgb25lcnJvciBpbnN0ZWFkXG4gICAgICAgIC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHN0YXR1cyBhcyAwIGV2ZW4gdGhvdWdoIGl0J3MgYSBzdWNjZXNzZnVsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwICYmICEocmVxdWVzdC5yZXNwb25zZVVSTCAmJiByZXF1ZXN0LnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlYWR5c3RhdGUgaGFuZGxlciBpcyBjYWxsaW5nIGJlZm9yZSBvbmVycm9yIG9yIG9udGltZW91dCBoYW5kbGVycyxcbiAgICAgICAgLy8gc28gd2Ugc2hvdWxkIGNhbGwgb25sb2FkZW5kIG9uIHRoZSBuZXh0ICd0aWNrJ1xuICAgICAgICBzZXRUaW1lb3V0KG9ubG9hZGVuZCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBicm93c2VyIHJlcXVlc3QgY2FuY2VsbGF0aW9uIChhcyBvcHBvc2VkIHRvIGEgbWFudWFsIGNhbmNlbGxhdGlvbilcbiAgICByZXF1ZXN0Lm9uYWJvcnQgPSBmdW5jdGlvbiBoYW5kbGVBYm9ydCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignUmVxdWVzdCBhYm9ydGVkJywgY29uZmlnLCAnRUNPTk5BQk9SVEVEJywgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIGxvdyBsZXZlbCBuZXR3b3JrIGVycm9yc1xuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uIGhhbmRsZUVycm9yKCkge1xuICAgICAgLy8gUmVhbCBlcnJvcnMgYXJlIGhpZGRlbiBmcm9tIHVzIGJ5IHRoZSBicm93c2VyXG4gICAgICAvLyBvbmVycm9yIHNob3VsZCBvbmx5IGZpcmUgaWYgaXQncyBhIG5ldHdvcmsgZXJyb3JcbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcignTmV0d29yayBFcnJvcicsIGNvbmZpZywgbnVsbCwgcmVxdWVzdCkpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gSGFuZGxlIHRpbWVvdXRcbiAgICByZXF1ZXN0Lm9udGltZW91dCA9IGZ1bmN0aW9uIGhhbmRsZVRpbWVvdXQoKSB7XG4gICAgICB2YXIgdGltZW91dEVycm9yTWVzc2FnZSA9IGNvbmZpZy50aW1lb3V0ID8gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyA6ICd0aW1lb3V0IGV4Y2VlZGVkJztcbiAgICAgIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsIHx8IHRyYW5zaXRpb25hbERlZmF1bHRzO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICB0cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbiB8fCBjb25maWcuc2lnbmFsKSB7XG4gICAgICAvLyBIYW5kbGUgY2FuY2VsbGF0aW9uXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgICAgb25DYW5jZWxlZCA9IGZ1bmN0aW9uKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVqZWN0KCFjYW5jZWwgfHwgKGNhbmNlbCAmJiBjYW5jZWwudHlwZSkgPyBuZXcgQ2FuY2VsKCdjYW5jZWxlZCcpIDogY2FuY2VsKTtcbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH07XG5cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbiAmJiBjb25maWcuY2FuY2VsVG9rZW4uc3Vic2NyaWJlKG9uQ2FuY2VsZWQpO1xuICAgICAgaWYgKGNvbmZpZy5zaWduYWwpIHtcbiAgICAgICAgY29uZmlnLnNpZ25hbC5hYm9ydGVkID8gb25DYW5jZWxlZCgpIDogY29uZmlnLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQ2FuY2VsZWQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIC8vIEZhY3RvcnkgZm9yIGNyZWF0aW5nIG5ldyBpbnN0YW5jZXNcbiAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGRlZmF1bHRDb25maWcsIGluc3RhbmNlQ29uZmlnKSk7XG4gIH07XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBFeHBvc2UgQ2FuY2VsICYgQ2FuY2VsVG9rZW5cbmF4aW9zLkNhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbCcpO1xuYXhpb3MuQ2FuY2VsVG9rZW4gPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWxUb2tlbicpO1xuYXhpb3MuaXNDYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9pc0NhbmNlbCcpO1xuYXhpb3MuVkVSU0lPTiA9IHJlcXVpcmUoJy4vZW52L2RhdGEnKS52ZXJzaW9uO1xuXG4vLyBFeHBvc2UgYWxsL3NwcmVhZFxuYXhpb3MuYWxsID0gZnVuY3Rpb24gYWxsKHByb21pc2VzKSB7XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59O1xuYXhpb3Muc3ByZWFkID0gcmVxdWlyZSgnLi9oZWxwZXJzL3NwcmVhZCcpO1xuXG4vLyBFeHBvc2UgaXNBeGlvc0Vycm9yXG5heGlvcy5pc0F4aW9zRXJyb3IgPSByZXF1aXJlKCcuL2hlbHBlcnMvaXNBeGlvc0Vycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXhpb3M7XG5cbi8vIEFsbG93IHVzZSBvZiBkZWZhdWx0IGltcG9ydCBzeW50YXggaW4gVHlwZVNjcmlwdFxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG5cbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4oZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgaWYgKCF0b2tlbi5fbGlzdGVuZXJzKSByZXR1cm47XG5cbiAgICB2YXIgaTtcbiAgICB2YXIgbCA9IHRva2VuLl9saXN0ZW5lcnMubGVuZ3RoO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4uX2xpc3RlbmVyc1tpXShjYW5jZWwpO1xuICAgIH1cbiAgICB0b2tlbi5fbGlzdGVuZXJzID0gbnVsbDtcbiAgfSk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgdGhpcy5wcm9taXNlLnRoZW4gPSBmdW5jdGlvbihvbmZ1bGZpbGxlZCkge1xuICAgIHZhciBfcmVzb2x2ZTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgdG9rZW4uc3Vic2NyaWJlKHJlc29sdmUpO1xuICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgIH0pLnRoZW4ob25mdWxmaWxsZWQpO1xuXG4gICAgcHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbiByZWplY3QoKSB7XG4gICAgICB0b2tlbi51bnN1YnNjcmliZShfcmVzb2x2ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9O1xuXG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZSB0byB0aGUgY2FuY2VsIHNpZ25hbFxuICovXG5cbkNhbmNlbFRva2VuLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKHRoaXMucmVhc29uKSB7XG4gICAgbGlzdGVuZXIodGhpcy5yZWFzb24pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW2xpc3RlbmVyXTtcbiAgfVxufTtcblxuLyoqXG4gKiBVbnN1YnNjcmliZSBmcm9tIHRoZSBjYW5jZWwgc2lnbmFsXG4gKi9cblxuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24gdW5zdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gdGhpcy5fbGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBhIG5ldyBgQ2FuY2VsVG9rZW5gIGFuZCBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gY2FsbGVkLFxuICogY2FuY2VscyB0aGUgYENhbmNlbFRva2VuYC5cbiAqL1xuQ2FuY2VsVG9rZW4uc291cmNlID0gZnVuY3Rpb24gc291cmNlKCkge1xuICB2YXIgY2FuY2VsO1xuICB2YXIgdG9rZW4gPSBuZXcgQ2FuY2VsVG9rZW4oZnVuY3Rpb24gZXhlY3V0b3IoYykge1xuICAgIGNhbmNlbCA9IGM7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIHRva2VuOiB0b2tlbixcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWxUb2tlbjtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWdPclVybCwgY29uZmlnKSB7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICAvLyBBbGxvdyBmb3IgYXhpb3MoJ2V4YW1wbGUvdXJsJ1ssIGNvbmZpZ10pIGEgbGEgZmV0Y2ggQVBJXG4gIGlmICh0eXBlb2YgY29uZmlnT3JVcmwgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBjb25maWdPclVybDtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWdPclVybCB8fCB7fTtcbiAgfVxuXG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgLy8gU2V0IGNvbmZpZy5tZXRob2RcbiAgaWYgKGNvbmZpZy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdHMubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IHRoaXMuZGVmYXVsdHMubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnLm1ldGhvZCA9ICdnZXQnO1xuICB9XG5cbiAgdmFyIHRyYW5zaXRpb25hbCA9IGNvbmZpZy50cmFuc2l0aW9uYWw7XG5cbiAgaWYgKHRyYW5zaXRpb25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsaWRhdG9yLmFzc2VydE9wdGlvbnModHJhbnNpdGlvbmFsLCB7XG4gICAgICBzaWxlbnRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKSxcbiAgICAgIGZvcmNlZEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4pLFxuICAgICAgY2xhcmlmeVRpbWVvdXRFcnJvcjogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuKVxuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8vIGZpbHRlciBvdXQgc2tpcHBlZCBpbnRlcmNlcHRvcnNcbiAgdmFyIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHZhciBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSB0cnVlO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXF1ZXN0LmZvckVhY2goZnVuY3Rpb24gdW5zaGlmdFJlcXVlc3RJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICBpZiAodHlwZW9mIGludGVyY2VwdG9yLnJ1bldoZW4gPT09ICdmdW5jdGlvbicgJiYgaW50ZXJjZXB0b3IucnVuV2hlbihjb25maWcpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvci5zeW5jaHJvbm91cztcblxuICAgIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnVuc2hpZnQoaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVzcG9uc2UuZm9yRWFjaChmdW5jdGlvbiBwdXNoUmVzcG9uc2VJbnRlcmNlcHRvcnMoaW50ZXJjZXB0b3IpIHtcbiAgICByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ucHVzaChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHByb21pc2U7XG5cbiAgaWYgKCFzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMpIHtcbiAgICB2YXIgY2hhaW4gPSBbZGlzcGF0Y2hSZXF1ZXN0LCB1bmRlZmluZWRdO1xuXG4gICAgQXJyYXkucHJvdG90eXBlLnVuc2hpZnQuYXBwbHkoY2hhaW4sIHJlcXVlc3RJbnRlcmNlcHRvckNoYWluKTtcbiAgICBjaGFpbiA9IGNoYWluLmNvbmNhdChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4pO1xuXG4gICAgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGgpIHtcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oY2hhaW4uc2hpZnQoKSwgY2hhaW4uc2hpZnQoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuXG4gIHZhciBuZXdDb25maWcgPSBjb25maWc7XG4gIHdoaWxlIChyZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICB2YXIgb25GdWxmaWxsZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHZhciBvblJlamVjdGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB0cnkge1xuICAgICAgbmV3Q29uZmlnID0gb25GdWxmaWxsZWQobmV3Q29uZmlnKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgb25SZWplY3RlZChlcnJvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIHByb21pc2UgPSBkaXNwYXRjaFJlcXVlc3QobmV3Q29uZmlnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG5cbiAgd2hpbGUgKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5sZW5ndGgpIHtcbiAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpLCByZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5cbkF4aW9zLnByb3RvdHlwZS5nZXRVcmkgPSBmdW5jdGlvbiBnZXRVcmkoY29uZmlnKSB7XG4gIGNvbmZpZyA9IG1lcmdlQ29uZmlnKHRoaXMuZGVmYXVsdHMsIGNvbmZpZyk7XG4gIHJldHVybiBidWlsZFVSTChjb25maWcudXJsLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplcikucmVwbGFjZSgvXlxcPy8sICcnKTtcbn07XG5cbi8vIFByb3ZpZGUgYWxpYXNlcyBmb3Igc3VwcG9ydGVkIHJlcXVlc3QgbWV0aG9kc1xudXRpbHMuZm9yRWFjaChbJ2RlbGV0ZScsICdnZXQnLCAnaGVhZCcsICdvcHRpb25zJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IChjb25maWcgfHwge30pLmRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGRhdGEsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF4aW9zO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbmZ1bmN0aW9uIEludGVyY2VwdG9yTWFuYWdlcigpIHtcbiAgdGhpcy5oYW5kbGVycyA9IFtdO1xufVxuXG4vKipcbiAqIEFkZCBhIG5ldyBpbnRlcmNlcHRvciB0byB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdWxmaWxsZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgdGhlbmAgZm9yIGEgYFByb21pc2VgXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3RlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGByZWplY3RgIGZvciBhIGBQcm9taXNlYFxuICpcbiAqIEByZXR1cm4ge051bWJlcn0gQW4gSUQgdXNlZCB0byByZW1vdmUgaW50ZXJjZXB0b3IgbGF0ZXJcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbiB1c2UoZnVsZmlsbGVkLCByZWplY3RlZCwgb3B0aW9ucykge1xuICB0aGlzLmhhbmRsZXJzLnB1c2goe1xuICAgIGZ1bGZpbGxlZDogZnVsZmlsbGVkLFxuICAgIHJlamVjdGVkOiByZWplY3RlZCxcbiAgICBzeW5jaHJvbm91czogb3B0aW9ucyA/IG9wdGlvbnMuc3luY2hyb25vdXMgOiBmYWxzZSxcbiAgICBydW5XaGVuOiBvcHRpb25zID8gb3B0aW9ucy5ydW5XaGVuIDogbnVsbFxuICB9KTtcbiAgcmV0dXJuIHRoaXMuaGFuZGxlcnMubGVuZ3RoIC0gMTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGludGVyY2VwdG9yIGZyb20gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGlkIFRoZSBJRCB0aGF0IHdhcyByZXR1cm5lZCBieSBgdXNlYFxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmVqZWN0ID0gZnVuY3Rpb24gZWplY3QoaWQpIHtcbiAgaWYgKHRoaXMuaGFuZGxlcnNbaWRdKSB7XG4gICAgdGhpcy5oYW5kbGVyc1tpZF0gPSBudWxsO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgaW50ZXJjZXB0b3JzXG4gKlxuICogVGhpcyBtZXRob2QgaXMgcGFydGljdWxhcmx5IHVzZWZ1bCBmb3Igc2tpcHBpbmcgb3ZlciBhbnlcbiAqIGludGVyY2VwdG9ycyB0aGF0IG1heSBoYXZlIGJlY29tZSBgbnVsbGAgY2FsbGluZyBgZWplY3RgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBmdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIGludGVyY2VwdG9yXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goZm4pIHtcbiAgdXRpbHMuZm9yRWFjaCh0aGlzLmhhbmRsZXJzLCBmdW5jdGlvbiBmb3JFYWNoSGFuZGxlcihoKSB7XG4gICAgaWYgKGggIT09IG51bGwpIHtcbiAgICAgIGZuKGgpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEludGVyY2VwdG9yTWFuYWdlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4uL2NhbmNlbC9DYW5jZWwnKTtcblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5mdW5jdGlvbiB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZykge1xuICBpZiAoY29uZmlnLmNhbmNlbFRva2VuKSB7XG4gICAgY29uZmlnLmNhbmNlbFRva2VuLnRocm93SWZSZXF1ZXN0ZWQoKTtcbiAgfVxuXG4gIGlmIChjb25maWcuc2lnbmFsICYmIGNvbmZpZy5zaWduYWwuYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBDYW5jZWwoJ2NhbmNlbGVkJyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGUsXG4gICAgICBzdGF0dXM6IHRoaXMucmVzcG9uc2UgJiYgdGhpcy5yZXNwb25zZS5zdGF0dXMgPyB0aGlzLnJlc3BvbnNlLnN0YXR1cyA6IG51bGxcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGVlcFByb3BlcnRpZXMocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIHZhbHVlRnJvbUNvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIHJldHVybiBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb25zaXN0ZW50LXJldHVyblxuICBmdW5jdGlvbiBkZWZhdWx0VG9Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNvbnNpc3RlbnQtcmV0dXJuXG4gIGZ1bmN0aW9uIG1lcmdlRGlyZWN0S2V5cyhwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgcmV0dXJuIGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICByZXR1cm4gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB2YXIgbWVyZ2VNYXAgPSB7XG4gICAgJ3VybCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ21ldGhvZCc6IHZhbHVlRnJvbUNvbmZpZzIsXG4gICAgJ2RhdGEnOiB2YWx1ZUZyb21Db25maWcyLFxuICAgICdiYXNlVVJMJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndHJhbnNmb3JtUmVxdWVzdCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zZm9ybVJlc3BvbnNlJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAncGFyYW1zU2VyaWFsaXplcic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RpbWVvdXQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd0aW1lb3V0TWVzc2FnZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3dpdGhDcmVkZW50aWFscyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2FkYXB0ZXInOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZVR5cGUnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICd4c3JmQ29va2llTmFtZSc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3hzcmZIZWFkZXJOYW1lJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnb25VcGxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ29uRG93bmxvYWRQcm9ncmVzcyc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2RlY29tcHJlc3MnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdtYXhDb250ZW50TGVuZ3RoJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAnbWF4Qm9keUxlbmd0aCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3RyYW5zcG9ydCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBBZ2VudCc6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ2h0dHBzQWdlbnQnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdjYW5jZWxUb2tlbic6IGRlZmF1bHRUb0NvbmZpZzIsXG4gICAgJ3NvY2tldFBhdGgnOiBkZWZhdWx0VG9Db25maWcyLFxuICAgICdyZXNwb25zZUVuY29kaW5nJzogZGVmYXVsdFRvQ29uZmlnMixcbiAgICAndmFsaWRhdGVTdGF0dXMnOiBtZXJnZURpcmVjdEtleXNcbiAgfTtcblxuICB1dGlscy5mb3JFYWNoKE9iamVjdC5rZXlzKGNvbmZpZzEpLmNvbmNhdChPYmplY3Qua2V5cyhjb25maWcyKSksIGZ1bmN0aW9uIGNvbXB1dGVDb25maWdWYWx1ZShwcm9wKSB7XG4gICAgdmFyIG1lcmdlID0gbWVyZ2VNYXBbcHJvcF0gfHwgbWVyZ2VEZWVwUHJvcGVydGllcztcbiAgICB2YXIgY29uZmlnVmFsdWUgPSBtZXJnZShwcm9wKTtcbiAgICAodXRpbHMuaXNVbmRlZmluZWQoY29uZmlnVmFsdWUpICYmIG1lcmdlICE9PSBtZXJnZURpcmVjdEtleXMpIHx8IChjb25maWdbcHJvcF0gPSBjb25maWdWYWx1ZSk7XG4gIH0pO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuL2NyZWF0ZUVycm9yJyk7XG5cbi8qKlxuICogUmVzb2x2ZSBvciByZWplY3QgYSBQcm9taXNlIGJhc2VkIG9uIHJlc3BvbnNlIHN0YXR1cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlIEEgZnVuY3Rpb24gdGhhdCByZXNvbHZlcyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdCBBIGZ1bmN0aW9uIHRoYXQgcmVqZWN0cyB0aGUgcHJvbWlzZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSByZXNwb25zZSBUaGUgcmVzcG9uc2UuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpIHtcbiAgdmFyIHZhbGlkYXRlU3RhdHVzID0gcmVzcG9uc2UuY29uZmlnLnZhbGlkYXRlU3RhdHVzO1xuICBpZiAoIXJlc3BvbnNlLnN0YXR1cyB8fCAhdmFsaWRhdGVTdGF0dXMgfHwgdmFsaWRhdGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xuICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICB9IGVsc2Uge1xuICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyBjb2RlICcgKyByZXNwb25zZS5zdGF0dXMsXG4gICAgICByZXNwb25zZS5jb25maWcsXG4gICAgICBudWxsLFxuICAgICAgcmVzcG9uc2UucmVxdWVzdCxcbiAgICAgIHJlc3BvbnNlXG4gICAgKSk7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVHJhbnNmb3JtIHRoZSBkYXRhIGZvciBhIHJlcXVlc3Qgb3IgYSByZXNwb25zZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gZGF0YSBUaGUgZGF0YSB0byBiZSB0cmFuc2Zvcm1lZFxuICogQHBhcmFtIHtBcnJheX0gaGVhZGVycyBUaGUgaGVhZGVycyBmb3IgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2VcbiAqIEBwYXJhbSB7QXJyYXl8RnVuY3Rpb259IGZucyBBIHNpbmdsZSBmdW5jdGlvbiBvciBBcnJheSBvZiBmdW5jdGlvbnNcbiAqIEByZXR1cm5zIHsqfSBUaGUgcmVzdWx0aW5nIHRyYW5zZm9ybWVkIGRhdGFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB0cmFuc2Zvcm1EYXRhKGRhdGEsIGhlYWRlcnMsIGZucykge1xuICB2YXIgY29udGV4dCA9IHRoaXMgfHwgZGVmYXVsdHM7XG4gIC8qZXNsaW50IG5vLXBhcmFtLXJlYXNzaWduOjAqL1xuICB1dGlscy5mb3JFYWNoKGZucywgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XG4gICAgZGF0YSA9IGZuLmNhbGwoY29udGV4dCwgZGF0YSwgaGVhZGVycyk7XG4gIH0pO1xuXG4gIHJldHVybiBkYXRhO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi4vaGVscGVycy9ub3JtYWxpemVIZWFkZXJOYW1lJyk7XG52YXIgZW5oYW5jZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9lbmhhbmNlRXJyb3InKTtcbnZhciB0cmFuc2l0aW9uYWxEZWZhdWx0cyA9IHJlcXVpcmUoJy4vdHJhbnNpdGlvbmFsJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4uL2FkYXB0ZXJzL3hocicpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIC8vIEZvciBub2RlIHVzZSBIVFRQIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDogdHJhbnNpdGlvbmFsRGVmYXVsdHMsXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsIHx8IGRlZmF1bHRzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH0sXG5cbiAgaGVhZGVyczoge1xuICAgIGNvbW1vbjoge1xuICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gICAgfVxuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2lsZW50SlNPTlBhcnNpbmc6IHRydWUsXG4gIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcInZlcnNpb25cIjogXCIwLjI2LjFcIlxufTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcCgpIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuICAgIHJldHVybiBmbi5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgfTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgc3BlY2lmaWVkIFVSTHNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZWxhdGl2ZVVSTCBUaGUgcmVsYXRpdmUgVVJMXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tYmluZWQgVVJMXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVsYXRpdmVVUkwpIHtcbiAgcmV0dXJuIHJlbGF0aXZlVVJMXG4gICAgPyBiYXNlVVJMLnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgcmVsYXRpdmVVUkwucmVwbGFjZSgvXlxcLysvLCAnJylcbiAgICA6IGJhc2VVUkw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBzcGVjaWZpZWQgVVJMIGlzIGFic29sdXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0Fic29sdXRlVVJMKHVybCkge1xuICAvLyBBIFVSTCBpcyBjb25zaWRlcmVkIGFic29sdXRlIGlmIGl0IGJlZ2lucyB3aXRoIFwiPHNjaGVtZT46Ly9cIiBvciBcIi8vXCIgKHByb3RvY29sLXJlbGF0aXZlIFVSTCkuXG4gIC8vIFJGQyAzOTg2IGRlZmluZXMgc2NoZW1lIG5hbWUgYXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIGJlZ2lubmluZyB3aXRoIGEgbGV0dGVyIGFuZCBmb2xsb3dlZFxuICAvLyBieSBhbnkgY29tYmluYXRpb24gb2YgbGV0dGVycywgZGlnaXRzLCBwbHVzLCBwZXJpb2QsIG9yIGh5cGhlbi5cbiAgcmV0dXJuIC9eKFthLXpdW2EtelxcZCtcXC0uXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvc1xuICpcbiAqIEBwYXJhbSB7Kn0gcGF5bG9hZCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0F4aW9zRXJyb3IocGF5bG9hZCkge1xuICByZXR1cm4gdXRpbHMuaXNPYmplY3QocGF5bG9hZCkgJiYgKHBheWxvYWQuaXNBeGlvc0Vycm9yID09PSB0cnVlKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBoYXZlIGZ1bGwgc3VwcG9ydCBvZiB0aGUgQVBJcyBuZWVkZWQgdG8gdGVzdFxuICAvLyB3aGV0aGVyIHRoZSByZXF1ZXN0IFVSTCBpcyBvZiB0aGUgc2FtZSBvcmlnaW4gYXMgY3VycmVudCBsb2NhdGlvbi5cbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgdmFyIG1zaWUgPSAvKG1zaWV8dHJpZGVudCkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICAgICAgdmFyIHVybFBhcnNpbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdmFyIG9yaWdpblVSTDtcblxuICAgICAgLyoqXG4gICAgKiBQYXJzZSBhIFVSTCB0byBkaXNjb3ZlciBpdCdzIGNvbXBvbmVudHNcbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIFRoZSBVUkwgdG8gYmUgcGFyc2VkXG4gICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICovXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVVJMKHVybCkge1xuICAgICAgICB2YXIgaHJlZiA9IHVybDtcblxuICAgICAgICBpZiAobXNpZSkge1xuICAgICAgICAvLyBJRSBuZWVkcyBhdHRyaWJ1dGUgc2V0IHR3aWNlIHRvIG5vcm1hbGl6ZSBwcm9wZXJ0aWVzXG4gICAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG4gICAgICAgICAgaHJlZiA9IHVybFBhcnNpbmdOb2RlLmhyZWY7XG4gICAgICAgIH1cblxuICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcblxuICAgICAgICAvLyB1cmxQYXJzaW5nTm9kZSBwcm92aWRlcyB0aGUgVXJsVXRpbHMgaW50ZXJmYWNlIC0gaHR0cDovL3VybC5zcGVjLndoYXR3Zy5vcmcvI3VybHV0aWxzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaHJlZjogdXJsUGFyc2luZ05vZGUuaHJlZixcbiAgICAgICAgICBwcm90b2NvbDogdXJsUGFyc2luZ05vZGUucHJvdG9jb2wgPyB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbC5yZXBsYWNlKC86JC8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3Q6IHVybFBhcnNpbmdOb2RlLmhvc3QsXG4gICAgICAgICAgc2VhcmNoOiB1cmxQYXJzaW5nTm9kZS5zZWFyY2ggPyB1cmxQYXJzaW5nTm9kZS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhhc2g6IHVybFBhcnNpbmdOb2RlLmhhc2ggPyB1cmxQYXJzaW5nTm9kZS5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdG5hbWU6IHVybFBhcnNpbmdOb2RlLmhvc3RuYW1lLFxuICAgICAgICAgIHBvcnQ6IHVybFBhcnNpbmdOb2RlLnBvcnQsXG4gICAgICAgICAgcGF0aG5hbWU6ICh1cmxQYXJzaW5nTm9kZS5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJykgP1xuICAgICAgICAgICAgdXJsUGFyc2luZ05vZGUucGF0aG5hbWUgOlxuICAgICAgICAgICAgJy8nICsgdXJsUGFyc2luZ05vZGUucGF0aG5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgb3JpZ2luVVJMID0gcmVzb2x2ZVVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7XG5cbiAgICAgIC8qKlxuICAgICogRGV0ZXJtaW5lIGlmIGEgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgbG9jYXRpb25cbiAgICAqXG4gICAgKiBAcGFyYW0ge1N0cmluZ30gcmVxdWVzdFVSTCBUaGUgVVJMIHRvIHRlc3RcbiAgICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luLCBvdGhlcndpc2UgZmFsc2VcbiAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbihyZXF1ZXN0VVJMKSB7XG4gICAgICAgIHZhciBwYXJzZWQgPSAodXRpbHMuaXNTdHJpbmcocmVxdWVzdFVSTCkpID8gcmVzb2x2ZVVSTChyZXF1ZXN0VVJMKSA6IHJlcXVlc3RVUkw7XG4gICAgICAgIHJldHVybiAocGFyc2VkLnByb3RvY29sID09PSBvcmlnaW5VUkwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgIHBhcnNlZC5ob3N0ID09PSBvcmlnaW5VUkwuaG9zdCk7XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudnMgKHdlYiB3b3JrZXJzLCByZWFjdC1uYXRpdmUpIGxhY2sgbmVlZGVkIHN1cHBvcnQuXG4gICAgKGZ1bmN0aW9uIG5vblN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KSgpXG4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgbm9ybWFsaXplZE5hbWUpIHtcbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLCBmdW5jdGlvbiBwcm9jZXNzSGVhZGVyKHZhbHVlLCBuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IG5vcm1hbGl6ZWROYW1lICYmIG5hbWUudG9VcHBlckNhc2UoKSA9PT0gbm9ybWFsaXplZE5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgaGVhZGVyc1tub3JtYWxpemVkTmFtZV0gPSB2YWx1ZTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFZFUlNJT04gPSByZXF1aXJlKCcuLi9lbnYvZGF0YScpLnZlcnNpb247XG5cbnZhciB2YWxpZGF0b3JzID0ge307XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG5bJ29iamVjdCcsICdib29sZWFuJywgJ251bWJlcicsICdmdW5jdGlvbicsICdzdHJpbmcnLCAnc3ltYm9sJ10uZm9yRWFjaChmdW5jdGlvbih0eXBlLCBpKSB7XG4gIHZhbGlkYXRvcnNbdHlwZV0gPSBmdW5jdGlvbiB2YWxpZGF0b3IodGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSB0eXBlIHx8ICdhJyArIChpIDwgMSA/ICduICcgOiAnICcpICsgdHlwZTtcbiAgfTtcbn0pO1xuXG52YXIgZGVwcmVjYXRlZFdhcm5pbmdzID0ge307XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvciAtIHNldCB0byBmYWxzZSBpZiB0aGUgdHJhbnNpdGlvbmFsIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkXG4gKiBAcGFyYW0ge3N0cmluZz99IHZlcnNpb24gLSBkZXByZWNhdGVkIHZlcnNpb24gLyByZW1vdmVkIHNpbmNlIHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gbWVzc2FnZSAtIHNvbWUgbWVzc2FnZSB3aXRoIGFkZGl0aW9uYWwgaW5mb1xuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIFZFUlNJT04gKyAnXSBUcmFuc2l0aW9uYWwgb3B0aW9uIFxcJycgKyBvcHQgKyAnXFwnJyArIGRlc2MgKyAobWVzc2FnZSA/ICcuICcgKyBtZXNzYWdlIDogJycpO1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvcHQsIG9wdHMpIHtcbiAgICBpZiAodmFsaWRhdG9yID09PSBmYWxzZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGZvcm1hdE1lc3NhZ2Uob3B0LCAnIGhhcyBiZWVuIHJlbW92ZWQnICsgKHZlcnNpb24gPyAnIGluICcgKyB2ZXJzaW9uIDogJycpKSk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydE9wdGlvbnM6IGFzc2VydE9wdGlvbnMsXG4gIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnNcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGb3JtRGF0YV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmIChpc0FycmF5QnVmZmVyKHZhbC5idWZmZXIpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJpbmcsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgTnVtYmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBOdW1iZXIsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc051bWJlcih2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdudW1iZXInO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGFuIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsKSB7XG4gIGlmICh0b1N0cmluZy5jYWxsKHZhbCkgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih2YWwpO1xuICByZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIERhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIERhdGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZpbGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZpbGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0ZpbGUodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZpbGVdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJsb2JcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJsb2IsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Jsb2IodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEJsb2JdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZ1bmN0aW9uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGdW5jdGlvbiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJlYW1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmVhbSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyZWFtKHZhbCkge1xuICByZXR1cm4gaXNPYmplY3QodmFsKSAmJiBpc0Z1bmN0aW9uKHZhbC5waXBlKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFVSTFNlYXJjaFBhcmFtcyBvYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1VSTFNlYXJjaFBhcmFtcyh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgVVJMU2VhcmNoUGFyYW1zXSc7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgPyBzZWxmLkZvcm1EYXRhIDogd2luZG93LkZvcm1EYXRhO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuLyogZXNsaW50LWRpc2FibGUgKi9cbi8qKlxuICogT3BlbkFJIEFQSVxuICogQVBJcyBmb3Igc2FtcGxpbmcgZnJvbSBhbmQgZmluZS10dW5pbmcgbGFuZ3VhZ2UgbW9kZWxzXG4gKlxuICogVGhlIHZlcnNpb24gb2YgdGhlIE9wZW5BUEkgZG9jdW1lbnQ6IDEuMi4wXG4gKlxuICpcbiAqIE5PVEU6IFRoaXMgY2xhc3MgaXMgYXV0byBnZW5lcmF0ZWQgYnkgT3BlbkFQSSBHZW5lcmF0b3IgKGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaCkuXG4gKiBodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2hcbiAqIERvIG5vdCBlZGl0IHRoZSBjbGFzcyBtYW51YWxseS5cbiAqL1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk9wZW5BSUFwaSA9IGV4cG9ydHMuT3BlbkFJQXBpRmFjdG9yeSA9IGV4cG9ydHMuT3BlbkFJQXBpRnAgPSBleHBvcnRzLk9wZW5BSUFwaUF4aW9zUGFyYW1DcmVhdG9yID0gZXhwb3J0cy5DcmVhdGVJbWFnZVJlcXVlc3RSZXNwb25zZUZvcm1hdEVudW0gPSBleHBvcnRzLkNyZWF0ZUltYWdlUmVxdWVzdFNpemVFbnVtID0gZXhwb3J0cy5DaGF0Q29tcGxldGlvblJlc3BvbnNlTWVzc2FnZVJvbGVFbnVtID0gZXhwb3J0cy5DaGF0Q29tcGxldGlvblJlcXVlc3RNZXNzYWdlUm9sZUVudW0gPSB2b2lkIDA7XG5jb25zdCBheGlvc18xID0gcmVxdWlyZShcImF4aW9zXCIpO1xuLy8gU29tZSBpbXBvcnRzIG5vdCB1c2VkIGRlcGVuZGluZyBvbiB0ZW1wbGF0ZSBjb25kaXRpb25zXG4vLyBAdHMtaWdub3JlXG5jb25zdCBjb21tb25fMSA9IHJlcXVpcmUoXCIuL2NvbW1vblwiKTtcbi8vIEB0cy1pZ25vcmVcbmNvbnN0IGJhc2VfMSA9IHJlcXVpcmUoXCIuL2Jhc2VcIik7XG5leHBvcnRzLkNoYXRDb21wbGV0aW9uUmVxdWVzdE1lc3NhZ2VSb2xlRW51bSA9IHtcbiAgICBTeXN0ZW06ICdzeXN0ZW0nLFxuICAgIFVzZXI6ICd1c2VyJyxcbiAgICBBc3Npc3RhbnQ6ICdhc3Npc3RhbnQnXG59O1xuZXhwb3J0cy5DaGF0Q29tcGxldGlvblJlc3BvbnNlTWVzc2FnZVJvbGVFbnVtID0ge1xuICAgIFN5c3RlbTogJ3N5c3RlbScsXG4gICAgVXNlcjogJ3VzZXInLFxuICAgIEFzc2lzdGFudDogJ2Fzc2lzdGFudCdcbn07XG5leHBvcnRzLkNyZWF0ZUltYWdlUmVxdWVzdFNpemVFbnVtID0ge1xuICAgIF8yNTZ4MjU2OiAnMjU2eDI1NicsXG4gICAgXzUxMng1MTI6ICc1MTJ4NTEyJyxcbiAgICBfMTAyNHgxMDI0OiAnMTAyNHgxMDI0J1xufTtcbmV4cG9ydHMuQ3JlYXRlSW1hZ2VSZXF1ZXN0UmVzcG9uc2VGb3JtYXRFbnVtID0ge1xuICAgIFVybDogJ3VybCcsXG4gICAgQjY0SnNvbjogJ2I2NF9qc29uJ1xufTtcbi8qKlxuICogT3BlbkFJQXBpIC0gYXhpb3MgcGFyYW1ldGVyIGNyZWF0b3JcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5PcGVuQUlBcGlBeGlvc1BhcmFtQ3JlYXRvciA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEltbWVkaWF0ZWx5IGNhbmNlbCBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBjYW5jZWxcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNhbmNlbEZpbmVUdW5lOiAoZmluZVR1bmVJZCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdmaW5lVHVuZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjYW5jZWxGaW5lVHVuZScsICdmaW5lVHVuZUlkJywgZmluZVR1bmVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbmUtdHVuZXMve2ZpbmVfdHVuZV9pZH0vY2FuY2VsYFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKGB7JHtcImZpbmVfdHVuZV9pZFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGZpbmVUdW5lSWQpKSk7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQW5zd2VycyB0aGUgc3BlY2lmaWVkIHF1ZXN0aW9uIHVzaW5nIHRoZSBwcm92aWRlZCBkb2N1bWVudHMgYW5kIGV4YW1wbGVzLiAgVGhlIGVuZHBvaW50IGZpcnN0IFtzZWFyY2hlc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9zZWFyY2hlcykgb3ZlciBwcm92aWRlZCBkb2N1bWVudHMgb3IgZmlsZXMgdG8gZmluZCByZWxldmFudCBjb250ZXh0LiBUaGUgcmVsZXZhbnQgY29udGV4dCBpcyBjb21iaW5lZCB3aXRoIHRoZSBwcm92aWRlZCBleGFtcGxlcyBhbmQgcXVlc3Rpb24gdG8gY3JlYXRlIHRoZSBwcm9tcHQgZm9yIFtjb21wbGV0aW9uXSgvZG9jcy9hcGktcmVmZXJlbmNlL2NvbXBsZXRpb25zKS5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVBbnN3ZXJSZXF1ZXN0fSBjcmVhdGVBbnN3ZXJSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVBbnN3ZXI6IChjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUFuc3dlclJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUFuc3dlcicsICdjcmVhdGVBbnN3ZXJSZXF1ZXN0JywgY3JlYXRlQW5zd2VyUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2Fuc3dlcnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgY2hhdCBtZXNzYWdlXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0fSBjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNoYXRDb21wbGV0aW9uOiAoY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlQ2hhdENvbXBsZXRpb24nLCAnY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0JywgY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvY2hhdC9jb21wbGV0aW9uc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gY29tbW9uXzEuc2VyaWFsaXplRGF0YUlmTmVlZGVkKGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIHRoZSBzcGVjaWZpZWQgYHF1ZXJ5YCB1c2luZyBwcm92aWRlZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgdGhlIGxhYmVsZWQgZXhhbXBsZXMgdG8gc2VsZWN0IHRoZSBvbmVzIG1vc3QgcmVsZXZhbnQgZm9yIHRoZSBwYXJ0aWN1bGFyIHF1ZXJ5LiBUaGVuLCB0aGUgcmVsZXZhbnQgZXhhbXBsZXMgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHF1ZXJ5IHRvIGNvbnN0cnVjdCBhIHByb21wdCB0byBwcm9kdWNlIHRoZSBmaW5hbCBsYWJlbCB2aWEgdGhlIFtjb21wbGV0aW9uc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykgZW5kcG9pbnQuICBMYWJlbGVkIGV4YW1wbGVzIGNhbiBiZSBwcm92aWRlZCB2aWEgYW4gdXBsb2FkZWQgYGZpbGVgLCBvciBleHBsaWNpdGx5IGxpc3RlZCBpbiB0aGUgcmVxdWVzdCB1c2luZyB0aGUgYGV4YW1wbGVzYCBwYXJhbWV0ZXIgZm9yIHF1aWNrIHRlc3RzIGFuZCBzbWFsbCBzY2FsZSB1c2UgY2FzZXMuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0fSBjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNsYXNzaWZpY2F0aW9uOiAoY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2NyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlQ2xhc3NpZmljYXRpb24nLCAnY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0JywgY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvY2xhc3NpZmljYXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBsb2NhbFZhclJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgcHJvdmlkZWQgcHJvbXB0IGFuZCBwYXJhbWV0ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDb21wbGV0aW9uOiAoY3JlYXRlQ29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlQ29tcGxldGlvblJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUNvbXBsZXRpb24nLCAnY3JlYXRlQ29tcGxldGlvblJlcXVlc3QnLCBjcmVhdGVDb21wbGV0aW9uUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2NvbXBsZXRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlQ29tcGxldGlvblJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIG5ldyBlZGl0IGZvciB0aGUgcHJvdmlkZWQgaW5wdXQsIGluc3RydWN0aW9uLCBhbmQgcGFyYW1ldGVycy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVFZGl0UmVxdWVzdH0gY3JlYXRlRWRpdFJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUVkaXQ6IChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVFZGl0UmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlRWRpdCcsICdjcmVhdGVFZGl0UmVxdWVzdCcsIGNyZWF0ZUVkaXRSZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZWRpdHNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVFZGl0UmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGFuIGVtYmVkZGluZyB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCB0ZXh0LlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUVtYmVkZGluZ1JlcXVlc3R9IGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUVtYmVkZGluZzogKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlRW1iZWRkaW5nUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlRW1iZWRkaW5nJywgJ2NyZWF0ZUVtYmVkZGluZ1JlcXVlc3QnLCBjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZW1iZWRkaW5nc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ1BPU1QnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gY29tbW9uXzEuc2VyaWFsaXplRGF0YUlmTmVlZGVkKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVXBsb2FkIGEgZmlsZSB0aGF0IGNvbnRhaW5zIGRvY3VtZW50KHMpIHRvIGJlIHVzZWQgYWNyb3NzIHZhcmlvdXMgZW5kcG9pbnRzL2ZlYXR1cmVzLiBDdXJyZW50bHksIHRoZSBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdXBsb2FkZWQgYnkgb25lIG9yZ2FuaXphdGlvbiBjYW4gYmUgdXAgdG8gMSBHQi4gUGxlYXNlIGNvbnRhY3QgdXMgaWYgeW91IG5lZWQgdG8gaW5jcmVhc2UgdGhlIHN0b3JhZ2UgbGltaXQuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBOYW1lIG9mIHRoZSBbSlNPTiBMaW5lc10oaHR0cHM6Ly9qc29ubGluZXMucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0LykgZmlsZSB0byBiZSB1cGxvYWRlZC4gIElmIHRoZSAmI3g2MDtwdXJwb3NlJiN4NjA7IGlzIHNldCB0byBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDssIGVhY2ggbGluZSBpcyBhIEpTT04gcmVjb3JkIHdpdGggXFxcXFxcJnF1b3Q7cHJvbXB0XFxcXFxcJnF1b3Q7IGFuZCBcXFxcXFwmcXVvdDtjb21wbGV0aW9uXFxcXFxcJnF1b3Q7IGZpZWxkcyByZXByZXNlbnRpbmcgeW91ciBbdHJhaW5pbmcgZXhhbXBsZXNdKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZy9wcmVwYXJlLXRyYWluaW5nLWRhdGEpLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHVycG9zZSBUaGUgaW50ZW5kZWQgcHVycG9zZSBvZiB0aGUgdXBsb2FkZWQgZG9jdW1lbnRzLiAgVXNlIFxcXFxcXCZxdW90O2ZpbmUtdHVuZVxcXFxcXCZxdW90OyBmb3IgW0ZpbmUtdHVuaW5nXSgvZG9jcy9hcGktcmVmZXJlbmNlL2ZpbmUtdHVuZXMpLiBUaGlzIGFsbG93cyB1cyB0byB2YWxpZGF0ZSB0aGUgZm9ybWF0IG9mIHRoZSB1cGxvYWRlZCBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRmlsZTogKGZpbGUsIHB1cnBvc2UsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmlsZScgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlRmlsZScsICdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdwdXJwb3NlJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVGaWxlJywgJ3B1cnBvc2UnLCBwdXJwb3NlKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZmlsZXNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyRm9ybVBhcmFtcyA9IG5ldyAoKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5mb3JtRGF0YUN0b3IpIHx8IEZvcm1EYXRhKSgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwdXJwb3NlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdwdXJwb3NlJywgcHVycG9zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBsb2NhbFZhckZvcm1QYXJhbXMuZ2V0SGVhZGVycygpKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBsb2NhbFZhckZvcm1QYXJhbXM7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgam9iIHRoYXQgZmluZS10dW5lcyBhIHNwZWNpZmllZCBtb2RlbCBmcm9tIGEgZ2l2ZW4gZGF0YXNldC4gIFJlc3BvbnNlIGluY2x1ZGVzIGRldGFpbHMgb2YgdGhlIGVucXVldWVkIGpvYiBpbmNsdWRpbmcgam9iIHN0YXR1cyBhbmQgdGhlIG5hbWUgb2YgdGhlIGZpbmUtdHVuZWQgbW9kZWxzIG9uY2UgY29tcGxldGUuICBbTGVhcm4gbW9yZSBhYm91dCBGaW5lLXR1bmluZ10oL2RvY3MvZ3VpZGVzL2ZpbmUtdHVuaW5nKVxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUZpbmVUdW5lUmVxdWVzdH0gY3JlYXRlRmluZVR1bmVSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVGaW5lVHVuZTogKGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVGaW5lVHVuZVJlcXVlc3QnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUZpbmVUdW5lJywgJ2NyZWF0ZUZpbmVUdW5lUmVxdWVzdCcsIGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbmUtdHVuZXNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBpbWFnZSBnaXZlbiBhIHByb21wdC5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVJbWFnZVJlcXVlc3R9IGNyZWF0ZUltYWdlUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlSW1hZ2U6IChjcmVhdGVJbWFnZVJlcXVlc3QsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnY3JlYXRlSW1hZ2VSZXF1ZXN0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVJbWFnZScsICdjcmVhdGVJbWFnZVJlcXVlc3QnLCBjcmVhdGVJbWFnZVJlcXVlc3QpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9pbWFnZXMvZ2VuZXJhdGlvbnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVJbWFnZVJlcXVlc3QsIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlZGl0ZWQgb3IgZXh0ZW5kZWQgaW1hZ2UgZ2l2ZW4gYW4gb3JpZ2luYWwgaW1hZ2UgYW5kIGEgcHJvbXB0LlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byBlZGl0LiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuIElmIG1hc2sgaXMgbm90IHByb3ZpZGVkLCBpbWFnZSBtdXN0IGhhdmUgdHJhbnNwYXJlbmN5LCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgdGhlIG1hc2suXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9tcHQgQSB0ZXh0IGRlc2NyaXB0aW9uIG9mIHRoZSBkZXNpcmVkIGltYWdlKHMpLiBUaGUgbWF4aW11bSBsZW5ndGggaXMgMTAwMCBjaGFyYWN0ZXJzLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IFttYXNrXSBBbiBhZGRpdGlvbmFsIGltYWdlIHdob3NlIGZ1bGx5IHRyYW5zcGFyZW50IGFyZWFzIChlLmcuIHdoZXJlIGFscGhhIGlzIHplcm8pIGluZGljYXRlIHdoZXJlICYjeDYwO2ltYWdlJiN4NjA7IHNob3VsZCBiZSBlZGl0ZWQuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIGhhdmUgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyAmI3g2MDtpbWFnZSYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IFtuXSBUaGUgbnVtYmVyIG9mIGltYWdlcyB0byBnZW5lcmF0ZS4gTXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NpemVdIFRoZSBzaXplIG9mIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDsyNTZ4MjU2JiN4NjA7LCAmI3g2MDs1MTJ4NTEyJiN4NjA7LCBvciAmI3g2MDsxMDI0eDEwMjQmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgaW4gd2hpY2ggdGhlIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHJldHVybmVkLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDt1cmwmI3g2MDsgb3IgJiN4NjA7YjY0X2pzb24mI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbdXNlcl0gQSB1bmlxdWUgaWRlbnRpZmllciByZXByZXNlbnRpbmcgeW91ciBlbmQtdXNlciwgd2hpY2ggY2FuIGhlbHAgT3BlbkFJIHRvIG1vbml0b3IgYW5kIGRldGVjdCBhYnVzZS4gW0xlYXJuIG1vcmVdKC9kb2NzL2d1aWRlcy9zYWZldHktYmVzdC1wcmFjdGljZXMvZW5kLXVzZXItaWRzKS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlRWRpdDogKGltYWdlLCBwcm9tcHQsIG1hc2ssIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ltYWdlJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVJbWFnZUVkaXQnLCAnaW1hZ2UnLCBpbWFnZSk7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdwcm9tcHQnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZUltYWdlRWRpdCcsICdwcm9tcHQnLCBwcm9tcHQpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9pbWFnZXMvZWRpdHNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyRm9ybVBhcmFtcyA9IG5ldyAoKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5mb3JtRGF0YUN0b3IpIHx8IEZvcm1EYXRhKSgpO1xuICAgICAgICAgICAgaWYgKGltYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdpbWFnZScsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXNrICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdtYXNrJywgbWFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJvbXB0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdwcm9tcHQnLCBwcm9tcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ24nLCBuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdzaXplJywgc2l6ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzcG9uc2VGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3Jlc3BvbnNlX2Zvcm1hdCcsIHJlc3BvbnNlRm9ybWF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1c2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCd1c2VyJywgdXNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBsb2NhbFZhckZvcm1QYXJhbXMuZ2V0SGVhZGVycygpKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBsb2NhbFZhckZvcm1QYXJhbXM7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgdmFyaWF0aW9uIG9mIGEgZ2l2ZW4gaW1hZ2UuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gaW1hZ2UgVGhlIGltYWdlIHRvIHVzZSBhcyB0aGUgYmFzaXMgZm9yIHRoZSB2YXJpYXRpb24ocykuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIHNxdWFyZS5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IFtuXSBUaGUgbnVtYmVyIG9mIGltYWdlcyB0byBnZW5lcmF0ZS4gTXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NpemVdIFRoZSBzaXplIG9mIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDsyNTZ4MjU2JiN4NjA7LCAmI3g2MDs1MTJ4NTEyJiN4NjA7LCBvciAmI3g2MDsxMDI0eDEwMjQmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgaW4gd2hpY2ggdGhlIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHJldHVybmVkLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDt1cmwmI3g2MDsgb3IgJiN4NjA7YjY0X2pzb24mI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbdXNlcl0gQSB1bmlxdWUgaWRlbnRpZmllciByZXByZXNlbnRpbmcgeW91ciBlbmQtdXNlciwgd2hpY2ggY2FuIGhlbHAgT3BlbkFJIHRvIG1vbml0b3IgYW5kIGRldGVjdCBhYnVzZS4gW0xlYXJuIG1vcmVdKC9kb2NzL2d1aWRlcy9zYWZldHktYmVzdC1wcmFjdGljZXMvZW5kLXVzZXItaWRzKS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlVmFyaWF0aW9uOiAoaW1hZ2UsIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ltYWdlJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVJbWFnZVZhcmlhdGlvbicsICdpbWFnZScsIGltYWdlKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvaW1hZ2VzL3ZhcmlhdGlvbnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyRm9ybVBhcmFtcyA9IG5ldyAoKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5mb3JtRGF0YUN0b3IpIHx8IEZvcm1EYXRhKSgpO1xuICAgICAgICAgICAgaWYgKGltYWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdpbWFnZScsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCduJywgbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnc2l6ZScsIHNpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdyZXNwb25zZV9mb3JtYXQnLCByZXNwb25zZUZvcm1hdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodXNlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgndXNlcicsIHVzZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgbG9jYWxWYXJGb3JtUGFyYW1zLmdldEhlYWRlcnMoKSksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gbG9jYWxWYXJGb3JtUGFyYW1zO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ2xhc3NpZmllcyBpZiB0ZXh0IHZpb2xhdGVzIE9wZW5BSVxcJ3MgQ29udGVudCBQb2xpY3lcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVNb2RlcmF0aW9uUmVxdWVzdH0gY3JlYXRlTW9kZXJhdGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZU1vZGVyYXRpb246IChjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlTW9kZXJhdGlvbicsICdjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCcsIGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0KTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvbW9kZXJhdGlvbnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyWydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuZGF0YSA9IGNvbW1vbl8xLnNlcmlhbGl6ZURhdGFJZk5lZWRlZChjcmVhdGVNb2RlcmF0aW9uUmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUaGUgc2VhcmNoIGVuZHBvaW50IGNvbXB1dGVzIHNpbWlsYXJpdHkgc2NvcmVzIGJldHdlZW4gcHJvdmlkZWQgcXVlcnkgYW5kIGRvY3VtZW50cy4gRG9jdW1lbnRzIGNhbiBiZSBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIEFQSSBpZiB0aGVyZSBhcmUgbm8gbW9yZSB0aGFuIDIwMCBvZiB0aGVtLiAgVG8gZ28gYmV5b25kIHRoZSAyMDAgZG9jdW1lbnQgbGltaXQsIGRvY3VtZW50cyBjYW4gYmUgcHJvY2Vzc2VkIG9mZmxpbmUgYW5kIHRoZW4gdXNlZCBmb3IgZWZmaWNpZW50IHJldHJpZXZhbCBhdCBxdWVyeSB0aW1lLiBXaGVuIGBmaWxlYCBpcyBzZXQsIHRoZSBzZWFyY2ggZW5kcG9pbnQgc2VhcmNoZXMgb3ZlciBhbGwgdGhlIGRvY3VtZW50cyBpbiB0aGUgZ2l2ZW4gZmlsZSBhbmQgcmV0dXJucyB1cCB0byB0aGUgYG1heF9yZXJhbmtgIG51bWJlciBvZiBkb2N1bWVudHMuIFRoZXNlIGRvY3VtZW50cyB3aWxsIGJlIHJldHVybmVkIGFsb25nIHdpdGggdGhlaXIgc2VhcmNoIHNjb3Jlcy4gIFRoZSBzaW1pbGFyaXR5IHNjb3JlIGlzIGEgcG9zaXRpdmUgc2NvcmUgdGhhdCB1c3VhbGx5IHJhbmdlcyBmcm9tIDAgdG8gMzAwIChidXQgY2FuIHNvbWV0aW1lcyBnbyBoaWdoZXIpLCB3aGVyZSBhIHNjb3JlIGFib3ZlIDIwMCB1c3VhbGx5IG1lYW5zIHRoZSBkb2N1bWVudCBpcyBzZW1hbnRpY2FsbHkgc2ltaWxhciB0byB0aGUgcXVlcnkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdC4gIFlvdSBjYW4gc2VsZWN0IG9uZSBvZiAmI3g2MDthZGEmI3g2MDssICYjeDYwO2JhYmJhZ2UmI3g2MDssICYjeDYwO2N1cmllJiN4NjA7LCBvciAmI3g2MDtkYXZpbmNpJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZVNlYXJjaFJlcXVlc3R9IGNyZWF0ZVNlYXJjaFJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVNlYXJjaDogKGVuZ2luZUlkLCBjcmVhdGVTZWFyY2hSZXF1ZXN0LCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2VuZ2luZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVTZWFyY2gnLCAnZW5naW5lSWQnLCBlbmdpbmVJZCk7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdjcmVhdGVTZWFyY2hSZXF1ZXN0JyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdjcmVhdGVTZWFyY2gnLCAnY3JlYXRlU2VhcmNoUmVxdWVzdCcsIGNyZWF0ZVNlYXJjaFJlcXVlc3QpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9lbmdpbmVzL3tlbmdpbmVfaWR9L3NlYXJjaGBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJlbmdpbmVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhlbmdpbmVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24vanNvbic7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBjb21tb25fMS5zZXJpYWxpemVEYXRhSWZOZWVkZWQoY3JlYXRlU2VhcmNoUmVxdWVzdCwgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucywgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2NyaWJlcyBhdWRpbyBpbnRvIHRoZSBpbnB1dCBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zY3JpYmUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlLiBPbmx5ICYjeDYwO3doaXNwZXItMSYjeDYwOyBpcyBjdXJyZW50bHkgYXZhaWxhYmxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Byb21wdF0gQW4gb3B0aW9uYWwgdGV4dCB0byBndWlkZSB0aGUgbW9kZWxcXFxcXFwmIzM5O3Mgc3R5bGUgb3IgY29udGludWUgYSBwcmV2aW91cyBhdWRpbyBzZWdtZW50LiBUaGUgW3Byb21wdF0oL2RvY3MvZ3VpZGVzL3NwZWVjaC10by10ZXh0L3Byb21wdGluZykgc2hvdWxkIG1hdGNoIHRoZSBhdWRpbyBsYW5ndWFnZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RlbXBlcmF0dXJlXSBUaGUgc2FtcGxpbmcgdGVtcGVyYXR1cmUsIGJldHdlZW4gMCBhbmQgMS4gSGlnaGVyIHZhbHVlcyBsaWtlIDAuOCB3aWxsIG1ha2UgdGhlIG91dHB1dCBtb3JlIHJhbmRvbSwgd2hpbGUgbG93ZXIgdmFsdWVzIGxpa2UgMC4yIHdpbGwgbWFrZSBpdCBtb3JlIGZvY3VzZWQgYW5kIGRldGVybWluaXN0aWMuIElmIHNldCB0byAwLCB0aGUgbW9kZWwgd2lsbCB1c2UgW2xvZyBwcm9iYWJpbGl0eV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTG9nX3Byb2JhYmlsaXR5KSB0byBhdXRvbWF0aWNhbGx5IGluY3JlYXNlIHRoZSB0ZW1wZXJhdHVyZSB1bnRpbCBjZXJ0YWluIHRocmVzaG9sZHMgYXJlIGhpdC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtsYW5ndWFnZV0gVGhlIGxhbmd1YWdlIG9mIHRoZSBpbnB1dCBhdWRpby4gU3VwcGx5aW5nIHRoZSBpbnB1dCBsYW5ndWFnZSBpbiBbSVNPLTYzOS0xXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX0lTT182MzktMV9jb2RlcykgZm9ybWF0IHdpbGwgaW1wcm92ZSBhY2N1cmFjeSBhbmQgbGF0ZW5jeS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVRyYW5zY3JpcHRpb246IChmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGUnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZVRyYW5zY3JpcHRpb24nLCAnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnbW9kZWwnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZVRyYW5zY3JpcHRpb24nLCAnbW9kZWwnLCBtb2RlbCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2F1ZGlvL3RyYW5zY3JpcHRpb25zYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnUE9TVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckZvcm1QYXJhbXMgPSBuZXcgKChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uZm9ybURhdGFDdG9yKSB8fCBGb3JtRGF0YSkoKTtcbiAgICAgICAgICAgIGlmIChmaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9kZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByb21wdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncHJvbXB0JywgcHJvbXB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNwb25zZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgncmVzcG9uc2VfZm9ybWF0JywgcmVzcG9uc2VGb3JtYXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRlbXBlcmF0dXJlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCd0ZW1wZXJhdHVyZScsIHRlbXBlcmF0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsYW5ndWFnZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnbGFuZ3VhZ2UnLCBsYW5ndWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2NhbFZhckhlYWRlclBhcmFtZXRlclsnQ29udGVudC1UeXBlJ10gPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YSc7XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBsb2NhbFZhckZvcm1QYXJhbXMuZ2V0SGVhZGVycygpKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmRhdGEgPSBsb2NhbFZhckZvcm1QYXJhbXM7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2xhdGVzIGF1ZGlvIGludG8gaW50byBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGF1ZGlvIGZpbGUgdG8gdHJhbnNsYXRlLCBpbiBvbmUgb2YgdGhlc2UgZm9ybWF0czogbXAzLCBtcDQsIG1wZWcsIG1wZ2EsIG00YSwgd2F2LCBvciB3ZWJtLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZS4gT25seSAmI3g2MDt3aGlzcGVyLTEmI3g2MDsgaXMgY3VycmVudGx5IGF2YWlsYWJsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBiZSBpbiBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IG9mIHRoZSB0cmFuc2NyaXB0IG91dHB1dCwgaW4gb25lIG9mIHRoZXNlIG9wdGlvbnM6IGpzb24sIHRleHQsIHNydCwgdmVyYm9zZV9qc29uLCBvciB2dHQuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVHJhbnNsYXRpb246IChmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmlsZScgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygnY3JlYXRlVHJhbnNsYXRpb24nLCAnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnbW9kZWwnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2NyZWF0ZVRyYW5zbGF0aW9uJywgJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9hdWRpby90cmFuc2xhdGlvbnNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdQT1NUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyRm9ybVBhcmFtcyA9IG5ldyAoKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5mb3JtRGF0YUN0b3IpIHx8IEZvcm1EYXRhKSgpO1xuICAgICAgICAgICAgaWYgKGZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb2RlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJGb3JtUGFyYW1zLmFwcGVuZCgnbW9kZWwnLCBtb2RlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJvbXB0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdwcm9tcHQnLCBwcm9tcHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFZhckZvcm1QYXJhbXMuYXBwZW5kKCdyZXNwb25zZV9mb3JtYXQnLCByZXNwb25zZUZvcm1hdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVtcGVyYXR1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxvY2FsVmFyRm9ybVBhcmFtcy5hcHBlbmQoJ3RlbXBlcmF0dXJlJywgdGVtcGVyYXR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXJbJ0NvbnRlbnQtVHlwZSddID0gJ211bHRpcGFydC9mb3JtLWRhdGEnO1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgbG9jYWxWYXJGb3JtUGFyYW1zLmdldEhlYWRlcnMoKSksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5kYXRhID0gbG9jYWxWYXJGb3JtUGFyYW1zO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZUZpbGU6IChmaWxlSWQsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmlsZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdkZWxldGVGaWxlJywgJ2ZpbGVJZCcsIGZpbGVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbGVzL3tmaWxlX2lkfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJmaWxlX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZmlsZUlkKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdERUxFVEUnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmluZS10dW5lZCBtb2RlbC4gWW91IG11c3QgaGF2ZSB0aGUgT3duZXIgcm9sZSBpbiB5b3VyIG9yZ2FuaXphdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIFRoZSBtb2RlbCB0byBkZWxldGVcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZU1vZGVsOiAobW9kZWwsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnbW9kZWwnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ2RlbGV0ZU1vZGVsJywgJ21vZGVsJywgbW9kZWwpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9tb2RlbHMve21vZGVsfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJtb2RlbFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKG1vZGVsKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdERUxFVEUnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0dXJucyB0aGUgY29udGVudHMgb2YgdGhlIHNwZWNpZmllZCBmaWxlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkb3dubG9hZEZpbGU6IChmaWxlSWQsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnZmlsZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdkb3dubG9hZEZpbGUnLCAnZmlsZUlkJywgZmlsZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZmlsZXMve2ZpbGVfaWR9L2NvbnRlbnRgXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoYHske1wiZmlsZV9pZFwifX1gLCBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGZpbGVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IExpc3RzIHRoZSBjdXJyZW50bHkgYXZhaWxhYmxlIChub24tZmluZXR1bmVkKSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEVuZ2luZXM6IChvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZW5naW5lc2A7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIGEgbGlzdCBvZiBmaWxlcyB0aGF0IGJlbG9uZyB0byB0aGUgdXNlclxcJ3Mgb3JnYW5pemF0aW9uLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbGVzOiAob3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbGVzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEdldCBmaW5lLWdyYWluZWQgc3RhdHVzIHVwZGF0ZXMgZm9yIGEgZmluZS10dW5lIGpvYi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGdldCBldmVudHMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzdHJlYW1dIFdoZXRoZXIgdG8gc3RyZWFtIGV2ZW50cyBmb3IgdGhlIGZpbmUtdHVuZSBqb2IuIElmIHNldCB0byB0cnVlLCBldmVudHMgd2lsbCBiZSBzZW50IGFzIGRhdGEtb25seSBbc2VydmVyLXNlbnQgZXZlbnRzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU2VydmVyLXNlbnRfZXZlbnRzL1VzaW5nX3NlcnZlci1zZW50X2V2ZW50cyNFdmVudF9zdHJlYW1fZm9ybWF0KSBhcyB0aGV5IGJlY29tZSBhdmFpbGFibGUuIFRoZSBzdHJlYW0gd2lsbCB0ZXJtaW5hdGUgd2l0aCBhICYjeDYwO2RhdGE6IFtET05FXSYjeDYwOyBtZXNzYWdlIHdoZW4gdGhlIGpvYiBpcyBmaW5pc2hlZCAoc3VjY2VlZGVkLCBjYW5jZWxsZWQsIG9yIGZhaWxlZCkuICBJZiBzZXQgdG8gZmFsc2UsIG9ubHkgZXZlbnRzIGdlbmVyYXRlZCBzbyBmYXIgd2lsbCBiZSByZXR1cm5lZC5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RGaW5lVHVuZUV2ZW50czogKGZpbmVUdW5lSWQsIHN0cmVhbSwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdmaW5lVHVuZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdsaXN0RmluZVR1bmVFdmVudHMnLCAnZmluZVR1bmVJZCcsIGZpbmVUdW5lSWQpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJQYXRoID0gYC9maW5lLXR1bmVzL3tmaW5lX3R1bmVfaWR9L2V2ZW50c2BcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJmaW5lX3R1bmVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhmaW5lVHVuZUlkKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgaWYgKHN0cmVhbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxWYXJRdWVyeVBhcmFtZXRlclsnc3RyZWFtJ10gPSBzdHJlYW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0IHlvdXIgb3JnYW5pemF0aW9uXFwncyBmaW5lLXR1bmluZyBqb2JzXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmluZVR1bmVzOiAob3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbmUtdHVuZXNgO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdHMgdGhlIGN1cnJlbnRseSBhdmFpbGFibGUgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RNb2RlbHM6IChvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvbW9kZWxzYDtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgaXQgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUVuZ2luZTogKGVuZ2luZUlkLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2VuZ2luZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdyZXRyaWV2ZUVuZ2luZScsICdlbmdpbmVJZCcsIGVuZ2luZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZW5naW5lcy97ZW5naW5lX2lkfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJlbmdpbmVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhlbmdpbmVJZCkpKTtcbiAgICAgICAgICAgIC8vIHVzZSBkdW1teSBiYXNlIFVSTCBzdHJpbmcgYmVjYXVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIG9ubHkgYWNjZXB0cyBhYnNvbHV0ZSBVUkxzLlxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJVcmxPYmogPSBuZXcgVVJMKGxvY2FsVmFyUGF0aCwgY29tbW9uXzEuRFVNTVlfQkFTRV9VUkwpO1xuICAgICAgICAgICAgbGV0IGJhc2VPcHRpb25zO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBiYXNlT3B0aW9ucyA9IGNvbmZpZ3VyYXRpb24uYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclJlcXVlc3RPcHRpb25zID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHsgbWV0aG9kOiAnR0VUJyB9LCBiYXNlT3B0aW9ucyksIG9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIgPSB7fTtcbiAgICAgICAgICAgIGNvbW1vbl8xLnNldFNlYXJjaFBhcmFtcyhsb2NhbFZhclVybE9iaiwgbG9jYWxWYXJRdWVyeVBhcmFtZXRlcik7XG4gICAgICAgICAgICBsZXQgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyA9IGJhc2VPcHRpb25zICYmIGJhc2VPcHRpb25zLmhlYWRlcnMgPyBiYXNlT3B0aW9ucy5oZWFkZXJzIDoge307XG4gICAgICAgICAgICBsb2NhbFZhclJlcXVlc3RPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgbG9jYWxWYXJIZWFkZXJQYXJhbWV0ZXIpLCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zKSwgb3B0aW9ucy5oZWFkZXJzKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXJsOiBjb21tb25fMS50b1BhdGhTdHJpbmcobG9jYWxWYXJVcmxPYmopLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaWxlOiAoZmlsZUlkLCBvcHRpb25zID0ge30pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIC8vIHZlcmlmeSByZXF1aXJlZCBwYXJhbWV0ZXIgJ2ZpbGVJZCcgaXMgbm90IG51bGwgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICBjb21tb25fMS5hc3NlcnRQYXJhbUV4aXN0cygncmV0cmlldmVGaWxlJywgJ2ZpbGVJZCcsIGZpbGVJZCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL2ZpbGVzL3tmaWxlX2lkfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJmaWxlX2lkXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoZmlsZUlkKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgR2V0cyBpbmZvIGFib3V0IHRoZSBmaW5lLXR1bmUgam9iLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUZpbmVUdW5lOiAoZmluZVR1bmVJZCwgb3B0aW9ucyA9IHt9KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAvLyB2ZXJpZnkgcmVxdWlyZWQgcGFyYW1ldGVyICdmaW5lVHVuZUlkJyBpcyBub3QgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICAgIGNvbW1vbl8xLmFzc2VydFBhcmFtRXhpc3RzKCdyZXRyaWV2ZUZpbmVUdW5lJywgJ2ZpbmVUdW5lSWQnLCBmaW5lVHVuZUlkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUGF0aCA9IGAvZmluZS10dW5lcy97ZmluZV90dW5lX2lkfWBcbiAgICAgICAgICAgICAgICAucmVwbGFjZShgeyR7XCJmaW5lX3R1bmVfaWRcIn19YCwgZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhmaW5lVHVuZUlkKSkpO1xuICAgICAgICAgICAgLy8gdXNlIGR1bW15IGJhc2UgVVJMIHN0cmluZyBiZWNhdXNlIHRoZSBVUkwgY29uc3RydWN0b3Igb25seSBhY2NlcHRzIGFic29sdXRlIFVSTHMuXG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclVybE9iaiA9IG5ldyBVUkwobG9jYWxWYXJQYXRoLCBjb21tb25fMS5EVU1NWV9CQVNFX1VSTCk7XG4gICAgICAgICAgICBsZXQgYmFzZU9wdGlvbnM7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zID0gY29uZmlndXJhdGlvbi5iYXNlT3B0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oeyBtZXRob2Q6ICdHRVQnIH0sIGJhc2VPcHRpb25zKSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJRdWVyeVBhcmFtZXRlciA9IHt9O1xuICAgICAgICAgICAgY29tbW9uXzEuc2V0U2VhcmNoUGFyYW1zKGxvY2FsVmFyVXJsT2JqLCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyKTtcbiAgICAgICAgICAgIGxldCBoZWFkZXJzRnJvbUJhc2VPcHRpb25zID0gYmFzZU9wdGlvbnMgJiYgYmFzZU9wdGlvbnMuaGVhZGVycyA/IGJhc2VPcHRpb25zLmhlYWRlcnMgOiB7fTtcbiAgICAgICAgICAgIGxvY2FsVmFyUmVxdWVzdE9wdGlvbnMuaGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBsb2NhbFZhckhlYWRlclBhcmFtZXRlciksIGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMpLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1cmw6IGNvbW1vbl8xLnRvUGF0aFN0cmluZyhsb2NhbFZhclVybE9iaiksXG4gICAgICAgICAgICAgICAgb3B0aW9uczogbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pLFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0cmlldmVzIGEgbW9kZWwgaW5zdGFuY2UsIHByb3ZpZGluZyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbW9kZWwgc3VjaCBhcyB0aGUgb3duZXIgYW5kIHBlcm1pc3Npb25pbmcuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZU1vZGVsOiAobW9kZWwsIG9wdGlvbnMgPSB7fSkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgLy8gdmVyaWZ5IHJlcXVpcmVkIHBhcmFtZXRlciAnbW9kZWwnIGlzIG5vdCBudWxsIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgY29tbW9uXzEuYXNzZXJ0UGFyYW1FeGlzdHMoJ3JldHJpZXZlTW9kZWwnLCAnbW9kZWwnLCBtb2RlbCk7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclBhdGggPSBgL21vZGVscy97bW9kZWx9YFxuICAgICAgICAgICAgICAgIC5yZXBsYWNlKGB7JHtcIm1vZGVsXCJ9fWAsIGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcobW9kZWwpKSk7XG4gICAgICAgICAgICAvLyB1c2UgZHVtbXkgYmFzZSBVUkwgc3RyaW5nIGJlY2F1c2UgdGhlIFVSTCBjb25zdHJ1Y3RvciBvbmx5IGFjY2VwdHMgYWJzb2x1dGUgVVJMcy5cbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyVXJsT2JqID0gbmV3IFVSTChsb2NhbFZhclBhdGgsIGNvbW1vbl8xLkRVTU1ZX0JBU0VfVVJMKTtcbiAgICAgICAgICAgIGxldCBiYXNlT3B0aW9ucztcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgYmFzZU9wdGlvbnMgPSBjb25maWd1cmF0aW9uLmJhc2VPcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7IG1ldGhvZDogJ0dFVCcgfSwgYmFzZU9wdGlvbnMpLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhclF1ZXJ5UGFyYW1ldGVyID0ge307XG4gICAgICAgICAgICBjb21tb25fMS5zZXRTZWFyY2hQYXJhbXMobG9jYWxWYXJVcmxPYmosIGxvY2FsVmFyUXVlcnlQYXJhbWV0ZXIpO1xuICAgICAgICAgICAgbGV0IGhlYWRlcnNGcm9tQmFzZU9wdGlvbnMgPSBiYXNlT3B0aW9ucyAmJiBiYXNlT3B0aW9ucy5oZWFkZXJzID8gYmFzZU9wdGlvbnMuaGVhZGVycyA6IHt9O1xuICAgICAgICAgICAgbG9jYWxWYXJSZXF1ZXN0T3B0aW9ucy5oZWFkZXJzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGxvY2FsVmFySGVhZGVyUGFyYW1ldGVyKSwgaGVhZGVyc0Zyb21CYXNlT3B0aW9ucyksIG9wdGlvbnMuaGVhZGVycyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVybDogY29tbW9uXzEudG9QYXRoU3RyaW5nKGxvY2FsVmFyVXJsT2JqKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBsb2NhbFZhclJlcXVlc3RPcHRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSksXG4gICAgfTtcbn07XG4vKipcbiAqIE9wZW5BSUFwaSAtIGZ1bmN0aW9uYWwgcHJvZ3JhbW1pbmcgaW50ZXJmYWNlXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuT3BlbkFJQXBpRnAgPSBmdW5jdGlvbiAoY29uZmlndXJhdGlvbikge1xuICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IgPSBleHBvcnRzLk9wZW5BSUFwaUF4aW9zUGFyYW1DcmVhdG9yKGNvbmZpZ3VyYXRpb24pO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBJbW1lZGlhdGVseSBjYW5jZWwgYSBmaW5lLXR1bmUgam9iLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZVR1bmVJZCBUaGUgSUQgb2YgdGhlIGZpbmUtdHVuZSBqb2IgdG8gY2FuY2VsXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWxGaW5lVHVuZShmaW5lVHVuZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jYW5jZWxGaW5lVHVuZShmaW5lVHVuZUlkLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBBbnN3ZXJzIHRoZSBzcGVjaWZpZWQgcXVlc3Rpb24gdXNpbmcgdGhlIHByb3ZpZGVkIGRvY3VtZW50cyBhbmQgZXhhbXBsZXMuICBUaGUgZW5kcG9pbnQgZmlyc3QgW3NlYXJjaGVzXSgvZG9jcy9hcGktcmVmZXJlbmNlL3NlYXJjaGVzKSBvdmVyIHByb3ZpZGVkIGRvY3VtZW50cyBvciBmaWxlcyB0byBmaW5kIHJlbGV2YW50IGNvbnRleHQuIFRoZSByZWxldmFudCBjb250ZXh0IGlzIGNvbWJpbmVkIHdpdGggdGhlIHByb3ZpZGVkIGV4YW1wbGVzIGFuZCBxdWVzdGlvbiB0byBjcmVhdGUgdGhlIHByb21wdCBmb3IgW2NvbXBsZXRpb25dKC9kb2NzL2FwaS1yZWZlcmVuY2UvY29tcGxldGlvbnMpLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUFuc3dlclJlcXVlc3R9IGNyZWF0ZUFuc3dlclJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUFuc3dlcihjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVBbnN3ZXIoY3JlYXRlQW5zd2VyUmVxdWVzdCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGNvbXBsZXRpb24gZm9yIHRoZSBjaGF0IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVDaGF0Q29tcGxldGlvbihjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENsYXNzaWZpZXMgdGhlIHNwZWNpZmllZCBgcXVlcnlgIHVzaW5nIHByb3ZpZGVkIGV4YW1wbGVzLiAgVGhlIGVuZHBvaW50IGZpcnN0IFtzZWFyY2hlc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9zZWFyY2hlcykgb3ZlciB0aGUgbGFiZWxlZCBleGFtcGxlcyB0byBzZWxlY3QgdGhlIG9uZXMgbW9zdCByZWxldmFudCBmb3IgdGhlIHBhcnRpY3VsYXIgcXVlcnkuIFRoZW4sIHRoZSByZWxldmFudCBleGFtcGxlcyBhcmUgY29tYmluZWQgd2l0aCB0aGUgcXVlcnkgdG8gY29uc3RydWN0IGEgcHJvbXB0IHRvIHByb2R1Y2UgdGhlIGZpbmFsIGxhYmVsIHZpYSB0aGUgW2NvbXBsZXRpb25zXSgvZG9jcy9hcGktcmVmZXJlbmNlL2NvbXBsZXRpb25zKSBlbmRwb2ludC4gIExhYmVsZWQgZXhhbXBsZXMgY2FuIGJlIHByb3ZpZGVkIHZpYSBhbiB1cGxvYWRlZCBgZmlsZWAsIG9yIGV4cGxpY2l0bHkgbGlzdGVkIGluIHRoZSByZXF1ZXN0IHVzaW5nIHRoZSBgZXhhbXBsZXNgIHBhcmFtZXRlciBmb3IgcXVpY2sgdGVzdHMgYW5kIHNtYWxsIHNjYWxlIHVzZSBjYXNlcy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3R9IGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQ2xhc3NpZmljYXRpb24oY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVDbGFzc2lmaWNhdGlvbihjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgcHJvdmlkZWQgcHJvbXB0IGFuZCBwYXJhbWV0ZXJzXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgbmV3IGVkaXQgZm9yIHRoZSBwcm92aWRlZCBpbnB1dCwgaW5zdHJ1Y3Rpb24sIGFuZCBwYXJhbWV0ZXJzLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUVkaXRSZXF1ZXN0fSBjcmVhdGVFZGl0UmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlbWJlZGRpbmcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgdGV4dC5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVFbWJlZGRpbmdSZXF1ZXN0fSBjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVFbWJlZGRpbmcoY3JlYXRlRW1iZWRkaW5nUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlRW1iZWRkaW5nKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFVwbG9hZCBhIGZpbGUgdGhhdCBjb250YWlucyBkb2N1bWVudChzKSB0byBiZSB1c2VkIGFjcm9zcyB2YXJpb3VzIGVuZHBvaW50cy9mZWF0dXJlcy4gQ3VycmVudGx5LCB0aGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGJ5IG9uZSBvcmdhbml6YXRpb24gY2FuIGJlIHVwIHRvIDEgR0IuIFBsZWFzZSBjb250YWN0IHVzIGlmIHlvdSBuZWVkIHRvIGluY3JlYXNlIHRoZSBzdG9yYWdlIGxpbWl0LlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgTmFtZSBvZiB0aGUgW0pTT04gTGluZXNdKGh0dHBzOi8vanNvbmxpbmVzLnJlYWR0aGVkb2NzLmlvL2VuL2xhdGVzdC8pIGZpbGUgdG8gYmUgdXBsb2FkZWQuICBJZiB0aGUgJiN4NjA7cHVycG9zZSYjeDYwOyBpcyBzZXQgdG8gXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7LCBlYWNoIGxpbmUgaXMgYSBKU09OIHJlY29yZCB3aXRoIFxcXFxcXCZxdW90O3Byb21wdFxcXFxcXCZxdW90OyBhbmQgXFxcXFxcJnF1b3Q7Y29tcGxldGlvblxcXFxcXCZxdW90OyBmaWVsZHMgcmVwcmVzZW50aW5nIHlvdXIgW3RyYWluaW5nIGV4YW1wbGVzXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcvcHJlcGFyZS10cmFpbmluZy1kYXRhKS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHB1cnBvc2UgVGhlIGludGVuZGVkIHB1cnBvc2Ugb2YgdGhlIHVwbG9hZGVkIGRvY3VtZW50cy4gIFVzZSBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDsgZm9yIFtGaW5lLXR1bmluZ10oL2RvY3MvYXBpLXJlZmVyZW5jZS9maW5lLXR1bmVzKS4gVGhpcyBhbGxvd3MgdXMgdG8gdmFsaWRhdGUgdGhlIGZvcm1hdCBvZiB0aGUgdXBsb2FkZWQgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUZpbGUoZmlsZSwgcHVycG9zZSwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IuY3JlYXRlRmlsZShmaWxlLCBwdXJwb3NlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgam9iIHRoYXQgZmluZS10dW5lcyBhIHNwZWNpZmllZCBtb2RlbCBmcm9tIGEgZ2l2ZW4gZGF0YXNldC4gIFJlc3BvbnNlIGluY2x1ZGVzIGRldGFpbHMgb2YgdGhlIGVucXVldWVkIGpvYiBpbmNsdWRpbmcgam9iIHN0YXR1cyBhbmQgdGhlIG5hbWUgb2YgdGhlIGZpbmUtdHVuZWQgbW9kZWxzIG9uY2UgY29tcGxldGUuICBbTGVhcm4gbW9yZSBhYm91dCBGaW5lLXR1bmluZ10oL2RvY3MvZ3VpZGVzL2ZpbmUtdHVuaW5nKVxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUZpbmVUdW5lUmVxdWVzdH0gY3JlYXRlRmluZVR1bmVSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVGaW5lVHVuZShjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUZpbmVUdW5lKGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBpbWFnZSBnaXZlbiBhIHByb21wdC5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVJbWFnZVJlcXVlc3R9IGNyZWF0ZUltYWdlUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlSW1hZ2UoY3JlYXRlSW1hZ2VSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVJbWFnZShjcmVhdGVJbWFnZVJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZWRpdGVkIG9yIGV4dGVuZGVkIGltYWdlIGdpdmVuIGFuIG9yaWdpbmFsIGltYWdlIGFuZCBhIHByb21wdC5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gZWRpdC4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLiBJZiBtYXNrIGlzIG5vdCBwcm92aWRlZCwgaW1hZ2UgbXVzdCBoYXZlIHRyYW5zcGFyZW5jeSwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIHRoZSBtYXNrLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvbXB0IEEgdGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgZGVzaXJlZCBpbWFnZShzKS4gVGhlIG1heGltdW0gbGVuZ3RoIGlzIDEwMDAgY2hhcmFjdGVycy5cbiAgICAgICAgICogQHBhcmFtIHtGaWxlfSBbbWFza10gQW4gYWRkaXRpb25hbCBpbWFnZSB3aG9zZSBmdWxseSB0cmFuc3BhcmVudCBhcmVhcyAoZS5nLiB3aGVyZSBhbHBoYSBpcyB6ZXJvKSBpbmRpY2F0ZSB3aGVyZSAmI3g2MDtpbWFnZSYjeDYwOyBzaG91bGQgYmUgZWRpdGVkLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbnMgYXMgJiN4NjA7aW1hZ2UmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZUVkaXQoaW1hZ2UsIHByb21wdCwgbWFzaywgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUltYWdlRWRpdChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIHZhcmlhdGlvbiBvZiBhIGdpdmVuIGltYWdlLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byB1c2UgYXMgdGhlIGJhc2lzIGZvciB0aGUgdmFyaWF0aW9uKHMpLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZUltYWdlVmFyaWF0aW9uKGltYWdlLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ2xhc3NpZmllcyBpZiB0ZXh0IHZpb2xhdGVzIE9wZW5BSVxcJ3MgQ29udGVudCBQb2xpY3lcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVNb2RlcmF0aW9uUmVxdWVzdH0gY3JlYXRlTW9kZXJhdGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZU1vZGVyYXRpb24oY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZU1vZGVyYXRpb24oY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFRoZSBzZWFyY2ggZW5kcG9pbnQgY29tcHV0ZXMgc2ltaWxhcml0eSBzY29yZXMgYmV0d2VlbiBwcm92aWRlZCBxdWVyeSBhbmQgZG9jdW1lbnRzLiBEb2N1bWVudHMgY2FuIGJlIHBhc3NlZCBkaXJlY3RseSB0byB0aGUgQVBJIGlmIHRoZXJlIGFyZSBubyBtb3JlIHRoYW4gMjAwIG9mIHRoZW0uICBUbyBnbyBiZXlvbmQgdGhlIDIwMCBkb2N1bWVudCBsaW1pdCwgZG9jdW1lbnRzIGNhbiBiZSBwcm9jZXNzZWQgb2ZmbGluZSBhbmQgdGhlbiB1c2VkIGZvciBlZmZpY2llbnQgcmV0cmlldmFsIGF0IHF1ZXJ5IHRpbWUuIFdoZW4gYGZpbGVgIGlzIHNldCwgdGhlIHNlYXJjaCBlbmRwb2ludCBzZWFyY2hlcyBvdmVyIGFsbCB0aGUgZG9jdW1lbnRzIGluIHRoZSBnaXZlbiBmaWxlIGFuZCByZXR1cm5zIHVwIHRvIHRoZSBgbWF4X3JlcmFua2AgbnVtYmVyIG9mIGRvY3VtZW50cy4gVGhlc2UgZG9jdW1lbnRzIHdpbGwgYmUgcmV0dXJuZWQgYWxvbmcgd2l0aCB0aGVpciBzZWFyY2ggc2NvcmVzLiAgVGhlIHNpbWlsYXJpdHkgc2NvcmUgaXMgYSBwb3NpdGl2ZSBzY29yZSB0aGF0IHVzdWFsbHkgcmFuZ2VzIGZyb20gMCB0byAzMDAgKGJ1dCBjYW4gc29tZXRpbWVzIGdvIGhpZ2hlciksIHdoZXJlIGEgc2NvcmUgYWJvdmUgMjAwIHVzdWFsbHkgbWVhbnMgdGhlIGRvY3VtZW50IGlzIHNlbWFudGljYWxseSBzaW1pbGFyIHRvIHRoZSBxdWVyeS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0LiAgWW91IGNhbiBzZWxlY3Qgb25lIG9mICYjeDYwO2FkYSYjeDYwOywgJiN4NjA7YmFiYmFnZSYjeDYwOywgJiN4NjA7Y3VyaWUmI3g2MDssIG9yICYjeDYwO2RhdmluY2kmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlU2VhcmNoUmVxdWVzdH0gY3JlYXRlU2VhcmNoUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlU2VhcmNoKGVuZ2luZUlkLCBjcmVhdGVTZWFyY2hSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVTZWFyY2goZW5naW5lSWQsIGNyZWF0ZVNlYXJjaFJlcXVlc3QsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFRyYW5zY3JpYmVzIGF1ZGlvIGludG8gdGhlIGlucHV0IGxhbmd1YWdlLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGF1ZGlvIGZpbGUgdG8gdHJhbnNjcmliZSwgaW4gb25lIG9mIHRoZXNlIGZvcm1hdHM6IG1wMywgbXA0LCBtcGVnLCBtcGdhLCBtNGEsIHdhdiwgb3Igd2VibS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvbXB0XSBBbiBvcHRpb25hbCB0ZXh0IHRvIGd1aWRlIHRoZSBtb2RlbFxcXFxcXCYjMzk7cyBzdHlsZSBvciBjb250aW51ZSBhIHByZXZpb3VzIGF1ZGlvIHNlZ21lbnQuIFRoZSBbcHJvbXB0XSgvZG9jcy9ndWlkZXMvc3BlZWNoLXRvLXRleHQvcHJvbXB0aW5nKSBzaG91bGQgbWF0Y2ggdGhlIGF1ZGlvIGxhbmd1YWdlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IG9mIHRoZSB0cmFuc2NyaXB0IG91dHB1dCwgaW4gb25lIG9mIHRoZXNlIG9wdGlvbnM6IGpzb24sIHRleHQsIHNydCwgdmVyYm9zZV9qc29uLCBvciB2dHQuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2xhbmd1YWdlXSBUaGUgbGFuZ3VhZ2Ugb2YgdGhlIGlucHV0IGF1ZGlvLiBTdXBwbHlpbmcgdGhlIGlucHV0IGxhbmd1YWdlIGluIFtJU08tNjM5LTFdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfSVNPXzYzOS0xX2NvZGVzKSBmb3JtYXQgd2lsbCBpbXByb3ZlIGFjY3VyYWN5IGFuZCBsYXRlbmN5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5jcmVhdGVUcmFuc2NyaXB0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgbGFuZ3VhZ2UsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFRyYW5zbGF0ZXMgYXVkaW8gaW50byBpbnRvIEVuZ2xpc2guXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBUaGUgYXVkaW8gZmlsZSB0byB0cmFuc2xhdGUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlLiBPbmx5ICYjeDYwO3doaXNwZXItMSYjeDYwOyBpcyBjdXJyZW50bHkgYXZhaWxhYmxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Byb21wdF0gQW4gb3B0aW9uYWwgdGV4dCB0byBndWlkZSB0aGUgbW9kZWxcXFxcXFwmIzM5O3Mgc3R5bGUgb3IgY29udGludWUgYSBwcmV2aW91cyBhdWRpbyBzZWdtZW50LiBUaGUgW3Byb21wdF0oL2RvY3MvZ3VpZGVzL3NwZWVjaC10by10ZXh0L3Byb21wdGluZykgc2hvdWxkIGJlIGluIEVuZ2xpc2guXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgb2YgdGhlIHRyYW5zY3JpcHQgb3V0cHV0LCBpbiBvbmUgb2YgdGhlc2Ugb3B0aW9uczoganNvbiwgdGV4dCwgc3J0LCB2ZXJib3NlX2pzb24sIG9yIHZ0dC5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IFt0ZW1wZXJhdHVyZV0gVGhlIHNhbXBsaW5nIHRlbXBlcmF0dXJlLCBiZXR3ZWVuIDAgYW5kIDEuIEhpZ2hlciB2YWx1ZXMgbGlrZSAwLjggd2lsbCBtYWtlIHRoZSBvdXRwdXQgbW9yZSByYW5kb20sIHdoaWxlIGxvd2VyIHZhbHVlcyBsaWtlIDAuMiB3aWxsIG1ha2UgaXQgbW9yZSBmb2N1c2VkIGFuZCBkZXRlcm1pbmlzdGljLiBJZiBzZXQgdG8gMCwgdGhlIG1vZGVsIHdpbGwgdXNlIFtsb2cgcHJvYmFiaWxpdHldKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xvZ19wcm9iYWJpbGl0eSkgdG8gYXV0b21hdGljYWxseSBpbmNyZWFzZSB0aGUgdGVtcGVyYXR1cmUgdW50aWwgY2VydGFpbiB0aHJlc2hvbGRzIGFyZSBoaXQuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVUcmFuc2xhdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmNyZWF0ZVRyYW5zbGF0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmlsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJZCBUaGUgSUQgb2YgdGhlIGZpbGUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZUZpbGUoZmlsZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5kZWxldGVGaWxlKGZpbGVJZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmluZS10dW5lZCBtb2RlbC4gWW91IG11c3QgaGF2ZSB0aGUgT3duZXIgcm9sZSBpbiB5b3VyIG9yZ2FuaXphdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIFRoZSBtb2RlbCB0byBkZWxldGVcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZU1vZGVsKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5kZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0dXJucyB0aGUgY29udGVudHMgb2YgdGhlIHNwZWNpZmllZCBmaWxlXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBkb3dubG9hZEZpbGUoZmlsZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5kb3dubG9hZEZpbGUoZmlsZUlkLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSAobm9uLWZpbmV0dW5lZCkgbW9kZWxzLCBhbmQgcHJvdmlkZXMgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgZWFjaCBvbmUgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RFbmdpbmVzKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmxpc3RFbmdpbmVzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYmVsb25nIHRvIHRoZSB1c2VyXFwncyBvcmdhbml6YXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmlsZXMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IubGlzdEZpbGVzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEdldCBmaW5lLWdyYWluZWQgc3RhdHVzIHVwZGF0ZXMgZm9yIGEgZmluZS10dW5lIGpvYi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGdldCBldmVudHMgZm9yLlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzdHJlYW1dIFdoZXRoZXIgdG8gc3RyZWFtIGV2ZW50cyBmb3IgdGhlIGZpbmUtdHVuZSBqb2IuIElmIHNldCB0byB0cnVlLCBldmVudHMgd2lsbCBiZSBzZW50IGFzIGRhdGEtb25seSBbc2VydmVyLXNlbnQgZXZlbnRzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU2VydmVyLXNlbnRfZXZlbnRzL1VzaW5nX3NlcnZlci1zZW50X2V2ZW50cyNFdmVudF9zdHJlYW1fZm9ybWF0KSBhcyB0aGV5IGJlY29tZSBhdmFpbGFibGUuIFRoZSBzdHJlYW0gd2lsbCB0ZXJtaW5hdGUgd2l0aCBhICYjeDYwO2RhdGE6IFtET05FXSYjeDYwOyBtZXNzYWdlIHdoZW4gdGhlIGpvYiBpcyBmaW5pc2hlZCAoc3VjY2VlZGVkLCBjYW5jZWxsZWQsIG9yIGZhaWxlZCkuICBJZiBzZXQgdG8gZmFsc2UsIG9ubHkgZXZlbnRzIGdlbmVyYXRlZCBzbyBmYXIgd2lsbCBiZSByZXR1cm5lZC5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RGaW5lVHVuZUV2ZW50cyhmaW5lVHVuZUlkLCBzdHJlYW0sIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLmxpc3RGaW5lVHVuZUV2ZW50cyhmaW5lVHVuZUlkLCBzdHJlYW0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IExpc3QgeW91ciBvcmdhbml6YXRpb25cXCdzIGZpbmUtdHVuaW5nIGpvYnNcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGxpc3RGaW5lVHVuZXMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IubGlzdEZpbmVUdW5lcyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdE1vZGVscyhvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5saXN0TW9kZWxzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgaXQgc3VjaCBhcyB0aGUgb3duZXIgYW5kIGF2YWlsYWJpbGl0eS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUVuZ2luZShlbmdpbmVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IucmV0cmlldmVFbmdpbmUoZW5naW5lSWQsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb21tb25fMS5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24obG9jYWxWYXJBeGlvc0FyZ3MsIGF4aW9zXzEuZGVmYXVsdCwgYmFzZV8xLkJBU0VfUEFUSCwgY29uZmlndXJhdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsb2NhbFZhckF4aW9zQXJncyA9IHlpZWxkIGxvY2FsVmFyQXhpb3NQYXJhbUNyZWF0b3IucmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgR2V0cyBpbmZvIGFib3V0IHRoZSBmaW5lLXR1bmUgam9iLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBeGlvc0FyZ3MgPSB5aWVsZCBsb2NhbFZhckF4aW9zUGFyYW1DcmVhdG9yLnJldHJpZXZlRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbW1vbl8xLmNyZWF0ZVJlcXVlc3RGdW5jdGlvbihsb2NhbFZhckF4aW9zQXJncywgYXhpb3NfMS5kZWZhdWx0LCBiYXNlXzEuQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0cmlldmVzIGEgbW9kZWwgaW5zdGFuY2UsIHByb3ZpZGluZyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbW9kZWwgc3VjaCBhcyB0aGUgb3duZXIgYW5kIHBlcm1pc3Npb25pbmcuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZU1vZGVsKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsVmFyQXhpb3NBcmdzID0geWllbGQgbG9jYWxWYXJBeGlvc1BhcmFtQ3JlYXRvci5yZXRyaWV2ZU1vZGVsKG1vZGVsLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tbW9uXzEuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uKGxvY2FsVmFyQXhpb3NBcmdzLCBheGlvc18xLmRlZmF1bHQsIGJhc2VfMS5CQVNFX1BBVEgsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgfTtcbn07XG4vKipcbiAqIE9wZW5BSUFwaSAtIGZhY3RvcnkgaW50ZXJmYWNlXG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuT3BlbkFJQXBpRmFjdG9yeSA9IGZ1bmN0aW9uIChjb25maWd1cmF0aW9uLCBiYXNlUGF0aCwgYXhpb3MpIHtcbiAgICBjb25zdCBsb2NhbFZhckZwID0gZXhwb3J0cy5PcGVuQUlBcGlGcChjb25maWd1cmF0aW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgSW1tZWRpYXRlbHkgY2FuY2VsIGEgZmluZS10dW5lIGpvYi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGNhbmNlbFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY2FuY2VsRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY2FuY2VsRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IEFuc3dlcnMgdGhlIHNwZWNpZmllZCBxdWVzdGlvbiB1c2luZyB0aGUgcHJvdmlkZWQgZG9jdW1lbnRzIGFuZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgcHJvdmlkZWQgZG9jdW1lbnRzIG9yIGZpbGVzIHRvIGZpbmQgcmVsZXZhbnQgY29udGV4dC4gVGhlIHJlbGV2YW50IGNvbnRleHQgaXMgY29tYmluZWQgd2l0aCB0aGUgcHJvdmlkZWQgZXhhbXBsZXMgYW5kIHF1ZXN0aW9uIHRvIGNyZWF0ZSB0aGUgcHJvbXB0IGZvciBbY29tcGxldGlvbl0oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQW5zd2VyUmVxdWVzdH0gY3JlYXRlQW5zd2VyUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQW5zd2VyKGNyZWF0ZUFuc3dlclJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUFuc3dlcihjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGNvbXBsZXRpb24gZm9yIHRoZSBjaGF0IG1lc3NhZ2VcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVDaGF0Q29tcGxldGlvbihjcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIHRoZSBzcGVjaWZpZWQgYHF1ZXJ5YCB1c2luZyBwcm92aWRlZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgdGhlIGxhYmVsZWQgZXhhbXBsZXMgdG8gc2VsZWN0IHRoZSBvbmVzIG1vc3QgcmVsZXZhbnQgZm9yIHRoZSBwYXJ0aWN1bGFyIHF1ZXJ5LiBUaGVuLCB0aGUgcmVsZXZhbnQgZXhhbXBsZXMgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHF1ZXJ5IHRvIGNvbnN0cnVjdCBhIHByb21wdCB0byBwcm9kdWNlIHRoZSBmaW5hbCBsYWJlbCB2aWEgdGhlIFtjb21wbGV0aW9uc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykgZW5kcG9pbnQuICBMYWJlbGVkIGV4YW1wbGVzIGNhbiBiZSBwcm92aWRlZCB2aWEgYW4gdXBsb2FkZWQgYGZpbGVgLCBvciBleHBsaWNpdGx5IGxpc3RlZCBpbiB0aGUgcmVxdWVzdCB1c2luZyB0aGUgYGV4YW1wbGVzYCBwYXJhbWV0ZXIgZm9yIHF1aWNrIHRlc3RzIGFuZCBzbWFsbCBzY2FsZSB1c2UgY2FzZXMuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0fSBjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQGRlcHJlY2F0ZWRcbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNsYXNzaWZpY2F0aW9uKGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlQ2xhc3NpZmljYXRpb24oY3JlYXRlQ2xhc3NpZmljYXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIGNvbXBsZXRpb24gZm9yIHRoZSBwcm92aWRlZCBwcm9tcHQgYW5kIHBhcmFtZXRlcnNcbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVDb21wbGV0aW9uUmVxdWVzdH0gY3JlYXRlQ29tcGxldGlvblJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUNvbXBsZXRpb24oY3JlYXRlQ29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUNvbXBsZXRpb24oY3JlYXRlQ29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgbmV3IGVkaXQgZm9yIHRoZSBwcm92aWRlZCBpbnB1dCwgaW5zdHJ1Y3Rpb24sIGFuZCBwYXJhbWV0ZXJzLlxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUVkaXRSZXF1ZXN0fSBjcmVhdGVFZGl0UmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gZW1iZWRkaW5nIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGlucHV0IHRleHQuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlRW1iZWRkaW5nUmVxdWVzdH0gY3JlYXRlRW1iZWRkaW5nUmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRW1iZWRkaW5nKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUVtYmVkZGluZyhjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVXBsb2FkIGEgZmlsZSB0aGF0IGNvbnRhaW5zIGRvY3VtZW50KHMpIHRvIGJlIHVzZWQgYWNyb3NzIHZhcmlvdXMgZW5kcG9pbnRzL2ZlYXR1cmVzLiBDdXJyZW50bHksIHRoZSBzaXplIG9mIGFsbCB0aGUgZmlsZXMgdXBsb2FkZWQgYnkgb25lIG9yZ2FuaXphdGlvbiBjYW4gYmUgdXAgdG8gMSBHQi4gUGxlYXNlIGNvbnRhY3QgdXMgaWYgeW91IG5lZWQgdG8gaW5jcmVhc2UgdGhlIHN0b3JhZ2UgbGltaXQuXG4gICAgICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBOYW1lIG9mIHRoZSBbSlNPTiBMaW5lc10oaHR0cHM6Ly9qc29ubGluZXMucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0LykgZmlsZSB0byBiZSB1cGxvYWRlZC4gIElmIHRoZSAmI3g2MDtwdXJwb3NlJiN4NjA7IGlzIHNldCB0byBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDssIGVhY2ggbGluZSBpcyBhIEpTT04gcmVjb3JkIHdpdGggXFxcXFxcJnF1b3Q7cHJvbXB0XFxcXFxcJnF1b3Q7IGFuZCBcXFxcXFwmcXVvdDtjb21wbGV0aW9uXFxcXFxcJnF1b3Q7IGZpZWxkcyByZXByZXNlbnRpbmcgeW91ciBbdHJhaW5pbmcgZXhhbXBsZXNdKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZy9wcmVwYXJlLXRyYWluaW5nLWRhdGEpLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHVycG9zZSBUaGUgaW50ZW5kZWQgcHVycG9zZSBvZiB0aGUgdXBsb2FkZWQgZG9jdW1lbnRzLiAgVXNlIFxcXFxcXCZxdW90O2ZpbmUtdHVuZVxcXFxcXCZxdW90OyBmb3IgW0ZpbmUtdHVuaW5nXSgvZG9jcy9hcGktcmVmZXJlbmNlL2ZpbmUtdHVuZXMpLiBUaGlzIGFsbG93cyB1cyB0byB2YWxpZGF0ZSB0aGUgZm9ybWF0IG9mIHRoZSB1cGxvYWRlZCBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlRmlsZShmaWxlLCBwdXJwb3NlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVGaWxlKGZpbGUsIHB1cnBvc2UsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgam9iIHRoYXQgZmluZS10dW5lcyBhIHNwZWNpZmllZCBtb2RlbCBmcm9tIGEgZ2l2ZW4gZGF0YXNldC4gIFJlc3BvbnNlIGluY2x1ZGVzIGRldGFpbHMgb2YgdGhlIGVucXVldWVkIGpvYiBpbmNsdWRpbmcgam9iIHN0YXR1cyBhbmQgdGhlIG5hbWUgb2YgdGhlIGZpbmUtdHVuZWQgbW9kZWxzIG9uY2UgY29tcGxldGUuICBbTGVhcm4gbW9yZSBhYm91dCBGaW5lLXR1bmluZ10oL2RvY3MvZ3VpZGVzL2ZpbmUtdHVuaW5nKVxuICAgICAgICAgKiBAcGFyYW0ge0NyZWF0ZUZpbmVUdW5lUmVxdWVzdH0gY3JlYXRlRmluZVR1bmVSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVGaW5lVHVuZShjcmVhdGVGaW5lVHVuZVJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUZpbmVUdW5lKGNyZWF0ZUZpbmVUdW5lUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYW4gaW1hZ2UgZ2l2ZW4gYSBwcm9tcHQuXG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlSW1hZ2VSZXF1ZXN0fSBjcmVhdGVJbWFnZVJlcXVlc3RcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlKGNyZWF0ZUltYWdlUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlSW1hZ2UoY3JlYXRlSW1hZ2VSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlZGl0ZWQgb3IgZXh0ZW5kZWQgaW1hZ2UgZ2l2ZW4gYW4gb3JpZ2luYWwgaW1hZ2UgYW5kIGEgcHJvbXB0LlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byBlZGl0LiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuIElmIG1hc2sgaXMgbm90IHByb3ZpZGVkLCBpbWFnZSBtdXN0IGhhdmUgdHJhbnNwYXJlbmN5LCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgdGhlIG1hc2suXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9tcHQgQSB0ZXh0IGRlc2NyaXB0aW9uIG9mIHRoZSBkZXNpcmVkIGltYWdlKHMpLiBUaGUgbWF4aW11bSBsZW5ndGggaXMgMTAwMCBjaGFyYWN0ZXJzLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IFttYXNrXSBBbiBhZGRpdGlvbmFsIGltYWdlIHdob3NlIGZ1bGx5IHRyYW5zcGFyZW50IGFyZWFzIChlLmcuIHdoZXJlIGFscGhhIGlzIHplcm8pIGluZGljYXRlIHdoZXJlICYjeDYwO2ltYWdlJiN4NjA7IHNob3VsZCBiZSBlZGl0ZWQuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIGhhdmUgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyAmI3g2MDtpbWFnZSYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IFtuXSBUaGUgbnVtYmVyIG9mIGltYWdlcyB0byBnZW5lcmF0ZS4gTXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDEwLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NpemVdIFRoZSBzaXplIG9mIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDsyNTZ4MjU2JiN4NjA7LCAmI3g2MDs1MTJ4NTEyJiN4NjA7LCBvciAmI3g2MDsxMDI0eDEwMjQmI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgaW4gd2hpY2ggdGhlIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHJldHVybmVkLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDt1cmwmI3g2MDsgb3IgJiN4NjA7YjY0X2pzb24mI3g2MDsuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbdXNlcl0gQSB1bmlxdWUgaWRlbnRpZmllciByZXByZXNlbnRpbmcgeW91ciBlbmQtdXNlciwgd2hpY2ggY2FuIGhlbHAgT3BlbkFJIHRvIG1vbml0b3IgYW5kIGRldGVjdCBhYnVzZS4gW0xlYXJuIG1vcmVdKC9kb2NzL2d1aWRlcy9zYWZldHktYmVzdC1wcmFjdGljZXMvZW5kLXVzZXItaWRzKS5cbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUltYWdlRWRpdChpbWFnZSwgcHJvbXB0LCBtYXNrLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuY3JlYXRlSW1hZ2VFZGl0KGltYWdlLCBwcm9tcHQsIG1hc2ssIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhIHZhcmlhdGlvbiBvZiBhIGdpdmVuIGltYWdlLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGltYWdlIFRoZSBpbWFnZSB0byB1c2UgYXMgdGhlIGJhc2lzIGZvciB0aGUgdmFyaWF0aW9uKHMpLiBNdXN0IGJlIGEgdmFsaWQgUE5HIGZpbGUsIGxlc3MgdGhhbiA0TUIsIGFuZCBzcXVhcmUuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IGluIHdoaWNoIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzIGFyZSByZXR1cm5lZC4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7dXJsJiN4NjA7IG9yICYjeDYwO2I2NF9qc29uJiN4NjA7LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZUltYWdlVmFyaWF0aW9uKGltYWdlLCBuLCBzaXplLCByZXNwb25zZUZvcm1hdCwgdXNlciwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IENsYXNzaWZpZXMgaWYgdGV4dCB2aW9sYXRlcyBPcGVuQUlcXCdzIENvbnRlbnQgUG9saWN5XG4gICAgICAgICAqIEBwYXJhbSB7Q3JlYXRlTW9kZXJhdGlvblJlcXVlc3R9IGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgVGhlIHNlYXJjaCBlbmRwb2ludCBjb21wdXRlcyBzaW1pbGFyaXR5IHNjb3JlcyBiZXR3ZWVuIHByb3ZpZGVkIHF1ZXJ5IGFuZCBkb2N1bWVudHMuIERvY3VtZW50cyBjYW4gYmUgcGFzc2VkIGRpcmVjdGx5IHRvIHRoZSBBUEkgaWYgdGhlcmUgYXJlIG5vIG1vcmUgdGhhbiAyMDAgb2YgdGhlbS4gIFRvIGdvIGJleW9uZCB0aGUgMjAwIGRvY3VtZW50IGxpbWl0LCBkb2N1bWVudHMgY2FuIGJlIHByb2Nlc3NlZCBvZmZsaW5lIGFuZCB0aGVuIHVzZWQgZm9yIGVmZmljaWVudCByZXRyaWV2YWwgYXQgcXVlcnkgdGltZS4gV2hlbiBgZmlsZWAgaXMgc2V0LCB0aGUgc2VhcmNoIGVuZHBvaW50IHNlYXJjaGVzIG92ZXIgYWxsIHRoZSBkb2N1bWVudHMgaW4gdGhlIGdpdmVuIGZpbGUgYW5kIHJldHVybnMgdXAgdG8gdGhlIGBtYXhfcmVyYW5rYCBudW1iZXIgb2YgZG9jdW1lbnRzLiBUaGVzZSBkb2N1bWVudHMgd2lsbCBiZSByZXR1cm5lZCBhbG9uZyB3aXRoIHRoZWlyIHNlYXJjaCBzY29yZXMuICBUaGUgc2ltaWxhcml0eSBzY29yZSBpcyBhIHBvc2l0aXZlIHNjb3JlIHRoYXQgdXN1YWxseSByYW5nZXMgZnJvbSAwIHRvIDMwMCAoYnV0IGNhbiBzb21ldGltZXMgZ28gaGlnaGVyKSwgd2hlcmUgYSBzY29yZSBhYm92ZSAyMDAgdXN1YWxseSBtZWFucyB0aGUgZG9jdW1lbnQgaXMgc2VtYW50aWNhbGx5IHNpbWlsYXIgdG8gdGhlIHF1ZXJ5LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZW5naW5lSWQgVGhlIElEIG9mIHRoZSBlbmdpbmUgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3QuICBZb3UgY2FuIHNlbGVjdCBvbmUgb2YgJiN4NjA7YWRhJiN4NjA7LCAmI3g2MDtiYWJiYWdlJiN4NjA7LCAmI3g2MDtjdXJpZSYjeDYwOywgb3IgJiN4NjA7ZGF2aW5jaSYjeDYwOy5cbiAgICAgICAgICogQHBhcmFtIHtDcmVhdGVTZWFyY2hSZXF1ZXN0fSBjcmVhdGVTZWFyY2hSZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEBkZXByZWNhdGVkXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVTZWFyY2goZW5naW5lSWQsIGNyZWF0ZVNlYXJjaFJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmNyZWF0ZVNlYXJjaChlbmdpbmVJZCwgY3JlYXRlU2VhcmNoUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFRyYW5zY3JpYmVzIGF1ZGlvIGludG8gdGhlIGlucHV0IGxhbmd1YWdlLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGF1ZGlvIGZpbGUgdG8gdHJhbnNjcmliZSwgaW4gb25lIG9mIHRoZXNlIGZvcm1hdHM6IG1wMywgbXA0LCBtcGVnLCBtcGdhLCBtNGEsIHdhdiwgb3Igd2VibS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcHJvbXB0XSBBbiBvcHRpb25hbCB0ZXh0IHRvIGd1aWRlIHRoZSBtb2RlbFxcXFxcXCYjMzk7cyBzdHlsZSBvciBjb250aW51ZSBhIHByZXZpb3VzIGF1ZGlvIHNlZ21lbnQuIFRoZSBbcHJvbXB0XSgvZG9jcy9ndWlkZXMvc3BlZWNoLXRvLXRleHQvcHJvbXB0aW5nKSBzaG91bGQgbWF0Y2ggdGhlIGF1ZGlvIGxhbmd1YWdlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IG9mIHRoZSB0cmFuc2NyaXB0IG91dHB1dCwgaW4gb25lIG9mIHRoZXNlIG9wdGlvbnM6IGpzb24sIHRleHQsIHNydCwgdmVyYm9zZV9qc29uLCBvciB2dHQuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2xhbmd1YWdlXSBUaGUgbGFuZ3VhZ2Ugb2YgdGhlIGlucHV0IGF1ZGlvLiBTdXBwbHlpbmcgdGhlIGlucHV0IGxhbmd1YWdlIGluIFtJU08tNjM5LTFdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0xpc3Rfb2ZfSVNPXzYzOS0xX2NvZGVzKSBmb3JtYXQgd2lsbCBpbXByb3ZlIGFjY3VyYWN5IGFuZCBsYXRlbmN5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVHJhbnNjcmlwdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIGxhbmd1YWdlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVUcmFuc2NyaXB0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgbGFuZ3VhZ2UsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBUcmFuc2xhdGVzIGF1ZGlvIGludG8gaW50byBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge0ZpbGV9IGZpbGUgVGhlIGF1ZGlvIGZpbGUgdG8gdHJhbnNsYXRlLCBpbiBvbmUgb2YgdGhlc2UgZm9ybWF0czogbXAzLCBtcDQsIG1wZWcsIG1wZ2EsIG00YSwgd2F2LCBvciB3ZWJtLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZS4gT25seSAmI3g2MDt3aGlzcGVyLTEmI3g2MDsgaXMgY3VycmVudGx5IGF2YWlsYWJsZS5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBiZSBpbiBFbmdsaXNoLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Jlc3BvbnNlRm9ybWF0XSBUaGUgZm9ybWF0IG9mIHRoZSB0cmFuc2NyaXB0IG91dHB1dCwgaW4gb25lIG9mIHRoZXNlIG9wdGlvbnM6IGpzb24sIHRleHQsIHNydCwgdmVyYm9zZV9qc29uLCBvciB2dHQuXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgY3JlYXRlVHJhbnNsYXRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5jcmVhdGVUcmFuc2xhdGlvbihmaWxlLCBtb2RlbCwgcHJvbXB0LCByZXNwb25zZUZvcm1hdCwgdGVtcGVyYXR1cmUsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBEZWxldGUgYSBmaWxlLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgZGVsZXRlRmlsZShmaWxlSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLmRlbGV0ZUZpbGUoZmlsZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgRGVsZXRlIGEgZmluZS10dW5lZCBtb2RlbC4gWW91IG11c3QgaGF2ZSB0aGUgT3duZXIgcm9sZSBpbiB5b3VyIG9yZ2FuaXphdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIFRoZSBtb2RlbCB0byBkZWxldGVcbiAgICAgICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgICAgICovXG4gICAgICAgIGRlbGV0ZU1vZGVsKG1vZGVsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5kZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZmlsZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgZG93bmxvYWRGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAuZG93bmxvYWRGaWxlKGZpbGVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IExpc3RzIHRoZSBjdXJyZW50bHkgYXZhaWxhYmxlIChub24tZmluZXR1bmVkKSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEVuZ2luZXMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAubGlzdEVuZ2luZXMob3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHVybnMgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYmVsb25nIHRvIHRoZSB1c2VyXFwncyBvcmdhbml6YXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmlsZXMob3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAubGlzdEZpbGVzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBHZXQgZmluZS1ncmFpbmVkIHN0YXR1cyB1cGRhdGVzIGZvciBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaW5lVHVuZUlkIFRoZSBJRCBvZiB0aGUgZmluZS10dW5lIGpvYiB0byBnZXQgZXZlbnRzIGZvci5cbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBbc3RyZWFtXSBXaGV0aGVyIHRvIHN0cmVhbSBldmVudHMgZm9yIHRoZSBmaW5lLXR1bmUgam9iLiBJZiBzZXQgdG8gdHJ1ZSwgZXZlbnRzIHdpbGwgYmUgc2VudCBhcyBkYXRhLW9ubHkgW3NlcnZlci1zZW50IGV2ZW50c10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cy9Vc2luZ19zZXJ2ZXItc2VudF9ldmVudHMjRXZlbnRfc3RyZWFtX2Zvcm1hdCkgYXMgdGhleSBiZWNvbWUgYXZhaWxhYmxlLiBUaGUgc3RyZWFtIHdpbGwgdGVybWluYXRlIHdpdGggYSAmI3g2MDtkYXRhOiBbRE9ORV0mI3g2MDsgbWVzc2FnZSB3aGVuIHRoZSBqb2IgaXMgZmluaXNoZWQgKHN1Y2NlZWRlZCwgY2FuY2VsbGVkLCBvciBmYWlsZWQpLiAgSWYgc2V0IHRvIGZhbHNlLCBvbmx5IGV2ZW50cyBnZW5lcmF0ZWQgc28gZmFyIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICBsaXN0RmluZVR1bmVFdmVudHMoZmluZVR1bmVJZCwgc3RyZWFtLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5saXN0RmluZVR1bmVFdmVudHMoZmluZVR1bmVJZCwgc3RyZWFtLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgTGlzdCB5b3VyIG9yZ2FuaXphdGlvblxcJ3MgZmluZS10dW5pbmcgam9ic1xuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdEZpbmVUdW5lcyhvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5saXN0RmluZVR1bmVzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgbGlzdE1vZGVscyhvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5saXN0TW9kZWxzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QoYXhpb3MsIGJhc2VQYXRoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAc3VtbWFyeSBSZXRyaWV2ZXMgYSBtb2RlbCBpbnN0YW5jZSwgcHJvdmlkaW5nIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGl0IHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBlbmdpbmVJZCBUaGUgSUQgb2YgdGhlIGVuZ2luZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVFbmdpbmUoZW5naW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLnJldHJpZXZlRW5naW5lKGVuZ2luZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIHNwZWNpZmljIGZpbGUuXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUZpbGUoZmlsZUlkLCBvcHRpb25zKSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxWYXJGcC5yZXRyaWV2ZUZpbGUoZmlsZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KGF4aW9zLCBiYXNlUGF0aCkpO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHN1bW1hcnkgR2V0cyBpbmZvIGFib3V0IHRoZSBmaW5lLXR1bmUgam9iLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iXG4gICAgICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICAgICAqL1xuICAgICAgICByZXRyaWV2ZUZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFZhckZwLnJldHJpZXZlRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBzdW1tYXJ5IFJldHJpZXZlcyBhIG1vZGVsIGluc3RhbmNlLCBwcm92aWRpbmcgYmFzaWMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG1vZGVsIHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBwZXJtaXNzaW9uaW5nLlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgVGhlIElEIG9mIHRoZSBtb2RlbCB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0cmlldmVNb2RlbChtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsVmFyRnAucmV0cmlldmVNb2RlbChtb2RlbCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdChheGlvcywgYmFzZVBhdGgpKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbi8qKlxuICogT3BlbkFJQXBpIC0gb2JqZWN0LW9yaWVudGVkIGludGVyZmFjZVxuICogQGV4cG9ydFxuICogQGNsYXNzIE9wZW5BSUFwaVxuICogQGV4dGVuZHMge0Jhc2VBUEl9XG4gKi9cbmNsYXNzIE9wZW5BSUFwaSBleHRlbmRzIGJhc2VfMS5CYXNlQVBJIHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IEltbWVkaWF0ZWx5IGNhbmNlbCBhIGZpbmUtdHVuZSBqb2IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbmVUdW5lSWQgVGhlIElEIG9mIHRoZSBmaW5lLXR1bmUgam9iIHRvIGNhbmNlbFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY2FuY2VsRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNhbmNlbEZpbmVUdW5lKGZpbmVUdW5lSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IEFuc3dlcnMgdGhlIHNwZWNpZmllZCBxdWVzdGlvbiB1c2luZyB0aGUgcHJvdmlkZWQgZG9jdW1lbnRzIGFuZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgcHJvdmlkZWQgZG9jdW1lbnRzIG9yIGZpbGVzIHRvIGZpbmQgcmVsZXZhbnQgY29udGV4dC4gVGhlIHJlbGV2YW50IGNvbnRleHQgaXMgY29tYmluZWQgd2l0aCB0aGUgcHJvdmlkZWQgZXhhbXBsZXMgYW5kIHF1ZXN0aW9uIHRvIGNyZWF0ZSB0aGUgcHJvbXB0IGZvciBbY29tcGxldGlvbl0oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykuXG4gICAgICogQHBhcmFtIHtDcmVhdGVBbnN3ZXJSZXF1ZXN0fSBjcmVhdGVBbnN3ZXJSZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUFuc3dlcihjcmVhdGVBbnN3ZXJSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlQW5zd2VyKGNyZWF0ZUFuc3dlclJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgY2hhdCBtZXNzYWdlXG4gICAgICogQHBhcmFtIHtDcmVhdGVDaGF0Q29tcGxldGlvblJlcXVlc3R9IGNyZWF0ZUNoYXRDb21wbGV0aW9uUmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlQ2hhdENvbXBsZXRpb24oY3JlYXRlQ2hhdENvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDbGFzc2lmaWVzIHRoZSBzcGVjaWZpZWQgYHF1ZXJ5YCB1c2luZyBwcm92aWRlZCBleGFtcGxlcy4gIFRoZSBlbmRwb2ludCBmaXJzdCBbc2VhcmNoZXNdKC9kb2NzL2FwaS1yZWZlcmVuY2Uvc2VhcmNoZXMpIG92ZXIgdGhlIGxhYmVsZWQgZXhhbXBsZXMgdG8gc2VsZWN0IHRoZSBvbmVzIG1vc3QgcmVsZXZhbnQgZm9yIHRoZSBwYXJ0aWN1bGFyIHF1ZXJ5LiBUaGVuLCB0aGUgcmVsZXZhbnQgZXhhbXBsZXMgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHF1ZXJ5IHRvIGNvbnN0cnVjdCBhIHByb21wdCB0byBwcm9kdWNlIHRoZSBmaW5hbCBsYWJlbCB2aWEgdGhlIFtjb21wbGV0aW9uc10oL2RvY3MvYXBpLXJlZmVyZW5jZS9jb21wbGV0aW9ucykgZW5kcG9pbnQuICBMYWJlbGVkIGV4YW1wbGVzIGNhbiBiZSBwcm92aWRlZCB2aWEgYW4gdXBsb2FkZWQgYGZpbGVgLCBvciBleHBsaWNpdGx5IGxpc3RlZCBpbiB0aGUgcmVxdWVzdCB1c2luZyB0aGUgYGV4YW1wbGVzYCBwYXJhbWV0ZXIgZm9yIHF1aWNrIHRlc3RzIGFuZCBzbWFsbCBzY2FsZSB1c2UgY2FzZXMuXG4gICAgICogQHBhcmFtIHtDcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3R9IGNyZWF0ZUNsYXNzaWZpY2F0aW9uUmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVDbGFzc2lmaWNhdGlvbihjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVDbGFzc2lmaWNhdGlvbihjcmVhdGVDbGFzc2lmaWNhdGlvblJlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBjb21wbGV0aW9uIGZvciB0aGUgcHJvdmlkZWQgcHJvbXB0IGFuZCBwYXJhbWV0ZXJzXG4gICAgICogQHBhcmFtIHtDcmVhdGVDb21wbGV0aW9uUmVxdWVzdH0gY3JlYXRlQ29tcGxldGlvblJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUNvbXBsZXRpb24oY3JlYXRlQ29tcGxldGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVDb21wbGV0aW9uKGNyZWF0ZUNvbXBsZXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgbmV3IGVkaXQgZm9yIHRoZSBwcm92aWRlZCBpbnB1dCwgaW5zdHJ1Y3Rpb24sIGFuZCBwYXJhbWV0ZXJzLlxuICAgICAqIEBwYXJhbSB7Q3JlYXRlRWRpdFJlcXVlc3R9IGNyZWF0ZUVkaXRSZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVFZGl0KGNyZWF0ZUVkaXRSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlRWRpdChjcmVhdGVFZGl0UmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlbWJlZGRpbmcgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgdGV4dC5cbiAgICAgKiBAcGFyYW0ge0NyZWF0ZUVtYmVkZGluZ1JlcXVlc3R9IGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUVtYmVkZGluZyhjcmVhdGVFbWJlZGRpbmdSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlRW1iZWRkaW5nKGNyZWF0ZUVtYmVkZGluZ1JlcXVlc3QsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFVwbG9hZCBhIGZpbGUgdGhhdCBjb250YWlucyBkb2N1bWVudChzKSB0byBiZSB1c2VkIGFjcm9zcyB2YXJpb3VzIGVuZHBvaW50cy9mZWF0dXJlcy4gQ3VycmVudGx5LCB0aGUgc2l6ZSBvZiBhbGwgdGhlIGZpbGVzIHVwbG9hZGVkIGJ5IG9uZSBvcmdhbml6YXRpb24gY2FuIGJlIHVwIHRvIDEgR0IuIFBsZWFzZSBjb250YWN0IHVzIGlmIHlvdSBuZWVkIHRvIGluY3JlYXNlIHRoZSBzdG9yYWdlIGxpbWl0LlxuICAgICAqIEBwYXJhbSB7RmlsZX0gZmlsZSBOYW1lIG9mIHRoZSBbSlNPTiBMaW5lc10oaHR0cHM6Ly9qc29ubGluZXMucmVhZHRoZWRvY3MuaW8vZW4vbGF0ZXN0LykgZmlsZSB0byBiZSB1cGxvYWRlZC4gIElmIHRoZSAmI3g2MDtwdXJwb3NlJiN4NjA7IGlzIHNldCB0byBcXFxcXFwmcXVvdDtmaW5lLXR1bmVcXFxcXFwmcXVvdDssIGVhY2ggbGluZSBpcyBhIEpTT04gcmVjb3JkIHdpdGggXFxcXFxcJnF1b3Q7cHJvbXB0XFxcXFxcJnF1b3Q7IGFuZCBcXFxcXFwmcXVvdDtjb21wbGV0aW9uXFxcXFxcJnF1b3Q7IGZpZWxkcyByZXByZXNlbnRpbmcgeW91ciBbdHJhaW5pbmcgZXhhbXBsZXNdKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZy9wcmVwYXJlLXRyYWluaW5nLWRhdGEpLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwdXJwb3NlIFRoZSBpbnRlbmRlZCBwdXJwb3NlIG9mIHRoZSB1cGxvYWRlZCBkb2N1bWVudHMuICBVc2UgXFxcXFxcJnF1b3Q7ZmluZS10dW5lXFxcXFxcJnF1b3Q7IGZvciBbRmluZS10dW5pbmddKC9kb2NzL2FwaS1yZWZlcmVuY2UvZmluZS10dW5lcykuIFRoaXMgYWxsb3dzIHVzIHRvIHZhbGlkYXRlIHRoZSBmb3JtYXQgb2YgdGhlIHVwbG9hZGVkIGZpbGUuXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVGaWxlKGZpbGUsIHB1cnBvc2UsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVGaWxlKGZpbGUsIHB1cnBvc2UsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENyZWF0ZXMgYSBqb2IgdGhhdCBmaW5lLXR1bmVzIGEgc3BlY2lmaWVkIG1vZGVsIGZyb20gYSBnaXZlbiBkYXRhc2V0LiAgUmVzcG9uc2UgaW5jbHVkZXMgZGV0YWlscyBvZiB0aGUgZW5xdWV1ZWQgam9iIGluY2x1ZGluZyBqb2Igc3RhdHVzIGFuZCB0aGUgbmFtZSBvZiB0aGUgZmluZS10dW5lZCBtb2RlbHMgb25jZSBjb21wbGV0ZS4gIFtMZWFybiBtb3JlIGFib3V0IEZpbmUtdHVuaW5nXSgvZG9jcy9ndWlkZXMvZmluZS10dW5pbmcpXG4gICAgICogQHBhcmFtIHtDcmVhdGVGaW5lVHVuZVJlcXVlc3R9IGNyZWF0ZUZpbmVUdW5lUmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlRmluZVR1bmUoY3JlYXRlRmluZVR1bmVSZXF1ZXN0LCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlRmluZVR1bmUoY3JlYXRlRmluZVR1bmVSZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGFuIGltYWdlIGdpdmVuIGEgcHJvbXB0LlxuICAgICAqIEBwYXJhbSB7Q3JlYXRlSW1hZ2VSZXF1ZXN0fSBjcmVhdGVJbWFnZVJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlKGNyZWF0ZUltYWdlUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZUltYWdlKGNyZWF0ZUltYWdlUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgQ3JlYXRlcyBhbiBlZGl0ZWQgb3IgZXh0ZW5kZWQgaW1hZ2UgZ2l2ZW4gYW4gb3JpZ2luYWwgaW1hZ2UgYW5kIGEgcHJvbXB0LlxuICAgICAqIEBwYXJhbSB7RmlsZX0gaW1hZ2UgVGhlIGltYWdlIHRvIGVkaXQuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIHNxdWFyZS4gSWYgbWFzayBpcyBub3QgcHJvdmlkZWQsIGltYWdlIG11c3QgaGF2ZSB0cmFuc3BhcmVuY3ksIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyB0aGUgbWFzay5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvbXB0IEEgdGV4dCBkZXNjcmlwdGlvbiBvZiB0aGUgZGVzaXJlZCBpbWFnZShzKS4gVGhlIG1heGltdW0gbGVuZ3RoIGlzIDEwMDAgY2hhcmFjdGVycy5cbiAgICAgKiBAcGFyYW0ge0ZpbGV9IFttYXNrXSBBbiBhZGRpdGlvbmFsIGltYWdlIHdob3NlIGZ1bGx5IHRyYW5zcGFyZW50IGFyZWFzIChlLmcuIHdoZXJlIGFscGhhIGlzIHplcm8pIGluZGljYXRlIHdoZXJlICYjeDYwO2ltYWdlJiN4NjA7IHNob3VsZCBiZSBlZGl0ZWQuIE11c3QgYmUgYSB2YWxpZCBQTkcgZmlsZSwgbGVzcyB0aGFuIDRNQiwgYW5kIGhhdmUgdGhlIHNhbWUgZGltZW5zaW9ucyBhcyAmI3g2MDtpbWFnZSYjeDYwOy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW25dIFRoZSBudW1iZXIgb2YgaW1hZ2VzIHRvIGdlbmVyYXRlLiBNdXN0IGJlIGJldHdlZW4gMSBhbmQgMTAuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaXplXSBUaGUgc2l6ZSBvZiB0aGUgZ2VuZXJhdGVkIGltYWdlcy4gTXVzdCBiZSBvbmUgb2YgJiN4NjA7MjU2eDI1NiYjeDYwOywgJiN4NjA7NTEyeDUxMiYjeDYwOywgb3IgJiN4NjA7MTAyNHgxMDI0JiN4NjA7LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VGb3JtYXRdIFRoZSBmb3JtYXQgaW4gd2hpY2ggdGhlIGdlbmVyYXRlZCBpbWFnZXMgYXJlIHJldHVybmVkLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDt1cmwmI3g2MDsgb3IgJiN4NjA7YjY0X2pzb24mI3g2MDsuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFt1c2VyXSBBIHVuaXF1ZSBpZGVudGlmaWVyIHJlcHJlc2VudGluZyB5b3VyIGVuZC11c2VyLCB3aGljaCBjYW4gaGVscCBPcGVuQUkgdG8gbW9uaXRvciBhbmQgZGV0ZWN0IGFidXNlLiBbTGVhcm4gbW9yZV0oL2RvY3MvZ3VpZGVzL3NhZmV0eS1iZXN0LXByYWN0aWNlcy9lbmQtdXNlci1pZHMpLlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlSW1hZ2VFZGl0KGltYWdlLCBwcm9tcHQsIG1hc2ssIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlSW1hZ2VFZGl0KGltYWdlLCBwcm9tcHQsIG1hc2ssIG4sIHNpemUsIHJlc3BvbnNlRm9ybWF0LCB1c2VyLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBDcmVhdGVzIGEgdmFyaWF0aW9uIG9mIGEgZ2l2ZW4gaW1hZ2UuXG4gICAgICogQHBhcmFtIHtGaWxlfSBpbWFnZSBUaGUgaW1hZ2UgdG8gdXNlIGFzIHRoZSBiYXNpcyBmb3IgdGhlIHZhcmlhdGlvbihzKS4gTXVzdCBiZSBhIHZhbGlkIFBORyBmaWxlLCBsZXNzIHRoYW4gNE1CLCBhbmQgc3F1YXJlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbbl0gVGhlIG51bWJlciBvZiBpbWFnZXMgdG8gZ2VuZXJhdGUuIE11c3QgYmUgYmV0d2VlbiAxIGFuZCAxMC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3NpemVdIFRoZSBzaXplIG9mIHRoZSBnZW5lcmF0ZWQgaW1hZ2VzLiBNdXN0IGJlIG9uZSBvZiAmI3g2MDsyNTZ4MjU2JiN4NjA7LCAmI3g2MDs1MTJ4NTEyJiN4NjA7LCBvciAmI3g2MDsxMDI0eDEwMjQmI3g2MDsuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBpbiB3aGljaCB0aGUgZ2VuZXJhdGVkIGltYWdlcyBhcmUgcmV0dXJuZWQuIE11c3QgYmUgb25lIG9mICYjeDYwO3VybCYjeDYwOyBvciAmI3g2MDtiNjRfanNvbiYjeDYwOy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3VzZXJdIEEgdW5pcXVlIGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHlvdXIgZW5kLXVzZXIsIHdoaWNoIGNhbiBoZWxwIE9wZW5BSSB0byBtb25pdG9yIGFuZCBkZXRlY3QgYWJ1c2UuIFtMZWFybiBtb3JlXSgvZG9jcy9ndWlkZXMvc2FmZXR5LWJlc3QtcHJhY3RpY2VzL2VuZC11c2VyLWlkcykuXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVJbWFnZVZhcmlhdGlvbihpbWFnZSwgbiwgc2l6ZSwgcmVzcG9uc2VGb3JtYXQsIHVzZXIsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IENsYXNzaWZpZXMgaWYgdGV4dCB2aW9sYXRlcyBPcGVuQUlcXCdzIENvbnRlbnQgUG9saWN5XG4gICAgICogQHBhcmFtIHtDcmVhdGVNb2RlcmF0aW9uUmVxdWVzdH0gY3JlYXRlTW9kZXJhdGlvblJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZU1vZGVyYXRpb24oY3JlYXRlTW9kZXJhdGlvblJlcXVlc3QsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVNb2RlcmF0aW9uKGNyZWF0ZU1vZGVyYXRpb25SZXF1ZXN0LCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBUaGUgc2VhcmNoIGVuZHBvaW50IGNvbXB1dGVzIHNpbWlsYXJpdHkgc2NvcmVzIGJldHdlZW4gcHJvdmlkZWQgcXVlcnkgYW5kIGRvY3VtZW50cy4gRG9jdW1lbnRzIGNhbiBiZSBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIEFQSSBpZiB0aGVyZSBhcmUgbm8gbW9yZSB0aGFuIDIwMCBvZiB0aGVtLiAgVG8gZ28gYmV5b25kIHRoZSAyMDAgZG9jdW1lbnQgbGltaXQsIGRvY3VtZW50cyBjYW4gYmUgcHJvY2Vzc2VkIG9mZmxpbmUgYW5kIHRoZW4gdXNlZCBmb3IgZWZmaWNpZW50IHJldHJpZXZhbCBhdCBxdWVyeSB0aW1lLiBXaGVuIGBmaWxlYCBpcyBzZXQsIHRoZSBzZWFyY2ggZW5kcG9pbnQgc2VhcmNoZXMgb3ZlciBhbGwgdGhlIGRvY3VtZW50cyBpbiB0aGUgZ2l2ZW4gZmlsZSBhbmQgcmV0dXJucyB1cCB0byB0aGUgYG1heF9yZXJhbmtgIG51bWJlciBvZiBkb2N1bWVudHMuIFRoZXNlIGRvY3VtZW50cyB3aWxsIGJlIHJldHVybmVkIGFsb25nIHdpdGggdGhlaXIgc2VhcmNoIHNjb3Jlcy4gIFRoZSBzaW1pbGFyaXR5IHNjb3JlIGlzIGEgcG9zaXRpdmUgc2NvcmUgdGhhdCB1c3VhbGx5IHJhbmdlcyBmcm9tIDAgdG8gMzAwIChidXQgY2FuIHNvbWV0aW1lcyBnbyBoaWdoZXIpLCB3aGVyZSBhIHNjb3JlIGFib3ZlIDIwMCB1c3VhbGx5IG1lYW5zIHRoZSBkb2N1bWVudCBpcyBzZW1hbnRpY2FsbHkgc2ltaWxhciB0byB0aGUgcXVlcnkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0LiAgWW91IGNhbiBzZWxlY3Qgb25lIG9mICYjeDYwO2FkYSYjeDYwOywgJiN4NjA7YmFiYmFnZSYjeDYwOywgJiN4NjA7Y3VyaWUmI3g2MDssIG9yICYjeDYwO2RhdmluY2kmI3g2MDsuXG4gICAgICogQHBhcmFtIHtDcmVhdGVTZWFyY2hSZXF1ZXN0fSBjcmVhdGVTZWFyY2hSZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGNyZWF0ZVNlYXJjaChlbmdpbmVJZCwgY3JlYXRlU2VhcmNoUmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmNyZWF0ZVNlYXJjaChlbmdpbmVJZCwgY3JlYXRlU2VhcmNoUmVxdWVzdCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgVHJhbnNjcmliZXMgYXVkaW8gaW50byB0aGUgaW5wdXQgbGFuZ3VhZ2UuXG4gICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zY3JpYmUsIGluIG9uZSBvZiB0aGVzZSBmb3JtYXRzOiBtcDMsIG1wNCwgbXBlZywgbXBnYSwgbTRhLCB3YXYsIG9yIHdlYm0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIElEIG9mIHRoZSBtb2RlbCB0byB1c2UuIE9ubHkgJiN4NjA7d2hpc3Blci0xJiN4NjA7IGlzIGN1cnJlbnRseSBhdmFpbGFibGUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtwcm9tcHRdIEFuIG9wdGlvbmFsIHRleHQgdG8gZ3VpZGUgdGhlIG1vZGVsXFxcXFxcJiMzOTtzIHN0eWxlIG9yIGNvbnRpbnVlIGEgcHJldmlvdXMgYXVkaW8gc2VnbWVudC4gVGhlIFtwcm9tcHRdKC9kb2NzL2d1aWRlcy9zcGVlY2gtdG8tdGV4dC9wcm9tcHRpbmcpIHNob3VsZCBtYXRjaCB0aGUgYXVkaW8gbGFuZ3VhZ2UuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbGFuZ3VhZ2VdIFRoZSBsYW5ndWFnZSBvZiB0aGUgaW5wdXQgYXVkaW8uIFN1cHBseWluZyB0aGUgaW5wdXQgbGFuZ3VhZ2UgaW4gW0lTTy02MzktMV0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9JU09fNjM5LTFfY29kZXMpIGZvcm1hdCB3aWxsIGltcHJvdmUgYWNjdXJhY3kgYW5kIGxhdGVuY3kuXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc2NyaXB0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgbGFuZ3VhZ2UsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5jcmVhdGVUcmFuc2NyaXB0aW9uKGZpbGUsIG1vZGVsLCBwcm9tcHQsIHJlc3BvbnNlRm9ybWF0LCB0ZW1wZXJhdHVyZSwgbGFuZ3VhZ2UsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFRyYW5zbGF0ZXMgYXVkaW8gaW50byBpbnRvIEVuZ2xpc2guXG4gICAgICogQHBhcmFtIHtGaWxlfSBmaWxlIFRoZSBhdWRpbyBmaWxlIHRvIHRyYW5zbGF0ZSwgaW4gb25lIG9mIHRoZXNlIGZvcm1hdHM6IG1wMywgbXA0LCBtcGVnLCBtcGdhLCBtNGEsIHdhdiwgb3Igd2VibS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbW9kZWwgSUQgb2YgdGhlIG1vZGVsIHRvIHVzZS4gT25seSAmI3g2MDt3aGlzcGVyLTEmI3g2MDsgaXMgY3VycmVudGx5IGF2YWlsYWJsZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW3Byb21wdF0gQW4gb3B0aW9uYWwgdGV4dCB0byBndWlkZSB0aGUgbW9kZWxcXFxcXFwmIzM5O3Mgc3R5bGUgb3IgY29udGludWUgYSBwcmV2aW91cyBhdWRpbyBzZWdtZW50LiBUaGUgW3Byb21wdF0oL2RvY3MvZ3VpZGVzL3NwZWVjaC10by10ZXh0L3Byb21wdGluZykgc2hvdWxkIGJlIGluIEVuZ2xpc2guXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtyZXNwb25zZUZvcm1hdF0gVGhlIGZvcm1hdCBvZiB0aGUgdHJhbnNjcmlwdCBvdXRwdXQsIGluIG9uZSBvZiB0aGVzZSBvcHRpb25zOiBqc29uLCB0ZXh0LCBzcnQsIHZlcmJvc2VfanNvbiwgb3IgdnR0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGVtcGVyYXR1cmVdIFRoZSBzYW1wbGluZyB0ZW1wZXJhdHVyZSwgYmV0d2VlbiAwIGFuZCAxLiBIaWdoZXIgdmFsdWVzIGxpa2UgMC44IHdpbGwgbWFrZSB0aGUgb3V0cHV0IG1vcmUgcmFuZG9tLCB3aGlsZSBsb3dlciB2YWx1ZXMgbGlrZSAwLjIgd2lsbCBtYWtlIGl0IG1vcmUgZm9jdXNlZCBhbmQgZGV0ZXJtaW5pc3RpYy4gSWYgc2V0IHRvIDAsIHRoZSBtb2RlbCB3aWxsIHVzZSBbbG9nIHByb2JhYmlsaXR5XShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Mb2dfcHJvYmFiaWxpdHkpIHRvIGF1dG9tYXRpY2FsbHkgaW5jcmVhc2UgdGhlIHRlbXBlcmF0dXJlIHVudGlsIGNlcnRhaW4gdGhyZXNob2xkcyBhcmUgaGl0LlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgY3JlYXRlVHJhbnNsYXRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikuY3JlYXRlVHJhbnNsYXRpb24oZmlsZSwgbW9kZWwsIHByb21wdCwgcmVzcG9uc2VGb3JtYXQsIHRlbXBlcmF0dXJlLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBEZWxldGUgYSBmaWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBkZWxldGVGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmRlbGV0ZUZpbGUoZmlsZUlkLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBEZWxldGUgYSBmaW5lLXR1bmVkIG1vZGVsLiBZb3UgbXVzdCBoYXZlIHRoZSBPd25lciByb2xlIGluIHlvdXIgb3JnYW5pemF0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBtb2RlbCBUaGUgbW9kZWwgdG8gZGVsZXRlXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBkZWxldGVNb2RlbChtb2RlbCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmRlbGV0ZU1vZGVsKG1vZGVsLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSBjb250ZW50cyBvZiB0aGUgc3BlY2lmaWVkIGZpbGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlkIFRoZSBJRCBvZiB0aGUgZmlsZSB0byB1c2UgZm9yIHRoaXMgcmVxdWVzdFxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgZG93bmxvYWRGaWxlKGZpbGVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLmRvd25sb2FkRmlsZShmaWxlSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IExpc3RzIHRoZSBjdXJyZW50bHkgYXZhaWxhYmxlIChub24tZmluZXR1bmVkKSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBsaXN0RW5naW5lcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikubGlzdEVuZ2luZXMob3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgUmV0dXJucyBhIGxpc3Qgb2YgZmlsZXMgdGhhdCBiZWxvbmcgdG8gdGhlIHVzZXJcXCdzIG9yZ2FuaXphdGlvbi5cbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIGxpc3RGaWxlcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikubGlzdEZpbGVzKG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IEdldCBmaW5lLWdyYWluZWQgc3RhdHVzIHVwZGF0ZXMgZm9yIGEgZmluZS10dW5lIGpvYi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZVR1bmVJZCBUaGUgSUQgb2YgdGhlIGZpbmUtdHVuZSBqb2IgdG8gZ2V0IGV2ZW50cyBmb3IuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbc3RyZWFtXSBXaGV0aGVyIHRvIHN0cmVhbSBldmVudHMgZm9yIHRoZSBmaW5lLXR1bmUgam9iLiBJZiBzZXQgdG8gdHJ1ZSwgZXZlbnRzIHdpbGwgYmUgc2VudCBhcyBkYXRhLW9ubHkgW3NlcnZlci1zZW50IGV2ZW50c10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1NlcnZlci1zZW50X2V2ZW50cy9Vc2luZ19zZXJ2ZXItc2VudF9ldmVudHMjRXZlbnRfc3RyZWFtX2Zvcm1hdCkgYXMgdGhleSBiZWNvbWUgYXZhaWxhYmxlLiBUaGUgc3RyZWFtIHdpbGwgdGVybWluYXRlIHdpdGggYSAmI3g2MDtkYXRhOiBbRE9ORV0mI3g2MDsgbWVzc2FnZSB3aGVuIHRoZSBqb2IgaXMgZmluaXNoZWQgKHN1Y2NlZWRlZCwgY2FuY2VsbGVkLCBvciBmYWlsZWQpLiAgSWYgc2V0IHRvIGZhbHNlLCBvbmx5IGV2ZW50cyBnZW5lcmF0ZWQgc28gZmFyIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICBsaXN0RmluZVR1bmVFdmVudHMoZmluZVR1bmVJZCwgc3RyZWFtLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikubGlzdEZpbmVUdW5lRXZlbnRzKGZpbmVUdW5lSWQsIHN0cmVhbSwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgTGlzdCB5b3VyIG9yZ2FuaXphdGlvblxcJ3MgZmluZS10dW5pbmcgam9ic1xuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgbGlzdEZpbmVUdW5lcyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikubGlzdEZpbmVUdW5lcyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBMaXN0cyB0aGUgY3VycmVudGx5IGF2YWlsYWJsZSBtb2RlbHMsIGFuZCBwcm92aWRlcyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCBlYWNoIG9uZSBzdWNoIGFzIHRoZSBvd25lciBhbmQgYXZhaWxhYmlsaXR5LlxuICAgICAqIEBwYXJhbSB7Kn0gW29wdGlvbnNdIE92ZXJyaWRlIGh0dHAgcmVxdWVzdCBvcHRpb24uXG4gICAgICogQHRocm93cyB7UmVxdWlyZWRFcnJvcn1cbiAgICAgKiBAbWVtYmVyb2YgT3BlbkFJQXBpXG4gICAgICovXG4gICAgbGlzdE1vZGVscyhvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikubGlzdE1vZGVscyhvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBAc3VtbWFyeSBSZXRyaWV2ZXMgYSBtb2RlbCBpbnN0YW5jZSwgcHJvdmlkaW5nIGJhc2ljIGluZm9ybWF0aW9uIGFib3V0IGl0IHN1Y2ggYXMgdGhlIG93bmVyIGFuZCBhdmFpbGFiaWxpdHkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGVuZ2luZUlkIFRoZSBJRCBvZiB0aGUgZW5naW5lIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIHJldHJpZXZlRW5naW5lKGVuZ2luZUlkLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikucmV0cmlldmVFbmdpbmUoZW5naW5lSWQsIG9wdGlvbnMpLnRoZW4oKHJlcXVlc3QpID0+IHJlcXVlc3QodGhpcy5heGlvcywgdGhpcy5iYXNlUGF0aCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBzdW1tYXJ5IFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBmaWxlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSWQgVGhlIElEIG9mIHRoZSBmaWxlIHRvIHVzZSBmb3IgdGhpcyByZXF1ZXN0XG4gICAgICogQHBhcmFtIHsqfSBbb3B0aW9uc10gT3ZlcnJpZGUgaHR0cCByZXF1ZXN0IG9wdGlvbi5cbiAgICAgKiBAdGhyb3dzIHtSZXF1aXJlZEVycm9yfVxuICAgICAqIEBtZW1iZXJvZiBPcGVuQUlBcGlcbiAgICAgKi9cbiAgICByZXRyaWV2ZUZpbGUoZmlsZUlkLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLk9wZW5BSUFwaUZwKHRoaXMuY29uZmlndXJhdGlvbikucmV0cmlldmVGaWxlKGZpbGVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgR2V0cyBpbmZvIGFib3V0IHRoZSBmaW5lLXR1bmUgam9iLiAgW0xlYXJuIG1vcmUgYWJvdXQgRmluZS10dW5pbmddKC9kb2NzL2d1aWRlcy9maW5lLXR1bmluZylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmluZVR1bmVJZCBUaGUgSUQgb2YgdGhlIGZpbmUtdHVuZSBqb2JcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIHJldHJpZXZlRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5PcGVuQUlBcGlGcCh0aGlzLmNvbmZpZ3VyYXRpb24pLnJldHJpZXZlRmluZVR1bmUoZmluZVR1bmVJZCwgb3B0aW9ucykudGhlbigocmVxdWVzdCkgPT4gcmVxdWVzdCh0aGlzLmF4aW9zLCB0aGlzLmJhc2VQYXRoKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHN1bW1hcnkgUmV0cmlldmVzIGEgbW9kZWwgaW5zdGFuY2UsIHByb3ZpZGluZyBiYXNpYyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbW9kZWwgc3VjaCBhcyB0aGUgb3duZXIgYW5kIHBlcm1pc3Npb25pbmcuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1vZGVsIFRoZSBJRCBvZiB0aGUgbW9kZWwgdG8gdXNlIGZvciB0aGlzIHJlcXVlc3RcbiAgICAgKiBAcGFyYW0geyp9IFtvcHRpb25zXSBPdmVycmlkZSBodHRwIHJlcXVlc3Qgb3B0aW9uLlxuICAgICAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gICAgICogQG1lbWJlcm9mIE9wZW5BSUFwaVxuICAgICAqL1xuICAgIHJldHJpZXZlTW9kZWwobW9kZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGV4cG9ydHMuT3BlbkFJQXBpRnAodGhpcy5jb25maWd1cmF0aW9uKS5yZXRyaWV2ZU1vZGVsKG1vZGVsLCBvcHRpb25zKS50aGVuKChyZXF1ZXN0KSA9PiByZXF1ZXN0KHRoaXMuYXhpb3MsIHRoaXMuYmFzZVBhdGgpKTtcbiAgICB9XG59XG5leHBvcnRzLk9wZW5BSUFwaSA9IE9wZW5BSUFwaTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLyogdHNsaW50OmRpc2FibGUgKi9cbi8qIGVzbGludC1kaXNhYmxlICovXG4vKipcbiAqIE9wZW5BSSBBUElcbiAqIEFQSXMgZm9yIHNhbXBsaW5nIGZyb20gYW5kIGZpbmUtdHVuaW5nIGxhbmd1YWdlIG1vZGVsc1xuICpcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBPcGVuQVBJIGRvY3VtZW50OiAxLjIuMFxuICpcbiAqXG4gKiBOT1RFOiBUaGlzIGNsYXNzIGlzIGF1dG8gZ2VuZXJhdGVkIGJ5IE9wZW5BUEkgR2VuZXJhdG9yIChodHRwczovL29wZW5hcGktZ2VuZXJhdG9yLnRlY2gpLlxuICogaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoXG4gKiBEbyBub3QgZWRpdCB0aGUgY2xhc3MgbWFudWFsbHkuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuUmVxdWlyZWRFcnJvciA9IGV4cG9ydHMuQmFzZUFQSSA9IGV4cG9ydHMuQ09MTEVDVElPTl9GT1JNQVRTID0gZXhwb3J0cy5CQVNFX1BBVEggPSB2b2lkIDA7XG5jb25zdCBheGlvc18xID0gcmVxdWlyZShcImF4aW9zXCIpO1xuZXhwb3J0cy5CQVNFX1BBVEggPSBcImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjFcIi5yZXBsYWNlKC9cXC8rJC8sIFwiXCIpO1xuLyoqXG4gKlxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLkNPTExFQ1RJT05fRk9STUFUUyA9IHtcbiAgICBjc3Y6IFwiLFwiLFxuICAgIHNzdjogXCIgXCIsXG4gICAgdHN2OiBcIlxcdFwiLFxuICAgIHBpcGVzOiBcInxcIixcbn07XG4vKipcbiAqXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgQmFzZUFQSVxuICovXG5jbGFzcyBCYXNlQVBJIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWd1cmF0aW9uLCBiYXNlUGF0aCA9IGV4cG9ydHMuQkFTRV9QQVRILCBheGlvcyA9IGF4aW9zXzEuZGVmYXVsdCkge1xuICAgICAgICB0aGlzLmJhc2VQYXRoID0gYmFzZVBhdGg7XG4gICAgICAgIHRoaXMuYXhpb3MgPSBheGlvcztcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvbiA9IGNvbmZpZ3VyYXRpb247XG4gICAgICAgICAgICB0aGlzLmJhc2VQYXRoID0gY29uZmlndXJhdGlvbi5iYXNlUGF0aCB8fCB0aGlzLmJhc2VQYXRoO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5CYXNlQVBJID0gQmFzZUFQSTtcbjtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqIEBjbGFzcyBSZXF1aXJlZEVycm9yXG4gKiBAZXh0ZW5kcyB7RXJyb3J9XG4gKi9cbmNsYXNzIFJlcXVpcmVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IoZmllbGQsIG1zZykge1xuICAgICAgICBzdXBlcihtc2cpO1xuICAgICAgICB0aGlzLmZpZWxkID0gZmllbGQ7XG4gICAgICAgIHRoaXMubmFtZSA9IFwiUmVxdWlyZWRFcnJvclwiO1xuICAgIH1cbn1cbmV4cG9ydHMuUmVxdWlyZWRFcnJvciA9IFJlcXVpcmVkRXJyb3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIHRzbGludDpkaXNhYmxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBPcGVuQUkgQVBJXG4gKiBBUElzIGZvciBzYW1wbGluZyBmcm9tIGFuZCBmaW5lLXR1bmluZyBsYW5ndWFnZSBtb2RlbHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgT3BlbkFQSSBkb2N1bWVudDogMS4yLjBcbiAqXG4gKlxuICogTk9URTogVGhpcyBjbGFzcyBpcyBhdXRvIGdlbmVyYXRlZCBieSBPcGVuQVBJIEdlbmVyYXRvciAoaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoKS5cbiAqIGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaFxuICogRG8gbm90IGVkaXQgdGhlIGNsYXNzIG1hbnVhbGx5LlxuICovXG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuY3JlYXRlUmVxdWVzdEZ1bmN0aW9uID0gZXhwb3J0cy50b1BhdGhTdHJpbmcgPSBleHBvcnRzLnNlcmlhbGl6ZURhdGFJZk5lZWRlZCA9IGV4cG9ydHMuc2V0U2VhcmNoUGFyYW1zID0gZXhwb3J0cy5zZXRPQXV0aFRvT2JqZWN0ID0gZXhwb3J0cy5zZXRCZWFyZXJBdXRoVG9PYmplY3QgPSBleHBvcnRzLnNldEJhc2ljQXV0aFRvT2JqZWN0ID0gZXhwb3J0cy5zZXRBcGlLZXlUb09iamVjdCA9IGV4cG9ydHMuYXNzZXJ0UGFyYW1FeGlzdHMgPSBleHBvcnRzLkRVTU1ZX0JBU0VfVVJMID0gdm9pZCAwO1xuY29uc3QgYmFzZV8xID0gcmVxdWlyZShcIi4vYmFzZVwiKTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5EVU1NWV9CQVNFX1VSTCA9ICdodHRwczovL2V4YW1wbGUuY29tJztcbi8qKlxuICpcbiAqIEB0aHJvd3Mge1JlcXVpcmVkRXJyb3J9XG4gKiBAZXhwb3J0XG4gKi9cbmV4cG9ydHMuYXNzZXJ0UGFyYW1FeGlzdHMgPSBmdW5jdGlvbiAoZnVuY3Rpb25OYW1lLCBwYXJhbU5hbWUsIHBhcmFtVmFsdWUpIHtcbiAgICBpZiAocGFyYW1WYWx1ZSA9PT0gbnVsbCB8fCBwYXJhbVZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IGJhc2VfMS5SZXF1aXJlZEVycm9yKHBhcmFtTmFtZSwgYFJlcXVpcmVkIHBhcmFtZXRlciAke3BhcmFtTmFtZX0gd2FzIG51bGwgb3IgdW5kZWZpbmVkIHdoZW4gY2FsbGluZyAke2Z1bmN0aW9uTmFtZX0uYCk7XG4gICAgfVxufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXRBcGlLZXlUb09iamVjdCA9IGZ1bmN0aW9uIChvYmplY3QsIGtleVBhcmFtTmFtZSwgY29uZmlndXJhdGlvbikge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9uICYmIGNvbmZpZ3VyYXRpb24uYXBpS2V5KSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbFZhckFwaUtleVZhbHVlID0gdHlwZW9mIGNvbmZpZ3VyYXRpb24uYXBpS2V5ID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyB5aWVsZCBjb25maWd1cmF0aW9uLmFwaUtleShrZXlQYXJhbU5hbWUpXG4gICAgICAgICAgICAgICAgOiB5aWVsZCBjb25maWd1cmF0aW9uLmFwaUtleTtcbiAgICAgICAgICAgIG9iamVjdFtrZXlQYXJhbU5hbWVdID0gbG9jYWxWYXJBcGlLZXlWYWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXRCYXNpY0F1dGhUb09iamVjdCA9IGZ1bmN0aW9uIChvYmplY3QsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICBpZiAoY29uZmlndXJhdGlvbiAmJiAoY29uZmlndXJhdGlvbi51c2VybmFtZSB8fCBjb25maWd1cmF0aW9uLnBhc3N3b3JkKSkge1xuICAgICAgICBvYmplY3RbXCJhdXRoXCJdID0geyB1c2VybmFtZTogY29uZmlndXJhdGlvbi51c2VybmFtZSwgcGFzc3dvcmQ6IGNvbmZpZ3VyYXRpb24ucGFzc3dvcmQgfTtcbiAgICB9XG59O1xuLyoqXG4gKlxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLnNldEJlYXJlckF1dGhUb09iamVjdCA9IGZ1bmN0aW9uIChvYmplY3QsIGNvbmZpZ3VyYXRpb24pIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBpZiAoY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHR5cGVvZiBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgPyB5aWVsZCBjb25maWd1cmF0aW9uLmFjY2Vzc1Rva2VuKClcbiAgICAgICAgICAgICAgICA6IHlpZWxkIGNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW47XG4gICAgICAgICAgICBvYmplY3RbXCJBdXRob3JpemF0aW9uXCJdID0gXCJCZWFyZXIgXCIgKyBhY2Nlc3NUb2tlbjtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXRPQXV0aFRvT2JqZWN0ID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZSwgc2NvcGVzLCBjb25maWd1cmF0aW9uKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24gJiYgY29uZmlndXJhdGlvbi5hY2Nlc3NUb2tlbikge1xuICAgICAgICAgICAgY29uc3QgbG9jYWxWYXJBY2Nlc3NUb2tlblZhbHVlID0gdHlwZW9mIGNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW4gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICA/IHlpZWxkIGNvbmZpZ3VyYXRpb24uYWNjZXNzVG9rZW4obmFtZSwgc2NvcGVzKVxuICAgICAgICAgICAgICAgIDogeWllbGQgY29uZmlndXJhdGlvbi5hY2Nlc3NUb2tlbjtcbiAgICAgICAgICAgIG9iamVjdFtcIkF1dGhvcml6YXRpb25cIl0gPSBcIkJlYXJlciBcIiArIGxvY2FsVmFyQWNjZXNzVG9rZW5WYWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmZ1bmN0aW9uIHNldEZsYXR0ZW5lZFF1ZXJ5UGFyYW1zKHVybFNlYXJjaFBhcmFtcywgcGFyYW1ldGVyLCBrZXkgPSBcIlwiKSB7XG4gICAgaWYgKHBhcmFtZXRlciA9PSBudWxsKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXIgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1ldGVyKSkge1xuICAgICAgICAgICAgcGFyYW1ldGVyLmZvckVhY2goaXRlbSA9PiBzZXRGbGF0dGVuZWRRdWVyeVBhcmFtcyh1cmxTZWFyY2hQYXJhbXMsIGl0ZW0sIGtleSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMocGFyYW1ldGVyKS5mb3JFYWNoKGN1cnJlbnRLZXkgPT4gc2V0RmxhdHRlbmVkUXVlcnlQYXJhbXModXJsU2VhcmNoUGFyYW1zLCBwYXJhbWV0ZXJbY3VycmVudEtleV0sIGAke2tleX0ke2tleSAhPT0gJycgPyAnLicgOiAnJ30ke2N1cnJlbnRLZXl9YCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAodXJsU2VhcmNoUGFyYW1zLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB1cmxTZWFyY2hQYXJhbXMuYXBwZW5kKGtleSwgcGFyYW1ldGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHVybFNlYXJjaFBhcmFtcy5zZXQoa2V5LCBwYXJhbWV0ZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKlxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLnNldFNlYXJjaFBhcmFtcyA9IGZ1bmN0aW9uICh1cmwsIC4uLm9iamVjdHMpIHtcbiAgICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHVybC5zZWFyY2gpO1xuICAgIHNldEZsYXR0ZW5lZFF1ZXJ5UGFyYW1zKHNlYXJjaFBhcmFtcywgb2JqZWN0cyk7XG4gICAgdXJsLnNlYXJjaCA9IHNlYXJjaFBhcmFtcy50b1N0cmluZygpO1xufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5zZXJpYWxpemVEYXRhSWZOZWVkZWQgPSBmdW5jdGlvbiAodmFsdWUsIHJlcXVlc3RPcHRpb25zLCBjb25maWd1cmF0aW9uKSB7XG4gICAgY29uc3Qgbm9uU3RyaW5nID0gdHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJztcbiAgICBjb25zdCBuZWVkc1NlcmlhbGl6YXRpb24gPSBub25TdHJpbmcgJiYgY29uZmlndXJhdGlvbiAmJiBjb25maWd1cmF0aW9uLmlzSnNvbk1pbWVcbiAgICAgICAgPyBjb25maWd1cmF0aW9uLmlzSnNvbk1pbWUocmVxdWVzdE9wdGlvbnMuaGVhZGVyc1snQ29udGVudC1UeXBlJ10pXG4gICAgICAgIDogbm9uU3RyaW5nO1xuICAgIHJldHVybiBuZWVkc1NlcmlhbGl6YXRpb25cbiAgICAgICAgPyBKU09OLnN0cmluZ2lmeSh2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSlcbiAgICAgICAgOiAodmFsdWUgfHwgXCJcIik7XG59O1xuLyoqXG4gKlxuICogQGV4cG9ydFxuICovXG5leHBvcnRzLnRvUGF0aFN0cmluZyA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaCArIHVybC5oYXNoO1xufTtcbi8qKlxuICpcbiAqIEBleHBvcnRcbiAqL1xuZXhwb3J0cy5jcmVhdGVSZXF1ZXN0RnVuY3Rpb24gPSBmdW5jdGlvbiAoYXhpb3NBcmdzLCBnbG9iYWxBeGlvcywgQkFTRV9QQVRILCBjb25maWd1cmF0aW9uKSB7XG4gICAgcmV0dXJuIChheGlvcyA9IGdsb2JhbEF4aW9zLCBiYXNlUGF0aCA9IEJBU0VfUEFUSCkgPT4ge1xuICAgICAgICBjb25zdCBheGlvc1JlcXVlc3RBcmdzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBheGlvc0FyZ3Mub3B0aW9ucyksIHsgdXJsOiAoKGNvbmZpZ3VyYXRpb24gPT09IG51bGwgfHwgY29uZmlndXJhdGlvbiA9PT0gdm9pZCAwID8gdm9pZCAwIDogY29uZmlndXJhdGlvbi5iYXNlUGF0aCkgfHwgYmFzZVBhdGgpICsgYXhpb3NBcmdzLnVybCB9KTtcbiAgICAgICAgcmV0dXJuIGF4aW9zLnJlcXVlc3QoYXhpb3NSZXF1ZXN0QXJncyk7XG4gICAgfTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIHRzbGludDpkaXNhYmxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBPcGVuQUkgQVBJXG4gKiBBUElzIGZvciBzYW1wbGluZyBmcm9tIGFuZCBmaW5lLXR1bmluZyBsYW5ndWFnZSBtb2RlbHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgT3BlbkFQSSBkb2N1bWVudDogMS4yLjBcbiAqXG4gKlxuICogTk9URTogVGhpcyBjbGFzcyBpcyBhdXRvIGdlbmVyYXRlZCBieSBPcGVuQVBJIEdlbmVyYXRvciAoaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoKS5cbiAqIGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaFxuICogRG8gbm90IGVkaXQgdGhlIGNsYXNzIG1hbnVhbGx5LlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNvbmZpZ3VyYXRpb24gPSB2b2lkIDA7XG5jb25zdCBwYWNrYWdlSnNvbiA9IHJlcXVpcmUoXCIuLi9wYWNrYWdlLmpzb25cIik7XG5jbGFzcyBDb25maWd1cmF0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbSA9IHt9KSB7XG4gICAgICAgIHRoaXMuYXBpS2V5ID0gcGFyYW0uYXBpS2V5O1xuICAgICAgICB0aGlzLm9yZ2FuaXphdGlvbiA9IHBhcmFtLm9yZ2FuaXphdGlvbjtcbiAgICAgICAgdGhpcy51c2VybmFtZSA9IHBhcmFtLnVzZXJuYW1lO1xuICAgICAgICB0aGlzLnBhc3N3b3JkID0gcGFyYW0ucGFzc3dvcmQ7XG4gICAgICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBwYXJhbS5hY2Nlc3NUb2tlbjtcbiAgICAgICAgdGhpcy5iYXNlUGF0aCA9IHBhcmFtLmJhc2VQYXRoO1xuICAgICAgICB0aGlzLmJhc2VPcHRpb25zID0gcGFyYW0uYmFzZU9wdGlvbnM7XG4gICAgICAgIHRoaXMuZm9ybURhdGFDdG9yID0gcGFyYW0uZm9ybURhdGFDdG9yO1xuICAgICAgICBpZiAoIXRoaXMuYmFzZU9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZU9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJhc2VPcHRpb25zLmhlYWRlcnMgPSBPYmplY3QuYXNzaWduKHsgJ1VzZXItQWdlbnQnOiBgT3BlbkFJL05vZGVKUy8ke3BhY2thZ2VKc29uLnZlcnNpb259YCwgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7dGhpcy5hcGlLZXl9YCB9LCB0aGlzLmJhc2VPcHRpb25zLmhlYWRlcnMpO1xuICAgICAgICBpZiAodGhpcy5vcmdhbml6YXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZU9wdGlvbnMuaGVhZGVyc1snT3BlbkFJLU9yZ2FuaXphdGlvbiddID0gdGhpcy5vcmdhbml6YXRpb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmZvcm1EYXRhQ3Rvcikge1xuICAgICAgICAgICAgdGhpcy5mb3JtRGF0YUN0b3IgPSByZXF1aXJlKFwiZm9ybS1kYXRhXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBnaXZlbiBNSU1FIGlzIGEgSlNPTiBNSU1FLlxuICAgICAqIEpTT04gTUlNRSBleGFtcGxlczpcbiAgICAgKiAgIGFwcGxpY2F0aW9uL2pzb25cbiAgICAgKiAgIGFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGOFxuICAgICAqICAgQVBQTElDQVRJT04vSlNPTlxuICAgICAqICAgYXBwbGljYXRpb24vdm5kLmNvbXBhbnkranNvblxuICAgICAqIEBwYXJhbSBtaW1lIC0gTUlNRSAoTXVsdGlwdXJwb3NlIEludGVybmV0IE1haWwgRXh0ZW5zaW9ucylcbiAgICAgKiBAcmV0dXJuIFRydWUgaWYgdGhlIGdpdmVuIE1JTUUgaXMgSlNPTiwgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGlzSnNvbk1pbWUobWltZSkge1xuICAgICAgICBjb25zdCBqc29uTWltZSA9IG5ldyBSZWdFeHAoJ14oYXBwbGljYXRpb25cXC9qc29ufFteOy8gXFx0XStcXC9bXjsvIFxcdF0rWytdanNvbilbIFxcdF0qKDsuKik/JCcsICdpJyk7XG4gICAgICAgIHJldHVybiBtaW1lICE9PSBudWxsICYmIChqc29uTWltZS50ZXN0KG1pbWUpIHx8IG1pbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24tcGF0Y2granNvbicpO1xuICAgIH1cbn1cbmV4cG9ydHMuQ29uZmlndXJhdGlvbiA9IENvbmZpZ3VyYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8qIHRzbGludDpkaXNhYmxlICovXG4vKiBlc2xpbnQtZGlzYWJsZSAqL1xuLyoqXG4gKiBPcGVuQUkgQVBJXG4gKiBBUElzIGZvciBzYW1wbGluZyBmcm9tIGFuZCBmaW5lLXR1bmluZyBsYW5ndWFnZSBtb2RlbHNcbiAqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgT3BlbkFQSSBkb2N1bWVudDogMS4yLjBcbiAqXG4gKlxuICogTk9URTogVGhpcyBjbGFzcyBpcyBhdXRvIGdlbmVyYXRlZCBieSBPcGVuQVBJIEdlbmVyYXRvciAoaHR0cHM6Ly9vcGVuYXBpLWdlbmVyYXRvci50ZWNoKS5cbiAqIGh0dHBzOi8vb3BlbmFwaS1nZW5lcmF0b3IudGVjaFxuICogRG8gbm90IGVkaXQgdGhlIGNsYXNzIG1hbnVhbGx5LlxuICovXG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vYXBpXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9jb25maWd1cmF0aW9uXCIpLCBleHBvcnRzKTtcbiIsImV4cG9ydCBjb25zdCBrZXkgPSBcInVwd29ya19jb3Zlcl9sZXR0ZXJfZ2VuZXJhdG9yX2RhdGFcIjtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IENvbmZpZ3VyYXRpb24sIE9wZW5BSUFwaSB9IGZyb20gXCJvcGVuYWlcIjtcclxuaW1wb3J0IHsga2V5IH0gZnJvbSBcIi4vc3RvcmFnZV9rZXlcIjtcclxuXHJcbmxldCBjb25maWd1cmF0aW9uO1xyXG5sZXQgb3BlbmFpO1xyXG5cclxuY29uc29sZS5sb2coXCJjaGFuZ2VzIVwiKTtcclxuKGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGtleSA9IFxyXG4gICAgICAgIGF3YWl0IGZldGNoKGNocm9tZS5ydW50aW1lLmdldFVSTCgnLi4vLm9wZW5fYXBpX2tleV9maWxlJykpXHJcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxyXG4gICAgICAgIC50aGVuKHRleHQgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcclxuXHJcbiAgICBjb25maWd1cmF0aW9uID0gbmV3IENvbmZpZ3VyYXRpb24oe1xyXG4gICAgICAgIGFwaUtleToga2V5XHJcbiAgICB9KTtcclxuICAgIG9wZW5haSA9IG5ldyBPcGVuQUlBcGkoY29uZmlndXJhdGlvbik7XHJcbn0pKCk7XHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY2FsbEFwaShyZXEsIHJlcykge1xyXG4gICAgaWYgKCFjb25maWd1cmF0aW9uLmFwaUtleSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJPcGVuQUkgQVBJIGtleSBub3QgY29uZmlndXJlZCwgcGxlYXNlIGZvbGxvdyBpbnN0cnVjdGlvbnMgaW4gUkVBRE1FLm1kXCIpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqb2JEZXNjcmlwdGlvbiA9IFwiQVRURU5USU9OOiBQTEFDRUhPTERFUlwiO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjb21wbGV0aW9uID0gYXdhaXQgb3BlbmFpLmNyZWF0ZUNvbXBsZXRpb24oe1xyXG4gICAgICAgICAgICBtb2RlbDogXCJ0ZXh0LWRhdmluY2ktMDAzXCIsXHJcbiAgICAgICAgICAgIHByb21wdDogZ2VuZXJhdGVQcm9tcHQoam9iRGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICB0ZW1wZXJhdHVyZTogMC42LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgcmVzdWx0OiBjb21wbGV0aW9uLmRhdGEuY2hvaWNlc1swXS50ZXh0IH0pO1xyXG4gICAgfSBjYXRjaChlcnJvcikge1xyXG4gICAgICAgIC8vIENvbnNpZGVyIGFkanVzdGluZyB0aGUgZXJyb3IgaGFuZGxpbmcgbG9naWMgZm9yIHlvdXIgdXNlIGNhc2VcclxuICAgICAgICBpZiAoZXJyb3IucmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvci5yZXNwb25zZS5zdGF0dXMsIGVycm9yLnJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKGVycm9yLnJlc3BvbnNlLnN0YXR1cykuanNvbihlcnJvci5yZXNwb25zZS5kYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBFcnJvciB3aXRoIE9wZW5BSSBBUEkgcmVxdWVzdDogJHtlcnJvci5tZXNzYWdlfWApO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBbiBlcnJvciBvY2N1cnJlZCBkdXJpbmcgeW91ciByZXF1ZXN0LicsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gUGF0Y2ggdGhlIGpvYiBkZXNjcmlwdGlvbiBpbnRvIG15IHJlc3VtZS5cclxuZnVuY3Rpb24gZ2VuZXJhdGVQcm9tcHQoam9iRGVzY3JpcHRpb24pIHtcclxufVxyXG5cclxuLy8gU3RvcmUgdGV4dCB0byBwZXJzaXN0IHdoaWxlIHBsdWdpbiBpcyBsb2FkZWQgb3IgdW50aWwgcmVzZXQuIFxyXG5hc3luYyBmdW5jdGlvbiBzdG9yZSh0ZXh0KSB7XHJcblxyXG4gICAgY29uc3QgbyA9IGF3YWl0IGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChba2V5XSk7XHJcblxyXG4gICAgY29uc3Qgb2xkU3RvcmUgPSBvW2tleV07XHJcblxyXG4gICAgaWYgKG9sZFN0b3JlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBba2V5XTogW3RleHRdIH0pO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgbmV3U3RvcmUgPSBbLi4ub2xkU3RvcmUsIHRleHRdO1xyXG5cclxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBba2V5XTogbmV3U3RvcmUgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbnRleHRPbkNsaWNrKGluZm8pIHtcclxuICAgIHN3aXRjaCAoaW5mby5tZW51SXRlbUlkKSB7XHJcbiAgICAgICAgY2FzZSAnc2VsZWN0aW9uJzpcclxuICAgICAgICAgICAgc3RvcmUoaW5mby5zZWxlY3Rpb25UZXh0KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZWRpdGFibGUnOlxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAvLyBTdGFuZGFyZCBjb250ZXh0IG1lbnUgaXRlbSBmdW5jdGlvblxyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBhY3Rpb24gZm9yIHRoaXMgbWVudSBpdGVtLicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jaHJvbWUuY29udGV4dE1lbnVzLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihjb250ZXh0T25DbGljayk7XHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgbGV0IGNvbnRleHRzID0gW1xyXG4gICAgICAgICdzZWxlY3Rpb24nLFxyXG4gICAgICAgICdlZGl0YWJsZScsXHJcbiAgICBdO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGV4dHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgY29udGV4dCA9IGNvbnRleHRzW2ldO1xyXG4gICAgICAgIGxldCB0aXRsZSA9IFwiVGVzdCAnXCIgKyBjb250ZXh0ICsgXCInIG1lbnUgaXRlbVwiO1xyXG4gICAgICAgIGNocm9tZS5jb250ZXh0TWVudXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgICBjb250ZXh0czogW2NvbnRleHRdLFxyXG4gICAgICAgICAgICBpZDogY29udGV4dCxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==