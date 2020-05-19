/**
 * 参数：paramDict
 * {
        render : "grid", //渲染grid的div的id
        formRender:"form",//查询条件的所在的form渲染的div的id
        queryBtnRender:"query_btn",//查询触发按钮的id
   		dataUrl: "http://localhost:8080/xxx.json",  //store数据地址，这个参数和下面的store只能出现一个
   		store: store, //数据存储store对象
  	    columns: [], //列定义数字
  	    plugins: ["RadioSelection", "CheckSelection"], //表格插件: 比如RadioSelection表示单选按钮，对应Grid.Plugins.RadioSelection,  CheckSelection表示多选选按钮，对应Grid.Plugins.CheckSelection, 
        autoLoad: true, //自动加载数据：true/false
        pageSize: 10,	// 配置分页数目
        remoteSort:true, //是否远程排序：true/false
        pagingBar: "barid", //分页所在容器id：为空时不显示分页
        pagingBarArr: [10,20,50,100], //分页select需要显示的选项内容，默认[10,20,50,100,200]
        storeParams:{"flag":"1"},//分页查询外加参数
        width:"100%",//表格宽度
        height:"100%",//表格高度
        primaryKey: "", //数据主键Id
	     extColums: [//拓展列，主要用来做一些列里面可以操作和跳转页面等操作性功能,每个操作对应一个列
	    	{
	    		title: "列标题", 
	    		column:"name",//对应列字段
	    		confirm:"0", //是否弹出确认窗口:0-否,1-是
	    		operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
	    		submitUrl: "http://localhost:8080/test/test.do", //提交后台地址, 当 operateType=0时不能为空
	    		redictUrl: "", //页面跳转地址, 当 operateType=1时不能为空
	    		params:["name","sex"]//url参数数组。参数名称必须是store中record里包含的。当数据为空时，表示传所有record中的参数
	    	},
        	....
          ],
        handlerColumnTitle:"操作",//操作栏标题
        handlerCollections: [
        	//操作列集合，主要用来做一些列里面可以操作和跳转页面等操作性功能。
        	 //不同用于extColums，extColums每个操作对应一个列，handlerCollections中所有操作都在一个列里面
        	{
        		name: "新增", //操作名称,当nameType=0时是定值,当nameType=1时是列对应的key
        		relyField : {"fieldName":"字段名称", "fieldValue":"字段值"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
        		confirm:"0", //是否弹出确认窗口:0-否,1-是,2-弹出框的信息，需要查询数据库拼接
        		option:{ 当confirm为2时 ，需要跳转的信息  GET
					submitUrl:url, //请求地址
                            },
        		operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
        		submitUrl: "http://localhost:8080/test/test.do", //提交后台地址, 当 operateType=0时不能为空
        		ajaxMethod:"GET",//ajax提交方法
        		redictUrl: "", //页面跳转地址, 当 operateType=1时不能为空
        		params:["name","sex"]//url参数数组。参数名称必须是store中record里包含的。当数据为空时，表示传所有record中的参数
                fatherId:["idName"], //有id 不存在的时候，强制替换 id
        	},
        	{
        		name: "name", //操作名称,当nameType=0时是定值,当nameType=1时是列对应的key
        		relyField : {"fieldName":"字段名称", "fieldValue":"字段值"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
        		option:{ 当confirm为2时 ，需要跳转的信息

                            },
        		confirm:"0", //是否弹出确认窗口:0-否,1-是,2-弹出框的信息，需要查询数据库拼接
        		operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
        		submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
        		ajaxMethod:"GET",//ajax提交方法
        		redictUrl: "http://www.baidu.com", //页面跳转地址, 当 operateType=1时不能为空
        		params:["name","sex"]//url参数数组。参数名称必须是store中record里包含的。当数据为空时，表示传所有record中的参数
        	},
        	....
        ] 
   }
 */
