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

          BUI.use(['bui/form', 'bui/grid', 'bui/data', 'common/pagingbarext'], function (Form, Grid, Data, PagingBarExt) {
             
                var columns = [
                    {title : '主键',dataIndex :'id', visible : false},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:'10%',elCls : 'center'},
                    {title : '粮油商品SKU编号',dataIndex :'supplierSkuCode', width:'10%',elCls : 'center'},
                    {title : '粮油商品名称',dataIndex :'itemName', width:'20%',elCls : 'center'},
                    {title : '交易数量',dataIndex :'num', width:'5%',elCls : 'center'},
                    {title : '平台订单号',dataIndex :'platformOrderCode', width:'10%',elCls : 'center'},
                    {title : '店铺订单号',dataIndex :'shopOrderCode', width:'10%',elCls : 'center'},
                    {title : '粮油订单号',dataIndex :'supplierOrderCode', width:'10%',elCls : 'center'},
                    {title : '买家实付商品金额',dataIndex :'payment', width:'12%',elCls : 'center'},
                    {title : '系统发送粮油时间',dataIndex :'createTime', width:'13%',elCls : 'center'}
                ];
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                /*form.render();*/
                var Grid = Grid,
                    Store = Data.Store;

                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });  
                var store = new Store({
                    url : $.scmServerUrl + "LyBill/LyOrderPage",
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
                    params: {startDate: $.propertyApp._time.startDate,endDate:$.propertyApp._time.endDate}//默认获取近一个月数据
                }),
                  
                grid = new Grid.Grid({
                    render:'#grid',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>'
              });
                console.log(store.getResult())
                grid.render();

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
                    $("#startUpdateTime").attr("value", '');
                    $("#endUpdateTime").attr("value", '');
                    $("#showMsgDiv").hide();
                    form.clearErrors();
                });
            $("#save").on('click', function () {
              if ( !store.getResult().length) {
                   BUI.Message.Alert('导出数据不能为空!', "warning");
                  return
                }
                    var option = $("#J_Form").serialize();
                    window.open($.scmServerUrl+ "LyBill/ExportOrder?" + option);
                }); 
            });
                         
        }
    }
    $(document).ready(function(e) {
        $.propertyApp.init();
    });
}(jQuery));