/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.outboundOrderListApp = {
        _orderId: null,
        init: function () {

            this.queryWarehouseValid();
            this.initDialog();
            this.queryOutBoundOrderStatus();
            this.querySellChannel();
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'],function(Form,Grid,Data,PagingBarExt,Tooltip){
                var columns = [
                    // {title : '发货通知单ID',dataIndex :'id', visible : false},
                  {
                    title: '发货通知单编号', dataIndex: 'outboundOrderCode', width: '12%', elCls: 'center', renderer: function (value, obj, record) {
                        var status = obj.status
                        return '<a href='+'outboundOrderDetail.html'+"?"+'id='+obj.id+"&isStoreOrder="+obj.isStoreOrder+"&status="+status+'>'+value+'</a>';
                    }},
                    {title : '系统订单号',sortable: false,dataIndex :'scmShopOrderCode', width:'12%',elCls : 'center'},
                    {title: '销售渠道订单号', dataIndex: 'shopOrderCode', width: '12%', elCls: 'center'},
                  {
                    title: '仓库反馈出库单号', dataIndex: 'wmsOrderCode', width: '12%', elCls: 'center', renderer: function (value, obj) {
                        if (!value) {
                            return"-"
                        } else {
                          return value
                        }
                      }
                    },
                    {title : '销售渠道',sortable: false,dataIndex :'sellName', width:'10%',elCls : 'center'},
                    {title: '发货仓库名称', dataIndex: 'warehouseName', width: '8%', elCls: 'center'},
                    {title: '商品总数量', dataIndex: 'itemNum', width: '8%', elCls: 'center'},
                    {title: '收货人', dataIndex: 'receiverName', width: '8%', elCls: 'center'},
                    {title: '收货人手机号', dataIndex: 'receiverPhone', width: '8%', elCls: 'center'},
                    {title: '订单付款时间', dataIndex: 'payTime', width: '12%', elCls: 'center'},
                    {
                      title: '状态', dataIndex: 'status', width: '8%', elCls: 'center', renderer: function (value, obj) {
                        var objStr = BUI.JSON.stringify(obj).replace(/\"/g, "'").replace("\\n", " \t ");
                        var iStoreOrder = obj.isStoreOrder  // 判断订单是否为门店 如果等于2的话则是门店订单
                        if (value == '1') {
                            return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + '仓库接收失败' + '</span>'
                        }
                        if (value == '2') {
                            return '等待仓库发货';
                        }
                        if (value == '3') {
                            return '仓库告知的过程中状态';
                        }
                        if (value == '4') {
                            return '全部发货';
                        }
                        if (value == '5') {
                            return '部分发货';
                        }
                        if (value == '6') {
                            return '已取消';
                        }
                        if (value == '7') {
                            return '取消中';
                        }   
                    }
                    },
                    {title: '发货单创建时间', dataIndex: 'createTime', width: '12%', elCls: 'center'},
                    {title: '操作', dataIndex: 'status', width: '12%', elCls: 'center',renderer:function(val,record){                        
                        if(val=="1"){
                            return '<span class="grid-command close">关闭</span>' + '<span class="grid-command redeliver">重新发货</span>';
                        }
                        if(val=="2"){
                            return '<span class="grid-command cancel">取消发货</span>';
                        }
                        if(val=="6"&&record['isTimeOut']=="0"){
                            if(record['isClose']=="1"){
                                return '<span class="grid-command reOpen">取消关闭</span>';
                            }
                            if(record['isCancel']=="1"){
                                return '<span class="grid-command redeliver">重新发货</span>';
                            }                            
                        }else{
                            return '<span class="grid-command ">--</span>';
                        }
                    }}
                ];

                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

                var Grid = Grid,
                    Store = Data.Store;

                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });                
                var store = new Store({
                        url : $.scmServerUrl + "outOrder/outboundOrderPage",
                        autoLoad:true,
                        proxy : {
                            method : 'get',
                            dataType : 'json', //返回数据的类型
                            limitParam : 'pageSize', //一页多少条记录
                            pageIndexParam : 'pageNo', //页码
                            startParam : 'start', //起始记录
                            pageStart : 1 //页面从1开始
                        },
                        pageSize : 10,  // 配置分页数目
                        root:'result',
                        totalProperty:'totalCount',
                        params: {}
                }),
               
                grid = new Grid.Grid({
                    render:'#grid',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    plugins: [editing]
                });
              
                grid.render();

                $.outboundOrderListApp._store = store;

                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; 
                    var target = $(ev.domTarget); 
                    $.outboundOrderListApp._id = record['id'];
                    if(target.hasClass('close')){
                        $("#closeReason").val("");
                        $.outboundOrderListApp._closeOrderDialog.show();
                    }else if(target.hasClass('redeliver')){
                        BUI.Message.Confirm('您确认重新发货吗？',function(){
                            $.outboundOrderListApp.redeliver(record['id']);
                        },'question');
                    }else if(target.hasClass('cancel')){
                        $("#cancelReason").val("");
                        $.outboundOrderListApp._cancelOrderDialog.show();
                    }else if(target.hasClass('reOpen')){
                        BUI.Message.Confirm('您确认取消关闭吗？',function(){
                            $.outboundOrderListApp.reOpen(record['id']);
                        },'question');
                    }
                });

                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                    
                });
                var tips = new Tooltip.Tips({
                    tip : {
                        trigger : '.grid-status', //出现此样式的元素显示tip
                        alignType : 'bottom-left', //默认方向
                        elCls : 'panel',
                        width: 280,
                        titleTpl : '<div class="panel-header">\
                        <h3>仓库接收失败信息</h3>\
                      </div>\
                      <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                        <div>{message}</div>\
                      </div>',
                        offset : 10 //距离左边的距离
                    }
                });
                tips.render();
                $("#reset").on("click",function(){
                    form.clearErrors();
                });
                /*导出供应商订单列表*/
                $("#save").on("click",function(){
                    var option = $("#J_Form2").serialize();
                    window.open( $.scmServerUrl+ "order/exportSupplierOrder?"+option);
                });
                $("#reset_btn").on("click",function(){
                    form.clearErrors();
                });
            });
        },
        openDetail:function (code) {
            var config = {
                title: "采购单详情",
                href: "purchase/purchaseOrderWarehouseNoticeInfo.html?isClose=true&purchaseOrderCode="+code
            };
            window.parent.addTab(config)
        },
        /**
         *查询入库通知单的状态列表
         */
        queryOutBoundOrderStatus: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/outboundOrderStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('status', result.result, 'code', 'name', '全部');
                }
            };
            $.ajax(aContent);
        },
        /***
         * 销售渠道
         */
        querySellChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/ywxSellChannelList";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.AddItem('sellCode', result.result, 'sellCode', 'sellName', true);
                }
            };
            $.ajax(aContent);
        },
        initDialog: function () {
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){                
                $.outboundOrderListApp._cancelOrderDialog = new Overlay.Dialog({
                    title:'取消发货',
                    autoRender :true,
                    contentId:'cancelDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'确定取消',
                            elCls : 'button button-primary',
                            handler : function(){
                                var cancelMsg = $("#cancelReason").val(); 
                                if(cancelMsg==null||cancelMsg==''){
                                    BUI.Message.Alert('请填写取消原因！','warning');
                                    return false;
                                }else{
                                    $.outboundOrderListApp.cancelOrder();
                                    this.close();
                                }                                
                            }
                        },{
                            text:'关闭',
                            elCls : 'button',
                            handler : function(){
                                this.close();
                            }
                        }
                    ]
                });
            });
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){
                $.outboundOrderListApp._closeOrderDialog = new Overlay.Dialog({
                    title:'确定关闭',
                    autoRender :true,
                    contentId:'closeDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'确定关闭',
                            elCls : 'button button-primary',
                            handler : function(){
                                var closeMsg = $("#closeReason").val(); 
                                if(closeMsg==null||closeMsg==''){
                                    BUI.Message.Alert('请填写关闭原因！','warning');
                                    return false;
                                }else{
                                    $.outboundOrderListApp.closeOrder();
                                    this.close();
                                }                                
                            }
                        },{
                            text:'取消',
                            elCls : 'button',
                            handler : function(){
                                this.close();
                            }
                        }
                    ]
                });
            });
        },
        /**
         *查询有效的仓库
         */
        queryWarehouseValid : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "outOrder/warehouseListAll";
            aContent.data = {};            
          aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('warehouseId', result.result, 'id', 'warehouseName', true);
                }
            };
            $.ajax(aContent);
        },
        /*重新发货操作*/
        redeliver : function (orderId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "outOrder/deliveryOrderCreate";
            aContent.data = {id:orderId};
            aContent.type= 'POST';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.outboundOrderListApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /*取消发货操作*/
        cancelOrder:function(orderId){
            var cancelReason = $("#cancelReason").val();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "outOrder/orderCancel/"+$.outboundOrderListApp._id;
            aContent.data = {remark:cancelReason};
            aContent.type = 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.outboundOrderListApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /*关闭订单操作*/
        closeOrder:function(orderId){
            var closeReason= $("#closeReason").val(); 
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "outOrder/close/"+$.outboundOrderListApp._id;
            aContent.data = {remark:closeReason};
            aContent.type = 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert('发货通知单关闭成功','success');
                     $.outboundOrderListApp._store.load({});
                }
            };
            $.ajax(aContent); 
        },
        /*取消关闭操作*/
        reOpen:function(orderId){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "outOrder/cancelClose/"+$.outboundOrderListApp._id;
            aContent.data = {};
            aContent.type= 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.outboundOrderListApp._store.load({});
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.outboundOrderListApp.init();
    });
}(jQuery));