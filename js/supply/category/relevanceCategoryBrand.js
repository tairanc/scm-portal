/**
 * Created by hzszy on 2017/5/19.
 */
$(function () {

    $.categoryBrand = {
        data: null,
        dialog: null,
        grid: null,
        store: null,
        tip: null,
        init: function () {
            var delRecord = [];
            $.categoryBrand.queryThisCategory($.getUrlParam("id"));
            $.categoryBrand.queryCategoryBrand($.getUrlParam("id"));
            BUI.use(['bui/grid', 'bui/data', 'bui/form', 'bui/overlay', 'bui/tooltip'], function (Grid, Data, Form, Overlay, Tooltip) {
                var categoryBrands;
                $.categoryBrand.dialog = new Overlay.Dialog({
                    title: '关联品牌',
                    width: 900,
                    elCls:'dialogTop10',
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'brandSelect.html',
                        autoLoad: false, //不自动加载
                        callback: function (text) {
                        }
                    },
                });
                $.categoryBrand.tip = new Tooltip.Tip({
                    align: {
                        node: '#save_btn'
                    },
                    alignType: 'top-left',
                    offset: 1,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>' +
                    '<div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                }).render();

                //建立表格
                var
                    Store = Data.Store,
                    Grid = Grid,
                    columns = [
                        {title: '品牌名称', dataIndex: 'brandName', elCls: 'center'},
                        {
                            title: '状态', dataIndex: 'isValid', elCls: 'center', renderer: function (value, obj) {
                            if (value == 1) {
                                return '启用';
                            }
                            if (value == 0) {
                                return '停用';
                            }
                        }
                        },
                        {
                            title: '操作', elCls: 'center', renderer: function (val, obj) {
                            var operationStr = "";
                            operationStr += '<span class="grid-command deleteClassify">删除</span>';
                            return operationStr;
                        }
                        }
                    ],
                    data = $.categoryBrand.data;
                $.categoryBrand.store = new Store({
                    data: data,
                    autoLoad: true
                });
                $.categoryBrand.grid = new Grid.Grid({
                    render: '#brandGrid',
                    columns: columns,
                    width: 500,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    forceFit: true,
                    store: $.categoryBrand.store,
                });
                $.categoryBrand.grid.on('cellclick', function (e) {
                    var record = e.record;
                    var domTarget = e.domTarget;
                    // var domTarget = null;
                    switch (domTarget.className) {
                        case "grid-command deleteClassify":
                            console.log(record)
                            $.categoryBrand.store.remove(record);
                            //属性启停用校验

                            delRecord.push(record.brandId);
                            $.categoryBrand.dataPager.init();
                            break;
                    }
                });

                $("#relevance").on("click", function () {


                    $.categoryBrand.dialog.get('loader').load({});
                    $.categoryBrand.dialog.show();
                    $(".centered").remove();
                });
                $("#btn_list").on("click", function () {
                    window.location.href = "categoryList.html"
                });
                $("#save_btn").on("click", function () {
                    var isFlag = false;
                    var brandIds = [];
                    var record = $.categoryBrand.store.getResult();
                    if (record.length > 0) {
                        for (var i = 0; i < record.length; i++) {
                            if (record[i].isValid == "0") {
                                isFlag = true;
                            }

                            brandIds.push(record[i].brandId);
                        }
                        brandIds = brandIds.toString();

                        // if (isFlag) {
                            // $.categoryBrand.tip.set('title', '请先删除已停用的品牌!')
                            // $.categoryBrand.tip.show();
                            // BUI.Message.Alert("请先删除已停用的品牌!",'warning');

                        // } else {
                            $.categoryBrand.saveCategoryBrand(brandIds, delRecord);
                        // }

                    } else {
                        // $.categoryBrand.tip.set('title', '请至少选择一条关联品牌!')
                        // $.categoryBrand.tip.show();
                        BUI.Message.Alert("请至少选择一条关联品牌!",'warning');
                    }
                });

                $.categoryBrand.grid.render();
            });
        },
        //查询关联
        queryCategoryBrand: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/categoryBrands";
            aContent.data = {"categoryId": id};
            aContent.async = false;
            aContent.success = function (result, textStatus) {

                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.categoryBrand.data = result.result;
                    setTimeout(function(){
                        $.categoryBrand.dataPager=$("#brandGrid .bui-grid-bbar").scmPager({target:"#brandGrid .bui-grid-table>tbody>.bui-grid-row"}) ;
                    },500);
                }
            };
            $.ajax(aContent);
        },

        //保存关联
        saveCategoryBrand: function (brandIds, delRecord) {
            var id = $.getUrlParam("id");
            var aContent = $.AjaxContent();
            aContent.type = "POST";
            aContent.url = $.scmServerUrl + "category/link/" + id;
            aContent.data = {"brandIds": brandIds, "delRecord": delRecord.toString()};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');

                } else {
                    window.location.href = "categoryList.html"
                }
            }
            $.ajax(aContent);

        },

        queryBrandState: function () {
            var aContent = $.AjaxContent();
        },
        queryThisCategory: function (id) {

            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/query/" + id;
            aContent.data = {"id": id};
            aContent.success = function (result, textStatus) {

                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    var data = result.result;
                    // $("#nowCategory").val(data);
                    $("#nowCategory").html(data);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.categoryBrand.init();
    });
}(jQuery));