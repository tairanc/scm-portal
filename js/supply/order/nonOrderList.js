/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){

    $.propertyApp = {
        _time : null,
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
            dateLenth = function(){
                var d1 = new Date();
                var nowTime = d1.getTime();
                var lastTime = nowTime-604800000;
                var endDate = new Date(lastTime);                
                var startTime = d1.Format("yyyy-MM-dd");var endTime = endDate.Format("yyyy-MM-dd");   
                console.log(startTime)
                console.log(endTime)    
                return {
                    startDate: endTime,
                    endDate: startTime
                }
            }
            BUI.use('bui/calendar',function(Calendar){
                var datepicker = new Calendar.DatePicker({
                   trigger:'.calendar',
                   autoRender : true
                 });
            });
            $.propertyApp._time = dateLenth();
            $("#startDate").attr("value", $.propertyApp._time.startDate);
            $("#endDate").attr("value", $.propertyApp._time.endDate);
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
            BUI.use('bui/calendar',function(Calendar){
                var datepicker = new Calendar.DatePicker({
                   trigger:'.calendar',
                   autoRender : true
                 });
            });
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'],function(Form,Grid,Data,PagingBarExt,Tooltip){
                var columns = [
                    {title : '主键',dataIndex :'id', visible : false},
                    {title : '拆单异常单编号',dataIndex :'exceptionOrderCode', width:'10%',elCls : 'center',renderer:function(val){
                        return '<span class="grid-command orderDtl">'+val+'</span>';
                    }},
                    {title : '系统订单号',sortable: false,dataIndex :'scmShopOrderCode', width:'12%',elCls : 'center'},
                    {title : '销售渠道订单号',dataIndex :'shopOrderCode', width:'8%',elCls : 'center'},
                    {title : '销售渠道',sortable: false,dataIndex :'sellName', width:'10%',elCls : 'center'},
                    {title : '店铺名称',dataIndex :'shopName', width:'13%',elCls : 'center'},
                    {title : '异常类型',dataIndex :'exceptionType', width:'8%',elCls : 'center',renderer:function(val){
                        if(val==1){
                            return '<span>缺货退回</span>';
                        }
                        if(val==2){
                            return '<span>缺货等待</span>';
                        }
                    }},
                    {title : '异常商品总数量',dataIndex :'itemNum', width:'10%',elCls : 'center'},
                    {title : '收货人',dataIndex :'receiverName', width:'10%',elCls : 'center'},
                    {title : '收货人联系方式',dataIndex :'receiverMobile', width:'6%',elCls : 'center'},
                    {title : '状态',dataIndex :'status', width:'8%',elCls : 'center',renderer:function(val){
                        if(val==10){
                            return '<span>待了结</span>';
                        }
                        if(val==11){
                            return '<span>已了结</span>';
                        }
                    }},
                    {title : '生成时间',dataIndex :'createTime', width:'13%',elCls : 'center'}
                ];
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                var Grid = Grid,
                    Store = Data.Store;
                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });                
                var store = new Store({
                        url : $.scmServerUrl + "order/exceptionOrderPage",
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
                        params: {startDate: $.propertyApp._time.startDate,endDate:$.propertyApp._time.endDate}
                }),

                grid = new Grid.Grid({
                    render:'#grid',
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
                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('orderDtl')){
                        window.location.href = "nonOrderDetail.html?exceptionOrder="+record['exceptionOrderCode']+"&id="+record['id'];
                    }
                });
                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                });
                $("#reset").on("click",function(){
                    $("#startDate").attr("value", '');
                    $("#endDate").attr("value", '');
                    $("#showMsgDiv").hide();
                    form.clearErrors();
                });
            });            
        
        }
    }
    $(document).ready(function(e) {
        $.propertyApp.init();
    });
}(jQuery));