var te = te || {};

//+++++++++++++++++++++++++++++something about commmon begin+++++++++++++++++++++
te.assert = function(flag, msg){
    if(!flag) throw msg;
};
//先初始化初始化log，以保证在_initLog调用前就已经使用了log而导致异常
if(console){
    te.log = function(){console.log.apply(console, arguments)};
    te.warn = function(){console.warn.apply(console, arguments)};
    te.error = function(){console.error.apply(console, arguments)};
}else{
    te.log = te.warn = te.error = function(){};
}
/**
 * 0 : 全部关闭
 * 1 : error
 * 2 : warn
 * 3 : info
 * @param mode
 * @private
 */
te._initLog = function(mode){
    if(console){
        if(mode < 3) te.log = function(){};
        if(mode < 2) te.warn = te.log;
        if(mode < 1) te.error = te.warn;
    }
}
/**
 * Iterate over an object or an array, executing a function for each matched element.
 * @param {object|array} obj
 * @param {function} iterator
 * @param [{object}] context
 */
te.each = function(obj, iterator, context){
    var i, li, key;
    if(obj) {
        if(obj instanceof Array){
            for(i = 0, li = obj.length; i < li; i++){
                if(iterator.call(context, obj[i], i) === false) return;
            }
        }else{
            for (key in obj) {
                if(iterator.call(context, obj[key], key) === false) return;
            }
        }
    }
};
//+++++++++++++++++++++++++++++something about commmon end+++++++++++++++++++++


