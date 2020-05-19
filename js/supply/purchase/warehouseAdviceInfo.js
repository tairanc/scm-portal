/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=WarehouseNotice&entityId=" + $.getUrlParam("id"));
    });

    $.warehouseAdviceInfo = {

        /*WAREHOUSE_NOTICE_RECEIVE:'0',//"待通知收货
        ON_WAREHOUSE_TICKLING:'1',//待仓库反馈
        ALL_GOODS:'2',//全部收货
        RECEIVE_GOODS_EXCEPTION:'3',//收货异常
        CANCELLATION:'4',//作废*/

        init: function () {

            var id = $.getUrlParam("id")

            $.warehouseAdviceInfo.fileWarehosueNoticeForm(id); //填充采购单部分

            BUI.use(['bui/grid', 'bui/data', 'bui/overlay'], function (Grid, Data, Overlay) {
                var Grid = Grid, Store = Data.Store;
                    columns = [
                        {title: '商品SKU编号', dataIndex: 'skuCode',width:'120px', elCls: 'center'},
                        {title: 'SKU名称', dataIndex: 'skuName', width: '90px', elCls: 'center'},
                        {title: '规格', dataIndex: 'specInfo', width: '90px', elCls: 'center'},                    
                        {title: '条形码', dataIndex: 'barCode', width: '90px', elCls: 'center'},
                        {title: '批次号', dataIndex: 'batchNo', width: '90px', elCls: 'center'},
                        {title: '生产编码', dataIndex: 'productionCode', width: '90px', elCls: 'center'},
                        {title: '生产日期', dataIndex: 'productionDate', width: '110px', elCls: 'center'},
                        {title: '截止保质日期', dataIndex: 'expiredDate', width: '110px', elCls: 'center'},
                        {title: '理论保质期限(天)', dataIndex: 'expiredDay', width: '110px', elCls: 'center'},
                        {title: '采购总金额(元)', dataIndex: 'purchaseAmount', width: '100px', elCls: 'center'},
                        {title: '采购数量', dataIndex: 'purchasingQuantity', width: '90px', elCls: 'center'},
                        {title: '收货状态', dataIndex: 'status', width: '90px', elCls: 'center',renderer:function(val){
                            if (val == '0') {
                                return '待通知收货';
                            }
                            if (val == '1') {
                                return '<span style="color:red">仓库接收失败</span>';
                            }
                            if (val == '2') {
                                return '仓库接收成功';
                            }
                            if (val == '3') {
                                return '全部入库';
                            }
                            if (val == '4') {
                                return '<span style="color:purple">入库异常</span>';
                            }
                            if (val == '5') {
                                return '部分入库';
                            }
                            if (val == '6') {
                                return '作废';
                            }
                            if (val == '7') {
                                return '已取消';
                            }
                        }},  
                        {title: '实际入库时间', dataIndex: 'storageTime', width: '105px', elCls: 'center'},  
                        {title: '实际入库总量', dataIndex: 'actualStorageQuantity', width: '105px', elCls: 'center'},
                        {title: '正品入库数量', dataIndex: 'normalStorageQuantity', width: '106px', elCls: 'center'},
                        {title: '残品入库数量', dataIndex: 'defectiveStorageQuantity', width: '110px', elCls: 'center'}                  
                    ]

                var colGroup =new Grid.Plugins.ColumnGroup({
                    groups:[{
                        title:'仓库反馈入库信息',
                        from:12,
                        to:15
                    }]
                });
                var store = new Store({
                        url : $.scmServerUrl + "warehouseNotice/warehouseNoticeDetail",
                        proxy : {
                            method : 'get',
                            dataType : 'json' //返回数据的类型
                        },
                        autoLoad:true,                        
                        params:{warehouseNotice: id}
                    }),
                    grid = new Grid.Grid({
                        render: '#storeGrid',
                        width: '100%',//如果表格使用百分比，这个属性一定要设置
                        columns: columns,
                        idField: 'a',
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: store,
                        //forceFit :true,
                        plugins:[colGroup]
                    });

                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                grid.render();
                grid.on("aftershow", function(e) {
                    console.log(1111);
                    //$("#bui-simple-list").css('width','100%');
                    $(".bui-grid-width .bui-grid-body").css('overflow-x','hidden');
                })

                // 操作日志列表--模拟数据
                var logsData = [{a: '创建', b: "张三", c: "2017-03-20 11：39：30", d: "原因：资料不全"},
                    {a: '通知收货', b: "张三", c: "2017-03-20 11：39：30", d: "原因：资料不全"},
                    {
                        a: '收货异常', b: "张三", c: "2017-03-20 11：39：30", d: "商品｛商品SKU编号1｝的实际入库数量-采购数量=x\n" +
                    " 商品｛商品SKU编号2｝的实际入库数量-采购数量=y"
                    },
                    {a: '作废', b: "张三", c: "2017-03-20 11：39：30", d: "采购单被作废，入库通知单自动作废"},];

                // 操作日志列表--store配置
                var logsStore = new Data.Store({
                    data: logsData,
                    autoLoad: true,
                });

                // 操作日志列表--columns配置
                var logsColumns = [
                    {title: '动作', dataIndex: 'a', width: "20%", elCls: 'center', sortable: false},
                    {title: '操作人', dataIndex: 'b', width: "20%", elCls: 'center', sortable: false},
                    {title: '操作时间', dataIndex: 'c', width: "20%", elCls: 'center', sortable: false},
                    {title: '备注', dataIndex: 'd', width: "40%", elCls: 'center', sortable: false}
                ];

                // 操作日志列表--grid配置
                var logsGrid = new Grid.Grid({
                    width: '100%',//如果表格使用百分比，这个属性一定要设置
                    height: 500,
                    columns: logsColumns,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: logsStore
                });

                // 操作日志列表--dialog配置
                var dialog = new Overlay.Dialog({
                    title: '审核日志',
                    width: "50%",
                    height: 600,
                    mask: false,
                    children: [logsGrid],
                    buttons: [
                        {
                            text: '关闭',
                            elCls: 'button button-primary',
                            handler: function () {
                                //do some thing
                                this.close();
                            }
                        }]
                });

                // 操作日志按钮点击事件监听，弹出操作日志列表数据
                $('#btnLogs').on('click', function () {
                    dialog.show();
                });

                //通知收货
                $('#btnSubmit').on('click', function () {
                    var msg = BUI.Message.Show({
                        title: '您确认要通知收货吗？',
                        msg: '确认后将向仓库发送入库通知单。',
                        icon: 'warning',
                        mask: false,
                        buttons: [
                            {
                                text: '确定',
                                elCls: 'button button-primary',
                                handler: function () {
                                    this.close();
                                }
                            },
                            {
                                text: '取消',
                                elCls: 'button button-primary',
                                handler: function () {
                                    this.close();
                                }
                            }

                        ]
                    });
                    msg.show();
                });

                //返回
                $('#btnBack').on('click', function () {
                    window.location.href = "warehouseAdviceList.html";
                    //window.history.go(-1);
                });

            });
        },
        /***
         * 填充表单..根据入库通知单的ID，查询入库通知单的信息
         * @param id zhujianID
         */
        fileWarehosueNoticeForm : function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"warehouseNotice/warehouseNoticeInfo/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert("查询入库通知单失败");
                }else{
                    var result = result.result;
                    $.warehouseAdviceInfo.purchaseOrderCode = result.purchaseOrderCode;
                    $("#warehouseNoticeCode").text(result.warehouseNoticeCode);
                    $("#purchaseOrderCode").text();
                    $("#purchaseOrderCode").html(result.purchaseOrderCode);
                    $("#supplierName").text(result.supplierName);
                    $("#contractCode").text(result.contractCode);
                    $("#purhcaseType").text(result.purhcaseType);
                    $("#purchaseGroupName").text(result.purchaseGroupName);
                    $("#purchasePersonName").text(result.purchasePersonName);
                    $("#warehouseName").text(result.warehouseName);
                    $("#takeGoodsNo").val(result.takeGoodsNo);
                    $("#requriedReceiveDate").text(result.requriedReceiveDate);
                    $("#endReceiveDate").text(result.endReceiveDate);
                    $("#purhcaseType").text(result.purchaseTypeName);
                    $("#receiver").text(result.receiver)
                    $("#receiverNumber").text(result.receiverNumber)
                    $("#sender").text(result.sender)
                    $("#senderNumber").text(result.senderNumber)
                    $("#senderAddress").text(result.senderAddress)
                    $("#senderProvince").text(result.senderProvince)
                    $("#senderCity").text(result.senderCity)
                    $("#remark").text(result.remark)
                    /*$("#id").val(result.id)*/
                    var status = result.status;
                    if(status == '0'){//待通知收货
                        var html = "<button id='receive_btn' type='button' class='button button-primary'>"+'通知收货'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                        $("#buttonSpan").html(html);
                        $("#receive_btn").on("click",function () {
                            $.warehouseAdviceInfo.receiveGoods(result)
                        })
                        $("#status").text("待通知收货")
                    }
                    if(status == '1'){
                        var html = "<button id='receive_btn' type='button' class='button button-primary'>"+'通知收货'+"</button>&nbsp;&nbsp;&nbsp;&nbsp;";
                        $("#buttonSpan").html(html);
                        $("#receive_btn").on("click",function () {
                            $.warehouseAdviceInfo.receiveGoods(result)
                        })
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("仓库接收失败")
                    }
                    if(status == '2'){//全部收货
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("仓库接收成功")
                    }
                    if(status == '3'){//收货异常
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("全部入库")
                    }
                    if(status == '4'){//收货异常
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("入库异常")
                    }
                    if(status == '5'){//收货异常
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("部分入库")
                    }
                    if(status == '6'){//收货异常
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("作废")
                    }
                    if(status == '7'){//作废
                        $("#takeGoodsNo").attr("disabled","disabled");
                        $("#status").text("已取消")
                    }

                }
            };
            $.ajax(aContent);
        },
        receiveGoods:function (record) {

            BUI.Message.Confirm("您确认要通知收货吗？"+'<br><label style="color: #999999;">' + '确认后将向仓库发送入库通知单。' + '</label>',function () {
                record.takeGoodsNo = $("#takeGoodsNo").val();
                $.ajax({
                    type: "PUT",
                    url:  $.scmServerUrl+"warehouseNotice/receiptAdviceInfo/"+record.id,
                    data: record,
                    success: function(result){
                        if(result.appcode == 1){
                            BUI.Message.Alert(result.databuffer,'info');
                            window.location.href = "warehouseAdviceList.html";
                        }else{
                            BUI.Message.Alert(result.databuffer,'warning');
                        }
                    }
                });
            },'question');

        },
    };

    window.openDetail = function () {
        var config = {
            title: "供应商详情",
            href: "purchase/purchaseOrderWarehouseNoticeInfo.html?isClose=true&purchaseOrderCode=" +$.warehouseAdviceInfo.purchaseOrderCode
        };
        window.parent.addTab(config)
    };


    $(document).ready(function (e) {
        $.warehouseAdviceInfo.init();
    });
}(jQuery));