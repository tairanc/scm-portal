/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.storehouseAuditListApp = {
        init: function () {

            var columns = [
                {title: '采购单Id', dataIndex: 'id', visible: false},
                {title: '调拨单编号', dataIndex: 'allocateOrderCode', width: '10%', elCls: 'center',renderer :function(value,obj,record){
                    return '<a href='+'storehouseAudit.html'+"?"+'hidBtn=true&id='+obj.allocateOrderCode+'&status='+obj.auditStatus+'&flag=0>'+value+'</a>';     
                }},
                // {
                //     title: '采购类型', dataIndex: 'purchaseType', width: '8%', elCls: 'center', renderer: function (value, obj) {
                //     if (value == 'purchaseSelling') {
                //         return '购销';
                //     }
                //     if (value == 'agentSelling') {
                //         return '代销';
                //     }
                //     if (value == 'purchaseSellingGift') {
                //         return '购销赠品';
                //     }
                //     if (value == 'agentSellingGift') {
                //         return '代销赠品';
                //     }
                // }
                // },
                {title: '调出仓库', dataIndex: 'outWarehouseName', width: '10%', elCls: 'center'},
                {title: '调入仓库', dataIndex: 'inWarehouseName', width: '10%', elCls: 'center'},
                {title: '提交人', dataIndex: 'submitOperatorName', width: '10%', elCls: 'center'},
                // {title: '要求到货日期', dataIndex: 'requriedReceiveDate', width: '10%', elCls: 'center'},
                // {title: '截止到货日期', dataIndex: 'endReceiveDate', width: '10%', elCls: 'center'},

                {
                    title: '审核状态', dataIndex: 'auditStatus', width: '6%', elCls: 'center', renderer: function (value, obj) {
                    if (value == '1') {
                        return '待审核';
                    }
                    if (value == '2' || value == '3' ) {
                        return '已审核';
                    }
                }
                },
                // {title: '提交人', dataIndex: 'submitOperatorName', width: '10%', elCls: 'center'},
                {title: '提交审核时间', dataIndex: 'submitTime', width: '10%', elCls: 'center'},
                {title: '操作', dataIndex: 'orderStatus', width: 80, elCls: 'center',renderer:function(value,obj){
                    if (value == '1') {
                        return '<a href="storehouseAudit.html?id='+obj.allocateOrderCode+'&status='+obj.auditStatus+'&hidBtn=false&flag=1">审核<a/>';
                    }else{
                        return '--';
                    }
                }},

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
                dataUrl: $.scmServerUrl + "allocateOrder/auditPage?temp=",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort: true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams: {},
                primaryKey: "id"//数据主键Id
                // handlerColumnTitle: '操作',
                // handlerCollections: [
                //     {
                //         name: "审核", //操作名称
                //         relyField : {"fieldName":"orderStatus", "fieldValue":"1"},
                //         operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                //         submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                //         redictUrl: "storehouseAudit.html", //页面跳转地址, 当 operateType=1时不能为空
                //         fatherId : "allocateOrderCode"
                //     }
                // ] //操作集合
            };
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "allocateOrder/warehouseList";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem2('outWarehouseCode', result.result, 'warehouseTypeCode', 'warehouseName', '全部');
                    $.AddItem2('inWarehouseCode', result.result, 'warehouseTypeCode', 'warehouseName', '全部');
                }
            };
            $.ajax(aContent);
        },

        /***
         * 查询采购单状态下拉选
         */
        storehouseAuditStatus: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/purchaseOrderAuditStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('auditStatus', result.result, 'code', 'name', '全部' , "0");
                }
                $("#auditStatus").val(1) //待审核
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.storehouseAuditListApp.storehouseAuditStatus();
        $.storehouseAuditListApp.queryPurchaseTypeList();
        $.storehouseAuditListApp.init();
    });
}(jQuery));