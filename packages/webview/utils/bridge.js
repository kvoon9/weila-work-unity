const isAndroid = navigator.userAgent.includes('Android') || navigator.userAgent.includes('Adr')
const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

// 这是必须要写的，用来创建一些设置
function setupWebViewJavascriptBridge(callback) {
  // Android使用
  if (isAndroid) {
    if (window.WebViewJavascriptBridge) {
      callback(window.WebViewJavascriptBridge)
    }
    else {
      document.addEventListener(
        'WebViewJavascriptBridgeReady',
        () => {
          callback(window.WebViewJavascriptBridge)
        },
        false,
      )
    }
    sessionStorage.phoneType = 'android'
  }

  // iOS使用
  if (isiOS) {
    //    if (window.WebViewJavascriptBridge) {
    //      return callback(window.WebViewJavascriptBridge);
    //    }
    //    if (window.WVJBCallbacks) {
    //      return window.WVJBCallbacks.push(callback);
    //    }
    //    window.WVJBCallbacks = [callback];
    //    var WVJBIframe = document.createElement("iframe");
    //    WVJBIframe.style.display = "none";
    //    WVJBIframe.src = "wvjbscheme://__BRIDGE_LOADED__";
    //    document.documentElement.appendChild(WVJBIframe);
    //    setTimeout(() => {
    //      document.documentElement.removeChild(WVJBIframe);
    //    }, 0);
    //    console.log("tag", "ios");
    //    sessionStorage.phoneType = "ios";
  }
}

// 注册回调函数，第一次连接时调用 初始化函数(android需要初始化,ios不用)
setupWebViewJavascriptBridge((bridge) => {
  if (isAndroid) {
    // 初始化
    bridge.init((message, responseCallback) => {
      const data = {
        'Javascript Responds': 'Wee!',
      }

      responseCallback(data)
    })
  }
})

export const bridge = {
  // js调APP方法 （参数分别为:app提供的方法名  传给app的数据  回调）
  callHandler(name, data, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler(name, data, callback)
    })
  },
  // APP调js方法 （参数分别为:js提供的方法名  回调）
  registerHandler(name, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.registerHandler(name, (data, responseCallback) => {
        callback(data, responseCallback)
      })
    })
  },
  exit() {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler('finishActivity')
    })
  },

  wxBuy(data, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler('wxPayReq', data, callback)
    })
  },

  saveImg(data, callback) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler('savePicture', data, callback)
    })
  },

  callPhone(phoneNumber, callback = () => {}) {
    setupWebViewJavascriptBridge((bridge) => {
      bridge.callHandler('openDialActivity', JSON.stringify({ tel: phoneNumber }), callback)
    })
  },
}
