/**
 * Created by Tony-Li on 2016/3/15.
 * 公共基础包
 */
(function ($) {

  /**
   * 项目请求路径
   */
  $.scmServerUrl = "http://127.0.0.1/scm-web/";
  $.showAllMenu = false;

  $.dictSource = 1;//数据字典数据来源:0-js文件,1-系统后台接口 
  $.addressSource = 1;//省市县数据来源:0-js文件,1-系统后台接口
  $.jdAddressSource = 1;//京东省市县数据来源:0-js文件,1-系统后台接口

  /**
   * 登录的URL
   */
  $.loginUrl = "http://ucenter.fengdai.org/?appId=uc6c7f06e54ac77f87";
  // $.loginUrl = "http://uat-ucenter.tairancloud.com/?appId=uc6c7f06e54ac77f87";


  var dictData;//字典数据
  var errMsg;
  var sucMsg;
  BUI.use(['bui/form', 'bui/data'], function (Form, Data) {

    // 身份证验证
    Form.Rules.add({
      name: 'idcard', // 规则名称
      validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息
        var regexp = new RegExp(/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/);
        if (value && !regexp.test(value)) {
          return '身份证号码格式错误';
        }
      }
    });

    // 条形码规则处理
    Form.Rules.add({
      name: 'isBarCode', // 规则名称
      validator: function (value) {
        // var regexp = new RegExp(/^[0-9a-zA-Z-#,]+$/);
        // if (regexp.test(value)) {
        //     return '条形码格式错误';
        // }
        var regChina = new RegExp("[\\u4E00-\\u9FFF]+", "g");
        var regEn = /[`~!@$%^&*()_+=<>?:"{}.\/;'[\]]/im,
          regCn = /[·！=￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if (regChina.test(value) || regEn.test(value) || regCn.test(value)) {
          return '条形码格式错误';
        }
      }
    });

    // 手机号验证
    Form.Rules.add({
      name: 'mobile', // 规则名称
      validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息
        var regexp = new RegExp(/^(((1[3-7][0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/);
        if (value != "" && !regexp.test(value)) {
          return '手机号码格式错误';
        }
      }
    });

    // 银行账号验证
    Form.Rules.add({
      name: 'bankAccout', // 规则名称
      validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息
        var regexp = new RegExp(/^\+?[1-9][0-9]*$/);
        if (!regexp.test(value)) {
          return '银行账号格式错误';
        }
      }
    });

    // 银行账号验证
    Form.Rules.add({
      name: 'phone', // 规则名称
      validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息
        var regexp = new RegExp(/^(0\d{2,3}-?\d{7,8}$)|((((1[3-7][0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$)/);
        if (value != "" && !regexp.test(value)) {
          return '电话号码格式错误';
        }
      }
    });

    //数字大于0验证
    Form.Rules.add({
      name: 'numberGtZero', // 规则名称
      validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息                
        if (value != "" && value <= 0) {
          return "数值不能小于0";
        }
      }
    });

      //数字大于=0验证
      Form.Rules.add({
        name: 'numberGeqZero', // 规则名称
        validator: function (value) { // 验证函数，验证值、基准值、格式化后的错误信息                
          if (value != "" && value <= 0) {
            return "数值不能小于0";
          }
        }
      });

    //参考价校验
    Form.Rules.add({
      name: 'price',
      validator: function (value) {
        var regexp = new RegExp(/([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])/);
        if (value != "" && value <= 0) {
          return "数值不能小于0";
        }
        if (value && !regexp.test(value)) {
          return '不是有效的数字'
        }
        if (value.indexOf(',') != -1) {
          return '不是有效的数字'
        }
      }
    })

    //重量校验
    Form.Rules.add({
      name: 'kgNumber',
      validator: function (value) {
        var regexp = new RegExp(/^(\d+.\d{0,5}|\d+)$/);
        if (value && value < 0) {
          return '输入重量不能小于0'
        }
        if (value.indexOf(',') != -1) {
          return '不是有效的数字'
        }
        if (value && !regexp.test(value)) {
          return '最多只能输入五位小数'
        }
        if (value.length > 15) {
          return '只能输入15位数字'
        }
      }
    })

    Form.Rules.add({
      name: 'qualityDay',
      validator: function (value) {
        var regexp = new RegExp(/^\d*[0-9]{1,}\d*$/);
        if (value != "" && !regexp.test(value)) {
          return "请输入有效数字";
        }
        if (value.length > 15) {
          return "最大输入限制15位数字"
        }
      }
    })
    var Store = Data.Store;

    var addressUrl = "";
    if ($.addressSource == "0") {
      addressUrl = "/js/util/city.js";
    } else {
      addressUrl = $.scmServerUrl + 'metadata/address';
    }

    var dictUrl = "";
    if ($.dictSource == "0") {
      dictUrl = "/supply/dict.json";
    } else {
      dictUrl = $.scmServerUrl + 'metadata/dict';
    }

    if (localStorage.getItem("dictTranslate")) {
      var dictTranslate = JSON.parse(localStorage.getItem("dictTranslate"));
      dictData = new Store({
        data: dictTranslate,
        autoLoad: true
      });
    } else {
      dictData = new Store({
        url: dictUrl,
        autoLoad: true
      });
    }

    if (localStorage.getItem("city")) {
      var dictTranslate = JSON.parse(localStorage.getItem("city"));
      Form.Group.Select.addType('city2', {
        data: dictTranslate,
        autoLoad: true
      });
    } else {
      Form.Group.Select.addType('city2', {
        proxy: {//加载数据的配置项
          autoLoad: true,
          url: addressUrl,
          dataType: 'json'//使用json
        }
      });
    }

  });

  $(function () {
    var addressUrl = "";
    if ($.addressSource == "0") {
      addressUrl = "/js/util/city.js";
    } else {
      addressUrl = $.scmServerUrl + 'metadata/address';
    }

    var dictUrl = "";
    if ($.dictSource == "0") {
      dictUrl = "/supply/dict.json";
    } else {
      dictUrl = $.scmServerUrl + 'metadata/dict';
    }

    $.ajax({
      type: "get",
      url: addressUrl,
      data: {},
      cache: false,
      dataType: "json",
      success: function (data) {
        localStorage.setItem("city", JSON.stringify(data));
      }
    });
    $.ajax({
      type: "get",
      url: dictUrl,
      data: {},
      cache: false,
      dataType: "json",
      success: function (data) {
        localStorage.setItem("dictTranslate", JSON.stringify(data));
      }
    });
    $.loadMask = new BUI.Mask.LoadMask({
      el: 'body',
      msg: 'loading'
    });
  }());

  $.showLoadMask = function (msg) {
    $.loadMask.hide();
    $.loadMask.set("msg", msg || "loading");
    $.loadMask.show();
  };
  $.hideLoadMask = function () {
    $.loadMask.hide();
  };

  /**
   * 数据字典翻译
   * @param dictTypeCode 字典类型编码
   * @param dictValue 字典值
   */
  $.dictTranslate = function (dictTypeCode, dictValue) {
    var dictName = "";
    var dicts = dictData.getResult();
    for (var i = 0; i < dicts.length; i++) {
      if (dicts[i]['typeCode'] == dictTypeCode && dicts[i]['value'] == dictValue) {
        dictName = dicts[i]['name'];
        break;
      }
    }
    return dictName;
  };


  /**
   * 异步请求基类
   * @returns {{type: string, url: string, data: string, dataType: string, error: Function, complete: Function, beforeSend: Function, success: Function}}
   */
  $.AjaxContent = function (errorFn) {
    var content = {
      type: "GET",
      url: '',
      data: '',
      dataType: "json",
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (errorFn) {
          errorFn();//执行错误回调函数
        }
        var result = "";
        if (XMLHttpRequest.responseText) {
          result = XMLHttpRequest.responseText;
          if (!(result instanceof Object)) {
            try {
              result = JSON.parse(result);
            } catch (e) {

            }
          }
        }
        if (XMLHttpRequest.status == 401) {
          BUI.Message.Alert(result.databuffer || "", function () {
            var aContent = $.AjaxContent();
            aContent.type = "POST";
            aContent.url = $.scmServerUrl + "account/user/logout/";
            aContent.success = function () {
              if (window.location.origin.indexOf('tairanmall.com') != -1) {
                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
              } else {
                window.location.href = '/supply/login.html';
              }

              localStorage.clear();
            };
            $.ajax(aContent);
            this.close();
          }, 'error');
        } else if (XMLHttpRequest.status == 403) {
          if (result.appcode == 0) {
            if (window.location.origin.indexOf('tairanmall.com') != -1) {
              var redirectUrl = window.location.origin + "/supply/selectChannel.html";
              window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
            } else {
              window.top.location.href = '/supply/login.html';
            }
          }
        } else if (XMLHttpRequest.status == 404) {
          window.top.location = "/supply/404.html";
        } else if (XMLHttpRequest.status == 500) {
          window.top.location = "/supply/500.html";
        } else {
          if (result.appcode == 0) {
            BUI.Message.Alert(result.databuffer || "", 'error');
          }
        }
      },
      complete: function () {
        //alert("complete");
        //loadingHide();
      },
      beforeSend: function () {
        //alert("beforeSend");
        //return loadingShow(true);
      },
      success: function (result, textStatus) {
      }
    };
    return content;
  };
  /**
   * 数据加载器错误处理
   */
  $.storeErrorHander = function (e) {
    if (e.error.jqXHR.status == 401) {
      BUI.Message.Alert(result.databuffer || "", function () {
        var aContent = $.AjaxContent();
        aContent.type = "POST";
        aContent.url = $.scmServerUrl + "account/user/logout/";
        aContent.success = function () {
          if (window.location.origin.indexOf('tairanmall.com') != -1) {
            var redirectUrl = window.location.origin + "/supply/selectChannel.html";
            window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
          } else {
            window.location.href = '/supply/login.html';
          }
          localStorage.clear();
        };
        $.ajax(aContent);
        this.close();
      }, 'error');
    } else if (e.error.jqXHR.status == 403) {
      if (window.location.origin.indexOf('tairanmall.com') != -1) {
        var redirectUrl = window.location.origin + "/supply/selectChannel.html";
        window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
      } else {
        window.location.href = '/supply/login.html';
      }
    } else if (e.error.jqXHR.status == 404) {
      window.top.location = "/supply/404.html";
    } else if (e.error.jqXHR.status == 500) {
      window.top.location = "/supply/500.html";
    } else {
      var result = "";
      if (e.error.jqXHR.responseText) {
        result = e.error.jqXHR.responseText;
        if (!(result instanceof Object)) {
          try {
            result = JSON.parse(result);
          } catch (e) {

          }
        }
        if (result.appcode == 0) {
          BUI.Message.Alert(result.databuffer || "", 'error');
        }
      }
    }
  },
    /**
     * 去掉字符串右边的空格
     * @param s
     * @returns {*}
     */
    $.trimRight = function trimRight(s) {
      if (s == null) return "";
      var whitespace = new String(" \t\n\r");
      var str = new String(s);
      if (whitespace.indexOf(str.charAt(str.length - 1)) != -1) {
        var i = str.length - 1;
        while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1) {
          i--;
        }
        str = str.substring(0, i + 1);
      }
      return str;
    };
  /**
   * Select列表自动填充基类函数
   * @param specCode 需要返回特殊字段
   * @param selectId
   * @param result
   * @param valueName
   * @param keshiName
   * @param isNoDefault
   * @constructor
   */
  $.AddItem = function (selectId, result, valueField, nameField, isNoDefault, specCode) {
    var select = $('#' + selectId);
    select.html('');
    if (specCode) {
      select.append($('<option value="' + specCode + '"' + '>全部</option' + '>'));
    } else {
      if (isNoDefault) {
        select.append($('<option value=""' + '>全部</option' + '>'));
      }
    }
    if (result != undefined && result.length != 0) {
      for (var i = 0; i < result.length; i++) {
        var option = $('<option value="' + result[i][valueField] + '">' + result[i][nameField] + '</option' + '>');
        select.append(option);
      }

    }
  };


  /**
   *
   * @param selectId 下拉框ID
   * @param result 数据列表
   * @param valueField 值对应的字段
   * @param nameField 名称应的字段
   * @param initText 生成下拉框第一项名称
   * @param extValueFields 扩展字段数组,如["name", "age"]，扩展字段和值会作为option标签的属性
   * @constructor
   */
  $.AddItem2 = function (selectId, result, valueField, nameField, initText, extValueFields) {
    var select = $('#' + selectId);
    select.html('');
    select.append($('<option value=""' + '>' + initText + '</option' + '>'));
    if (result != undefined && result.length != 0) {
      for (var i = 0; i < result.length; i++) {
        //var option = $('<option value="'+result[i][valueField]+'" extValue="'+result[i][extValueField]+'">'+result[i][nameField]+'</option'+'>');
        var option = $('<option value="' + result[i][valueField] + '">' + result[i][nameField] + '</option' + '>');
        if (extValueFields) {
          for (var j = 0; j < extValueFields.length; j++) {
            option.attr(extValueFields[j], result[i][extValueFields[j]]);
          }
        }
        select.append(option);
      }
    }
  };
  $.AddItem3 = function (selectId, result, nameField, initText, extValueFields) {
    var select = $('#' + selectId);
    select.html('');
    select.append($('<option value=""' + '>' + initText + '</option' + '>'));
    if (result != undefined && result.length != 0) {
      for (var i = 0; i < result.length; i++) {
        //var option = $('<option value="'+result[i][valueField]+'" extValue="'+result[i][extValueField]+'">'+result[i][nameField]+'</option'+'>');
        var option = $('<option value="' + i + '">' + result[i][nameField] + '</option' + '>');
        if (extValueFields) {
          for (var j = 0; j < extValueFields.length; j++) {
            option.attr(extValueFields[j], result[i][extValueFields[j]]);
          }
        }
        select.append(option);
      }
    }
  };

  /**
   * 判断对象是否为空,返回对应值
   * @param value
   * @returns {boolean}
   */
  $.IsNull = function (value) {
    if (value == undefined || value == null || value == '' || value == '-1') {
      return '';
    }
    return value;
  };
  /**
   * 判断对象是否为空,返回布尔值
   * @param value
   * @returns {boolean}
   */
  $.BooleanValue = function (value) {
    if (value == undefined || value == null || value == '' || value == '-1') {
      return true;
    }
    return false;
  };
  /**
   * 根据身份证判断性别
   * @param psidno
   * @returns {*}
   * @constructor
   */
  $.Getsex = function (psidno) {
    var sexno, sex
    if (psidno.length == 18) {
      sexno = psidno.substring(16, 17)
    } else if (psidno.length == 15) {
      sexno = psidno.substring(14, 15)
    } else {
      alert("错误的身份证号码，请核对！")
      return false
    }
    var tempid = sexno % 2;
    if (tempid == 0) {
      sex = '2'
    } else {
      sex = '1'
    }
    return sex
  };
  /**
   * 验证身份证
   * @param psidno
   * @returns {*}
   * @constructor
   */
  $.checkIdCardNo = function (idCardNo) {
    //15位和18位身份证号码的基本校验
    var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
    return check;
  };
  /**
   * 转换星期
   * @param day
   * @returns {*}
   */
  $.getWeek = function (day) {
    if (day == "0") {
      return "星期日";
    } else if (day == "1") {
      return "星期一";
    } else if (day == "2") {
      return "星期二";
    } else if (day == "3") {
      return "星期三";
    } else if (day == "4") {
      return "星期四";
    } else if (day == "5") {
      return "星期五";
    } else if (day == "6") {
      return "星期六";
    } else {
      return "错误数据";
    }
  };
  /**
   * json转str
   * @param obj
   * @returns {string}
   * @constructor
   */
  $.JsonToStr = function (obj) {
    var str = '{'
    for (var s in obj) {
      str += '"' + s + '":';
      str += '"' + obj[s] + '",';
    }
    str += '"a":"1"}';

    return str;
  };
  /**
   * 判断是否为空,返回"无"
   * @param value
   * @returns {boolean}
   */
  $.keyIsNull = function (value) {
    if (value == undefined || value == null || value == '' || value == "null") {
      return '<span style=\"visibility: hidden">占占</span>';
    }
    return value;
  };

  /**
   *日期转字符串
   * @param dateStr Date格式日期
   * @param splitStr 日期分隔符,如 2016-07-09 的分隔符是"-"
   * @return 字符串格式日期,格式yyyy-mm-dd
   */
  $.dateToString = function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;//获取当前月份的日期
    var d = date.getDate();
    return y + "-" + m + "-" + d;
  };

  /**
   * 字符串转日期
   * @param dateStr 日期字符串
   * @param splitStr 日期分隔符,如 2016-07-09 的分隔符是"-"
   * @return Date格式日期
   */
  $.strToDate = function (dateStr, splitStr) {
    var array = dateStr.split(splitStr);
    var year = array[0];// 年
    var month = parseInt(array[1]) - 1;// 月
    var day = parseInt(array[2]);// 日
    return new Date(year, month, day)
  };
  /**
   * 日期加减
   * @param dateStr 日期字符串,格式yyyy-mm-dd
   * @param days 整数
   * @returns {Date}
   */
  $.dateDiff = function (dateStr, days) {
    var dd = $.strToDate(dateStr, "-");
    dd.setDate(dd.getDate() + days);//获取AddDayCount天后的日期
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;//获取当前月份的日期
    var d = dd.getDate();
    return y + "-" + m + "-" + d;
  };
  /**
   * 时间戳转日期字符串
   * @param _timestamp, 10位数字的时间戳
   * @return {string}
   */
  $.timestampToDateStr = function (_timestamp) {
    var now = new Date(_timestamp);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    return year + "-" + month + "-" + date;
  };
  /**
   * json转字符串
   */
  $.JsonToStr = function (obj) {
    var str = '{'
    for (var s in obj) {
      str += '"' + s + '":';
      str += '"' + obj[s] + '",';
    }
    str += '}';
    return str;
  };
  //设置radio选中，name:radio表单name，val：默认选中值
  $.setRadioChecked = function (name, val) {
    var radios = document.getElementsByName(name);
    for (var i = 0; i < radios.length; i++) {//循环
      if (radios[i].value == val) {  //比较值
        radios[i].checked = true; //修改选中状态
        break; //停止循环
      }
    }
  };
  /**
   * 设置下拉菜单，name:下拉表单name, val:选中值
   */
  $.setSelectItem = function (name, val) {
    setTimeout(function () {
      var arryList = document.getElementById(name).options;
      for (var i = 0; i < arryList.length; i++) {//循环
        if (arryList[i].value == val) {//比较值
          arryList[i].selected = true;//修改选中状态
          break;//停止循环
        }
      }
    }, 100);
  };
  /**
   * 判断数字是否为空
   */
  $.validNum = function (val) {
    if (val == undefined || val == "" || val == "0") {
      return false;
    }
    return true;
  };
  /***
   * 设置是否生效单选框
   * @param val
   */
  $.setValid = function (val) {
    if (val == "1") {
      $("#isValid").prop("checked", "checked");
    } else if (val == "0") {
      $("#isValid2").prop("checked", "checked");
    }
  };

  /**
   * 根据key值获取url参数
   * @param key
   */
  $.getUrlParam = function (key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  };
  $.getUrlParamdecode = function (key) {
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");
    var r = decodeURIComponent(window.location.search).substr(1).match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  };
  /**
   * 设置form表单字段
   * @param obj
   */
  $.setFormFieldValue = function (obj) {
    for (var key in obj) {
      $('input[name="' + key + '"]').val(obj[key]);
    }
  };

  /**
   *检查重复
   * @param url 查询url
   * @param fieldId 字段ID
   * @param param 查询参数
   * @param msg 提示信息
   */
  $.checkRepat = function (url, _field, param, msg) {
    var val = _field.val();
    if (val == "") {
      return false;
    }
    var aContent = $.AjaxContent();
    aContent.url = url;
    aContent.data = param;
    aContent.success = function (result, textStatus) {
      if (result.appcode != 1) {
        BUI.Message.Alert(result.databuffer, "error");
      } else {
        var dictTypes = result.result;
        if (dictTypes) {
          if (dictTypes.length > 0) {
            BUI.Message.Alert(msg, "warning");
            _field.val("");
          }
        }
      }
    };
    $.ajax(aContent);
  };
  /**
   * 检查上传状态
   * @return {boolean}
   */
  $.checkUploadStatus = function () {
    var uploadStatusFileds = $('input[name="uploadStatusFiled"]');
    if (uploadStatusFileds.length > 0) {
      $.hideLoadMask();
      BUI.Message.Alert("文件正在上传,请确认上传完成后再提交!", "warning");
      return false;
    }
    return true;
  }

  /**
   *  <img /> 标签  onclick=" $.showImg(this); 可弹出查看大图dialog
   * @param img <img >
   */
  $.showImg = function (img) {
    BUI.use(['bui/overlay'], function (Overlay) {
      var dialog = new Overlay.Dialog({
        title: '图片查看',
        width: "1200",
        height: "800",
        buttons: []
      });
      dialog.set("bodyContent", '<div style="text-align: center; height: 100%;"><img style="max-width:1100px;width: auto;height: 100%;" src=' + img.src.replace("_150_150", "").replace("w/150/h/150", "") + '></div>');
      dialog.show();
    });
  };
  /**
   * 日期范围校验
   * @param startDate 起始日期,格式:yyyy-mm-dd
   * @param endDate 结束日期,格式:yyyy-mm-dd
   */
  $.dateArrageCheck = function (startDate, endDate) {
    var _startDate = $.strToDate(startDate);
    var _endDate = $.strToDate(endDate);
    var _start = _startDate.valueOf();
    var _end = _endDate.valueOf();
    if (_start > _end) {
      return false;
    } else {
      return true;
    }
  };
  /**
   * 检查分类品牌启停用状态
   * @param categoryId
   * @param brandId
   */
  $.checkCategoryBrandValidStatus = function (categoryId, brandId) {
    var result = Array(2);
    var flag = false;
    var msg = "";
    var aContent = $.AjaxContent();
    var url = $.scmServerUrl + "supplier/checkCategoryBrandValidStatus/" + categoryId;
    aContent.url = url;
    aContent.async = false;
    aContent.data = { brandId: brandId };
    aContent.success = function (result, textStatus) {
      if (result.appcode != 1) {
        msg = result.databuffer;
      } else {
        flag = true;
      }
    };
    $.ajax(aContent);
    result[0] = flag;
    result[1] = msg;
    return result;
  };

  $.getMenuList = function () {
    return [
        {
            code: 101,
            text: '基础信息',
            items: [
                {code: 10101, id: 'brandList', text: '品牌管理', href: 'category/brandList.html'},
                {code: 10102, id: 'propertyList', text: '属性管理', href: 'category/propertyList.html'},
                {code: 10103, id: 'categoryList', text: '分类管理', href: 'category/categoryList.html'}
            ]
        },
        {
            code: 102,
            text: '商品管理',
            items: [
                {code: 10201, id: 'goodsList', text: '自采商品管理', href: 'goods/goodsList.html'},
                {code: 10202, id: 'externalGoodsList', text: '代发商品管理', href: 'goods/externalGoodsList.html'},
                {code: 20101, id: 'goodsQuery', text: '商品查询', href: 'goods/goodsQuery.html'}
            ]
        },
        {
            code: 201,
            text: '商品管理',
            items: [
                {code: 20101, id: 'goodsQuery', text: '商品查询', href: 'goods/goodsQuery.html'}
            ]
        },
        {
            code: 103,
            text: '供应商管理',
            items: [
                {code: 10301, id: 'supplierList', text: '供应商管理', href: 'supplier/supplierList.html'},
                {code: 20201, id: 'supplierApplyList', text: '供应商申请', href: 'supplier/supplierApplyList.html'},
                {code: 10302, id: 'supplierApplyAuditList',text: '供应商申请审批',href: 'supplier/supplierApplyAuditList.html'}
            ]
        },
        {
            code: 202,
            text: '供应商管理',
            items: [
                {code: 20201, id: 'supplierApplyList', text: '供应商申请', href: 'supplier/supplierApplyList.html'},
            ]
        },
        {
            code: 203,
            text: '采购管理',
            items: [
                {code: 20301, id: 'purchaseGroupList', text: '采购组管理', href: 'purchase/purchaseGroupList.html'},
                {code: 20302, id: 'purchaseOrderList', text: '采购单管理', href: 'purchase/purchaseOrderList.html'},
                {code: 20303, id: 'purchaseOrderAuditList',text: '采购单审核',href: 'purchase/purchaseOrderAuditList.html'},
                {code: 20304, id: 'warehouseAdviceList', text: '入库通知单管理', href: 'purchase/warehouseAdviceList.html'}
            ]
        },
        {
            code: 204,
            text: '直营管理',
            items: [
                {code: 20401, id: 'shopOrderList', text: '订单管理', href: 'order/shopOrderList.html'},
                {code: 20402, id: 'supplierOrder', text: '供应商订单', href: 'order/supplierOrder.html'},
                {code: 20403, id: 'orderList', text: '发货通知单管理', href: 'order/outboundOrderList.html'},
                {code: 20404, id: 'nonOrderList', text: '拆单异常管理', href: 'order/nonOrderList.html'}
            ]
        },
        {
            code:206,
            text: '仓储管理',
            items: [
                {code: 20601, id: 'warehouseManage', text: '仓库信息管理', href: 'warehouse/warehouseManage.html'},
            ]
        },
        {
            code:106,
            text: '仓储管理',
            items: [
                {code: 10601, id: 'warehouseManage', text: '仓库信息管理', href: 'warehouse/warehouseManage.html'},
                {code: 10603, id: 'logisticsList', text: '物流公司管理', href: 'warehouse/logisticsList.html'},
                {code: 10605, id: 'storehouseList', text: '调拨单管理', href: 'storehouse/storehouseList.html'},
                {code: 10606, id: 'storehouseAuditList', text: '调拨单审核', href: 'storehouse/storehouseAuditList.html'},
                {code: 10607, id: 'storehouseAdviceList', text: '调拨出库通知单', href: 'storehouse/storehouseAdviceList.html'},
                {code: 10608, id: 'storehouseAdviceInList', text: '调拨入库通知单', href: 'storehouse/storehouseAdviceInList.html'},
            ]
        },
        {
            code: 205,
            text: '财务管理',
            items: [
                //{code: 10501, id: 'checkManage', text: '对账管理', href: 'check/checkOrderList.html'}
                {code: 20501, id: 'checkManage', text: '京东代发财务管理', href: 'check/JdFinancialMng.html'},
                {code: 20502, id: 'LyManage', text: '粮油代发报表', href: 'check/LyFinancialMng.html'}
            ]
        },
        {
            code:107,
            text: '业务设置',
            items: [
                {code: 10701, id: 'shipMents', text: '发货仓库匹配', href: 'shipments/shipMentsList.html'},
            ]
        },
        {
            code: 104,
            text: '系统管理', 
            items: [
                //{code: 10401, id: 'warehouseList', text: '仓库管理', href: 'system/warehouseList.html'},
                {code: 10402, id: 'channelList', text: '业务线管理', href: 'system/channelList.html'},
                {code: 10403, id: 'userAccreditInfoList', text: '授权管理', href: 'impower/userAccreditInfoList.html'},
                {code: 10409, id: 'wmsUserAccreditInfoList', text: 'WMS授权管理', href: 'impower/wmsroleList.html'},
                {code: 10404, id: 'dictTypeList', text: '字典类型管理', href: 'config/dictTypeList.html'},
                {code: 10405, id: 'dictList', text: '字典管理', href: 'config/dictList.html'},
                {code: 10406, id: 'resourceManage', text: '资源管理', href: 'impower/resourceManage.html'},
                {code: 10410, id: 'resourceManageWms', text: 'WMS资源管理', href: 'impower/resourceManageWms.html'},
                {code: 10407, id: 'compensation', text: '开发补偿', href: 'system/compensation.html'},
                {code: 10408, id: 'warehouseConfig', text: '仓库配置管理', href: 'system/warehouseConfig.html'}
            ]
        }            
    ]

  }

  $.getShowMenu = function () {
    var showMenuList = JSON.parse(localStorage.getItem("menuConfig"));
    var menuList = $.getMenuList();
    var showMenu = [];

    //遍历菜单配置
    $.each(menuList, function (index, menuItem) {
      if ($.showAllMenu) {
        var menu = menuItem;
        var items = [];

        $.each(menuItem.items, function (index, item) {
          items.push(item);
        });
        menu.items = items;
        showMenu.push(menu);
      } else {
        //遍历需要显示的菜单配置
        $.each(showMenuList, function (index, firstMenu) {
          //如果需要显示的菜单code和菜单code相等，则遍历二级菜单
          if (firstMenu.parentCode === menuItem.code || $.showAllMenu) {
            var menu = menuItem;
            var items = [];
            $.each(menuItem.items, function (index, item) {
              if (firstMenu.codeList.indexOf(item.code) !== -1 || $.showAllMenu) {
                items.push(item);
              }
            });
            menu.items = items;
            showMenu.push(menu);
          }
        });
      }
    });

    var config = [{
      id: "menu",
      homePage: '',
      menu: showMenu
    }];
    return config;
  };



  var newMuneList = [
    {
        code: 101,
        text: '基础信息',
        expanded : true,
        children: [
            {code: 10101, id: 'brandList', text: '品牌管理', href: 'category/brandList.html'},
            {code: 10102, id: 'propertyList', text: '属性管理', href: 'category/propertyList.html'},
            {code: 10103, id: 'categoryList', text: '分类管理', href: 'category/categoryList.html'}
        ]
    },
    {
        code: 102,
        text: '商品管理',
        expanded : true,
        children: [
            {code: 10201, id: 'goodsList', text: '自采商品管理', href: 'goods/goodsList.html'},
            {code: 10202, id: 'externalGoodsList', text: '代发商品管理', href: 'goods/externalGoodsList.html'},
            {code: 20101, id: 'goodsQuery', text: '商品查询', href: 'goods/goodsQuery.html'}
        ]
    },
    {
        code: 201,
        text: '商品管理',
        expanded : true,
        children: [
            {code: 20101, id: 'goodsQuery', text: '商品查询', href: 'goods/goodsQuery.html'}
        ]
    },
    {
        code: 103,
        text: '供应商管理',
        expanded : true,
        children: [
            {code: 10301, id: 'supplierList', text: '供应商管理', href: 'supplier/supplierList.html'},
            {code: 20201, id: 'supplierApplyList', text: '供应商申请', href: 'supplier/supplierApplyList.html'},
            {code: 10302, id: 'supplierApplyAuditList',text: '供应商申请审批',href: 'supplier/supplierApplyAuditList.html'}
        ]
    },
    {
        code: 202,
        text: '供应商管理',
        expanded : true,
        children: [
            {code: 20201, id: 'supplierApplyList', text: '供应商申请', href: 'supplier/supplierApplyList.html'},
        ]
    },
    {
        code: 203,
        text: '采购管理',
        expanded : true,
        children: [
            {code: 20301, id: 'purchaseGroupList', text: '采购组管理', href: 'purchase/purchaseGroupList.html'},
            {code: 20302, id: 'purchaseOrderList', text: '采购单管理', href: 'purchase/purchaseOrderList.html'},
            {code: 20303, id: 'purchaseOrderAuditList',text: '采购单审核',href: 'purchase/purchaseOrderAuditList.html'},
            {code: 20304, id: 'warehouseAdviceList', text: '入库通知单管理', href: 'purchase/warehouseAdviceList.html'}
        ]
    },
    {
        code: 204,
        text: '直营管理',
        expanded : true,
        children: [
            {code: 20401, id: 'shopOrderList', text: '订单管理', href: 'order/shopOrderList.html'},
            {code: 20402, id: 'supplierOrder', text: '供应商订单', href: 'order/supplierOrder.html'},
            {code: 20403, id: 'orderList', text: '发货通知单管理', href: 'order/outboundOrderList.html'},
            {code: 20404, id: 'nonOrderList', text: '拆单异常管理', href: 'order/nonOrderList.html'}
        ]
    },
    // {
    //     code:206,
    //     text: '仓储管理',
    //     expanded : true,
    //     children: [
    //         {code: 20601, id: 'warehouseManage', text: '仓库信息管理', href: 'warehouse/warehouseManage.html'},
    //     ]
    // },
    {
        code:106,
        text: '仓储管理',
        expanded : true,
        children: [
              {code: 10601, id: 'warehouseManage', text: '仓库信息管理', href: 'warehouse/warehouseManage.html'},      
              {code: 10603, id: 'logisticsList', text: '物流公司管理', href: 'warehouse/logisticsList.html'},
              {code: 10605, id: 'storehouseList', text: '调拨单管理', href: 'storehouse/storehouseList.html'},
              {code: 10606, id: 'storehouseAuditList', text: '调拨单审核', href: 'storehouse/storehouseAuditList.html'},
              {code: 10607, id: 'storehouseAdviceList', text: '调拨出库通知单', href: 'storehouse/storehouseAdviceList.html'},
              {code: 10608, id: 'storehouseAdviceInList', text: '调拨入库通知单', href: 'storehouse/storehouseAdviceInList.html'},
              {code: 10609, id: 'warehouseManage', text: '仓库信息管理', href: 'warehouse/warehouseManage.html'},
              {code: 10610, id: 'warehouseManage', text: '仓间调拨管理', href: 'warehouse/warehouseManage.html'}
          ]
    },
    {
        code: 205,
        text: '财务管理',
        expanded : true,
        children: [
            //{code: 10501, id: 'checkManage', text: '对账管理', href: 'check/checkOrderList.html'}
            {code: 20501, id: 'checkManage', text: '京东代发财务管理', href: 'check/JdFinancialMng.html'},
            {code: 20502, id: 'LyManage', text: '粮油代发报表', href: 'check/LyFinancialMng.html'}
        ]
    },
    {
        code:107,
        text: '业务设置',
        expanded : true,
        children: [
            {code: 10701, id: 'shipMents', text: '发货仓库匹配', href: 'shipments/shipMentsList.html'},
        ]
    },
    {
        code: 104,
        text: '系统管理',
        expanded : true,
        children: [
            //{code: 10401, id: 'warehouseList', text: '仓库管理', href: 'system/warehouseList.html'},
            {code: 10402, id: 'channelList', text: '业务线管理', href: 'system/channelList.html'},
            {code: 10403, id: 'userAccreditInfoList', text: '授权管理', href: 'impower/userAccreditInfoList.html'},
            {code: 10409, id: 'wmsUserAccreditInfoList', text: 'WMS授权管理', href: 'impower/wmsroleList.html'},
            {code: 10404, id: 'dictTypeList', text: '字典类型管理', href: 'config/dictTypeList.html'},
            {code: 10405, id: 'dictList', text: '字典管理', href: 'config/dictList.html'},
            {code: 10406, id: 'resourceManage', text: '资源管理', href: 'impower/resourceManage.html'},
            {code: 10410, id: 'resourceManageWms', text: 'WMS资源管理', href: 'impower/resourceManageWms.html'},
            {code: 10407, id: 'compensation', text: '开发补偿', href: 'system/compensation.html'},
            {code: 10408, id: 'warehouseConfig', text: '仓库配置管理', href: 'system/warehouseConfig.html' },
            {code: 10411, id: '', text: '权限管理', href: '' },
            {code: 10412, id: '', text: '技术后台管理', href: ''}
        ]
    }            
]


 
  
  
  

  $.newGetShowMenu = function () {
    var showMenuList = JSON.parse(localStorage.getItem("menuConfig"));
    var menuList = newMuneList;
    var showMenu = [];
    var arr = []  //二级菜单和三级菜单重复的菜单code
    $.each(showMenuList, function (i, k) {
      if (k.menuNodeList ) {
        $.each(k.menuNodeList, function (j, m) {
          arr.push.apply(arr, m.codeList)
          // $.each(m.codeList, function (i1, k1) {
          //   arr.push(k1)
          // })
        })
      }
    }) 

  //遍历菜单配置
  $.each(menuList, function (index, menuItem) { //这层是遍历自定义的菜单权限json
    if ($.showAllMenu) {
        var menu = menuItem;
        var items = [];

        $.each(menuItem.items, function (index, item) {
          items.push(item);
        });
        menu.items = items;
        showMenu.push(menu);
    } else {
        $.each(showMenuList, function (index2, severFirstItem) {  //这层是遍历的从后台获取的权限code码
          var firstJson = {
                text: menuItem.text,
                expanded: true,
                href : '', //一级菜单不可以点击所以 让他链接为空
                children : []
              } 
          if (severFirstItem.parentCode == menuItem.code) {  //判断一级菜单
              var secondChildren = '' //二级菜单对象
              
              $.each(menuItem.children, function (index3, secondItem) {
      
                  if (severFirstItem.codeList.indexOf(secondItem.code) !== -1) {
                      secondChildren = secondItem
                      if (severFirstItem.menuNodeList) {  //判断是否有三级菜单
                        $.each(severFirstItem.menuNodeList, function (index4, severSecondItem) {
                            if (secondItem.code == severSecondItem.parentCode) {
                                secondChildren = secondItem
                                secondChildren.href = ''  //二级菜单对象让他的herf等于空 让他点击二级菜单标题是不会有链接
                                var children = []  //三级菜单数组对象
                                $.each(menuItem.children, function (index5, severThirdItem) {
                                      if (severSecondItem.codeList.indexOf(severThirdItem.code) !== -1) {
                                          children.push(severThirdItem)
                                      } 
                                  })
                                secondChildren.children = children;
                                secondChildren.expanded=true;
                            } 
                        })
                      }
                      firstJson.children.push(secondChildren)   
                } 
            })

            var html = []  //重新定义第二层菜单 去掉三级和二级重复的菜单
            if (firstJson.children.length > 0) {
              $.each(firstJson.children, function (i, k) {
                if (arr.indexOf(k.code) == -1) {
                     html.push(k)
                  }
              }) 
            }
              firstJson.children = html
              showMenu.push(firstJson)
          } 
      })
    }
  });  
  return showMenu;
};


  $.showLogsDialog = function (url) {

    BUI.use(['bui/overlay'], function (Overlay) {
      var columns = [
        { title: '动作', dataIndex: 'operation', width: '200' },
        { title: '操作人', dataIndex: 'operator', width: '180' },
        { title: '操作时间', dataIndex: 'operateTime', width: '180', renderer: BUI.Grid.Format.datetimeRenderer },
        { title: '备注', dataIndex: 'remark', width: '130' },
        { title: '', dataIndex: '', width: '20' }
      ];

      var props = {
        render: "logsGrid", //渲染grid的div的id
        dataUrl: $.scmServerUrl + url,
        columns: columns, //列定义数字
        autoLoad: true, //自动加载数据：true/false
        pageSize: 10,	// 配置分页数目
        pagingBar: "logsBar", //是否分页：true/false
        storeParams: {},
        primaryKey: "id", //数据主键Id
        handlerCollections: [],
        height: 460
      };


      new Overlay.Dialog({
        title: '操作日志',
        closeable: false,
        closeAction: "remove",
        bodyContent: '<div id="logsGrid" class="span18 row"></div><div id="logsBar" class="bui-grid row"></div>',
        buttons: [{
          text: '确定',
          elCls: 'button button-primary',
          handler: function () { //do some thing
            this.close();
          }
        }],
        footerStyle: { "border": "0", "padding-top": "0" },
        elCls: "dialogTop10"
      }).show();
      var myGrid = new GridExt(props);
      myGrid.createGrid();
    });
  };
})(jQuery);