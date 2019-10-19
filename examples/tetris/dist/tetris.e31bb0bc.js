// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../node_modules/audio-context/index.js":[function(require,module,exports) {
'use strict'

var cache = {}

module.exports = function getContext (options) {
	if (typeof window === 'undefined') return null
	
	var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext
	var Context = window.AudioContext || window.webkitAudioContext
	
	if (!Context) return null

	if (typeof options === 'number') {
		options = {sampleRate: options}
	}

	var sampleRate = options && options.sampleRate


	if (options && options.offline) {
		if (!OfflineContext) return null

		return new OfflineContext(options.channels || 2, options.length, sampleRate || 44100)
	}


	//cache by sampleRate, rather strong guess
	var ctx = cache[sampleRate]

	if (ctx) return ctx

	//several versions of firefox have issues with the
	//constructor argument
	//see: https://bugzilla.mozilla.org/show_bug.cgi?id=1361475
	try {
		ctx = new Context(options)
	}
	catch (err) {
		ctx = new Context()
	}
	cache[ctx.sampleRate] = cache[sampleRate] = ctx

	return ctx
}

},{}],"../../node_modules/audio-loader/lib/base64.js":[function(require,module,exports) {
'use strict'

// DECODE UTILITIES
function b64ToUint6 (nChr) {
  return nChr > 64 && nChr < 91 ? nChr - 65
    : nChr > 96 && nChr < 123 ? nChr - 71
    : nChr > 47 && nChr < 58 ? nChr + 4
    : nChr === 43 ? 62
    : nChr === 47 ? 63
    : 0
}

// Decode Base64 to Uint8Array
// ---------------------------
function decode (sBase64, nBlocksSize) {
  var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '')
  var nInLen = sB64Enc.length
  var nOutLen = nBlocksSize
    ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize
    : nInLen * 3 + 1 >> 2
  var taBytes = new Uint8Array(nOutLen)

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
      }
      nUint24 = 0
    }
  }
  return taBytes
}

