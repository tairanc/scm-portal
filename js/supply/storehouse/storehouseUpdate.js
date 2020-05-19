/**
 * Created by sone on 2017/6/21.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?operateType=0&entityType=PurchaseOrder&entityId=" + $.getUrlParam("id"));
    });

    function queryLists(){

        // $.storehouseUpdateApp.querySuppliers();
        // $.storehouseUpdateApp.queryPurchaseTypeList();
        // $.storehouseUpdateApp.queryPayTypeList();
        $.storehouseUpdateApp.queryWareHouseList();
        // $.storehouseUpdateApp.queryCurrencyType();
        //$.storehouseUpdateApp.queryWarehouses();
        // $.storehouseUpdateApp.refundCostsTake();
        // $.storehouseUpdateApp.handlerPriority();
        $.storehouseUpdateApp.queryCountryList();        
        setTimeout(function () {
            $.storehouseUpdateApp.init()
        },500);
    }

    $.storehouseUpdateApp = {
        data: null,
        dialog: null,
        grid: null,
        store: null,
        isJdWareHouse:false,
        skuArray:new Array(),//用于存放sku的数组
        delsIds:[],
        sku:null,
        warehouseInfoId: null,
        warehouseListArray:new Array(),
        purchasePersonId:null,  //定义全局的采购组员的变量用户数据回显
        warehouseCode:null,
        warehouseId:null,
        inWarehouseCode:null,
        outWarehouseCode:null,
        rmb: 'rmb',
        dollar: 'dollar',
        warehouse:null,

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
          var id = $.getUrlParam("allocateOrderCode")
          
          // console.log($.getUrlParam('flag'));
            BUI.use(['bui/grid','bui/form','bui/tooltip','bui/data','bui/overlay'],function(Grid,Form, Tooltip,Data,Overlay){

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
                            //editor: {xtype:'hidden'},
                            renderer: function (val,record,index) {
                                if (val == 2) {
                                    return `<select name="inventoryType" data-rules="{required:true}" onchange="$.storehouseUpdateApp.inventoryTypeChange(this,`+index+`)">
                                             <option value="1">正品</option>
                                             <option value="2" selected>残品</option>
                                         </select>`;
                                    
                                }else{
                                    return `<select  name="inventoryType" data-rules="{required:true}" onchange="$.storehouseUpdateApp.inventoryTypeChange(this,`+index+`)">
                                             <option value="1" selected>正品</option>
                                             `+($.storehouseUpdateApp.isJdWareHouse?'':'<option value="2">残品</option>')+`
                                         </select>`;
                                }
                                // return '<input type="text" value="' + (val ? val : "") + '" style="pointer-events: none;">';
                            }
                        },
                        {sortable: false, title: '调出仓实时库存', dataIndex: 'inventoryNum', width: '110px', elCls: 'center',renderer:function(val,record,index){
                                return '<span id="sp_'+record.skuCode+'">'+((val==null||val==="") ? "-": val)+'</span>';
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
                data = $.storehouseUpdateApp.data;
                var editing = new Grid.Plugins.CellEditing()
                function valiFn(value,newRecord) {
                    //alert($( "this [data-column-field='purchasePrice'] span").text())
                    // var purchasePriceD = newRecord.purchasePriceD ; //进价
                    // var purchasingQuantity =  newRecord.purchasingQuantity;//采购数量

                    // if(purchasePriceD!=undefined && purchasingQuantity!=undefined) {
                    //     $("[data-column-field='totalPurchaseAmountD'] span").text(purchasePriceD * purchasingQuantity)
                    // }
                };



                $.storehouseUpdateApp.store = new Store({
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

                
                $.storehouseUpdateApp.dialog = new Overlay.Dialog({
                    title: '关联商品',
                    width: 1000,
                    height: 710,
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'storehouseitemSelectUpdate.html',
                        //autoLoad: true, //不自动加载
                        callback: function (text) {
                            $("#itemsMsg").text("");
                        }
                    },
                });
                $.storehouseUpdateApp.grid = new Grid.Grid({
                    render: '#Items',
                    columns: columns,
                    width: "100%",
                    /*emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',*/
                    forceFit: false,
                    store: $.storehouseUpdateApp.store,
                    plugins:[BUI.Grid.Plugins.RowNumber,editing],
                });

                $.storehouseUpdateApp.grid.render();

                $.storehouseUpdateApp.grid.on('cellclick', function (e) {
                    var record = e.record;
                    var domTarget = e.domTarget;
                    switch (domTarget.className) {
                        case "grid-command deleteClassify":
                            $.storehouseUpdateApp.store.remove(record);
                            var num = 0;
                            for (var i = 0, length = $.storehouseUpdateApp.grid.getCount(); i < length; i++) {

                                var item = $.storehouseUpdateApp.grid.getItemAt(i);
                                if(item.purchasePriceD && item.purchasingQuantity){
                                    num += item.purchasePriceD * item.purchasingQuantity;
                                }

                            }
                            $("#totalFeeD").val(Number(num.toFixed(4)));
                            //sku数组删除本条记录的SKU
                            $.storehouseUpdateApp.skuArray.splice($.inArray(record.skuCode,$.storehouseUpdateApp.skuArray),1)
                            //delRecord.push(record.id);
                            if(record.id){
                                $.storehouseUpdateApp.delsIds.push(record.id);
                            }
                            break;
                    }
                });

                $.storehouseUpdateApp.grid.on('itemupdated', function (ev) {

                    var data = ev.item;
                    // var index = $.storehouseUpdateApp.store.findIndexBy(data); //当前元素位置

                    // var newData = data;

                    // if(data.purchasePriceD<0){
                    //     newData.purchasePriceD=0
                    // }

                    // var r= /^[+]?[1-9]?[0-9]*\.[0-9]*$/;

                    // if( r.test(data.purchasingQuantity)){
                    //     var arr = data.purchasingQuantity.toString().split('.');
                    //     newData.purchasingQuantity=arr[0]
                    // }

                    // newData.totalPurchaseAmountD =$.storehouseUpdateApp.accMul(data.purchasePriceD,data.purchasingQuantity);


                    // //$.storehouseUpdateApp.store.remove(data);

                    // //$.storehouseUpdateApp.store.addAt(newData, index);


                    // var num = 0;
                    // for (var i = 0, length = $.storehouseUpdateApp.grid.getCount(); i < length; i++) {

                    //     var item = $.storehouseUpdateApp.grid.getItemAt(i);
                    //     if(item.purchasePriceD && item.purchasingQuantity){
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
                        // $("#itemsMsg").text("");
                        $.storehouseUpdateApp.dialog.render();
                        $.storehouseUpdateApp.dialog.get('loader').load({});
                        $.storehouseUpdateApp.dialog.show();
                        $(".bui-dialog").css("height","auto");
                        $(".bui-dialog")[0].style.top = '120px';
                        $(".bui-grid-width .bui-grid-body").css("overflow-y","scorll")
                    }                                    
                });

                //供应商对应的商品

                $("#inWarehouseCode").on("change",function (e) {
                    var inindex = e.target.selectedIndex
                    if (inindex != 0) {
                        var inListindex = inindex - 1
                        var value = $("#inWarehouseCode").val();
                            $.each($.storehouseUpdateApp.grid.getRecords(),function(index, el) {
                                if(el.id){
                                    $.storehouseUpdateApp.delsIds.push(el.id);
                                }
                            });
                            $.storehouseUpdateApp.store.data=[];

                            $.storehouseUpdateApp.inWarehouseCode = value;
                            $.storehouseUpdateApp.store.load({});
                            $.storehouseUpdateApp.skuArray = [];  //供应商下拉的改变，商品数组清空
                            $.storehouseitemSelectUpdate.warehouseInfoInId = value;
                        var storedatas = $.storehouseUpdateApp.warehouse
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
                    $.storehouseUpdateApp.changeWarehouse();   
                });
                /*选择的仓库*/ 
                $("#outWarehouseCode").on("change",function(e){  
                    var outindex = e.target.selectedIndex 
                    if (outindex != 0) {
                        var outListindex = outindex - 1
                        var outCode=$("#outWarehouseCode").val();
                            $.each($.storehouseUpdateApp.grid.getRecords(),function(index, el) {
                                if(el.id){
                                    $.storehouseUpdateApp.delsIds.push(el.id);
                                }
                            });
                            $.storehouseUpdateApp.store.data=[];
                            // var val=$.storehouseUpdateApp.warehouseListArray[warehouseValue].id;               
                            $.storehouseitemSelectUpdate.warehouseInfoOutId = outCode;  
                            $.storehouseUpdateApp.store.load({});
                            $.storehouseUpdateApp.skuArray = []; 
                            $.storehouseUpdateApp.outWarehouseCode = outCode; 
                        var storedata = $.storehouseUpdateApp.warehouse
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
                    $.storehouseUpdateApp.changeWarehouse();              
                });
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();
                $.storehouseUpdateApp.form = form;

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
                    BUI.Message.Confirm("您确认要提交吗？"+'<br><label style="color: #999999;">' + '确认后调拨单将流转至审核模块。' + '</label>',function () {
                        form.valid();
                        if (!editing.isValid()) {
                            return

                    }

                    var str = $.storehouseUpdateApp.store.getResult();


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

                    var formData = form.serializeToObject();
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
                    str = BUI.JSON.stringify($.storehouseUpdateApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    form.getField('gridValue').set('value', str);
                    
                    formData.skuDetailList = str
                    formData.isReview = 1 //是否提交审核标识，1：是，非1或者不传：否
                    // var warehouseInfoInId=$("#outWarehouseCode").val();
                    // var urlStr = 'purchaseOrderAudit';                    
                    if (form.isValid()) {
                        
                        $.showLoadMask();
                        $.storehouseUpdateApp.save(formData, '', '');
                    }
                    window.setTimeout(function () {
                        $("#save_btn").attr("disabled",false);
                    },500);
                    },'warning');                   

                });

                $("#save_btn").on("click", function () { //保存
                    // form.valid();
                    // if (!editing.isValid()) {
                    //     return
                    // }
                    var str = $.storehouseUpdateApp.store.getResult();
                    // if (str == '[]' || str.length < 1) {//未选择商品
                    //         $("#itemsMsg").text("未添加商品");
                    //         return;
                    // }
                    var formData = form.serializeToObject();
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
                    str = BUI.JSON.stringify($.storehouseUpdateApp.store.getResult());// 提交前将grid的数据存储到隐藏域，一起提交
                    form.getField('gridValue').set('value', str);
                    
                    formData.skuDetailList = str
                    var warehouseInfoInId=$("#outWarehouseCode").val();
                    // var urlStr = 'purchaseOrderAudit';                    
                    // if (form.isValid()) {
                        $.showLoadMask();
                        $.storehouseUpdateApp.save(formData, '', '');
                    // }               
                    window.setTimeout(function () {
                        $("#save_btn").attr("disabled",false);
                    },500);                   
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "storehouseList.html";
                });

                var trueid = $.getUrlParam("allocateOrderCode")
                var aContent = $.AjaxContent();
                var flag = $.getUrlParam('flag');
                aContent.url = $.scmServerUrl + "allocateOrder/editGet/"+trueid+"?flag="+flag;//查询采购的员工的地址
                // aContent.data = {id: trueid};
              aContent.success = function (result, textStatus) {
                    if(!result){
                        BUI.Message.Alert(result.databuffer, "warning");
                    }else {
                        //显示表格里面的tbody
                        if (result.result.skuDetailList==null) {result.result.skuDetailList=[];}
                        $.storehouseUpdateApp.filePurchaseOrderForm(result);
                        $.storehouseUpdateApp.store.add(result.result.skuDetailList);                     

                        var num  = 0;
                        $.each(result.result.skuDetailList,function (index,item) {
                            $.storehouseUpdateApp.skuArray.push(item.skuCode);
                            
                        })

                    }}

                    $.ajax(aContent)

            });
        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (result) {
            // var aContent = $.AjaxContent();
            // aContent.url = $.scmServerUrl+"allocateOrder/editGet/"+id;
            // aContent.data = {};
            // aContent.async=false;
            // aContent.success = function(result,textStatus){
            //     if(result.appcode != 1){
            //         BUI.Message.Alert("查询采购单失败","warning");
            //     }else{
                    var purcharseDtl = result.result;

                    $("#allocateOrderCode").val(purcharseDtl.allocateOrderCode);
                    $.storehouseUpdateApp.purchasePersonId=purcharseDtl.purchasePersonId;  //赋值全局变量
                    $("#inWarehouseCode").val(purcharseDtl.inWarehouseCode)
                    $("#outWarehouseCode").val(purcharseDtl.outWarehouseCode); 
                    $.storehouseUpdateApp.inWarehouseCode=purcharseDtl.inWarehouseCode;
                    $.storehouseUpdateApp.outWarehouseCode=purcharseDtl.outWarehouseCode;
                    $.storehouseitemSelectUpdate.warehouseInfoInId = purcharseDtl.inWarehouseCode;
                    $.storehouseitemSelectUpdate.warehouseInfoOutId = purcharseDtl.outWarehouseCode;

                    if($("#inWarehouseCode").val()==""){
                        BUI.Message.Alert("调入仓库已被停用，请重新选择", 'warning');
                    }
                    if($("#outWarehouseCode").val()==""){
                        BUI.Message.Alert("调出仓库已被停用，请重新选择", 'warning');
                    }

                    $("#memo").val(purcharseDtl.memo)

                    // $("#senderProvince").val(purcharseDtl.senderProvince)       
                    // $("#senderCity").val(purcharseDtl.senderCity) 
                    $("#sender").val(purcharseDtl.sender);
                    $("#senderProvince").attr("value", purcharseDtl['senderProvince']);
                    $("#senderProvince").trigger("change");
                    $("#senderCity").attr("value", purcharseDtl['senderCity']); 
                    
                    // $("#senderCity").trigger("change");                       
                    $("#senderMobile").val(purcharseDtl.senderMobile)
                    $("#senderAddress").val(purcharseDtl.senderAddress)

                                 
                    // $("#reciverProvince").val(purcharseDtl.reciverProvince)       
                    // $("#reciverCity").val(purcharseDtl.reciverCity) 
                    $("#receiver").val(purcharseDtl.receiver) 
                    $("#receiverProvince").attr("value", purcharseDtl['receiverProvince']);
                    $("#receiverProvince").trigger("change");
                    $("#receiverCity").attr("value", purcharseDtl['receiverCity']);
                    
                    // $("#receiverCity").trigger("change");                         
                    $("#receiverMobile").val(purcharseDtl.receiverMobile)
                    $("#receiverAddress").val(purcharseDtl.receiverAddress)

                    $.storehouseUpdateApp.changeWarehouse();

                    // $.storehouseUpdateApp.store.add(result)
                    // $.storehouseUpdateApp.skuArray.push(purcharseDtl.skuDetailList);
                    // $.storehouseUpdateApp.init(purcharseDtl.skuDetailList);
                    
                    // $.storehouseUpdateApp.skuArray.push(purcharseDtl.skuDetailList);
                    //列表
                    // $.each(purcharseDtl.skuDetailList,function (index,item) {
                    //     $.storehouseUpdateApp.skuArray.push(item);
                    // }) 
                      
                // }
            // };
            // $.ajax(aContent);
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
         * 查询采购组
         */
        queryWareHouseList:function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/warehouse";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.storehouseUpdateApp.warehouse = result.result
                    $.AddItem2('outWarehouseCode', result.result, 'code', 'warehouseName', '请选择',["operationalNature","operationalNature"]);
                    $.AddItem2('inWarehouseCode', result.result, 'code', 'warehouseName', '请选择',["operationalNature","operationalNature"]);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询启用状态的收货仓库
         */
        // queryWarehouses:function () {
        //     var initWarehouseVal = $("#outWarehouseCode").val();
        //     var aContent = $.AjaxContent();
        //     aContent.url = $.scmServerUrl + "purchase/warehouse";//查询采购的员工的地址
        //     aContent.data = {};
        //     aContent.async=false;
        //     aContent.success = function(result,textStatus){
        //         if(result.appcode != 1){
        //             $("#initOption").remove();
        //              BUI.Message.Alert(result.databuffer,'warning');
        //         }else{
        //             //显示表格里面的tbody
        //             var  resultList =  result.result;
        //             console.log(result)
        //             if(!resultList){
        //                 $("#outWarehouseCode").data("warning",result.databuffer);
        //             }else{
        //                 $.storehouseUpdateApp.warehouseListArray=resultList;
        //                 var length = resultList.length;
        //                 if(length==0){
        //                     var option = $('<option value=""' + '>'+'无仓库 请先添加仓库'+'</option'+'>');
        //                     $("#outWarehouseCode").append(option)
        //                 }else{
        //                     $("#initOption").remove();
        //                     for(var i=0;i<length;i++){                            
        //                         var option = $('<option value="' + i + '">' + resultList[i]['outWarehouseCode'] + '</option' + '>');
        //                         $("#outWarehouseCode").append(option);
        //                     }
        //                     var warehouseIndex=0;
        //                     for(i=0;i<$.storehouseUpdateApp.warehouseListArray.length;i++){
        //                         if($.storehouseUpdateApp.warehouseListArray[i].id==$.storehouseUpdateApp.warehouseInfoId){
        //                             warehouseIndex= i;
        //                             break;
        //                         }
        //                     };   
        //                     if(($("#outWarehouseCode").val()!=initWarehouseVal)&&warehouseIndex==0){
        //                         var val=$.storehouseUpdateApp.warehouseListArray[0].id;               
        //                         $.storehouseitemSelectUpdate.warehouseInfoOutId = val; 
        //                         //$.storehouseUpdateApp.store.load({});
        //                         $.storehouseUpdateApp.skuArray = [];  
        //                         $("#totalFeeD").val(0);  
        //                     }           
        //                 $("#outWarehouseCode").find("option[value='"+ warehouseIndex+"']").attr("selected",true);//收货仓库赋值
        //                 }
        //             }                    
        //         }
        //     };
        //     aContent.error =function(XMLHttpRequest){
        //         var result = "";
        //         if (XMLHttpRequest.responseText) {
        //             result = XMLHttpRequest.responseText;
        //             if (!(result instanceof Object)) {
        //                 try {
        //                     result = JSON.parse(result);
        //                 } catch (e) {

        //                 }
        //             }
        //         }
        //         if (XMLHttpRequest.status == 401) {
        //             BUI.Message.Alert(result.databuffer || "",function(){
        //                 var aContent = $.AjaxContent();
        //                 aContent.type = "POST";
        //                 aContent.url = $.scmServerUrl + "account/user/logout/";
        //                 aContent.success = function () {
        //                     if (window.location.origin.indexOf('tairanmall.com') != -1) {
        //                         var redirectUrl = window.location.origin + "/supply/selectChannel.html";
        //                         window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
        //                     } else {
        //                         window.location.href = '/supply/login.html';
        //                     }
        //                     localStorage.clear();
        //                 };
        //                 $.ajax(aContent);
        //                 this.close();
        //             },'error');
        //         } else if (XMLHttpRequest.status == 403) {
        //             if (result.appcode == 0) {
        //                 if (window.location.origin.indexOf('tairanmall.com') != -1) {
        //                     var redirectUrl = window.location.origin + "/supply/selectChannel.html";
        //                     window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
        //                 } else {
        //                     window.location.href = '/supply/login.html';
        //                 }
        //             }
        //         } else if (XMLHttpRequest.status == 404) {
        //             window.top.location = "/supply/404.html";
        //         } else if (XMLHttpRequest.status == 500) {
        //             window.top.location = "/supply/500.html";
        //         } else {
        //             if (result.appcode == 0) {                        
        //                 BUI.Message.Alert(result.databuffer || "", 'error');
        //                 $("#initOption").remove();
        //                 var empOption = $('<option id="empOption" value="empOption"' + '>' + '请选择' + '</option' + '>');
        //                 $("#outWarehouseCode").append(empOption); 
        //             }
        //         }
        //     }
        //     $.ajax(aContent);
        // },
        /***
         * 保存供应组
         * @param fromData
         */
        save: function (fromData, tip, urlStr) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + 'allocateOrder/save';
            aContent.data = fromData;
            aContent.data.delsIds=$.storehouseUpdateApp.delsIds.join(",");
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');                    
                }else{
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
            var record=$.storehouseUpdateApp.store.findByIndex(index);
            //console.log(record.inventoryType);
            record.inventoryType=$(obj).val();
            //console.log(record.inventoryType);
            $.storehouseUpdateApp.queryInventoryNum();
        },
        queryInventoryNum:function(){
            var records=$.storehouseUpdateApp.store.getResult();
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
                        var gridResult=$.storehouseUpdateApp.store.getResult();
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
            $.storehouseUpdateApp.isJdWareHouse=false;
            if(inWarehouseCodeOption.attr("operationalNature")=="0"||outWarehouseCodeOption.attr("operationalNature")=="0"){
                $.storehouseUpdateApp.isJdWareHouse=true;
            }
        }
    };
    $(document).ready(function(e) {
        queryLists();
    });
}(jQuery));
