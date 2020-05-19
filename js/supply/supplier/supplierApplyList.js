/**
 * Created by Administrator on 2016/3/25.
 */
$(function(){
    $.supplierApplyListApp = {
        init : function(){
            $.supplierApplyListApp.querySupplierKindCodeList();
            $.supplierApplyListApp.querySupplierApplyStatusList();
            var columns = [
                {title : '主键',dataIndex :'id', visible : false},
                {dataIndex :'deleteAuth', visible : false},
                {dataIndex :'updateAuth', visible : false},
                {dataIndex :'selectAuth', visible : false},
                {dataIndex :'addAuth', visible : false},
                {title : '申请单编号',dataIndex :'applyCode', width:'13%',elCls : 'center',renderer:function (val,obj) {
                    return '<a href="supplierApplyUpdate.html?btnsFlag=true&'+$.param(obj)+'">'+val+'</a>'
                }},
                {title : '供应商名称',dataIndex :'supplierName', width:'13%',elCls : 'center'},
                {title : '供应商编号',dataIndex :'supplierCode', width:'8%',elCls : 'center'},
                {title : '供应商类型',dataIndex :'supplierKindCode', width:'7%',elCls : 'center',renderer :function(value){
                    return '<span>'+$.dictTranslate("supplierNature", value)+'</span>'}},
                {title : '供应商联系人',dataIndex :'contact', width:'6%',elCls : 'center' },
                {title : '联系人电话',dataIndex :'phone', width:'9%',elCls : 'center'},
                {title : '代理品牌',dataIndex :'brandNames', width:'9%',elCls : 'center'},
                {title : '供应商状态',dataIndex :'supplierStatus', width:'10%',elCls : 'center',renderer :function(value){
                    return '<span>'+$.dictTranslate("isValid", value)+'</span>'}
                },
                {title : '申请状态',dataIndex :'status', width:'10%',elCls : 'center',renderer :function(value,obj){
                    if(value=='3'){
                        return '<span style="color:red;">'+$.dictTranslate("supplierApplyStatus", value)+'</span>';
                    }else{
                        return '<span>'+$.dictTranslate("supplierApplyStatus", value)+'</span>'};
                    }                 
                },
                {title : '最近更新时间',dataIndex :'updateTime', width:'10%',elCls : 'center'}
            ];


                $("#add_btn").on("click",function(){
                    $.supplierApplyListApp.add();
                });

            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender:"reset",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "supplier/supplierApplyPage",
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
                        relyField : {"fieldName":"updateAuth", "fieldValue":"1"},
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "supplierApplyUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "删除", //操作名称
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        relyField : {"fieldName":"deleteAuth", "fieldValue":"1"},
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: $.scmServerUrl+"supplier/supplierApply/state" , //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" ,//页面跳转地址, 当 operateType=1时不能为空
                        ajaxMethod : 'PUT',
                    },
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         * 添加字典
         */
        add:function(){
            window.location.href = "supplierApplyAdd.html";
        },
        /***
         * 查询供应商性质列表
         */
        querySupplierKindCodeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dicts" ;
            aContent.data = {typeCode:"supplierNature"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('supplierKindCode', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询供应商申请审核状态列表
         */
        querySupplierApplyStatusList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dicts" ;
            aContent.data = {typeCode:"supplierApplyStatus"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('applyStatus', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.supplierApplyListApp.init();
    });
}(jQuery));