//+++++++++++++++++++++++++++++something about path begin+++++++++++++++++++++
te.path = {
    /**
     * Join strings to be a path.
     * @example
     te.path.join("a", "b.png");//-->"a/b.png"
     te.path.join("a", "b", "c.png");//-->"a/b/c.png"
     te.path.join("a", "b");//-->"a/b"
     te.path.join("a", "b", "/");//-->"a/b/"
     te.path.join("a", "b/", "/");//-->"a/b/"
     * @returns {string}
     */
    join : function(){
        var args = arguments, l = args.length, result = "", i;
        for(i = 0; i < l; i++) {
            result = (result + (result == "" ? "" : "/") + args[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },

    /**
     * Get the ext name of a path.
     * @example
     te.path.extname("a/b.png");//-->".png"
     te.path.extname("a/b.png?a=1&b=2");//-->".png"
     te.path.extname("a/b");//-->null
     te.path.extname("a/b?a=1&b=2");//-->null
     * @param pathStr
     * @returns {*}
     */
    extname : function(pathStr){
        var temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
        return temp ? temp[1] : null;
    },

    /**
     * Get the file name of a file path.
     * @example
     te.path.basename("a/b.png");//-->"b.png"
     te.path.basename("a/b.png?a=1&b=2");//-->"b.png"
     te.path.basename("a/b.png", ".png");//-->"b"
     te.path.basename("a/b.png?a=1&b=2", ".png");//-->"b"
     te.path.basename("a/b.png", ".txt");//-->"b.png"
     * @param pathStr
     * @param extname
     * @returns {*}
     */
    basename : function(pathStr, extname){
        var index = pathStr.indexOf("?");
        if(index > 0) pathStr = pathStr.substring(0, index);
        var reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        var result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if(!result) return null;
        var baseName = result[2];
        if(extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() == extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },

    /**
     * Get ext name of a file path.
     * @example
     te.path.driname("a/b/c.png");//-->"a/b"
     te.path.driname("a/b/c.png?a=1&b=2");//-->"a/b"
     * @param {String} pathStr
     * @returns {*}
     */
    dirname : function(pathStr){
        return pathStr.replace(/(\/|\\\\)$/, "").replace(/(\/|\\\\)[^(\/|\\\\)]+$/, "");
    },

    /**
     * Change extname of a file path.
     * @example
     te.path.changeExtname("a/b.png", ".plist");//-->"a/b.plist"
     te.path.changeExtname("a/b.png?a=1&b=2", ".plist");//-->"a/b.plist?a=1&b=2"
     * @param pathStr
     * @param extname
     * @returns {string}
     */
    changeExtname : function(pathStr, extname){
        extname = extname || "";
        var index = pathStr.indexOf("?");
        var tempStr = "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf(".");
        if(index < 0) return pathStr + extname + tempStr;
        return pathStr.substring(0, index) + extname + tempStr;
    },
    /**
     * Change file name of a file path.
     * @example
     te.path.changeBasename("a/b/c.plist", "b.plist");//-->"a/b/b.plist"
     te.path.changeBasename("a/b/c.plist?a=1&b=2", "b.plist");//-->"a/b/b.plist?a=1&b=2"
     te.path.changeBasename("a/b/c.plist", ".png");//-->"a/b/c.png"
     te.path.changeBasename("a/b/c.plist", "b");//-->"a/b/b"
     te.path.changeBasename("a/b/c.plist", "b", true);//-->"a/b/b.plist"
     * @param {String} pathStr
     * @param {String} basename
     * @param [{Boolean}] isSameExt
     * @returns {string}
     */
    changeBasename : function(pathStr, basename, isSameExt){
        if(basename.indexOf(".") == 0) return this.changeExtname(pathStr, basename);
        var index = pathStr.indexOf("?");
        var tempStr = "";
        var ext = isSameExt ? this.extname(pathStr) : "";
        if(index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        };
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index+1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    }
};
//+++++++++++++++++++++++++++++something about path end+++++++++++++++++++++


//+++++++++++++++++++++++++++++something about async begin+++++++++++++++++++++
te.async = {
    /**
     * Counter for te.async
     * @param err
     */
    _counterFunc : function(err){
        var counter = this.counter;
        if(counter.err) return;
        var length = counter.length;
        var results = counter.results;
        var option = counter.option;
        var cb = option.cb, cbTarget = option.cbTarget, trigger = option.trigger, triggerTarget = option.triggerTarget;
        if(err) {
            counter.err = err;
            if(cb) cb.call(cbTarget, err);
            return;
        }
        var result = Array.apply(null, arguments).slice(1);
        var l = result.length;
        if(l == 0) result = null;
        else if(l == 1) result = result[0];
        else result = result;
        results[this.index] = result;
        counter.count--;
        if(trigger) trigger.call(triggerTarget, result, length - counter.count, length);
        if(counter.count == 0 && cb) cb.apply(cbTarget, [null, results]);
    },

    /**
     * Empty function for async.
     * @private
     */
    _emptyFunc : function(){},
    /**
     * Do tasks parallel.
     * @param tasks
     * @param option
     * @param cb
     */
    parallel : function(tasks, option, cb){
        var async = te.async;
        var l = arguments.length;
        if(l == 3) {
            if(typeof option == "function") option = {trigger : option};
            option.cb = cb || option.cb;
        }
        else if(l == 2){
            if(typeof option == "function") option = {cb : option};
        }else if(l == 1) option = {};
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};

        te.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter : counter, index : index});//bind counter and index
            task(counterFunc, index);
        });
    },

    /**
     * Do tasks by iterator.
     * @param tasks
     * @param {{cb:{function}, target:{object}, iterator:{function}, iteratorTarget:{function}}|function} option
     * @param cb
     */
    map : function(tasks, option, cb){
        var self = this;
        var l = arguments.length;
        if(typeof option == "function") option = {iterator : option};
        if(l == 3) option.cb = cb || option.cb;
        else if(l == 2);
        else throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if(li == 0){
            if(option.cb) option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length : li, count : li, option : option, results : results};
        te.each(tasks, function(task, index){
            if(counter.err) return false;
            var counterFunc = !option.cb ? self._emptyFunc : self._counterFunc.bind({counter : counter, index : index});//bind counter and index
            option.iterator.call(option.iteratorTarget, task, index, counterFunc);
        });
    }
};
//+++++++++++++++++++++++++++++something about async end+++++++++++++++++++++
te.net = {

    /**
     * Get XMLHttpRequest.
     * @returns {XMLHttpRequest}
     */
    getXMLHttpRequest : function () {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    }
};
//+++++++++++++++++++++++++++++something about resMgr begin+++++++++++++++++++++
te.resMgr = {
    _cache : {},
    _jsCache : {},

    resPath : "",

    /**
     * Load a single resource as txt.
     * @param {!string} url
     * @param {function} cb arguments are : err, txt
     */
    loadTxt : function(url, cb){
        var xhr = te.net.getXMLHttpRequest();
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
            xhr.onreadystatechange = function () {
                xhr.readyState === 4 && xhr.status === 200 ? cb(null, xhr.responseText) : cb("load resource failed!");
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            xhr.onload = function () {
                xhr.readyState === 4 && xhr.status === 200 ? cb(null, xhr.responseText) : cb("load resource failed!");
            };
        }
        xhr.send(null);
    },
    _getTxtSync : function(url){
        var xhr = te.net.getXMLHttpRequest();
        xhr.open("GET", url, false);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Accept-Charset", "utf-8");
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
        }
        xhr.send(null);
        return (xhr.readyState === 4 && xhr.status === 200) ? xhr.responseText : null;
    },
    /**
     * Load a single resource as json.
     * @param {!string} url
     * @param {function} cb arguments are : err, json
     */
    loadJson : function(url, cb){
        this.loadTxt(url, function(err, txt){
            try{
                err ? cb(err) : cb(null, JSON.parse(txt));
            }catch(e){
                cb("load json [" + url + "] failed : " + e);
            }
        });
    },
    /**
     * Load a single image.
     * @param {!string} url
     * @param [{object}] option
     * @param {function} cb
     * @returns {Image}
     */
    loadImg : function(url, option, cb){
        var l = arguments.length;
        var opt = {
            isCrossOrigin : true
        };
        if(l == 3) {
            opt.isCrossOrigin = option.isCrossOrigin == null ? opt.isCrossOrigin : option.isCrossOrigin;
        }
        else if(l == 2) cb = option;

        var img = new Image();
        if(opt.isCrossOrigin) img.crossOrigin = "Anonymous";

        img.addEventListener("load", function () {
            this.removeEventListener('load', arguments.callee, false);
            this.removeEventListener('error', arguments.callee, false);
            if(!cb) return;
            cb(null, img);
        });
        img.addEventListener("error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if(!cb) return;
            cb("error");
        });
        img.src = url;
        return img;
    },
    _getArgs4Js : function(args){
        var a0 = args[0], a1 = args[1], a2 = args[2], results = ["", null, null];

        if(args.length == 1){
            results[1] = a0 instanceof Array ? a0 : [a0];
        }else if(args.length == 2){
            if(typeof a1 == "function"){
                results[1] = a0 instanceof Array ? a0 : [a0];
                results[2] = a1;
            }else{
                results[0] = a0 || "";
                results[1] = a1 instanceof Array ? a1 : [a1];
            }
        }else if(args.length == 3){
            results[0] = a0 || "";
            results[1] = a1 instanceof Array ? a1 : [a1];
            results[2] = a2;
        }else throw "arguments error to load js!";
        return results;
    },
    _createScript : function(jsPath, isAsync, cb){
        var d = document, self = this, s = d.createElement('script');
        s.async = isAsync;
        s.src = jsPath;
        self._jsCache[jsPath] = 1;
        s.addEventListener('load',function(){
            this.removeEventListener('load', arguments.callee, false);
            cb();
        },false);
        s.addEventListener('error',function(){
            cb("Load " + jsPath + " failed!");
        },false);
        d.body.appendChild(s);
    },
    /**
     * Load js files.
     * @param {?string=} baseDir   The pre path for jsList.
     * @param {array.<string>} jsList    List of js path.
     * @param {function} cb        Callback function
     *
     *      If the arguments.length == 2, then the baseDir turns to be "".
     * @returns {*}
     */
    loadJs : function(baseDir, jsList, cb){
        var self = this, localJsCache = self._jsCache,
            args = self._getArgs4Js(arguments);
        te.async.map(args[1], function(item, index, cb1){
            var jsPath = te.path.join(args[0], item);
            if(localJsCache[jsPath]) return cb1(null);
            self._createScript(jsPath, false, cb1);
        }, args[2]);
    },
    _drawJsLoadingImg : function(){
        //TODO
    },
    _rmJsLoadingImg : function(){
        //TODO
    },
    /**
     * Load js width loading image.
     * @param {?string} baseDir
     * @param {array} jsList
     * @param {function} cb
     */
    loadJsWithImg : function(baseDir, jsList, cb){
        var self = this, args = self._getArgs4Js(arguments);
        self._drawJsLoadingImg();
        self.loadJs(args[0], args[1], function(err){
            if(err) throw err;
            self._rmJsLoadingImg();
            if(args[2]) args[2]();
        });
    },

    getUrl : function(basePath, url){},
    load : function(res, cb){},
    /**
     * Get resource data by url.
     * @param url
     * @returns {*}
     */
    getRes : function(url){
        return this._cache[url];
    },

    /**
     * Release the cache of resource by url.
     * @param url
     */
    release : function(url){
        delete this._cache[url];
    },

    /**
     * Resource cache of all resources.
     */
    releaseAll : function(){
        var locCache = this._cache, key;
        for (key in locCache) delete locCache[key];
    }
};
//+++++++++++++++++++++++++++++something about resMgr end++++++++++++++++++++

