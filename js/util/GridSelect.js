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
        pagingBar: true, //是否分页：true/false
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
        		redictUrl: "", //页面跳转地址, 当 operateType=1时不能为空
        		params:["name","sex"]//url参数数组。参数名称必须是store中record里包含的。当数据为空时，表示传所有record中的参数
        	},
        	{
        		name: "name", //操作名称,当nameType=0时是定值,当nameType=1时是列对应的key
        		relyField : {"fieldName":"字段名称", "fieldValue":"字段值"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
        		option:{ 当confirm为2时 ，需要跳转的信息

                            },
        		confirm:"0", //是否弹出确认窗口:0-否,1-是,2-弹出框的信息，需要查询数据库拼接
        		operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
        		submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
        		redictUrl: "http://www.baidu.com", //页面跳转地址, 当 operateType=1时不能为空
        		params:["name","sex"]//url参数数组。参数名称必须是store中record里包含的。当数据为空时，表示传所有record中的参数
        	},
        	....
        ] 
   }
 */
function GridSelect(paramDict) {
    this.render = paramDict['render'];
    this.formRender = paramDict['formRender'];
    this.queryBtnRender = paramDict['queryBtnRender'];
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
    this.selectBtn = paramDict['selectBtn'];
    this.backBtn = paramDict['backBtn'];
    this.emptyDataTpl = paramDict['emptyDataTpl'];
}

/**
 * 创建gird
 */
           
GridSelect.prototype.createGrid = function () {
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
                // pageSize: _self.pageSize,  // 配置分页数目
                pageSize: _self.pagingBarArr ? _self.pagingBarArr[0] : _self.pageSize,  // 配置分页数目
                root: 'result',
                totalProperty: 'totalCount',
                remoteSort: _self.remoteSort, //配this置远程排序
                params: _self.storeParams //分页查询外加参数
            });
        }

        store.on("exception", function (e) {
            $.storeErrorHander(e);
        });

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
        for (var i = 0; i < _self.handlerCollections.length; i++) {
            var handlerItem = _self.handlerCollections[i];
            var funcName = "hander" + i;
            handlerItem['funcName'] = funcName
            handlerFuncs.push(handlerItem);
        }


        if (_self.handlerCollections.length > 0) {
            var handColumn = {
                title: _self.handlerColumnTitle, dataIndex: 'd', elCls: 'center', renderer: function (value, obj) {
                    var handStr = "";
                    for (var i = 0; i < _self.handlerCollections.length; i++) {
                        var handlerItem = _self.handlerCollections[i];
                        var funcName = "hander" + i;
                        var _cls = "grid-command " + funcName;
                        var relyField = handlerItem.relyField;
                        if (isEmptyJson(relyField)) {
                            handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                        } else {
                            var fieldName = relyField.fieldName;
                            var fieldValue = relyField.fieldValue;
                            var record = eval(obj);
                            if (fieldValue == record[fieldName]) {
                                handStr += '<span class="' + _cls + '">' + handlerItem.name + '</span>';
                            }
                        }
                    }
                    return handStr;
                }
            };
            _self.columns.push(handColumn);
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
        var grid = new Grid.Grid({
            render: '#' + _self.render,
            columns: _self.columns,
            loadMask: true, // 加载数据时显示屏蔽层
            store: store,
            emptyDataTpl: '<div class="centered"><h2>' + (_self.emptyDataTpl ? _self.emptyDataTpl : (_self.emptyDataTpl == "" ? "" : "无数据")) + '</h2></div>',
            // 底部工具栏
            // bbar: {
            //     pagingBar: _self.pagingBar
            // },
            jumpToPageCallBack: _self.pagingBarArr ? _self.jumpToPageCallBack : function () {},
            plugins: _self.plugins
        });

        grid.render();
        //移除空列头
        $(".bui-grid-hd-empty").remove();

        //移除空列
        grid.on("aftershow", function () {
            $(".bui-grid-cell-empty").each(function (index, element) {
                $(element).remove();
            });
        });
        if (_self.pagingBar) {
            _self.bar = new PagingBarExt({
                render: "#" + _self.pagingBar,
                elCls: 'bui-pagingbar bui-bar',
                store: store,
                pagingBarArr: _self.pagingBarArr ? _self.pagingBarArr : [10, 20, 50, 100, 200]
            }).render();
        }
        $(_self.selectBtn).on("click", function () {
            selectRecord(grid.getSelection());
        });

        $("#select_btn_item").on("click", function () {
            selectItemsRecord(grid.getSelection());
        });

        $("#select_btn_item_update").on("click", function () {
            selectItemsRecordUpdate(grid.getSelection());
        });

        $(_self.backBtn).on("click", function () {
            $.categoryBrand.dialog.close();
        });

        $("#btn_back_item").on("click", function () {
            $.purchaseOrderAddApp.dialog.close();
            // $.purchaseOrderAddApp.dialog.destroy();
        });
        $("#btn_back_item_update").on("click", function () {
            $.purchaseOrderUpdateApp.dialog.close();
            // $.purchaseOrderAddApp.dialog.destroy();
        });

        $("#btn_back_supplier").on("click", function () {
            $.supplierApplyAddApp.dialog.close();
        });

        $("#select_btn_supplier").on("click", function () {
            var record = grid.getSelection();
            if(record.length<1){
                BUI.Message.Alert("请选择供应商！", 'warning');
                return false;
            }
            $.supplierApplyAddApp.dialog.close();
            $.supplierApplyAddDetailApp.init(record[0].supplierCode);
            $.setRadioChecked('isValid', $.supplierApplyAddDetailApp._isValid);
            $.setRadioChecked('supplierKindCode', $.supplierApplyAddDetailApp._supplierKindCode);
            $.setRadioChecked('certificateTypeId', $.supplierApplyAddDetailApp._certificateTypeId);
            $.setSelectItem("province", $.supplierApplyAddDetailApp._province);//自动加载
            $("#province").trigger("onchange");
            $.setSelectItem("city", $.supplierApplyAddDetailApp._city);//自动加载
            $.setSelectItem("area", $.supplierApplyAddDetailApp._area);
            $("#supplierInfo").css("display", 'block');
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
                        handlerInvokeSelect(handlerFunc, record, store, _self.storeParams);
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
                        handlerInvokeSelect(column, record, store, _self.storeParams);
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
                var formData = form.serializeToObject();

                //将store的附加查询参数带上
                for (var key in _self.storeParams) {
                    formData[key] = _self.storeParams[key]
                }
                store.load(form.serializeToObject(), function () {
                    _self.bar.jumpToPage(1);
                });
            });

        }
    });

}

