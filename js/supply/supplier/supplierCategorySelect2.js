/**
 * Created by sone on 2017/4/28.
 */
$(function () {
    $.supplierCategorySelect2 = {
        init: function () {
            BUI.use(['bui/form', 'bui/grid', 'bui/data', 'bui/select', 'bui/list'], function (Form, Grid, Data, Select, List) {

                // 一级资源列表配置
                $.supplierCategorySelect2.gridOne = new Grid.Grid({
                    render: '#gridFirst',
                    width: '100%',
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
                $.supplierCategorySelect2.gridOne.on('itemselected', function (ev) {
                    $.supplierCategorySelect2.gridTwo.get("store").setResult([]);
                    $.supplierCategorySelect2.gridThree.get("store").setResult([]);
                    $.supplierCategorySelect2.querySecondLevelCategory($.supplierCategorySelect2.gridOne.getSelected().id);
                });
                $("#selFirstBtn").on("click", function () {
                    var data = $.supplierCategorySelect2.gridOne.get("store").getResult();
                    var searchData = [];
                    var search = $("#firstName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.supplierCategorySelect2.gridOne.get("store").setResult(searchData);
                        $.supplierCategorySelect2.gridTwo.get("store").setResult([]);
                        $.supplierCategorySelect2.gridThree.get("store").setResult([]);
                    } else {
                        $.supplierCategorySelect2.queryCategory();
                    }
                });

                // 二级资源列表配置
                $.supplierCategorySelect2.gridTwo = new Grid.Grid({
                    render: '#gridSecond',
                    width: '100%',
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
                $.supplierCategorySelect2.gridTwo.on('itemselected', function (ev) {
                    $.supplierCategorySelect2.gridThree.get("store").setResult([]);
                    $.supplierCategorySelect2.queryThirdLevelCategory($.supplierCategorySelect2.gridTwo.getSelected().id);
                });
                $("#selSecondBtn").on("click", function () {
                    var data = $.supplierCategorySelect2.gridTwo.get("store").getResult();
                    var searchData = [];
                    var search = $("#secondName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.supplierCategorySelect2.gridTwo.get("store").setResult(searchData);
                        $.supplierCategorySelect2.gridThree.get("store").setResult([]);
                    } else {
                        $.supplierCategorySelect2.querySecondLevelCategory($.supplierCategorySelect2.gridOne.getSelected().id);
                    }
                });

                // 三级资源列表配置
                $.supplierCategorySelect2.gridThree = new Grid.Grid({
                    render: '#gridThird',
                    width: '100%',
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
                    plugins: [Grid.Plugins.CheckSelection], // 插件形式引入多选表格
                    store: new Data.Store(),
                    innerBorder: false
                }).render();
                $.supplierCategorySelect2.gridThree.on('itemselected', function (ev) {
                    selectThirdLevel(ev.item);
                });
                $.supplierCategorySelect2.gridThree.on('itemunselected', function (ev) {
                    unSelectThirdLevel(ev.item);
                });
                $("#selThirdBtn").on("click", function () {
                    var data = $.supplierCategorySelect2.gridThree.get("store").getResult();
                    var searchData = [];
                    var search = $("#thirdName").val();
                    if (search) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].name.indexOf(search) != -1) {
                                searchData.push(data[i])
                            }
                        }
                        $.supplierCategorySelect2.gridThree.get("store").setResult(searchData);
                    } else {
                        $.supplierCategorySelect2.queryThirdLevelCategory($.supplierCategorySelect2.gridTwo.getSelected().id);
                    }
                });

                function selectThirdLevel(item) {

                    if($.supplierCategorySelect2.checkSelectedCategory(item.id) == true){
                        var newData = $.supplierCategorySelect2.gridThree.get("store").getResult();
                        newData[newData.indexOf(item)].selected = false;
                        $.supplierCategorySelect2.gridThree.get("store").setResult(newData);
                        BUI.Message.Alert("分类已存在!", "warning");
                        return false;
                    }


                    var firstName = $.supplierCategorySelect2.gridOne.getSelected().name;
                    var secondName = $.supplierCategorySelect2.gridTwo.getSelected().name;

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
                        _categorys.push({categoryId: thirdId, categoryCode: thirdCode, categoryName: currentCategory});
                        $("#categorys").val(JSON.stringify(_categorys));

                        if ("" != spanText) {
                            spanText += ",";
                        }
                        spanText += currentCategory;
                        $("#selectCategory").text(spanText);
                    } else {
                        BUI.Message.Alert("分类" + currentCategory + "已选择", 'warning');
                    }
                }

                function unSelectThirdLevel(item) {
                    var firstName = $.supplierCategorySelect2.gridOne.getSelected().name;
                    var secondName = $.supplierCategorySelect2.gridTwo.getSelected().name;

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
                    var currentCategory = firstName + '/' + secondName + '/' + thirdName;
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
         * 检查分类是否已经被选过
         * @param categoryId
         */
        checkSelectedCategory : function (categoryId) {
            var flag = false;
            var categorys = $("#categorys").val();
            if (categorys.length > 0) {
                var _categorys = JSON.parse(categorys);
                for(var i=0; i<_categorys.length; i++){
                    if(_categorys[i]['categoryId'] == categoryId){
                        flag = true;
                        break;
                    }
                }
            }
            if(flag == false){
                var selectCategoryIds = $("#selectCategoryIds").val();
                var _selectCategoryIds = selectCategoryIds.split(",");
                if(_selectCategoryIds.length > 0){
                    for(var i=0; i<_selectCategoryIds.length; i++){
                        if(_selectCategoryIds[i] == categoryId){
                            flag = true;
                            break;
                        }
                    }
                }
            }
            return flag;
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
                    for (var i = 0; i < _result.length; i++) {
                        if (_result[i]['isValid'] == "1") {
                            categorys.push(_result[i]);
                        }
                    }
                    $.supplierCategorySelect2.gridOne.get("store").setResult(categorys);
                    if ($.supplierCategorySelect2.gridOne.getSelected()) {
                        $.supplierCategorySelect2.querySecondLevelCategory($.supplierCategorySelect2.gridOne.getSelected().id);
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
                        if (data[i]['isValid'] == "1") {
                            items.push(data[i]);
                        }
                    }

                    $.supplierCategorySelect2.gridTwo.get("store").setResult(items);
                    if ($.supplierCategorySelect2.gridTwo.getSelected()) {
                        $.supplierCategorySelect2.queryThirdLevelCategory($.supplierCategorySelect2.gridTwo.getSelected().id);
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
                        if (data[i]['isValid'] == "1") {
                            items.push(data[i]);
                            categoryIds.push(data[i].id)
                        }
                    }
                    $.supplierCategorySelect2.gridThree.get("store").setResult(items);
                }
            };
            $.ajax(aContent);
        },
    };
    $(document).ready(function (e) {
        $.supplierCategorySelect2.init();
    });
}(jQuery));