module.exports = { decode: decode }

},{}],"../../node_modules/is-buffer/index.js":[function(require,module,exports) {
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],"../../node_modules/audio-loader/lib/load.js":[function(require,module,exports) {
'use strict'

var base64 = require('./base64')
var isBuffer = require('is-buffer')

// Given a regex, return a function that test if against a string
function fromRegex (r) {
  return function (o) { return typeof o === 'string' && r.test(o) }
}
// Try to apply a prefix to a name
function prefix (pre, name) {
  return typeof pre === 'string' ? pre + name
    : typeof pre === 'function' ? pre(name)
    : name
}

/**
 * Load one or more audio files
 *
 *
 * Possible option keys:
 *
 * - __from__ {Function|String}: a function or string to convert from file names to urls.
 * If is a string it will be prefixed to the name:
 * `load('snare.mp3', { from: 'http://audio.net/samples/' })`
 * If it's a function it receives the file name and should return the url as string.
 * - __only__ {Array} - when loading objects, if provided, only the given keys
 * will be included in the decoded object:
 * `load('piano.json', { only: ['C2', 'D2'] })`
 *
 * @param {Object} source - the object to be loaded
 * @param {Object} options - (Optional) the load options for that object
 * @param {Object} defaultValue - (Optional) the default value to return as
 * in a promise if not valid loader found
 */
function load (source, options, defVal) {
  var loader =
    // Basic audio loading
      isArrayBuffer(source) || isBuffer(source) ? decodeBuffer
    : isAudioFileName(source) ? loadAudioFile
    : isPromise(source) ? loadPromise
    // Compound objects
    : isArray(source) ? loadArrayData
    : isObject(source) ? loadObjectData
    : isJsonFileName(source) ? loadJsonFile
    // Base64 encoded audio
    : isBase64Audio(source) ? loadBase64Audio
    : isJsFileName(source) ? loadMidiJSFile
    : null

  var opts = options || {}
  var promise = loader ? loader(source, opts)
    : defVal ? Promise.resolve(defVal)
    : Promise.reject('Source not valid (' + source + ')')

  return promise.then(function (data) {
    opts.ready(null, data)
    return data
  }, function (err) {
    opts.ready(err)
    throw err
  })
}

// BASIC AUDIO LOADING
// ===================

// Load (decode) an array buffer
function isArrayBuffer (o) { return o instanceof ArrayBuffer }
function decodeBuffer (array, options) {
  return options.decode(array)
}

// Load an audio filename
var isAudioFileName = fromRegex(/\.(mp3|wav|ogg)(\?.*)?$/i)
function loadAudioFile (name, options) {
  var url = prefix(options.from, name)
  return load(options.fetch(url, 'arraybuffer'), options)
}

// Load the result of a promise
function isPromise (o) { return o && typeof o.then === 'function' }
function loadPromise (promise, options) {
  return promise.then(function (value) {
    return load(value, options)
  })
}

// COMPOUND OBJECTS
// ================

// Try to load all the items of an array
var isArray = Array.isArray
function loadArrayData (array, options) {
  return Promise.all(array.map(function (data) {
    return load(data, options, data)
  }))
}

// Try to load all the values of a key/value object
function isObject (o) { return o && typeof o === 'object' }
function loadObjectData (obj, options) {
  var dest = {}
  var promises = Object.keys(obj).map(function (key) {
    if (options.only && options.only.indexOf(key) === -1) return null
    var value = obj[key]
    return load(value, options, value).then(function (audio) {
      dest[key] = audio
    })
  })
  return Promise.all(promises).then(function () { return dest })
}

// Load the content of a JSON file
var isJsonFileName = fromRegex(/\.json(\?.*)?$/i)
function loadJsonFile (name, options) {
  var url = prefix(options.from, name)
  return load(options.fetch(url, 'text').then(JSON.parse), options)
}

// BASE64 ENCODED FORMATS
// ======================

// Load strings with Base64 encoded audio
var isBase64Audio = fromRegex(/^data:audio/)
function loadBase64Audio (source, options) {
  var i = source.indexOf(',')
  return load(base64.decode(source.slice(i + 1)).buffer, options)
}

// Load .js files with MidiJS soundfont prerendered audio
var isJsFileName = fromRegex(/\.js(\?.*)?$/i)
function loadMidiJSFile (name, options) {
  var url = prefix(options.from, name)
  return load(options.fetch(url, 'text').then(midiJsToJson), options)
}

// convert a MIDI.js javascript soundfont file to json
function midiJsToJson (data) {
  var begin = data.indexOf('MIDI.Soundfont.')
  if (begin < 0) throw Error('Invalid MIDI.js Soundfont format')
  begin = data.indexOf('=', begin) + 2
  var end = data.lastIndexOf(',')
  return JSON.parse(data.slice(begin, end) + '}')
}

if (typeof module === 'object' && module.exports) module.exports = load
if (typeof window !== 'undefined') window.loadAudio = load

},{"./base64":"../../node_modules/audio-loader/lib/base64.js","is-buffer":"../../node_modules/is-buffer/index.js"}],"../../node_modules/audio-loader/lib/browser.js":[function(require,module,exports) {
/* global XMLHttpRequest */
'use strict'
var load = require('./load')
var context = require('audio-context')

module.exports = function (source, options, cb) {
  if (options instanceof Function) {
    cb = options
    options = {}
  }
  options = options || {}
  options.ready = cb || function () {}
  var ac = options && options.context ? options.context : context()
  var defaults = { decode: getAudioDecoder(ac), fetch: fetch }
  var opts = Object.assign(defaults, options)
  return load(source, opts)
}

/**
 * Wraps AudioContext's decodeAudio into a Promise
 */
function getAudioDecoder (ac) {
  return function decode (buffer) {
    return new Promise(function (resolve, reject) {
      ac.decodeAudioData(buffer,
        function (data) { resolve(data) },
        function (err) { reject(err) })
    })
  }
}

/*
 * Wraps a XMLHttpRequest into a Promise
 *
 * @param {String} url
 * @param {String} type - can be 'text' or 'arraybuffer'
 * @return {Promise}
 */
function fetch (url, type) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest()
    if (type) req.responseType = type

    req.open('GET', url)
    req.onload = function () {
      req.status === 200 ? resolve(req.response) : reject(Error(req.statusText))
    }
    req.onerror = function () { reject(Error('Network Error')) }
    req.send()
  })
}

},{"./load":"../../node_modules/audio-loader/lib/load.js","audio-context":"../../node_modules/audio-context/index.js"}],"../../node_modules/webfontloader/webfontloader.js":[function(require,module,exports) {
var define;
/* Web Font Loader v1.6.28 - (c) Adobe Systems, Google. License: Apache 2.0 */(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.o=b||a;this.c=this.o.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function ea(a){return a.o.location.hostname||a.a.location.hostname}function z(a,b,c){function d(){m&&e&&f&&(m(g),m=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,m=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function A(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function B(){this.a=0;this.c=null}function C(a){a.a++;return function(){a.a--;D(a)}}function E(a,b){a.c=b;D(a)}function D(a){0==a.a&&a.c&&(a.c(),a.c=null)};function F(a){this.a=a||"-"}F.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function G(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return H(a)+" "+(a.f+"00")+" 300px "+I(a.c)}function I(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function J(a){return a.a+a.f}function H(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.o.document.documentElement;this.h=b;this.a=new F("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);K(a,"loading")}function L(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}K(a,"inactive")}function K(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,J(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function M(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function N(a){u(a.c,"body",a.a)}function O(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+I(a.c)+";"+("font-style:"+H(a)+";font-weight:"+(a.f+"00")+";")};function P(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}P.prototype.start=function(){var a=this.c.o.document,b=this,c=q(),d=new Promise(function(d,e){function f(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(f,25)},function(){e()})}f()}),e=null,f=new Promise(function(a,d){e=setTimeout(d,b.f)});Promise.race([f,d]).then(function(){e&&(clearTimeout(e),e=null);b.g(b.a)},function(){b.j(b.a)})};function Q(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.m=this.j=this.h=this.g=null;this.g=new M(this.c,this.s);this.h=new M(this.c,this.s);this.j=new M(this.c,this.s);this.m=new M(this.c,this.s);a=new G(this.a.c+",serif",J(this.a));a=O(a);this.g.a.style.cssText=a;a=new G(this.a.c+",sans-serif",J(this.a));a=O(a);this.h.a.style.cssText=a;a=new G("serif",J(this.a));a=O(a);this.j.a.style.cssText=a;a=new G("sans-serif",J(this.a));a=
O(a);this.m.a.style.cssText=a;N(this.g);N(this.h);N(this.j);N(this.m)}var R={D:"serif",C:"sans-serif"},S=null;function T(){if(null===S){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);S=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return S}Q.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.m.a.offsetWidth;this.A=q();U(this)};
function la(a,b,c){for(var d in R)if(R.hasOwnProperty(d)&&b===a.f[R[d]]&&c===a.f[R[d]])return!0;return!1}function U(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=T()&&la(a,b,c));d?q()-a.A>=a.w?T()&&la(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):ma(a):V(a,a.v)}function ma(a){setTimeout(p(function(){U(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.m.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.m=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,J(a).toString(),"active")],[b.a.c("wf",a.c,J(a).toString(),"loading"),b.a.c("wf",a.c,J(a).toString(),"inactive")]);K(b,"fontactive",a);this.m=!0;na(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,J(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,J(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,J(a).toString(),"inactive"));w(b.f,d,e)}K(b,"fontinactive",a);na(this)};function na(a){0==--a.f&&a.j&&(a.m?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),K(a,"active")):L(a.a))};function oa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}oa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;pa(this,new ha(this.c,a),a)};
function qa(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,m=d||null||{};if(0===c.length&&f)L(b.a);else{b.f+=c.length;f&&(b.j=f);var h,l=[];for(h=0;h<c.length;h++){var k=c[h],n=m[k.c],r=b.a,x=k;r.g&&w(r.f,[r.a.c("wf",x.c,J(x).toString(),"loading")]);K(r,"fontloading",x);r=null;if(null===X)if(window.FontFace){var x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent),xa=/OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent)&&/Apple/.exec(window.navigator.vendor);
X=x?42<parseInt(x[1],10):xa?!1:!0}else X=!1;X?r=new P(p(b.g,b),p(b.h,b),b.c,k,b.s,n):r=new Q(p(b.g,b),p(b.h,b),b.c,k,b.s,a,n);l.push(r)}for(h=0;h<l.length;h++)l[h].start()}},0)}function pa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){qa(a,f,b,d,c)})};function ra(a,b){this.c=a;this.a=b}
ra.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var l=0;l<c.length;l++){var k=c[l].fontfamily;void 0!=c[l].fontStyle&&void 0!=c[l].fontWeight?(h=c[l].fontStyle+c[l].fontWeight,e.push(new G(k,h))):e.push(new G(k))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.o;A(this.c,(c.a.api||"https://fast.fonts.net/jsapi")+"/"+d+".js"+(e?"?v="+e:""),function(e){e?a([]):(f["__MonotypeConfiguration__"+
d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+d}else a([])};function sa(a,b){this.c=a;this.a=b}sa.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new B;b=0;for(c=d.length;b<c;b++)z(this.c,d[b],C(g));var m=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),l=0;l<h.length;l+=1)m.push(new G(d[0],h[l]));else m.push(new G(d[0]));E(g,function(){a(m,f)})};function ta(a,b){a?this.c=a:this.c=ua;this.a=[];this.f=[];this.g=b||""}var ua="https://fonts.googleapis.com/css";function va(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function wa(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function ya(a){this.f=a;this.a=[];this.c={}}
var za={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Aa={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ba={i:"i",italic:"i",n:"n",normal:"n"},
Ca=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Da(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var m=d[1];g=[];if(m)for(var m=m.split(","),h=m.length,l=0;l<h;l++){var k;k=m[l];if(k.match(/^[\w-]+$/)){var n=Ca.exec(k.toLowerCase());if(null==n)k="";else{k=n[2];k=null==k||""==k?"n":Ba[k];n=n[1];if(null==n||""==n)n="4";else var r=Aa[n],n=r?r:isNaN(n)?"4":n.substr(0,1);k=[k,n].join("")}}else k="";k&&g.push(k)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=za[d[0]])&&(a.c[e]=d))}a.c[e]||(d=za[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new G(e,f[d]))}};function Ea(a,b){this.c=a;this.a=b}var Fa={Arimo:!0,Cousine:!0,Tinos:!0};Ea.prototype.load=function(a){var b=new B,c=this.c,d=new ta(this.a.api,this.a.text),e=this.a.families;va(d,e);var f=new ya(e);Da(f);z(c,wa(d),C(b));E(b,function(){a(f.a,f.c,Fa)})};function Ga(a,b){this.c=a;this.a=b}Ga.prototype.load=function(a){var b=this.a.id,c=this.c.o;b?A(this.c,(this.a.api||"https://use.typekit.net")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],m=b[f+1],h=0;h<m.length;h++)e.push(new G(g,m[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(l){}a(e)}},2E3):a([])};function Ha(a,b){this.c=a;this.f=b;this.a=[]}Ha.prototype.load=function(a){var b=this.f.id,c=this.c.o,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,m=c.fonts.length;g<m;++g){var h=c.fonts[g];d.a.push(new G(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},A(this.c,(this.f.api||"https://f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new oa(window);Y.a.c.custom=function(a,b){return new sa(b,a)};Y.a.c.fontdeck=function(a,b){return new Ha(b,a)};Y.a.c.monotype=function(a,b){return new ra(b,a)};Y.a.c.typekit=function(a,b){return new Ga(b,a)};Y.a.c.google=function(a,b){return new Ea(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());

},{}],"../../node_modules/game-asset-loader/utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBase64Image = void 0;

// create image from data uri
const createBase64Image = dataUri => {
  return [dataUri].map(uri => {
    let image = new Image();
    image.src = uri;
    return image;
  }).reduce(img => img);
};

exports.createBase64Image = createBase64Image;
},{}],"../../node_modules/game-asset-loader/placeholders.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultImage = exports.blankImage = void 0;

/**
 *   This file contains data uris for use as fallbacks
 * 
 *   blankImage: used as an invisible image for optional images, avoids safari restrictions
 *   
 *   defaultImage: placeholder image for unloaded images
 */
// 1x1 px transparent png from http://png-pixel.com/
// blank image used for optional images
// fixes Safari restriction on drawing unloaded images to canvas
// https://github.com/konvajs/react-konva/issues/185
const blankImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`; // 32x32 placeholder image from
// lets developer know image was not loaded

exports.blankImage = blankImage;
const defaultImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdC
AK7OHOkAAAA8UExURQAAANHR0UJCQmtra5ubm////xISEre3txMTE5ycnLi4uOnp6SYmJt3d3VhY
WPT09I2Njaqqqn19fcXFxbjmkisAAAFqSURBVFjDpdfbcoQgDAbggE1dDuK6ff93LajbLgpJgMw4
cPUNJL8XwDxYMM9f39BdCTAjQgIeI0ICYETYgRHhAAaEE+gX3oBQMGpDNHFFXKYckAkGVfz8Eyew
q84BkWBWgIB62eLemQsgEYwC0KjXZ9wrewUEwglUTiAQTqDcA4lwAsUp0IIyXA4aOkkDrcIdKAvx
CmgcKr2g0+BVzKObKkBRSIALAdfJrxtYp/2CVaAkJCCmx8Xw/FiPLwBPALvwuAHTER5r0yABKOAu
ZAB/gruQAbEHARQNXIUc2KfAAIU+5BUw0AAlpGEoBwxACGGJP5NmAfYWLCARaEAgMAAvcAArsAAn
8AAjCABakACkIAIoQQYQghCoC1KgKoiBmiAHKkIDUBZagKLQBJSENqAgNAJ3oRW4Cc3AVWgHLkIH
kAs9QCZ0AZ9CH/AhdAL/Qi/wJ3QDb6EfOIUB4BBGgCSYISAJY8AuwOjz/xdsEharPg6y9AAAAABJ
RU5ErkJggg==`;
exports.defaultImage = defaultImage;
},{}],"../../node_modules/game-asset-loader/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadFont = exports.loadSound = exports.loadImage = exports.loadList = void 0;

var _audioContext = _interopRequireDefault(require("audio-context"));

var _audioLoader = _interopRequireDefault(require("audio-loader"));

var _webfontloader = _interopRequireDefault(require("webfontloader"));

var _utils = require("./utils.js");

