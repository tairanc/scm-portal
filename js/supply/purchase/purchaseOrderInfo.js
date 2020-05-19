/**
 * Created by sone on 2017/6/20.
 */
$(function(){


    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=PurchaseOrder&operateType=0&entityId=" + $.getUrlParam("id"));
    });

    $.purchaseOrderInfoApp = {

        rmb :'rmb',
        dollar:'dollar',

        HOLD:'0',//暂存
        AUDIT:'3',//提交审核
        PASS:'2',//("2","审核通过"),
        REJECT:'1',//("1","审核驳回"),
        RECEIVE_ALL:'4',//("4","全部收货"),
        RECEIVE_EXCEPTION:'5',//("5","收货异常"),
        FREEZE:'6',//("6","冻结"),
        CANCEL:'7',//("7","作废"),
        WAREHOUSE_NOTICE:'8',//("8","入库通知");

        init:function(){

            var id = $.getUrlParam("id")

            $.purchaseOrderInfoApp.filePurchaseOrderForm(id); //填充采购单部分

        	BUI.use(['bui/form','bui/grid','bui/tooltip', 'bui/data'],function(Form,Grid,Tooltip, Data){

                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

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
                });

                var Store = Data.Store,
                    columns = [
                        {title: '商品SKu名称', dataIndex: 'skuName',width: '150px', elCls: 'center'},
                        {title: '商品SKU编号', dataIndex: 'skuCode', width: "150px", elCls: 'center'},
                        {title: '规格', dataIndex: 'specNatureInfo', width: "150px", elCls: 'center'},
                        {title: '货号', dataIndex: 'itemNo', width: "150px", elCls: 'center'},
                        {title: '条形码', dataIndex: 'barCode', width: "150px", elCls: 'center'},
                        {title: '品牌名称', dataIndex: 'brandName', width: "150px", elCls: 'center'},
                        {title: '一级分类-二级分类-三级分类', dataIndex: 'allCategoryName', width: "170px", elCls: 'center'},
                        {title: '进价'+'<span id="purchasePriceD"></span>', dataIndex: 'purchasePrice', width: "150px", elCls: 'center'},
                        {title: '采购数量', dataIndex: 'purchasingQuantity', width: "150px", elCls: 'center'},
                        {title: '采购总金额'+'<span id="totalPurchaseAmountD"></span>', dataIndex: 'totalPurchaseAmount', width: "150px", elCls: 'center'},
                        {title: '批次号', dataIndex: 'batchCode', width: "150px", elCls: 'center'},
                        {title: '生产编码', dataIndex: 'produceCode', width: "150px", elCls: 'center'},
                        {title: '生产日期', dataIndex: 'productDate', width: "150px", elCls: 'center'},
                        {title: '截止保质日期', dataIndex: 'expireDate', width: "150px", elCls: 'center'},
                        {title: '理论保质期限(天)', dataIndex: 'shelfLifeDays', width: "150px", elCls: 'center'}
                    ]

                    //data = [{a: '香水1号', b: "123645565", c: "纪梵希", d: "美妆/护肤品/香水", e: "800.00", f: "500", g: "400,000"}];

                var store = new Store({
                        url : $.scmServerUrl + "purchase/purchaseDetail",
                        proxy : {
                            method : 'get',
                            dataType : 'json' //返回数据的类型
                        },
                        autoLoad:true,
                        params:{purchaseId: id}
                    }),
                    grid = new Grid.Grid({
                        render: '#Items',
                        width: '100%',//如果表格使用百分比，这个属性一定要设置
                        columns: columns,
                        idField: 'a',
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: store,
                        plugins:[BUI.Grid.Plugins.RowNumber],
                    });

                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                grid.render();

                $("#btn_list").on("click",function(){
                    window.location.href = "purchaseOrderList.html";
                    //window.history.go(-1);
                });

            });
        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/purchaseOrder/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询采购单失败","warning");
                }else{
                    var purcharseDtl = result.result;
                    $("#purchaseOrderCode").val(purcharseDtl.purchaseOrderCode)
                    $("#supplierName").text(purcharseDtl.supplierName)
                    $("#contractCode").text(purcharseDtl.contractCode)
                    $("#purchaseTypeName").text(purcharseDtl.purchaseTypeName==null?"":purcharseDtl.purchaseTypeName)
                    $("#payTypeName").text(purcharseDtl.payTypeName ==null?"":purcharseDtl.payTypeName)
                    $("#payType").text(purcharseDtl.payType ==null ? "":purcharseDtl.payType)
                    if(purcharseDtl.payType=='deliveryAfterPayment'){ //先付款后发货
                        $("#paymentProportionDiv").attr("hidden",false)
                    }
                    $("#paymentProportion").text(purcharseDtl.paymentProportion == null ? "":purcharseDtl.paymentProportion)
                    $("#purchaseGroupName").text(purcharseDtl.purchaseGroupName == null ? "" :purcharseDtl.purchaseGroupName);
                    $("#purchasePerson").text(purcharseDtl.purchasePerson ==null ? "": purcharseDtl.purchasePerson)
                    $("#currencyTypeName").text(purcharseDtl.currencyTypeName ==null ? "" :purcharseDtl.currencyTypeName)
                    if(purcharseDtl.currencyType == $.purchaseOrderInfoApp.dollar){
                        $("#totalFeeTip").text('美元');
                        $("#purchasePriceD").text('(美元)');
                        $("#totalPurchaseAmountD").text('(美元)');
                    }
                    if(purcharseDtl.currencyType == $.purchaseOrderInfoApp.rmb){
                        $("#totalFeeTip").text('元');
                        $("#purchasePriceD").text('(元)');
                        $("#totalPurchaseAmountD").text('(元)');
                    }
                    $("#warehouseName").text(purcharseDtl.warehouseName == null ? "":purcharseDtl.warehouseName)
                    $("#receiveAddress").text(purcharseDtl.receiveAddress)
                    $("#transportFeeDestIdName").text(purcharseDtl.transportFeeDestIdName ==null ? "":purcharseDtl.transportFeeDestIdName)
                    $("#takeGoodsNo").text(purcharseDtl.takeGoodsNo)
                    $("#requriedReceiveDate").text(purcharseDtl.requriedReceiveDate)
                    $("#endReceiveDate").text(purcharseDtl.endReceiveDate)
                    $("#handlerPriorityName").text(purcharseDtl.handlerPriorityName == null ? "":purcharseDtl.handlerPriorityName)
                    $("#remark").text(purcharseDtl.remark)
                    $("#totalFee").text(purcharseDtl.totalFee)
                    $("#receiver").text(purcharseDtl.receiver)
                    $("#receiverNumber").text(purcharseDtl.receiverNumber)
                    $("#sender").text(purcharseDtl.sender)
                    $("#senderNumber").text(purcharseDtl.senderNumber)
                    $("#senderAddress").text(purcharseDtl.senderAddress)
                    $("#senderProvince").text(purcharseDtl.senderProvinceName)
                    $("#senderCity").text(purcharseDtl.senderCityName)
                    purcharseDtl.totalFee = 0;
                    var status = purcharseDtl.status;
                    /*  FREEZE:'6',//("6","冻结"),
                        CANCEL:'7',//("7","作废"),
                        WAREHOUSE_NOTICE:'8',//("8","入库通知");*/
                    if(status == $.purchaseOrderInfoApp.FREEZE){
                        $("#statusTip").text("冻结")
                        var html = "<button id='freeze_btn' type='button' class='button button-primary'>"+'解冻'+"</button>";
                        $("#buttonSpan").html(html)
                        $("#freeze_btn").on("click",function () { //冻结操作
                            $.purchaseOrderInfoApp.freeze(purcharseDtl);
                        })
                    }
                    if(status == $.purchaseOrderInfoApp.RECEIVE_EXCEPTION){
                        $("#statusTip").text("收货异常")
                    }
                    if(status == $.purchaseOrderInfoApp.RECEIVE_ALL){
                        $("#statusTip").text("全部收货")
                    }
                    if(status == $.purchaseOrderInfoApp.REJECT){//审核驳回的处理
                        $("#statusTip").text("审核驳回")
                        var html = "<button id='update_btn' type='button' class='button button-primary'>"+'编辑'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                        html+="<button id='delete_btn' type='button' class='button button-primary'>"+'删除'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;"
                        $("#buttonSpan").html(html)
                        $("#update_btn").on("click",function () {
                            window.location.href = "purchaseOrderUpdate.html"+"?"+"id="+id;
                        })
                        $("#delete_btn").on("click",function () {
                            $.purchaseOrderInfoApp.deleted(purcharseDtl)
                        })
                    }
                    if(status == $.purchaseOrderInfoApp.PASS){ //审核通过的处理的处理
                        $("#statusTip").text("审核通过")
                        var html = "<button id='warehouse_into_btn' type='button' class='button button-primary'>"+'入库通知'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                        html+="<button id='freeze_btn' type='button' class='button button-primary'>"+'冻结'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;"
                        html+="<button id='cancel_btn' type='button' class='button button-primary'>"+'作废'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;"
                        $("#buttonSpan").html(html)
                        $("#warehouse_into_btn").on("click",function () {
                            $.purchaseOrderInfoApp.warehouseInto(purcharseDtl);
                        })
                        $("#freeze_btn").on("click",function () { //冻结操作
                            $.purchaseOrderInfoApp.freeze(purcharseDtl);
                        })
                        $("#cancel_btn").on("click",function () {//作废操作
                            $.purchaseOrderInfoApp.cancel(purcharseDtl);
                        })
                    };
                    if(status == $.purchaseOrderInfoApp.AUDIT){ //提交审核处理
                        $("#statusTip").text("提交审核")
                    };
                    if(status == $.purchaseOrderInfoApp.CANCEL){ //提交审核处理
                        $("#statusTip").text("作废")
                    };
                    if(status == $.purchaseOrderInfoApp.HOLD){ //暂存的处理
                        $("#statusTip").text("暂存")
                        var html = "<button id='update_btn' type='button' class='button button-primary'>"+'编辑'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                        html+="<button id='delete_btn' type='button' class='button button-primary'>"+'删除'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;"
                        $("#buttonSpan").html(html)
                        $("#update_btn").on("click",function () {
                            window.location.href = "purchaseOrderUpdate.html"+"?"+"id="+id;
                        })
                        $("#delete_btn").on("click",function () {
                            $.purchaseOrderInfoApp.deleted(purcharseDtl)
                        })
                    };
                    if(status == $.purchaseOrderInfoApp.WAREHOUSE_NOTICE){ //入库通知
                        if(purcharseDtl.enterWarehouseNotice=="0"){//入库通知单的状态为待通知
                            var html = "<button id='cancel_btn' type='button' class='button button-primary'>"+'作废'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                            $("#buttonSpan").html(html)
                            $("#cancel_btn").on("click",function () {
                                $.purchaseOrderInfoApp.warehouseNoticeCancel(purcharseDtl);
                            })
                        }
                        $("#statusTip").text("入库通知");
                    };
                }
            };
            $.ajax(aContent);
        },
        warehouseInto:function (record) {
            BUI.Message.Confirm("您确认要入库通知吗？"+'<br><label style="color: #999999;">' + '确认后将产生入库通知单。' + '</label>',function () {
                $.ajax({
                    type: "PUT",
                    url:  $.scmServerUrl+"purchase/purchaseOrder/warahouseAdvice"+'/'+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "purchaseOrderList.html"; //作废之后，跳转采购单列表页面
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');
        },
        /**
         * 入库通知的作废操作
         */
        warehouseNoticeCancel:function (record) {
            BUI.Message.Confirm("您确认要作废吗？"+'<br><label style="color: #999999;">' + '确认后采购单及其相关单据将一并被作废。' + '</label>',function () {
                $.ajax({
                    type: "POST",
                    url:  $.scmServerUrl+"purchase/warahouseAdvice/cancellation"+'/'+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "purchaseOrderList.html"; //作废之后，跳转采购单列表页面
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');
        },

        freeze:function (record) {
            var msg = '';
            if(record.status == '6'){//‘解冻’信息
                msg = "您确认要解冻吗？"+'<br><label style="color: #999999;">' + '确认后采购单将恢复到冻结前的状态。' + '</label>';
            }
            if(record.status == '2'){//‘冻结’信息
                msg = "您确认要冻结吗？"+'<br><label style="color: #999999;">' + '确认后采购单将被冻结。' + '</label>';
            }
            BUI.Message.Confirm(msg,function () {
                $.ajax({
                    type: "PUT",
                    url:  $.scmServerUrl+"purchase/purchaseOrder/freeze"+'/'+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "purchaseOrderList.html"; //删除之后，跳转采购单列表页面
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');
        },
        /*
        删除
         */
        deleted : function (record) {
            BUI.Message.Confirm("您确认要删除吗？"+'<br><label style="color: #999999;">' + '删除后数据将不可恢复。',function () {
                $.ajax({
                    type: "PUT",
                    url:  $.scmServerUrl+"purchase/purchaseOrder/updateState"+'/'+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "purchaseOrderList.html"; //删除之后，跳转采购单列表页面
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');
        },
        /*
        作废
         */
        cancel : function (record) {
            BUI.Message.Confirm("您确认要作废吗？"+'<br><label style="color: #999999;">' + '确认后采购单及其相关单据将一并被作废。',function () {
                $.ajax({
                    type: "PUT",
                    url:  $.scmServerUrl+"purchase/purchaseOrder/updateState"+'/'+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "purchaseOrderList.html"; //删除之后，跳转采购单列表页面
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');
        },
    };
    $(document).ready(function(e) {
        $.purchaseOrderInfoApp.init();
    });
}(jQuery));