function GridExt(paramDict) {
    this.render = paramDict['render'];
    this.formRender = paramDict['formRender'];
    this.queryBtnRender = paramDict['queryBtnRender'];
    this.resetBtnRender = paramDict['resetBtnRender'];
    this.dataUrl = paramDict['dataUrl'];
    this.store = paramDict['store'];
    this.columns = paramDict['columns'];
    this.plugins = paramDict['plugins'];
    this.autoLoad = paramDict['autoLoad'];
    this.pageSize = paramDict['pageSize'];
    this.remoteSort = paramDict['remoteSort'];
    this.pagingBar = paramDict['pagingBar'];
    this.pagingBarArr = paramDict['pagingBarArr'];
    this.jumpToPageCallBack = paramDict['jumpToPageCallBack'];
    this.storeParams = paramDict['storeParams'];
    this.width = paramDict['width'];
    this.height = paramDict['height'];
    this.primaryKey = paramDict['primaryKey'];
    this.extColums = paramDict['extColums'];
    this.handlerColumnTitle = paramDict['handlerColumnTitle'];
    this.handlerCollections = paramDict['handlerCollections'];
    this.relyField = paramDict['relyField'];
    this.height = paramDict['height'];
    this.emptyDataTpl = paramDict['emptyDataTpl'];
    this.onCellClick=paramDict['onCellClick'];
}


/**
 * 创建gird
 */
