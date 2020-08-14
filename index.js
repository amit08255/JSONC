/*global gzip, Base64*/
const gzip = require('gzip-js');

const Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

(function () {

  var root,
    JSONC = {},
    isNodeEnvironment,
    _nCode = -1,
    toString = {}.toString;

  /**
   * set the correct root depending from the environment.
   * @type {Object}
   * @private
   */
  root = this;
  /**
   * Check if JSONC is loaded in Node.js environment
   * @type {Boolean}
   * @private
   */
  isNodeEnvironment = typeof exports === 'object' && typeof module === 'object' && typeof module.exports === 'object' && typeof require === 'function';
  /**
   * Checks if the value exist in the array.
   * @param arr
   * @param v
   * @returns {boolean}
   */
  function contains(arr, v) {
    var nIndex,
      nLen = arr.length;
    for (nIndex = 0; nIndex < nLen; nIndex++) {
      if (arr[nIndex][1] === v) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes duplicated values in an array
   * @param oldArray
   * @returns {Array}
   */
  function unique(oldArray) {
    var nIndex,
      nLen = oldArray.length,
      aArr = [];
    for (nIndex = 0; nIndex < nLen; nIndex++) {
      if (!contains(aArr, oldArray[nIndex][1])) {
        aArr.push(oldArray[nIndex]);
      }
    }
    return aArr;
  }

  /**
   * Escapes a RegExp
   * @param text
   * @returns {*}
   */
  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }

  /**
   * Returns if the obj is an object or not.
   * @param obj
   * @returns {boolean}
   * @private
   */
  function _isObject(obj) {
    return toString.call(obj) === '[object Object]';
  }

  /**
   * Returns if the obj is an array or not
   * @param obj
   * @returns {boolean}
   * @private
   */
  function _isArray(obj) {
    return toString.call(obj) === '[object Array]';
  }

  /**
   * Converts a bidimensional array to object
   * @param aArr
   * @returns {{}}
   * @private
   */
  function _biDimensionalArrayToObject(aArr) {
    var obj = {},
      nIndex,
      nLen = aArr.length,
      oItem;
    for (nIndex = 0; nIndex < nLen; nIndex++) {
      oItem = aArr[nIndex];
      obj[oItem[0]] = oItem[1];
    }
    return obj;
  }

  /**
   * Convert a number to their ascii code/s.
   * @param index
   * @param totalChar
   * @param offset
   * @returns {Array}
   * @private
   */
  function _numberToKey(index, totalChar, offset) {
    var sKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=_!?()*',
      aArr = [],
      currentChar = index;
    totalChar = totalChar || sKeys.length;
    offset = offset || 0;
    while (currentChar >= totalChar) {
      aArr.push(sKeys.charCodeAt((currentChar % totalChar) + offset));
      currentChar = Math.floor(currentChar / totalChar - 1);
    }
    aArr.push(sKeys.charCodeAt(currentChar + offset));
    return aArr.reverse();
  }

  /**
   * Returns the string using an array of ASCII values
   * @param aKeys
   * @returns {string}
   * @private
   */
  function _getSpecialKey(aKeys) {
    return String.fromCharCode.apply(String, aKeys);
  }

  /**
   * Traverse all the objects looking for keys and set an array with the new keys
   * @param json
   * @param aKeys
   * @returns {*}
   * @private
   */
  function _getKeys(json, aKeys) {
    var aKey,
      sKey,
      oItem;

    for (sKey in json) {

      if (json.hasOwnProperty(sKey)) {
        oItem = json[sKey];
        if (_isObject(oItem) || _isArray(oItem)) {
          aKeys = aKeys.concat(unique(_getKeys(oItem, aKeys)));
        }
        if (isNaN(Number(sKey))) {
          if (!contains(aKeys, sKey)) {
            _nCode += 1;
            aKey = [];
            aKey.push(_getSpecialKey(_numberToKey(_nCode)), sKey);
            aKeys.push(aKey);
          }
        }
      }
    }
    return aKeys;
  }

  /**
   * Method to compress array objects
   * @private
   * @param json
   * @param aKeys
   */
  function _compressArray(json, aKeys) {
    var nIndex,
      nLenKeys;

    for (nIndex = 0, nLenKeys = json.length; nIndex < nLenKeys; nIndex++) {
      json[nIndex] = JSONC.compress(json[nIndex], aKeys);
    }
  }

  /**
   * Method to compress anything but array
   * @private
   * @param json
   * @param aKeys
   * @returns {*}
   */
  function _compressOther(json, aKeys) {
    var oKeys,
      aKey,
      str,
      nLenKeys,
      nIndex,
      obj;
    aKeys = _getKeys(json, aKeys);
    aKeys = unique(aKeys);
    oKeys = _biDimensionalArrayToObject(aKeys);

    str = JSON.stringify(json);
    nLenKeys = aKeys.length;

    for (nIndex = 0; nIndex < nLenKeys; nIndex++) {
      aKey = aKeys[nIndex];
      str = str.replace(new RegExp(escapeRegExp('"' + aKey[1] + '"'), 'g'), '"' + aKey[0] + '"');
    }
    obj = JSON.parse(str);
    obj._ = oKeys;
    return obj;
  }

  /**
   * Method to decompress array objects
   * @private
   * @param json
   */
  function _decompressArray(json) {
    var nIndex, nLenKeys;

    for (nIndex = 0, nLenKeys = json.length; nIndex < nLenKeys; nIndex++) {
      json[nIndex] = JSONC.decompress(json[nIndex]);
    }
  }

  /**
   * Method to decompress anything but array
   * @private
   * @param jsonCopy
   * @returns {*}
   */
  function _decompressOther(jsonCopy) {
    var oKeys, str, sKey;

    oKeys = JSON.parse(JSON.stringify(jsonCopy._));
    delete jsonCopy._;
    str = JSON.stringify(jsonCopy);
    for (sKey in oKeys) {
      if (oKeys.hasOwnProperty(sKey)) {
        str = str.replace(new RegExp('"' + sKey + '"', 'g'), '"' + oKeys[sKey] + '"');
      }
    }
    return str;
  }

  /**
   * Compress a RAW JSON
   * @param json
   * @param optKeys
   * @returns {*}
   */
  JSONC.compress = function (json, optKeys) {
    if (!optKeys) {
      _nCode = -1;
    }
    var aKeys = optKeys || [],
      obj;

    if (_isArray(json)) {
      _compressArray(json, aKeys);
      obj = json;
    }
    else {
      obj = _compressOther(json, aKeys);
    }
    return obj;
  };
  /**
   * Use LZString to get the compressed string.
   * @param json
   * @param bCompress
   * @returns {String}
   */
  JSONC.pack = function (json, bCompress) {
    var str = JSON.stringify((bCompress ? JSONC.compress(json) : json));
    return Base64.encode(String.fromCharCode.apply(String, gzip.zip(str,{level:9})));
  };
  /**
   * Decompress a compressed JSON
   * @param json
   * @returns {*}
   */
  JSONC.decompress = function (json) {
    var str,
      jsonCopy = JSON.parse(JSON.stringify(json));
    if (_isArray(jsonCopy)) {
      _decompressArray(jsonCopy);
    }
    else {
      str = _decompressOther(jsonCopy);
    }
    return str ? JSON.parse(str) : jsonCopy;
  };
  function getArr(str) {
    var nIndex = 0,
      nLen = str.length,
      arr = [];
    for (; nIndex < nLen; nIndex++) {
      arr.push(str.charCodeAt(nIndex));
    }
    return arr;
  }

  /**
   * Returns the JSON object from the LZW string
   * @param gzipped
   * @param bDecompress
   * @returns {Object}
   */
  JSONC.unpack = function (gzipped, bDecompress) {
    var aArr = getArr(Base64.decode(gzipped)),
      str = String.fromCharCode.apply(String, gzip.unzip(aArr,{level:9})),
      json = JSON.parse(str);
    return bDecompress ? JSONC.decompress(json) : json;
  };
  /*
   * Expose Hydra to be used in node.js, as AMD module or as global
   */
  root.JSONC = JSONC;
  if (isNodeEnvironment) {
    module.exports = JSONC;
  }
  else if (typeof define !== 'undefined') {
    define('jsoncomp', [], function () {
      return JSONC;
    });
  }
}.call(this));

