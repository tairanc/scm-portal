/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $("#btnBack").on("click",function(){
        window.location.href = "storehouseAdviceList.html";
    });
    $(".logs-btn").on("click",function(){
        $.showLogsDialog("logInfoPage?entityType=AllocateOutOrder&entityId=" + $.getUrlParam("trueId"));
    });
    $.storehouseAdviceInfoApp = {
        _jdSupplierCode : "JD", //京东供应商编码
        _id : "",
        _trueId:'',
        store : null,
        /**
         * 初始化
         */
        init : function () {
            this._id = $.getUrlParam("id");
            this.queryOrderDetail(this._id);

            this._trueId = $.getUrlParam("trueId");
            this.queryOrderDetailList(this._trueId);
        },
        /**
         * 初始化商品明细
         * @param orderItems
         */
        initItemsDetail: function (orderItems) {
            BUI.use(['bui/grid','bui/data'],function(Grid, Data) {
                var data = orderItems;
                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : 'SKU名称',dataIndex :'skuName', width:250,elCls : 'center'},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:200,elCls : 'center',renderer:function(val){
                        //return '<span class="grid-command skuDtl">'+val+'</span>';
                        return '<span>'+val+'</span>'
                    }},
                    {title : '规格',dataIndex :'specNatureInfo', width:200,elCls : 'center'},
                    {title : '条形码',dataIndex :'barCode', width:150,elCls : 'center'},
                    {title : '品牌名称',dataIndex :'brandName',width:150,elCls : 'center'},
                    {title : '调拨库存类型',dataIndex :'inventoryType',width:150, elCls : 'center',renderer:function(value){
                        return '<span>'+$.dictTranslate("inventoryType", value)+'</span>';
                    }},
                    {title : '计划调拨数量',dataIndex :'planAllocateNum',width:150, elCls : 'center'},
                    {title : '实际出库数量',dataIndex :'realOutNum',width:150, elCls : 'center',renderer:function(value){
                        return (value==null||value==="")?"-":value;
                    }},
                    {title : '出库状态',dataIndex :'outStatus',width:150, elCls : 'center',renderer:function(value){
                        return '<span>'+$.dictTranslate("allocateOutOrderDetailStatus", value)+'</span>';
                    }},
                ];
                // var colGroup =new Grid.Plugins.ColumnGroup({
                //     groups:[{
                //         title:'物流信息',
                //         from:7,
                //         to:10
                //     }]
                // });
                $.storehouseAdviceInfoApp.store = new Store({
                    data : data,
                    autoLoad: true
                });

                var grid = new Grid.Grid({
                    render: '#grid',
                    columns: columns,
                    loadMask: true,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: $.storehouseAdviceInfoApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    forceFit : true,
                    // plugins: [colGroup] //表格插件
                });
                grid.render();
                grid.on('cellclick',function  (ev) {
                    var record = ev.record;
                    var target = $(ev.domTarget);                    
                    if(target.hasClass('skuDtl')){
                        record['isClose']=true;
                        record['hideLogs']=true;
                        var config = {
                            title: "商品信息",
                            href: "goods/externalGoodsDetail.html?flag=1&skuCode="+record['skuCode'] + '&isClose=' + (record['isClose']) + '&hideLogs='+record['hideLogs']
                        };
                        window.parent.addTab(config)
                    }
                });
            });
        },
        /**
         * 查询仓库订单明细
         * @param id
         */
        queryOrderDetail : function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"allocateOrder/editGet/"+id;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var outboundOrderDetail = result.result;
                    $.storehouseAdviceInfoApp.fillData(outboundOrderDetail);
                    $.storehouseAdviceInfoApp.initItemsDetail(outboundOrderDetail['skuDetailList']);
                }
            };
            $.ajax(aContent);
        },
        queryOrderDetailList : function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"allocateOutOrder/allocateOutOrder/"+id;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var purcharseDtl = result.result;
                    $("#memo").text(purcharseDtl.memo)
                    // $("#remark").text(purcharseDtl.remark)

                    $("#sender").text(purcharseDtl.sender)
                    $("#senderMobile").text(purcharseDtl.senderMobile)
                    $("#senderProvince").text(purcharseDtl.senderProvinceName)
                    $("#senderCity").text(purcharseDtl.senderCityName)
                    $("#senderAddress").text(purcharseDtl.senderAddress)

                    $("#receiver").text(purcharseDtl.receiver)
                    $("#receiverMobile").text(purcharseDtl.receiverMobile)
                    $("#receiverProvince").text(purcharseDtl.receiverProvinceName)
                    $("#receiverCity").text(purcharseDtl.receiverCityName)
                    $("#receiverAddress").text(purcharseDtl.receiverAddress)
                }
            };
            $.ajax(aContent);
        },
        /**
         * 填充数据
         * @param shopOrder
         */
        fillData: function (warehouseOrder) {
            for(key in warehouseOrder){
                var val = warehouseOrder[key];
                if(val == null){
                    val = "";
                }
                $("#"+key).text(val);
            }
            //$("#status").text($.dictTranslate("outboundOrderStatus", warehouseOrder['status']));
            if(warehouseOrder['status']=="1"){
                $("#status").text("仓库接收失败")
            }
            if(warehouseOrder['status']=="2"){
                $("#status").text("等待仓库发货")
            }
            if(warehouseOrder['status']=="3"){
                $("#status").text("仓库告知的过程中状态")
            }
            if(warehouseOrder['status']=="4"){
                $("#status").text("全部发货")
            }
            if(warehouseOrder['status']=="5"){
                $("#status").text("部分发货")
            }
            if(warehouseOrder['status']=="6"){
                $("#status").text("已取消")
            }
            if(warehouseOrder['status']=="7"){
                $("#status").text("取消中")
            }
        }
 }
    $(document).ready(function (e) {
        $.storehouseAdviceInfoApp.init();
    });
}(jQuery));