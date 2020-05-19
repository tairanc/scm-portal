/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){

    $.propertyApp = {
        init : function(){
            $.propertyApp.queryValidList();
            $.propertyApp.queryPropertyTypeList();
            var columns = [
                {title : '主键',dataIndex :'id', visible : false},
                {title : '属性名称',dataIndex :'name', width:'13%',elCls : 'center',renderer:function (val, obj) {
                return obj.highLightName?obj.highLightName:val;
            }},
                {title : '属性类型',dataIndex :'typeCode', width:'13%',elCls : 'center',renderer :function(value){
                    return '<span>'+$.dictTranslate("propertyType", value)+'</span>'
                }},
                {title : '属性值类型',dataIndex :'valueType', width:'8%',elCls : 'center',renderer :function(value){
                    return '<span>'+$.dictTranslate("propertyValueType", value)+'</span>'
                }},
                {title : '排序',dataIndex :'sort', width:'5%',elCls : 'center'},
                {title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center' ,renderer :function(value){
                    return '<span>'+$.dictTranslate("isValid", value)+'</span>'
                }},
                {title : '最近更新人',dataIndex :'lastEditOperator', width:'10%',elCls : 'center'},
                {title : '最近更新时间',dataIndex :'updateTime', width:'15%',elCls : 'center'},
            ];

            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                // form.render();
                $("#add_btn").on("click",function(){
                    $.propertyApp.add();
                });
            });
            
            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender: "reset",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "category/propertyPage",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{},
                primaryKey: "id", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [
                    {
                        name: "编辑", //操作名称
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "propertyUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "启用", //操作名称
                        ajaxMethod:"PUT",
                        msg:"启用后该属性可正常使用。",
                        relyField : {"fieldName":"isValid", "fieldValue":"0"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        submitUrl: $.scmServerUrl + "category/property/state", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "停用", //操作名称
                        ajaxMethod:"PUT",
                        msg:"停用后该属性将不能再使用。",
                        relyField : {"fieldName":"isValid", "fieldValue":"1"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        submitUrl: $.scmServerUrl + "category/property/state", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                    }
                ] //操作集合
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
        /**
         * 添加字典
         */
        add:function(){
            window.location.href = "propertyAdd.html";
        },
        /***
         * 查询启用/停用列表
         */
        queryValidList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/validList";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('isValid', result.result,'code','name',true);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.propertyApp.init();
    });
}(jQuery));