/**
 * Created by sone on 2017/4/28.
 */
$(function () {
    $.shopOrderApp = {
        _store: null,
        init: function () {
            var orderStatus = {
                1: "待发货",
                2: "部分发货",
                3: "全部发货",
                4: "已取消"
            };
            this.queryOrderStatus();
            this.querySellChannel();
            this.queryOrderType();
            BUI.use(['bui/form', 'bui/grid', 'bui/data','common/pagingbarext'], function (Form, Grid, Data,PagingBarExt) {
                var columns = [
                    {title: '系统订单号', dataIndex: 'scmShopOrderCode', width: '20%',renderer:function (val) {
                                return '系统订单号：' + val ;
                        }
                    },
                    {
                        title: '销售渠道订单号', dataIndex: 'shopOrderCode', width: '20%', renderer: function (val) {
                            return '销售渠道订单号：<span class="grid-command shopOrderDtl">' + val + '</span>';
                        }
                    },
                    {
                        title: '销售渠道', dataIndex: 'sellName', width: '10%', renderer: function (val) {
                            return '销售渠道：'+val;
                        }
                    },
                  {
                    title: '店铺名称', dataIndex: 'shopName', width: '10%', renderer: function (val) {
                        var _val = val ? val : '无';
                        return '店铺名称：' + _val ;
                    }},
                    /*{
                        title: '订单类型', dataIndex: 'type', width: '10%', renderer: function (val) {
                            return '订单类型：<span>' + $.dictTranslate("orderType", val) + '</span>';
                        }
                    },*/
                    {title: '实付款', dataIndex: 'payment', width: '15%',renderer:function (val) {
                        if(val == null){
                            val = "";
                        }
                        return '实付款：￥' + val ;
                    }},
                    {
                        title: '商品总数量', dataIndex: 'itemNum', width: '10%', renderer: function (val) {
                            return '商品总数量：'+val;
                        }
                    },
                    {title: '付款时间', dataIndex: 'payTime', width: '20%',renderer:function (val) {
                        return '付款时间：' + val ;
                    }},
                    {title: '系统接收时间', dataIndex: 'createTime', width: '20%',renderer:function (val) {
                        return '系统接收时间：' + val ;
                    }},

                    {title: '发货状态', dataIndex: 'supplierOrderStatus', width: '20%',renderer:function (val) {
                        if(val==1){
                            return '发货状态：<span style="color:orange;font-weight:bold;font-size:14px;">待发货</span>';
                        }else if(val==4){
                            return '发货状态：<span style="font-weight:bold;color:green;font-size:14px;">全部发货</span>' ;
                        }else if(val==6){
                            return '发货状态：<span style="font-weight:bold;color:purple;font-size:14px;">部分发货</span>' ;
                        }else if(val==2){
                            return '发货状态：<span style="font-weight:bold;color:red;font-size:14px;">发货异常</span>' ;
                        }
                        else if(val==7){
                            return '发货状态：<span style="color:red;font-weight:bold;font-size:14px;">已取消</span>' ;
                        }else{
                            return '发货状态：<span style="color:red;font-weight:bold;font-size:14px;"></span>' ;
                        }                        
                    }}                    
                    /*{
                        title: '发货状态', dataIndex: 'status', width: '20%', elCls: 'right', renderer: function (val) {
                            return '订单状态：<span>' + $.dictTranslate("supplierOrderStatus", val) + '&nbsp;&nbsp;&nbsp;&nbsp;</span>';
                    }
                    }*/
                ];

                var columns2 = [
                    {
                        title: '商品信息', dataIndex: 'skuCode', elStyle: 'vertical-align: initial;',  width: '30%', elCls: 'center', renderer: function (val, record) {
                        return getItemsTabel(record['orderItemList']);
                    }
                    },
                    {
                        title: '数量', dataIndex: 'skuCode', width: '5%', elCls: 'center', renderer: function (val, record) {
                        return getItemsNum(record['orderItemList']);
                    }
                    },
                    {
                        title: '应付金额', dataIndex: 'fee', width: '10%', elCls: 'center', renderer: function (val, record) {
                        var payment = record['payment'];
                        var postageFee = record['postageFee'];
                        var totalTax = record['totalTax'];
                        if(payment == null){
                            payment = "";
                        }
                        if(postageFee == null){
                            postageFee = "";
                        }
                        if(totalTax == null){
                            totalTax = "";
                        }
                        return '<span>实付款:' + payment + '<br>运费:' + postageFee + '<br>税费:' + totalTax + '</span>';
                    }
                    },
                    {title: '会员用户名', dataIndex: 'userName', width: '10%', elCls: 'center',renderer: function(val){
                      if (!val) {
                          return"_"
                        }
                      }
                    },
                    {title: '收货人', dataIndex: 'receiverName', width: '10%', elCls: 'center'},
                    {title: '收货地址', dataIndex: 'receiverAddress', width: '10%', elCls: 'center'},
                    {title: '收货人手机号', dataIndex: 'receiverMobile', width: '10%', elCls: 'center'},
                    {
                        title: '买家留言', dataIndex: 'buyerMessage', width: '10%', elCls: 'center', renderer: function (val, record) {
                          if (val) {
                            return '<span>' + val + '</span>';
                          } else {
                            return"_"
                          }
                    }
                    },
                    {
                        title: '商家备注', dataIndex: 'shopMemo', width: '10%', elCls: 'center', renderer: function (val, record) {
                          if (val) {
                            return '<span>' + val + '</span>';
                          } else {
                            return"_"
                          }
                    }
                    },
                ];


                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });


                var Grid = Grid,
                    Store = Data.Store;


                // 实例化 Grid.Plugins.Cascade 插件
                var cascade = new Grid.Plugins.Cascade({
                        renderer: function (record) {
                            return '<div class="inner-grid"></div>';	//生成简单表格的容器
                        }
                    }),
                    //简单表格的配置信息
                    simpleGridConfig = {
                        autoRender: true,
                        columns: columns2
                    };


                var store = new Store({
                        url: $.scmServerUrl + "order/shopOrderPage",
                        autoLoad: true,
                        proxy: {
                            method: 'get',
                            dataType: 'json', //返回数据的类型
                            limitParam: 'pageSize', //一页多少条记录
                            pageIndexParam: 'pageNo', //页码
                            startParam: 'start', //起始记录
                            pageStart: 1 //页面从1开始
                        },
                        pageSize: 10,  // 配置分页数目
                        root: 'result',
                        totalProperty: 'totalCount'
                    }),
                    grid = new Grid.Grid({
                        render: '#grid',
                        columns: columns,
                        store: store,
                        width:"100%",
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        // bbar: {
                            // pagingBar:表明包含分页栏
                            // pagingBar: true
                        // },
                        plugins: [cascade]
                    });

                grid.render();

                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store,
                    jumpToPageCallBack:function(){
                        location.href = "#jumpHere";
                    }
                }).render();

                $.shopOrderApp._store = store;


                cascade.on('expand', function (ev) {
                    var data = ev.record,
                        row = ev.row,
                        sgrid = $(row).data('sub-grid');
                    if (!sgrid) {
                        var container = $(row).find('.inner-grid'),
                            gridConfig = BUI.cloneObject(simpleGridConfig);
                        gridConfig.render = container;

                        sgrid = new Grid.SimpleGrid(gridConfig);
                        sgrid.showData(data.records);
                        $(row).data('sub-grid', sgrid);
                    }
                });

                grid.on('cellclick', function (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if (target.hasClass('shopOrderDtl')) {
                        window.location.href = "shopOrderDetail.html?platformOrderCode=" + record['platformOrderCode']+"&shopOrderCode=" + record['shopOrderCode']+"&id="+ record['id'];
                    }
                });

                grid.on('aftershow', function (ev) {
                    cascade.expandAll();
                });


                $("#sel_btn").on("click", function () {
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        //store.load(formData);
                        bar.jumpToPageFix(1,formData);
                    }
                });

                $("#import").on('click', function () {
                    window.open("orderImport.html",'orderImport.html');
                });


                /**
                 * 获取商品表格
                 * @param orderItems
                 * @return {*|jQuery|HTMLElement}
                 */
                function getItemsTabel(orderItems) {
                    var content = "";
                    for (var i = 0; i < orderItems.length; i++) {
                        var items = orderItems[i];
                        var specNatureInfo = "";
                        if (items["specNatureInfo"]) {
                            specNatureInfo = items["specNatureInfo"];
                        }
                        var idx = i + 1;
                        var statusIndex = items["supplierOrderStatus"];
                            var row =
                            '<div class="row-fluid form-horizontal shopInfo" style="min-height: 100px;">' +
                            '<div class="span2 ">' +
                            '<label class="span2">' + idx + '、</label>' +
                            '</div>' +
                            '<div class="span6 control-row1">' +
                            '<img style="width: 100px;" src="' + items["picPath"] + '">' +
                            '</div>' +
                            '<div class="span15" style="text-align: left;margin-left: 15px;">' +
                            'sku编号:' + items["skuCode"] + '<br>' +
                            'sku名称:' + items["itemName"] + '<br>' +
                            '规格:' + specNatureInfo + '<br>' +
                            '金额:￥' + items["price"] + '*' + items["num"] + '<br>' +
                            '发货状态:' + $.dictTranslate("supplierOrderStatus", statusIndex) + '<br>' +
                            '</div>' +
                            '</div>';                      

                        content += row;

                    }


                    return content;
                }


                function getItemsNum(orderItems) {
                    var content = "";
                    for (var i = 0; i < orderItems.length; i++) {
                        var items = orderItems[i];
                        var row =
                            '<div class="row-fluid form-horizontal shopInfo">' +
                            '<br><br><label class="span24">' + items["num"] + '</label><br><br><br>' +
                            '</div>';

                        content += row;

                    }


                    return content;
                }

            });
        },
        /***
         * 查询订单状态
         */
        queryOrderStatus: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/selectByTypeCode/orderStatus";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.AddItem('status', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询订单类型状态
         */
        queryOrderType: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/selectByTypeCode/orderType";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.AddItem('type', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 销售渠道
         */
        querySellChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/ywxSellChannelList";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.AddItem('sellCode', result.result, 'sellCode', 'sellName', true);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.shopOrderApp.init();
    });
}(jQuery));