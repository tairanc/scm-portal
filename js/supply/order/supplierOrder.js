/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.supplierOrderApp = {
        _store : null,
        _dialog : null,
        _record : null,
        _time: null,
        init : function(){     
            Date.prototype.Format=function (fmt) { 
                var o = {
                    "M+": this.getMonth() + 1, //月份 
                    "d+": this.getDate(), //日 
                    "h+": this.getHours(), //小时 
                    "m+": this.getMinutes(), //分 
                    "s+": this.getSeconds(), //秒 
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
                    "S": this.getMilliseconds() //毫秒 
                };
                if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
                for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            };
            var dateLenth=function(num){
                var d1 = new Date();
                var d2 = new Date(d1);
                var y = d1.getFullYear();
                var m = d1.getMonth()+1;
                var d3= y +"-"+m+"-"+"01";
                d2.setMonth(d1.getMonth()-num);
                d1 = d1.Format("yyyy-MM-dd");d2 = d2.Format("yyyy-MM-dd");
                return {
                    startDate: d2,
                    endDate: d1
                }
            };
            $.supplierOrderApp._time = dateLenth(1);
            $("#startDate2").attr("value", $.supplierOrderApp._time.startDate);
            $("#endDate2").attr("value", $.supplierOrderApp._time.endDate);
            $("#startDate2").on("change",function(){
                if($("#startDate2").val()&& $("#endDate2").val()&&$("#startDate2").val()>$("#endDate2").val()){
                    $("#showMsgDiv").show();
                }else{
                    $("#showMsgDiv").hide();
                }
            });
            $("#endDate2").on("change",function(){
                if($("#startDate2").val()&& $("#endDate2").val()&&$("#startDate2").val()>$("#endDate2").val()){
                    $("#showMsgDiv").show();
                }else{
                    $("#showMsgDiv").hide();
                }
            });
            this.querySupplier();
            this.queryOneAgentSupplier();
            this.queryWarehouseStatus();
            this.querySellChannel();
            BUI.use(['bui/form','bui/grid','bui/data','bui/tab','bui/mask'],function(Form,Grid,Data,Tab){
                 var tab = new Tab.TabPanel({
                     srcNode : '#tab',
                     elCls : 'nav-tabs',
                     itemStatusCls : {
                         'selected' : 'active'
                     },
                     panelContainer : '#tabContent'//如果不指定容器的父元素，会自动生成
                 });

                 tab.render();

                 tab.setSelected( tab.getItemAt( 1 ) );
                 tab.removeItem( tab.getItemAt( 0 ) );

                 var jdAddressUrl = "";
                 if($.jdAddressSource == "0"){
                     jdAddressUrl = "/js/util/jingDongArea.js";
                 }else{
                     jdAddressUrl = $.scmServerUrl + 'metadata/jdAddress';
                 }

                 Form.Group.Select.addType('jingDongArea',{
                     proxy : {//加载数据的配置项
                         autoLoad:true,
                         url :  jdAddressUrl,
                         dataType : 'json'//使用json
                     }
                 });

                 var form = new Form.HForm({
                     srcNode: '#J_Form3',
                     defaultChildCfg: {
                         // validEvent: 'blur' //移除时进行验证
                     }
                 });
                 form.render();


             });

            //this.initOrderQuery();
            this.initExternalOrderQuery();
            this.initDialog();
        },
        /**
         * 初始化自采订单查询
         */
        /*initOrderQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){


                var columns = [
                    {title : '订单类型',dataIndex :'orderType',visible : false},
                    {title : '供应商订单编号',sortable: false,dataIndex :'warehouseOrderCode', width:'20%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command orderDtl">'+val+'</span>';
                    }},
                    {title : '供应商名称',sortable: false,dataIndex :'supplierName', width:'20%',elCls : 'center'},
                    {title : '店铺订单号',sortable: false,dataIndex :'shopOrderCode', width:'20%',elCls : 'center'},
                    {title : '商品总数量',sortable: false,dataIndex :'itemsNum', width:'10%',elCls : 'center'},
                    {title : '商品总金额(元)',sortable: false,dataIndex :'payment', width:'15%',elCls : 'center'},
                    {title : '付款时间',sortable: false,dataIndex :'payTime', width:'10%',elCls : 'center'}
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

                var store = new Store({
                        url : $.scmServerUrl + "order/warehouseOrderPage",
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
                        params: {orderType: "0"}//自采订单
                    }),
                    grid = new Grid.Grid({
                        render:'#grid',
                        columns : columns,
                        store: store,
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        // bbar:{
                            // pagingBar:表明包含分页栏
                            // pagingBar:true
                        // }
                    });

                grid.render();

                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('orderDtl')){
                        window.location.href = "warehouseOrderDetail.html?warehouseOrderCode="+record['warehouseOrderCode']+"&id="+record['id'];
                    }
                });

                $("#sel_btn").on("click",function(){
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        store.load(formData);
                        bar.jumpToPage(1);
                    }
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors();
                });

                $("#province").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#city").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#area").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#street").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });


            })

        },*/
        /**
         * 拼接地址


         * @param _address
         */
        contactAddress : function () {
            $("#jdAddress").empty();
            var _province = $("#province").find("option:selected");
            var _city = $("#city").find("option:selected");
            var _area = $("#area").find("option:selected");
            var _street = $("#street").find("option:selected");

            var val = "";
            if(_province.val() != undefined && _province.val() != ""){
                val = _province.val();
            }
            if(_city.val() != undefined && _city.val() != ""){
                val = val + "/" + _city.val();
            }
            if(_area.val() != undefined && _area.val() != ""){
                val = val + "/" + _area.val();
            }
            if(_street.val() != undefined && _street.val() != ""){
                val = val + "/" + _street.val();
            }

            var text = "";
            if(_province.val() != undefined && _province.val() != ""){
                text = _province.text();
            }
            if(_city.val() != undefined && _city.val() != ""){
                text = text + "/" + _city.text();
            }
            if(_area.val() != undefined && _area.val() != ""){
                text = text + "/" + _area.text();
            }
            if(_street.val() != undefined && _street.val() != ""){
                text = text + "/" + _street.text();
            }
            $("#jdAddress").append('<option value="'+val+'">'+text+'</option>');
        },

        /**
         * 初始化代发订单查询
         */
        initExternalOrderQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'],function(Form,Grid,Data,PagingBarExt,Tooltip){
                var columns = [
                    {title : '订单类型',dataIndex :'orderType',visible : false},
                    {title : '供应商订单编号',sortable: false,dataIndex :'warehouseOrderCode', width:'15%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command orderDtl">'+val+'</span>';
                    }},
                    {title : '供应商名称',sortable: false,dataIndex :'supplierName', width:'12%',elCls : 'center'},
                    {title : '系统订单号',sortable: false,dataIndex :'scmShopOrderCode', width:'12%',elCls : 'center'},
                    {title : '销售渠道平台订单号',sortable: false,dataIndex :'platformOrderCode', width:'12%',elCls : 'center'},
                    {title : '销售渠道订单号',sortable: false,dataIndex :'shopOrderCode', width:'13%',elCls : 'center'},
                    {title : '销售渠道',sortable: false,dataIndex :'sellName', width:'10%',elCls : 'center'},
                    {title : '商品总数量',sortable: false,dataIndex :'itemsNum', width:'10%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '商品总金额(元)',sortable: false,dataIndex :'payment', width:'13%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '付款时间',sortable: false,dataIndex :'payTime', width:'17%',elCls : 'center'},
                    {title : '状态',dataIndex :'supplierOrderStatus', width:'10%',elCls : 'center', renderer : function(val,obj){
                        var objStr = BUI.JSON.stringify(obj).replace(/\"/g,"'").replace("\\n", " \t ");
                        var supplierOrderStatus = $.dictTranslate("supplierOrderStatus", val);
                        if(val == "5"){//下单失败
                            return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + supplierOrderStatus + '</span>'
                        }
                        if(val == "2"){
                            return '<span class="grid-status2" style="width:400px;color:red;" data-title="'+objStr+'">' + supplierOrderStatus + '</span>'
                        }
                        else{
                            return '<span>'+supplierOrderStatus+'</span>';
                        }
                    }},

                    {title : '反馈物流公司名称-反馈运单号',sortable: false,dataIndex :'logisticsInfo', width:'17%',elCls : 'center'},
                    {
                        title : '操作',
                        sortable: false,
                        dataIndex :'isValid',
                        width:'10%',
                        elCls : 'center',
                        renderer : function(val, record, index){
                            var _value = record['logisticsCorporation']+"-"+record['waybillNumber'];
                            var supplierCode = record['supplierCode'];
                            var supplierOrderStatus = record['supplierOrderStatus'];                        
                            if(record['isCancel']=="0"||record['isCancel']==null&&supplierOrderStatus!="7"){
                                if(supplierCode == "JD"){
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){//待发送或者下单失败
                                        return '<span class="grid-command addressAdapter">映射京东地址</span>'+ '<span class="grid-command closeOrder">关闭</span>';                                        
                                    }else{
                                        return '<span class="grid-command">--</span>';
                                    }
                                }else{
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){
                                        return '<span class="grid-command closeOrder">关闭</span>';
                                    }else{
                                        return "<span>--</span>";
                                    }
                                }                              
                            }else if(record['isCancel']=="0"||record['isCancel']==null&&supplierOrderStatus=="7"){
                                if(supplierCode == "JD"){
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){//待发送或者下单失败
                                        return '<span class="grid-command addressAdapter">映射京东地址</span>';                                        
                                    }else{
                                        return "<span>--</span>";
                                    }
                                }else{
                                    return "<span>--</span>";
                                }  
                            }
                            if(record['isCancel']=='1'){
                                if(supplierCode == "JD"&&record['showCancel']==1){
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){//待发送或者下单失败
                                        return '<span class="grid-command addressAdapter">映射京东地址</span>'+ '<span class="grid-command cancelClose">取消关闭</span>';
                                    }else {
                                        return '<span class="grid-command cancelClose">取消关闭</span>';
                                    }                                 
                                }else if(supplierCode == "JD"&&record['showCancel']==0){
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){//待发送或者下单失败
                                        return '<span class="grid-command addressAdapter">映射京东地址</span>';
                                    }else {
                                        return '<span class="grid-command ">--</span>';
                                    } 
                                }else if(supplierCode=="LY"&&record['showCancel']==1){
                                    return '<span class="grid-command cancelClose">取消关闭</span>';                                        
                                }
                                else{
                                    return '<span class="grid-command ">--</span>';
                                }                                
                            }else{
                                if(supplierCode == "JD"){
                                    if(supplierOrderStatus == "1" || supplierOrderStatus == "5"){//待发送或者下单失败
                                        return '<span class="grid-command addressAdapter">映射京东地址</span>';
                                    }
                                }else{
                                    return "<span>--</span>";
                                }                            
                            }                            
                        }}

                ];

                var form = new Form.HForm({
                    srcNode : '#J_Form2',
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
                        url : $.scmServerUrl + "order/warehouseOrderPage",
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
                        params: {orderType: "1",startDate: $.supplierOrderApp._time.startDate,endDate:$.supplierOrderApp._time.endDate}//代发订单
                }),
               
                grid = new Grid.Grid({
                    render:'#grid2',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    // bbar:{
                        // pagingBar:表明包含分页栏
                        // pagingBar:true
                    // },
                    plugins: [editing]
                });
               
                grid.render();

                $.supplierOrderApp._store = store;               
              
                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                var bar = new PagingBarExt({
                    render: "#bar2",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('orderDtl')){
                        var config = {
                            title: "供应商订单",
                            href: "order/warehouseOrderDetail2.html?warehouseOrderCode="+record['warehouseOrderCode']+"&id="+record['id']
                        }
                         window.parent.addTab(config)
                        //window.location.href = "warehouseOrderDetail2.html?warehouseOrderCode="+record['warehouseOrderCode']+"&id="+record['id'];
                    }else if(target.hasClass('addressAdapter')){
                        $.supplierOrderApp._record = record;
                        $.supplierOrderApp.queryPlatformOrder($.supplierOrderApp._record['platformOrderCode']);
                        $("#jdAddress").find("option:selected").remove();
                        $("#province").val("");
                        $("#city").val("");
                        $("#area").val("");
                        $("#street").val("");
                        $.supplierOrderApp._dialog.show();
                    }else if(target.hasClass('closeOrder')){
                        $("#cancelReason").val("");
                        $.supplierOrderApp._record = record;
                        $.supplierOrderApp._closeOrderDialog.show();
                    }else if(target.hasClass('cancelClose')){
                        $.supplierOrderApp._record = record;
                        $.supplierOrderApp._cancelCloseDialog.show();
                    }
                });

                $("#sel_btn2").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                    
                });

                $("#reset2").on("click",function(){
                    $("#startDate2").attr("value", '');
                    $("#endDate2").attr("value", '');
                    $("#showMsgDiv").hide();
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

                $("#province").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#city").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#area").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });

                $("#street").on("change",function(){
                    $.supplierOrderApp.contactAddress();
                });
                var tips = new Tooltip.Tips({
                    tip : {
                        trigger : '.grid-status', //出现此样式的元素显示tip
                        alignType : 'bottom-left', //默认方向
                        elCls : 'panel',
                        width: 280,
                        titleTpl : '<div class="panel-header">\
                        <h3>下单失败信息</h3>\
                      </div>\
                      <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                        <div>{message}</div>\
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
                        <h3>下单异常信息</h3>\
                      </div>\
                      <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                        <div>{message}</div>\
                      </div>',
                        offset : 10 //距离左边的距离
                    }
                });
                tips.render();
                tips2.render();
            });
        },
        /**
         * 查询仓库订单状态
         * @param url
         * @param data
         */
        queryWarehouseStatus : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/selectByTypeCode/supplierOrderStatus";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var resultList0=result.result,resultList = [];
                    resultList0.map((item, index) => {
                        if(Number(item['value'])<8) {
                            resultList.push(item) 
                        }
                    });
                    $.AddItem("supplierOrderStatus", resultList, "value", "name", true);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询性质为自采的供应商
         * @param url
         * @param data
         */
        querySupplier : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/suppliers";
            aContent.data = {isValid: "1"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem("supplierCode", result.result, "supplierCode", "supplierName", true);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询性质为一件代发的供应商
         * @param url
         * @param data
         */
        queryOneAgentSupplier : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/suppliers";
            aContent.data = {supplierKindCode: "oneAgentSelling"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem("supplierCode2", result.result, "supplierInterfaceId", "supplierName", true);
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
        /**
         * 初始化弹出框
         */
        initDialog: function () {

            BUI.use(['bui/overlay','bui/mask'],function(Overlay){

                $.supplierOrderApp._dialog = new Overlay.Dialog({
                    title:'映射京东地址',
                    // width:"50%",
                    // height:400,
                    autoRender :true,
                    contentId:'jdAddressAdapterDiv',
                    autoLoad: true,
                    /*loader : {
                        url: 'jingDongAddressAdjust.html',
                        autoLoad: false, //不自动加载
                    },*/
                    buttons:[
                        {
                            text:'确定并发送京东',
                            elCls : 'button button-primary',
                            handler : function(){
                                if($.supplierOrderApp.checkJdAddress()){
                                    var jdAddressCode = $("#jdAddress").val();
                                    var jdAddressName = $("#jdAddress").find("option:selected").text();
                                    $.supplierOrderApp.submitJingDongOrder(jdAddressCode, jdAddressName);
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

            BUI.use(['bui/overlay','bui/mask'],function(Overlay){                
                $.supplierOrderApp._closeOrderDialog = new Overlay.Dialog({
                    title:'确定关闭',
                    autoRender :true,
                    contentId:'clsoeOrderDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'确定关闭',
                            elCls : 'button button-primary',
                            handler : function(){
                                var cancelMsg = $("#cancelReason").val(); 
                                if(cancelMsg==null||cancelMsg==''){
                                    BUI.Message.Alert('请填写关闭原因！','warning');
                                    return false;
                                }
                                $.supplierOrderApp.closeOrder(1);
                                this.close();
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
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){
                $.supplierOrderApp._cancelCloseDialog = new Overlay.Dialog({
                    title:'取消关闭',
                    autoRender :true,
                    contentId:'closeCancelDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary',
                            handler : function(){
                                $.supplierOrderApp.closeOrder(0);
                                this.close();
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
         * 京东地址校验
         */
        checkJdAddress : function () {
            if($("#province").val() == ""){
                BUI.Message.Alert("省份不能为空", "warning");
                return false;
            }
            if($("#city").val() == ""){
                BUI.Message.Alert("城市不能为空", "warning");
                return false;
            }
            if($("#area").val() == ""){
                BUI.Message.Alert("区/县不能为空", "warning");
                return false;
            }
            if($("#street").val() == ""){
                var strees = $("#street option").size();
                if(strees > 1){
                    BUI.Message.Alert("街道不能为空", "warning");
                    return false;
                }
            }
            return true;
        },
        /**
         * 查询平台订单信息
         * @param url
         * @param data
         */
        queryPlatformOrder : function (platformOrderCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"order/platformOrders";
            aContent.data = {platformOrderCode: platformOrderCode};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var platformOrders = result.result;
                    if(platformOrders && platformOrders.length > 0){
                        var platformOrder = platformOrders[0];
                        var _address = "";
                        if(platformOrder['receiverProvince']){
                            _address = _address + platformOrder['receiverProvince'];
                        }
                        if(platformOrder['receiverCity']){
                            _address = _address + '/' + platformOrder['receiverCity'];
                        }
                        if(platformOrder['receiverDistrict']){
                            _address = _address + '/' + platformOrder['receiverDistrict'];
                        }
                        $("#provinceCityArae").text(_address);
                        $("#address").text(platformOrder['receiverAddress']);
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 提交订单到京东
         * @param url
         * @param data
         */
        submitJingDongOrder : function (jdAddressCode, jdAddressName) {
            $.showLoadMask("正在提交订单,请稍等...");
            console.log(jdAddressCode);
            console.log(jdAddressName);
            var record = $.supplierOrderApp._record;
            var aContent = $.AjaxContent();
            aContent.type = 'POST';
            aContent.url = $.scmServerUrl+"order/jingDongOrder";
            aContent.data = {warehouseOrderCode: record['warehouseOrderCode'], jdAddressCode: jdAddressCode, jdAddressName: jdAddressName};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    BUI.Message.Alert("操作成功",'info');
                }
            };
            aContent.complete = function(){
                $.hideLoadMask();
                $.supplierOrderApp._store.load();
            };
            $.ajax(aContent);
        },

        /*供应商订单取消*/
        closeOrder: function(isCancel){        
            $.showLoadMask("正在取消订单,请稍等...");
            var record = $.supplierOrderApp._record;
            var cancelMsg = $("#cancelReason").val();
            var aContent = $.AjaxContent();
            aContent.type = 'PUT';
            aContent.url = $.scmServerUrl+"order/orderCancel"; 
            if(isCancel==1){
                aContent.data  ={warehouseOrderCode:record['warehouseOrderCode'],isCancel:isCancel,cancelReason:cancelMsg};
            }
            if(isCancel==0){
                aContent.data  ={warehouseOrderCode:record['warehouseOrderCode'],isCancel:isCancel};
            } 
            if(isCancel==1){
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer,'warning');
                    }else{                        
                        BUI.Message.Alert("订单关闭成功",'success');
                    }
                };
            } 
            if(isCancel==0){
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        BUI.Message.Alert("订单取消关闭成功",'success');
                    }
                };
            }                     
            aContent.complete = function(){
                $.hideLoadMask();
                $.supplierOrderApp._store.load();
            };
            $.ajax(aContent);
        }

    }
    $(document).ready(function(e) {
        $.supplierOrderApp.init();
    });
}(jQuery));