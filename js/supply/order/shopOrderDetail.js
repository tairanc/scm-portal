/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $("#orderLog").on("click",function(){
        $.showLogsDialog("logInfoPage?entityType=ShopOrder&entityId=" + $.getUrlParam("id"));
    });
    var orderStatus = {
        1: "待发货",
        2: "部分发货",
        3: "全部发货",
        4: "已取消"
    };
    $.shopOrderDetailApp = {
        _shopOrderCode : "",
        store:null,
        /**
         * 初始化
         */
        init : function () {            
            this._shopOrderCode = $.getUrlParam("shopOrderCode");
            var platformOrderCode = $.getUrlParam("platformOrderCode");
            this.queryOrderDetail(platformOrderCode, this._shopOrderCode);
        },
        /**
         * 初始化商品明细
         * @param orderItems
         */
      initItemsDetail: function (orderItems) {
          var isOrder = orderItems[0].isStoreOrder;
          var status = orderItems[0].supplierOrderStatus;
            BUI.use(['bui/grid','bui/data'],function(Grid, Data) {
                var data = orderItems;
                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : 'SKU名称',dataIndex :'itemName', width:250,elCls : 'center'},
                    {title : 'SKU编号',dataIndex :'skuCode',width:200, elCls : 'center', renderer : function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {title : '规格',dataIndex :'specNatureInfo', width:300,elCls : 'center'},
                    {title : '商品类型',dataIndex :'skuCode',elCls : 'center',renderer:function(val){
                       if(/^SP0/.test(val)){
                            return '自采'
                       }else{
                            return '代发'
                       }
                    }},
                    {title : '销售单价',dataIndex :'price', elCls : 'center'},
                    {title : '销售总价',dataIndex :'totalFee', elCls : 'center'},
                    {title : '实付总金额',dataIndex :'payment', elCls : 'center'},
                    {title : '应发商品数量',dataIndex :'num', elCls : 'center'},
                    {title : '实发商品数量',dataIndex :'deliverNum', elCls : 'center'},
                    {title : '发货仓库/供应商',dataIndex :'warehouseName', width:140,elCls : 'center'},
                    {title : '发货状态',dataIndex :'supplierOrderStatus',elCls : 'center',renderer:function(val,record){
                        /*if(!/^SP0/.test(record['skuCode'])){
                            var supplierOrderStatus = $.dictTranslate("supplierOrderStatus", val);
                            return  supplierOrderStatus;
                        }else{
                            var outboundOrderStatus = $.dictTranslate("outboundOrderStatus", val);
                            return  outboundOrderStatus;
                        }  */    
                        var supplierOrderStatus = $.dictTranslate("supplierOrderStatus", val);
                        return supplierOrderStatus;
                    }},
                  {
                    title: '物流公司', dataIndex: 'deliverPackageFormList', elCls: 'center', renderer: function (val) {
                      if (isOrder == 2 && status == 4) {
                        setTimeout(function () {  //强行合拼列
                          var dom = $('.orderWrap');
                          dom.find('.bui-grid-cell.grid-td-col12').attr('colspan',3)
                        }, 10)
                        return "已自提"
                      } else {
                        var str ="";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].logisticsCorporation+"</p>"
                            }
                            return str;
                        }
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
                                var de = val[i].skuNum;
                                if(de == null){
                                    de = "-";
                                }
                                str+="<p>"+de+"</p>"
                            }
                            return str;
                        }
                    }}
                ];
                var colGroup =new Grid.Plugins.ColumnGroup({
                    groups:[{
                        title:'物流信息',
                        from:11,
                        to:13
                    }]
              });
                $.shopOrderDetailApp.store = new Store({
                    data : data,
                    autoLoad: true
                });

                var grid = new Grid.Grid({
                    render: '#grid',
                    columns: columns,
                    loadMask: true,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: $.shopOrderDetailApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    forceFit : true,
                    plugins: [ colGroup] //表格插件
                });

                grid.render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record;
                    var target = $(ev.domTarget);                    
                    if(target.hasClass('skuDtl')){
                        record['isClose']=true;
                        record['hideLogs']=true;
                        record['orderPage'] =true;
                        if(/^SP0/.test(record['skuCode'])){
                            var config = {
                                title: "商品信息",
                                href: "goods/goodsSkuDetail.html?spuCode="+record['spuCode']+"&skuCode="+record['skuCode']+ '&platformOrderCode='+record['platformOrderCode']+"&shopOrderCode=" + record['shopOrderCode']+'&isClose=' + (record['isClose'])+'&orderPage=' + (record['orderPage'])+ '&hideLogs='+record['hideLogs']
                                //href: "goods/goodsSkuDetail.html?flag=1&skuCode="+record['skuCode'] + '&isClose=' + (record['isClose']) + '&hideLogs='+record['hideLogs']
                            }
                       }else{
                            var config = {
                                title: "商品信息",
                                href: "goods/externalGoodsDetail.html?flag=1&skuCode="+record['skuCode'] +'&platformOrderCode='+record['platformOrderCode']+"&shopOrderCode=" + record['shopOrderCode']+ '&orderPage=' + (record['orderPage']) + '&hideLogs='+record['hideLogs']
                            };
                       }                       
                        window.parent.addTab(config)
                    }
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "shopOrderList.html";
                });

            });
        },
        /**
         * 查询店铺订单明细
         * @param shopOrderCode
         */
        queryOrderDetail : function (platformOrderCode, shopOrderCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/shopOrders";
            aContent.data = {platformOrderCode: platformOrderCode, shopOrderCode: shopOrderCode};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "error");
                }else{
                  var shopOrder = result.result;
                    // console.log(shopOrder)
                    $.shopOrderDetailApp.fillData(shopOrder[0]);
                    $.shopOrderDetailApp.initItemsDetail(shopOrder[0].records[0]['orderItemList']);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 填充数据
         * @param shopOrder
         */
        fillData: function (shopOrder) {
            for(key in shopOrder){
                var val = shopOrder[key];
                if(null == shopOrder[key]){
                    val = "";
                }
                $("#"+key).text(val);
            }
            var orderState = shopOrder['supplierOrderStatus'];
            if(orderState=="1"){
                $("#supplierOrderStatus").html("待发货");
            }else if(orderState=="4"){
                $("#supplierOrderStatus").html("全部发货");
            }else if(orderState=="6"){
                $("#supplierOrderStatus").html("部分发货");
            }else if(orderState=="2"){
                $("#supplierOrderStatus").html("发货异常");
            }else if(orderState=="7"){
                $("#supplierOrderStatus").html("已取消");
            }else{
                $("#supplierOrderStatus").html("状态错误");
            }
            //$("#supplierOrderStatus").html(orderStatus[orderState]);
            var _reciverArea = "";
            if(shopOrder['receiverProvince']){
                _reciverArea += shopOrder['receiverProvince'];
            }
            if(shopOrder['receiverCity']){
                _reciverArea += "."+shopOrder['receiverCity'];
            }
            if(shopOrder['receiverDistrict']){
                _reciverArea += "."+shopOrder['receiverDistrict'];
            }
            $("#receiverArea").text(_reciverArea);
            setTimeout(function(){
                $("#status").text($.dictTranslate("orderStatus", shopOrder['status']));
                $("#type").text($.dictTranslate("orderType", shopOrder['type']));
            },300);
        }
    }
    $(document).ready(function (e) {
        $.shopOrderDetailApp.init();
    });
}(jQuery));