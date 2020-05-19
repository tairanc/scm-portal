/**
 * Created by sone on 2017/4/28.
 */
$(function () {
    $.goodsCategorySelectApp = {
        init: function () {
            BUI.use(['bui/form', 'bui/grid', 'bui/data', 'bui/select', 'bui/list'], function (Form, Grid, Data, Select, List) {

                // 一级资源列表配置
                $.goodsCategorySelectApp.gridOne = new Grid.Grid({
                    render: '#gridFirst',
                    height: '200',
                    columns: [{
                        title: "一级类目",
                        dataIndex: 'name',
                        width: '100%',
                        sortable: false,
                        elCls: 'center'
                    }],
                    store: new Data.Store(),
                    innerBorder: false
                }).render();
                $.goodsCategorySelectApp.gridOne.on('itemselected', function (ev) {
                    $.goodsCategorySelectApp.gridTwo.get("store").setResult([]);
                    $.goodsCategorySelectApp.gridThree.get("store").setResult([]);
                    $.goodsCategorySelectApp.querySecondLevelCategory($.goodsCategorySelectApp.gridOne.getSelected().id);
                });
                $("#selFirstBtn").on("click", function () {
                    var data = $.goodsCategorySelectApp.gridOne.get("store").getResult();
                    var searchData = [];
                    var search = $("#firstName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.goodsCategorySelectApp.gridOne.get("store").setResult(searchData);
                        $.goodsCategorySelectApp.gridTwo.get("store").setResult([]);
                        $.goodsCategorySelectApp.gridThree.get("store").setResult([]);
                    } else {
                        $.goodsCategorySelectApp.queryCategory();
                    }
                });
                function selectFirstLevel(item) {
                    var firstName = item.name;
                    var firstId = item.id;
                    var firstCode = item.categoryCode;
                    //将选择的分类值付给<span>和隐藏域
                    var categorys = $("#categorys").val();
                    var _categorys = [];
                    if ("" != categorys) {
                        _categorys = JSON.parse(categorys);
                    }
                    var spanText = $("#selectCategory").text();
                    var currentCategory = firstName;
                    if (hasCategoryId(firstId, _categorys) == false) {
                        _categorys = [];
                        _categorys.push({categoryId: firstId, categoryCode: firstCode, categoryName: currentCategory});
                        $("#categorys").val(JSON.stringify(_categorys));

                        if ("" != spanText) {
                            spanText += ",";
                        }
                        spanText = "";
                        spanText += currentCategory;
                        $("#selectCategory").text(spanText);
                    } else {
                        BUI.Message.Alert("分类" + currentCategory + "已选择", 'warning');
                    }
                }

                // 二级资源列表配置
                $.goodsCategorySelectApp.gridTwo = new Grid.Grid({
                    render: '#gridSecond',
                    height: '200',
                    columns: [{
                        title: '二级类目',
                        dataIndex: 'name',
                        width: '100%',
                        sortable: false,
                        elCls: 'center'
                    }],
                    store: new Data.Store(),
                    innerBorder: false
                }).render();
                $.goodsCategorySelectApp.gridTwo.on('itemselected', function (ev) {
                    $.goodsCategorySelectApp.gridThree.get("store").setResult([]);
                    $.goodsCategorySelectApp.queryThirdLevelCategory($.goodsCategorySelectApp.gridTwo.getSelected().id);
                });
                $("#selSecondBtn").on("click", function () {
                    var data = $.goodsCategorySelectApp.gridTwo.get("store").getResult();
                    var searchData = [];
                    var search = $("#secondName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.goodsCategorySelectApp.gridTwo.get("store").setResult(searchData);
                        $.goodsCategorySelectApp.gridThree.get("store").setResult([]);
                    } else {
                        $.goodsCategorySelectApp.querySecondLevelCategory($.goodsCategorySelectApp.gridOne.getSelected().id);
                    }
                });
                function selectSecLevel(item) {
                    var firstName = $.goodsCategorySelectApp.gridOne.getSelected().name;
                    var secondName = item.name;

                    var secondId = item.id;
                    var secondCode = item.categoryCode;
                    var secondName = item.name;
                    //将选择的分类值付给<span>和隐藏域
                    var categorys = $("#categorys").val();
                    var _categorys = [];
                    if ("" != categorys) {
                        _categorys = JSON.parse(categorys);
                    }
                    var spanText = $("#selectCategory").text();
                    var currentCategory = firstName + '-' + secondName;
                    if (hasCategoryId(secondId, _categorys) == false) {
                        _categorys = [];
                        _categorys.push({categoryId: secondId, categoryCode: secondCode, categoryName: currentCategory});
                        $("#categorys").val(JSON.stringify(_categorys));

                        if ("" != spanText) {
                            spanText += ",";
                        }
                        spanText = "";
                        spanText += currentCategory;
                        $("#selectCategory").text(spanText);
                    } else {
                        BUI.Message.Alert("分类" + currentCategory + "已选择", 'warning');
                    }
                }

                // 三级资源列表配置
                $.goodsCategorySelectApp.gridThree = new Grid.Grid({
                    render: '#gridThird',
                    height: '200',
                    columns: [{
                        title: '三级类目',
                        dataIndex: 'name',
                        width: '100%',
                        sortable: false,
                        elCls: 'center'
                    }],
                    itemStatusFields: { //设置数据跟状态的对应关系
                        selected: 'selected'
                    },
                    plugins: [Grid.Plugins.RadioSelection], // 插件形式引入多选表格
                    store: new Data.Store(),
                    innerBorder: false
                }).render();
                $.goodsCategorySelectApp.gridOne.on('itemselected', function (ev) {
                    selectFirstLevel(ev.item);
                });
                $.goodsCategorySelectApp.gridTwo.on('itemselected', function (ev) {
                    selectSecLevel(ev.item);
                });
                $.goodsCategorySelectApp.gridThree.on('itemselected', function (ev) {
                    selectThirdLevel(ev.item);
                });
                $.goodsCategorySelectApp.gridThree.on('itemunselected', function (ev) {
                    unSelectThirdLevel(ev.item);
                });
                $("#selThirdBtn").on("click", function () {
                    var data = $.goodsCategorySelectApp.gridThree.get("store").getResult();
                    var searchData = [];
                    var search = $("#thirdName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.goodsCategorySelectApp.gridThree.get("store").setResult(searchData);
                    } else {
                        $.goodsCategorySelectApp.queryThirdLevelCategory($.goodsCategorySelectApp.gridTwo.getSelected().id);
                    }
                });

                function selectThirdLevel(item) {
                    var firstName = $.goodsCategorySelectApp.gridOne.getSelected().name;
                    var secondName = $.goodsCategorySelectApp.gridTwo.getSelected().name;

                    var thirdId = item.id;
                    var thirdCode = item.categoryCode;
                    var thirdName = item.name;
                    //将选择的分类值付给<span>和隐藏域
                    var categorys = $("#categorys").val();
                    var _categorys = [];
                    if ("" != categorys) {
                        _categorys = JSON.parse(categorys);
                    }
                    var spanText = $("#selectCategory").text();
                    var currentCategory = firstName + '-' + secondName + '-' + thirdName;
                    if (hasCategoryId(thirdId, _categorys) == false) {
                        _categorys = [];
                        _categorys.push({categoryId: thirdId, categoryCode: thirdCode, categoryName: currentCategory});
                        $("#categorys").val(JSON.stringify(_categorys));

                        if ("" != spanText) {
                            spanText += ",";
                        }
                        spanText = "";
                        spanText += currentCategory;
                        $("#selectCategory").text(spanText);
                    } else {
                        BUI.Message.Alert("分类" + currentCategory + "已选择", 'warning');
                    }
                }

                function unSelectThirdLevel(item) {
                    var firstName = $.goodsCategorySelectApp.gridOne.getSelected().name;
                    var secondName = $.goodsCategorySelectApp.gridTwo.getSelected().name;

                    var thirdId = item.id;
                    var thirdCode = item.categoryCode;
                    var thirdName = item.name;
                    //将选择的分类值付给<span>和隐藏域
                    var categorys = $("#categorys").val();
                    var _categorys = [];
                    if ("" != categorys) {
                        _categorys = JSON.parse(categorys);
                    }
                    for (var i = 0; i < _categorys.length; i++) {
                        if (_categorys[i].categoryId == thirdId) {
                            _categorys.splice(i, 1);
                        }
                    }
                    $("#categorys").val(JSON.stringify(_categorys));
                    var spanText = $("#selectCategory").text();
                    var currentCategory = firstName + '-' + secondName + '-' + thirdName;
                    var _len = spanText.length;
                    var _str = "," + currentCategory;
                    spanText = spanText.replace(_str, "");
                    if (_len == spanText.length) {
                        var _str2 = currentCategory + ",";
                        spanText = spanText.replace(_str2, "");
                    }
                    if (_len == spanText.length) {
                        spanText = spanText.replace(currentCategory, "");
                    }
                    $("#selectCategory").text(spanText);
                }

                /**
                 * 判断列表里面是否包含分类ID
                 * @param categoryId 分类ID
                 * @param categorys 分类记录列表
                 */
                function hasCategoryId(categoryId, categorys) {
                    for (var i = 0; i < categorys.length; i++) {
                        if (categoryId == categorys[i]['categoryId']) {
                            return true;
                        }
                    }
                    return false;
                }

            });

            this.queryCategory();

        },
        /**
         * 分类查询
         * @param parentId 父节点ID
         * @param selectId 选择框ID
         * @param initText 初始化显示名称
         */
        queryCategory: function (parentId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/tree";
            aContent.data = {parentId: parentId, isRecursive: false};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var categorys = [];
                    var _result = result.result;
                    //var showAll=$.getUrlParam("showAll");
                    for (var i = 0; i < _result.length; i++) {
                        if (window.showCategoryAll||_result[i]['isValid'] == "1") {
                            categorys.push(_result[i]);
                        }
                    }
                    $.goodsCategorySelectApp.gridOne.get("store").setResult(categorys);
                    if ($.goodsCategorySelectApp.gridOne.getSelected()) {
                        $.goodsCategorySelectApp.querySecondLevelCategory($.goodsCategorySelectApp.gridOne.getSelected().id);
                    }


                }
            };
            $.ajax(aContent);
        },
        /**
         * 分类查询
         * @param parentId 父节点ID
         * @param selectId 选择框ID
         * @param initText 初始化显示名称
         */
        querySecondLevelCategory: function (parentId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/tree";
            aContent.data = {parentId: parentId, isRecursive: false};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var data = result.result;
                    var items = [];
                    for (var i = 0; i < data.length; i++) {
                        if (window.showCategoryAll||data[i]['isValid'] == "1") {
                            items.push(data[i]);
                        }
                    }

                    $.goodsCategorySelectApp.gridTwo.get("store").setResult(items);
                    if ($.goodsCategorySelectApp.gridTwo.getSelected()) {
                        $.goodsCategorySelectApp.queryThirdLevelCategory($.goodsCategorySelectApp.gridTwo.getSelected().id);
                    }


                }
            };
            $.ajax(aContent);
        },
        /**
         * 分类查询
         * @param parentId 父节点ID
         * @param selectId 选择框ID
         * @param initText 初始化显示名称
         */
        queryThirdLevelCategory: function (parentId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/tree";
            aContent.data = {parentId: parentId, isRecursive: false};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var data = result.result;
                    var items = [];
                    var categoryIds = [];
                    for (var i = 0; i < data.length; i++) {
                        if (window.showCategoryAll||data[i]['isValid'] == "1") {
                            items.push(data[i]);
                            categoryIds.push(data[i].id)
                        }
                    }
                    $.goodsCategorySelectApp.gridThree.get("store").setResult(items);

                    if (items.length > 0) {
                        var categorys = $("#categorys").val();
                        if (categorys.length > 0) {
                            var _categorys = JSON.parse(categorys);
                            var selectItems = $.goodsCategorySelectApp.getSelectItems(_categorys, items, categoryIds);
                            $.goodsCategorySelectApp.gridThree.get("store").setResult(selectItems);
                        }
                    }

                }
            };
            $.ajax(aContent);
        },
        /**
         * 获取已经选中的分类
         * @param categorys
         * @return {Array}
         */
        getSelectItems: function (categorys, items, categoryIds) {
            for (var j = 0; j < categorys.length; j++) {
                if (categoryIds.indexOf(categorys[j].categoryId) != -1) {
                    items[categoryIds.indexOf(categorys[j].categoryId)].selected = true;
                    $.goodsCategorySelectApp.gridThree.selectIndex = categoryIds.indexOf(categorys[j].categoryId);
                }
            }
            return items;
        }
    };
    $(document).ready(function (e) {
        $.goodsCategorySelectApp.init();
    });
}(jQuery));