//+++++++++++++++++++++++++++++something about sys begin+++++++++++++++++++++

/**
 * create a webgl context
 * @param {HTMLCanvasElement} canvas
 * @param {Object} opt_attribs
 * @return {WebGLRenderingContext}
 */
te.create3DContext = function (canvas, opts) {
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], i, li = names.length;
    var context = null;
    for (i = 0; i < li; ++i) {
        try {
            context = canvas.getContext(names[i], opts);
        } catch (e) {
            break;
        }
    }
    return context;
};
te._initSys = function(config, CONFIG_KEY){
    /**
     * Canvas of render type
     * @constant
     * @type Number
     */
    te._RENDER_TYPE_CANVAS = 0;

    /**
     * WebGL of render type
     * @constant
     * @type Number
     */
    te._RENDER_TYPE_WEBGL = 1;

    var sys = te.sys = {};

    /**
     * English language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ENGLISH = "en";

    /**
     * Chinese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_CHINESE = "zh";

    /**
     * French language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_FRENCH = "fr";

    /**
     * Italian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ITALIAN = "it";

    /**
     * German language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_GERMAN = "de";

    /**
     * Spanish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_SPANISH = "es";

    /**
     * Russian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_RUSSIAN = "ru";

    /**
     * Korean language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_KOREAN = "ko";

    /**
     * Japanese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_JAPANESE = "ja";

    /**
     * Hungarian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_HUNGARIAN = "hu";

    /**
     * Portuguese language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_PORTUGUESE = "pt";

    /**
     * Arabic language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_ARABIC = "ar";

    /**
     * Norwegian language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_NORWEGIAN = "no";

    /**
     * Polish language code
     * @constant
     * @type Number
     */
    sys.LANGUAGE_POLISH = "pl";


    /**
     * @constant
     * @type {string}
     */
    sys.OS_WINDOWS = "Windows";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_IOS = "iOS";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_OSX = "OS X";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_UNIX = "UNIX";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_LINUX = "Linux";
    /**
     * @constant
     * @type {string}
     */
    sys.OS_ANDROID = "Android";
    sys.OS_UNKNOWN = "Unknown";

    sys.BROWSER_TYPE_WECHAT = "wechat";
    sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    sys.BROWSER_TYPE_IE = "ie";
    sys.BROWSER_TYPE_QQ = "qqbrowser";
    sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    sys.BROWSER_TYPE_UC = "ucbrowser";
    sys.BROWSER_TYPE_360 = "360browser";
    sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    sys.BROWSER_TYPE_MAXTHON = "maxthon";
    sys.BROWSER_TYPE_OPERA = "opera";
    sys.BROWSER_TYPE_MIUI = "miuibrowser";
    sys.BROWSER_TYPE_FIREFOX = "firefox";
    sys.BROWSER_TYPE_SAFARI = "safari";
    sys.BROWSER_TYPE_CHROME = "chrome";
    sys.BROWSER_TYPE_UNKNOWN = "unknown";

    /**
     * WhiteList of browser for WebGL.
     * @constant
     * @type Array
     */
    var webglWhiteList = [sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME, sys.BROWSER_TYPE_SAFARI];
    var multipleAudioWhiteList = [
        sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME,
        sys.BROWSER_TYPE_SAFARI, sys.BROWSER_TYPE_UC, sys.BROWSER_TYPE_QQ, sys.BROWSER_TYPE_MOBILE_QQ
    ];

    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement, ua = nav.userAgent;

    sys.isMobile = !!ua.match(/mobile|adnroid/i);

    var currLanguage = nav.language || nav.browserLanguage;
    sys.currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;

    var browserTypes = ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|trident|opera|miuibrowser|firefox/i)
        || ua.match(/chrome|safari/i);
    var browserType;
    if (browserTypes && browserTypes.length > 0) {
        browserType = browserTypes[0].toLowerCase();
        if (browserType == 'micromessenger') browserType = sys.BROWSER_TYPE_WECHAT;
        else if( browserType == "safari" && (ua.match(/android.*applewebkit/i))) browserType = sys.BROWSER_TYPE_ANDROID;
        else if(browserType == "trident") browserType = sys.BROWSER_TYPE_IE;
    }else browserType = sys.BROWSER_TYPE_UNKNOWN;
    sys.browserType = browserType;

    sys._supportMultipleAudio = multipleAudioWhiteList.indexOf(sys.browserType) > -1;

    //++++++++++++++++++something about te._renderTYpe and te._supportRender begin++++++++++++++++++++++++++++
    var userRenderMode = parseInt(config[CONFIG_KEY.renderMode]);
    var renderType = te._RENDER_TYPE_WEBGL;
    var canvas = te._canvas = doc.getElementById(config[CONFIG_KEY.id]);
    te.assert(canvas, "Can not find canvas!");
    te._supportRender = 1;
    var notInWhiteList = webglWhiteList.indexOf(sys.browserType) == -1;
    if(userRenderMode === 1 || (userRenderMode === 0 && (sys.isMobile || notInWhiteList))){
        renderType = te._RENDER_TYPE_CANVAS;
    }

    if(renderType == te._RENDER_TYPE_WEBGL){
        if(!window.WebGLRenderingContext
            || !te.create3DContext(canvas, {'stencil': true, 'preserveDrawingBuffer': true })){
            if(userRenderMode == 0) renderType = te._RENDER_TYPE_CANVAS;
            else te._supportRender = 0;
        }
    }

    if(renderType == te._RENDER_TYPE_CANVAS){
        try {
            canvas.getContext("2d");
        } catch (e) {
            te._supportRender = 0;
        }
    }
    te._renderType = renderType;
    //++++++++++++++++++something about te._renderTYpe and te._supportRender end++++++++++++++++++++++++++++++


    // check if browser supports Web Audio
    // check Web Audio's context
    sys._supportWebAudio = !!(win.AudioContext || win.webkitAudioContext || win.mozAudioContext);

    /** LocalStorage is a local storage component.
     */
    try{
        var localStorage = sys.localStorage = window.localStorage;
        localStorage.setItem("storage", "");
        localStorage.removeItem("storage");
        localStorage = null;
    }catch(e){
        if( e.name === "SECURITY_ERR" || e.name === "QuotaExceededError" ) {
            te.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
        }
        sys.localStorage = function(){};
    }


    var capabilities = sys.capabilities = {"canvas":1};
    if(te._renderType == te._RENDER_TYPE_WEBGL)  capabilities["opengl"] = 1;
    if( docEle['ontouchstart'] || nav.msPointerEnabled) capabilities["touches"] = 1;
    else if( docEle['onmouseup']) capabilities["mouse"] = 1;
    if( docEle['onkeyup']) capabilities["keyboard"] = 1;
    if(win["DeviceMotionEvent"] || win["DeviceOrientationEvent"]) capabilities["accelerometer"] = 1;

    /** Get the os of system */
    var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
    var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
    var osName;
    if (nav.appVersion.indexOf("Win")!=-1) osName=sys.OS_WINDOWS;
    else if( iOS ) osName = sys.OS_IOS;
    else if (navigator.appVersion.indexOf("Mac")!=-1) osName=sys.OS_OSX
    else if (navigator.appVersion.indexOf("X11")!=-1) osName=sys.OS_UNIX
    else if (navigator.appVersion.indexOf("Linux")!=-1) osName=sys.OS_LINUX;
    else if( isAndroid ) osName = sys.OS_ANDROID;
    else osName = sys.OS_UNKNOWN;
    sys.os = osName;
};
//+++++++++++++++++++++++++++++something about sys end+++++++++++++++++++++

