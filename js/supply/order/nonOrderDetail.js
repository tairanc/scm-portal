/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $("#btn_list").on("click",function(){
        window.location.href = "nonOrderList.html";
    });
    $(".logs-btn").on("click",function(){
        $.showLogsDialog("logInfoPage?entityType=ExceptionOrder&entityId=" + $.getUrlParam("id"));
    });
    $.warehouseOrderDetail2App = {
        _jdSupplierCode : "JD", //京东供应商编码
        _exceptionOrderCode : "",
        store : null,
        /**
         * 初始化
         */
        init : function () {
            this._exceptionOrderCode = $.getUrlParam("exceptionOrder");
            this.queryOrderDetail(this._exceptionOrderCode);
        },
        /**
         * 初始化商品明细
         * @param orderItems
         */
        initItemsDetail: function (exceptionOrderItemList) {
            BUI.use(['bui/grid','bui/data'],function(Grid, Data) {
                var data = exceptionOrderItemList;
                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : 'SKU编号',dataIndex :'skuCode', width:200,elCls : 'center'},
                    {title : 'SKU名称',dataIndex :'itemName',width:200, elCls : 'center'},
                    {title : '规格',dataIndex :'specInfo',width:500, elCls : 'center'},
                    {title : '商品类型',dataIndex :'itemType',width:200, elCls : 'center',renderer:function(val){
                        if(val==1){
                            return '<span>自采</span>';
                        }
                        if(val==2){
                            return '<span>代发</span>';
                        }
                    }},
                    {title : '发货仓库/供应商',dataIndex :'supplierName', width:150,elCls : 'center'},
                    {title : '异常原因',dataIndex :'exceptionReason',elCls : 'center'},
                    {title : '应发货数量',dataIndex :'itemNum', elCls : 'center'},
                    {title : '异常数量',dataIndex :'exceptionNum', elCls : 'center'},
                    {title : '状态',dataIndex :'status', elCls : 'center',renderer:function(val){
                        if(val==10){
                            return '<span>待了结</span>';
                        }
                        if(val==11){
                            return '<span>已了结</span>';
                        }
                    }},
                ];
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
                    plugins: [] //表格插件
                });
                grid.render();
            });
        },
        /**
         * 查询仓库订单明细
         * @param warehouseOrderCode
         */
        queryOrderDetail : function (exceptionOrder) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/exceptionOrder/exceptionOrderCode/"+exceptionOrder;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var exceptionOrderDetail = result.result;
                    $.warehouseOrderDetail2App.fillData(exceptionOrderDetail);
                    $.warehouseOrderDetail2App.initItemsDetail(exceptionOrderDetail['exceptionOrderItemList']);
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
            $("#payTime").text(platformOrder['payTime'])
            var _provinceCityArea = platformOrder['receiverProvince'] + "." + platformOrder['receiverCity'];
            if(platformOrder['receiverDistrict']){
                _provinceCityArea = _provinceCityArea + "." + platformOrder['receiverDistrict'];
            }
            $("#provinceCityArea").text(_provinceCityArea);
            $("#receiverAddress").text(platformOrder['receiverAddress']);
            if(warehouseOrder['status']=='10'){
                $("#status").text('待了结')
            }
            if(warehouseOrder['status']=='11'){
                $("#status").text('已了结')
            }
            if(warehouseOrder['exceptionType']=='1'){
                $("#exceptionType").text('缺货退回')
            }
            if(warehouseOrder['exceptionType']=='2'){
                $("#exceptionType").text('缺货等待')
            }
        }
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetail2App.init();
    });
}(jQuery));