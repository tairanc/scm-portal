/**
 * Created by hzszy on 2017/5/5.
 */
$(function () {

    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=Category");
    });

    $.classify = {
        addParentId:null,
        tree: null,
        dialog: null,
        data: null,
        form: null,
        tip: null,
        str: "",
        level: null,
        nameLevel: null,
        nameRecord: null,
        editing: null,
        array: null,
        arr: new Array(),
        blurId: null,
        editFlag: null,
        editValid: null,
        editId: null,
        sortEditId: null,
        expandedId: new Array(),
        init: function () {

            //查询树
            $.classify.queryTreeNode();

            BUI.use(['bui/form', 'bui/tooltip', 'bui/overlay', 'bui/extensions/treegrid', 'bui/data', 'bui/Grid'], function (Form, Tooltip, Overlay, TreeGrid, Data, Grid) {

                //验证表单
                $.classify.form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        // validEvent: 'blur' //移除时进行验证
                    }
                });
                $.classify.form.render();

                //提示窗
                $.classify.tip = new Tooltip.Tip({
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

                //页面弹出层
                $.classify.dialog = new Overlay.Dialog({
                    title: "编辑",
                    width: 500,
                    height: 400,
                    mask: true,
                    contentId: 'add_content',

                    buttons: [
                        {
                            text: '保存',
                            id:"save",
                            elCls: 'button button-primary save',
                            handler: function () {
                                var nameBlueValue = $("#name").val();
                                if (nameBlueValue.indexOf("-") != -1 || nameBlueValue.indexOf("—")!= -1) {
                                    BUI.Message.Alert("分类名称不能包含 '-' !", "warning");
                                    return
                                }
                                $.classify.form.valid();
                                if ($.classify.form.isValid()) {
                                    $.classify.dealData($.classify.str, $.classify.level);
                                }

                            }
                        }, {
                            text: '取消',
                            elCls: 'button button-primary',
                            handler: function () {
                                $.classify.form.clearErrors();
                                this.close();
                            }
                        }
                    ],

                });

                //树结构
                var Grid = BUI.Grid;
                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false,//触发编辑的时候不选中行
                });
                $.classify.tree = new TreeGrid({
                    render: '#t1',
                    nodes: $.classify.data,
                    innerBorder: true, // 默认为true
                    columns: [
                        {title: '分类名称', dataIndex: 'name', width: 400, elCls: 'left',sortable:false},
                        {
                            title: '排序', dataIndex: 'sort',sortable:false, width: 200, elCls: 'center',
                            editor: {
                                xtype: 'number',
                                rules: {required: true},
                                validator: validFn,
                                editableFn: function (value, record) {
                                    if ($.classify.sortEditId) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            },
                        },

                        {
                            title: '状态', dataIndex: 'isValid',sortable:false, width: 300, elCls: 'center',
                            renderer: function (value, obj) {
                                if (value == 1) {
                                    return '启用';
                                }
                                if (value == 0) {
                                    return '停用';
                                }
                            }
                        },
                        {
                            title: '操作',
                            dataIndex: 'level',
                            width: '100%',
                            elCls: 'center',
                            sortable:false,
                            renderer: function (val, obj) {

                                var operationStr = "";
                                if (val == 1) {
                                    //一级目录下按钮
                                    operationStr += '<span class="grid-command addSecondClassify">新增二级分类</span>';
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    if (obj.isValid == 0) {
                                        operationStr += '<span class="grid-command isValid1">启用</span>';
                                    }
                                    else {
                                        operationStr += '<span class="grid-command isValid2">停用</span>';
                                    }
                                }
                                else if (val == 2) {
                                    //二级目录下按钮
                                    operationStr += '<span class="grid-command addThirdClassify">新增三级分类</span>';
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    if (obj.isValid == 0) {
                                        operationStr += '<span class="grid-command isValid1">启用</span>';
                                    }
                                    else {
                                        operationStr += '<span class="grid-command isValid2">停用</span>';
                                    }
                                }
                                else {
                                    //三级目录下按钮
                                    operationStr += '<span class="grid-command editClassify">编辑</span>';
                                    if (obj.isValid == 0) {
                                        operationStr += '<span class="grid-command isValid1">启用</span>';
                                    }
                                    else {
                                        operationStr += '<span class="grid-command isValid2">停用</span>';
                                    }
                                    operationStr += '<span class="grid-command brand">品牌</span>';
                                    operationStr += '<span class="grid-command property">属性</span>';
                                }
                                return operationStr;
                            }
                        }
                    ],
                    plugins: [editing],
                });
                $.classify.tree.render();

                //操作的点击事件
                $.classify.tree.on('cellclick', function (e) {
                    var record = e.record;
                    var domTarget = e.domTarget;
                    // var domTarget = null;
                    switch (domTarget.className) {
                        case "grid-command isValid1":
                            //修改状态 启用
                            $.classify.changClassify(record);
                            break;
                        case  "grid-command isValid2":
                            var index = $.classify.tree.indexOfItem(record);
                            for (var i = index; true; i++) {
                                var data = $.classify.tree.getItemAt(i + 1) || {};
                                if (record.level < data.level) {
                                    if (data.isValid == 1) {
                                        BUI.Message.Alert('当前分类下还存在启用的子分类，无法停用！', 'warning');
                                        break;
                                    } else {
                                        $.classify.changClassify(record);
                                        break;
                                    }
                                } else {
                                    //console.log(record);
                                    $.classify.changClassify(record);
                                    break;
                                }
                            }

                            break;
                        case "grid-command addSecondClassify":
                            $.classify.addClassify("新增二级分类", record, 2);
                            nameLevel =2;
                            nameRecord = record;
                            break;
                        case  "grid-command addThirdClassify":
                            $.classify.addClassify("新增三级分类", record, 3);
                            nameLevel =3;
                            nameRecord = record;
                            break;
                        case  "grid-command editClassify":
                            $.classify.editClassify("编辑", record);
                            nameRecord = record;
                            nameLevel=4;
                            break;
                        case  "grid-command brand":
                            var param = jsonToUrlParam(record);
                            window.location.href = "relevanceCategoryBrand.html" + "?" + encodeURI(param);

                            break;
                        case  "grid-command property":
                            var param = jsonToUrlParam(record);
                            window.location.href = "categoryProperty.html" + "?" + encodeURI(param);
                            break;
                    }

                });
                //校验名称唯一性
                $("#name").on("blur",function(){
                    var nameBlueValue = $("#name").val();
                    if (nameBlueValue.indexOf("-") != -1 || nameBlueValue.indexOf("—")!= -1) {
                        BUI.Message.Alert("分类名称不能包含 '-' !", "warning");
                        return
                    } 
                    if(nameLevel==1){
                        $.classify.checkName();
                    }
                    if(nameLevel==4){
                        var nameValue = $("#name").val();
                        if(!nameValue||nameValue==nameRecord.name){
                            return;
                        }else{
                            console.log(nameRecord)
                            $.classify.checkName(nameRecord,nameLevel); 
                        }

                    }
                    if(nameLevel==2||nameLevel==3){
                        $.classify.checkName(nameRecord); 
                    }                  
                });

                //收起按钮
                $("#close_btn").on("click", function () {
                    BUI.use(['bui/extensions/treegrid'], function (TreeGrid) {
                        $.classify.tree.collapseAll();
                    });
                });


                //展开按钮
                $("#expand_btn").on("click", function () {
                    BUI.use(['bui/extensions/treegrid'], function (TreeGrid) {
                        $.classify.tree.expandAll();
                    });
                });

                //新增一级分类按钮
                $("#add_btn").on("click", function () {
                    $.classify.addClassify("新增一级分类", null, 1);
                    nameLevel =1;
                });

                $(":radio").click(function () {

                    if ($.classify.editFlag) {
                        var noValid = $("input[name='isValid']:checked").val();  //获取被选中Radio的Value值
                        if (noValid == 0 && $.classify.editValid == 1) {
                            var aContent = $.AjaxContent();
                            aContent.url = $.scmServerUrl + "category/valid/" + $.classify.editId;
                            aContent.data = {};
                            aContent.type = "GET";
                            aContent.success = function (result, textStatus) {
                                if (result.appcode != 1) {
                                    BUI.Message.Alert(result.databuffer, "warning");
                                } else {
                                    if (result.result == "0") {
                                        BUI.Message.Alert("当前分类下还存在启用的子分类，无法停用！", "warning");
                                        $("#isValid").attr("checked", "checked");
                                    }
                                }
                            };
                            $.ajax(aContent);
                        }
                    }
                });


                $.classify.array = new Object();
                //排序按钮
                $("#edit_sort_btn").on("click", function () {
                    // $.classify.sortEditId = true;
                    // $("#edit_sort_btn").val("保存排序");
                    var formData;
                    formData = $.classify.array;
                    var sortId = $.classify.arr.unique3();
                    var categoryArray = new Array();

                    if (sortId.length > 0) {
                        if ($("#edit_sort_btn").val() == "编辑排序") {
                            $.classify.sortEditId = true;
                            $("#edit_sort_btn").val("保存排序");
                        } else if ($("#edit_sort_btn").val() == "保存排序") {
                            for (var i = 0; i < sortId.length; i++) {
                                var sortDate = new Object();
                                sortDate['id'] = formData[sortId[i]].id;
                                sortDate['sort'] = formData[sortId[i]].sort;
                                categoryArray[i] = sortDate;
                            }
                            $.classify.updateSort(JSON.stringify(categoryArray));
                        }
                    } else {
                        $.classify.sortEditId = true;
                        $("#edit_sort_btn").val("保存排序");
                    }


                });

                //去重
                Array.prototype.unique3 = function () {
                    var res = [];
                    var json = {};
                    for (var i = 0; i < this.length; i++) {
                        if (!json[this[i]]) {
                            res.push(this[i]);
                            json[this[i]] = 1;
                        }
                    }
                    return res;
                }

                function validFn(value, newRecord) {
                    var ex = /^\d+$/;
                    if (ex.test(value)) {
                        $.classify.array[newRecord.id] = newRecord;
                        $.classify.myFunction(newRecord.id);
                        if (value != newRecord.sort) {
                            $("#edit_sort_btn").val("保存排序");
                        }
                    } else {
                        return "不是有效的数字！";
                    }
                }
            });

        },

        //新增时分类名称唯一性校验
        checkName: function(record,nameLevel){
            var name = $.trim($("#name").val())
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/checkCategoryName";
            if(record && nameLevel == undefined){
                // 新增状态
                aContent.data = {"name": name,'parentId':record.id};   
            }else if(record && nameLevel != undefined){
                //  编辑状态
                aContent.data = {"name": name,'id':record.id};
                if (record.level == 1) {
                    aContent.data = {"name": name,'id':record.id,"parentId":""};
                }else{
                    aContent.data = {"name": name,'id':record.id,"parentId":record.parent.id};
                }  
            }else{
                aContent.data = {"name": name};
            }
            $.classify.addParentId  = aContent.data.parentId || null
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        BUI.Message.Alert("该分类名称已经存在,请用其他名称！", "warning");
                        $("#name").val("");
                    }
                }
            };
            $.ajax(aContent);
        },
        //新增时的内容回写
        addClassify: function (classifyLevel, record, level) {
            $.classify.editFlag = false;
            $("#name").val("");
            $("#classifyDescribe").val("");
            $("#sort").val("0");
            // $("#categoryCode").val("");
            $("#source").val("");
            if (level != 1) {
                $("#alise").val(record.name);
            }else {
                $("#alise").val("");
            }
            $("#isValid").attr("checked", "checked");
            $.classify.dialog.set("title", classifyLevel);
            $.classify.str = record;
            $.classify.level = level;
            $.classify.dialog.render();
            $.classify.dialog.show();
        },

        //编辑时的内容回写
        editClassify: function (editClassify, record) {
            $.classify.editFlag = true;
            $("#name").val(record.name);
            $("#classifyDescribe").val(record.classifyDescribe);
            $("#sort").val(record.sort);
            $("#alise").val(record.parent.name);
            $("#source").val(record.source);
            $.classify.editId = record.id;
            if (record.isValid == 1) {
                $.classify.editValid = 1;
                $("#isValid").attr("checked", "checked");
            }
            if (record.isValid == 0) {
                $.classify.editValid = 0;
                $("#isValid2").attr("checked", "checked");
            }
            // $("#categoryCode").val(record.categoryCode);
            // $(".header-title").empty();
            $.classify.blurId = record.id;
            $.classify.level = null;
            $.classify.str = record;
            $.classify.dialog.set("title", "编辑");
            $.classify.dialog.render();
            $.classify.dialog.show();

        },

        //状态改变的数据处理
        changClassify: function (record) {

            BUI.use('bui/overlay', function (overlay) {
                function show() {
                    var state;
                    if (record.isValid == 0) {
                        state = "启用";
                    }
                    else {
                        state = "停用"

                    }

                    if (state == "停用" && record.level != 3) {
                        var aContent = $.AjaxContent();
                        aContent.url = $.scmServerUrl + "category/valid/" + record.id;
                        aContent.data = {};
                        aContent.type = "GET";
                        aContent.success = function (result, textStatus,xhr) {
                            if (result.appcode != 1) {
                                BUI.Message.Alert(result.databuffer, "warning");
                            } else {
                                if (result.result == "0") {
                                    BUI.Message.Alert("当前分类下还存在启用的子分类，无法停用！", "warning");
                                    $("#isValid").attr("checked", "checked");
                                } else {
                                    BUI.Message.Confirm('确认要' + state + '么？', function () {
                                        $.classify.changeState(record,state)
                                    }, 'question');
                                }


                            }
                        };
                        $.ajax(aContent);

                    }
                    else {
                        BUI.Message.Confirm('确认要' + state + '么？', function () {
                            $.classify.changeState(record,state)
                        }, 'question');
                    }
                }

                show();
            });

        },


        /**
         * 查询树
         */
        queryTreeNode: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/tree";
            aContent.data = {"parentId": "", "isRecursive": true};
            aContent.async = false;
            aContent.success = function (result, textStatus,xhr) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.classify.data = result.result;
                }
            };
            $.ajax(aContent);
        },

        /**
         * 添加分类
         * @param fromData
         * @param tip
         */
        saveClassify: function (fromData, tip) {
            $.classify.recordNodes();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/category";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title', result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.classify.reloadTree()
                    $.classify.dialog.close();
                }
            };
            $.ajax(aContent);
        },

        /**
         * 更新分类
         * @param fromData
         */
        updateClassify: function (fromData) {
            //console.log(fromData)
            $.classify.recordNodes();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/category/" + fromData.id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus,xhr) {
                console.log(xhr.state);
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.classify.reloadTree();
                    $.classify.dialog.close();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 重新加载页面
         */
        reloadTree: function () {
            // $.showLoadMask()
            $.classify.queryTreeNode();
            $.classify.tree.clearData();
            $.classify.tree.set("nodes", $.classify.data);
            $.classify.tree.collapseAll();
            $.each($.classify.expandedId, function (index, children) {
                $.classify.tree.expandNode(children);
            });
            // $.hideLoadMask()
        },

        /**
         * 记录展开的节点
         */
        recordNodes: function () {
            $.classify.expandedId = [];
            var record = $.classify.tree.getRecords();
            $.each(record, function (index, children) {
                if (children.expanded) {
                    $.classify.expandedId.push(children.id);
                }
            });
            return record;
        },

        /**
         * 更新排序
         * @param fromData
         */
        updateSort: function (fromData) {
            $.classify.recordNodes();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/sort/";
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.classify.reloadTree();
                    $("#edit_sort_btn").val("编辑排序");
                    $.classify.sortEditId=false
                }
            };
            $.ajax(aContent);
        },

        /**
         * 状态修改
         * @param fromData
         */
        changeState: function (fromData,state) {

            $.classify.recordNodes();
            var fromDaraTemp = $.extend({}, fromData);
            fromDaraTemp['children'] = null;
            fromDaraTemp['parent'] = null;
            fromDaraTemp['path'] = null;

            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/category/updateState/" + fromDaraTemp.id;
            aContent.data = fromDaraTemp;
            aContent.type = "PUT";
            aContent.success = function (result) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.classify.reloadTree();
                    BUI.Message.Alert(state+'成功！', 'success');
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
                $.classify.form.render();
                var formData = $.classify.form.serializeToObject();
                    formData.parentId = $.classify.addParentId
                switch (level) {
                    case null:
                        //编辑
                        formData["id"] = recordStr.id;
                        if ($.classify.form.isValid()) {
                            $.classify.updateClassify(formData);
                        }
                        break;
                    case 1:
                        //新增一级
                        // formData["fullPathId"] = "|";
                        formData["level"] = 1;
                        if ($.classify.form.isValid()) {
                            $.classify.saveClassify(formData, $.classify.tip);
                        }
                        break;
                    case 2:
                        //新增二级
                        formData["level"] = level;
                        formData["fullPathId"] = recordStr.id;
                        formData["parentId"] = recordStr.id;
                        if ($.classify.form.isValid()) {
                            $.classify.saveClassify(formData, $.classify.tip);
                        }
                        break;
                    case 3:
                        //新增三级
                        formData["level"] = level;
                        formData["fullPathId"] = recordStr.fullPathId;
                        formData["parentId"] = recordStr.id;
                        if ($.classify.form.isValid()) {
                            $.classify.saveClassify(formData, $.classify.tip);
                        }
                        break;
                }
            });
            // this.close();

        },

        myFunction: function myFunction(id) {
            $.classify.arr.push(id);
        },

    }
    $(document).ready(function (e) {
        $.classify.init();
    });
}(jQuery));
