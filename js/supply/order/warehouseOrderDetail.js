/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $.warehouseOrderDetailApp = {
        _warehouseOrderCode : "",
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
                    {title : '商品名称',dataIndex :'itemName', width:'15%',elCls : 'center'},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:'15%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {title : '商品货号',dataIndex :'itemNo', width:'15%',elCls : 'center'},
                    {title : '交易数量',dataIndex :'num', width:'10%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title: '税费(元)', dataIndex: 'priceTax', width: '10%', elCls: 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '实付总金额(元)',dataIndex :'payment', width:'12%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},

                ];

                $.supplierAddApp.store = new Store({
                    data : data,
                    autoLoad: true
                });

                var grid = new Grid.Grid({
                    render: '#categoryGrid',
                    width: '100%',
                    columns: columns,
                    loadMask: true,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: $.supplierAddApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    plugins: [BUI.Grid.Plugins.RowNumber] //表格插件
                });

                grid.render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record;
                    var target = $(ev.domTarget);
                    if(target.hasClass('skuDtl')){
                        window.location.href = "../goods/goodsSkuDetail.html?spuCode="+record['spuCode']+"&skuCode="+record['skuCode'];
                    }
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "supplierOrder.html";
                });

            });
        },
        /**
         * 查询仓库订单明细
         * @param warehouseOrderCode
         */
        queryOrderDetail : function (warehouseOrderCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/warehouseOrders";
            aContent.data = {warehouseOrderCode: warehouseOrderCode};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var warehouseOrder = result.result;
                    $.warehouseOrderDetailApp.fillData(warehouseOrder);
                    $.initItemsDetail(warehouseOrder['orderItemList']);
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
                $("#"+key).text(warehouseOrder[key]);
            }
            setTimeout(function(){
                $("#status").text($.dictTranslate("orderStatus", shopOrder['status']));
                $("#type").text($.dictTranslate("orderType", shopOrder['type']));
            },300);
        }
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetailApp.init();
    });
}(jQuery));