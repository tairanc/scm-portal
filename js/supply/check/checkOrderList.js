/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){

    $.propertyApp = {
        init : function(){
            // $.propertyApp.queryValidList();
            $.propertyApp.queryPropertyTypeList();
            $.propertyApp.queryTradeTypeList();
            var columns = [
                {title : '主键',dataIndex :'id', visible : false},
                {title : '订单编号',dataIndex :'orderId', width:'13%',elCls : 'center'},
                {title : '业务类型',dataIndex :'tradeType', width:'13%',elCls : 'center'},
                {title : '业务类型名',dataIndex :'tradeTypeName', width:'8%',elCls : 'center'},
                {title : '业务编号',dataIndex :'tradeNo', width:'5%',elCls : 'center'},
                {title : '订单金额',dataIndex :'amount', width:'6%',elCls : 'center'},
                {title : '对账状态',dataIndex :'state', width:'10%',elCls : 'center',renderer :function(value,obj){
                    if(value=='0'){
                        return '未对账';
                    }
                    return '已对账'
                }},
                {title : '余额变动时间',dataIndex :'createdDate', width:'15%',elCls : 'center'},
                {title : '备注',dataIndex :'notePub', width:'15%',elCls : 'center'}
            ];

            BUI.use('bui/form',function(Form){


                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                /*form.render();*/
                $("#add_btn").on("click",function(){
                    $.propertyApp.add();
                });
            });
            
            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "bill/check",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{},
                primaryKey: "id", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /***
         * 查询属性类型列表
         */
        queryPropertyTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dicts" ;
            aContent.data = {typeCode:"propertyType"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('typeCode', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询业务类型列表
         */
        queryTradeTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"bill/treadType";
            aContent.data = {typeCode:"treadType"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('tradeType', result.result,'name','name','全部');
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.propertyApp.init();
    });
}(jQuery));