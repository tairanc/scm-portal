/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.supplierApp = {
        init : function(){
            this.queryValidList();
            this.querySupplierNatureList();
            var columns = [
                {title : '供应商ID',dataIndex :'id', visible : false},
                {title : '供应商编号',dataIndex :'supplierCode', width:'10%',elCls : 'center',renderer:function (val,obj) {
                    var param = $.param(obj)
                    param += "&flag=0";
                    return '<a href="supplierDetail.html?'+param+'">'+val+'</a>'
                }},
                {title : '供应商名称',dataIndex :'supplierName', width:'10%',elCls : 'center',renderer:function (val, obj) {
                    return obj.highLightName?obj.highLightName:val;
                }},
                {title : '供应商性质',dataIndex :'supplierKindCode', width:'5%',elCls : 'center', renderer : function(val){
                    return '<span>'+$.dictTranslate("supplierNature", val)+'</span>';
                }},
                {title : '供应商联系人',dataIndex :'contact', width:'5%',elCls : 'center',renderer:function (val, obj) {
                    return obj.highContact?obj.highContact:val;
                }},
                {title : '联系人电话',dataIndex :'phone', width:'10%',elCls : 'center'},

                {title : '代理品牌',dataIndex :'brandName', width:'10%',elCls : 'center'},
                {title : '供货对象',dataIndex :'channelName', width:'15%',elCls : 'center'},

                {title : '状态',dataIndex :'isValid', width:'4%',elCls : 'center', renderer : function(val){
                    return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                }},
                {title : '最近更新时间',dataIndex :'updateTime', width:'8%',elCls : 'center'}

            ];

                $("#add_btn").on("click",function(){
                    $.supplierApp.add();
                });

            
            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender:"reset_btn",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "supplier/supplierPage",
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
                        redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "启用", //操作名称
                        ajaxMethod:"PUT",
                        relyField : {"fieldName":"isValid", "fieldValue":"0"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: $.scmServerUrl+"supplier/isValid", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name: "停用", //操作名称
                        ajaxMethod:"PUT",
                        relyField : {"fieldName":"isValid", "fieldValue":"1"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                        confirm:"1", //是否弹出确认窗口:0-否,1-是
                        operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: $.scmServerUrl+"supplier/isValid", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                    }
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /***
         * 查询供应商性质
         */
        querySupplierNatureList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/supplierNature";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    $.AddItem('supplierKindCode', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 添加字典
         */
        add:function(){
            window.location.href = "supplierAdd.html";
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
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    $.AddItem('isValid', result.result,'code','name',true);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.supplierApp.init();
    });
}(jQuery));