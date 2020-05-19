/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.storehouseListApp = {
        init : function(){
            this.queryPurchaseOrderStatusList();
            this.queryWareHouseList();
            this.queryWareHouseNoticeStatus();
            var columns = [
                {title : '调拨单Id',dataIndex :'id', visible : false},
                {title : '调拨单编号',dataIndex :'allocateOrderCode', width:'10%',elCls : 'center',renderer :function(value,obj,record){
                    return '<a href='+'storehouseInfo.html'+"?"+'id='+obj.allocateOrderCode+"&flag=0"+'>'+value+'</a>';
                }},
                {title : '调出仓库',dataIndex :'outWarehouseName', width:'7.5%',elCls : 'center'},
                {title : '调入仓库',dataIndex :'inWarehouseName', width:'7.5%',elCls : 'center'},
                {title : '创建人',dataIndex :'createOperatorName', width:'10%',elCls : 'center'},
                {title : '单据状态',dataIndex :'orderStatus', width:'8%',elCls : 'center',renderer :function(value,obj){
                    // if(value=='0'){return '暂存';}
                    // if(value=='3'){return '提交审核';}
                    // if(value=='2'){return '审核通过';}
                    // if(value=='1'){return '审核驳回';}
                    // if(value=='4'){return '通知仓库';}
                    // if(value=='5'){return '作废';}
                    return '<span>'+$.dictTranslate("allocateOrderStatus", value)+'</span>'
                }},

                // {title : '收货仓库',dataIndex :'warehouseName', width:'10%',elCls : 'center'},
                // {title : '采购总金额(元)',dataIndex :'totalFee', width:'10%',elCls : 'center'},
                // {title : '要求到货日期',dataIndex :'requriedReceiveDate', width:'10%',elCls : 'center'},
                // {title : '截止到货日期',dataIndex :'endReceiveDate', width:'10%',elCls : 'center'},
                // {title : '入库通知',dataIndex :'enterWarehouseNotice', width:'10%',elCls : 'center',visible : false},
                // {title : '总价',dataIndex :'totalFee', width:'10%',elCls : 'center',renderer :function(value,obj){
                //     obj.totalFee=0
                // },visible : false
                // },
                {title : '出入库状态',dataIndex :'inOutStatus', width:'6%',elCls : 'center',renderer :function(value,obj){
                    // if(value=='0'){return '初始';}
                    // if(value=='1'){return '等待出入库';}
                    // if(value=='2'){return '出库完成';}
                    // if(value=='3'){return '出库异常';}
                    // if(value=='4'){return '入库完成';}
                    // if(value=='5'){return '入库异常';}
                    return '<span>'+$.dictTranslate("allocateOrderInOutStatus", value)+'</span>'
                }},
                {title : '创建时间',dataIndex :'createTime', width:'8%',elCls : 'center'},
                {title : '最近更新时间',dataIndex :'updateTime', width:'8%',elCls : 'center'},

            ];

            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                //form.render();
                $("#add_btn").on("click",function(){
                    $.storehouseListApp.add();
                });
            });
            
            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender:"reset",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "allocateOrder/page",//supplier/supplierPage
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{},
                primaryKey: "allocateOrderCode", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [
                    /*暂存的操作*/
                    {
                        name:'编辑',
                        relyField:{"fieldName":"orderStatus","fieldValue":"0"},
                        confirm:"0",
                        operateType: "1",
                        fatherId:"allocateOrderCode",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "storehouseUpdate.html?flag=1" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'删除',
                        msg:'删除后数据将不可恢复。',
                        relyField:{"fieldName":"orderStatus","fieldValue":"0"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/delete", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        //redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*审核通过的操作*/
                    {
                        name:'通知仓库',
                        msg:'确认后将产生调拨出库通知单和调拨入库通知单。',
                        relyField:{"fieldName":"orderStatus","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/noticeWarehouse", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*{
                        name:'虚拟入库',
                        relyField:{"fieldName":"orderStatus","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'POST',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },*/
                    // {
                    //     name:'冻结',
                    //     msg:'确认后采购单将被冻结。',
                    //     relyField:{"fieldName":"orderStatus","fieldValue":"2"},
                    //     confirm:"1",
                    //     operateType: "0",
                    //     submitUrl: $.scmServerUrl+"purchase/purchaseOrder/freeze", //提交后台地址, 当 operateType=0时不能为空
                    //     ajaxMethod : 'PUT',
                    //     fatherId:"allocateOrderCode",
                    // },
                    {
                        name:'作废',
                        msg:'确认后调拨单及其相关单据将一并被作废。',
                        relyField:{"fieldName":"orderStatus","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/setDrop",//提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'作废',
                        msg:'确认后调拨单及其相关单据将一并被作废。',
                        relyField:{"fieldName":"orderStatus","fieldName3":"outOrderStatus","fieldName2":"orderStatus","fieldValue":"2","fieldValue3":"0","fieldValue2":"4"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/drop",//提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'作废',
                        msg:'确认后调拨单及其相关单据将一并被作废。',
                        relyField:{"fieldName":"orderStatus","fieldName3":"outOrderStatus","fieldName2":"orderStatus","fieldValue":"2","fieldValue3":"5","fieldValue2":"4"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/drop",//提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'作废',
                        msg:'确认后调拨单及其相关单据将一并被作废。',
                        relyField:{"fieldName":"orderStatus","fieldName3":"outOrderStatus","fieldName2":"orderStatus","fieldValue":"2","fieldValue3":"2","fieldValue2":"4"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/drop",//提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*审核驳回的操作*/
                    {
                        name:'编辑',
                        relyField:{"fieldName":"orderStatus","fieldValue":"3"},
                        confirm:"0",
                        operateType: "1",
                        fatherId:"allocateOrderCode",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "storehouseUpdate.html?flag=1" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'删除',
                        msg:'删除后数据将不可恢复。',
                        relyField:{"fieldName":"orderStatus","fieldValue":"3"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"allocateOrder/delete", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        fatherId:"allocateOrderCode",
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*冻结具有的操作*/
                    // {
                    //     name:'解冻',
                    //     msg:'确认后采购单将恢复到冻结前的状态。',
                    //     relyField:{"fieldName":"orderStatus","fieldValue":"6"},
                    //     confirm:"1",
                    //     operateType: "0",
                    //     submitUrl: $.scmServerUrl+"purchase/purchaseOrder/freeze", //提交后台地址, 当 operateType=0时不能为空
                    //     ajaxMethod : 'PUT',
                    //     fatherId:"allocateOrderCode",
                    // },
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         *查询采购类型的下拉列表
         */
        queryWareHouseList:function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"allocateOrder/warehouseList";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('outWarehouseCode', result.result, 'code', 'warehouseName', '全部');
                    $.AddItem2('inWarehouseCode', result.result, 'code', 'warehouseName', '全部');
                }
            };
            $.ajax(aContent);
        },
        /**
         * 添加采购单
         */
        add:function(){
            window.location.href = "storehouseAdd.html";
        },
        /***
         * 查询采购单状态下拉选
         */
        queryPurchaseOrderStatusList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/selectByTypeCode/allocateOrderStatus";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('orderStatus', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        queryWareHouseNoticeStatus : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/selectByTypeCode/allocateOrderInOutStatus";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('inOutStatus', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.storehouseListApp.init();
    });
}(jQuery));