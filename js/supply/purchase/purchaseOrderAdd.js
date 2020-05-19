/**
 * Created by sone on 2017/5/25.
 */
$(function () {    
    $.purchaseOrderAddApp = {
        data: [],
        dialog: null,
        grid: null,
        store: null,
        supplierCode: null,
        warehouseInfoId: null,
        warehouseListArray:new Array(),
        skuArray: new Array(),//用于存放sku的数组
        sku: null,
        //币种
        rmb: 'rmb',
        dollar: 'dollar',
        init: function () {
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
            $.purchaseOrderAddApp.querySuppliers();
            $.purchaseOrderAddApp.queryPurchaseTypeList();
            $.purchaseOrderAddApp.queryPayTypeList();
            $.purchaseOrderAddApp.queryPurchaseGroup();
            $.purchaseOrderAddApp.queryCurrencyType();            
            $.purchaseOrderAddApp.refundCostsTake();
            $.purchaseOrderAddApp.handlerPriority(); 
            var selOption = $('<option id="initOption" value=""' + '>' + '请选择' + '</option' + '>');
            $("#warehouseName").append(selOption);   
            $.purchaseOrderAddApp.queryWarehouses();             
            $("#warehouseName").on("focus",function(){   
                // if(($.purchaseOrderAddApp.warehouseListArray).length>0){
                //     return;
                // }else{
                //     $.purchaseOrderAddApp.queryWarehouses();
                // }  
                if($(this).data("warning")){
                    BUI.Message.Alert($(this).data("warning"));
                }                                         
            });
            BUI.use(['bui/grid', 'bui/form', 'bui/tooltip', 'bui/data', 'bui/overlay'], function (Grid, Form, Tooltip, Data, Overlay) {

                //建立表格
                var
                    Store = Data.Store,
                    enumObj = {"1": "选项一", "2": "选项二", "3": "选项三"},
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
                            editor: {xtype: 'text', rules: {required: true,maxlength:9},validator:function(value,obj){
                                if(value!="0"){
                                    var reg = new RegExp(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/);
                                    var isMoneyFormatRight = reg.test(value);
                                    if(!isMoneyFormatRight){
                                        return "不是有效的金额数值";
                                    }
                                }
                            }},
                            renderer: function (val) {
                                return '<input type="text" value="' + ((val==null||val==="")?"":val) + '" style="pointer-events: none;">';
                            }
                        },
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'采购数量', dataIndex: 'purchasingQuantity', width: '200px', elCls: 'center',
                            editor: {xtype: 'number', rules: {required: true,maxlength:6}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style="pointer-events: none;">';
                            }
                        },
                        {
                            sortable: false, title: '采购总金额'+'<span id="totalPurchaseAmountD"></span>', dataIndex: 'totalPurchaseAmountD', width:'150px', elCls: 'center', renderer: function (val, obj) {
                            if (obj.purchasePriceD && obj.purchasingQuantity) {
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
                                return '<input type="text" value="' + (val ? val : "") + '" style="pointer-events: none;">';
                            }
                        },
                        {
                            sortable: false, title: '生产编号', dataIndex: 'produceCode', width: '200px', elCls: 'center',
                            editor: {xtype: 'text',rules: {maxlength:20}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style=" ">';
                            }
                        },
                        {title: '是否具有保质期', dataIndex: 'isQuality', elCls: 'center', visible : false},

                        {
                            title: '生产日期<br/>(保质期商品必填)',
                            dataIndex: 'productDate',
                            width: '200px',
                            elCls: 'center',
                            editor: {
                                xtype: 'date', validator: function (value,obj) {
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
                                                var minus = Math.abs( parseInt((obj.expireDate - obj.productDate)/ 86400000)) + 1 
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
                    data = $.purchaseOrderAddApp.data;
                var editing = new Grid.Plugins.CellEditing();
                $.purchaseOrderAddApp.store = new Store({
                    data: data,
                    autoLoad: true
                });

                $.purchaseOrderAddApp.dialog = new Overlay.Dialog({
                    title: '关联商品',
                    width: 1000,
                    // height: 600,
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'itemSelect.html',
                        // autoLoad: true, //不自动加载
                        callback: function (text) {
                        }
                    },
                });
                $.purchaseOrderAddApp.grid = new Grid.Grid({
                    render: '#Items',
                    columns: columns,
                    width: "100%",
                    //emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    forceFit: false,
                    store: $.purchaseOrderAddApp.store,
                    plugins: [BUI.Grid.Plugins.RowNumber, editing],

                });

                $.purchaseOrderAddApp.grid.render();

                // $(".bui-editor .bui-form-field input").on("keyup", function () {

                //     var top = $(this).parent().parent().css("top");

                //     var left = Number($(this).parent().parent().css("left").replace("px", ""));
                //     var pWidth = Number($(this).parent().parent().css("width").replace("px", ""));
                //     var tWidth = Number($(this).css("width").replace("px", ""));

                //     $(".x-editor-tips").css({top: top});
                //     $(".x-editor-tips").css({left: left + (pWidth + tWidth) / 2 + 20});

                // });

                $.purchaseOrderAddApp.grid.on('cellclick', function (e) {
                    var record = e.record;
                    var field = e.field;
                    var domTarget = e.domTarget;
                    // $(domTarget).parent().parent().find('div[class=cell-error]').hide();
                    // if (record[field]) {
                    //     $(".x-editor-tips").show();
                    // } else {
                    //     $(".x-editor-tips").hide();
                    // }
                    switch (domTarget.className) {
                        case "grid-command deleteClassify":
                            $.purchaseOrderAddApp.store.remove(record);
                            var num = 0;
                            for (var i = 0, length = $.purchaseOrderAddApp.grid.getCount(); i < length; i++) {

                                var item = $.purchaseOrderAddApp.grid.getItemAt(i);
                                if (item.purchasePriceD && item.purchasingQuantity) {
                                    num += item.purchasePriceD * item.purchasingQuantity;
                                }

                            }
                            $("#totalFeeD").val(Number(num.toFixed(4)));
                            //sku数组删除本条记录的SKU
                            $.purchaseOrderAddApp.skuArray.splice($.inArray(record.skuCode, $.purchaseOrderAddApp.skuArray), 1);
                            //delRecord.push(record.id);
                            break;
                    }
                });

                $("#currencyType").on("click", function () {
                    var val = $("#currencyType").val();
                    if (val == null || val == "") {
                        $("#util").text('');
                        $("#purchasePriceD").text('');
                        $("#totalPurchaseAmountD").text('');
                    }
                    if (val == $.purchaseOrderAddApp.dollar) {
                        $("#util").text('美元');
                        $("#purchasePriceD").text('(美元)');
                        $("#totalPurchaseAmountD").text('(美元)');
                    }
                    if (val == $.purchaseOrderAddApp.rmb) {
                        $("#util").text('元');
                        $("#purchasePriceD").text('(元)');
                        $("#totalPurchaseAmountD").text('(元)');
                    }

                });

                $.purchaseOrderAddApp.grid.on('itemupdated', function (ev) {

                    var data = ev.item;

                    var index = $.purchaseOrderAddApp.store.findIndexBy(data); //当前元素位置

                    var newData = data;

                    if (data.purchasePriceD < 0) {
                        newData.purchasePriceD = 0
                        alert(data.purchasePriceD)
                    }

                    var r = /^[+]?[1-9]?[0-9]*\.[0-9]*$/;

                    if (r.test(data.purchasingQuantity)) {
                        var arr = data.purchasingQuantity.toString().split('.');
                        newData.purchasingQuantity = arr[0]
                    }
                    if (data.purchasingQuantity <= 0) {
                        newData.purchasingQuantity = null;
                    }

                    newData.totalPurchaseAmountD =$.purchaseOrderAddApp.accMul(data.purchasePriceD,data.purchasingQuantity);

                    //$.purchaseOrderAddApp.store.remove(data);

                    //$.purchaseOrderAddApp.store.addAt(newData, index);


                    var num = 0;
                    for (var i = 0, length = $.purchaseOrderAddApp.grid.getCount(); i < length; i++) {

                        var item = $.purchaseOrderAddApp.grid.getItemAt(i);
                        if (item.purchasePriceD && item.purchasingQuantity) {
                            num += item.purchasePriceD * item.purchasingQuantity;
                        }

                    }
                    $("#totalFeeD").val(Number(num.toFixed(4)));

                });


                $("#relevance").on("click", function () {
                    if ($.purchaseOrderAddApp.supplierCode == null || $.purchaseOrderAddApp.supplierCode == "") {
                        BUI.Message.Alert('请先添加供应商！', 'warning');
                        return;
                    }else if ($("#warehouseName").val() == ""||$("#warehouseName").val() ==null) {
                        BUI.Message.Alert('请先添加仓库！', 'warning');
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
                        $.purchaseOrderAddApp.dialog.render();
                        $.purchaseOrderAddApp.dialog.get('loader').load({});
                        $.purchaseOrderAddApp.dialog.show();
                        $(".bui-dialog").css("height","auto");
                        $(".bui-dialog")[0].style.top = '120px';
                        $(".bui-grid-width .bui-grid-body").css("overflow-y","scorll")
                        //$(".bui-grid-body").css("height","500px");
                    }                    
                });

                //供应商对应的商品

                $("#supplierCode").on("change", function () {
                    var value = $("#supplierCode").val();
                    $.purchaseOrderAddApp.store.data = [];
                    $.purchaseOrderAddApp.supplierCode = value;
                    $.purchaseOrderAddApp.store.load({});
                    $.purchaseOrderAddApp.skuArray = null;  //供应商下拉的改变，商品数组清空
                    $.itemSelect.supplierCode = value;
                    $("#totalFeeD").val(0);

                });
                /*选择的仓库*/
                $("#warehouseName").on("change",function(){    
                    var warehouseValue=$("#warehouseName").val();
                    var val=$.purchaseOrderAddApp.warehouseListArray[warehouseValue].id;               
                    $.itemSelect.warehouseInfoId = val;   
                    $.purchaseOrderAddApp.store.load({});
                    $.purchaseOrderAddApp.skuArray = null;  
                    $("#totalFeeD").val(0);           
                });

                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();

                var tip = new Tooltip.Tip({
                    align: {
                        node: '#save_btn'
                    },
                    alignType: 'top-left',
                    offset: 10,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    title: '',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });

                $("#commit_btn").on("click", function () {  //提交审核
                    form.valid();
                    //$("#save_btn").attr("disabled","disabled");
                    if (!editing.isValid()) {
                        return
                    }
                    var str = $.purchaseOrderAddApp.store.getResult();
                    for(var i=0;i<str.length;i++){
                        
                        if (str[i].isQuality&&str[i].isQuality=="1") {
                            if (!str[i].productDate) {
                                BUI.Message.Alert('保质期商品生产日期必填','warning');
                                return;
                            }
                            if (!str[i].expireDate) {
                                BUI.Message.Alert('保质期商品生产截止日期必填','warning');
                                return;
                            }
                            if (!str[i].shelfLifeDays) {
                                BUI.Message.Alert('保质期商品理论保质期限必填','warning');
                                return;
                            }
                            if (str[i].productDate && str[i].expireDate) {
                                var minus = Math.abs( parseInt((str[i].expireDate - str[i].productDate)/ 86400000)) + 1 
                                if (minus > str[i].shelfLifeDays +1 || minus < str[i].shelfLifeDays) {
                                    BUI.Message.Alert('商品'+str[i].skuName+'“截止保质日期-生产日期”的时间间隔和“理论保质期限”不符！');
                                    return;
                                }
                            }
                        }
                        if(str[i]["productDate"]){
                           var productDate =new Date(str[i]["productDate"]); 
                           str[i]["productDate"]= productDate.Format("yyyy-MM-dd");
                        }
                        if(str[i]["expireDate"]){
                            var expireDate = new Date(str[i]["expireDate"]);
                            str[i]["expireDate"]= expireDate.Format("yyyy-MM-dd")
                        }
                    };
                    str = BUI.JSON.stringify($.purchaseOrderAddApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    form.getField('gridValue').set('value', str);
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
                    var formData = form.serializeToObject();
                    var warehouseValue=$("#warehouseName").val();
                    var val=$.purchaseOrderAddApp.warehouseListArray[warehouseValue]
                    formData.warehouseCode = val.code;
                    formData.warehouseId = val.warehouseId;
                    formData.warehouseName = val.warehouseName;
                    formData.warehouseInfoId = val.id;
                    var urlStr = 'purchaseOrderAudit';                    
                    if (form.isValid()) {
                        if (str == '[]') {//未选择商品
                            $("#itemsMsg").text("未添加商品");
                            return;
                        }
                        $.showLoadMask();
                        $.purchaseOrderAddApp.save(formData, tip, urlStr);
                    }
                    window.setTimeout(function () {
                        $("#save_btn").attr("disabled",false);
                    },500);

                });

                $("#save_btn").on("click", function () { //保存
                    var formSupplierCode = form.getChild("formSupplierCode");
                    formSupplierCode.valid();
                    var supplierCodeVal = $("#supplierCode").val();
                    if(!supplierCodeVal){
                         BUI.Message.Alert('请先选择供应商!', 'warning');
                    }else{
                        var str = $.purchaseOrderAddApp.store.getResult();
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
                        str = JSON.stringify($.purchaseOrderAddApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交                    
                        form.getField('gridValue').set('value', str);
                        var formForm = form.serializeToObject()
                        // form.clearErrors();
                        var warehouseValue=$("#warehouseName").val();
                        if(warehouseValue){
                            var val=$.purchaseOrderAddApp.warehouseListArray[warehouseValue]
                            formForm.warehouseCode = val.code;
                            formForm.warehouseId = val.warehouseId;
                            formForm.warehouseName = val.warehouseName;
                            formForm.warehouseInfoId = val.id;
                        };
                        var urlStr = 'purchaseOrder';
                        if ($.purchaseOrderAddApp.supplierCode) {
                            $.showLoadMask();
                            $.purchaseOrderAddApp.save(formForm, tip, urlStr);
                        }
                        window.setTimeout(function () {
                            $("#save_btn").attr("disabled",false);
                        },500);
                    }                    
                });

                //下拉选改变触发的函数
                $("#payType").on("change", function () {
                    var value = $("#payType").val();
                    if (value == 'deliveryAfterPayment') { //先付款后发货
                        $("#paymentProportion").val("")
                        $("#paymentProportionDiv").prop("hidden", false);
                    } else {
                        $("#paymentProportionDiv").prop("hidden", true);
                        $("#msgTip").text("");
                    }

                });

                //为采购组下拉选绑定事件
                $("#purchaseGroupCode").on("change", function () {
                    var value = $("#purchaseGroupCode").val();
                    if (value == "" || value == null) {
                        //指定采购人//.find("option").eq(0).prop("selected",true)
                        $("#purchasePersonId").html('<option value=""' + '>' + '请先选择采购组' + '</option' + '>')
                    } else {
                        var aContent = $.AjaxContent();//
                        aContent.url = $.scmServerUrl + "purchase/purchasePerson";//根据采购组的编码，查询采购组里面的采购人员
                        aContent.data = {"purchaseGroupCode": value};
                        aContent.success = function (result, textStatus) {
                            if (result.appcode != 1) {
                                BUI.Message.Alert(result.databuffer, 'warning');
                            } else {
                                //显示表格里面的tbody
                                var resultList = result.result;
                                var length = resultList.length;
                                if (length == 0) {
                                    var option = $('<option value=""' + '>' + '无采购人员' + '</option' + '>');
                                    $("#purchasePersonId").children("option").remove();
                                    $("#purchasePersonId").append(option)
                                } else {
                                    //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                                    $.AddItem2('purchasePersonId', result.result, 'userId', 'name', '请选择');
                                }
                            }
                        };
                        $.ajax(aContent);
                    }
                });
                //付款比例聚焦事件
                $("#paymentProportion").on("focus", function () {
                    var val = $("#paymentProportion").val()
                    if (val == '正数XX.X') {
                        $("#paymentProportion").val("")
                    }
                })
                //付款比例失焦事件
                $("#paymentProportion").on("blur", function () {//定义光标消失事件
                    var val = $("#paymentProportion").val()
                    if (val == "") {
                        $("#msgTip").text("！不能为空");
                    } else {
                        $("#msgTip").text("");
                        var reg = /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/;//大于0 并且有3位小数的正则表达式
                        if (reg.test(val)) {
                            if (val > 0) {
                                if (val > 0 && val < 100) {//=
                                    var re = /^[0-9]*[1-9][0-9]*$/; //判断是否为正整数
                                    if (re.test(val)) {
                                        $("#msgTip").text("");
                                        return;
                                    }
                                    var len = val.toString().split(".")[1].length
                                    if (len > 2) {
                                        $("#paymentProportion").val("")
                                        $("#msgTip").text("输入不合法！");
                                        return;
                                    }
                                    $("#msgTip").text("");
                                    return;
                                } else if (val == 100) {
                                    $("#msgTip").text("");
                                    return;
                                } else {
                                    $("#paymentProportion").val("")
                                    $("#msgTip").text("输入超出范围");
                                }
                            } else {
                                $("#paymentProportion").val("")
                                $("#msgTip").text("输入不合法！");
                            }
                        } else {
                            $("#paymentProportion").val("")
                            $("#msgTip").text("输入不合法！");
                        }
                    }

                })

                $("#btn_list").on("click", function () {
                    window.location.href = "purchaseOrderList.html";
                    //window.history.go(-1);
                });

            });
        },
        /**
         *查询处理的优先级
         */
        handlerPriority: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/handlerPriority";//handlerPriority
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('handlerPriority', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询运费承担方
         */
        refundCostsTake: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/transportCostsTake";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('transportFeeDestId', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询币种
         */
        queryCurrencyType: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/currencyType";//查询启用状态下的采购组
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('currencyType', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询采购组
         */
        queryPurchaseGroup: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/purchaseGroups";//查询启用状态下的采购组
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    //显示表格里面的tbody
                    var resultList = result.result;
                    var length = resultList.length;
                    if (length == 0) {
                        var option = $('<option value=""' + '>' + '无采购组' + '</option' + '>');
                        $("#purchaseGroupCode").append(option)
                    } else {
                        //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                        $.AddItem2('purchaseGroupCode', result.result, 'code', 'name', '请选择');
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询启用状态的收货仓库
         */
        queryWarehouses: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/warehouse";//查询采购的员工的地址
            aContent.data = {};
            aContent.async=false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var resultList = result.result;
                    if(!resultList){
                        $("#warehouseName").data("warning",result.databuffer);
                    }else{
                        $.purchaseOrderAddApp.warehouseListArray=resultList;
                        var length = resultList.length;
                        if (length == 0) {
                            var option = $('<option value=""' + '>' + '无仓库 请先添加仓库' + '</option' + '>');
                            $("#warehouseName").append(option)
                        } else {
                            for(var i=0;i<length;i++){
                                var option = $('<option value="' + i + '">' + resultList[i]['warehouseName'] + '</option' + '>');
                                $("#warehouseName").append(option);
                            }
                        }
                    }                    

                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询对应供应商
         */
        querySuppliers: function (userId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/suppliers";//查询采购的员工的地址
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    //显示表格里面的tbody
                    var resultList = result.result;
                    var length = resultList.length;
                    if (length == 0) {
                        var option = $('<option value=""' + '>' + '无供应商 请先添加供应商' + '</option' + '>');
                        $("#supplierCode").append(option)
                    } else {
                        //$.AddItem2('isCustomsClearance', result.result,'code','name','请选择');
                        $.AddItem2('supplierCode', result.result, 'supplierCode', 'supplierName', '请选择');
                    }

                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询付款方式的下拉
         */
        queryPayTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = aContent.url = $.scmServerUrl + "select/payType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('payType', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /**
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/purchaseType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2('purchaseType', result.result, 'value', 'name', '请选择');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存供应组
         * @param fromData
         */
        save: function (fromData, tip, urlStr) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/" + urlStr + '/';
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href='purchaseOrderList.html';
                }
            };
            aContent.complete = function () {
                $.hideLoadMask();
            };
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
    $(document).ready(function (e) {        
        $.purchaseOrderAddApp.init();
    });
}(jQuery));
