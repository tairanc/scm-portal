/**
 * Created by sone on 2017/4/28.
 */
(function(){
    $.jingDongAddressAdjustApp = {
        _store : null,
        _dialog : null,
        _record : null,
        init : function(){

            BUI.use(['bui/form','bui/data'],function(Form,Data){

                Form.Group.Select.addType('jingDongArea',{
                    proxy : {//加载数据的配置项
                        autoLoad:true,
                        url :  "/js/util/jingDongArea.js",
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
        },
        /**
         * 初始化自采订单查询
         */
        initOrderQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data'],function(Form,Grid,Data){

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

        },
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
            if(_province.val()){
                val = _province.val();
            }
            if(_city.val()){
                val = val + "/" + _city.val();
            }
            if(_area.val()){
                val = val + "/" + _area.val();
            }
            if(_street.val()){
                val = val + "/" + _street.val();
            }

            var text = "";
            if(_province.text()){
                text = _province.text();
            }
            if(_city.text()){
                text = text + "/" + _city.text();
            }
            if(_area.text()){
                text = text + "/" + _area.text();
            }
            if(_street.text()){
                text = text + "/" + _street.text();
            }
            $("#jdAddress").append('<option value="'+val+'">'+text+'</option>');
        },

        /**
         * 初始化代发订单查询
         */
        initExternalOrderQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data'],function(Form,Grid,Data){
                var columns = [
                    {title : '订单类型',dataIndex :'orderType',visible : false},
                    {title : '供应商订单编号',dataIndex :'warehouseOrderCode', width:'15%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command orderDtl">'+val+'</span>';
                    }},
                    {title : '供应商名称',dataIndex :'supplierName', width:'12%',elCls : 'center'},
                    {title : '店铺订单号',dataIndex :'shopOrderCode', width:'10%',elCls : 'center'},
                    {title : '商品总数量',dataIndex :'itemsNum', width:'10%',elCls : 'center'},
                    {title : '商品总金额(元)',dataIndex :'payment', width:'13%',elCls : 'center'},
                    {title : '付款时间',dataIndex :'payTime', width:'10%',elCls : 'center'},
                    {title : '状态',dataIndex :'isValid', width:'5%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("warehouseOrderStatus", val)+'</span>';
                    }},
                    {title : '反馈物流公司名称-反馈运单号',dataIndex :'shopOrderCode', width:'17%',elCls : 'center'},
                    {
                        title : '操作',
                        dataIndex :'isValid',
                        width:'8%',
                        renderer : function(val, record, index){
                            var _value = record['logisticsCorporation']+"-"+record['waybillNumber'];
                            return '<span class="grid-command addressAdapter">映射京东地址</span>';
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
                        pageSize : 15,  // 配置分页数目
                        root:'result',
                        totalProperty:'totalCount',
                        params: {orderType: "1"}//代发订单
                    }),
                    grid = new Grid.Grid({
                        render:'#grid2',
                        columns : columns,
                        width: '100%',
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: store,
                        bbar:{
                            // pagingBar:表明包含分页栏
                            pagingBar:true
                        },
                        plugins: [editing]
                    });

                grid.render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('orderDtl')){
                        window.location.href = "warehouseOrderDetail2.html?warehouseOrderCode="+record['warehouseOrderCode'];
                    }else if(target.hasClass('addressAdapter')){
                        $.supplierOrderApp._record = record;
                        $.supplierOrderApp.queryPlatformOrder();
                        $.supplierOrderApp._dialog.show();
                    }
                });

                $("#sel_btn2").on("click",function(){
                    var formData = form.serializeToObject();
                    store.load(formData);
                });

                $("#reset_btn2").on("click",function(){
                    form.clearErrors();
                });

            });
        },
        /**
         * 查询仓库订单状态
         * @param url
         * @param data
         */
        queryWarehouseStatus : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/selectByTypeCode/warehouseOrderStatus";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    $.AddItem("status", result.result, "value", "name", true);
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
                    BUI.Message.Alert(result.databuffer, "warning");
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
            aContent.url = $.scmServerUrl+"select/oneAgentSupplier";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    $.AddItem("supplierCode2", result.result, "value", "name", true);
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
                    width:600,
                    height:400,
                    autoRender :true,
                    contentId:'jdAddressAdapterDiv',
                    autoLoad: true,
                    buttons:[
                        {
                            text:'确定并发送京东',
                            elCls : 'button button-primary',
                            handler : function(){
                                $.supplierOrderApp.submitJingDongOrder();
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
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    var platformOrders = result.result;
                    if(platformOrders && platformOrders.length > 0){
                        var platformOrder = platformOrders[0];
                        $("#provinceCityArae").text(platformOrder['receiverProvince']+"/"+platformOrder['receiverCity']+"/"+platformOrder['receiverDistrict']);
                        $("#address").text(platformOrder['receiverProvince']);
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
        submitJingDongOrder : function () {
            var record = $.supplierOrderApp._record;
            var jdAddressCode = $("#jdAddress").val();
            var jdAddressName = $("#jdAddress").find("option:selected").text();
            var aContent = $.AjaxContent();
            aContent.type = 'POST';
            aContent.url = $.scmServerUrl+"order/jingDongOrder";
            aContent.data = {warehouseOrderCode: record['warehouseOrderCode'], jdAddressCode: jdAddressCode, jdAddressName: jdAddressName};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    BUI.Message.Alert("订单提交到京东成功",'info');
                }
            };
            $.ajax(aContent);
        }


    }
})(jQuery);