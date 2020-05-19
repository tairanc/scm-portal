/**
 * Created by sone on 2017/6/21.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?operateType=0&entityType=PurchaseOrder&entityId=" + $.getUrlParam("id"));
    });

    function queryLists(){

        $.purchaseOrderUpdateApp.querySuppliers();
        $.purchaseOrderUpdateApp.queryPurchaseTypeList();
        $.purchaseOrderUpdateApp.queryPayTypeList();
        $.purchaseOrderUpdateApp.queryPurchaseGroup();
        $.purchaseOrderUpdateApp.queryCurrencyType();
        //$.purchaseOrderUpdateApp.queryWarehouses();
        $.purchaseOrderUpdateApp.refundCostsTake();
        $.purchaseOrderUpdateApp.handlerPriority();
        $.purchaseOrderUpdateApp.queryCountryList();        
        setTimeout(function () {
            $.purchaseOrderUpdateApp.init()
        },500);
    }

    $.purchaseOrderUpdateApp = {

        data: null,
        dialog: null,
        grid: null,
        store: null,

        supplierCode:null,
        skuArray:new Array(),//用于存放sku的数组
        sku:null,
        warehouseInfoId: null,
        warehouseListArray:new Array(),
        purchasePersonId:null,  //定义全局的采购组员的变量用户数据回显
        warehouseCode:null,
        warehouseId:null,
        warehouseName:null,
        rmb: 'rmb',
        dollar: 'dollar',


        init:function(){
            Date.prototype.Format=function (fmt) { 
                var o = {
                    "M+": this.getMonth() + 1, //月份 
                    "d+": this.getDate(), //日 
                    "h+": this.getHours(), //小时 
                    "m+": this.getMinutes(), //分 
                    "s+": this.getSeconds(), //秒 
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                    "S": this.getMilliseconds() //毫秒 
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            };
            var id = $.getUrlParam("id")
            $.purchaseOrderUpdateApp.filePurchaseOrderForm(id); //填充采购单部分
            $.purchaseOrderUpdateApp.queryWarehouses();
            $("#warehouseName").on("focus",function(){
                // if(($.purchaseOrderUpdateApp.warehouseListArray).length>0){
                //     return;
                // }else{
                //     $.purchaseOrderUpdateApp.queryWarehouses();
                // }      
                if($(this).data("warning")){
                    BUI.Message.Alert($(this).data("warning"));
                }                                      
            });
            BUI.use(['bui/grid','bui/form','bui/tooltip','bui/data','bui/overlay'],function(Grid,Form, Tooltip,Data,Overlay){

                //建立表格
                var
                    Store = Data.Store,
                    Grid = Grid,
                    enumObj = {"1" : "选项一","2" : "选项二","3" : "选项三"},
                    columns = [
                        {sortable: false, title: '商品SKU名称', dataIndex: 'skuName', width: '150px', elCls: 'center'},
                        {sortable: false, title: '商品SPU编码', dataIndex: 'spuCode', elCls: 'center', visible: false},
                        {sortable: false, title: '商品SKU编码', dataIndex: 'skuCode', width: '150px', elCls: 'center'},
                        {sortable: false, title: '规格', dataIndex: 'specNatureInfo', width: '150px', elCls: 'center'},
                        {sortable: false, title: '货号', dataIndex: 'itemNo', width: '150px', elCls: 'center'},
                        {sortable: false, title: '条形码', dataIndex: 'barCode', width: '150px', elCls: 'center'},
                        {sortable: false, title: '品牌名称', dataIndex: 'brandName', width: '150px', elCls: 'center'},
                        {sortable: false, title: '品牌Id', dataIndex: 'brandId', elCls: 'center', visible: false},
                        {sortable: false, title: '一级分类-二级分类-三级分类', dataIndex: 'allCategoryName', width: '170px', elCls: 'center'},
                        {sortable: false, title: '所有分类', dataIndex: 'allCategory', elCls: 'center', visible: false},
                        {sortable: false, title: '分类Id', dataIndex: 'categoryId', elCls: 'center', visible: false},
                        {sortable: false, title: '仓库商品信息主键', dataIndex: 'warehouseItemInfoId', elCls: 'center', visible: false},
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'进价'+'<span id="purchasePriceD"></span>', dataIndex: 'purchasePriceD', width:'200px', elCls: 'center',
                            editor: {xtype: 'text',validator:function(value,obj){
                                if(value!="0"){
                                    var reg = new RegExp(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/);
                                    var isMoneyFormatRight = reg.test(value);
                                    if(!isMoneyFormatRight){
                                        return "不是有效的金额数值";
                                    }
                                }else if(value===""){
                                    return "不能为空";
                                }
                            }},
                            renderer: function (val) {
                                return '<input type="text" value="' + ((val==null||val==="")?"":val) + '" style="pointer-events: none;">';
                            }
                        },
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'采购数量', dataIndex: 'purchasingQuantity', width: '200px', elCls: 'center',
                            editor: {xtype: 'number', rules: {required: true}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style="pointer-events: none;">';
                            }
                        },
                        {
                            sortable: false,  title: '采购总金额'+'<span id="totalPurchaseAmountD"></span>', width:'150px', elCls: 'center', renderer: function (val, obj) {
                            if (obj.purchasePriceD>=0 && obj.purchasingQuantity>=0) {
                                obj.totalPurchaseAmountD = Number((obj.purchasePriceD * obj.purchasingQuantity).toFixed(4));
                                return Number((obj.purchasePriceD * obj.purchasingQuantity).toFixed(4));
                            } else {
                                return "";
                            }
                        }
                        },
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'批次号', dataIndex: 'batchCode', width: '200px', elCls: 'center',
                            editor: {xtype: 'text', rules: {required: true,maxlength:20}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {
                            sortable: false, title: '生产编号', dataIndex: 'produceCode', width: '200px', elCls: 'center',
                            editor: {xtype: 'text', rules: {maxlength:20}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {title: '是否具有保质期', dataIndex: 'isQuality', elCls: 'center', visible : false},
                        {title: '保质期天数', dataIndex: 'qualityDay', elCls: 'center', visible : false},
                        {
                            title: '生产日期<br/>(保质期商品必填)',
                            dataIndex: 'productDate',
                            width: '200px',
                            elCls: 'center',
                            editor: {
                                xtype: 'date', validator: function (value, obj) {
                                    if((value==null||value=="")&&obj.isQuality=="1"){
                                        return '保质期商品必填'
                                    }
                                    if (obj.expireDate && value && obj.expireDate < value) {
                                        return '生产日期不能晚于截止保质日期'
                                    }

                                    if (obj.shelfLifeDays != null && obj.shelfLifeDays != undefined && obj.shelfLifeDays > 1) {
                                            if (value && obj.expireDate) {
                                                var dayBegin=typeof(obj.expireDate)=="string"?(new Date(obj.expireDate)).getTime():obj.expireDate;
                                                var dayEnd=typeof(value)=="string"?(new Date(value)).getTime():value;
                                                var minus = Math.abs( parseInt((obj.expireDate - value)/ 86400000)) + 1 
                                                if (minus > obj.shelfLifeDays +1 || minus < obj.shelfLifeDays) {
                                                    return '“截止保质日期-生产日期”的时间间隔和“理论保质期限”不符！'
                                                }
                                            }
                                        }
                                }
                            },
                            renderer : function(val){
                                var val= Grid.Format.dateRenderer(val);
                                return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {
                            title: '截止保质日期<br/>(保质期商品必填)',
                            dataIndex: 'expireDate',
                            width: '200px',
                            elCls: 'center',
                            editor: {
                                xtype: 'date', validator: function (value, obj) {
                                    if((value==null||value=="")&&obj.isQuality=="1"){
                                        return '保质期商品必填'
                                    }
                                    if (obj.productDate && value && obj.productDate > value) {
                                        return '截止保质日期不能早于生产日期！'
                                    }else{
                                        if (obj.shelfLifeDays != null && obj.shelfLifeDays != undefined && obj.shelfLifeDays > 1) {
                                            if (value && obj.productDate) {
                                                var dayBegin=typeof(value)=="string"?(new Date(value)).getTime():value;
                                                var dayEnd=typeof(obj.productDate)=="string"?(new Date(obj.productDate)).getTime():obj.productDate;
                                                var minus = Math.abs( parseInt((value - obj.productDate)/ 86400000)) + 1 
                                                if (minus > obj.shelfLifeDays +1 || minus < obj.shelfLifeDays) {
                                                    return '“截止保质日期-生产日期”的时间间隔和“理论保质期限”不符！'
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            renderer : function(val){
                                var val= Grid.Format.dateRenderer(val);
                                 return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {
                            sortable: false, title: '理论保质期限(天)<br/>(保质期商品必填)', dataIndex: 'shelfLifeDays', width: '200px', elCls: 'center',
                            editor: {xtype: 'number',validator:function(value,obj){
                                if((value==null||value=="")&&obj.isQuality=="1"){
                                        return '保质期商品必填'
                                }
                                if(value&&value<1){
                                   return '理论保质期限应大于1天！' 
                                }

                                if (value != null || value != undefined && value > 1) {
                                            if (obj.productDate && obj.expireDate) {
                                                var dayBegin=typeof(obj.expireDate)=="string"?(new Date(obj.expireDate)).getTime():obj.expireDate;
                                                var dayEnd=typeof(obj.productDate)=="string"?(new Date(obj.productDate)).getTime():obj.productDate;
                                                var minus = Math.abs( parseInt((dayBegin - dayEnd)/ 86400000)) + 1 
                                                if (minus > value +1 || minus < value) {
                                                    return '“截止保质日期-生产日期”的时间间隔和“理论保质期限”不符！'
                                                }
                                            }
                                        }

                            }},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {
                            sortable: false,
                            title: '操作', elCls: 'center', width: '150px', renderer: function (val, obj) {
                            var operationStr = "";
                            operationStr += '<span class="grid-command deleteClassify">删除</span>';
                            return operationStr;
                        }
                        }
                    ],
                data = $.purchaseOrderUpdateApp.data;
                var editing = new Grid.Plugins.CellEditing()
                function valiFn(value,newRecord) {
                    //alert($( "this [data-column-field='purchasePrice'] span").text())
                    var purchasePriceD = newRecord.purchasePriceD ; //进价
                    var purchasingQuantity =  newRecord.purchasingQuantity;//采购数量

                    if(purchasePriceD!=undefined && purchasingQuantity!=undefined) {
                        $("[data-column-field='totalPurchaseAmountD'] span").text(purchasePriceD * purchasingQuantity)
                    }
                };



                $.purchaseOrderUpdateApp.store = new Store({
                    data:[],
                    autoLoad: true,
                    // url : $.scmServerUrl + "purchase/purchaseDetail",
                    // proxy : {
                    //     method : 'get',
                    //     dataType : 'json' //返回数据的类型
                    // },
                    // autoLoad:true,
                    // params:{purchaseId: id}

                });

                $("#currencyType").on("click", function () {
                    var val = $("#currencyType").val();
                    if (val == null || val == "") {
                        $("#util").text('');
                        $("#purchasePriceD").text('');
                        $("#totalPurchaseAmountD").text('');
                    }
                    if (val == $.purchaseOrderUpdateApp.dollar) {
                        $("#util").text('美元');
                        $("#purchasePriceD").text('(美元)');
                        $("#totalPurchaseAmountD").text('(美元)');
                    }
                    if (val == $.purchaseOrderUpdateApp.rmb) {
                        $("#util").text('元');
                        $("#purchasePriceD").text('(元)');
                        $("#totalPurchaseAmountD").text('(元)');
                    }

                });
                $.purchaseOrderUpdateApp.dialog = new Overlay.Dialog({
                    title: '关联商品',
                    width: 1000,
                    height: 600,
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'itemSelectUpdate.html',
                        //autoLoad: true, //不自动加载
                        callback: function (text) {}
                    },
                });
                $.purchaseOrderUpdateApp.grid = new Grid.Grid({
                    render: '#Items',
                    columns: columns,
                    width: "100%",
                    /*emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',*/
                    forceFit: false,
                    store: $.purchaseOrderUpdateApp.store,
                    plugins:[BUI.Grid.Plugins.RowNumber,editing],
                });

                $.purchaseOrderUpdateApp.grid.render();

                $.purchaseOrderUpdateApp.grid.on('cellclick', function (e) {
                    var record = e.record;
                    var domTarget = e.domTarget;
                    switch (domTarget.className) {
                        case "grid-command deleteClassify":
                            $.purchaseOrderUpdateApp.store.remove(record);
                            var num = 0;
                            for (var i = 0, length = $.purchaseOrderUpdateApp.grid.getCount(); i < length; i++) {

                                var item = $.purchaseOrderUpdateApp.grid.getItemAt(i);
                                if(item.purchasePriceD && item.purchasingQuantity){
                                    num += item.purchasePriceD * item.purchasingQuantity;
                                }

                            }
                            $("#totalFeeD").val(Number(num.toFixed(4)));
                            //sku数组删除本条记录的SKU
                            $.purchaseOrderUpdateApp.skuArray.splice($.inArray(record.skuCode,$.purchaseOrderUpdateApp.skuArray),1)
                            //delRecord.push(record.id);
                            break;
                    }
                });

                $.purchaseOrderUpdateApp.grid.on('itemupdated', function (ev) {

                    var data = ev.item;
                    var index = $.purchaseOrderUpdateApp.store.findIndexBy(data); //当前元素位置

                    var newData = data;

                    if(data.purchasePriceD<0){
                        newData.purchasePriceD=0
                    }

                    var r= /^[+]?[1-9]?[0-9]*\.[0-9]*$/;

                    if( r.test(data.purchasingQuantity)){
                        var arr = data.purchasingQuantity.toString().split('.');
                        newData.purchasingQuantity=arr[0]
                    }

                    newData.totalPurchaseAmountD =$.purchaseOrderUpdateApp.accMul(data.purchasePriceD,data.purchasingQuantity);


                    //$.purchaseOrderUpdateApp.store.remove(data);

                    //$.purchaseOrderUpdateApp.store.addAt(newData, index);


                    var num = 0;
                    for (var i = 0, length = $.purchaseOrderUpdateApp.grid.getCount(); i < length; i++) {

                        var item = $.purchaseOrderUpdateApp.grid.getItemAt(i);
                        if(item.purchasePriceD && item.purchasingQuantity){
                            num += item.purchasePriceD * item.purchasingQuantity;
                        }

                    }
                    $("#totalFeeD").val(Number(num.toFixed(4)));
                });


                $("#relevance").on("click", function () {
                    if($.purchaseOrderUpdateApp.supplierCode == null || $.purchaseOrderUpdateApp.supplierCode == ""){
                        BUI.Message.Alert('请先添加供应商！','warning');
                        return;
                    }else if(!$("#warehouseName").val()||$("#warehouseName").val()==""||$("#warehouseName").val()=="empOption"){
                        BUI.Message.Alert('请先添加仓库！','warning');
                        return;
                    }else if($("#currencyType").val()==""){
                        BUI.Message.Alert('请先选择币制！', 'warning');
                        return;
                    }
                    else{
                        // if($(".bui-message")){
                        //     $(".bui-message").remove();
                        // }
                        $("#itemsMsg").text("");
                        $.purchaseOrderUpdateApp.dialog.render();
                        $.purchaseOrderUpdateApp.dialog.get('loader').load({});
                        $.purchaseOrderUpdateApp.dialog.show();
                        $(".bui-dialog").css("height","auto");
                        $(".bui-stdmod-body").css("height","auto");
                        $(".bui-dialog")[0].style.top = '120px';
                        $(".bui-grid-body").css("overflow-y","scorll")
                        //$(".bui-grid-body").css("height","500px");
                    }                                    
                });

                //供应商对应的商品

                $("#supplierCode").on("change",function () {
                    var value = $("#supplierCode").val();
                    $.purchaseOrderUpdateApp.store.data=[];
                    $.purchaseOrderUpdateApp.supplierCode = value;
                    $.purchaseOrderUpdateApp.store.load({});
                    $.purchaseOrderUpdateApp.skuArray = [];  //供应商下拉的改变，商品数组清空
                    $.itemSelectUpdate.supplierCode = value;
                    $("#totalFeeD").val(0);
                   // $.purchaseOrderUpdateApp.store.clearData();
                });
                /*选择的仓库*/ 
                $("#warehouseName").on("change",function(){  
                    var warehouseValue=$("#warehouseName").val();
                    var val=$.purchaseOrderUpdateApp.warehouseListArray[warehouseValue].id;               
                    $.itemSelectUpdate.warehouseInfoId = val;  
                    $.purchaseOrderUpdateApp.store.load({});
                    $.purchaseOrderUpdateApp.skuArray = [];  
                    $("#totalFeeD").val(0);                
                });
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        // validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();
                $.purchaseOrderUpdateApp.form = form;

                var tip = new Tooltip.Tip({
                    align:{
                        node : '#save_btn'
                    },
                    alignType : 'top-left',
                    offset : 10,
                    triggerEvent : 'click',
                    autoHideType:'click',
                    title : '',
                    elCls : 'tips tips-warning',
                    titleTpl : '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                }) ;
                //编辑 的提交审核 和保存 需先校验 所提交的商品是否 可用
                $("#commit_btn").on("click",function(){ //提交审核
                    form.valid();
                    var str1 = $.purchaseOrderUpdateApp.store.getResult();
                    for(var i=0;i<str1.length;i++){
                        
                        if (str1[i].isQuality&&str1[i].isQuality=="1") {
                            if (!str1[i].productDate) {
                                BUI.Message.Alert('保质期商品生产日期必填','warning');
                                return;
                            }
                            if (!str1[i].expireDate) {
                                BUI.Message.Alert('保质期商品生产截止日期必填','warning');
                                return;
                            }
                            if (!str1[i].shelfLifeDays) {
                                BUI.Message.Alert('保质期商品理论保质期限必填','warning');
                                return;
                            }
                            if (str1[i].productDate && str1[i].expireDate) {
                                var minus = Math.abs( parseInt((str1[i].expireDate - str1[i].productDate)/ 86400000)) + 1 
                                if (minus > str1[i].shelfLifeDays +1 || minus < str1[i].shelfLifeDays) {
                                    BUI.Message.Alert('商品'+str1[i].skuName+'“截止保质日期-生产日期”的时间间隔和“理论保质期限”不符！');
                                    return;
                                }
                            }
                        }
                        if(str1[i]["productDate"]){
                           var productDate =new Date(str1[i]["productDate"]); 
                           str1[i]["productDate"]= productDate.Format("yyyy-MM-dd");
                        }
                        if(str1[i]["expireDate"]){
                            var expireDate = new Date(str1[i]["expireDate"]);
                            str1[i]["expireDate"]= expireDate.Format("yyyy-MM-dd")
                        }

                    };
                    str1 = BUI.JSON.stringify($.purchaseOrderUpdateApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    form.getField('gridValue').set('value', str1);
                    var formData = form.serializeToObject();
                    var warehouseValue= $("#warehouseName").val();
                    if(warehouseValue=="initVal"){
                        formData.warehouseCode=$.purchaseOrderUpdateApp.warehouseCode;
                        formData.warehouseId = $.purchaseOrderUpdateApp.warehouseId;
                        formData.warehouseName = $.purchaseOrderUpdateApp.warehouseName;
                        formData.warehouseInfoId = $.purchaseOrderUpdateApp.warehouseInfoId;
                    }else if(warehouseValue=="empOption"){
                        formData.warehouseCode = '';
                        formData.warehouseId = '';
                        formData.warehouseName = '';
                        formData.warehouseInfoId ='';
                    }else{                        
                        var val=$.purchaseOrderUpdateApp.warehouseListArray[warehouseValue]
                        formData.warehouseCode = val.code;
                        formData.warehouseId = val.warehouseId;
                        formData.warehouseName = val.warehouseName;
                        formData.warehouseInfoId = val.id;
                    }
                    if(form.isValid()) {
                        var endReceiveTime = $('#endReceiveDate').val();
                        var requriedReceiveTime = $('#requriedReceiveDate').val();
                        if (requriedReceiveTime > endReceiveTime) {
                            BUI.Message.Alert("截止到货日期不能小于要求到货日期", "warning");
                            return false;
                        }
                        if(!endReceiveTime){
                            BUI.Message.Alert("截止到货日期不能为空", "warning");
                            return false;
                        }
                        if(!requriedReceiveTime){
                            BUI.Message.Alert("要求到货日期不能为空", "warning");
                            return false;
                        }
                        editing.valid();
                        if (!editing.isValid()) {
                            return
                        }
                       /* var str1 = BUI.JSON.stringify($.purchaseOrderUpdateApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                        form.getField('gridValue').set('value', str1);*/
                        var payType = $("#payType").val();
                        var paymentProportion = $("#paymentProportion").val();
                        if (payType == 'deliveryAfterPayment') {//校验付款方式  先付款后发货
                            if (paymentProportion == '正数XX.X' || paymentProportion == "") {
                                $("#msgTip").text("！不能为空");
                                return;
                            }
                        }

                        if (payType == 'paymentAfterDelivery') {//先发货后付款
                            $("#paymentProportion").attr("disabled", true)
                        }
                        if (str1 == '[]') {//未选择商品
                            $("#itemsMsg").text("未添加商品");
                            return;
                        }
                        var urlStr = 'purchaseOrderAudit';
                        if (form.isValid()) {
                            if (str1 == '[]') {//未选择商品
                                $("#itemsMsg").text("未添加商品");
                                return;
                            }
                            $.showLoadMask();
                            $.purchaseOrderUpdateApp.save(formData,urlStr);
                        }
                        window.setTimeout(function () {
                            $("#save_btn").attr("disabled",false);
                        },500);
                        /*$.purchaseOrderUpdateApp.compareSKUS(function (result) {
                            if (result) {
                                $.purchaseOrderUpdateApp.save(formData, "purchaseOrderAudit", tip, urlStr);
                            }
                        }, 'commit')*/
                    }
                });

                $("#save_btn").on("click",function(){ //保存
                    var code = $("#supplierCode").val();
                    //var str = BUI.JSON.stringify($.purchaseOrderUpdateApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    var str = $.purchaseOrderUpdateApp.store.getResult();
                    if(str){
                        for(var i=0;i<str.length;i++){
                            if(str[i]["productDate"]){
                               var productDate =new Date(str[i]["productDate"]); 
                               str[i]["productDate"]= productDate.Format("yyyy-MM-dd");
                            }
                            if(str[i]["expireDate"]){
                                var expireDate = new Date(str[i]["expireDate"]);
                                str[i]["expireDate"]= expireDate.Format("yyyy-MM-dd")
                            }
                        };
                    } 
                    str = JSON.stringify($.purchaseOrderUpdateApp.store.getResult());
                    form.getField('gridValue').set('value', str);
                    var formData = form.serializeToObject();
                    //form.clearErrors();
                    $("#supplierCode").val(code)
                    var formSupplierCode = form.getChild("formSupplierCode");
                    formSupplierCode.valid();
                    var warehouseValue=$("#warehouseName").val();       
                    if(warehouseValue=="initVal"){
                        formData.warehouseCode=$.purchaseOrderUpdateApp.warehouseCode;
                        formData.warehouseId = $.purchaseOrderUpdateApp.warehouseId;
                        formData.warehouseName = $.purchaseOrderUpdateApp.warehouseName;
                        formData.warehouseInfoId = $.purchaseOrderUpdateApp.warehouseInfoId;                        
                    }
                    else if(warehouseValue=="empOption"){
                        formData.warehouseCode = '';
                        formData.warehouseId = '';
                        formData.warehouseName = '';
                        formData.warehouseInfoId ='';
                    }else if(warehouseValue==null){
                        formData.warehouseCode = '';
                        formData.warehouseId = '';
                        formData.warehouseName = '';
                        formData.warehouseInfoId ='';
                    }else{
                        var val=$.purchaseOrderUpdateApp.warehouseListArray[warehouseValue];                        
                        formData.warehouseCode = val.code;
                        formData.warehouseId = val.warehouseId;
                        formData.warehouseName = val.warehouseName;
                        formData.warehouseInfoId = val.id;
                    }
                    var urlStr = 'purchaseOrder';
                    if(code){
                        $.purchaseOrderUpdateApp.save(formData,"purchaseOrder", tip,urlStr);
                    }               
                });

                //下拉选改变触发的函数
                $("#payType").on("change",function () {
                    var value=$("#payType").val();
                    if(value=='deliveryAfterPayment'){ //先付款后发货
                         $("#paymentProportion").val("")
                        $("#paymentProportionDiv").prop("hidden",false);
                    }else {
                        $("#paymentProportionDiv").prop("hidden",true);
                        $("#msgTip").text("");
                    }
                });

                //为采购组下拉选绑定事件
                $("#purchaseGroupCode").on("change",function () {
                    var value=$("#purchaseGroupCode").val();
                    $.purchaseOrderUpdateApp.queryPurchasePerson(value);
                });
                //付款比例聚焦事件
                $("#paymentProportion").on("focus",function () {
                    var val = $("#paymentProportion").val()
                    if(val=='正数XX.X'){
                        $("#paymentProportion").val("")
                    }
                })
                //付款比例失焦事件
                $("#paymentProportion").on("blur",function () {//定义光标消失事件
                    var val = $("#paymentProportion").val()
                    if(val==""){
                        $("#msgTip").text("！不能为空");
                    }else{
                        $("#msgTip").text("");
                        var reg=/^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/ ;//大于0 并且有3位小数的正则表达式
                        if(reg.test(val)){
                            if(val>0){
                                if(val>0 && val <100){
                                    var re = /^[0-9]*[1-9][0-9]*$/ ; //判断是否为正整数
                                    if(re.test(val)){
                                        $("#msgTip").text("");
                                        return;
                                    }
                                    var len = val.toString().split(".")[1].length
                                    if(len>2){
                                        $("#paymentProportion").val("")
                                        $("#msgTip").text("输入不合法！");
                                        return;
                                    }
                                    $("#msgTip").text("");
                                    return;
                                }else if(val == 100){
                                    $("#msgTip").text("");
                                    return;
                                }else {
                                    $("#paymentProportion").val("")
                                    $("#msgTip").text("输入超出范围");
                                }
                            }else {
                                $("#paymentProportion").val("")
                                $("#msgTip").text("输入不合法！");
                            }
                        }else {
                            $("#paymentProportion").val("")
                            $("#msgTip").text("输入不合法！");
                        }
                    }

                })

                $("#btn_list").on("click",function(){
                    window.location.href = "purchaseOrderList.html";
                	//window.history.go(-1);
                });

                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "purchase/purchaseDetail";//查询采购的员工的地址
                aContent.data = {purchaseId: id};
                aContent.success = function(result,textStatus){
                    if(!result){
                        BUI.Message.Alert(result.databuffer, "warning");
                    }else {
                        //显示表格里面的tbody
                        // var resultList = result;
                        $.purchaseOrderUpdateApp.store.add(result)

                        var num  = 0;
                        $.each(result,function (index,item) {

                            $.purchaseOrderUpdateApp.skuArray.push(item.skuCode);

                            if(item.purchasePriceD && item.purchasingQuantity){
                                num += item.purchasePriceD * item.purchasingQuantity;
                            }
                        })
                        $("#totalFeeD").val(Number(num.toFixed(4)));
                        //$("#totalFeeD").val(num);

                    }}

                    $.ajax(aContent)

            });
        },
        queryPurchasePerson : function (value) {

            if(value==""||value==null){
                //指定采购人//.find("option").eq(0).prop("selected",true)
                $("#purchasePersonId").html('<option value=""' + '>'+'请先选择采购组'+'</option'+'>')
            }else{
                var aContent = $.AjaxContent();//
                aContent.url = $.scmServerUrl + "purchase/purchasePerson";//根据采购组的编码，查询采购组里面的采购人员
                aContent.data = {"purchaseGroupCode":value};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer, "warning");
                    }else{
                        //显示表格里面的tbody
                        var  resultList =  result.result;
                        var length = resultList.length;
                        if(length==0){
                            var option = $('<option value=""' + '>'+'无采购人员'+'</option'+'>');
                            $("#purchasePersonId").children("option").remove();
                            $("#purchasePersonId").append(option)
                        }else{
                            //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                            $.AddItem2('purchasePersonId', result.result,'userId','name','请选择');
                            if($.purchaseOrderUpdateApp.purchasePersonId!=null){
                                $("#purchasePersonId").val($.purchaseOrderUpdateApp.purchasePersonId) ; //采购人员赋值
                                $.purchaseOrderUpdateApp.purchasePersonId=null;
                            }

                        }
                    }
                };
                $.ajax(aContent);
            }

        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/purchaseOrder/"+id;
            aContent.data = {};
            aContent.async=false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询采购单失败","warning");
                }else{
                    var purcharseDtl = result.result;
                    $.purchaseOrderUpdateApp.purchasePersonId=purcharseDtl.purchasePersonId;  //赋值全局变量
                    $("#purchaseOrderCode").val(purcharseDtl.purchaseOrderCode)   //采购订单赋值
                    var  flag = false;
                    $("#supplierCode option").each(function (){
                        if(this.value == purcharseDtl.supplierCode){
                            flag = true;
                        }
                    });
                    if(flag){
                        $("#supplierCode").val(purcharseDtl.supplierCode);               //供应商编码赋值
                    }else {
                        var supplierName = purcharseDtl.supplierName

                        BUI.Message.Alert(supplierName+ "已被停用或者与该渠道取消了绑定,"+"若进行编辑,供应商"+supplierName+"将取消绑定",'warning');

                    }
                    $.purchaseOrderUpdateApp.supplierCode=purcharseDtl.supplierCode;
                    $.itemSelectUpdate.supplierCode = purcharseDtl.supplierCode;
                    $("#contractCode").val(purcharseDtl.contractCode)               //采购合同赋值
                    $("#purchaseType").val(purcharseDtl.purchaseType)               //采购类型赋值
                    $("#payType").val(purcharseDtl.payType)                             //付款类型赋值
                    if(purcharseDtl.payType=='deliveryAfterPayment'){               //先付款后发货
                        $("#paymentProportionDiv").attr("hidden",false)
                        $("#paymentProportion").val(purcharseDtl.paymentProportion) //付款比例赋值
                    }
                    var  temp = false;
                    $("#purchaseGroupCode option").each(function (){
                        if(this.value == purcharseDtl.purchaseGroupCode){
                            temp = true;
                        }
                    });
                    if(temp){
                        $("#purchaseGroupCode").val(purcharseDtl.purchaseGroupCode)     //采购组赋值
                        $.purchaseOrderUpdateApp.queryPurchasePerson(purcharseDtl.purchaseGroupCode);//查询该采购组的采购人员 --并在返回结果后选择用户
                    }else {
                        var purchaseGroupName = purcharseDtl.purchaseGroupName
                        BUI.Message.Alert(purchaseGroupName+ "已被停用,"+"若修改此采购单,"+purchaseGroupName+"将被移除。采购人"+purcharseDtl.purchasePerson+'也将被移除','warning');
                    }
                    //$("#purchasePersonId").attr("value",purcharseDtl.purchasePersonId);//采购组人员赋值失败--采购组人员--停用
                    $("#currencyType").val(purcharseDtl.currencyType)                 //币种赋值
                    if (purcharseDtl.currencyType == $.purchaseOrderUpdateApp.dollar) {
                        $("#util").text('美元');
                        $("#purchasePriceD").text('(美元)');
                        $("#totalPurchaseAmountD").text('(美元)');
                    }
                    if (purcharseDtl.currencyType == $.purchaseOrderUpdateApp.rmb) {
                        $("#util").text('元');
                        $("#purchasePriceD").text('(元)');
                        $("#totalPurchaseAmountD").text('(元)');
                    }   
                    if(purcharseDtl.warehouseName&&purcharseDtl.warehouseName!=""){
                        var selOption = $('<option id="initOption" value="initVal"' + '>' + purcharseDtl.warehouseName + '</option' + '>');
                        $.purchaseOrderUpdateApp.warehouseCode=purcharseDtl.warehouseCode;
                        $.purchaseOrderUpdateApp.warehouseId=purcharseDtl.warehouseId;
                        $.purchaseOrderUpdateApp.warehouseName =purcharseDtl.warehouseName;
                        $.purchaseOrderUpdateApp.warehouseInfoId = purcharseDtl.warehouseInfoId;
                        $("#warehouseName").append(selOption);  
                    }                                   
                    $("#receiveAddress").val(purcharseDtl.receiveAddress)               //收货地址赋值
                    $("#transportFeeDestId").val(purcharseDtl.transportFeeDestId)       //货运承担方赋值
                    $("#takeGoodsNo").val(purcharseDtl.takeGoodsNo)                         //提运单号赋值
                    $("#requriedReceiveDate").val(purcharseDtl.requriedReceiveDate)
                    $("#endReceiveDate").val(purcharseDtl.endReceiveDate)
                    $("#totalFeeD").val(purcharseDtl.totalFee)
                    $("#handlerPriority").val(purcharseDtl.handlerPriority)            //处理优先级
                    $("#remark").val(purcharseDtl.remark)
                    $("#receiver").val(purcharseDtl.receiver)
                    $("#receiverNumber").val(purcharseDtl.receiverNumber)
                    $("#sender").val(purcharseDtl.sender)
                    $("#senderNumber").val(purcharseDtl.senderNumber)
                    if(purcharseDtl['senderProvince']){
                        $("#senderProvince").attr("value", purcharseDtl['senderProvince']);
                        $("#senderProvince").trigger("change");
                    }
                    if(purcharseDtl['senderCity']){
                        $("#senderCity").attr("value", purcharseDtl['senderCity']);
                    }                                       
                    $("#senderAddress").val(purcharseDtl.senderAddress);
                    $.itemSelectUpdate.warehouseInfoId = purcharseDtl.warehouseInfoId;  
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询该供应商下的有效SKU 与 提交的SKU 对比
         */
        compareSKUS:function (fnreturn,str2){
                var  tip = null;
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "purchase/suppliersAllItems/"+$("#supplierCode").val();//handlerPriority
                aContent.data = {};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer,'warning');
                        tip=false;
                        return false;
                    }else{
                        var result = result.result
                        // == 说明存在
                        if(result.length<=0){//没有查到可用商品

                            var str = BUI.JSON.stringify($.purchaseOrderUpdateApp.store.getResult());

                            if(str2 == 'save'){

                                if(str != '[]'){
                                    BUI.Message.Alert('该供应商所具有的分类或品牌中无可用的商品！请您删除商品!','warning');
                                    return false;
                                }else {
                                    fnreturn(true)
                                    return true;
                                }
                            }else {
                                if(str=='[]'){//未选择商品
                                    $("#itemsMsg").text("未添加商品");
                                    return;
                                }
                                //BUI.Message.Alert('该供应商所具有的分类或品牌中无可用的商品！','warning');
                                //商品{$.purchaseOrderUpdateApp.skuArray}已被停用，请先删除！
                                BUI.Message.Alert('商品{'+$.purchaseOrderUpdateApp.skuArray+'}已被停用','warning');
                                // tip = false;
                                fnreturn(false)
                                return false;
                            }

                        }
                        var temp =  [];
                        var skutemp = [];
                        for(var i = 0;i<result.length;i++ ){
                            skutemp.push(result[i].skuCode);
                        }
                        $.each($.purchaseOrderUpdateApp.skuArray,function (index,item) {

                            if(skutemp.indexOf(item)==-1){
                                temp.push(item)
                            }
                        });
                        // $.each($.purchaseOrderUpdateApp.skuArray,function (index,item) {
                        //     for(var i = 0;i<result.length;i++ ){
                        //         if(item == result[i].skuCode){
                        //             temp.splice($.inArray(result[i].skuCode,temp),1)
                        //         }
                        //     }
                        // });
                        if(temp.length>0){
                            BUI.Message.Alert(temp+'的商品信息已失效,请先删除','warning');
                            // tip = false;
                            fnreturn(false)
                            return false;
                        }
                        // tip = true;
                        fnreturn(true)
                        return true;
                    }
                };
                $.ajax(aContent);
                return tip;

        },

        /**
         *查询处理的优先级
         */
        handlerPriority:function (){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/handlerPriority";//handlerPriority
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('handlerPriority', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询国家列表
         */
        queryCountryList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/country";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem('country', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询运费承担方
         */
        refundCostsTake:function (){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/transportCostsTake";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('transportFeeDestId', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询币种
         */
        queryCurrencyType:function (){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/currencyType";//查询启用状态下的采购组
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('currencyType', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询采购组
         */
        queryPurchaseGroup:function (){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroups";//查询启用状态下的采购组
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    //显示表格里面的tbody
                    var  resultList =  result.result;
                    var length = resultList.length;
                    if(length==0){
                        var option = $('<option value=""' + '>'+'无采购组'+'</option'+'>');
                        $("#purchaseGroupCode").append(option)
                    }else{
                        //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                        $.AddItem2('purchaseGroupCode', result.result,'code','name','请选择');
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询启用状态的收货仓库
         */
        queryWarehouses:function () {
            var initWarehouseVal = $("#warehouseName").val();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/warehouse";//查询采购的员工的地址
            aContent.data = {};
            aContent.async=false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    $("#initOption").remove();
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    //显示表格里面的tbody
                    var  resultList =  result.result;
                    console.log(result)
                    if(!resultList){
                        $("#warehouseName").data("warning",result.databuffer);
                    }else{
                        $.purchaseOrderUpdateApp.warehouseListArray=resultList;
                        var length = resultList.length;
                        if(length==0){
                            var option = $('<option value=""' + '>'+'无仓库 请先添加仓库'+'</option'+'>');
                            $("#warehouseName").append(option)
                        }else{
                            $("#initOption").remove();
                            for(var i=0;i<length;i++){                            
                                var option = $('<option value="' + i + '">' + resultList[i]['warehouseName'] + '</option' + '>');
                                $("#warehouseName").append(option);
                            }
                            var warehouseIndex=0;
                            for(i=0;i<$.purchaseOrderUpdateApp.warehouseListArray.length;i++){
                                if($.purchaseOrderUpdateApp.warehouseListArray[i].id==$.purchaseOrderUpdateApp.warehouseInfoId){
                                    warehouseIndex= i;
                                    break;
                                }
                            };   
                            if(($("#warehouseName").val()!=initWarehouseVal)&&warehouseIndex==0){
                                var val=$.purchaseOrderUpdateApp.warehouseListArray[0].id;               
                                $.itemSelectUpdate.warehouseInfoId = val; 
                                //$.purchaseOrderUpdateApp.store.load({});
                                $.purchaseOrderUpdateApp.skuArray = [];  
                                $("#totalFeeD").val(0);  
                            }           
                        $("#warehouseName").find("option[value='"+ warehouseIndex+"']").attr("selected",true);//收货仓库赋值
                        }
                    }                    
                }
            };
            aContent.error =function(XMLHttpRequest){
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
                        BUI.Message.Alert(result.databuffer || "", 'error');
                        $("#initOption").remove();
                        var empOption = $('<option id="empOption" value="empOption"' + '>' + '请选择' + '</option' + '>');
                        $("#warehouseName").append(empOption); 
                    }
                }
            }
            $.ajax(aContent);
        },
        /**
         * 查询对应供应商
         */
        querySuppliers:function (userId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/suppliers";//查询采购的员工的地址
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    //显示表格里面的tbody
                    var  resultList =  result.result;
                    var length = resultList.length;
                    if(length==0){
                        var option = $('<option value=""' + '>'+'无供应商 请先添加供应商'+'</option'+'>');
                        $("#supplierCode").append(option)
                    }else{
                        //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                        $.AddItem2('supplierCode', result.result,'supplierCode','supplierName','请选择');
                    }

                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询付款方式的下拉
         */
        queryPayTypeList:function () {
            var aContent = $.AjaxContent();
            aContent.url = aContent.url = $.scmServerUrl+"select/payType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('payType', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList:function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/purchaseType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('purchaseType', result.result,'value','name','请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存供应组
         * @param fromData
         */
        save:function(fromData,url,urlStr){
            $.showLoadMask();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/"+url+"/"+$.getUrlParam("id");
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.async = true;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    $.hideLoadMask();
                    BUI.Message.Alert(result.databuffer,'warning');                    
                }else{
                    window.location.href='purchaseOrderList.html';
                    $.hideLoadMask();
                }
            };
            aContent.error =function(XMLHttpRequest){
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
                        BUI.Message.Alert(result.databuffer || "", 'error');
                        $.hideLoadMask();
                    }
                }
            }
            $.ajax(aContent);
        },
        accMul:function(arg1, arg2){
            if (arg1&&arg2) {
                var m = 0, s1 = arg1.toString(), s2 = arg2.toString();   
                try {
                    m = m + s1.split(".")[1].length;
                } catch (e) {}
                try {
                    m = m + s2.split(".")[1].length;
                } catch (e) {}
                return Number(s1.replace(".","")) * Number(s2.replace(".","")) / Math.pow(10,m);
            } else {
                return 0;
            }
        }
    };
    $(document).ready(function(e) {
        queryLists();
    });
}(jQuery));
