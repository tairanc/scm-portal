/**
 * Created by hzszy on 2017/5/19.
 */
$(function () {

    $.categoryProperty = {
        data: null,
        dialog: null,
        grid: null,
        store: null,
        tableData: null,
        table: null,
        propertyAll: null,
        tip: null,
        init: function () {
            // this.queryAllProperty();
            $.categoryProperty.queryThisCategory($.getUrlParam("id"));
            BUI.use(['bui/grid', 'bui/data', 'bui/form', 'bui/overlay', 'bui/tooltip'], function (Grid, Data, Form, Overlay, Tooltip) {

                $.categoryProperty.dialog = new Overlay.Dialog({
                    title: '关联属性',
                    width: 625,
                    height: 500,
                    mask: false,
                    buttons: [],
                    loader: {
                        url: 'propertyView.html',
                        autoLoad: false, //不自动加载
                        callback: function (text) {
                        }
                    },
                });
                $.categoryProperty.dialog.render();


                $.categoryProperty.tip = new Tooltip.Tip({
                    align: {
                        node: '#save_btn'
                    },
                    alignType: 'top-left',
                    offset: 10,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\<div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });

                var columns = [
                    {title: '属性名称', dataIndex: 'name', width: '25%', visible: true ,elCls: 'center'},

                    {title: '状态', dataIndex: 'isValid', width: '25%', visible: true ,elCls: 'center',
                        renderer :function(value,obj){
                            return  '<span>'+$.dictTranslate("isValid", value)+'</span>';}},
                    {title: '属性类型' ,elCls: 'center', dataIndex: 'typeCode', width: '25%', visible: true,renderer :function(value,obj){
                        return  '<span>'+$.dictTranslate("propertyType", value)+'</span>';}},
                    {title: 'valueType', dataIndex: 'valueType', width: '10%', visible: false},
                    {title: 'propertyId', dataIndex: 'propertyId', width: '10%', visible: false},
                    {title: 'id', dataIndex: 'id', width: '10%', visible: false},
                    {hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: true,width:'25%'}
                ];
                var props = {
                    tableId: "table1",
                    render: "propertyGrid",
                    columns: columns,
                    showLineNum: true,
                    sortField: 'sort',
                    url: $.scmServerUrl + "category/categoryProperty/" + $.getUrlParam("id"),
                    autoLoad: true,
                    up: true,
                    down: true,
                    del: true
                };
                // $.categoryProperty.table = new DynamicTable(props);

                $.categoryProperty.table = new DynamicGrid(columns);
                var dataConfig = {
                    gridId: "propertyGrid",
                    sortName: "propertySort",
                    dataUrl:$.scmServerUrl + "category/categoryProperty/" + $.getUrlParam("id"),
                    onDelRow:function(){$.categoryProperty.propertyGridPager.init()},
                    onMoved:function(){$.categoryProperty.propertyGridPager.init()}
                    // uploadUrl: $.scmServerUrl + 'qinniu/upload/property',
                    // uploadMax:1,
                    // uploadId:""
                    // sortName:""
                };
                $.categoryProperty.table.initDataAjax({},dataConfig,function(){
                    setTimeout(function(){
                            $.categoryProperty.propertyGridPager=$("#propertyGrid .bui-grid-bbar").scmPager({target:"#propertyGrid .bui-grid-table>tbody>.bui-grid-row"}) 
                    },500);
                });


                $("#relevance").on("click", function () {

                    $.categoryProperty.dialog.get('loader').load({});
                    $.categoryProperty.dialog.show();
                });
                $("#btn_list").on("click", function () {
                    window.location.href = "categoryList.html"
                });
                $("#save_btn").on("click", function () {

                    var isFlag = false;
                    var tableData = $.categoryProperty.table.getData();
                    for (var i = 0; i < tableData.length; i++) {
                        if (tableData[i].isValid == "0"&&tableData[i].status!="3") {
                            isFlag = true;
                        }
                    }
                    // if (isFlag) {
                    //     $.categoryProperty.showTip('#save_btn', '请先删除已停用的属性!');
                    // } else {
                        $.categoryProperty.saveCategoryProperty(JSON.stringify(tableData));
                    // }


                });

            });


        },
        /**
         * tip窗口
         */
        showTip: function (btn, message) {
            BUI.use(['bui/tooltip'], function (Tooltip) {
                var tip = new Tooltip.Tip({
                    align: {
                        node: btn
                    },
                    alignType: 'top-left',
                    offset: 10,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\<div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });
                // tip.set('title', message)
                // tip.show();
                BUI.Message.Alert(message,'warning');
            });
        },
        /**
         * 保存修改
         */
        saveCategoryProperty: function (jsonDate) {
            var id = $.getUrlParam("id");
            var aContent = $.AjaxContent();
            aContent.type = "PUT";
            aContent.url = $.scmServerUrl + "category/updateProperty/" + id;
            aContent.data = {"jsonDate": jsonDate};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    window.location.href = "categoryList.html"
                    // location.reload();
                }
            }
            $.ajax(aContent);

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
                    $("#nowCategory").html(data);
                }
            };
            $.ajax(aContent);
        },

        /**
         * 查询所有属性
         */
        queryAllProperty: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/propertyall";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.categoryProperty.propertyAll = result.result;
                }
            }
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.categoryProperty.init();
    });
}(jQuery));