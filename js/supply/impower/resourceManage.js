/**
 * Created by hzszy on 2017/6/14.
 */
$(function () {
    $.resourceManage = {
        data: null,
        tree: null,
        dialog: null,
        form: null,
        tip: null,
        str: null,
        level: null,
        editFlag: null,
        init: function () {
            $.resourceManage.queryTreeNode();

            BUI.use(['bui/form', 'bui/tooltip', 'bui/overlay', 'bui/extensions/treegrid', 'bui/data', 'bui/Grid'], function (Form, Tooltip, Overlay, TreeGrid, Data, Grid) {
                var store = new Data.TreeStore({
                    autoLoad: true,
                    data: $.resourceManage.data,
                });
                //提示窗

                $.resourceManage.tip = new Tooltip.Tip({
                    align: {
                        node: '#add_btn'
                    },
                    alignType: 'top-left',
                    offset: 10,
                    triggerEvent: 'click',
                    autoHideType: 'click',
                    title: '',
                    elCls: 'tips tips-warning',
                    titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });
                //验证表单
                $.resourceManage.form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                //页面弹出层
                $.resourceManage.dialog = new Overlay.Dialog({
                    title: "",
                    width: 500,
                    height: 350,
                    mask: true,
                    contentId: 'add_content',

                    buttons: [
                        {
                            text: '保存',
                            elCls: 'button button-primary',
                            handler: function () {
                                $.resourceManage.dealData($.resourceManage.str, $.resourceManage.level);
                                // var formData = $.resourceManage.form.serializeToObject();
                                // console.log(formData);
                            }
                        }, {
                            text: '关闭',
                            elCls: 'button button-primary',
                            handler: function () {
                                $.resourceManage.form.clearFields();
                                $.resourceManage.level = null;
                                this.close();
                            }
                        }
                    ],

                });
                $.resourceManage.tree = new TreeGrid({
                    render: '#t1',
                    store: store,
                    innerBorder: true, // 默认为true
                    columns: [
                        {title: '资源名称', sortable: false, dataIndex: 'name', width: "70%", elCls: 'left'},
                        {title: '资源编号', sortable: false, dataIndex: 'code', width: "40%", elCls: 'center'},
                        {title: '方法', sortable: false, dataIndex: 'method', width: "40%", elCls: 'center'},
                        {title: 'Url', dataIndex: 'url', width: "7%", elCls: 'center', visible: false},
                        {title: 'Url', dataIndex: 'parentId', width: "7%", elCls: 'center', visible: false},
                        {title: 'Url', dataIndex: 'id', width: "7%", elCls: 'center', visible: false},
                        {title: '创建人', sortable: false, dataIndex: 'createOperator', width: "40%", elCls: 'center'},
                        {
                            title: '属于角色', sortable: false, dataIndex: 'belong', width: "40%", elCls: 'center'
                            ,
                            renderer: function (value, obj) {
                                if (value == 1) {
                                    return '全局角色';
                                }
                                if (value == 2) {
                                    return '渠道角色';
                                }
                            }
                        },

                        {
                            title: '操作',
                            dataIndex: 'code',
                            sortable: false,
                            width: '100%',
                            elCls: 'center',
                            renderer: function (val, obj) {
                                var operationStr = "";
                                if ((val.toString()).length == 3) {
                                    //一级目录下按钮
                                    operationStr += '<span class="grid-command addSecondClassify">新增二级资源</span>';
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    // operationStr += '<span class="grid-command isValid2"></span>';

                                }
                                else if ((val.toString()).length == 5) {
                                    //二级目录下按钮
                                    operationStr += '<span class="grid-command addThirdClassify">新增三级资源</span>';
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    // operationStr += '<span class="grid-command isValid2"></span>';

                                }
                                else {
                                    //三级目录下按钮
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    // operationStr += '<span class="grid-command isValid2"></span>';
                                }
                                return operationStr;
                            }
                        }
                    ],
                    // plugins: [editing],
                });
                $.resourceManage.tree.render();

                //操作的点击事件
                $.resourceManage.tree.on('cellclick', function (e) {
                    var record = e.record;
                    var domTarget = e.domTarget;
                    // var domTarget = null;
                    switch (domTarget.className) {
                        case "grid-command isValid1":
                            //修改状态 启用
                            // $.classify.changClassify(record);
                            break;
                        case  "grid-command isValid2":
                            var childrenRecord = record.children;
                            //修改状态 停用
                            //校验下级是否有未停用的分类
                            if (childrenRecord != null && childrenRecord.length > 0) {
                                for (var i = 0; i < childrenRecord.length; i++) {
                                    if (childrenRecord[i].isValid == 1) {
                                        BUI.Message.Alert('停用失败,请确认所有下级分类都已停用', function () {
                                            // $.classify.changeState(record)
                                        }, 'warning');
                                        break;
                                    } else {
                                        // $.classify.changClassify(record);
                                        break;
                                    }
                                }
                            } else {
                                // $.classify.changClassify(record);
                            }
                            break;
                        case "grid-command addSecondClassify":
                            $.resourceManage.addResourceManage("新增二级资源", record, 2);
                            break;
                        case  "grid-command addThirdClassify":
                            $.resourceManage.addResourceManage("新增三级资源", record, 3);
                            break;
                        case  "grid-command editClassify":
                            $.resourceManage.editResourceManage("编辑", record);
                            break;
                    }
                });

                //收起按钮
                $("#close_btn").on("click", function () {
                    BUI.use(['bui/extensions/treegrid'], function (TreeGrid) {
                        $.resourceManage.tree.collapseAll();
                    });
                });
                //新增一级按钮
                $("#add_btn").on("click", function () {
                    $.resourceManage.addResourceManage("新增一级资源", "", 1);
                });

                //展开按钮
                $("#expand_btn").on("click", function () {
                    BUI.use(['bui/extensions/treegrid'], function (TreeGrid) {
                        $.resourceManage.tree.expandAll();
                    });
                });

            });
        },
        /**
         * 查询树
         */
        queryTreeNode: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/jurisdictionTree";
            aContent.data = {"parentId": "", "isRecursive": true};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.resourceManage.data = result.result;
                    return result.result;
                }
            };
            $.ajax(aContent);
        },

        //新增时的内容回写
        addResourceManage: function (resourceLevel, record, level) {
            $.resourceManage.editFlag = false;
            $("#name").val("");
            $("#method").val("");
            $("#alise").val(record.name);

            if (level != 3) {
                $("#url").val("1");
                $("#url").attr("disabled", true);
                $("#operationTypeDiv").hide();
            }
            else {
                $("#url").val("");
                $("#url").attr("disabled", false);
                $("#operationTypeDiv").show();
            }

            if (record.belong == 1 && level != 1) {
                $("#belong").attr("checked", "checked");
            }
            if (record.belong == 2 && level != 1) {
                $("#belong2").attr("checked", "checked");
            }
            if (level != 1) {
                $("#operationType1").attr("checked", "checked");
            }
            if (level != 1) {
                $("#belong").attr("disabled", true);
                $("#belong2").attr("disabled", true);
            } else {
                $("#belong").attr("disabled", false);
                $("#belong2").attr("disabled", false);
            }
            if (level==3){
                $("#operationType1").attr("disabled", false);
                $("#operationType2").attr("disabled", false);
                $("#operationType3").attr("disabled", false);
                $("#operationType4").attr("disabled", false);
            }
            $.resourceManage.dialog.set("title", resourceLevel);
            $.resourceManage.str = record;
            $.resourceManage.level = level;
            $.resourceManage.dialog.render();
            $.resourceManage.dialog.show();
        },
        //编辑时的内容回写
        editResourceManage: function (editClassify, record) {
            $.resourceManage.editFlag = true;
            $("#name").val(record.name);
            $("#method").val(record.method);
            $("#url").val(record.url);
            $("#alise").val(record.parent.name);
            $.resourceManage.editId = record.id;
            if (record.level != 3) {
                $("#url").attr("disabled", true);
            }
            else {
                $("#url").attr("disabled", false);
            }

            if (record.belong == 1) {
                $("#belong").attr("checked", "checked");
            }
            if (record.belong == 2) {
                $("#belong2").attr("checked", "checked");
            }

            if (record.method == "GET") {
                $("#operationType1").attr("checked", "checked");
            }
            if (record.method == "POST") {
                $("#operationType2").attr("checked", "checked");
            }
            if (record.method == "PUT") {
                $("#operationType3").attr("checked", "checked");
            }
            if (record.method == "DELETE") {
                $("#operationType4").attr("checked", "checked");
            }

            if (record.method == 1) {
                $("#operationTypeDiv").hide();
            }
            else {
                $("#operationTypeDiv").show();
            }
            $("#belong").attr("disabled", true);
            $("#belong2").attr("disabled", true);

            $("#operationType1").attr("disabled", true);
            $("#operationType2").attr("disabled", true);
            $("#operationType3").attr("disabled", true);
            $("#operationType4").attr("disabled", true);
            $.resourceManage.blurId = record.id;
            $.resourceManage.str = record;
            $.resourceManage.dialog.set("title", "编辑");
            $.resourceManage.dialog.render();
            $.resourceManage.dialog.show();

        },
        /**
         * 添加资源
         * @param fromData
         * @param tip
         */
        saveResourceManage: function (fromData, tip) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/jurisdictionSave";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    location.reload();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 编辑资源
         * @param fromData
         */
        updateClassify: function (fromData) {
            // console.log(fromData)
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "accredit/jurisdictionEdit/" + fromData.id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    location.reload();
                }
            };
            $.ajax(aContent);
        },

        /**
         * 处理数据
         * @param recordStr
         * @param level
         */
        dealData: function (recordStr, level) {


            BUI.use(['bui/form', 'bui/tooltip'], function (Form, Tooltip) {
                $.resourceManage.form.render();
                var formData = $.resourceManage.form.serializeToObject();
                switch (level) {
                    case null:
                        //编辑
                        formData["id"] = $.resourceManage.blurId;
                        if ($.resourceManage.form.isValid()) {

                            $.resourceManage.updateClassify(formData);
                        }
                        break;
                    case 1:
                    case 2:
                        //新增二级
                        if (level == 1) {
                            formData["parentId"] = "";
                        } else {
                            formData["parentId"] = recordStr.code;

                        }
                        formData["url"] = $("#url").val();
                        formData["belong"] = $("input[name='belong']:checked").val();
                        formData["method"] = 1;
                        if ($.resourceManage.form.isValid()) {
                            switch ($("input[name='operationType']:checked").val()) {
                                case "GET":
                                    formData["operationType"] = "1";
                                    break;
                                case "POST":
                                    formData["operationType"] = "2";
                                    break;
                                case "PUT":
                                    formData["operationType"] = "3";
                                    break;
                                case "DELETE":
                                    formData["operationType"] = "4";
                                    break;
                            }
                            $.resourceManage.saveResourceManage(formData, $.resourceManage.tip);
                        }
                        break;
                    case 3:
                        //新增三级
                        formData["parentId"] = recordStr.code;
                        formData["code"] = recordStr.code;
                        formData["method"] = $("input[name='operationType']:checked").val();
                        formData["belong"] = recordStr.belong;
                        formData["url"] = $("#url").val();

                        switch (formData["method"]) {
                            case "GET":
                                formData["operationType"] = "1";
                                break;
                            case "POST":
                                formData["operationType"] = "2";
                                break;
                            case "PUT":
                                formData["operationType"] = "3";
                                break;
                            case "DELETE":
                                formData["operationType"] = "4";
                                break;
                        }
                        if ($.resourceManage.form.isValid()) {
                            $.resourceManage.saveResourceManage(formData, $.resourceManage.tip);
                        }
                        break;
                }
            });

        },
    }
    $(document).ready(function (e) {
        $.resourceManage.init();
    });
}(jQuery));