GridExt.prototype.createGrid = function () {
    var _self = this;
    BUI.use(['bui/grid', 'bui/data', 'bui/toolbar', 'bui/form', 'common/pagingbarext'], function (Grid, Data, Toolbar, Form, PagingBarExt) {
        var Grid = Grid, Store = Data.Store;
        /**
         * 创建Data数据源
         */
        /*var store = new Store({
            url : _self.dataUrl,
            autoLoad : _self.autoLoad, // 自动加载数据
            pageSize : _self.pageSize, // 配置分页数目
            remoteSort : _self.remoteSort, //配this置远程排序
            params : _self.storeParams //分页查询外加参数
        });*/

        var store;
        if (_self.store) {
            store = _self.store;
        } else {
            store = new Store({
                url: _self.dataUrl,
                autoLoad: _self.autoLoad,// 自动加载数据
                proxy: {
                    method: 'get',
                    dataType: 'json', //返回数据的类型
                    limitParam: 'pageSize', //一页多少条记录
                    pageIndexParam: 'pageNo', //页码
                    startParam: 'start', //起始记录
                    pageStart: 1 //页面从1开始
                },
                pageSize: _self.pagingBarArr ? _self.pagingBarArr[0] : _self.pageSize,  // 配置分页数目
                root: 'result',
                totalProperty: 'totalCount',
                remoteSort: _self.remoteSort, //配this置远程排序
                params: _self.storeParams //分页查询外加参数
            });
            store.on("exception", function (e) {

                if (e.error.jqXHR.status == 401) {
                    window.top.location = "/supply/401.html";
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
                }else {
                    var result = "";
                    if (e.error.jqXHR.responseText) {
                        result = e.error.jqXHR.responseText;
                        if (!(result instanceof Object)) {
                            try {
                                result = JSON.parse(result);
                            } catch (e) {

                            }
                        }
                        if (result.appcode==0) {
                            BUI.Message.Alert(result.databuffer || "", 'error');
                        }
                    }
                }

            })
            // store.( e )
            _self.store=store;
        }

        if (_self.columns) {
            $.each(_self.columns, function (index, item) {
                item.sortable = false;
            })
        }


        /**
         * 生成拓展列方法
         */
        var extColumsFuncs = [];
        if (_self.extColums) {
            var columns = new Array();
            for (var i = 0; i < _self.extColums.length; i++) {
                var column = _self.extColums[i];
                var funcName = "column" + i;
                var columnTitle = column["title"];
                var columnKey = column["column"];
                var width = column["width"];
                column['funcName'] = funcName;
                extColumsFuncs.push(column);
                var _cls = "grid-command " + funcName;
                var handColumn = {
                    sortable: false,
                    title: columnTitle,
                    dataIndex: columnKey,
                    width: width,
                    elCls: 'left',
                    renderer: function (value, obj) {
                        return '<span class="' + _cls + '">' + value + '</span>';
                    }
                };
                columns.push(handColumn);
            }
            /*
             * 将_self.columns中列放入新数组中,此操作目的是将添加的扩展列放到前面显示
             */
            for (var i = 0; i < _self.columns.length; i++) {
                var column = _self.columns[i];
                columns.push(column);
            }
            _self.columns = columns;
        }


        /**
         * 生成操作栏方法
         */
        /**
         * 生成操作栏方法
         */
        var handlerFuncs = []; //操作方法数组
        if (_self.handlerCollections) {
            for (var i = 0; i < _self.handlerCollections.length; i++) {
                var handlerItem = _self.handlerCollections[i];
                var funcName = "hander" + i;
                handlerItem['funcName'] = funcName;
                handlerFuncs.push(handlerItem);
            }

            if (_self.handlerCollections.length > 0) {
                var handColumn = {
                    sortable: false,
                    title: _self.handlerColumnTitle,
                    dataIndex: 'd',
                    elCls: 'center',
                    renderer: function (value, obj) {
                        var handStr = "";
                        var noCollections = true;
                        for (var i = 0; i < _self.handlerCollections.length; i++) {
                            var handlerItem = _self.handlerCollections[i];
                            var funcName = "hander" + i;
                            var _cls = "grid-command " + funcName;
                            var relyField = handlerItem.relyField;
                            if (isEmptyJson(relyField)) {
                                handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                                noCollections = false;
                            } else {
                                var fieldName = relyField.fieldName;
                                var fieldName2 = relyField.fieldName2;
                                var fieldName3 = relyField.fieldName3;
                                var fieldName4 = relyField.fieldName4;
                                var fieldValue = relyField.fieldValue;
                                var fieldValue2 = relyField.fieldValue2; 
                                var fieldValue3 = relyField.fieldValue3; 
                                var fieldValue4 = relyField.fieldValue4;                                                                                 
                                var record = eval(obj);
                                if(fieldName3){   
                                    if(fieldName2){
                                        if(fieldValue3 == record[fieldName3]&&fieldValue2== record[fieldName2]){
                                            handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                                            noCollections = false;
                                        }
                                    }
                                    else if (fieldValue == record[fieldName]||(fieldValue3 == record[fieldName3]&&fieldValue4!= record[fieldName4])) {
                                        handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                                        noCollections = false;
                                    }  
                                }else{
                                    if(fieldValue == record[fieldName]){
                                        handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                                        noCollections = false;
                                    }  
                                }     
                                /*var fieldName = relyField.fieldName;
                                var fieldValue = relyField.fieldValue;
                                var record = eval(obj);
                                if (fieldValue == record[fieldName]) {
                                    handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                                    noCollections = false;
                                }  */                                                                                                                 
                            }
                        }

                        if (noCollections) {
                            handStr += '<span>--</span>';
                        }

                        return handStr;
                    }
                };
                _self.columns.push(handColumn);
            }
        }

        /**
         * 判断表格是否有插件
         */
        /*var plugins = [];
        if(_self.plugins.length > 0){//添加表格插件
            for(var i=0; i<_self.plugins.length; i++){
                if(_self.plugins[0] == "RadioSelection"){ //表格添加单选按钮
                    plugins.push(Grid.Plugins.RadioSelection);
                }else if(_self.plugins[0] == "CheckSelection"){ //表格添加多选按钮
                    plugins.push(Grid.Plugins.CheckSelection);
                }
            }
        }
        console.log(plugins)*/
        /**
         * 创建grid表格
         */
        var config = {
            render: '#' + _self.render,
            columns: _self.columns,
            loadMask: true, // 加载数据时显示屏蔽层
            store: store,
            width: "100%",
            emptyDataTpl: '<div class="centered"><h2>' + (_self.emptyDataTpl ? _self.emptyDataTpl : (_self.emptyDataTpl == "" ? "" : "无数据")) + '</h2></div>',
            // 底部工具栏
            // bbar: {
            //     pagingBar: _self.pagingBar
            // },
            plugins: _self.plugins
        };
        if (_self.height) {
            config.height = _self.height;
        }

        var grid = new Grid.Grid(config);
        _self.grid=grid;

        grid.on('cellclick', function (ev) {
            var record = ev.record, //点击行的记录
                target = $(ev.domTarget); //点击的元素
            record.isClose = true;
            record.brandNames = '';
            if (target.hasClass('add-tab')) {
                var config = {
                    title: "供应商详情",
                    href: "supplier/supplierDetail.html?hideLogs=true&flag=1&" + $.param(record)
                };
                window.parent.addTab(config)
            }

            if (_self.onCellClick) {
                _self.onCellClick(ev);
            }

        });

        if (_self.pagingBar) {
            _self.bar = new PagingBarExt({
                render: "#" + _self.pagingBar,
                elCls: 'bui-pagingbar bui-bar',
                store: store,
                pagingBarArr: _self.pagingBarArr ? _self.pagingBarArr : [10, 20, 50, 100, 200],
                jumpToPageCallBack: _self.pagingBarArr ? _self.jumpToPageCallBack : function () {}
            }).render();
        }


        grid.render();
        //移除空列头
        $(".bui-grid-hd-empty").remove();

        //移除空列
        grid.on("aftershow", function () {
            $(".bui-grid-cell-empty").each(function (index, element) {
                $(element).remove();
            });
        });

        /**
         * 添加操作触发事件
         */
        if (handlerFuncs.length > 0) {
            grid.on("cellclick", function (ev) {
                var css = ev.domTarget.className;
                var record = ev.record;
                for (var i = 0; i < handlerFuncs.length; i++) {
                    var handlerFunc = handlerFuncs[i];
                    var _cls = "grid-command " + handlerFunc.funcName;
                    var operateType = handlerFunc.operateType; //操作类型: 0-ajax提交后台, 1-页面跳转
                    var confirm = handlerFunc.confirm; //是否弹出确认窗口:0-否,1-是
                    if (ev.domTarget.className == _cls) {
                        handlerInvoke(handlerFunc, record, store, _self.storeParams);
                    }
                }
            });
        }

        /**
         * 添加扩展列触发事件
         */
        if (extColumsFuncs.length > 0) {
            grid.on("cellclick", function (ev) {
                var css = ev.domTarget.className;
                var record = ev.record;
                for (var i = 0; i < extColumsFuncs.length; i++) {
                    var column = extColumsFuncs[i];
                    var _cls = "grid-command " + column.funcName;
                    var operateType = column.operateType; //操作类型: 0-ajax提交后台, 1-页面跳转
                    var confirm = column.confirm; //是否弹出确认窗口:0-否,1-是
                    var curCls = ev.domTarget.className;
                    if (!curCls) {//如果表格里内容的class为空，那么取父类dom的class
                        curCls = $(ev.domTarget).parent().attr("class");
                    }
                    if (curCls == _cls) {
                        handlerInvoke(column, record, store, _self.storeParams);
                    }
                }
            });
        }

        /**
         * 查询条件Form表单处理
         */
        if (_self.formRender != "") {
            var form = new Form.HForm({
                srcNode: '#' + _self.formRender,
                defaultChildCfg: {
                    validEvent: 'blur' //移除时进行验证
                }
            });
            form.render();

            //点击查询按钮
            $("#" + _self.queryBtnRender).on("click", function () {
                if (form.isValid()) {
                    var formData = form.serializeToObject();
                    //将store的附加查询参数带上
                    for (var key in _self.storeParams) {
                        formData[key] = _self.storeParams[key];
                    }
                    store.load(form.serializeToObject(), function () {
                        _self.bar.jumpToPage(1);
                    });

                }
            });
            $("#" + _self.resetBtnRender).on("click", function () {
                form.clearErrors()
                form.clearFields()
            });

        }
    });

}

