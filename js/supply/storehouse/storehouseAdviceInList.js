/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.storehouseAdviceInListApp = {
        _orderId: null,
        init: function () {

            this.queryWarehouseValid();
            this.initDialog();
            this.queryOutBoundOrderStatus();
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'],function(Form,Grid,Data,PagingBarExt,Tooltip){
                var columns = [
                    {title : '入库通知单Id',dataIndex :'id', visible : false},
                    {title: '调拨入库通知单编号', dataIndex: 'allocateInOrderCode', width: '12%', elCls: 'center',renderer :function(value,obj,record){
                        return '<a href='+'storehouseAdviceInInfo.html'+"?"+'id='+obj.allocateOrderCode+'&trueId='+obj.id+'>'+value+'</a>';
                    }},
                    {title: '调拨单编号', dataIndex: 'allocateOrderCode', width: '12%', elCls: 'center'},
                    {title: '调入仓库', dataIndex: 'inWarehouseName', width: '17%', elCls: 'center'},
                    {title: '调出仓库', dataIndex: 'outWarehouseName', width: '17%', elCls: 'center'},
                    // {title: '商品总数量', dataIndex: 'itemNum', width: '8%', elCls: 'center'},
                    {title: '入库单创建人', dataIndex: 'createOperatorName', width: '8%', elCls: 'center'},
                    // {title: '收货人手机号', dataIndex: 'receiverPhone', width: '8%', elCls: 'center'},
                    // {title: '订单付款时间', dataIndex: 'payTime', width: '12%', elCls: 'center'},
                    {
                        title: '状态', dataIndex: 'status', width: '8%', elCls: 'center', renderer: function (value, obj) {
                        // var objStr = BUI.JSON.stringify(obj).replace(/\"/g,"'").replace("\\n", " \t ");
                        // if (value == '1') {
                        //     return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + '仓库接收失败' + '</span>'
                        // }
                        // if (value == '2') {
                        //     return '等待仓库发货';
                        // }
                        // if (value == '3') {
                        //     return '仓库告知的过程中状态';
                        // }
                        // if (value == '4') {
                        //     return '全部发货';
                        // }
                        // if (value == '5') {
                        //     return '部分发货';
                        // }
                        // if (value == '6') {
                        //     return '已取消';
                        // }
                        // if (value == '7') {
                        //     return '取消中';
                        // }
                        var objStr = BUI.JSON.stringify({message:obj.failedCause||""}).replace(/\'/g,"&rsquo;").replace(/\"/g,"'").replace("\\n", " \t ");
                        if (value == '4') {
                            return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + $.dictTranslate("allocateInOrderStatus", value) + '</span>';
                        }if (value == '6') {
                            return '<span class="grid-status" style="color: purple" data-title="'+objStr+'">' + $.dictTranslate("allocateInOrderStatus", value) + '</span>';
                        }else{
                            return '<span>'+$.dictTranslate("allocateInOrderStatus", value)+'</span>';
                        }                        
                    }
                    },
                    {title: '入库单创建时间', dataIndex: 'createTime', width: '12%', elCls: 'center'},
                    {title: '操作', dataIndex: 'status', width: '12%', elCls: 'center',renderer:function(val,record){                        
                        if(val=="0"){
                            //return '<span class="grid-command close">关闭</span>' + '<span class="grid-command message">通知收货</span>';
                            return '<span class="grid-command close">关闭</span>';
                            
                        } 
                        if(val=="1"){
                            //return '<span class="grid-command close">关闭</span>' + '<span class="grid-command redeliver">重新出库</span>';
                            return '<span class="grid-command message" >通知收货</span>';
                        }
                        if(val=="2"){
                            //return '<span class="grid-command cancel">取消出库</span>';
                            return '<span class="grid-command close">关闭</span>' + '<span class="grid-command message">通知收货</span>';
                            
                        }
                        if(val=="3"){
                            return '<span class="grid-command cancel">取消收货</span>';
                        }
                        if(val=="4"){
                            return '<span class="grid-command close">关闭</span>' + '<span class="grid-command redeliver">重新收货</span>';
                        }
                        // if(val=="7"&&record.isTimeOut=="0"){
                        //     return '<span class="grid-command reOpen">取消关闭</span>';
                        // }
                        if(val=="7"&&record['isTimeOut']=="0"){
                            if(record['isClose']=="1"){
                                return '<span class="grid-command reOpen">取消关闭</span>';
                            }
                            if(record['isCancel']=="1"){
                                return '<span class="grid-command redeliver">重新收货</span>';
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
                        url : $.scmServerUrl + "allocateInOrder/orderPage",
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
                    plugins: [BUI.Grid.Plugins.RowNumber]
                });

                grid.render();

                $.storehouseAdviceInListApp._store = store;

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
                    $.storehouseAdviceInListApp._id = record['allocateOrderCode'];
                    if(target.hasClass('close')){
                        $("#closeReason").val("");
                        $.storehouseAdviceInListApp._closeOrderDialog.show();
                    }else if(target.hasClass('message')){
                        BUI.Message.Confirm('您确认要通知收货吗？<p>确认后将向仓库发送调拨入库通知</p>',function(){
                            $.storehouseAdviceInListApp.message(record['allocateOrderCode']);
                        },'warning');
                    }else if(target.hasClass('redeliver')){
                        BUI.Message.Confirm('您确认重新发货吗？',function(){
                            $.storehouseAdviceInListApp.redeliver(record['allocateOrderCode']);
                        },'question');
                    }else if(target.hasClass('cancel')){
                        $("#cancelReason").val("");
                        $.storehouseAdviceInListApp._cancelOrderDialog.show();
                    }else if(target.hasClass('reOpen')){
                        BUI.Message.Confirm('您确认取消关闭吗？',function(){
                            $.storehouseAdviceInListApp.reOpen(record['allocateOrderCode']);
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
                        <h3>入库异常信息</h3>\
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
            aContent.url = $.scmServerUrl + "select/selectByTypeCode/allocateInOrderStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('status', result.result, 'value', 'name', '全部');
                }
            };
            $.ajax(aContent);
        },
        initDialog: function () {
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){                
                $.storehouseAdviceInListApp._cancelOrderDialog = new Overlay.Dialog({
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
                                    $.storehouseAdviceInListApp.cancelOrder();
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
                $.storehouseAdviceInListApp._closeOrderDialog = new Overlay.Dialog({
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
                                    $.storehouseAdviceInListApp.closeOrder();
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
            aContent.url = $.scmServerUrl + "allocateOrder/warehouseList";
            aContent.data = {};            
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('inWarehouseCode', result.result, 'code', 'warehouseName', true);
                }
            };
            $.ajax(aContent);
        },
        message : function (orderId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateInOrder/noticeReciveGoods/"+$.storehouseAdviceInListApp._id;
            aContent.data = {id:orderId};
            aContent.type= 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.storehouseAdviceInListApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /*重新发货操作*/
        redeliver : function (orderId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateInOrder/orderCancel/"+$.storehouseAdviceInListApp._id;
            aContent.data = {flag:"1"};
            aContent.type= 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.storehouseAdviceInListApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /*取消发货操作*/
        cancelOrder:function(orderId){
            var cancelReason = $("#cancelReason").val();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateInOrder/orderCancel/"+$.storehouseAdviceInListApp._id;
            aContent.data = {cancelReson:cancelReason,flag:"0"};
            aContent.type = 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.storehouseAdviceInListApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /*关闭订单操作*/
        closeOrder:function(orderId){
            var closeReason= $("#closeReason").val(); 
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateInOrder/orderClose/"+$.storehouseAdviceInListApp._id;
            aContent.data = {cancelReson:closeReason,flag:0};
            aContent.type = 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert('关闭成功','success');
                     $.storehouseAdviceInListApp._store.load({});
                }
            };
            $.ajax(aContent); 
        },
        /*取消关闭操作*/
        reOpen:function(orderId){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateInOrder/orderClose/"+$.storehouseAdviceInListApp._id;
            aContent.data = {flag:1};
            aContent.type= 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                     BUI.Message.Alert(result.databuffer,'success');
                     $.storehouseAdviceInListApp._store.load({});
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.storehouseAdviceInListApp.init();
    });
}(jQuery));