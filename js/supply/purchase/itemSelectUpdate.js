/**
 * Created by sone on 2017/6/21.
 */
(function () {

    $.itemSelectUpdate = {

        supplierCode:null,
        warehouseInfoId:null,
        _store:null,
        init: function () {

            $.itemSelectUpdate.queryWarehouseTypeList();

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var form = new Form.HForm({
                    srcNode : '#sel_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                //form.render();
                var columns = [
                    {title: '商品SKU名称', dataIndex: 'skuName',elCls: 'center'},//spuCode
                    {title: '商品spuCode', dataIndex: 'spuCode',elCls: 'center', visible : false},
                    {title: '商品SKU编码', dataIndex: 'skuCode',elCls: 'center'},
                    {title: '规格', dataIndex: 'specNatureInfo',elCls: 'center'},
                    {title: '货号', dataIndex: 'itemNo',elCls: 'center'},
                    {title: '条形码', dataIndex: 'barCode',elCls: 'center'},
                    {title: '品牌名称', dataIndex: 'brandName',elCls: 'center'},
                    {title: '品牌Id', dataIndex: 'brandId', elCls: 'center', visible : false},
                    {title: '一级分类-二级分类-三级分类',width:200,dataIndex: 'allCategoryName', elCls: 'center'},
                    {title: '所有分类', dataIndex: 'allCategory', elCls: 'center',visible:false},
                    {title: '分类Id', dataIndex: 'categoryId', elCls: 'center', visible : false},
                    {title: '仓库商品信息主键', dataIndex: 'warehouseItemInfoId', elCls: 'center', visible : false},
                    {title: '是否具有保质期', dataIndex: 'isQuality', elCls: 'center', visible : false},
                    {title: '保质期天数', dataIndex: 'qualityDay', elCls: 'center', visible : false}
                ];
                var Grid = Grid,
                    Store = Data.Store;

                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });
                var store = new Store({
                    url : $.scmServerUrl + "purchase/purchaseOrderItem?skus="+$.purchaseOrderUpdateApp.skuArray+"&warehouseInfoId="+$.itemSelectUpdate.warehouseInfoId+'&supplierCode='+$.itemSelectUpdate.supplierCode,
                    autoLoad:true,
                    proxy : {
                        method : 'get',
                        dataType : 'json', //返回数据的类型
                        limitParam : 'pageSize', //一页多少条记录
                        pageIndexParam : 'pageNo', //页码
                        startParam : 'start', //起始记录
                        pageStart : 1 //页面从1开始
                    },
                    pageSize : 10,  // 配置分页数目
                    root:'result',
                    totalProperty:'totalCount',
                    params: {"isValid":"1"}
                }),
                grid = new Grid.Grid({
                    render:'#ItemList',
                    columns : columns,
                    store: store,
                    width:'100%',
                    plugins: [Grid.Plugins.CheckSelection], 
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>'
                });
                grid.render();
                $.itemSelectUpdate._store = store;
                store.on("exception", function (e) {
                    if (e.error.jqXHR.status == 401) {
                        BUI.Message.Alert(result.databuffer || "",function(){
                            var aContent = $.AjaxContent();
                            aContent.type = "POST";
                            aContent.url = $.scmServerUrl + "account/user/logout/";
                            aContent.success = function () {
                                if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                    var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                    window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                } else {
                                    window.location.href = '/supply/login.html';
                                }
                                localStorage.clear();
                            };
                            $.ajax(aContent);
                            this.close();
                        },'error');
                    } else if (e.error.jqXHR.status == 403) {
                        if (window.location.origin.indexOf('tairanmall.com') != -1) {
                            var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                            window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                        } else {
                            window.location.href = '/supply/login.html';
                        }
                    } else if (e.error.jqXHR.status == 404) {
                        window.top.location = "/supply/404.html";
                    } else if (e.error.jqXHR.status == 500) {
                        window.top.location = "/supply/500.html";
                    } else {
                        var result = "";
                        if (e.error.jqXHR.responseText) {
                            result = e.error.jqXHR.responseText;
                            if (!(result instanceof Object)) {
                                try {
                                    result = JSON.parse(result);
                                } catch (e) {
                                }
                            }
                            if (result.appcode == 0) {
                                console.log(result.databuffer)
                                $("#ItemList").after("<div class='centered' style='margin-top:10px;font-size:14px;font-weight:normal;color:red'>"+result.databuffer+"</div>")
                            }
                        }
                    }
                });
                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                });
                $("#reset").on("click",function(){
                    $(".chosen-single span").html('全部品牌');
                    form.clearErrors();
                });
                $("#select_btn_item_update").on("click", function () {
                    selectItemsRecordUpdate(grid.getSelection());
                });
                $("#btn_back_item_update").on("click", function () {
                    $.purchaseOrderUpdateApp.dialog.close();
                });

            });
            

            /*var columns = [
                {title: '商品SKU名称', dataIndex: 'skuName',width:'120px;',elCls: 'center'},//spuCode
                {title: '商品spuCode', dataIndex: 'spuCode', elCls: 'center', visible : false},
                {title: '商品SKU编码', dataIndex: 'skuCode', width:'120px',elCls: 'center'},
                {title: '规格', dataIndex: 'specNatureInfo',width:'120px', elCls: 'center'},
                {title: '货号', dataIndex: 'itemNo',width:'120px', elCls: 'center'},
                {title: '条形码', dataIndex: 'barCode',width:'120px', elCls: 'center'},
                {title: '品牌名称', dataIndex: 'brandName',width:'120px', elCls: 'center'},
                {title: '品牌Id', dataIndex: 'brandId', elCls: 'center', visible : false},
                {title: '一级分类/二级分类/三级分类', width:'200px',dataIndex: 'allCategoryName', elCls: 'center'},
                {title: '所有分类', dataIndex: 'allCategory', elCls: 'center',visible:false},
                {title: '分类Id', dataIndex: 'categoryId', elCls: 'center', visible : false},
                {title: '仓库商品信息主键', dataIndex: 'warehouseItemInfoId', elCls: 'center', visible : false}
            ];
            var props = {
                formRender:"sel_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                render : "ItemList", //渲染grid的div的id                
                dataUrl: $.scmServerUrl + "purchase/purchaseOrderItem?skus="+$.purchaseOrderUpdateApp.skuArray+"&warehouseInfoId="+$.itemSelectUpdate.warehouseInfoId+'&supplierCode='+$.itemSelectUpdate.supplierCode,
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.CheckSelection], //表格插件 BUI.Grid.Plugins.RowNumber
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{"isValid":"1"},
                primaryKey: "id", //数据主键Id
                handlerCollections:{},
                //selectBtn: "#select_btn_brand",
                backBtn: "#btn_back",
                emptyDataTpl:"该供应商所具有的分类或品牌中无可用的商品！"
            } ;
            var myGrid = new GridSelect(props);
            myGrid.createGrid();*/

            /*传值sku，如果有sku 那么单选禁用*/

        },
        /***
         * 查询当前供应商对应的品牌
         */
        queryWarehouseTypeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"purchase/supplierBrand/"+$.itemSelectUpdate.supplierCode;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2('brandName', result.result,'brandName','brandName','全部品牌',[]);
                    $("#brandName").chosen();
                }
            };
            $.ajax(aContent);
        },
    }
})(jQuery);