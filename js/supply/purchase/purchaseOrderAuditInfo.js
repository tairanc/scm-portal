/**
 * Created by sone on 2017/6/20.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?&entityType=PurchaseOrder&entityId=" + $.getUrlParam("id"));
    });

    $.purchaseOrderAuditApp = {

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
            var auditStatus = $.getUrlParam("status")


            $.purchaseOrderAuditApp.filePurchaseOrderForm(id,auditStatus); //填充采购单部分

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

                $("#commit_btn").on("click",function () { //审核通过  status -- 2
                    $("#status").val(2)
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        $.purchaseOrderAuditApp.save(formData, tip);
                    }
                });

               $("#save_btn").on("click",function(){ //审核驳回  status -- 3
                   var value = $("#auditOpinion").val();
                   if(value==null || value ==""  ||value.trim()==""){
                       BUI.Message.Alert("请填写驳回意见","warning");
                        return;
                   }
                   $("#status").val(3)
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        $.purchaseOrderAuditApp.save(formData, tip);
                    }
                });


                $("#btn_list").on("click",function(){
                    window.location.href = "purchaseOrderAuditList.html";
                    //window.history.go(-1);
                });

            });
        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (id,auditStatus) {
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
                    $("#purchaseTypeName").text(purcharseDtl.purchaseTypeName)
                    $("#payTypeName").text(purcharseDtl.payTypeName)
                    $("#payType").text(purcharseDtl.payType)
                    if(purcharseDtl.payType=='deliveryAfterPayment'){ //先付款后发货
                        $("#paymentProportionDiv").attr("hidden",false)
                    }
                    $("#paymentProportion").text(purcharseDtl.paymentProportion)
                    $("#purchaseGroupName").text(purcharseDtl.purchaseGroupName)
                    $("#purchasePerson").text(purcharseDtl.purchasePerson)
                    $("#currencyTypeName").text(purcharseDtl.currencyTypeName)
                    if(purcharseDtl.currencyType == $.purchaseOrderAuditApp.dollar){
                        $("#totalFeeTip").text('美元');
                        $("#purchasePriceD").text('(美元)');
                        $("#totalPurchaseAmountD").text('(美元)');
                    }
                    if(purcharseDtl.currencyType == $.purchaseOrderAuditApp.rmb){
                        $("#totalFeeTip").text('元');
                        $("#purchasePriceD").text('(元)');
                        $("#totalPurchaseAmountD").text('(元)');
                    }
                    $("#warehouseName").text(purcharseDtl.warehouseName)
                    $("#receiveAddress").text(purcharseDtl.receiveAddress)
                    $("#transportFeeDestIdName").text(purcharseDtl.transportFeeDestIdName)
                    $("#takeGoodsNo").text(purcharseDtl.takeGoodsNo)
                    $("#requriedReceiveDate").text(purcharseDtl.requriedReceiveDate)
                    $("#endReceiveDate").text(purcharseDtl.endReceiveDate)
                    $("#handlerPriorityName").text(purcharseDtl.handlerPriorityName)
                    $("#remark").text(purcharseDtl.remark)
                    $("#totalFee").text(purcharseDtl.totalFee)
                    $("#receiver").text(purcharseDtl.receiver)
                    $("#receiverNumber").text(purcharseDtl.receiverNumber)
                    $("#sender").text(purcharseDtl.sender)
                    $("#senderNumber").text(purcharseDtl.senderNumber)
                    $("#senderAddress").text(purcharseDtl.senderAddress)
                    $("#senderProvince").text(purcharseDtl.senderProvinceName)
                    $("#senderCity").text(purcharseDtl.senderCityName)
                    if(auditStatus == '1'){
                        $("#statusTip").text("待审核");
                        $("#statusResult").text("待审核");
                    };
                    if(auditStatus == '2'){
                        $("#statusTip").text("已审核");
                        $("#statusResult").text("审核通过");
                    }
                    if(auditStatus == '3'){
                        $("#statusTip").text("已审核");
                        $("#statusResult").text("审核驳回");
                    }

                }
            };
            $.ajax(aContent);
        },
        /***
         * 根据采购订单的编码或者id 修改，采购单审核的信息的状态，以及采购单的状态
         * @param fromData
         */
        save:function(fromData, tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/purchaseOrderAudit";
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "purchaseOrderAuditList.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.purchaseOrderAuditApp.init();
    });
}(jQuery));
