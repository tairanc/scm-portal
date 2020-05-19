/**
 * Created by Administrator on 2016/3/25.
 */
$(function(w){

    $.supplierApplyAuditListApp = {
        init : function(){
            $.supplierApplyAuditListApp.queryChannelIdList();
            $.supplierApplyAuditListApp.querySupplierApplySelectList();
            var columns = [
                {title : '主键',dataIndex :'id', visible : false},
                {title : '申请单编号',dataIndex :'applyCode', width:'13%',elCls : 'center',renderer:function (val, obj) {
                    return '<a href="supplierApplyAuditDetail.html?id='+obj.id+'">'+val+'</a>'
                }},
                {title : '申请方',dataIndex :'channelName', width:'13%',elCls : 'center'},
                {title : '供应商编号',dataIndex :'supplierCode', width:'8%',elCls : 'center',renderer:function (val, obj) {
                    return '<span class="grid-command add-tab">'+val+'</span>';
                }},
                {title : '供应商名称',dataIndex :'supplierName', width:'5%',elCls : 'center'},
                {title : '供应商性质',dataIndex :'supplierKindCode', width:'6%',elCls : 'center' ,renderer :function(value){
                    return '<span>'+$.dictTranslate("supplierNature", value)+'</span>'
                }},
                {title : '供应商代理品牌',dataIndex :'brandNames', width:'10%',elCls : 'center'},
                {title : '状态',dataIndex :'status', width:'10%',elCls : 'center',renderer :function(value,obj){
                    if(value==1){return '待审批';}
                    if(value==2 || value==3){return '已审批';}
                }},
                {title : '提交审核时间',dataIndex :'createTime', width:'10%',elCls : 'center'}
            ];

            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                $("#add_btn").on("click",function(){
                    $.propertyApp.add();
                });
            });

            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender:"reset",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "supplier/supplierApplyAuditPage",
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
                        name: "审批", //操作名称
                        relyField : {"fieldName":"status", "fieldValue":"1"},
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "supplierApplyAudit.html" //页面跳转地址, 当 operateType=1时不能为空
                    }
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /***
         * 查询审核状态类型列表
         */
        querySupplierApplySelectList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dicts" ;
            aContent.data = {typeCode:"supplierApplySelect"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('status', result.result,'value','name',true);
                    $("#status").val(0)
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询申请方列表
         */
        queryChannelIdList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"system/channels" ;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('channelId', result.result,'id','name',true);
                }
            };
            $.ajax(aContent);
        },
    };
    $(document).ready(function(e) {
        $.supplierApplyAuditListApp.init();
    });
}(jQuery,window));