/**
 * An object to boot the game.
 */
te.game = {
    DEBUG_MODE_NONE : 0,
    DEBUG_MODE_ERROR : 1,
    DEBUG_MODE_WARN: 2,
    DEBUG_MODE_INFO: 3,

    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    _eventHide: null,
    _eventShow: null,

    /**
     * Key of config
     * @constant
     * @type Object
     */
    CONFIG_KEY : {
        engineDir : "engineDir",
        debugMode : "debugMode",
        showFPS : "showFPS",
        frameRate : "frameRate",
        id : "id",
        renderMode : "renderMode",
        jsList : "jsList"
    },

    _intervalId : null,//interval target of main

    /**
     * Config of game
     * @type Object
     */
    config : null,

    /**
     * Callback when the scripts of engine have been load.
     * @type Function
     */
    onStart : null,

    /**
     * Callback when game exits.
     * @type Function
     */
    onStop : null,

    /**
     * Set frameRate of game.
     * @param frameRate
     */
    setFrameRate : function(frameRate){
        var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
        config[CONFIG_KEY.frameRate] = frameRate;
        if(self._intervalId) clearInterval(self._intervalId);
        self._runMainLoop();
    },
    /**
     * Run game.
     * @private
     */
    _runMainLoop : function(){
        var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
            win = window, frameRate = config[CONFIG_KEY.frameRate];
        if (win.requestAnimFrame && frameRate == 60) {
            callback = function () {
                te.director.mainLoop();
                win.requestAnimFrame(callback);
            };
            win.requestAnimFrame(callback);
        } else {
            callback = function () {
                te.director.mainLoop();
            };
            self._intervalId = setInterval(callback, 1000.0/frameRate);
        }
        self._paused = false;
    },


    /**
     * Run game.
     */
    run : function(){
        var self = this;
        self.prepare(function(){
            if(!te._supportRender) return;
            self._runMainLoop();
            self.onStart();
        });
    },
    /**
     * Init config.
     * @param cb
     * @returns {*}
     * @private
     */
    _initConfig : function(){
        var self = this, CONFIG_KEY = self.CONFIG_KEY;
        var _init = function(cfg){
            cfg[CONFIG_KEY.engineDir] = cfg[CONFIG_KEY.engineDir] || "libs/t-easy";
            cfg[CONFIG_KEY.debugMode] = cfg[CONFIG_KEY.debugMode] || 0;
            cfg[CONFIG_KEY.frameRate] = cfg[CONFIG_KEY.frameRate] || 60;
            cfg[CONFIG_KEY.renderMode] = cfg[CONFIG_KEY.renderMode] || 0;
            return cfg;
        };

        var txt, data;
        try{
            txt = te.resMgr._getTxtSync("proj.json");
            data = JSON.parse(txt);
        }catch(e){
        }
        self.config = _init(data || {});

        te._initLog(self.config[CONFIG_KEY.debugMode]);
        te._initSys(self.config, CONFIG_KEY);
    },

    //cache for js and module that has added into jsList to be loaded.
    _jsAddedCache : {},
    _getJsListOfModule : function(moduleMap, moduleName, dir){
        var jsAddedCache = this._jsAddedCache;
        if(jsAddedCache[moduleName]) return null;
        dir = dir || "";
        var jsList = [];
        var tempList = moduleMap[moduleName];
        te.assert(tempList, "can not find module [" + moduleName + "]");
        var ccPath = te.path, i, li = tempList.length;
        for(i = 0; i < li; i++){
            var item = tempList[i];
            if(!jsAddedCache[item]) {
                var extname = ccPath.extname(item);
                if(!extname) {
                    var arr = this._getJsListOfModule(moduleMap, item, dir);
                    if(arr) jsList = jsList.concat(arr);
                }else if(extname.toLowerCase() == ".js") jsList.push(ccPath.join(dir, item));
                jsAddedCache[item] = true;
            }
        }
        return jsList;
    },
    /**
     * Prepare game.
     * @param cb
     */
    prepare : function(cb){
        var self = this;
        var config = self.config, CONFIG_KEY = self.CONFIG_KEY, engineDir = config[CONFIG_KEY.engineDir], resMgr = te.resMgr;
        if(!te._supportRender){
            return te.error("Can not support render!")
        }

        var jsList = config[CONFIG_KEY.jsList] || [];
        if(te.Class){//is single file
            //load user's jsList only
            resMgr.loadJsWithImg("", jsList, function(err){
                if(err) throw err;
                self._prepared = true;
                if(cb) cb();
            });
        }else{
            //load cc's jsList first
            var teCfgPath = te.path.join(engineDir, "teCfg.json");
            resMgr.loadJson(teCfgPath, function(err, modulesJson){
                if(err) throw err;
                var modules = config["modules"] || [];
                var moduleMap = modulesJson["module"];
                var newJsList = [];
                for(var i = 0, li = modules.length; i < li; i++){
                    var arr = self._getJsListOfModule(moduleMap, modules[i], engineDir);
                    if(arr) newJsList = newJsList.concat(arr);
                }
                newJsList = newJsList.concat(jsList);
                resMgr.loadJsWithImg(newJsList, function(err1){
                    if(err1) throw err1;
                    if(cb) cb();
                });
            });
        }
    }
};
te.game._initConfig();
//