var _placeholders = require("./placeholders.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 
 *   Asset loading functions
 * 
 */
const loadList = (list, progress) => {
  // calculate loading progress
  let i = 0;
  progress({
    percent: 0,
    loaded: null
  });

  for (let i = 0; i < list.length; i += 1) {
    list[i].then(asset => {
      i++;
      progress({
        percent: Math.floor(i * 100 / list.length),
        loaded: {
          type: asset.type,
          key: asset.key
        }
      });
    });
  }

  return Promise.all(list).then(assets => {
    return assets.reduce((collection, asset) => {
      // separate assets by type
      // add them to the collection
      const {
        type,
        key,
        value
      } = asset;
      const collectionIncludes = Object.keys(collection).includes(type);

      if (!collectionIncludes) {
        collection[type] = {};
      }

      collection[type][key] = value;
      return collection;
    }, {});
  });
};

exports.loadList = loadList;

const loadImage = (key, url, opts = {}) => {
  return new Promise((resolve, reject) => {
    let {
      optional,
      params
    } = opts; // reject with error for missing key or url

    if (!key) {
      reject(new Error('key required'));
    }

    let image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = [url, params].filter(i => i).join('?'); // loaded

    image.onload = () => {
      // pre-decode so decoding will not block main thread
      // especially for large background images
      if (image.decode) {
        image.decode().then(() => {
          resolve({
            type: 'image',
            key: key,
            value: image
          });
        }).catch(err => {
          // decode error
          console.warn(`Warning: could not pre-decode image '${key}' from '${url}'.`, err.path, `resolving with fallback`);
          resolve({
            type: 'image',
            key: key,
            value: optional && url === '' ? (0, _utils.createBase64Image)(_placeholders.blankImage) : (0, _utils.createBase64Image)(_placeholders.defaultImage)
          });
        });
      } else {
        resolve({
          type: 'image',
          key: key,
          value: image
        });
      }
    }; // load error


    image.onerror = err => {
      if (!optional) {
        console.warn(`Warning: could not load image '${key}' from '${url}'.`, err.path, `resolving with fallback`);
      }

      resolve({
        type: 'image',
        key: key,
        value: optional && url === '' ? (0, _utils.createBase64Image)(_placeholders.blankImage) : (0, _utils.createBase64Image)(_placeholders.defaultImage)
      });
    };
  });
};

exports.loadImage = loadImage;

const loadSound = (key, url) => {
  let result = {
    type: 'sound',
    key: key,
    value: null
  };
  return new Promise((resolve, reject) => {
    // reject with error for missing key or url
    if (!key) {
      reject(new Error('key required'));
    }

    (0, _audioLoader.default)(url).then(sound => {
      resolve({
        type: 'sound',
        key: key,
        value: sound
      });
    }).catch(err => {
      // log an warning and resolve a silent audio buffer
      // previously created with new AudioBuffer (unsupported on safari)
      // note: sampleRate must also be 22050 to work on safari
      // value: new AudioBuffer({ length: 1, numberOfChannels: 1, sampleRate: 8000 })
      console.warn(`Warning: could not load sound '${key}' from '${url}'.`, err, `resolving with fallback`);
      const audioCtx = (0, _audioContext.default)();
      resolve({
        type: 'sound',
        key: key,
        value: audioCtx.createBuffer(1, 1, 22050)
      });
    });
  });
};

exports.loadSound = loadSound;

const loadFont = (key, fontName, opts = {}) => {
  return new Promise((resolve, reject) => {
    let {
      fallback
    } = opts; // reject with error for missing key or url

    if (!key) {
      reject(new Error('key required'));
    }

    if (!fontName) {
      resolve({
        type: 'font',
        key: key,
        value: fallback || 'Arial'
      });
    }

    _webfontloader.default.load({
      google: {
        families: [fontName]
      },
      fontactive: familyName => {
        resolve({
          type: 'font',
          key: key,
          value: familyName
        });
      },
      fontinactive: () => {
        resolve({
          type: 'font',
          key: key,
          value: fallback || 'Arial'
        });
      }
    });
  });
};

exports.loadFont = loadFont;
},{"audio-context":"../../node_modules/audio-context/index.js","audio-loader":"../../node_modules/audio-loader/lib/browser.js","webfontloader":"../../node_modules/webfontloader/webfontloader.js","./utils.js":"../../node_modules/game-asset-loader/utils.js","./placeholders.js":"../../node_modules/game-asset-loader/placeholders.js"}],"utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throttled = exports.hashCode = exports.randomBetween = exports.hexToRgbA = exports.findIn = exports.isBounded = exports.bounded = exports.resize = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// get random number between min and max
var randomBetween = function randomBetween(min, max, type) {
  var rand = Math.random() * (max - min) + min;

  if (type && type === 'int') {
    return Math.round(rand);
  }

  return rand;
}; // apply a lower and upper bound to a number


exports.randomBetween = randomBetween;

var bounded = function bounded(n, min, max) {
  return [n].map(function (n) {
    return n < min ? min : n;
  }).map(function (n) {
    return n > max ? max : n;
  }).reduce(function (n) {
    return n;
  });
}; // check if n is within bounds


exports.bounded = bounded;

var isBounded = function isBounded(n, min, max) {
  return n > min && n < max;
}; // color converter


exports.isBounded = isBounded;

var hexToRgbA = function hexToRgbA(hex, opacity) {
  var h = hex.replace('#', '');
  h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'));

  for (var i = 0; i < h.length; i++) {
    h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16);
  }

  if (typeof opacity != 'undefined') h.push(opacity);
  return 'rgba(' + h.join(',') + ')';
}; // create throttled function
// checkout: https://outline.com/nBajAS


exports.hexToRgbA = hexToRgbA;

var throttled = function throttled(delay, fn) {
  var lastCall = 0;
  return function () {
    var now = new Date().getTime();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return fn.apply(void 0, arguments);
  };
}; // find an entity in the list
// useful for checking for collisions


exports.throttled = throttled;

var findInList = function findInList(entList, fn) {
  return entList.find(function (ent) {
    return fn(ent);
  }) ? true : false;
}; // find an entity in an object
// useful for checking for collisions


var findInObject = function findInObject(entObject, fn) {
  return Object.entries(entObject).find(function (ent) {
    return fn(ent);
  }) ? true : false;
}; // find an entity in an object or list
// wrapper for findInList and findInObject


var findIn = function findIn(entities, fn) {
  // check against list
  if (Array.isArray(entities)) {
    return findInList(entities, fn);
  } // check against object


  if (Object.keys(entities) > 1) {
    return findInObject(entities, fn);
  }

  return false;
}; // toy hash for prefixes
// useful for prefexing localstorage keys


exports.findIn = findIn;

var hashCode = function hashCode(str) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
  return [str.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0)] // create simple hash from string
  .map(function (num) {
    return Math.abs(num);
  }) // only positive numbers
  .map(function (num) {
    return num.toString(base);
  }) // convert to base
  .reduce(function (h) {
    return h;
  }); // fold
}; // resize image by width


exports.hashCode = hashCode;

var resizeByWidth = function resizeByWidth(width, naturalWidth, naturalHeight) {
  // cross multiply to get new height
  return {
    width: parseInt(width),
    height: parseInt(width * naturalHeight / naturalWidth)
  };
}; // resize image by height


var resizeByHeight = function resizeByHeight(height, naturalWidth, naturalHeight) {
  // cross multiply to get new width
  return {
    height: parseInt(height),
    width: parseInt(height * naturalWidth / naturalHeight)
  };
}; // resize wrapper


var resize = function resize(_ref) {
  var image = _ref.image,
      width = _ref.width,
      height = _ref.height;

  // image required
  if (!image) {
    console.error('resize requires an image');
    return;
  } // width or height required


  if (!width && !height) {
    console.error('resize requires a width or height');
    return;
  } // useless echo


  if (width && height) {
    return {
      width: width,
      height: height
    };
  } // set variables


  var naturalWidth = image.width;
  var naturalHeight = image.height;
  var result = {}; // if width: resize by width

  if (width) {
    result = _objectSpread({}, result, {}, resizeByWidth(width, naturalWidth, naturalHeight));
  } // if height: resize by height


  if (height) {
    result = _objectSpread({}, result, {}, resizeByHeight(height, naturalWidth, naturalHeight));
  }

  return result;
};

exports.resize = resize;
},{}],"baseUtils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throttled = exports.hashCode = exports.randomBetween = exports.hexToRgbA = exports.getDistance = exports.getCursorPosition = exports.getMinFromList = exports.getMaxFromList = exports.pickFromList = exports.isBounded = exports.bounded = void 0;

/**
 * game/utils/baseUtils.js
 * 
 * What it Does:
 *   This file contains utilities for the game
 * 
 *   randomBetween: get a numbers a min and a max, optionally ask for an int
 * 
 *   getDistance: get the distance between to points with an x and y
 * 
 *   bounded: apply a lower and upper bound to a number
 *   useful for add limits to AI character movements
 * 
 *   isBounded: check if number is within a min and max
 * 
 *   getCursorPosition: get cursor position on the canvas
 *   needed for when tob bar is active
 * 
 *   hexToRgbA: color converter for easier use of the alpha channel
 * 
 *   throttled: wraps a function so that it can't be called until the delay
 *   in milliseconds has gone by. useful for stopping unwanted side effects of button mashing.
 *   https://gph.is/1syA0yc
 * 
 * 
 * What to Change:
 *   Add any new methods that don't fit anywhere else
 *   eg. 
 * 
 */
// get random number between min and max
var randomBetween = function randomBetween(min, max, type) {
  var rand = Math.random() * (max - min) + min;

  if (type && type === 'int') {
    return Math.round(rand);
  }

  return rand;
}; // distance between two points


exports.randomBetween = randomBetween;

var getDistance = function getDistance(pointA, pointB) {
  var vx = pointA.x - pointB.x;
  var vy = pointA.y - pointB.y;
  return Math.sqrt(vx * vx + vy * vy);
}; // pick random element from a list


exports.getDistance = getDistance;

var pickFromList = function pickFromList(list) {
  if (!Array.isArray(list) || list.length < 1) {
    return;
  }

  var index = randomBetween(0, list.length - 1, 'int');
  return list[index];
}; // getMaxFromList


exports.pickFromList = pickFromList;

var getMaxFromList = function getMaxFromList(list) {
  return list.reduce(function (max, item) {
    return Math.max(max, item);
  }, 0);
}; // getMinFromList


exports.getMaxFromList = getMaxFromList;

