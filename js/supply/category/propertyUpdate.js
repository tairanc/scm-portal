/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {
    var errMsg;
    var sucMsg;
    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=Property&entityId=" + $.getUrlParam("id"));
    });

    //页面完全加载完成后设置单选框默认选中
    $.propertyUpdateApp = {
        _isValid: "",
        _valueType: "",
        _typeCode:"",
        init: function () {
            //获取form表单值并且填充表单数据
            var propertyId = $.getUrlParam("id")
            $.propertyUpdateApp.fileForm(propertyId);

            $.propertyUpdateApp.queryTypeCodeList();

            // $("input[name='valueType']").change(function () {
            //     var $selectedvalue = $("input[name='valueType']:checked").val();
            //     if ($selectedvalue == '0') {
            //         $("#textTable").show()
            //         $("#picTable").hide()
            //     }
            //     if ($selectedvalue == '1') {
            //         $("#textTable").hide()
            //         $("#picTable").show()
            //     }
            // })

            /*if($.propertyUpdateApp._valueType==""){
                setTimeout(function () {
                    $.propertyUpdateApp.initTable(propertyId);
                }, 1500)
            }else{
                $.propertyUpdateApp.initTable(propertyId);
            }*/

            var count = 0;
            $.propertyUpdateApp.repatInitTable(propertyId, count);

        },

        repatInitTable: function (propertyId, count) {
            if (count > 10) {
                return false;
            }
            // $.propertyUpdateApp.initTable(propertyId);
            var valueType = $.propertyUpdateApp._valueType;
            if (valueType == "1" || valueType == "0") {
                $.propertyUpdateApp.initTable(propertyId);
            } else {
                setTimeout(function () {
                    $.propertyUpdateApp.repatInitTable(propertyId, count);
                }, 200)
            }
            count++;
        },

        initTable: function (propertyId) {

            BUI.use(['bui/form', 'bui/grid', 'bui/data', 'bui/tooltip'], function (Form, Grid, Data, Tooltip) {
                var tip = new Tooltip.Tip({
                    align: {
                        node: '#save_btn'
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
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });

                form.render();


                var textColumns = [
                    {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                    {title: '排序', dataIndex: 'sort', visible: false},
                    {
                        title: '属性值名称',
                        dataIndex: 'value',
                        width: '50%',elCls: 'center',
                        property : 'property',
                        editor: {xtype: 'text', validator:function(value,skuGrid){
                            var value =  value.replace(/\s+/g, "");  
                            if(value.length==0){
                                return '属性名称不能为空'
                            }else if(value.length>0){
                                if(value!=skuGrid.value){
                                    if($(".propertyText[value='"+value+"']").length>0){
                                        return '属性名称'+value+'重复'
                                    } 
                                }   
                                var aContent = $.AjaxContent();
                                aContent.url = $.scmServerUrl + "category/propertyValue/checkValueName";
                                aContent.data = {"name": value};
                                aContent.type = "POST";
                                aContent.async=false; 
                                aContent.success = function (result, textStatus) {
                                    if (result.appcode != 1) {
                                        
                                    }else{
                                        sucMsg = result.databuffer;
                                        errMsg=1;                                       
                                    }
                                }; 
                                aContent.error  =function(XMLHttpRequest, textStatus, errorThrown){
                                    var result = "";
                                    if (XMLHttpRequest.responseText) {
                                        result = XMLHttpRequest.responseText;
                                        if (!(result instanceof Object)) {
                                            try {
                                                result = JSON.parse(result);
                                            } catch (e) {

                                            }
                                        }
                                    }
                                    if (XMLHttpRequest.status == 401) {
                                        BUI.Message.Alert(result.databuffer || "",function(){
                                            var aContent = $.AjaxContent();
                                            aContent.type = "POST";
                                            aContent.url = $.scmServerUrl + "account/user/logout/";
                                            aContent.success = function () {
                                                if( window.location.origin.indexOf('tairanmall.com') != -1 ) {
                                                    var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                                    window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                                }  else {
                                                    window.location.href = '/supply/login.html';
                                                }

                                                localStorage.clear();
                                            };
                                            $.ajax(aContent);
                                            this.close();
                                        },'error');
                                    } else if (XMLHttpRequest.status == 403) {
                                        if (result.appcode == 0) {
                                            if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                            } else {
                                                window.top.location.href = '/supply/login.html';
                                            }
                                        }
                                    } else if (XMLHttpRequest.status == 404) {
                                        window.top.location = "/supply/404.html";
                                    } else if (XMLHttpRequest.status == 500) {
                                        window.top.location = "/supply/500.html";
                                    } else {
                                        if (result.appcode == 0) {
                                            errMsg = result.databuffer;
                                            sucMsg=1;
                                        }
                                    }
                                };
                                $.ajax(aContent);                                                                                                        
                                if(errMsg==1){
                                    return;
                                }
                                if(sucMsg==1){
                                    return errMsg;
                                }                                                             
                            }
                        }}
                    },
                    {hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: true}
                ];
                var picColumns = [
                    {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                    {
                        title: '属性值名称',
                        dataIndex: 'value',
                        width: '50%',elCls: 'center',
                        property : 'property',
                        editor: {xtype: 'text', validator:function(value,skuGrid){
                            var value =  value.replace(/\s+/g, "");  
                            if(value.length==0){
                                return '属性名称不能为空'
                            }else if(value.length>0){
                                if(value!=skuGrid.value){
                                    if($(".propertyText[value='"+value+"']").length>0){
                                        return '属性名称'+value+'重复'
                                    } 
                                }   
                                var aContent = $.AjaxContent();
                                aContent.url = $.scmServerUrl + "category/propertyValue/checkValueName";
                                aContent.data = {"name": value};
                                aContent.type = "POST";
                                aContent.async=false; 
                                aContent.success = function (result, textStatus) {
                                    if (result.appcode != 1) {
                                        
                                    }else{
                                        sucMsg = result.databuffer;
                                        errMsg=1;                                       
                                    }
                                }; 
                                aContent.error  =function(XMLHttpRequest, textStatus, errorThrown){
                                    var result = "";
                                    if (XMLHttpRequest.responseText) {
                                        result = XMLHttpRequest.responseText;
                                        if (!(result instanceof Object)) {
                                            try {
                                                result = JSON.parse(result);
                                            } catch (e) {

                                            }
                                        }
                                    }
                                    if (XMLHttpRequest.status == 401) {
                                        BUI.Message.Alert(result.databuffer || "",function(){
                                            var aContent = $.AjaxContent();
                                            aContent.type = "POST";
                                            aContent.url = $.scmServerUrl + "account/user/logout/";
                                            aContent.success = function () {
                                                if( window.location.origin.indexOf('tairanmall.com') != -1 ) {
                                                    var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                                    window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                                }  else {
                                                    window.location.href = '/supply/login.html';
                                                }

                                                localStorage.clear();
                                            };
                                            $.ajax(aContent);
                                            this.close();
                                        },'error');
                                    } else if (XMLHttpRequest.status == 403) {
                                        if (result.appcode == 0) {
                                            if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                            } else {
                                                window.top.location.href = '/supply/login.html';
                                            }
                                        }
                                    } else if (XMLHttpRequest.status == 404) {
                                        window.top.location = "/supply/404.html";
                                    } else if (XMLHttpRequest.status == 500) {
                                        window.top.location = "/supply/500.html";
                                    } else {
                                        if (result.appcode == 0) {
                                            errMsg = result.databuffer;
                                            sucMsg=1;
                                        }
                                    }
                                };
                                $.ajax(aContent);                                                                                                        
                                if(errMsg==1){
                                    return;
                                }
                                if(sucMsg==1){
                                    return errMsg;
                                }                                                             
                            }
                        }}
                    },
                    {
                        title: '属性图片', dataIndex: 'picture', width: '30%', elCls: 'center', editor: {
                        xtype: 'upload', maxNum: 1, rules: {
                            required: true,
                            //文的类型
                            ext: ['.png,.jpg,.jpeg,.bmp', '文件类型只能为{0}'],
                            //上传的最大个数
                            // max: [1, '文件的最大个数不能超过{0}个'],
                            //文件大小的最小值,这个单位是kb
                            minSize: [1, '文件的大小不能小于{0}KB'],
                            //文件大小的最大值,单位也是kb
                            maxSize: [2048, '文件大小不能大于2M']
                        }
                    }
                    },
                    {hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: true,width: '20%'}
                ];

                var textTable = new DynamicGrid(textColumns);
                var textDataConfig = {
                    gridId: "textTable",
                    sortName: "sort",
                    showRowNumber: true,
                    oldDateNotEdit: true,
                    dataUrl: $.scmServerUrl + 'category/propertyValues/search',
                    onDelRow:function(){$.propertyUpdateApp.textTablePager.init();},
                    onMoved:function(){$.propertyUpdateApp.textTablePager.init();}
                    // uploadMax:1,
                    // uploadId:""
                    // sortName:""
                };

                var picTable = new DynamicGrid(picColumns);
                var picDataConfig = {
                    gridId: "picTable",
                    sortName: "sort",
                    showRowNumber: true,
                    oldDateNotEdit: true,
                    dataUrl: $.scmServerUrl + 'category/propertyValues/search',
                    uploadUrl: $.scmServerUrl + 'qinniu/upload/property',
                    batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                    uploadMax: 0,
                    onDelRow:function(){$.propertyUpdateApp.picTablePager.init();},
                    onMoved:function(){$.propertyUpdateApp.picTablePager.init();}
                    // uploadId:""
                    // sortName:""
                };


                if ($.propertyUpdateApp._valueType == '0') {
                    $("#textTable").show()
                    $("#picTable").hide()
                    textTable.initDataAjax({"propertyId": propertyId}, textDataConfig,function(){
                        setTimeout(function(){
                            $.propertyUpdateApp.textTablePager=$("#textTable .bui-grid-bbar").scmPager({target:"#textTable .bui-grid-table>tbody>.bui-grid-row"}) 
                        },500);
                    });
                    picTable.initData([], picDataConfig);
                    // textTable.load({"propertyId":propertyId})
                }
                if ($.propertyUpdateApp._valueType == '1') {
                    $("#textTable").hide()
                    $("#picTable").show()
                    textTable.initData([], textDataConfig);
                    picTable.initDataAjax({"propertyId": propertyId}, picDataConfig,function(){
                        setTimeout(function(){
                            $.propertyUpdateApp.picTablePager=$("#picTable .bui-grid-bbar").scmPager({target:"#picTable .bui-grid-table>tbody>.bui-grid-row"}) 
                        },500);
                    });
                    // picTable.load({"propertyId":propertyId})
                }

                $("#add").on('click', function () {
                    var $selectedvalue = $("input[name='valueType']:checked").val();
                    if ($selectedvalue == '0') {
                        textTable.addRow(null,0);
                        $.propertyUpdateApp.textTablePager.init(1);
                    }
                    if ($selectedvalue == '1') {
                        picTable.addRow(null,0);
                        $.propertyUpdateApp.picTablePager.init(1);
                    }
                });

                $("#save_btn").on("click", function () {
                    var formData = form.serializeToObject();
                    if (form.isValid()) {
                        var $selectedvalue = $("input[name='valueType']:checked").val();
                        var options = $("#typeCode option:selected").val();
                        if (options == "" || options == null) {
                            // tip.set('title', '属性类型不能为空请输入');
                            // tip.show();
                            BUI.Message.Alert("属性值不能为空请输入!",'warning');
                            return false;
                        }
                        var records = [];
                        if ($selectedvalue == '0') {
                            records = textTable.getData();
                            var count = 0;
                            for (var i = 0; i < records.length; i++) {
                                if (records[i]['source'] == "0" && records[i]['status'] == "3") {
                                    count++;
                                }
                            }
                            if (count == records.length) {
                                // tip.set('title', '属性值不能为空请输入');
                                // tip.show();
                                BUI.Message.Alert("属性值不能为空请输入!",'warning');
                                return false;
                            }
                        } else {
                            records = picTable.getData();
                            var count = 0;
                            for (var i = 0; i < records.length; i++) {
                                if (records[i]['source'] == "0" && records[i]['status'] == "3") {
                                    count++;
                                }
                            }
                            if (count == records.length) {
                                // tip.set('title', '属性值不能为空请输入');
                                // tip.show();
                                BUI.Message.Alert("属性值不能为空请输入!",'warning');
                                return false;
                            }
                        }

                        if (($selectedvalue == '0' && textTable.isValid()) || ($selectedvalue != '0' && picTable.isValid())) {
                            form.getField('gridValue').set('value', JSON.stringify(records));
                            var formData = form.serializeToObject();
                            $.showLoadMask();
                            $.propertyUpdateApp.save(formData, tip);
                        }


                    }
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "propertyList.html";
                });

                $("#reset_btn").on("click", function () {
                    var currentUrl = window.location.href;
                    window.location.href = currentUrl;
                });


            });


        },
        /***
         * 填充表单
         * @param id 主键ID
         */
        fileForm: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/property/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    alert("查询属性类型明细失败." + result.databuffer,"warning")
                } else {
                    var propertyDtl = result.result;
                    $("#id").val(propertyDtl.id);
                    $("#name").val(propertyDtl.name);
                    $("#sort").val(propertyDtl.sort);
                    $("#description").val(propertyDtl.description);
                    $("#_valueType").val(propertyDtl.valueType);
                    $.propertyUpdateApp._valueType = propertyDtl.valueType;
                    $.propertyUpdateApp._typeCode=propertyDtl.typeCode;

                    $.propertyUpdateApp._isValid = propertyDtl.isValid;
                    setTimeout(function () {
                        $.setSelectItem("typeCode", propertyDtl.typeCode);
                    }, 400);
                    $.setRadioChecked('isValid', $.propertyUpdateApp._isValid);
                    $.setSelectItem("typeCode", $.propertyUpdateApp._typeCode);
                    $.setRadioChecked('valueType', $.propertyUpdateApp._valueType);
                    $("input[name=typeCode]").val(propertyDtl.typeCode);
                    $("#valueType").val(propertyDtl.valueType);
                }
            };
            $.ajax(aContent);
        },

        /***
         * 查询属性类型列表
         */
        queryTypeCodeList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "config/dicts";
            aContent.data = {typeCode: "propertyType"};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('typeCode', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },

        /***
         * 保存属性
         * @param fromData
         */
        save: function (fromData, tip) {
            //检查文件上传状态
            if ($.checkUploadStatus() == true) {
                var aContent = $.AjaxContent(function(){
                    $.hideLoadMask();
                });
                aContent.url = $.scmServerUrl + "category/property/" + fromData['id'];
                aContent.data = fromData;
                aContent.type = "PUT";
                aContent.success = function (result, textStatus) {
                    window.location.href = "propertyList.html";
                };
                $.ajax(aContent);
            }
        }

    };
    $(document).ready(function(e) {
        $.propertyUpdateApp.init();
    });
}(jQuery));
