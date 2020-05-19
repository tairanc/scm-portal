/**
 * Created by sone on 2017/6/20.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?&entityType=AllocateOrder&operateType=0&entityId=" + $.getUrlParam("id"));
    });

    $.storehouseInfoApp = {

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

        _init : function () {
            var id = $.getUrlParam("id")
            var auditStatus = $.getUrlParam("status")
            var flag = $.getUrlParam("flag")
            console.log(flag, 'info')
            $.storehouseInfoApp.filePurchaseOrderForm(id, auditStatus, flag); //填充采购单部分
        },

        init:function(dataValue){
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

                var Store = Data.Store,Grid = Grid,
                    columns = [
                        {title: '商品SKu名称', dataIndex: 'skuName',width: '150px', elCls: 'center'},
                        {title: '商品SKU编号', dataIndex: 'skuCode', width: "150px", elCls: 'center'},
                        {title: '规格', dataIndex: 'specNatureInfo', width: "150px", elCls: 'center'},
                        // {title: '货号', dataIndex: 'skuNo', width: "150px", elCls: 'center'},
                        {title: '条形码', dataIndex: 'barCode', width: "150px", elCls: 'center'},
                        {title: '品牌名称', dataIndex: 'brandName', width: "150px", elCls: 'center'},
                        {title: '调拨库存类型', dataIndex: 'inventoryType', width: "150px", elCls: 'center',renderer: function (value) {
                            return '<span>'+$.dictTranslate("inventoryType", value)+'</span>';
                        }},
                        {title: '计划调拨数量', dataIndex: 'planAllocateNum', width: "150px", elCls: 'center',renderer :function(value,obj){
                            return (value==null||value==="")?"-":value;
                        }},
                        {title: '实际出库数量', dataIndex: 'realOutNum', width: "150px", elCls: 'center',renderer :function(value,obj){
                            return (value==null||value==="")?"-":value;
                        }},
                        {title : '出库状态',dataIndex :'allocateOutStatus', width: "150px",elCls : 'center',renderer :function(value,obj){
                            return '<span>'+$.dictTranslate("allocateOrderSkuOutStatus", value)+'</span>' //failedCause
                        }},
                        {title : '实际入库总量',dataIndex :'realInNum', elCls : 'center',renderer :function(value,obj){
                            return (value==null||value==="")?"-":value;
                        }},
                        {title : '正品入库数量',dataIndex :'nornalInNum', elCls : 'center',renderer :function(value,obj){
                            return (value==null||value==="")?"-":value;
                        }},
                        {title : '残品入库数量',dataIndex :'defectInNum', elCls : 'center',renderer :function(value,obj){
                            return (value==null||value==="")?"-":value;
                        }},
                        {title : '入库状态',dataIndex :'allocateInStatus', width: "150px",elCls : 'center',renderer :function(value,obj){
                            return '<span>'+$.dictTranslate("allocateOrderSkuInStatus", value)+'</span>'
                        }},

                    ]
                var colGroup =new Grid.Plugins.ColumnGroup({
                    groups:[{
                        title:'仓库反馈入库信息',
                        from:10,
                        to:12
                    }]
                });
                $.storehouseInfoApp.store = new Store({
                        // url : $.scmServerUrl + "purchase/purchaseDetail",
                        // proxy : {
                        //     method : 'get',
                        //     dataType : 'json' //返回数据的类型
                        // },
                        // autoLoad:true,
                        // params:{purchaseId: id}
                        data : dataValue,
                        autoLoad: true
                    }),
                    grid = new Grid.Grid({
                        render: '#Items',
                        width: '100%',//如果表格使用百分比，这个属性一定要设置
                        columns: columns,
                        idField: 'a',
                        bbar: {
                            pagingBar: false
                        },
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: $.storehouseInfoApp.store,
                        plugins:[BUI.Grid.Plugins.RowNumber],
                    });

                // store.on("exception", function (e) {
                //     $.storeErrorHander(e);
                // });

                grid.render();
               //  $("#commit_btn").on("click",function () { //审核通过  status -- 2
               //      $("#status").val(2)
               //      var formData = form.serializeToObject();
               //      if(form.isValid()){
               //          $.storehouseInfoApp.save(formData, tip);
               //      }
               //  });

               // $("#save_btn").on("click",function(){ //审核驳回  status -- 3
               //     var value = $("#auditOpinion").val();
               //     if(value==null || value ==""  ||value.trim()==""){
               //         BUI.Message.Alert("请填写驳回意见","warning");
               //          return;
               //     }
               //     $("#status").val(3)
               //      var formData = form.serializeToObject();
               //      if(form.isValid()){
               //          $.storehouseInfoApp.save(formData, tip);
               //      }
               //  });


                $("#btn_list").on("click",function(){
                    window.location.href = "storehouseList.html";
                    //window.history.go(-1);
                });

            });
        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (id,auditStatus, flag) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"allocateOrder/editGet/"+id+"?flag="+flag;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询采购单失败","warning");
                }else{
                    var purcharseDtl = result.result;
                    $("#allocateOrderCode").text(purcharseDtl.allocateOrderCode)
                    $("#outWarehouseName").text(purcharseDtl.outWarehouseName)
                    $("#inWarehouseName").text(purcharseDtl.inWarehouseName)

                    $("#memo").text(purcharseDtl.memo)
                    // $("#remark").text(purcharseDtl.remark)

                    $("#sender").text(purcharseDtl.sender)
                    $("#senderMobile").text(purcharseDtl.senderMobile)
                    $("#senderProvince").text(purcharseDtl.senderProvinceName || "")
                    $("#senderCity").text(purcharseDtl.senderCityName || "")
                    $("#senderAddress").text(purcharseDtl.senderAddress || "")

                    $("#receiver").text(purcharseDtl.receiver)
                    $("#receiverMobile").text(purcharseDtl.receiverMobile)
                    $("#receiverProvince").text(purcharseDtl.receiverProvinceName || "")
                    $("#receiverCity").text(purcharseDtl.receiverCityName || "")
                    $("#receiverAddress").text(purcharseDtl.receiverAddress || "")
                    $("#allocateOutOrderCode").text(purcharseDtl.allocateOutOrderCode||"");
                    $("#allocateInOrderCode").text(purcharseDtl.allocateInOrderCode||"");
                    $("#auditOpinion").text(purcharseDtl.auditOpinion)
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
                    $.storehouseInfoApp.init(purcharseDtl.skuDetailList);
                    // $.storehouseInfoApp.getData = purcharseDtl.skuDetailList
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
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "storehouseList.html";
                    //window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.storehouseInfoApp._init();
    });
}(jQuery));