var getMinFromList = function getMinFromList(list) {
  return list.reduce(function (min, item) {
    return Math.min(min, item);
  }, list[0] + 1);
}; // apply a lower and upper bound to a number


exports.getMinFromList = getMinFromList;

var bounded = function bounded(n, min, max) {
  return [n].map(function (n) {
    return n < min ? min : n;
  }).map(function (n) {
    return n > max ? max : n;
  }).reduce(function (n) {
    return n;
  });
}; // check if n is within bounds


exports.bounded = bounded;

var isBounded = function isBounded(n, min, max) {
  return n > min && n < max;
}; // get cursor event position (tap, click, etc)
// needed for canvas click while top bar active


exports.isBounded = isBounded;

var getCursorPosition = function getCursorPosition(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}; // color converter


exports.getCursorPosition = getCursorPosition;

var hexToRgbA = function hexToRgbA(hex, opacity) {
  var h = hex.replace('#', '');
  h = h.match(new RegExp('(.{' + h.length / 3 + '})', 'g'));

  for (var i = 0; i < h.length; i++) {
    h[i] = parseInt(h[i].length == 1 ? h[i] + h[i] : h[i], 16);
  }

  if (typeof opacity != 'undefined') h.push(opacity);
  return 'rgba(' + h.join(',') + ')';
}; // create throttled function
// checkout: https://outline.com/nBajAS


exports.hexToRgbA = hexToRgbA;

var throttled = function throttled(delay, fn) {
  var lastCall = 0;
  return function () {
    var now = new Date().getTime();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return fn.apply(void 0, arguments);
  };
}; // toy hash for prefixes
// useful for prefexing localstorage keys


exports.throttled = throttled;

var hashCode = function hashCode(str) {
  var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
  return [str.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0)] // create simple hash from string
  .map(function (num) {
    return Math.abs(num);
  }) // only positive numbers
  .map(function (num) {
    return num.toString(base);
  }) // convert to base
  .reduce(function (h) {
    return h;
  }); // fold
};

exports.hashCode = hashCode;
},{}],"grid.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCellSize = exports.neighborDown = exports.neighborRight = exports.neighborLeft = exports.setGridCell = exports.gridRow = exports.gridCol = exports.gridCell = void 0;

var gridCell = function gridCell(grid, x, y) {
  var cell = grid && grid[x] && grid[x][y];
  return cell || false;
};

exports.gridCell = gridCell;

var gridCol = function gridCol(grid, x) {
  return grid && grid[x];
};

exports.gridCol = gridCol;

var gridRow = function gridRow(grid, y) {
  return grid && grid.filter(function (x) {
    return x && x[y];
  }).map(function (x) {
    return x[y];
  });
};

exports.gridRow = gridRow;

var setGridCell = function setGridCell(grid, cell, value) {
  var x = cell.x,
      y = cell.y; // allocate space on grid

  if (typeof grid[x] === 'undefined') {
    grid[x] = [];
  }

  if (typeof grid[x][y] === 'undefined') {
    grid[x][y] = false;
  } // set value


  grid[x][y] = value;
  return grid;
};

exports.setGridCell = setGridCell;

var neighborLeft = function neighborLeft(grid, cell) {
  return gridCell(grid, cell.x - 1, cell.y);
};

exports.neighborLeft = neighborLeft;

var neighborRight = function neighborRight(grid, cell) {
  return gridCell(grid, cell.x + 1, cell.y);
};

exports.neighborRight = neighborRight;

var neighborDown = function neighborDown(grid, cell) {
  return gridCell(grid, cell.x, cell.y + 1);
};

exports.neighborDown = neighborDown;

var getCellSize = function getCellSize(width, height, rows, cols) {
  var sizeByWidth = Math.round(width / cols);
  var sizeByHeight = Math.round(height / rows);
  return Math.min(sizeByWidth, sizeByHeight);
};

exports.getCellSize = getCellSize;
},{}],"../../node_modules/is-audio-buffer/index.js":[function(require,module,exports) {
/**
 * @module  is-audio-buffer
 */
'use strict';

module.exports = function isAudioBuffer (buffer) {
	//the guess is duck-typing
	return buffer != null
	&& typeof buffer.length === 'number'
	&& typeof buffer.sampleRate === 'number' //swims like AudioBuffer
	&& typeof buffer.getChannelData === 'function' //quacks like AudioBuffer
	// && buffer.copyToChannel
	// && buffer.copyFromChannel
	&& typeof buffer.duration === 'number'
};

},{}],"../../node_modules/audio-play/browser.js":[function(require,module,exports) {
/** @module  audio-play Play buffer in browser via WAA */

'use strict'

var getContext = require('audio-context')
var isAudioBuffer = require('is-audio-buffer')

module.exports = function Play (buffer, how, cb) {
	if (!isAudioBuffer(buffer)) throw Error('Argument should be an audio buffer')

	if (how instanceof Function) {
		cb = how
	}

	how = how || {}
	cb = cb || function () {}

	if (how.context == null) how.context = getContext()

	if (how.currentTime == null) how.currentTime = 0
	if (how.start == null) how.start = 0
	if (how.end == null) how.end = buffer.duration
	how.start = normTime(how.start, buffer.duration)
	how.end = normTime(how.end, buffer.duration)

	var sourceNode = createNode(buffer, how)

	if (!how.gain) {
		how.gain = how.context.createGain()
		how.gain.gain.value = how.volume == null ? 1 : how.volume
		how.gain.connect(how.context.destination)
	}
	sourceNode.connect(how.gain)

	sourceNode.addEventListener('ended', cb)

	//provide API
	play.play = pause.play = play
	play.pause = pause.pause = pause

	var startTime = 0
	var isPlaying = false

	return how.autoplay != false ? play() : play

	function play () {
		if (isPlaying) return pause

		isPlaying = true

		startTime = how.context.currentTime

		if (how.loop) {
			sourceNode.start(startTime, how.start + how.currentTime)
		}
		else {
			sourceNode.start(startTime, how.start + how.currentTime, how.end - how.start)
		}

		return pause
	}

	function pause () {
		if (!isPlaying) return pause.play
		isPlaying = false

		sourceNode.stop()
		sourceNode.removeEventListener('ended', cb)

		var playedTime = (how.context.currentTime - startTime)

		how.autoplay = false
		how.currentTime = playedTime

		var playback = Play(buffer, how, cb)
		play.play = pause.play = playback.play
		play.pause = pause.pause = playback.pause
		play.currentTime = pause.currentTime = playback.currentTime = how.currentTime

		return playback
	}
}

function normTime (time, duration) {
	return time < 0 ? (duration + (time % duration)) : Math.min(duration, time)
}

function createNode (buffer, how) {
	var sourceNode = how.context.createBufferSource()

	sourceNode.buffer = buffer

	//init options
	if (how.detune != null) sourceNode.detune = how.detune
	if (how.rate != null) sourceNode.playbackRate.value = how.rate


	if (how.loop) {
		sourceNode.loop = true
		sourceNode.loopStart = how.start
		sourceNode.loopEnd = how.end
	}

	return sourceNode
}

},{"audio-context":"../../node_modules/audio-context/index.js","is-audio-buffer":"../../node_modules/is-audio-buffer/index.js"}],"spriteUtils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inBox = exports.pickLocationAwayFromList = exports.pickLocationAwayFrom = exports.pickLocation = exports.padBounds = void 0;

var _baseUtils = require("./baseUtils.js");

// check if hit is in box
var inBox = function inBox(x, y, box) {
  // check x and y against box
  var inX = (0, _baseUtils.isBounded)(x, box.left, box.right);
  var inY = (0, _baseUtils.isBounded)(y, box.top, box.bottom);
  return inX && inY;
}; // return larger bounds
// useful for hiding images offscreen


exports.inBox = inBox;

var padBounds = function padBounds(bounds, x, y) {
  return {
    top: bounds.top - y,
    right: bounds.right + x,
    bottom: bounds.bottom + y,
    left: bounds.bottom - x
  };
}; // get random point or screen


exports.padBounds = padBounds;

var pickLocation = function pickLocation(bounds) {
  return {
    x: (0, _baseUtils.randomBetween)(bounds.left, bounds.right),
    y: (0, _baseUtils.randomBetween)(bounds.top, bounds.bottom)
  };
}; // pick new location for moles so they aren't crowded
// pick random location in bounds and distance from point


exports.pickLocation = pickLocation;

var pickLocationAwayFrom = function pickLocationAwayFrom(bounds, point, distance) {
  var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var maxDepth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 10;

  // limit depth
  if (depth > maxDepth) {
    return;
  } // get random point or screen


  var location = pickLocation(bounds);
  var locationDistance = (0, _baseUtils.getDistance)(location, point); // return location when location is distance 
  // away from point, else try a new location

  return locationDistance >= distance ? location : pickLocationAwayFrom(bounds, point, distance, depth + 1);
};

exports.pickLocationAwayFrom = pickLocationAwayFrom;

var pickLocationAwayFromList = function pickLocationAwayFromList(bounds, list, distance) {
  var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var maxDepth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 10;

  // limit depth
  if (depth > maxDepth) {
    return;
  } // return any location if list is empty


  if (list.length < 1) {
    return pickLocation(bounds);
  } // get location checked against first element


  var location = pickLocationAwayFrom(bounds, list[0], distance); // check if point has close neighbors in list

  var hasCloseNeighbor = list.find(function (point) {
    // return if less than distance
    var dist = (0, _baseUtils.getDistance)(location, point);
    return dist < distance;
  }); // return location without close neighbors
  // else try new location

  return hasCloseNeighbor ? pickLocationAwayFromList(bounds, list, distance, depth + 1) : location;
};

