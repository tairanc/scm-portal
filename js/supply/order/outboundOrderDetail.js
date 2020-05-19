/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    $("#btnBack").on("click",function(){
        window.location.href = "outboundOrderList.html";
    });
    $(".logs-btn").on("click",function(){
        $.showLogsDialog("logInfoPage?entityType=OutboundOrder&entityId=" + $.getUrlParam("id"));
    });
    $.warehouseOrderDetail2App = {
        _jdSupplierCode : "JD", //京东供应商编码
        _id : "",
        store : null,
        _outboundOrderCode: null,
        /**
         * 初始化
         */
        init : function () {
          this._id = $.getUrlParam("id");
          this._isStoreOrder = $.getUrlParam("isStoreOrder")
          this._status = $.getUrlParam("status")
          this.queryOrderDetail(this._id);
          console.log(this._isStoreOrder, this._status)
        },
        /**
         * 初始化商品明细
         * @param orderItems
         */
      initItemsDetail: function (orderItems) {
            var _this = this
            BUI.use(['bui/grid','bui/data','bui/form'],function(Grid, Data,Form) {
                var data = orderItems;
                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : 'SKU名称',dataIndex :'skuName', width:250,elCls : 'center'},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:200,elCls : 'center',renderer:function(val){
                        //return '<span class="grid-command skuDtl">'+val+'</span>';
                        return '<span>'+val+'</span>'
                    }},
                    {title : '规格',dataIndex :'specNatureInfo', width:200,elCls : 'center'},
                    {title : '实付总金额(元)',dataIndex :'actualAmount', width:150,elCls : 'center'},
                    {title : '应发商品数量',dataIndex :'shouldSentItemNum',width:150,elCls : 'center'},
                    {title : '实发商品数量',dataIndex :'realSentItemNum',width:150, elCls : 'center'},
                  {
                    title: '发货状态', dataIndex: 'status', width: 150, elCls: 'center', renderer: function (value) {
                      
                        return '<span>'+$.dictTranslate("outboundOrderStatus", value)+'</span>'
                       
                        // if (value == '1') {
                        //     return '仓库接收失败';
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
                    }},
                    {title : '物流公司',dataIndex :'outboundDetailLogisticsList', width:159,elCls : 'center',renderer:function(val){
                      var str = "";
                      if ($.getUrlParam("isStoreOrder") == '2' && $.getUrlParam("status") == '4') { 
                        setTimeout(function () {  //强行合拼列
                          var dom = $('.addCol').find('.bui-grid-row');
                          dom.find('.grid-td-col8').attr('colspan',4)
                        },10)
                        return "已自提"
                      } else {
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].logisticsCorporation+"</p>"
                            }
                            return str;
                        }else{
                            return "<p>-</p>"
                        }
                      }  
                    }},
                    {title : '运单编号',dataIndex :'outboundDetailLogisticsList', width:159,elCls : 'center',renderer:function(val){
                      var str = "";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                str+="<p>"+val[i].waybillNumber+"</p>"
                            }
                            return str;
                        }else{
                            return "<p>-</p>"
                        }
                      
                    }},
                    {title : '商品数量',dataIndex :'outboundDetailLogisticsList', width:159,elCls : 'center',renderer:function(val){
                        var str ="";
  
                          if(val&&val.length>0){
                              for(var i=0;i<val.length;i++){
                                  var de = val[i].itemNum;
                                  if(de == null){
                                      de = "-";
                                  }
                                  str+="<p>"+de+"</p>"
                              }
                              return str;
                          }else{
                              return "<p>-</p>"
                          }
                        
                    }},
                    {title : '实际发货时间',dataIndex :'outboundDetailLogisticsList', width:159,elCls : 'center',renderer:function(val){
                      var str = "";
                        if(val&&val.length>0){
                            for(var i=0;i<val.length;i++){
                                var de = val[i].deliverTime;
                                if(de == null){
                                    de = "-";
                                }
                                str+="<p>"+de+"</p>"
                            }
                            return str;
                        }else{
                            return "<p>-</p>"
                        }
                  
                        
                    }}
                ];
                var colGroup = new Grid.Plugins.ColumnGroup({
                    groups:[{
                        title:'物流信息',
                        from:7,
                        to:10
                    }],
              });
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
                    plugins: [colGroup] //表格插件
                });
                grid.render();
                
                
              
                grid.on('cellclick',function  (ev) {
                    var record = ev.record;
                    var target = $(ev.domTarget);                    
                    if(target.hasClass('skuDtl')){
                        record['isClose']=true;
                        record['hideLogs']=true;
                        var config = {
                            title: "商品信息",
                            href: "goods/externalGoodsDetail.html?flag=1&skuCode="+record['skuCode'] + '&isClose=' + (record['isClose']) + '&hideLogs='+record['hideLogs']
                        };
                        window.parent.addTab(config)
                    }
                });

                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();


                $("#editAddress").on('click', function(){
                    $("#formReset").show();
                    $("#formOld").hide();
                    $("#receiverProvince option").each(function(index, el) {
                        if($(el).text() == $("#receiverProvince").data("province")){  
                            $(el).attr("selected","selected");  
                        }
                    });
                    $("#receiverProvince").trigger('change')
                    $("#receiverCity option").each(function(index, el) {
                        if($(el).text() == $("#receiverCity").data("city")){  
                            $(el).attr("selected","selected");  
                        }
                    });
                    $("#receiverCity").trigger('change');
                    $("#receiverDistrict option").each(function(index, el) {
                        if($(el).text() == $("#receiverDistrict").data("district")){  
                            $(el).attr("selected","selected");  
                        }
                    });
                    // var provinceItem=$("#receiverProvince").find("option[text='"+$("#receiverProvince").data("province")+"']");
                    // if(provinceItem.length>0)
                    // {
                    //     $("#receiverProvince").val(provinceItem.attr("value"));
                    // }
                })
                $("#saveEditAddress").on('click', function(){
                    var outboundOrderCode =  $.warehouseOrderDetail2App._outboundOrderCode;
                    var formData = form.serializeToObject();
                    formData["receiverProvince"]=$("#receiverProvince").find("option:selected").text();
                    formData["receiverCity"]=$("#receiverCity").find("option:selected").text();
                    formData["receiverDistrict"]=$("#receiverDistrict").find("option:selected").text();
                    if (form.isValid()) {
                        // 验证过后发送表单
                        $.warehouseOrderDetail2App.saveEdit(outboundOrderCode,formData);
                    }
                })
            });
        },
        /**
         * 查询仓库订单明细
         * @param id
         */
        queryOrderDetail : function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"outOrder/outboundOrderDetail/"+id;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var outboundOrderDetail = result.result;
                    $.warehouseOrderDetail2App.fillData(outboundOrderDetail);
                    $.warehouseOrderDetail2App.initItemsDetail(outboundOrderDetail['outboundDetailList']);
                    $.warehouseOrderDetail2App._outboundOrderCode = outboundOrderDetail['outboundOrderCode']
                }
            };
            $.ajax(aContent);
        },
        /**
         * 填充数据
         * @param shopOrder
         */
        fillData: function (warehouseOrder) {
            for(key in warehouseOrder){
                var val = warehouseOrder[key];
                if(val == null){
                    val = "";
                }
                $("#"+key).text(val);
                $("."+key).text(val);
            }
            //$("#status").text($.dictTranslate("outboundOrderStatus", warehouseOrder['status']));
            if(warehouseOrder['status']=="1"){
                $("#status").text("仓库接收失败");
                 $("#editAddress").show();
            }
            if(warehouseOrder['status']=="2"){
                $("#status").text("等待仓库发货")
            }
            if(warehouseOrder['status']=="3"){
                $("#status").text("仓库告知的过程中状态")
            }
            if(warehouseOrder['status']=="4"){
                $("#status").text("全部发货")
            }
            if(warehouseOrder['status']=="5"){
                $("#status").text("部分发货")
            }
            if(warehouseOrder['status']=="6"){
                $("#status").text("已取消");
                 $("#editAddress").show();
            }
            if(warehouseOrder['status']=="7"){
                $("#status").text("取消中")
            }

            $("#receiverName").attr("value", warehouseOrder['receiverName']);
            $("#receiverPhone").attr("value", warehouseOrder['receiverPhone']);
            $("#receiverAddress").attr("value", warehouseOrder['receiverAddress']);

            $("#receiverProvince").attr("value", warehouseOrder['receiverProvince']);
            $("#receiverProvince").data("province",warehouseOrder['receiverProvince'])
            $("#receiverCity").data("city",warehouseOrder['receiverCity'])
            $("#receiverDistrict").data("district",warehouseOrder['receiverDistrict'])
             //$("#receiverProvince").trigger("change");
            $("#receiverCity").attr("value", warehouseOrder['receiverCity']);
             //$("#receiverCity").trigger("change");
            $("#receiverDistrict").attr("value", warehouseOrder['receiverDistrict']);

        },
        saveEdit:function(outboundordercode , fromData){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + 'outOrder/updateReceiverInfo/' + outboundordercode;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');                    
                }else{
                    $("#formOld").show();
                    $("#formReset").hide();
                    //填充显示表单 
                    $(".receiverName").html($("#receiverName").val());
                    $(".receiverPhone").html($("#receiverPhone").val());
                    $(".receiverAddress").html($("#receiverAddress").val());
                    var receiverProvince=$("#receiverProvince").find("option:selected").text();
                    var receiverCity=$("#receiverCity").find("option:selected").text();
                    var receiverDistrict=$("#receiverDistrict").find("option:selected").text();
                    $(".receiverProvince").html(receiverProvince);
                    $(".receiverCity").html(receiverCity);
                    $(".receiverDistrict").html(receiverDistrict);
                    $("#receiverProvince").data("province",receiverProvince);
                    $("#receiverCity").data("city",receiverCity);
                    $("#receiverDistrict").data("district",receiverDistrict);
                }
            };

            aContent.complete = function () {

                        $.hideLoadMask();
            };
            $.ajax(aContent);
        }
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetail2App.init();
    });
}(jQuery));