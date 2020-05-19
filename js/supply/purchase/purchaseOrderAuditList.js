/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.purchaseOrderAudit = {
        init: function () {

            var columns = [
                {title: '采购单Id', dataIndex: 'id', visible: false},
                {title: '采购单编号', dataIndex: 'purchaseOrderCode', width: '10%', elCls: 'center',renderer :function(value,obj,record){
                    return '<a href='+'purchaseOrderAudit.html'+"?"+'id='+obj.id+'&status='+obj.status+'>'+value+'</a>';     
                }},
                {
                    title: '采购类型', dataIndex: 'purchaseType', width: '8%', elCls: 'center', renderer: function (value, obj) {
                    if (value == 'purchaseSelling') {
                        return '购销';
                    }
                    if (value == 'agentSelling') {
                        return '代销';
                    }
                    if (value == 'purchaseSellingGift') {
                        return '购销赠品';
                    }
                    if (value == 'agentSellingGift') {
                        return '代销赠品';
                    }
                }
                },
                {title: '归属采购组', dataIndex: 'purchaseGroupName', width: '7.5%', elCls: 'center'},
                {title: '供应商名称', dataIndex: 'supplierName', width: '10%', elCls: 'center'},
                /*{title: '合同编号', dataIndex: 'contractCode', width: '10%', elCls: 'center'},*/
                {title: '收货仓库', dataIndex: 'warehouseName', width: '10%', elCls: 'center'},
                {title: '要求到货日期', dataIndex: 'requriedReceiveDate', width: '10%', elCls: 'center'},
                {title: '截止到货日期', dataIndex: 'endReceiveDate', width: '10%', elCls: 'center'},

                {
                    title: '审核状态', dataIndex: 'status', width: '6%', elCls: 'center', renderer: function (value, obj) {
                    if (value == '1') {
                        return '待审核';
                    }
                    if (value == '2') {
                        return '已审核';
                    }
                    if (value == '3') {
                        return '已审核';
                    }
                }
                },
                {title: '提交人', dataIndex: 'createOperator', width: '10%', elCls: 'center'},
                {title: '提交审核时间', dataIndex: 'submitTime', width: '10%', elCls: 'center'},

            ];

            BUI.use('bui/form', function (Form) {
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                //form.render();
            });

            var props = {
                formRender: "J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender: "sel_btn",//查询触发按钮的id
                resetBtnRender:"reset",//重置触发按钮的id
                render: "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "purchase/purchaseOrderAuditPage?temp=",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort: true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams: {},
                primaryKey: "id", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [
                    {
                        name: "审核", //操作名称
                        relyField : {"fieldName":"status", "fieldValue":"1"},
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "purchaseOrderAudit.html" //页面跳转地址, 当 operateType=1时不能为空
                    }
                ] //操作集合
            };
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/purchaseType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('purchaseType', result.result, 'value', 'name', '全部');
                }
            };
            $.ajax(aContent);
        },

        /***
         * 查询采购单状态下拉选
         */
        purchaseOrderAuditStatus: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/purchaseOrderAuditStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('purchaseOrderAuditStatus', result.result, 'code', 'name', true);
                }
                $("#purchaseOrderAuditStatus").val(1) //待审核
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.purchaseOrderAudit.purchaseOrderAuditStatus();
        $.purchaseOrderAudit.queryPurchaseTypeList();
        $.purchaseOrderAudit.init();
    });
}(jQuery));