function handlerInvoke(handlerFunc, record, store, storeParams) {
    var operateType = handlerFunc.operateType;
    var confirm = handlerFunc.confirm; //是否弹出确认窗口:0-否,1-是
    var ajaxMethod = handlerFunc.ajaxMethod;//ajax提交方法
    var params = {};
    //组装url参数
    if (handlerFunc.params) {
        if (handlerFunc.params.length > 0) {
            for (var i = 0; i < handlerFunc.params.length; i++) {
                params[handlerFunc.params[i]] = record[handlerFunc.params[i]];
            }
        } else {
            params = record;
        }
    } else {
        params = record;
    }
    //将附加查询参数添加到参数params中
    for (var key in storeParams) {
        params[key] = storeParams[key]
    }

    //新增2，用于处理授权有关状态，查询收影响的个数
    if (confirm != undefined && confirm == "2") { //现在需要一个在该之前查询 当前使用该角色的用户数量  所以confirm==3，是一个ajax查询之后的，再次ajax请求
        var aContent = $.AjaxContent();
        aContent.url = handlerFunc.optionTemp.submitUrlTemp;
        aContent.data = {roleId: params.id};//角色id去查询用户数量
        /*if (ajaxMethod) {
            aContent.type = ajaxMethod;
        }*/
        aContent.success = function (result, textStatus) {
            if (result.appcode != 1) {
                alert(result.databuffer);
            } else {
                if (params.isValid == '1') {

                    var msg = '您确认要停用吗？';
                    if (result.result != 0) {
                        msg += '<br><label style="color:red;">当前有' + result.result + '个用户正在使用该角色，停用后这些用户对应的权限也将失效！</label>';
                    }
                    BUI.Message.Confirm(msg, function () {
                        excute(operateType, handlerFunc, params, store);
                    }, 'question');

                }
                if (params.isValid == '0') {
                    var msg = '您确认要启用吗？';
                    if (result.result != 0) {
                        msg += '<br><label style="color:red;">当前有' + result.result + '个用户将要启用该角色，启用后这些用户对应的权限也将有效！</label>';
                    }
                    BUI.Message.Confirm(msg, function () {
                        excute(operateType, handlerFunc, params, store);
                    }, 'question');
                }

            }
        };        
        $.ajax(aContent);
        return;
    }

    if (confirm != undefined && confirm == "1") {
        var msg = "您确认要" + handlerFunc.name + "吗?";
        if (handlerFunc.msg) {
            msg += '<br><label style="color: #999999;">' + handlerFunc.msg + '</label>';
        }
        BUI.Message.Confirm(msg, function () {
            excute(operateType, handlerFunc, params, store);
        }, 'question');
    } else {
        excute(operateType, handlerFunc, params, store);
    }

}

