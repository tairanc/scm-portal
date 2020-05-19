/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){

    $.propertyApp = {
        _storeBan : null,
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
            dateLenth = function(num){
                var d1 = new Date();
                var d2 = new Date(d1);
                d2.setMonth(d1.getMonth()-num);
                var y = d1.getFullYear();
                var m = d1.getMonth()+1;
                if(m<10){
                    var d3= y +"-"+"0"+m+"-"+"01"; 
                }else{
                    var d3= y +"-"+m+"-"+"01";
                };  
                //var d3= y +"-"+m+"-"+"01";         
                d1 = d1.Format("yyyy-MM-dd");d2 = d2.Format("yyyy-MM-dd");            
                return {
                    startDate: d3,
                    endDate: d1
                }
            };
            BUI.use('bui/calendar',function(Calendar){
                var datepicker = new Calendar.DatePicker({
                   trigger:'.calendar',
                   autoRender : true
                 });
            });
            $.propertyApp._time = dateLenth(1);
            $("#startUpdateTime").attr("value", $.propertyApp._time.startDate);
            $("#endUpdateTime").attr("value", $.propertyApp._time.endDate);
            $("#startUpdateTime2").attr("value", $.propertyApp._time.startDate);
            $("#endUpdateTime2").attr("value", $.propertyApp._time.endDate);
            $("#startUpdateTime").on("change",function(){
                if($("#startUpdateTime").val()&& $("#endUpdateTime").val()&&$("#startUpdateTime").val()>$("#endUpdateTime").val()){
                    $("#showMsgDiv").show();
                }else{
                    $("#showMsgDiv").hide();
                }
            });
            $("#endUpdateTime").on("change",function(){
                if($("#startUpdateTime").val()&& $("#endUpdateTime").val()&&$("#startUpdateTime").val()>$("#endUpdateTime").val()){
                    $("#showMsgDiv").show();
                }else{
                    $("#showMsgDiv").hide();
                }
            });
            $("#startUpdateTime2").on("change",function(){
                if($("#startUpdateTime2").val()&& $("#endUpdateTime2").val()&&$("#startUpdateTime2").val()>$("#endUpdateTime2").val()){
                    $("#showMsgDiv2").show();
                }else{
                    $("#showMsgDiv2").hide();
                }
            });
            $("#endUpdateTime2").on("change",function(){
                if($("#startUpdateTime2").val()&& $("#endUpdateTime2").val()&&$("#startUpdateTime2").val()>$("#endUpdateTime2").val()){
                    $("#showMsgDiv2").show();
                }else{
                    $("#showMsgDiv2").hide();
                }
            });
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
             });
            this.orderDetailList();            
            this.getBalanceInfo();
            this.getBalanceDetails(dateLenth(1));
            this.getTreadType();
            this.initDialog();
            this.balanceDetailList();                      
        },
        orderDetailList: function(){            
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var columns = [
                    {title : '主键',dataIndex :'id', visible : false},                    
                    {title : '异常说明',dataIndex :'errMsg', width:'150px',elCls : 'center'},
                    {title : '京东订单生成时间',dataIndex :'jingdongOrderCreateTime', width:'140px',elCls : 'center'},
                    {title : '京东父订单编号',dataIndex :'parentOrderCode', width:'140px',elCls : 'center'},
                    {title : '京东子订单编号',dataIndex :'orderCode', width:'140px',elCls : 'center'},
                    {title : '京东商品编号',dataIndex :'itemSkuCode', width:'140px',elCls : 'center'},
                    {title : '京东商品名称',dataIndex :'itemSkuName', width:'200px',elCls : 'center'},
                    {title : '京东商品一级分类',dataIndex :'firstClassify', width:'140px',elCls : 'center'},
                    {title : '京东商品二级分类',dataIndex :'secondClassify', width:'140px',elCls : 'center'},
                    {title : '京东商品三级分类',dataIndex :'thirdClassify', width:'140px',elCls : 'center'},
                    {title : '京东商品发货数量',dataIndex :'jdItemsNum', width:'140px',elCls : 'center'},
                    {title : '京东商品单价',dataIndex :'price', width:'100px',elCls : 'center'},
                    {title : '京东商品总金额',dataIndex :'totalPrice', width:'120px',elCls : 'center'},
                    {title : '京东子订单运费',dataIndex :'freight', width:'100px',elCls : 'center'},
                    {title : '京东子订单总金额',dataIndex :'subTotalPrice', width:'130px',elCls : 'center'},
                    {title : '京东父订单总金额',dataIndex :'parentTotalPrice', width:'130px',elCls : 'center'},
                    {title : '账户实际支付金额',dataIndex :'actualPay', width:'120px',elCls : 'center'},
                    {title : '账户实际退款金额',dataIndex :'refund', width:'120px',elCls : 'center'},                    
                    {title : '渠道订单提交时间',dataIndex :'channelOrderSubmitTime', width:'140px',elCls : 'center'},                    
                    {title : '渠道平台订单号',dataIndex :'channelPlatformOrder', width:'140px',elCls : 'center'},
                    {title : '渠道店铺订单号',dataIndex :'shopOrderCode', width:'140px',elCls : 'center'},
                    {title : '渠道商品订单号',dataIndex :'orderItemCode', width:'140px',elCls : 'center'},     
                    {title : '客户购买商品数量',dataIndex :'channelItemsNum', width:'120px',elCls : 'center'},                         
                    {title : '客户实付商品金额',dataIndex :'pay', width:'120px',elCls : 'center'},              
                    {title : '余额变动时间',dataIndex :'balanceCreateTime', width:'140px',elCls : 'center'},
                    {title : '订单状态',dataIndex :'state', width:'75px',elCls : 'center'},                    
                    {title : '了结状态',dataIndex :'operate', width:'100px',elCls : 'center'},
                    {title : '操作',dataIndex :'operate', width:'60px',elCls : 'center',renderer:function(val){
                        if(val=="待了结"){
                            return '<span class="grid-command finish">操作</span>';
                        }if(val=="已了结"){
                            return '<span class="grid-command finish">操作</span>';
                        }else{
                            return val;
                        }
                    }}
                ];
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        //validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();
                var Grid = Grid,
                    Store = Data.Store;

                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });                
                var store = new Store({
                    url : $.scmServerUrl + "bill/orderDetailPage",
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
                    params: {startUpdateTime: $.propertyApp._time.startDate,endUpdateTime:$.propertyApp._time.endDate}//默认获取近一个月数据
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
                grid.on("aftershow", function(e) {
                    const Grid = e.target
                    const items = Grid.getItems()
                    items.map((item, index) => {
                        if(item['errMsg'] && item['errMsg'] != '正常'&&item['operate']!="已了结") {
                            $(Grid.findElement(item)).addClass('errMsg');  
                        }
                    });
                })
                grid.on("afterRenderUI", function(e) {
                    console.log(e.target, '(((')
                })
                $.propertyApp._storeBan = store;
                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });
                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                $("#sel_btn").on("click",function(){
                    //if(form.isValid()){
                        var formData = form.serializeToObject();
                        //store.load(formData);
                        bar.jumpToPageFix(1,formData);
                    //}
                });

                $("#reset").on("click",function(){
                    $("#startUpdateTime").attr("value", '');
                    $("#endUpdateTime").attr("value", '');
                    $("#showMsgDiv").hide();
                    form.clearErrors();
                });
                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('finish')){
                        if(record.operate=="已了结"){
                            $("#1").attr('checked',true);
                        }
                        if(record.operate=="待了结"){
                            $("#2").attr('checked',true);
                        }
                        $("#remark").val("");
                        $("#remark").val(record.remark);
                        $.propertyApp._record = record;
                        $.propertyApp.finishDialog.show();                        
                    }
                });                         
            });
            $("#export").on('click',function(){
                var option = $("#J_Form").serialize();
                window.open($.scmServerUrl+ "bill/exportOrderDetail?" + option);
            });             
        },
        /*初始化模态框*/
        initDialog: function () {
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){            
                $.propertyApp.finishDialog = new Overlay.Dialog({
                    title:'操作',
                    autoRender :true,
                    contentId:'finishDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'保存',
                            elCls : 'button button-primary',
                            handler : function(){
                                $.propertyApp.operateOrder();
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
            /*BUI.use(['bui/overlay','bui/mask'],function(Overlay){
                $.propertyApp.unfinishDialog = new Overlay.Dialog({
                    title:'操作',
                    autoRender :true,
                    contentId:'finishedDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'保存',
                            elCls : 'button button-primary',
                            handler : function(){
                                $.propertyApp.operateOrder(2);
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
            });*/
        },
        /*操作了结与已了结*/
        operateOrder: function(){
            var record = $.propertyApp._record;
            var remark = $("#remark").val();
            var operateVal =$("input[name='operate']:checked").val();
            var aContent = $.AjaxContent();
            aContent.type = 'PUT';
            aContent.url = $.scmServerUrl+"bill/operate";      
            aContent.data  ={id:record['id'],operate:operateVal,remark:remark};                    
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    BUI.Message.Alert("操作成功",'info');                    
                }
            };
            aContent.complete = function(){
                $.propertyApp._storeBan.load(); 
            };
            $.ajax(aContent);
        },
        balanceDetailList: function(){            
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var columns = [
                    {title : '主键',dataIndex :'id', visible : false},
                    {title : '业务号',dataIndex :'tradeNo', width:'13%',elCls : 'center'},
                    {title : '京东账号',dataIndex :'pin', width:'13%',elCls : 'center'},
                    {title : '京东订单号',dataIndex :'orderId', width:'8%',elCls : 'center'},
                    {title : '收入',dataIndex :'income', width:'6%',elCls : 'center'},
                    {title : '支出',dataIndex :'outcome', width:'10%',elCls : 'center'},
                    {title : '账号类型',dataIndex :'accountType', width:'15%',elCls : 'center'},
                    {title : '余额变动时间',dataIndex :'createdDate', width:'15%',elCls : 'center'},                
                    {title : '业务类型',dataIndex :'tradeTypeName', width:'15%',elCls : 'center'},
                    {title : '备注',dataIndex :'notePub', width:'20%',elCls : 'center'}
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
                var store = new Store({
                    url : $.scmServerUrl + "bill/balanceDetailPage",
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
                    params: {startUpdateTime: $.propertyApp._time.startDate,endUpdateTime:$.propertyApp._time.endDate}//默认获取近一个月数据
                }),
                grid = new Grid.Grid({
                    render:'#grid2',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>'
                });

                grid.render();
                $.propertyApp._store = store;
                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });
                var bar = new PagingBarExt({
                    render: "#bar2",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                $("#sel_btn2").on("click",function(){
                    var time={};
                    time.startDate=$("#startUpdateTime2").val();
                    time.endDate=$("#endUpdateTime2").val();                    
                    $.propertyApp.getBalanceDetails(time);
                    var formData = form.serializeToObject();
                    //store.load(formData);
                    bar.jumpToPageFix(1,formData);
                });

                $("#reset2").on("click",function(){
                    $("#startUpdateTime2").attr("value", '');
                    $("#endUpdateTime2").attr("value", '');
                    $("#showMsgDiv2").hide();
                    form.clearErrors();
                });
            });
            $("#export2").on('click',function(){
                var option = $("#J_Form2").serialize();
                console.log(option)
                window.open( $.scmServerUrl+ "bill/exportBalanceDetail?" + option);
            });          
        },
        /*查询账户信息*/
        getBalanceInfo: function(){
            var aContent = $.AjaxContent();
            aContent.url= $.scmServerUrl+"bill/balance";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var info = result.result;
                    if(info){
                        $("#currentBalance").html(info.currentBalance);
                        $("#balance").html(info.balance);
                        $("#expendAll").html(info.expendAll);
                        $("#refundAll").html(info.refundAll);
                        $("#time").html(info.time);
                        if(info.state==1){
                            $("#normal").show();
                        }else{
                            $("#abnormal").show();
                        }
                    }                    
                }
            };
            $.ajax(aContent);
        },
        /*查询余额明细信息*/
        getBalanceDetails: function(time){
            //var time = dateLenth(1);
            var pramData ={
                orderId:$("#orderId").val(),
                tradeTypeName: $("#tradeTypeName").val(),
                startUpdateTime: time.startDate,
                endUpdateTime: time.endDate
            };
            var aContent = $.AjaxContent();
            aContent.url= $.scmServerUrl+"bill/statisticsBalance";
            aContent.data = pramData;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var info = result.result;
                    if(info){
                        $("#income").html(info.totalIncome);
                        $("#outcome").html(info.totalOutCome);
                    }                
                }
            };
            $.ajax(aContent);
        },
        /*查询全部业务类型*/
        getTreadType: function(){
            var aContent = $.AjaxContent();
            aContent.url= $.scmServerUrl+"bill/treadType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var type= result.result;
                    if(type){
                        for(var i=0;i<type.length;i++){
                            $("#tradeTypeName").append("<option value='"+type[i].treadTypeName+"'>"+type[i].treadTypeName+"</option>");
                        }
                    }              
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        if($.getUrlParam("fromtab")){
            $($(".bui-tab-panel-item")[1]).addClass("active");        
        }else{
            $($(".bui-tab-panel-item")[0]).addClass("active")
        };
        $("#tab1").click(function() {
            $("#grid .bui-grid-header").css("width", "100%")
            $("#grid .bui-grid").css("width", "100%")
            $("#grid .bui-grid-body").css("width", "100%")
            $("#grid .bui-grid-table").css("width", "100%")            
        });
        $.propertyApp.init();
    });
}(jQuery));