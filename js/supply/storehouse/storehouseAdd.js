/**
 * Created by sone on 2017/5/25.
 */
$(function () {    
    $.storehouseAddApp = {
        data: null,
        dialog: null,
        grid: null,
        store: null,
        inWarehouseCode: null,
        warehouseInfoInId: null,
        warehouseListArray:new Array(),
        skuArray: new Array(),//用于存放sku的数组
        sku: null,
        isJdWareHouse:false,
        //币种
        rmb: 'rmb',
        dollar: 'dollar',
        warehouse:null,
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
            $.storehouseAddApp.queryPurchaseGroup();
            BUI.use(['bui/grid', 'bui/form', 'bui/tooltip', 'bui/data', 'bui/overlay'], function (Grid, Form, Tooltip, Data, Overlay) {

                //建立表格
                var
                    Store = Data.Store,
                    enumObj = {"1": "选项一", "2": "选项二", "3": "选项三"},
                    columns = [
                        {sortable: false, title: '商品SKU名称', dataIndex: 'skuName', width: '150px', elCls: 'center'},
                        {sortable: false, title: '商品SKU编码', dataIndex: 'skuCode', width: '150px', elCls: 'center'},
                        {sortable: false, title: '规格', dataIndex: 'specNatureInfo', width: '150px', elCls: 'center'},
                        {sortable: false, title: '货号', dataIndex: 'skuNo', width: '150px', elCls: 'center',renderer :function(value,obj){
                            return value?value:"-";
                        }},
                        {sortable: false, title: '条形码', dataIndex: 'barCode', width: '150px', elCls: 'center'},
                        {sortable: false, title: '品牌名称', dataIndex: 'brandName', width: '150px', elCls: 'center'},
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'库存类型'+'<span id="inventoryType"></span>', dataIndex: 'inventoryType', width:'200px', elCls: 'center',
                            renderer: function (val,record,index) {
                                if (val == 2) {
                                    return `<select name="inventoryType" data-rules="{required:true}" onchange="$.storehouseAddApp.inventoryTypeChange(this,`+index+`)">
                                             <option value="1">正品</option>
                                             <option value="2" selected>残品</option>
                                         </select>`;
                                    
                                }else{
                                    return `<select  name="inventoryType" data-rules="{required:true}"  onchange="$.storehouseAddApp.inventoryTypeChange(this,`+index+`)">
                                             <option value="1" selected>正品</option>
                                             `+($.storehouseAddApp.isJdWareHouse?'':'<option value="2">残品</option>')+`
                                         </select>`;
                                }
                            }
                        },
                      {
                        sortable: false, title: '调出仓实时库存', dataIndex: 'inventoryNum', width: '110px', elCls: 'center', renderer: function (val, record, index) {
                                return '<span id="sp_'+record.skuCode+'">'+(val >= 0 ? val : "-")+'</span>';
                        }},
                        {
                            sortable: false, title: '<span style="color: red">*</span>'+'调拨数量', dataIndex: 'planAllocateNum', width: '200px', elCls: 'center',
                            editor: {xtype: 'number', rules: {required: true,maxlength:6,numberGtZero:0}},
                            renderer: function (val) {
                                return '<input type="text" value="' + (val ? val : "") + '" style="pointer-events: none;">';
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
                    data = $.storehouseAddApp.data;
                var editing = new Grid.Plugins.CellEditing({
                    errorTpl: '<div class="cell-error"><span class="x-icon bui-grid-cell-error x-icon-mini x-icon-error" style="overflow: visible;    position: static;" title="{error}">!</span>&nbsp;<span>{error}</span></div>'
                });
                $.storehouseAddApp.store = new Store({
                    data: data,
                    autoLoad: true
                });

                $.storehouseAddApp.dialog = new Overlay.Dialog({
                    title: '选择调拨商品',
                    width: 1000,
                    height: 720,
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'storehouseitemSelect.html',
                        // autoLoad: true, //不自动加载
                        callback: function (text) {
                            $("#itemsMsg").text("");
                        }
                    },
                });
                $.storehouseAddApp.grid = new Grid.Grid({
                    render: '#Items',
                    columns: columns,
                    width: "100%",
                    //emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    forceFit: false,
                    store: $.storehouseAddApp.store,
                    plugins: [BUI.Grid.Plugins.RowNumber, editing],

                });

                $.storehouseAddApp.grid.render();

                $.storehouseAddApp.grid.on('cellclick', function (e) {
                    var record = e.record;
                    var field = e.field;
                    var domTarget = e.domTarget;
                    $(domTarget).parent().parent().find('div[class=cell-error]').hide();
                    if (record[field]) {
                        $(".x-editor-tips").show();
                    } else {
                        $(".x-editor-tips").hide();
                    }
                    switch (domTarget.className) {
                        case "grid-command deleteClassify":
                            $.storehouseAddApp.store.remove(record);
                            var num = 0;
                            for (var i = 0, length = $.storehouseAddApp.grid.getCount(); i < length; i++) {

                                var item = $.storehouseAddApp.grid.getItemAt(i);
                                if (item.purchasePriceD && item.purchasingQuantity) {
                                    num += item.purchasePriceD * item.purchasingQuantity;
                                }

                            }
                            $("#totalFeeD").val(Number(num.toFixed(4)));
                            //sku数组删除本条记录的SKU
                            $.storehouseAddApp.skuArray.splice($.inArray(record.skuCode, $.storehouseAddApp.skuArray), 1);
                            //delRecord.push(record.id);
                            break;
                    }
                });

                $.storehouseAddApp.grid.on('itemupdated', function (ev) {

                    var data = ev.item;

                    // var index = $.storehouseAddApp.store.findIndexBy(data); //当前元素位置

                    // var newData = data;

                    // if (data.purchasePriceD < 0) {
                    //     newData.purchasePriceD = 0
                    //     // alert(data.purchasePriceD)
                    // }

                    // var r = /^[+]?[1-9]?[0-9]*\.[0-9]*$/;

                    // if (r.test(data.purchasingQuantity)) {
                    //     var arr = data.purchasingQuantity.toString().split('.');
                    //     newData.purchasingQuantity = arr[0]
                    // }
                    // if (data.purchasingQuantity <= 0) {
                    //     newData.purchasingQuantity = null;
                    // }

                    // newData.totalPurchaseAmountD =$.storehouseAddApp.accMul(data.purchasePriceD,data.purchasingQuantity);

                    // //$.storehouseAddApp.store.remove(data);

                    // //$.storehouseAddApp.store.addAt(newData, index);


                    // var num = 0;
                    // for (var i = 0, length = $.storehouseAddApp.grid.getCount(); i < length; i++) {

                    //     var item = $.storehouseAddApp.grid.getItemAt(i);
                    //     if (item.purchasePriceD && item.purchasingQuantity) {
                    //         num += item.purchasePriceD * item.purchasingQuantity;
                    //     }

                    // }
                    // $("#totalFeeD").val(Number(num.toFixed(4)));

                });


                $("#relevance").on("click", function () {
                    if ($("#inWarehouseCode").val() == ""|| $("#inWarehouseCode").val() ==null) {
                        BUI.Message.Alert('请先添加调入仓库！', 'warning');
                        return;
                    }else if ($("#outWarehouseCode").val() == ""|| $("#outWarehouseCode").val() ==null) {
                        BUI.Message.Alert('请先添加调出仓库！', 'warning');
                        return;
                    }else if ($("#inWarehouseCode").val() ==  $("#outWarehouseCode").val() ) {
                        BUI.Message.Alert('出入库仓库不能相同！', 'warning');
                        return;
                    }else{
                        $.storehouseAddApp.dialog.render();
                        $.storehouseAddApp.dialog.get('loader').load({});
                        $.storehouseAddApp.dialog.show();
                        $(".bui-dialog").css("height","auto");
                        $(".bui-dialog")[0].style.top = '120px';
                        $(".bui-grid-width .bui-grid-body").css("overflow-y","scorll")
                    }                    
                });

                //供应商对应的商品

                $("#inWarehouseCode").on("change", function (e) {
                    var inindex = e.target.selectedIndex
                    if (inindex != 0) {
                        var inListindex = inindex - 1
                        var inCode = $("#inWarehouseCode").val();
                            $.storehouseAddApp.store.data = [];
                            $.storehouseAddApp.inWarehouseCode = inCode;
                            $.storehouseAddApp.store.load({});
                            $.storehouseAddApp.skuArray = [];  //供应商下拉的改变，商品数组清空
                            $.storehouseitemSelect.warehouseInfoInId = inCode;
                        var storedatas = $.storehouseAddApp.warehouse
                            $("#receiverProvince").attr("value", storedatas[inListindex]['province']);
                            $("#receiverProvince").trigger("change");
                            $("#receiverAddress").val(storedatas[inListindex]["address"])
                            $("#receiverCity").attr("value", storedatas[inListindex]['city']);
                            $("#receiverCity").trigger("change");
                    }else{
                            $("#receiverProvince").attr("value", "");
                            $("#receiverProvince").trigger("change");
                            $("#receiverAddress").val("")
                            $("#receiverCity").attr("value", "");
                    }
                    $.storehouseAddApp.changeWarehouse();
                });
                /*选择的仓库*/
                $("#outWarehouseCode").on("change",function(e){
                    var outindex = e.target.selectedIndex 
                    if (outindex != 0) {
                        var outListindex = outindex - 1
                        var outCode=$("#outWarehouseCode").val();
                            $.storehouseitemSelect.warehouseInfoOutId = outCode; 
                            $.storehouseAddApp.store.load({});
                            $.storehouseAddApp.skuArray = []; 
                        var storedata = $.storehouseAddApp.warehouse
                            $("#senderProvince").attr("value", storedata[outListindex]['province']);
                            $("#senderProvince").trigger("change");
                            $("#senderCity").attr("value", storedata[outListindex]['city']);
                            $("#senderAddress").val(storedata[outListindex]["address"])
                    }else{
                            $("#senderProvince").attr("value", "");
                            $("#senderProvince").trigger("change");
                            $("#senderCity").attr("value", "");
                            $("#senderAddress").val("")
                    }  
                    $.storehouseAddApp.changeWarehouse();
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
                    BUI.Message.Confirm("您确认要提交吗？"+'<br><label style="color: #999999;">' + '确认后调拨单将流转至审核模块。' + '</label>',function (){
                        form.valid();
                    if (!editing.isValid()) {
                        return
                    }
                    var str = $.storehouseAddApp.store.getResult();
                    var formData = form.serializeToObject();
                    if (str == '[]' || str.length < 1) {//未选择商品
                        $("#itemsMsg").text("未添加商品");
                        return;
                    }

                    $.each(str,function(index,obj){
                        if(obj.inventoryNum&&obj.inventoryNum!=""&&obj.inventoryNum<obj.planAllocateNum){
                            BUI.Message.Alert("“调拨数量”不能大于“调出仓库的实时库存”！","warning");
                            return;
                        }
                    });

                    for(var i=0;i<str.length;i++){
                        if(str[i]["productDate"]){
                           var productDate =new Date(str[i]["productDate"]); 
                           str[i]["productDate"]= productDate.Format("yyyy-MM-dd");
                        }
                        if(str[i]["expireDate"]){
                            var expireDate = new Date(str[i]["expireDate"]);
                            str[i]["expireDate"]= expireDate.Format("yyyy-MM-dd")
                        }
                        str[i]['inventoryType'] = formData.inventoryType[i]
                    };
                    str = BUI.JSON.stringify($.storehouseAddApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    // form.getField('gridValue').set('value', str);
                    formData.skuDetailList = str
                    formData.isReview = 1 //是否提交审核标识，1：是，非1或者不传：否
                    // var warehouseInfoInId=$("#outWarehouseCode").val();
                    // var urlStr = 'purchaseOrderAudit';
                    if (form.isValid()) {
                        
                        $.showLoadMask();
                        $.storehouseAddApp.save(formData, '', '');
                    }
                    window.setTimeout(function () {
                        $("#save_btn").attr("disabled",false);
                    },500);
                    },"warning");
                });

                $("#save_btn").on("click", function () { //保存
                    var str = $.storehouseAddApp.store.getResult();
                    var formData = form.serializeToObject();
                    // if (str == '[]' || str.length < 1) {//未选择商品
                    //         $("#itemsMsg").text("未添加商品");
                    //         return;
                    //     }
                    for(var i=0;i<str.length;i++){
                        if(str[i]["productDate"]){
                           var productDate =new Date(str[i]["productDate"]); 
                           str[i]["productDate"]= productDate.Format("yyyy-MM-dd");
                        }
                        if(str[i]["expireDate"]){
                            var expireDate = new Date(str[i]["expireDate"]);
                            str[i]["expireDate"]= expireDate.Format("yyyy-MM-dd")
                        }
                        str[i]['inventoryType'] = formData.inventoryType[i]
                    };
                    str = BUI.JSON.stringify($.storehouseAddApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    formData.skuDetailList = str
                    var warehouseInfoInId=$("#outWarehouseCode").val();
                    // var urlStr = 'purchaseOrderAudit';
                    $.showLoadMask();
                    $.storehouseAddApp.save(formData, '', '');
                    window.setTimeout(function () {
                        $("#save_btn").attr("disabled",false);
                    },500);                   
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "storehouseList.html";
                    //window.history.go(-1);
                });

            });
        },
        /**
         * 查询采购组
         */
        queryPurchaseGroup: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "purchase/warehouse";//查询启用状态下的采购组
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.storehouseAddApp.warehouse = result.result
                    $.AddItem2('outWarehouseCode', result.result, 'code', 'warehouseName', '请选择',["operationalNature","operationalNature"]);
                    $.AddItem2('inWarehouseCode', result.result, 'code', 'warehouseName', '请选择',["operationalNature","operationalNature"]);
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
            aContent.url = $.scmServerUrl + 'allocateOrder/save';
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href='storehouseList.html';
                }
            };
            aContent.complete = function () {
                $.hideLoadMask();
            };
            $.ajax(aContent);
        },
        accMul:function(arg1, arg2){
            if (arg1) {
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
        },
        inventoryTypeChange:function(obj,index){
            var record=$.storehouseAddApp.store.findByIndex(index);
            //console.log(record.inventoryType);
            record.inventoryType=$(obj).val();
            //console.log(record.inventoryType);
            $.storehouseAddApp.queryInventoryNum();
        },
        queryInventoryNum:function(){
            var records=$.storehouseAddApp.store.getResult();
            var queryStrArr=[];
            $.each(records,function(index,item){
                queryStrArr.push({skuCode:item.skuCode,inventoryType:item.inventoryType||"1"});
            });
            if(queryStrArr.length>0){
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + 'allocateOrder/inventoryQuery/'+$("#outWarehouseCode").val();
                aContent.data = {warehouseCode:$("#outWarehouseCode").val(),queryStr:BUI.JSON.stringify(queryStrArr)};
                aContent.type = "POST";
                aContent.success = function (result, textStatus) {
                    if (result.appcode != 1) {
                    } else {
                        var gridResult=$.storehouseAddApp.store.getResult();
                        $.each(gridResult,function(i,n){
                            //n.inventoryNum=result.result[n.skuCode]||"";
                            n.inventoryNum=result.result[n.skuCode];
                            if(n.inventoryNum==null||typeof(n.inventoryNum) == "undefined"||n.inventoryNum==="")
                            {
                                n.inventoryNum="";
                            }
                        });
                        $.each(result.result,function(k,v){
                            $("#sp_"+k).html(v);
                        });
                        //$.storehouseAddApp.store.load({});
                    }
                };
                aContent.error=function(x,t,e){

                };
                $.ajax(aContent);
            }
        },
        changeWarehouse:function(){
            var inWarehouseCodeOption=$("#inWarehouseCode option:selected");
            var outWarehouseCodeOption=$("#outWarehouseCode option:selected");
            $.storehouseAddApp.isJdWareHouse=false;
            if(inWarehouseCodeOption.attr("operationalNature")=="0"||outWarehouseCodeOption.attr("operationalNature")=="0"){
                $.storehouseAddApp.isJdWareHouse=true;
            }
        }
    };
    $(document).ready(function (e) {        
        $.storehouseAddApp.init();
    });
}(jQuery));
