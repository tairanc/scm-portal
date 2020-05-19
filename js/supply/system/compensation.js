/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){

    $.propertyApp = {
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
            var d1 = new Date();
            d1 = d1.Format("yyyy-MM-dd");         
            $("#startUpdateTime").attr("value",d1);
            BUI.use('bui/calendar',function(Calendar){
                var datepicker = new Calendar.DatePicker({
                   trigger:'.calendar',
                   autoRender : true
                 });
            });
            $('#sel_btn').on('click',function(){
                var date = $("#startUpdateTime").val();
                if(!date){
                    BUI.Message.Alert('请先选择对账时间!','warning');
                }else{
                    $.propertyApp.getCompletionOrder(date);
                }
            }); 
            $('#reset').on('click',function(){
                $("#startUpdateTime").attr("value", '');
            })                           
        },
        /*查询账户信息*/
        getCompletionOrder: function(date){
            var aContent = $.AjaxContent();
            aContent.url= $.scmServerUrl+"bill/completionOrder";
            aContent.type = "POST";
            aContent.data = {date:date};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    BUI.Message.Alert(result.databuffer,'success');                   
                }
            };
            $.ajax(aContent);
        },

    }
    $(document).ready(function(e) {
        $.propertyApp.init();
    });
}(jQuery));