/**
 * Created by sone on 2017/5/2.
 */
$(function(){

    $.wmsroleListApp = {

        init : function(){
            $.wmsroleListApp.queryValidList();
            $.wmsroleListApp.queryRoleTypeList();
            var columns = [ //,renderer :function(){return '<span>'+info+'</span>'}
                {title : '主键',dataIndex :'id',  visible : false},
                {title : '用户中心的用户id',dataIndex :'userId', visible : false},
                {title : '用户名称',dataIndex :'name', width:'15%',elCls : 'center',},
                {title : '手机号',dataIndex :'phone', width:'15%',elCls : 'center'},
                {title : '所属自营仓',dataIndex :'warehouseName', width:'15%',elCls : 'center'},
                {title : '用户权限',dataIndex :'resourceName', width:'15%',elCls : 'center'},
                {title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center', renderer : function(val){
                    return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                }},
                {title : '授权人',dataIndex :'createOperator', width:'10%',elCls : 'center'},
                {title : '更新时间',dataIndex :'updateTime', width:'15%',elCls : 'center'}
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
                    $.wmsroleListApp.add();
                });
            });

            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id

                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "aclWmsUser/aclWmsUserPage",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{},
                //width:"100%",//表格宽度
                //height:"100%",//表格高度
                primaryKey: "id", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [
                    {
                        name: "编辑", //操作名称
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "wmsroleUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                         name: "启用", //操作名称
                        ajaxMethod:"PUT",
                        relyField : {"fieldName":"isValid", "fieldValue":"0"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: $.scmServerUrl+"aclWmsUser/aclWmsUserUpdate/state", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空

                    },
                    {
                        name: "停用", //操作名称
                        ajaxMethod:"PUT",
                        relyField : {"fieldName":"isValid", "fieldValue":"1"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: $.scmServerUrl+"aclWmsUser/aclWmsUserUpdate/state", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: ""  //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "--", //操作名称
                        relyField : {"fieldName":"name", "fieldValue":"采购组员"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                    },
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         * 更改状态
         */
        updateState:function () {

        },
        /**
         * 添加字典类型
         */
        add:function(){
            window.location.href = "wmsroleAdd.html";
        },
        /***
         * 查询角色类型列表
         */
        queryRoleTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"aclWmsUser/aclWmsUserWarehouse";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('warehouseName', result.result,'code','warehouseName','全部');
                }
            };
            $.ajax(aContent);
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
        $.wmsroleListApp.init();
    });
}(jQuery));