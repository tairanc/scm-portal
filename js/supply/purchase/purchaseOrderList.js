/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.purchaseOrderListApp = {
        init : function(){
            this.queryPurchaseOrderStatusList();
            this.queryPurchaseTypeList();
            var columns = [
                {title : '采购单Id',dataIndex :'id', visible : false},
                {title : '采购单编号',dataIndex :'purchaseOrderCode', width:'10%',elCls : 'center',renderer :function(value,obj,record){
                    return '<a href='+'purchaseOrderInfo.html'+"?"+'id='+obj.id+'>'+value+'</a>';
                }},
                {title : '采购类型',dataIndex :'purchaseType', width:'8%',elCls : 'center',renderer :function(value,obj){
                    if(value=='purchaseSelling'){return '购销';}
                    if(value=='agentSelling'){return '代销';}
                    if(value=='purchaseSellingGift'){return '购销赠品';}
                    if(value=='agentSellingGift'){return '代销赠品';}
                }},
                {title : '归属采购组',dataIndex :'purchaseGroupName', width:'7.5%',elCls : 'center'},
                {title : '归属采购人',dataIndex :'purchasePerson', width:'7.5%',elCls : 'center'},
                {title : '供应商名称',dataIndex :'supplierName', width:'10%',elCls : 'center'},
               /* {title : '合同编号',dataIndex :'supplierCode', width:'10%',elCls : 'center'},*/
                {title : '收货仓库',dataIndex :'warehouseName', width:'10%',elCls : 'center'},
                {title : '采购总金额(元)',dataIndex :'totalFee', width:'10%',elCls : 'center'},
                {title : '要求到货日期',dataIndex :'requriedReceiveDate', width:'10%',elCls : 'center'},
                {title : '截止到货日期',dataIndex :'endReceiveDate', width:'10%',elCls : 'center'},
                {title : '入库通知',dataIndex :'enterWarehouseNotice', width:'10%',elCls : 'center',visible : false},
                {title : '总价',dataIndex :'totalFee', width:'10%',elCls : 'center',renderer :function(value,obj){
                    obj.totalFee=0
                },visible : false
                },
                {title : '采购单状态',dataIndex :'status', width:'6%',elCls : 'center',renderer :function(value,obj){
                    if(value=='0'){return '暂存';}
                    if(value=='3'){return '提交审核';}
                    if(value=='2'){return '审核通过';}
                    if(value=='1'){return '审核驳回';}
                    if(value=='4'){return '全部收货';}
                    if(value=='5'){return '收货异常';}
                    if(value=='6'){return '冻结';}
                    if(value=='7'){return '作废';}
                    if(value=='8'){return '入库通知';}
                }},
                {title : '最近更新时间',dataIndex :'updateTime', width:'8%',elCls : 'center'}

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
                    $.purchaseOrderListApp.add();
                });
            });
            
            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                resetBtnRender:"reset",//重置触发按钮的id
                render : "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "purchase/purchaseOrderPage",//supplier/supplierPage
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
                    /*暂存的操作*/
                    {
                        name:'编辑',
                        relyField:{"fieldName":"status","fieldValue":"0"},
                        confirm:"0",
                        operateType: "1",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "purchaseOrderUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'删除',
                        msg:'删除后数据将不可恢复。',
                        relyField:{"fieldName":"status","fieldValue":"0"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/updateState", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        //redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*审核通过的操作*/
                    {
                        name:'入库通知',
                        msg:'确认后将产生入库通知单。',
                        relyField:{"fieldName":"status","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/warahouseAdvice", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*{
                        name:'虚拟入库',
                        relyField:{"fieldName":"status","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'POST',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },*/
                    {
                        name:'冻结',
                        msg:'确认后采购单将被冻结。',
                        relyField:{"fieldName":"status","fieldValue":"2"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/freeze", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'作废',
                        msg:'确认后采购单及其相关单据将一并被作废。',
                        relyField:{"fieldName":"status","fieldName3":"enterWarehouseNotice","fieldName4":"status","fieldValue":"2","fieldValue3":"0","fieldValue4":"7"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/updateState",//提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*审核驳回的操作*/
                    {
                        name:'编辑',
                        relyField:{"fieldName":"status","fieldValue":"1"},
                        confirm:"0",
                        operateType: "1",
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "purchaseOrderUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    {
                        name:'删除',
                        msg:'删除后数据将不可恢复。',
                        relyField:{"fieldName":"status","fieldValue":"1"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/updateState", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                    /*冻结具有的操作*/
                    {
                        name:'解冻',
                        msg:'确认后采购单将恢复到冻结前的状态。',
                        relyField:{"fieldName":"status","fieldValue":"6"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseOrder/freeze", //提交后台地址, 当 operateType=0时不能为空
                        ajaxMethod : 'PUT',
                        // redictUrl: "supplierUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    },
                ] //操作集合
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         *查询采购类型的下拉列表
         */
        queryPurchaseTypeList:function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/purchaseType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('purchaseType', result.result,'value','name','全部');
                }
            };
            $.ajax(aContent);
        },
        /**
         * 添加采购单
         */
        add:function(){
            window.location.href = "purchaseOrderAdd.html";
        },
        /***
         * 查询采购单状态下拉选
         */
        queryPurchaseOrderStatusList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/purchaseOrderStatus";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('purchaseStatus', result.result,'code','name',true);
                }
            };
            $.ajax(aContent);
        }
    };
    $(document).ready(function(e) {
        $.purchaseOrderListApp.init();
    });
}(jQuery));