function handlerInvokeSelect(handlerFunc, record, store, storeParams) {
    var operateType = handlerFunc.operateType;
    var confirm = handlerFunc.confirm; //是否弹出确认窗口:0-否,1-是
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
                        excuteSelect(operateType, handlerFunc, params, store);
                    }, 'question');

                }
                if (params.isValid == '0') {
                    var msg = '您确认要启用吗？';
                    if (result.result != 0) {
                        msg += '<br><label style="color:red;">当前有' + result.result + '个用户将要启用该角色，启用后这些用户对应的权限也将有效！</label>';
                    }
                    BUI.Message.Confirm(msg, function () {
                        excuteSelect(operateType, handlerFunc, params, store);
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
            excuteSelect(operateType, handlerFunc, params, store);
        }, 'question');
    } else {
        excuteSelect(operateType, handlerFunc, params, store);
    }

}

function excuteSelect(operateType, handlerFunc, record, store) {
    if (operateType == "0") {
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
 * 选中后提交
 * @param {} json
 */
function selectRecord(Record) {
    // $("#categoryBrands").val(Record);
    // console.log($.categoryBrand.grid.getRecords());
    var brandIdGrid = [];
    for (var j = 0; j < $.categoryBrand.grid.getRecords().length; j++) {
        brandIdGrid.push($.categoryBrand.grid.getRecords()[j].brandId);
    }
    if (Record.length == 0) {
        BUI.Message.Alert('请选择一个品牌!','warning');
    } else {
        for (var i = 0; i < Record.length; i++) {
            for (var k = 0; k < brandIdGrid.length; k++) {
                if (Record[i].id == brandIdGrid[k]) {
                    alert(Record[i].name + "已关联该分类");
                    return;
                }
            }
            $.categoryBrand.store.addAt({brandName: Record[i].name, brandId: Record[i].id, isValid: Record[i].isValid},0);
        }
        $.categoryBrand.dialog.close();
        $.categoryBrand.dataPager.init();
    }

}

/**
 * 采购单新增：添加商品到采购订单页面
 * @param Record
 */
function selectItemsRecord(Record) {
    if (Record.length == 0) {
        BUI.Message.Alert("请选择商品！", "warning");
        //alert('请选择商品!');
        return;
    }else{
        $.purchaseOrderAddApp.dialog.close();
        for (var i = 0; i < Record.length; i++) {
            //添加数组 比较数组
            var pre = $.purchaseOrderAddApp.skuArray
            if (pre == "") {
                pre = new Array();
            }
            if (contains(pre, Record[i].skuCode)) {
                continue;
            }
            pre.push(Record[i].skuCode);
            $.purchaseOrderAddApp.skuArray = pre;
            $.purchaseOrderAddApp.store.add({
                itemName: Record[i].itemName,
                skuName:Record[i].skuName,
                skuCode: Record[i].skuCode,
                specNatureInfo : Record[i].specNatureInfo,
                itemNo: Record[i].itemNo,
                barCode : Record[i].barCode,
                brandName: Record[i].brandName,
                brandId: Record[i].brandId,
                //categoryName: Record[i].categoryName,
                categoryId: Record[i].categoryId,
                allCategoryName: Record[i].allCategoryName,
                allCategory: Record[i].allCategory,
                spuCode: Record[i].spuCode,
                warehouseItemInfoId : Record[i].warehouseItemInfoId,
                warehouseItemId: Record[i].warehouseItemId,
                isQuality:Record[i].isQuality,
                qualityDay:Record[i].qualityDay,
                shelfLifeDays:(Record[i].isQuality=="1")?Record[i].qualityDay:""
            });
        }
    }        
}

/**
 * 采购单修改：添加商品到采购订单页面
 * @param Record
 */
function selectItemsRecordUpdate(Record) {
    if (Record.length == 0) {
        BUI.Message.Alert("请选择商品！", "warning");
        return;
    }
    $.purchaseOrderUpdateApp.dialog.close();
    for (var i = 0; i < Record.length; i++) {
// bssi.sku_code,bssi.name,bssi.brand_id,bssi.category_id,bssi.brand_name,c.name AS category_name
        //添加数组 比较数组
        var pre = $.purchaseOrderUpdateApp.skuArray
        if (pre == null) {
            pre = new Array();
        }
        if (contains(pre, Record[i].skuCode)) {
            continue;
        }
        pre.push(Record[i].skuCode);
        $.purchaseOrderUpdateApp.skuArray = pre;
        $.purchaseOrderUpdateApp.store.add({
            itemName: Record[i].itemName,
            skuName:Record[i].skuName,
            skuCode: Record[i].skuCode,
            specNatureInfo : Record[i].specNatureInfo,
            itemNo: Record[i].itemNo,
            barCode : Record[i].barCode,
            brandName: Record[i].brandName,
            brandId: Record[i].brandId,
            //categoryName: Record[i].categoryName,
            categoryId: Record[i].categoryId,
            allCategoryName: Record[i].allCategoryName,
            allCategory: Record[i].allCategory,
            spuCode: Record[i].spuCode,
            warehouseItemInfoId : Record[i].warehouseItemInfoId,
            warehouseItemId: Record[i].warehouseItemId,
            isQuality:Record[i].isQuality,
            qualityDay:Record[i].qualityDay,
            shelfLifeDays:(Record[i].isQuality=="1")?Record[i].qualityDay:""
        });

    }

}

/**
 * 调拨单新增：添加商品到采购订单页面
 * @param Record
 */
function storehouseselectItemsRecord(Record) {
    if (Record.length == 0) {
        BUI.Message.Alert("请选择商品！", "warning");
        //alert('请选择商品!');
        return;
    }else{
        $.storehouseAddApp.dialog.close();
        for (var i = 0; i < Record.length; i++) {
            //添加数组 比较数组
            var pre = $.storehouseAddApp.skuArray
            if (pre == "") {
                pre = new Array();
            }
            if (contains(pre, Record[i].skuCode)) {
                continue;
            }
            pre.push(Record[i].skuCode);
            $.storehouseAddApp.skuArray = pre;
            $.storehouseAddApp.store.add({
                itemName: Record[i].itemName,
                skuName:Record[i].skuName,
                skuCode: Record[i].skuCode,
                specNatureInfo : Record[i].specNatureInfo,
                itemNo: Record[i].itemNo,
                skuNo: Record[i].skuNo,
                barCode : Record[i].barCode,
                brandName: Record[i].brandName,
                brandId: Record[i].brandId,
                inventoryType:"1",
                //categoryName: Record[i].categoryName,
                categoryId: Record[i].categoryId,
                allCategoryName: Record[i].allCategoryName,
                allCategory: Record[i].allCategory,
                spuCode: Record[i].spuCode,
                warehouseItemInfoId : Record[i].warehouseItemInfoId,
                warehouseItemId: Record[i].warehouseItemId 
            });
        };
        $.storehouseAddApp.queryInventoryNum();
    }        
}

/**
 * 调拨单修改：添加商品到采购订单页面
 * @param Record
 */
function storehouseselectItemsRecordUpdate(Record) {
    if (Record.length == 0) {
        BUI.Message.Alert("请选择商品！", "warning");
        return;
    }
    $.storehouseUpdateApp.dialog.close();
    for (var i = 0; i < Record.length; i++) {
// bssi.sku_code,bssi.name,bssi.brand_id,bssi.category_id,bssi.brand_name,c.name AS category_name
        //添加数组 比较数组
        var pre = $.storehouseUpdateApp.skuArray
        if (pre == null) {
            pre = new Array();
        }
        if (contains(pre, Record[i].skuCode)) {
            continue;
        }
        pre.push(Record[i].skuCode);
        $.storehouseUpdateApp.skuArray = pre;
        $.storehouseUpdateApp.store.add({
            itemName: Record[i].itemName,
            skuName:Record[i].skuName,
            skuCode: Record[i].skuCode,
            specNatureInfo : Record[i].specNatureInfo,
            itemNo: Record[i].itemNo,
            skuNo: Record[i].skuNo,
            barCode : Record[i].barCode,
            brandName: Record[i].brandName,
            brandId: Record[i].brandId,
            //categoryName: Record[i].categoryName,
            categoryId: Record[i].categoryId,
            allCategoryName: Record[i].allCategoryName,
            allCategory: Record[i].allCategory,
            spuCode: Record[i].spuCode,
            warehouseItemInfoId : Record[i].warehouseItemInfoId,
            warehouseItemId: Record[i].warehouseItemId 
        });
        $.storehouseUpdateApp.queryInventoryNum();
    }

}

//判断元素是否存在数组中
function contains(arr, obj) {
    //while
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
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