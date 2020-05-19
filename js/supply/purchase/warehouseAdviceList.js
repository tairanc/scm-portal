/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.storehouseAdviceListApp = {
        _store : null,
        init: function () {
            this.queryWarehouseNoticeStatusList();
            this.queryPurchaseTypeList();                            
                BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'], function (Form,Grid,Data,PagingBarExt,Tooltip) {                    
                    var columns = [
                        {title : '入库通知单Id',dataIndex :'id', visible : false},
                        {title: '入库通知单编号', dataIndex: 'warehouseNoticeCode', width: '12%', elCls: 'center',renderer :function(value,obj,record){
                            return '<a href='+'warehouseAdviceInfo.html'+"?"+'id='+obj.id+'>'+value+'</a>';
                        }},
                        {title: '采购单编号', dataIndex: 'purchaseOrderCode', width: '12%', elCls: 'center',renderer :function(value,obj,record){
                            return '<span class="grid-command" onclick="$.storehouseAdviceListApp.openDetail(\''+value+'\')">'+value+'</span>'
                        }},
                        {title: '仓库反馈入库单号', dataIndex: 'entryOrderId', width: '12%', elCls: 'center'},
                        {title: '供应商名称', dataIndex: 'supplierName', width: '8%', elCls: 'center'},
                        {
                            title: '采购类型', dataIndex: 'purchaseType', width: '8%', elCls: 'center', renderer: function (value, obj) {
                            if (value == 'purchaseSelling') {
                                return '购销';
                            }
                            if (value == 'agentSelling') {
                                return '代销';
                            }
                            if (value == 'purchaseSellingGift') {
                                return '购销赠品';
                        }
                            if (value == 'agentSellingGift') {
                                return '代销赠品';
                            }
                        }
                        },
                        {title: '收货仓库', dataIndex: 'warehouseName', width: '8%', elCls: 'center'},
                        {title: '要求到货日期', dataIndex: 'requriedReceiveDate', width: '8%', elCls: 'center'},
                        {title: '截止到货日期', dataIndex: 'endReceiveDate', width: '8%', elCls: 'center'},
                        {
                            title: '状态', dataIndex: 'status', width: '8%', elCls: 'center', renderer: function (val, obj) {
                            var objStr = BUI.JSON.stringify(obj).replace(/\'/g,"&rsquo;").replace(/\"/g,"'").replace("\\n", " \t ");
                            if (val == '0') {
                                    return '待通知收货';
                                }
                                if (val == '1') {
                                    //return '<span style="color:red">仓库接收失败</span>';
                                    return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + '仓库接收失败' + '</span>'
                                }
                                if (val == '2') {
                                    return '仓库接收成功';
                                }
                                if (val == '3') {
                                    return '全部入库';
                                }
                                if (val == '4') {
                                    //return '<span style="color:purple">收货异常</span>';
                                    return '<span class="grid-status2" style="color: purple" data-title="'+objStr+'">' + '入库异常' + '</span>'
                                }
                                if (val == '5') {
                                    return '部分入库';
                                }
                                if (val == '6') {
                                    return '作废';
                                }
                                if (val == '7') {
                                    return '已取消';
                                }
                        }
                        },
                        {title: '入库单创建人', dataIndex: 'createOperator', width: '8%', elCls: 'center'},
                        {title: '最近更新时间', dataIndex: 'updateTime', width: '12%', elCls: 'center'},
                        {title: '操作', dataIndex: 'status', width: '8%', elCls: 'center',renderer:function(val){
                            if(val==1||val==0){
                                return '<span class="grid-command notice">'+'通知收货'+'</span>';
                            }else{
                                return '<span class="grid-command">'+'--'+'</span>';
                            }
                        }}
                    ];
                    var form = new Form.HForm({
                        srcNode: '#J_Form',
                        defaultChildCfg: {
                            validEvent: 'blur' //移除时进行验证
                        }
                    });
                    var tips = new Tooltip.Tips({
                        tip : {
                            trigger : '.grid-status', //出现此样式的元素显示tip
                            alignType : 'bottom-left', //默认方向
                            elCls : 'panel',
                            width: 280,
                            titleTpl : '<div class="panel-header">\
                            <h3>仓库失败信息</h3>\
                          </div>\
                          <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                            <div>{failureCause}</div>\
                          </div>',
                            offset : 10 //距离左边的距离
                        }
                    });
                    var tips2 = new Tooltip.Tips({
                        tip : {
                            trigger : '.grid-status2', //出现此样式的元素显示tip
                            alignType : 'bottom-left', //默认方向
                            elCls : 'panel',
                            width: 280,
                            titleTpl : '<div class="panel-header">\
                            <h3>收货异常信息</h3>\
                          </div>\
                          <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                            <div>{exceptionCause}</div>\
                          </div>',
                            offset : 10 //距离左边的距离
                        }
                    });
                    tips.render();
                    tips2.render();
                    var Grid = Grid,
                    Store = Data.Store;
                    var store = new Store({
                        url : $.scmServerUrl + "warehouseNotice/warehouseNoticePage",
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
                        params: {}//默认获取近一个月数据
                    }),
                    grid = new Grid.Grid({
                        render:'#grid',
                        columns : columns,
                        store: store,
                        width:'100%',
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>'
                    });
                    grid.render();
                    store.on("exception", function (e) {
                        $.storeErrorHander(e);
                    });
                    $.storehouseAdviceListApp._store = store;
                    var bar = new PagingBarExt({
                        render: "#bar",
                        elCls: 'bui-pagingbar bui-bar',
                        store: store
                    }).render();

                    $("#sel_btn").on("click",function(){
                        var formData = form.serializeToObject();
                        bar.jumpToPageFix(1,formData);
                    });
                    $("#reset").on("click",function(){
                        form.clearErrors();
                    });
                    grid.on('cellclick',function  (ev) {
                        var record = ev.record; //点击行的记录
                        var target = $(ev.domTarget); //点击的元素
                        if(target.hasClass('notice')){
                            BUI.Message.Confirm('您确定要通知发货吗？<p>确认后将向仓库发送入库通知单。</p>',function(){
                                $.storehouseAdviceListApp.noticeInfo(record);
                            },'question'); 
                        }
                    }); 
                    BUI.use('bui/calendar',function(Calendar){
                        var datepicker = new Calendar.DatePicker({
                           trigger:'.calendar',
                           autoRender : true
                         });
                    });
                    $("#startDate").on("change",function(){
                        if($("#startDate").val()&& $("#endDate").val()&&$("#startDate").val()>$("#endDate").val()){
                            $("#showMsgDiv").show();
                        }else{
                            $("#showMsgDiv").hide();
                        }
                    });
                    $("#endDate").on("change",function(){
                        if($("#startDate").val()&& $("#endDate").val()&&$("#startDate").val()>$("#endDate").val()){
                            $("#showMsgDiv").show();
                        }else{
                            $("#showMsgDiv").hide();
                        }
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
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/purchaseType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('purchaseType', result.result, 'value', 'name', '全部');
                }
            };
            $.ajax(aContent);
        },

        /***
         * 查询入库通知单状态的列表
         */
        queryWarehouseNoticeStatusList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/warehouseNoticeStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('warehouseNoticeStatus', result.result, 'code', 'name', true);
                }
            };
            $.ajax(aContent);
        },
        /*通知收货=====*/
        noticeInfo:function(record){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "warehouseNotice/receiptAdvice/"+record.id;
            aContent.data = {
                warehouseNoticeCode: record.warehouseNoticeCode,
                purchaseOrderCode: record.purchaseOrderCode,
                purhcaseOrderId: record.purhcaseOrderId,
                takeGoodsNo: record.takeGoodsNo,
                id: record.id,
                warehouseCode:record.warehouseCode,
                status:record.status,
                purchaseType:record.purchaseType
            };
            aContent.type = 'PUT';
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    BUI.Message.Alert(result.databuffer,'success');
                    $.storehouseAdviceListApp._store.load({});
                }
            };
            aContent.error =function(XMLHttpRequest){
                var result = "";
                if (XMLHttpRequest.responseText) {
                    result = XMLHttpRequest.responseText;
                    if (!(result instanceof Object)) {
                        try {
                            result = JSON.parse(result);
                        } catch (e) {

                        }
                    }
                }
                if (XMLHttpRequest.status == 401) {
                    BUI.Message.Alert(result.databuffer || "",function(){
                        var aContent = $.AjaxContent();
                        aContent.type = "POST";
                        aContent.url = $.scmServerUrl + "account/user/logout/";
                        aContent.success = function () {
                            if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                            } else {
                                window.location.href = '/supply/login.html';
                            }

                            localStorage.clear();
                        };
                        $.ajax(aContent);
                        this.close();
                    },'error');
                } else if (XMLHttpRequest.status == 403) {
                    if (result.appcode == 0) {
                        if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                            } else {
                                window.location.href = '/supply/login.html';
                            }
                    }
                } else if (XMLHttpRequest.status == 404) {
                    window.top.location = "/supply/404.html";
                } else if (XMLHttpRequest.status == 500) {
                    window.top.location = "/supply/500.html";
                } else {
                    if (result.appcode == 0) {                        
                        BUI.Message.Alert(result.databuffer || "", 'error');
                        $.storehouseAdviceListApp._store.load({});
                    }
                }
            }
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.storehouseAdviceListApp.init();
    });
}(jQuery));