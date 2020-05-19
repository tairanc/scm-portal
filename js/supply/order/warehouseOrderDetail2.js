/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $("#btn_list").on("click",function(){
        window.location.href = "supplierOrder.html";
    });
    $("#orderLog").on("click",function(){
        $.showLogsDialog("logInfoPage?entityType=WarehouseOrder&entityId=" + $.getUrlParam("id"));
    });
    $.warehouseOrderDetail2App = {
        _jdSupplierCode : "JD", //京东供应商编码
        _warehouseOrderCode : "",
        store : null,
        /**
         * 初始化
         */
        init : function () {
            this._warehouseOrderCode = $.getUrlParam("warehouseOrderCode");
            this.queryOrderDetail(this._warehouseOrderCode);
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
                    {title : 'SKU名称',dataIndex :'itemName', width:250,elCls : 'center'},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:200,elCls : 'center',renderer:function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {title : '供应商SKU编号',dataIndex :'supplierSkuCode',width:200, elCls : 'center'},
                    {title : '供应商反馈订单号',dataIndex :'supplierOrderCode',width:200, elCls : 'center'},
                    {title : '实付总金额(元)',dataIndex :'payment', width:150,elCls : 'center'},
                    {title : '应发商品数量',dataIndex :'num',elCls : 'center'},
                    {title : '实发商品数量',dataIndex :'deliverNum', elCls : 'center'},
                    {title : '发货状态',dataIndex :'supplierOrderStatus', elCls : 'center',renderer:function(val){
                        var supplierOrderStatus = $.dictTranslate("supplierOrderStatus", val);
                        return  supplierOrderStatus;
                    }},
                    {title : '物流公司',dataIndex :'deliverPackageFormList', elCls : 'center',renderer:function(val){

                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].logisticsCorporation+"</p>"
                            }
                            return str;
                        }
                    }},
                    {title : '运单编号',dataIndex :'deliverPackageFormList', elCls : 'center',renderer:function(val){
                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].waybillNumber+"</p>"
                            }
                            return str;
                        }
                    }},
                    {title : '商品数量',dataIndex :'deliverPackageFormList', elCls : 'center',renderer:function(val){
                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].skuNum+"</p>"
                            }
                            return str;
                        }
                    }}
                ];
                var colGroup =new Grid.Plugins.ColumnGroup({
                    groups:[{
                        title:'物流信息',
                        from:8,
                        to:10
                    }]
                });
                $.warehouseOrderDetail2App.store = new Store({
                    data : data,
                    autoLoad: true
                });

                var grid = new Grid.Grid({
                    render: '#grid',
                    columns: columns,
                    loadMask: true,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: $.warehouseOrderDetail2App.store,
                    bbar: {
                        pagingBar: false
                    },
                    forceFit : true,
                    plugins: [colGroup] //表格插件
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
         * @param warehouseOrderCode
         */
        queryOrderDetail : function (warehouseOrderCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/warehouseOrder/warehouseOrderCode/"+warehouseOrderCode;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var warehouseOrder = result.result;
                    $.warehouseOrderDetail2App.fillData(warehouseOrder);
                    $.warehouseOrderDetail2App.initItemsDetail(warehouseOrder['orderItemList']);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 填充数据
         * @param shopOrder
         */
        fillData: function (warehouseOrder) {
            if(warehouseOrder['supplierCode'] == $.warehouseOrderDetail2App._jdSupplierCode&&warehouseOrder['supplierOrderStatus']!=1){
                $("#jingDongAdd").show();
            }
            for(key in warehouseOrder){
                var val = warehouseOrder[key];
                if(val == null){
                    val = "";
                }
                $("#"+key).text(val);
            }
            var platformOrder = warehouseOrder['platformOrder'];
            $("#receiverName").text(platformOrder['receiverName']);
            $("#receiverMobile").text(platformOrder['receiverMobile']);
            var _provinceCityArea = platformOrder['receiverProvince'] + "." + platformOrder['receiverCity'];
            if(platformOrder['receiverDistrict']){
                _provinceCityArea = _provinceCityArea + "." + platformOrder['receiverDistrict'];
            }
            $("#provinceCityArea").text(_provinceCityArea);
            $("#receiverAddress").text(platformOrder['receiverAddress']);
            setTimeout(function(){
                $("#supplierOrderStatus").text($.dictTranslate("supplierOrderStatus", warehouseOrder['supplierOrderStatus']));
            },300);
        }
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetail2App.init();
    });
}(jQuery));