exports.pickLocationAwayFromList = pickLocationAwayFromList;
},{"./baseUtils.js":"baseUtils.js"}],"sprite.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _baseUtils = require("./baseUtils.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sprite =
/*#__PURE__*/
function () {
  function Sprite(_ref) {
    var x = _ref.x,
        y = _ref.y,
        width = _ref.width,
        height = _ref.height,
        speed = _ref.speed,
        direction = _ref.direction,
        bounds = _ref.bounds;

    _classCallCheck(this, Sprite);

    // x and y
    this.x = x;
    this.y = y; // previous x and y

    this.px = x;
    this.py = y; // center x and y

    this.cx = x + width / 2;
    this.cy = y + height / 2; // velocity x and y

    this.vx = 0;
    this.vy = 0; // width and height

    this.width = width;
    this.height = height; // radius

    this.radius = (width + height) / 4; // speed of sprite

    this.speed = speed || 1; // direction

    this.direction = direction || 'right'; // bounds

    this.setBounds(bounds);
  }

  _createClass(Sprite, [{
    key: "move",
    value: function move(x, y, m) {
      var dx = x === 0 ? this.x : this.x + x * this.speed * m;
      var dy = y === 0 ? this.y : this.y + y * this.speed * m;
      this.setX(dx);
      this.setY(dy); // set direction

      if (x < 0) {
        this.direction = 'right';
      }

      if (x > 0) {
        this.direction = 'left';
      }
    }
  }, {
    key: "setX",
    value: function setX(nx) {
      // apply x bounds
      var x = (0, _baseUtils.bounded)(nx, this.bounds.left, this.bounds.right - this.width);
      this.px = this.x; // store previous x value

      this.x = x; // set x

      this.cx = this.x + this.width / 2; // set center x

      this.vx = this.x - this.px; // set velocity x
    }
  }, {
    key: "setY",
    value: function setY(ny) {
      // apply x bounds
      var y = (0, _baseUtils.bounded)(ny, this.bounds.top, this.bounds.bottom - this.height);
      this.py = this.y; // store previous y value

      this.y = y; // set y

      this.cy = this.y + this.height / 2; // set center y

      this.vy = this.y - this.py; // set velocity y
    }
  }, {
    key: "setBounds",
    value: function setBounds(bounds) {
      this.bounds = _objectSpread({}, this.bounds, {}, bounds);
    }
  }]);

  return Sprite;
}();

var _default = Sprite;
exports.default = _default;
},{"./baseUtils.js":"baseUtils.js"}],"imageSprite.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sprite = _interopRequireDefault(require("./sprite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ImageSprite =
/*#__PURE__*/
function (_Sprite) {
  _inherits(ImageSprite, _Sprite);

  function ImageSprite(options) {
    var _this;

    _classCallCheck(this, ImageSprite);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ImageSprite).call(this, options));
    _this.ctx = options.ctx;
    _this.image = options.image;
    return _this;
  }

  _createClass(ImageSprite, [{
    key: "draw",
    value: function draw() {
      // save canvas context
      this.ctx.save(); // code for flipping image to match direction

      var scaleX = this.direction === 'left' ? -1 : 1;
      var xPosition = this.direction === 'left' ? -1 * this.x : this.x;
      var trX = this.direction === 'left' ? this.width : 0;
      this.ctx.translate(trX, 0);
      this.ctx.scale(scaleX, 1); // draw the image to canvas

      this.ctx.drawImage(this.image, xPosition, this.y, this.width, this.height); // restore canvas context

      this.ctx.restore();
    }
  }]);

  return ImageSprite;
}(_sprite.default);

var _default = ImageSprite;
exports.default = _default;
},{"./sprite.js":"sprite.js"}],"block.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _imageSprite = _interopRequireDefault(require("./imageSprite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Block =
/*#__PURE__*/
function (_ImageSprite) {
  _inherits(Block, _ImageSprite);

  function Block(options) {
    var _this;

    _classCallCheck(this, Block);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Block).call(this, _objectSpread({}, options, {}, {
      width: options.size,
      height: options.size
    })));
    _this.color = options.color;
    _this.cell = options.cell;
    _this.size = options.size;
    _this.x = _this.cell.x * _this.size;
    _this.y = _this.cell.y * _this.size;
    return _this;
  }

  _createClass(Block, [{
    key: "draw",
    value: function draw() {
      // draw background color
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x, this.y, this.width, this.height); // draw image

      _get(_getPrototypeOf(Block.prototype), "draw", this).call(this);
    }
  }, {
    key: "shift",
    value: function shift(_ref) {
      var _ref$x = _ref.x,
          x = _ref$x === void 0 ? 0 : _ref$x,
          _ref$y = _ref.y,
          y = _ref$y === void 0 ? 0 : _ref$y;
      // update cell
      this.cell = {
        x: this.cell.x + x,
        y: this.cell.y + y
      }; // update x and y

      this.x = this.cell.x * this.size;
      this.y = this.cell.y * this.size;
    }
  }]);

  return Block;
}(_imageSprite.default);

var _default = Block;
exports.default = _default;
},{"./imageSprite.js":"imageSprite.js"}],"piece.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _baseUtils = require("./baseUtils.js");

var _spriteUtils = require("./spriteUtils.js");

var _block = _interopRequireDefault(require("./block.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Piece =
/*#__PURE__*/
function () {
  function Piece(_ref) {
    var ctx = _ref.ctx,
        board = _ref.board,
        image = _ref.image,
        color = _ref.color,
        shape = _ref.shape,
        cellSize = _ref.cellSize,
        cellBounds = _ref.cellBounds,
        bounds = _ref.bounds;

    _classCallCheck(this, Piece);

    this.ctx = ctx;
    this.board = board;
    this.image = image;
    this.color = color;
    this.cellBounds = cellBounds;
    this.bounds = bounds;
    this.cellSize = cellSize;
    this.preplaceTick = 0;
    this.placed = false;
    this.body = this.createBody(shape);
    this.box = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }; // shift to center

    var center = Math.round(board.columns / 2 - this.body.length / 2);
    this.shift({
      x: center,
      y: 0
    });
  }

  _createClass(Piece, [{
    key: "draw",
    value: function draw() {
      this.body.forEach(function (block) {
        return block.draw();
      });
    }
  }, {
    key: "getBox",
    value: function getBox(body) {
      return [body].map(function (body) {
        return {
          listY: body.map(function (block) {
            return block.cell.y;
          }),
          listX: body.map(function (block) {
            return block.cell.x;
          })
        };
      }).map(function (cell) {
        return {
          top: (0, _baseUtils.getMinFromList)(cell.listY),
          bottom: (0, _baseUtils.getMaxFromList)(cell.listY),
          right: (0, _baseUtils.getMaxFromList)(cell.listX),
          left: (0, _baseUtils.getMinFromList)(cell.listX)
        };
      }).reduce(function (box) {
        return box;
      });
    }
  }, {
    key: "shift",
    value: function shift(_ref2) {
      var _ref2$x = _ref2.x,
          x = _ref2$x === void 0 ? 0 : _ref2$x,
          _ref2$y = _ref2.y,
          y = _ref2$y === void 0 ? 0 : _ref2$y;
      // don't shift off the board
      var hitLeft = this.box.left + x < 0;
      var hitRight = this.box.right + x > this.board.width - 1;

      if (this.placed || hitLeft || hitRight) {
        return;
      } // update body


      this.body.forEach(function (block) {
        return block.shift({
          x: x,
          y: y
        });
      }); // update box

      this.box = this.getBox(this.body);
    }
  }, {
    key: "rotate",
    value: function rotate() {
      var _this = this;

      // pick a rotation point
      var origin = this.body[0]; // rotate block around origin

      this.body.forEach(function (block) {
        block.cell = _this.rotateCellAround(block.cell, origin.cell);
      }); // shift in place to update x and y

      this.shift({
        x: 0,
        y: 0
      });
    }
  }, {
    key: "rotatedCells",
    value: function rotatedCells() {
      var _this2 = this;

      var origin = this.body[0];
      return this.body.map(function (block) {
        return block.cell;
      }).map(function (cell) {
        return _this2.rotateCellAround(cell, origin.cell);
      });
    }
  }, {
    key: "rotateCellAround",
    value: function rotateCellAround(cell, origin) {
      return [cell].map(function (cell) {
        // translate origin to 0,0
        return {
          x: cell.x - origin.x,
          y: cell.y - origin.y
        };
      }).map(function (cell, idx, arr) {
        // rotate around origin
        var prev = arr[idx - 1] || arr[arr.length - 1];
        return {
          x: -prev.y,
          y: prev.x
        };
      }).map(function (cell) {
        // translate back to starting x,y
        return {
          x: cell.x + origin.x,
          y: cell.y + origin.y
        };
      }).reduce(function (cell) {
        return cell;
      });
    }
  }, {
    key: "selectShape",
    value: function selectShape(idx) {
      // Tetriminos
      // Straight Bar
      var bar = [{
        x: 1,
        y: 0
      }, {
        x: 0,
        y: 0
      }, {
        x: 2,
        y: 0
      }, {
        x: 3,
        y: 0
      }]; // Left L

      var leftL = [{
        x: 1,
        y: 1
      }, {
        x: 0,
        y: 1
      }, {
        x: 0,
        y: 0
      }, {
        x: 2,
        y: 1
      }]; // Right L

      var rightL = [{
        x: 2,
        y: 1
      }, {
        x: 1,
        y: 1
      }, {
        x: 3,
        y: 1
      }, {
        x: 3,
        y: 0
      }]; // Box

      var box = [{
        x: 0,
        y: 0
      }, {
        x: 0,
        y: 1
      }, {
        x: 1,
        y: 0
      }, {
        x: 1,
        y: 1
      }]; // Left S

      var leftS = [{
        x: 1,
        y: 1
      }, {
        x: 1,
        y: 0
      }, {
        x: 0,
        y: 1
      }, {
        x: 2,
        y: 0
      }]; // Right S

      var rightS = [{
        x: 1,
        y: 1
      }, {
        x: 1,
        y: 0
      }, {
        x: 0,
        y: 0
      }, {
        x: 2,
        y: 1
      }]; // Tee

      var tee = [{
        x: 1,
        y: 1
      }, {
        x: 1,
        y: 0
      }, {
        x: 0,
        y: 1
      }, {
        x: 2,
        y: 1
      }];
      return [bar, leftL, rightL, box, leftS, rightS, tee][idx];
    }
  }, {
    key: "createBody",
    value: function createBody(idx) {
      var _this3 = this;

      return this.selectShape(idx).map(function (cell) {
        return new _block.default({
          ctx: _this3.ctx,
          color: _this3.color,
          image: _this3.image,
          cell: cell,
          size: _this3.cellSize,
          bounds: (0, _spriteUtils.padBounds)(_this3.bounds, 0, _this3.cellSize * 2)
        });
      });
    }
  }]);

  return Piece;
}();

var _default = Piece;
exports.default = _default;
},{"./baseUtils.js":"baseUtils.js","./spriteUtils.js":"spriteUtils.js","./block.js":"block.js"}],"main.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gameAssetLoader = require("game-asset-loader");

