/**
 * Created by sone on 2017/6/20.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?&entityType=AllocateOrder&entityId=" + $.getUrlParam("id"));
    });
    $("#btn_list").on("click", function () {
          window.location.href = "storehouseAuditList.html";
            //window.history.go(-1);
    });
    $.storehouseAuditApp = {

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
        NUMERROR:false,//调拨数量是否大于实际库存
        _init : function () {
            var id = $.getUrlParam("id")
            var auditStatus = $.getUrlParam("status")
            // var getData = []
            $.storehouseAuditApp.filePurchaseOrderForm(id,auditStatus); //填充采购单部分
            var hidBtn = $.getUrlParam("hidBtn");
            if (hidBtn=="true") {
                $("#commit_btn").css("display","none");
                $("#save_btn").css("display","none");
            }else{
                $(".auditStatus").hide();
                $(".auditResult").hide();                
            }
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

                var Store = Data.Store,
                    columns = [
                        {title: '商品SKu名称', dataIndex: 'skuName',width: '150px', elCls: 'center'},
                        {title: '商品SKU编号', dataIndex: 'skuCode', width: "150px", elCls: 'center'},
                        {title: '规格', dataIndex: 'specNatureInfo', width: "150px", elCls: 'center'},
                        {title: '货号', dataIndex: 'skuNo', width: "150px", elCls: 'center',renderer :function(value,obj){
                            return value?value:"-";
                        }},
                        {title: '条形码', dataIndex: 'barCode', width: "150px", elCls: 'center'},
                        {title: '品牌名称', dataIndex: 'brandName', width: "150px", elCls: 'center'},
                        {title: '调拨库存类型', dataIndex: 'inventoryType', width: "150px", elCls: 'center',renderer: function (value) {
                                return '<span>'+$.dictTranslate("inventoryType", value)+'</span>';
                            }},
                        {title: '调出仓实时库存', dataIndex: 'inventoryNum', width: "150px", elCls: 'center',renderer:function(val,record){
                            if(val==null){
                                return "-";
                            }
                            if(record.planAllocateNum>record.inventoryNum){
                                $.storehouseAuditApp.NUMERROR=true;
                                return "<span class='sp_highlight'>"+val+"</span>";
                            }else{
                                return val;
                            }
                        }},
                        {title: '计划调拨数量', dataIndex: 'planAllocateNum', width: "150px", elCls: 'center'},
                    ]
                $.storehouseAuditApp.store = new Store({
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
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: $.storehouseAuditApp.store,
                        plugins:[BUI.Grid.Plugins.RowNumber],
                    });

                // store.on("exception", function (e) {
                //     $.storeErrorHander(e);
                // });

                grid.render();


                $(".sp_highlight").parent().parent().parent().css("background-color","#ff3300");


                $("#commit_btn").on("click",function () { //审核通过  status -- 2
                    var formData = form.serializeToObject();
                    var sendId = $.getUrlParam("id");
                    if(form.isValid()){
                        formData.id = sendId
                        formData.auditResult = 0
                        $.storehouseAuditApp.save(formData, tip);
                    }
                });

               $("#save_btn").on("click",function(){ //审核驳回  status -- 3
                   var value = $("#auditOpinion").val();
                   if(value==null || value ==""  ||value.trim()==""){
                       BUI.Message.Alert("请填写驳回意见","warning");
                        return;
                   }
                    var formData = form.serializeToObject();
                    var sendIds = $.getUrlParam("id"); 
                    if(form.isValid()){
                        formData.id = sendIds
                        formData.auditResult = 1
                        $.storehouseAuditApp.save(formData, tip);
                    }
                });


            

            });
        },
        /***
         * 填充表单..根据采购单的id，查询采购单信息和采购商品信息
         * @param id zhujianID
         */
        filePurchaseOrderForm:function (id,auditStatus) {
            var aContent = $.AjaxContent();
            var flag = $.getUrlParam('flag')
            console.log(flag)
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

                    $("#memo").text(purcharseDtl.memo || "")
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
                    $.storehouseAuditApp.init(purcharseDtl.skuDetailList);
                    if($.getUrlParam("hidBtn")){
                        $("#auditOpinion").val(purcharseDtl.auditOpinion || "");
                    }else if( $.storehouseAuditApp.NUMERROR){
                        $("#auditOpinion").val("调出仓库实时库存不足！");
                        $("#commit_btn").attr("disabled", "disabled");
                    }
                    // $.storehouseAuditApp.getData = purcharseDtl.skuDetailList
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
            aContent.url = $.scmServerUrl+"allocateOrder/audit/"+fromData.id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.location.href = "storehouseAuditList.html";
                	//window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function (e) {
        $.storehouseAuditApp._init();
    });
}(jQuery));