function excute(operateType, handlerFunc, record, store) {
    if (handlerFunc.fatherId) {
        record.id = record[handlerFunc.fatherId]
    }
    if (operateType == "0") {
        $.showLoadMask();
        $.ajax({
            type: handlerFunc.ajaxMethod,
            url: handlerFunc.submitUrl + '/' + record.id,
            data: record,
            success: function (result) {
                /* result = eval('(' + result + ')');*/
                if (result.appcode == 1) {
                    BUI.Message.Alert(result.databuffer, 'info');
                    store.load();
                } else {
                    BUI.Message.Alert(result.databuffer, 'warning');
                }
            },
            error:function(XMLHttpRequest){
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
                    BUI.Message.Alert(result.databuffer || "",function(){
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
                    },'error');
                } else if (XMLHttpRequest.status == 403) {
                    if (result.appcode == 0) {
                        if (window.location.origin.indexOf('tairanmall.com') != -1) {
                            var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                            window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                        } else {
                            window.location.href = '/supply/login.html';
                        }
                    }
                } else if (XMLHttpRequest.status == 404) {
                    window.top.location = "/supply/404.html";
                } else if (XMLHttpRequest.status == 500) {
                    window.top.location = "/supply/500.html";
                } else {
                    if (result.appcode == 0) {                     
                        BUI.Message.Alert(result.databuffer || "", function(){
                            location.reload();
                        },'error');
                    }
                }
            },
            complete : function () {
                $.hideLoadMask();
            }

        });
    } else if (operateType == "1") {
        var param = jsonToUrlParam(record);
        if (handlerFunc.redictUrl.indexOf("?") > -1) {//url是否已经带有参数
            window.location.href = handlerFunc.redictUrl + "&" + encodeURI(param);
        } else {
            window.location.href = handlerFunc.redictUrl + "?" + encodeURI(param);
        }
    }
}


/**
 * json数据转url参数格式
 * @param {} json
 */
function jsonToUrlParam(json) {
    var urlParam = "";
    for (var key in json) {
        urlParam += key + "=" + json[key] + "&"
    }
    return urlParam;
}

/**
 * 创建操作栏列
 * @param {} _self
 * @param {} columnTitle 列标题
 * @return {}
 */
function createHandlerColumns(_self, handlerFuncs, columnVal) {
    var handStr = "";
    for (var i = 0; i < _self.handlerCollections.length; i++) {
        var handlerItem = _self.handlerCollections[i];
        var funcName = "hander" + i;
        handlerItem['funcName'] = funcName
        handlerFuncs.push(handlerItem);
        var _cls = "grid-command " + funcName;
        var nameType = handlerItem["nameType"];
        var text = _self.handlerCollections[i].name;
        if (nameType) {
            if (nameType == "1") {
                text = columnVal;
            }
        }
        handStr += '<span class="' + _cls + '">' + text + '</span>';
    }
    return handStr;
}

/**
 * 判断json格式对象为空
 * @param obj
 * @returns {boolean}
 */
function isEmptyJson(obj) {
    if (obj) {
        if (null == obj || "" == obj) {
            return true;
        }
        if (JSON.stringify(obj) == '{}') {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

}