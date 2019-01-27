;
(function anonymous(window) {
  function AJAX(options) {
    return new init(options)
  }
  let init = function init(options = {}) {
    let {
      url,
      method = 'GET',
      data = null,
      dataType = 'JSON',
      async = true,
      cache = true,
      success,
      error
    } = options;
    // MOUNT: 把配置项挂载到实例上
    ['url', 'method', 'data', 'dataType', 'async', 'cache', 'success', 'error'].forEach(item => {
      // eval(item)把字符串转化为表达式
      this[item] = eval(item);
    });
    // send：发送ajax请求
    this.sendAjax();
  }
  AJAX.prototype = {
    constructor: AJAX,
    // 配置项
    init,
    // 发送ajax请求
    sendAjax() {
      this.handleData();
      this.handleCache();
      let {
        method,
        url,
        async,
        error,
        dataType,
        success,
        data
      } = this;
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, async);
      xhr.onreadystatechange = () => {
        // success
        if (xhr.readyState === 4) {
          // error
          if (!/^(2|3)\d{2}$/.test(xhr.status)) {
            error && error(xhr.statusText, xhr);
            return;
          }
          // 处理dataType
          let result = this.handleDataType(xhr);
          success && success(result, xhr);
        }
      };
      xhr.send(data);
    },
    // 处理dataType
    handleDataType(xhr) {
      let dataType = this.dataType.toUpperCase(),
        result = xhr.responseText;
      switch (dataType) {
        case 'TEXT':
          break;
        case 'JSON':
          result = JSON.parse(result);
          break;
        case 'XML':
          result = xhr.responseXML;
          break;
      }
      return result;
    },
    // 处理cache
    handleCache() {
      let {
        url,
        method,
        cache
      } = this;
      if (/^GET$/i.test(method) && cache === false) {
        url += `${this.check()}_=${+(new Date())}`;
        this.url = url;
      }
    },
    // 检测url中是否存储问号
    check() {
      return this.url.indexOf('?') > -1 ? '&' : '?';
    },
    // 处理data
    handleData() {
      let {
        data,
        method
      } = this;
      // data不存在，不做处理
      if (!data) return;
      if (typeof data === 'object') {
        // 如果是个object对象，我们将它转化为x-www-form-urlencoded这种模式，方便后期传递给服务器
        let str = ``;
        for (let key in data) {
          if (data.hasOwnProperty(key)) {
            str += `${key}=${data[key]}$`;
          }
        }
        data = str.substring(0, str.length - 1);
      }
      // 根据请求的方式不一样，传递给服务器的方式也不同
      if (/^(GET|DELETE|HEAD|TRACE|OPTIONS)$/i.test(method)) {
        this.url += `${this.check()}${data}`;
        this.data = null;
        return;
      }
      // post
      this.data = data;
    },
  };
  init.prototype = AJAX.prototype;
  window.ajax = AJAX;
})(window);