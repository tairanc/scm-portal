/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {
    var errMsg;
    var sucMsg;
    $.propertyAddApp = {
        init: function () {
            $.propertyAddApp.queryTypeCodeList();

            $("input[name='valueType']").change(function () {
                var $selectedvalue = $("input[name='valueType']:checked").val();
                if ($selectedvalue == '0') {
                    $("#textTable").show();
                    $("#picTable").hide();
                    //if(!$.propertyAddApp.textTablePager){
                        $.propertyAddApp.textTablePager=$("#textTable .bui-grid-bbar").scmPager({target:"#textTable .bui-grid-table>tbody>.bui-grid-row"}) 
                    //}             
                }
                if ($selectedvalue == '1') {
                    $("#textTable").hide();
                    $("#picTable").show();
                    //if(!$.propertyAddApp.picTablePager){
                        $.propertyAddApp.picTablePager=$("#picTable .bui-grid-bbar").scmPager({target:"#picTable .bui-grid-table>tbody>.bui-grid-row"}) 
                    //}   
                }
            });

            BUI.use(['bui/form', 'bui/uploader', 'bui/tooltip'], function (Form, Uploader, Tooltip) {
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
                    {hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: true,elCls: 'center',width: '50%'}
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
                                    if(value!=skuGrid.value){
                                        if($(".propertyText[value='"+value+"']").length>0){
                                            return '属性名称'+value+'重复'
                                        } 
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
                            maxSize: [2048, '文件大小不能大于2M'],
                            maxNum: 1,
                            rowIndex:index
                        }
                    }
                    },
                    {hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: true,elCls: 'center',width: '20%'}
                ];


                var textTable = new DynamicGrid(textColumns);
                var textDataConfig = {
                    gridId: "textTable",
                    sortName: "sort",
                    showRowNumber:true,
                    onDelRow:function(){$.propertyAddApp.textTablePager.init();},
                    onMoved:function(){$.propertyAddApp.textTablePager.init();}
                    // uploadUrl: $.scmServerUrl + 'qinniu/upload/property',
                    // uploadMax:1,
                    // uploadId:""
                    // sortName:""
                };
                textTable.initData([], textDataConfig);
                setTimeout(function(){
                            $.propertyAddApp.textTablePager=$("#textTable .bui-grid-bbar").scmPager({target:"#textTable .bui-grid-table>tbody>.bui-grid-row"}) 
                        },100);

                var picTable = new DynamicGrid(picColumns);
                var picDataConfig = {
                    gridId: "picTable",
                    sortName: "sort",
                    showRowNumber:true,
                    uploadUrl: $.scmServerUrl + 'qinniu/upload/property',
                    batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                    uploadMax: 1,
                    onDelRow:function(){$.propertyAddApp.picTablePager.init();},
                    onMoved:function(){$.propertyAddApp.picTablePager.init();}
                    // uploadId:""
                    // sortName:""
                };
                picTable.initData([], picDataConfig);
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });

                form.render();
                $("#add").on('click', function () {
                    var $selectedvalue = $("input[name='valueType']:checked").val();
                    if ($selectedvalue == '0') {
                        textTable.addRow(null,0);
                        $.propertyAddApp.textTablePager.init(1);
                    }
                    if ($selectedvalue == '1') {
                        picTable.addRow(null,0);
                        $.propertyAddApp.picTablePager.init(1);
                    }
                });

                $("#save_btn").on("click", function () {
                    form.valid()
                    if (form.isValid()) {
                        var $selectedvalue = $("input[name='valueType']:checked").val();
                        var options = $("#typeCode option:selected").val();
                        if (options == "" || options == null) {
                            // tip.set('title', '属性类型不能为空请输入');
                            // tip.show();
                            BUI.Message.Alert("请选择属性类型",'warning');
                            return false;
                        }
                        var str = null;
                        if ($selectedvalue == '0') {
                            // if(textTable.isValid()){
                                str = BUI.JSON.stringify(textTable.getData());
                                if (str == null || str == '[]') {
                                    // tip.set('title', '请添加属性值');
                                    // tip.show();
                                    BUI.Message.Alert("请添加属性值!",'warning');
                                    return false;
                                }
                            // }
                        } else {
                            /*if(!picTable.isValid()){
                                BUI.Message.Alert("请上传图片!",'warning');
                                return false;
                            }*/
                            // if(picTable.isValid()) {
                                str = BUI.JSON.stringify(picTable.getData());
                                if (str == null || str == '[]') {
                                    // tip.set('title', '请添加属性值');
                                    // tip.show();
                                    BUI.Message.Alert("请添加属性值!",'warning');
                                    return false;
                                }
                            // }
                        }                        
                        if(($selectedvalue == '0'&& textTable.isValid())||($selectedvalue != '0'&&picTable.isValid())){
                            form.getField('gridValue').set('value', str);
                            var formData = form.serializeToObject();
                            $.showLoadMask();
                            $.propertyAddApp.save(formData, tip);
                        }

                    }
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "propertyList.html";
                });

                $("#reset_btn").on("click", function () {
                    textTable.clear();
                    picTable.clear();
                });


            });
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
                    BUI.Message.Alert(result.databuffer,"warning");
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
            if ($.checkUploadStatus() == true) {
                var aContent = $.AjaxContent(function(){
                    $.hideLoadMask();
                });
                aContent.url = $.scmServerUrl + "category/property";
                aContent.data = fromData;
                aContent.type = "POST";
                aContent.success = function (result, textStatus) {
                    window.location.href = "propertyList.html";
                };
                $.ajax(aContent);
            }
        }
    };
    $(document).ready(function (e) {
        $.propertyAddApp.init();
    });
}(jQuery));