var _utils = require("./utils.js");

var _baseUtils = require("./baseUtils.js");

var _grid = require("./grid.js");

var _audioContext = _interopRequireDefault(require("audio-context"));

var _audioPlay = _interopRequireDefault(require("audio-play"));

var _piece = _interopRequireDefault(require("./piece.js"));

var _imageSprite = _interopRequireDefault(require("./imageSprite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

var Game =
/*#__PURE__*/
function () {
  function Game(root, config) {
    var _this = this;

    _classCallCheck(this, Game);

    this.root = root;
    this.config = config; // config

    this.prefix = (0, _utils.hashCode)(this.config.settings.name); // set prefix for local-storage keys

    console.log(this.config); // create game screen

    this.canvas = document.createElement('canvas');
    this.root.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d"); // game screen context

    this.audioCtx = (0, _audioContext.default)();
    this.playlist = []; // setup event listeners
    // handle keyboard events

    document.addEventListener('keydown', function (_ref) {
      var code = _ref.code;
      return _this.handleKeyboardInput('keydown', code);
    });
    document.addEventListener('keyup', function (_ref2) {
      var code = _ref2.code;
      return _this.handleKeyboardInput('keyup', code);
    }); // setup event listeners for mouse movement

    document.addEventListener('touchmove', function (_ref3) {
      var touches = _ref3.touches;
      return _this.handleTouchMove(touches[0]);
    }); // handle swipes

    document.addEventListener('touchstart', function (_ref4) {
      var touches = _ref4.touches;
      return _this.handleSwipe('touchstart', touches[0]);
    });
    document.addEventListener('touchmove', function (_ref5) {
      var touches = _ref5.touches;
      return _this.handleSwipe('touchmove', touches[0]);
    });
    document.addEventListener('touchend', function (_ref6) {
      var touches = _ref6.touches;
      return _this.handleSwipe('touchend', touches[0]);
    });
  }

  _createClass(Game, [{
    key: "init",
    value: function init() {
      // frame count, rate, and time
      // this is just a place to keep track of frame rate (not set it)
      this.frame = {
        count: 0,
        time: Date.now(),
        rate: null,
        scale: null
      }; // set canvas

      this.canvas.height = this.root.clientHeight; // set game screen height

      this.canvas.width = this.root.clientWidth; // set game screen width
      // set screen

      this.screen = {
        top: 0,
        bottom: this.canvas.height,
        left: 0,
        right: this.canvas.width,
        centerX: this.canvas.width / 2,
        centerY: this.canvas.height / 2,
        width: this.canvas.width,
        height: this.canvas.height,
        scale: (this.canvas.width + this.canvas.height) / 2 * 0.003
      }; // game settings

      this.state = {
        current: 'loading',
        prev: '',
        tickRate: parseInt(this.config.settings.tickRate),
        score: 0,
        paused: false,
        muted: localStorage.getItem(this.prefix.concat('muted')) === 'true'
      };
      this.input = {
        active: 'keyboard',
        keyboard: {
          up: false,
          right: false,
          left: false,
          down: false
        },
        mouse: {
          x: 0,
          y: 0,
          click: false
        },
        swipe: {},
        touch: {
          x: 0,
          y: 0
        }
      };
      var columns = parseInt(this.config.settings.columns);
      var rows = parseInt(this.config.settings.rows);
      this.board = {
        grid: [],
        blocks: [],
        columns: columns,
        rows: rows,
        height: rows,
        width: columns,
        cellSize: (0, _grid.getCellSize)(this.screen.width, this.screen.height, rows, columns),
        lastClear: 0
      }; // tick queue and random bag

      this.tickQueue = [];
      this.bag = []; // create lists

      this.pieces = []; // place to put active pieces

      this.stack = []; // place to put stacked blocks

      this.cleared = []; // place to host cleared blocks

      this.images = {}; // place to keep images

      this.sounds = {}; // place to keep sounds

      this.fonts = {}; // place to keep fonts
      // set document body to backgroundColor

      this.root.style.backgroundColor = this.config.colors.backgroundColor;
    }
  }, {
    key: "load",
    value: function load() {
      var _this2 = this;

      // load pictures, sounds, and fonts
      if (this.sounds && this.sounds.backgroundMusic) {
        this.sounds.backgroundMusic.pause();
      } // stop background music when re-loading


      this.init(); // apply new configs
      // load game assets

      var gameAssets = [(0, _gameAssetLoader.loadImage)('block1', this.config.images.block1), (0, _gameAssetLoader.loadImage)('block2', this.config.images.block2), (0, _gameAssetLoader.loadImage)('block3', this.config.images.block3), (0, _gameAssetLoader.loadImage)('block4', this.config.images.block4), (0, _gameAssetLoader.loadImage)('block5', this.config.images.block5), (0, _gameAssetLoader.loadImage)('block6', this.config.images.block6), (0, _gameAssetLoader.loadImage)('spectatorLeft', this.config.images.spectatorLeft), (0, _gameAssetLoader.loadImage)('spectatorRight', this.config.images.spectatorRight), (0, _gameAssetLoader.loadSound)('clearSound', this.config.sounds.clearSound), (0, _gameAssetLoader.loadSound)('dropSound', this.config.sounds.dropSound), (0, _gameAssetLoader.loadSound)('backgroundMusic', this.config.sounds.backgroundMusic), (0, _gameAssetLoader.loadFont)('gameFont', this.config.settings.fontFamily)]; // put the loaded assets the respective containers

      (0, _gameAssetLoader.loadList)(gameAssets, function (progress) {
        console.log("loading: ".concat(progress.percent, "%"));
      }).then(function (assets) {
        _this2.images = assets.image;
        _this2.sounds = assets.sound;
      }).then(function () {
        return _this2.create();
      }).catch(function (err) {
        return console.error(err);
      });
    }
  }, {
    key: "create",
    value: function create() {
      // setup block styles
      this.blockStyles = [{
        color: this.config.colors.block1,
        image: this.images.block1
      }, {
        color: this.config.colors.block2,
        image: this.images.block2
      }, {
        color: this.config.colors.block3,
        image: this.images.block3
      }, {
        color: this.config.colors.block4,
        image: this.images.block4
      }, {
        color: this.config.colors.block5,
        image: this.images.block5
      }, {
        color: this.config.colors.block6,
        image: this.images.block6
      }];
      this.setState({
        current: 'ready'
      });
      this.play();
    }
  }, {
    key: "play",
    value: function play() {
      var _this3 = this;

      // update game characters
      // clear the screen of the last picture
      this.ctx.fillStyle = this.config.colors.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = this.config.colors.boardColor;
      this.ctx.fillRect(0, 0, this.board.width * this.board.cellSize, this.board.height * this.board.cellSize); // draw and do stuff that you need to do
      // no matter the game state
      // this.ctx.drawImage(this.images.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
      // ready to play

      if (this.state.current === 'ready') {
        if (this.state.prev === 'loading') {
          this.setState({
            current: 'ready'
          });
        }
      } // game play


      if (this.state.current === 'play') {
        // if last state was 'ready'
        if (this.state.prev === 'ready') {} // background music


        if (!this.state.muted && !this.state.backgroundMusic) {
          this.state.backgroundMusic = true;
          this.playback('backgroundMusic', this.sounds.backgroundMusic, {
            start: 0,
            end: this.sounds.backgroundMusic.duration,
            loop: true,
            context: this.audioCtx
          });
        } // check for game over
        // game over if there are blocks on the top row


        var topRow = (0, _grid.gridRow)(this.board.grid, 0);

        if (topRow.length > 0) {
          this.setState({
            current: 'over'
          });
        } // get new random bag of pieces
        // if bag is empty


        if (this.bag.length < 1) {
          this.bag = [0, 1, 2, 3, 4, 5, 6];
        } // every game tick update the game


        var queuedTick = this.tickQueue.length > 0;

        if (queuedTick) {
          // run tick task: shift, rotate, etc
          this.tickQueue.sort(function (a, b) {
            return a.priority - b.priority;
          });
          var tick = this.tickQueue.pop();
          tick.run(); // if there is a placed piece
          // transfer all the blocks from a placed piece
          // to the stack of blocks

          this.stack = [].concat(_toConsumableArray(this.stack), _toConsumableArray(this.placedBlocks())); // remove placed pieces from pieces list

          this.pieces = _toConsumableArray(this.pieces.filter(function (piece) {
            return !piece.placed;
          })); // if there is no piece in play
          // put a new piece in play

          if (this.pieces.filter(function (p) {
            return !p.placed;
          }).length < 1) {
            // pick a random style
            // and pick a random shape from the bag
            var block = (0, _baseUtils.pickFromList)(this.blockStyles);
            var shape = (0, _baseUtils.pickFromList)(this.bag);
            this.pieces = [].concat(_toConsumableArray(this.pieces), [new _piece.default({
              ctx: this.ctx,
              board: this.board,
              image: block.image,
              color: block.color,
              shape: shape,
              cellSize: this.board.cellSize,
              cellBounds: {
                top: 0,
                right: this.board.width,
                bottom: this.board.height,
                left: 0
              },
              bounds: this.screen
            })]); // remove shape from the bag

            this.bag = _toConsumableArray(this.bag.filter(function (s) {
              return s != shape;
            }));
          } // update board blocks


          this.board.blocks = [].concat(_toConsumableArray(this.pieces.map(function (piece) {
            return piece.body;
          }).reduce(function (blocks, body) {
            // for Safari 11 support
            // used in place of Array.flat()
            return [].concat(_toConsumableArray(blocks), _toConsumableArray(body));
          }, [])), _toConsumableArray(this.stack)); // update the grid with
          // current placed block locations

          this.board.grid = this.stack.map(function (blocks) {
            return blocks.cell;
          }).reduce(function (grid, cell) {
            // flag the grid cell as occupied by a block
            return (0, _grid.setGridCell)(grid, cell, true);
          }, []);
        } // schedule a tick to shift piece down by tick rate


        var scheduledTick = this.frame.count % this.state.tickRate === 0;

        if (scheduledTick) {
          // queue shift down for block in the piece
          this.queueTick(1, function () {
            return _this3.shiftPieceDown();
          }); // clear-line
          // full rows of block get removed
          // get row counts (how many placed blocks are in each row)

          var rowCounts = this.stack.map(function (block) {
            return block.cell.y;
          }).reduce(function (rows, y) {
            // set empty cell to 0
            if (typeof rows[y] === 'undefined') {
              rows[y] = 0;
            } // increment cell full count


            rows[y] += 1;
            return rows;
          }, {}); // get full rows (row count equals board columns)

          var fullRows = Object.entries(rowCounts).filter(function (ent) {
            return ent[1] === _this3.board.columns;
          }).map(function (ent) {
            return parseInt(ent[0]);
          }); // remove blocks from full row
          // and shift the stack down

          if (fullRows.length > 0) {
            // set cleared stamp
            this.board.lastClear = Date.now(); // award points

            this.setState({
              score: this.state.score + 100
            }); // images from cleared line to cleared
            // as image sprites

            this.cleared = [].concat(_toConsumableArray(this.cleared), _toConsumableArray(this.stack.filter(function (block) {
              return block.cell.y === fullRows[0];
            }).map(function (block) {
              return new _imageSprite.default({
                ctx: _this3.ctx,
                image: block.image,
                x: block.x,
                y: block.y,
                width: block.width,
                height: block.height,
                speed: 5,
                bounds: null
              });
            }))); // clear-line gravity
            // do cascade style clear-line gravity
            // https://tetris.fandom.com/wiki/Line_clear#Line_clear_gravity
            // mark all block above line as unsupported
            // remove blocks

            this.stack = _toConsumableArray(this.stack.map(function (block) {
              if (block.cell.y < fullRows[0]) {
                block.unsupported = true;
              }

              return block;
            }).filter(function (block) {
              // remove full row blocks
              return block.cell.y != fullRows[0];
            }));
            this.playback('clearSound', this.sounds.clearSound); // queue shift down for blocks in the stack

            this.queueTick(1, function () {
              return _this3.shiftStackDown();
            });
          }
        } // draw board


        this.board.blocks.forEach(function (block) {
          return block.draw();
        }); // update cleared

        this.cleared = _toConsumableArray(this.cleared.map(function (sprite, idx) {
          var dx = idx % 2 === 0 ? 0.5 : -0.5;
          var dy = idx % 3 === 0 ? -1 : -1.5;
          sprite.move(dx, dy, _this3.frame.scale);
          return sprite;
        }).filter(function (sprite) {
          return sprite.y > 0;
        }).filter(function (sprite) {
          return sprite.x > 0 + sprite.width;
        }).filter(function (sprite) {
          return sprite.x < _this3.screen.right;
        })); // draw cleared

        this.cleared.forEach(function (sprite) {
          return sprite.draw();
        });
      } // player wins


      if (this.state.current === 'win') {} // win code
      // game over


      if (this.state.current === 'over') {} // game over code
      // draw the next screen


      this.requestFrame(function () {
        return _this3.play();
      });
    }
  }, {
    key: "shiftStackDown",
    value: function shiftStackDown() {
      // shift un-supported blocks down
      this.stack = this.stack.map(function (block) {
        if (block.unsupported) {
          // shift down
          block.shift({
            y: 1
          }); // re-mark as supported

          block.unsupported = false;
        }

        return block;
      });
    }
  }, {
    key: "shiftPieceDown",
    value: function shiftPieceDown() {
      var _this4 = this;

      this.updatePieces(function (piece) {
        // check for bottom
        var hitBottom = piece.box.bottom > _this4.board.height - 2; // check for blocks below

        var hasDownNeighbor = piece.body.some(function (block) {
          return (0, _grid.neighborDown)(_this4.board.grid, block.cell);
        });

        if (!hitBottom && !hasDownNeighbor) {
          // shift down
          piece.shift({
            y: 1
          });
        } else {
          piece.placed = true; // if an inifinity mode enabled piece moved or rotated action, reset preplaceTick

          /*
          if(this.state.infinityAction) {
              piece.preplaceTick = 0;
              this.setState({ infinityAction: false });
          }
           if (piece.preplaceTick >= this.state.lockDelayTicks) {
               // mark as placed
              piece.placed = true;
          } else {
              
              // increment preplaceTick
              piece.preplaceTick += 1;
           }
          */
        }

        return piece;
      });
    }
  }, {
    key: "shiftPieceLeft",
    value: function shiftPieceLeft() {
      var _this5 = this;

      this.updatePieces(function (piece) {
        // check for left blocks
        var hasLeftNeighbor = piece.body.some(function (block) {
          // check there is a block on the left
          return (0, _grid.neighborLeft)(_this5.board.grid, block.cell);
        });

        if (!hasLeftNeighbor) {
          // shift to the left
          piece.shift({
            x: -1
          });
        }

        return piece;
      });
    }
  }, {
    key: "shiftPieceRight",
    value: function shiftPieceRight() {
      var _this6 = this;

      this.updatePieces(function (piece) {
        // check for right blocks
        var hasRightNeighbor = piece.body.some(function (block) {
          // check there is a block on the left
          return (0, _grid.neighborRight)(_this6.board.grid, block.cell);
        });

        if (!hasRightNeighbor) {
          // shift to the right
          piece.shift({
            x: 1
          });
        }

        return piece;
      });
    }
  }, {
    key: "rotatePiece",
    value: function rotatePiece() {
      var _this7 = this;

      this.updatePieces(function (piece) {
        // check if the rotation results would
        // take up occupied spaces
        var rotatedCells = piece.rotatedCells().map(function (cell) {
          // add string id
          cell.id = "".concat(cell.x, "-").concat(cell.y);
          return cell;
        }); // .map(cell => `${cell.x}-${cell.y}`)

        var blockingCells = _this7.stack.map(function (block) {
          return block.cell;
        }).some(function (cell) {
          // check if cells are blocking
          var id = "".concat(cell.x, "-").concat(cell.y);
          return rotatedCells.map(function (cell) {
            return cell.id;
          }).includes("".concat(cell.x, "-").concat(cell.y));
        }); // or be off screen


        var onEdge = rotatedCells.some(function (cell) {
          var x = cell.x,
              y = cell.y;
          var offX = x < 0 || x >= _this7.board.columns;
          var offY = y < 0 || y >= _this7.board.rows;
          return offX || offY;
        });

        if (!blockingCells && !onEdge) {
          piece.rotate();
        }

        return piece;
      });
    }
  }, {
    key: "dropPiece",
    value: function dropPiece() {
      var _this8 = this;

      // drop down until hitting the stack
      // get the the piece
      var maxShift = this.board.rows;
      var piece = this.pieces.filter(function (piece) {
        return !piece.placed;
      }).reduce(function (piece) {
        return piece;
      }); // get the top block of the stack and, calculate the remaining rows

      var stackCells = this.stack.map(function (block) {
        return block.cell;
      });
      var minShift = piece.body.map(function (block) {
        return block.cell;
      }).reduce(function (min, cell) {
        // find the pairs of cells (piece, stack) on x axis that has the
        // minimum number of rows in between
        var stackPairs = stackCells.filter(function (sc) {
          return sc.x === cell.x;
        });
        var minPair = stackPairs.reduce(function (minP, sp) {
          return minP.y < sp.y ? minP : sp;
        }, {
          y: maxShift
        });
        var dy = minPair.y - cell.y;
        return min < dy ? min : dy;
      }, maxShift); // queue downshifts for number of remaining rows

      for (var row = 0; row < minShift; row += 1) {
        this.queueTick(0, function () {
          return _this8.shiftPieceDown();
        });
      }

      this.playback('dropSound', this.sounds.dropSound);
    }
  }, {
    key: "updatePieces",
    value: function updatePieces(fn) {
      this.pieces = this.pieces.map(function (p) {
        return fn(p);
      });
    }
  }, {
    key: "queueTick",
    value: function queueTick(priority, fn) {
      // add a new tick to the tick queue
      this.tickQueue = [{
        priority: priority,
        run: fn
      }].concat(_toConsumableArray(this.tickQueue)).sort(function (a, b) {
        return a.priority - b.priority;
      });
    } // event listeners

  }, {
    key: "handleClicks",
    value: function handleClicks(target) {
      if (this.state.current === 'loading') {
        return;
      } // mute


      if (target.id === 'mute') {
        this.mute();
      } // pause


      if (target.id === 'pause') {
        this.pause();
      } // button


      if (target.id === 'button') {
        this.setState({
          current: 'play'
        });
      }

      if (this.state.current === 'over') {
        // restart
        this.setState({
          current: 'loading'
        });
        this.reset();
      }
    }
  }, {
    key: "handleKeyboardInput",
    value: function handleKeyboardInput(type, code, event) {
      var _this9 = this;

      this.input.active = 'keyboard';

      if (type === 'keydown' && this.state.current === 'play') {
        // If infinity mode is enabled:
        // Set flag that a key was pressed
        if (this.state.modeInfinity) {
          this.setState({
            infinityAction: true
          });
        } // rotate


        if (code === 'ArrowUp') {
          this.queueTick(0, function () {
            return _this9.rotatePiece();
          });
        } // shift left


        if (code === 'ArrowLeft') {
          this.queueTick(0, function () {
            return _this9.shiftPieceLeft();
          });
        } // shift right


        if (code === 'ArrowRight') {
          this.queueTick(0, function () {
            return _this9.shiftPieceRight();
          });
        } // shift down


        if (code === 'ArrowDown') {
          this.queueTick(0, function () {
            return _this9.shiftPieceDown();
          });
        } // drop


        if (code === 'Space') {
          this.dropPiece();
        }
      }

      if (type === 'keydown') {
        // any key
        // reload when game over
        if (this.state.current.match(/over/)) {
          this.setState({
            current: 'loading'
          });
          this.load();
        } // restart when game ready


        if (this.state.current.match(/ready/)) {
          this.setState({
            current: 'play'
          });
          console.log('play!');
        }
      }
    }
  }, {
    key: "handleTap",
    value: function handleTap() {
      var _this10 = this;

      // rotate
      var now = Date.now();
      var time = now - this.lastTap;

      if (time < 300 && time > 0) {
        // If infinity mode is enabled:
        // Set flag that a key was pressed
        if (this.state.modeInfinity) {
          this.setState({
            infinityAction: true
          });
        } // rotate on double tap   


        this.queueTick(0, function () {
          return _this10.rotatePiece();
        });
      }

      this.lastTap = Date.now();
    } // convert swipe to a direction

  }, {
    key: "handleSwipeInput",
    value: function handleSwipeInput(type, touch) {
      var _this11 = this;

      // If infinity mode is enabled:
      // Set flag that a tap was double pressed
      if (this.state.modeInfinity) {
        this.setState({
          infinityAction: true
        });
      } // clear touch list


      if (type === 'touchstart') {
        this.input.touches = [];
      } // add to touch list


      if (type === 'touchmove') {
        var clientX = touch.clientX,
            clientY = touch.clientY;
        this.input.touches.push({
          x: clientX,
          y: clientY
        });
      } // get user intention


      if (type === 'touchend') {
        var touches = this.input.touches;
        var result = {};

        if (touches.length) {
          // get direction from touches
          result = this.input.touches.map(function (touch, idx, arr) {
            // collect diffs
            var prev = arr[idx - 1] || arr[0];
            return {
              x: touch.x,
              y: touch.y,
              dx: touch.x - prev.x,
              dy: touch.y - prev.y
            };
          }).reduce(function (direction, diff) {
            // sum the diffs
            direction.dx += diff.dx;
            direction.dy += diff.dy;
            return direction;
          }); // get direction

          var swipesX = Math.abs(result.dx) > Math.abs(result.dy);
          var swipesY = Math.abs(result.dy) > Math.abs(result.dx);

          if (swipesX) {
            if (result.dx > 0) {
              // swipe right: shift right
              this.queueTick(0, function () {
                return _this11.shiftPieceRight();
              });
            } else {
              // swipe left: shift left
              this.queueTick(0, function () {
                return _this11.shiftPieceLeft();
              });
            }
          }

          if (swipesY) {
            if (result.dy > 0) {
              // swipe down: drop
              this.dropPiece();
            } else {// swipe up: rotate
              // this.queueTick(0, () => this.rotatePiece());
            }
          }
        }
      }
    }
  }, {
    key: "placedBlocks",
    value: function placedBlocks() {
      return this.pieces.filter(function (piece) {
        return piece.placed;
      }).map(function (piece) {
        return piece.body;
      }).reduce(function (blocks, body) {
        // for Safari 11 support
        // used in place of Array.flat()
        return [].concat(_toConsumableArray(blocks), _toConsumableArray(body));
      }, []);
    } // pause game

  }, {
    key: "pause",
    value: function pause() {
      var _this12 = this;

      if (this.state.current != 'play') {
        return;
      }

      this.state.paused = !this.state.paused;
      this.overlay.setPause(this.state.paused);

      if (this.state.paused) {
        // pause game loop
        this.cancelFrame(this.frame.count - 1); // mute all game sounds

        this.audioCtx.suspend();
        this.overlay.setBanner('Paused');
      } else {
        // resume game loop
        this.requestFrame(function () {
          return _this12.play();
        }, true); // resume game sounds if game not muted

        if (!this.state.muted) {
          this.audioCtx.resume();
        }

        this.overlay.hide('banner');
      }
    } // mute game

  }, {
    key: "mute",
    value: function mute() {
      var key = this.prefix.concat('muted');
      localStorage.setItem(key, localStorage.getItem(key) === 'true' ? 'false' : 'true');
      this.state.muted = localStorage.getItem(key) === 'true';
      this.overlay.setMute(this.state.muted);

      if (this.state.muted) {
        // mute all game sounds
        this.audioCtx.suspend();
      } else {
        // unmute all game sounds
        if (!this.state.paused) {
          this.audioCtx.resume();
        }
      }
    }
  }, {
    key: "playback",
    value: function playback(key, audioBuffer) {
      var _this13 = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // ignore playback requests while paused
      if (this.state.muted) {
        return;
      } // add to playlist


      var id = Math.random().toString(16).slice(2);
      this.playlist.push({
        id: id,
        key: key,
        playback: (0, _audioPlay.default)(audioBuffer, _objectSpread({}, {
          start: 0,
          end: audioBuffer.duration,
          context: this.audioCtx
        }, {}, options), function () {
          // remove played sound from playlist
          _this13.playlist = _this13.playlist.filter(function (s) {
            return s.id != id;
          });
        })
      });
    }
  }, {
    key: "stopPlayback",
    value: function stopPlayback(key) {
      this.playlist = this.playlist.filter(function (s) {
        var targetBuffer = s.key === key;

        if (targetBuffer) {
          s.playback.pause();
        }

        return targetBuffer;
      });
    } // stop playlist

  }, {
    key: "stopPlaylist",
    value: function stopPlaylist() {
      var _this14 = this;

      this.playlist.forEach(function (s) {
        return _this14.stopPlayback(s.key);
      });
    } // update game state

  }, {
    key: "setState",
    value: function setState(state) {
      this.state = _objectSpread({}, this.state, {}, {
        prev: this.state.current
      }, {}, state);
    } // request new frame
    // wraps requestAnimationFrame.

  }, {
    key: "requestFrame",
    value: function requestFrame(next, resumed) {
      var now = Date.now();
      this.frame = {
        count: requestAnimationFrame(next),
        time: now,
        rate: resumed ? 0 : now - this.frame.time,
        scale: this.screen.scale * this.frame.rate * 0.01
      };
    } // cancel frame
    // wraps cancelAnimationFrame.

  }, {
    key: "cancelFrame",
    value: function cancelFrame() {
      cancelAnimationFrame(this.frame.count);
    }
  }]);

  return Game;
}();

var _default = Game;
exports.default = _default;
},{"game-asset-loader":"../../node_modules/game-asset-loader/index.js","./utils.js":"utils.js","./baseUtils.js":"baseUtils.js","./grid.js":"grid.js","audio-context":"../../node_modules/audio-context/index.js","audio-play":"../../node_modules/audio-play/browser.js","./piece.js":"piece.js","./imageSprite.js":"imageSprite.js"}],"index.js":[function(require,module,exports) {
"use strict";

var _main = _interopRequireDefault(require("./main.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var root = document.getElementById('root');
var config = {
  settings: {
    name: 'tetris',
    tickRate: 30,
    rows: 20,
    columns: 10
  },
  colors: {
    backgroundColor: "#000",
    boardColor: "#63D471",
    block1: "#96c8ef",
    block2: "#e76b93",
    block3: "#ffde55",
    block4: "#70efef",
    block5: "#ffcf30",
    block6: "pink"
  },
  images: {
    "block1": "https://i.imgur.com/lUPWv0E.png",
    "block2": "https://i.imgur.com/D6of24y.png",
    "block3": "https://i.imgur.com/LmfnfFQ.png",
    "block4": "https://i.imgur.com/StPlrV0.png",
    "block5": "https://i.imgur.com/X7nmGWr.png",
    "block6": "https://i.imgur.com/v03iKA8.png"
  },
  sounds: {
    backgroundMusic: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/TetrisSalsa.mp3",
    clearSound: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/sparkle.mp3",
    dropSound: "https://objects.koji-cdn.com/eedc4ffb-7d04-464e-8c92-f5291d76f048/whoosh3.mp3"
  }
};
var game = new _main.default(root, config);
game.load();
},{"./main.js":"main.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "34431" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/tetris.e31bb0bc.js.map