/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {
    $.supplierAddApp = {
        _form : null,
        supplierCode: '',
        store: null,//代理分类表格数据对象
        brandTable: null,//代理品牌表格对象
        uploadExt1: null,//营业执照文件上传对象
        uploadExt2: null,//组织机构代码证文件上传对象
        uploadExt3: null,//税务登记证文件上传对象
        uploadExt4: null,//法人身份证文件上传对象ss
        init: function () {
            //this.querySupplierNatureList();
            this.queryCountryList();
            this.initChannel();
            this.initSupplierCategory();
            this.initSupplierBrand();
            BUI.use(['bui/form', 'bui/tooltip', 'bui/uploader', 'bui/tab', 'bui/mask'], function (Form, Tooltip, Uploader, Tab) {
                var form = new Form.Form({
                    srcNode: '#J_Form',
                    // defaultChildCfg: {
                    //validEvent : 'blur' //移除时进行验证
                    // }
                });
                form.render();

                $.supplierAddApp._form = form;


                // $.supplierAddApp.tab = new Tab.TabPanel({
                //     srcNode: '#tab',
                //     elCls: 'nav-tabs',
                //     itemStatusCls: {
                //         'selected': 'active'
                //     },
                //     panelContainer: '#tabContent'//如果不指定容器的父元素，会自动生成
                // });
                //
                // $.supplierAddApp.tab.render();
                $.supplierAddApp.tab = new Tab.Tab({
                    render : '#tab',
                    elCls : 'nav-tabs',
                    autoRender: true,
                    children:[
                        {text:'代理类目',value:'1'},
                        {text:'代理品牌',value:'2'},
                        {text:'财务信息',value:'3'},
                        {text:'售后信息',value:'4'}
                    ]

                });
                $.supplierAddApp.tab.on('selectedchange',function (ev) {
                    $("#supplierCategory").hide();
                    $("#supplierBrand").hide();
                    $("#supplierFinancial").hide();
                    $("#supplierAfterSale").hide();
                    var item = ev.item;
                    if(item.get('value')==1){
                        $("#supplierCategory").show();
                    }else if(item.get('value')==2){
                        $("#supplierBrand").show();
                    }else if(item.get('value')==3){
                        $("#supplierFinancial").show();
                    }else if(item.get('value')==4){
                        $("#supplierAfterSale").show();
                    }

                });
                $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(0));

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

                $.supplierAddApp.initPicUpload();

                $("#save_btn").on("click", function () {
                    var form1 = $.supplierAddApp._form.getChild("baseInfoDiv");
                    if($('input[name="supplierKindCode"]:checked').val() == "purchase"){
                        //$("#interfaceIdDiv").remove();
                        var field = form1.getField('supplierInterfaceId');
                        field.clearRules('required');
                    }else{
                        if($("#supplierInterfaceId").val()==''){
                                $("#errorShow").show();
                            }
                        $("#supplierInterfaceId").blur(function(){
                            if($("#supplierInterfaceId").val()==''){
                                $("#errorShow").show();
                            }else{
                                $("#errorShow").hide();
                            }
                        });
                    }                    

                    var addressFrom = null;
                    if($('input[name="supplierTypeCode"]:checked').val() == "internalSupplier"){
                        addressFrom = $.supplierAddApp._form.getChild("innerSupplier");
                    }else{
                        addressFrom = $.supplierAddApp._form.getChild("outerSupplier");
                    }

                    if($('input[name="supplierKindCode"]:checked').val() == "purchase"){
                        var normal3Cert = $.supplierAddApp._form.getChild("normal3Cert");  // 证件信息
                        normal3Cert.valid();
                        var threeCertUnion = $.supplierAddApp._form.getChild("threeCertUnion");  // 证件信息
                        threeCertUnion.valid();
                    }
                    if ($.supplierAddApp.checkFinacialAfterSale()) {

                    }

                    if (form1.isValid() == false) {
                        return false;
                    }
                    if(addressFrom.isValid() == false){
                        return false;
                    }

                    if($('input[name="supplierTypeCode"]:checked').val() == "internalSupplier"){
                        if($('input[name="supplierKindCode"]:checked').val() == "purchase"){
                            if(!$.supplierAddApp.checkdate()){
                                return false;
                            }
                            if ($.supplierAddApp.checkCertificatePic() == false) {
                                return false;
                            }
                        }
                    }
                  if($.supplierAddApp.checkdate()) {
                    $.supplierAddApp.save(form.toObject());
                  }
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "supplierList.html";
                });

                $("#reset_btn").on("click", function () {
                    form.clearErrors(true, true);
                });

                //供应商性质点击切换div
                $('input[name="supplierKindCode"]').on("change", function () {
                    var val = $(this).val();
                    if ("oneAgentSelling" == val) {
                        $("#interfaceIdDiv").show();                       
                        $("#supplierInterfaceId").blur(function(){
                            if($("#supplierInterfaceId").val()==''){
                                $("#errorShow").show();
                            }
                        });
                        $(".certCls").each(
                            function () {
                                $(this).hide();
                            }
                        );
                    } else {
                        $("#interfaceIdDiv").hide();
                        $("#errorShow").hide();
                        $(".certCls").each(
                            function () {
                                $(this).show();
                            }
                        );
                    }
                  var normal3Cert = $.supplierAddApp._form.getChild("normal3Cert");  // 证件信息
                  var threeCertUnion = $.supplierAddApp._form.getChild("threeCertUnion");  // 证件信息

                  if($('input[name="supplierKindCode"]:checked').val() == "oneAgentSelling"){
                        threeCertUnion.eachChild(function(child,index){ //遍历子控件
                          child.get("rules").required = false;
                          child.eachChild(function(child1,index){ //遍历子控件
                            child1.get("rules").required = false;
                          });
                        });

                        normal3Cert.eachChild(function(child,index){ //遍历子控件
                          child.get("rules").required = false;
                          child.eachChild(function(child1,index){ //遍历子控件
                            child1.get("rules").required = false;
                          });
                        });
                    }else{
                        threeCertUnion.eachChild(function(child,index){ //遍历子控件
                          child.get("rules").required = true;
                          child.eachChild(function(child1,index){ //遍历子控件
                            child1.get("rules").required = true;
                          });
                        });

                        normal3Cert.eachChild(function(child,index){ //遍历子控件
                          child.get("rules").required = true;
                          child.eachChild(function(child1,index){ //遍历子控件
                            child1.get("rules").required = true;
                          });
                        });
                    }
                    normal3Cert.clearFields();
                    threeCertUnion.clearFields();
                    normal3Cert.clearErrors();
                    threeCertUnion.clearErrors();
                });

                //供应商类型点击切换div
                $("input[name=supplierTypeCode]").on("change", function () {
                    form.clearErrors(true, true);
                    var obj = $(this);
                    if(obj.val() == "overseasSupplier"){
                        $("#certPictRemark").hide();
                    }else{
                        $("#certPictRemark").show();
                    }
                });

                //证件类型点击切换div
                $("input[name=certificateTypeId]").on("change", function () {
                    var address = $("#address").val();
                    if(address.length == 0){
                        $("#address").val("");
                    }
                    //form.clearErrors(true, true);
                });

                //验证供应商名称是不是已经被使用
                $("#supplierName").on("blur", function () {
                    if(form.isValid()){
                        var supplierName = $("#supplierName").val();
                        if (supplierName == "") {
                            return false;
                        }
                        var aContent = $.AjaxContent();
                        aContent.url = $.scmServerUrl + "supplier/suppliers";
                        aContent.data = {supplierName: supplierName};
                        aContent.success = function (result, textStatus) {
                            if (result.appcode != 1) {
                                BUI.Message.Alert(result.databuffer, "warning");
                            } else {
                                if ("" != result.result && null != result.result && [] != result.result) {
                                    BUI.Message.Alert("该供应商名称已经存在,请用其他名称！")
                                    $("#supplierName").val("");
                                }
                            }
                        };
                        $.ajax(aContent);
                    }
                });


            });
        },
        /***
         * 初始化供应商
         */
        initChannel: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/channels";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var html = "";
                    var channels = result.result;
                    for (var i = 0; i < channels.length; i++) {
                        var tmp = channels[i]["id"] + "-" + channels[i]["code"];
                        html += '<label class="control-label checkbox" style="text-align: left; margin-left: 10px; width: auto;"><input name="channel" type="checkbox" checked="checked" value=' + tmp + ' />' + channels[i]["name"] + '</label>';
                    }
                    $("#channelDiv").html(html);

                }
            };
            $.ajax(aContent);

        },
        /***
         * 查询供应商性质
         */
        /*querySupplierNatureList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/supplierNature";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem('supplierKindCode', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },*/
        /***
         * 查询国家列表
         */
        queryCountryList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/country";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem('country', result.result, 'value', 'name', true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 初始化图片上传
         */
        initPicUpload: function () {
            var url = $.scmServerUrl + 'qinniu/upload/supply';
            var delUrl = $.scmServerUrl + 'qinniu/delete/supply';
            var downloadUrl = $.scmServerUrl + 'qinniu/download';
            var batchDownloadUrl = $.scmServerUrl + 'qinniu/urls?thumbnail=1';
            var imgShowWidth = 1200;//
            var imgShowHeight = 800;
            var rules = {
                //文的类型
                ext: ['.png,.jpg,.jpeg,.bmp', '文件类型只能为{0}'],
                //上传的最大个数
                max: [1, '文件的最大个数不能超过{0}个'],
                //文件大小的最小值,这个单位是kb
                minSize: [1, '文件的大小不能小于{0}KB'],
                //文件大小的最大值,单位也是kb
                maxSize: [3072, '文件大小不能大于3M']
            };

            /**
             * 创建营业执照上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props = {
                text: '上传',
                theme: "imageView",
                render: "#businessLicencePicUploader",
                filed: "businessLicencePic",
                downloadUrl: downloadUrl,
                url: url,
                delUrl: delUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt1 = new UploadExt(props);
            this.uploadExt1.createUploader();


            /**
             *创建组织机构代码证上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props2 = {
                text: '上传',
                theme: "imageView",
                render: "#organRegistraCodeCertificatePicUploader",
                filed: "organRegistraCodeCertificatePic",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt2 = new UploadExt(props2);
            this.uploadExt2.createUploader();

            /**
             *创建税务登记证上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props3 = {
                text: '上传',
                theme: "imageView",
                render: "#taxRegistrationCertificatePicUploader",
                filed: "taxRegistrationCertificatePic",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt3 = new UploadExt(props3);
            this.uploadExt3.createUploader();


            /**
             *创建法人身份证正面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */

            var props4 = {
                text: '上传正面',
                theme: "imageView",
                render: "#legalPersonIdCardPicUploader",
                filed: "legalPersonIdCardPic",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt4 = new UploadExt(props4);
            this.uploadExt4.createUploader();

            /**
             *创建法人身份证背面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props5 = {
                text: '上传背面',
                theme: "imageView",
                render: "#legalPersonIdCardPic2Uploader",
                filed: "legalPersonIdCardPic2",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt5 = new UploadExt(props5);
            this.uploadExt5.createUploader();

            /**
             *创建多证合一证件上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props6 = {
                text: '上传',
                theme: "imageView",
                render: "#multiCertUnionPicUploader",
                filed: "multiCertificateCombinePic",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt6 = new UploadExt(props6);
            this.uploadExt6.createUploader();


            /**
             *创建多证合一法人身份证正面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props7 = {
                text: '上传正面',
                theme: "imageView",
                render: "#legalPersonIdCardPic3Uploader",
                filed: "legalPersonIdCardPic3",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt7 = new UploadExt(props7);
            this.uploadExt7.createUploader();

            /**
             *创建多证合一法人身份证背面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props8 = {
                text: '上传背面',
                theme: "imageView",
                render: "#legalPersonIdCardPic3Uploader",
                filed: "legalPersonIdCardPic4",
                url: url,
                delUrl: delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple: false,
                rules: rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt8 = new UploadExt(props8);
            this.uploadExt8.createUploader();

        },
        /**
         * 初始化供应商分类
         */
        initSupplierCategory: function () {

            BUI.use(['bui/grid', 'bui/data', 'bui/overlay', 'bui/mask'], function (Grid, Data, Overlay) {

                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title: '分类ID', dataIndex: 'categoryId', visible: false},
                    {title: '分类编号', dataIndex: 'categoryCode', visible: false},
                    {title: '类目名称（一级-二级-三级）', dataIndex: 'categoryName', width: '70%', elCls: 'center'},
                    {
                        title: '操作', dataIndex: '', elCls: 'center', width: '30%', renderer: function (value, obj) {
                        return '<span class="grid-command btn-del">删除</span>';
                    }
                    }
                ];

                $.supplierAddApp.store = new Store({
                    url: $.scmServerUrl + "supplier/supplierCategorys",
                    proxy: {
                        method: 'get',
                        dataType: 'json' //返回数据的类型
                    },
                    autoLoad: false,
                    params: {supplierCode: this.supplierCode}
                });

                var grid = new Grid.Grid({
                    render: '#categoryGrid',
                    columns: columns,
                    loadMask: true,
                    width:'100%',
                    emptyDataTpl: '<div class="centered"><h2>无数据</h2></div>',
                    store: $.supplierAddApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    plugins: [BUI.Grid.Plugins.RowNumber] //表格插件
                });

                grid.render();

                /**
                 * 删除事件
                 */
                grid.on("cellclick", function (ev) {
                    var css = ev.domTarget.className;
                    var record = ev.record;
                    if (ev.domTarget.className == "grid-command btn-del") {
                        var flag = false;
                        //判断是否又该分类相关的品牌
                        var categoryBrands = $.supplierAddApp.brandTable.getData();
                        if (categoryBrands.length > 0) {
                            for (var i = 0; i < categoryBrands.length; i++) {
                                var status = categoryBrands[i]['status'];
                                if (record['categoryId'] == categoryBrands[i]['categoryId'] && status != "3") {
                                    flag = true;
                                    BUI.Message.Alert('类目下还存在代理品牌，请先删除代理品牌', "warning");
                                    return false;
                                    //删除分类
                                    $.supplierAddApp.store.remove(record);
                                }
                            }
                            if (!flag) {
                                //删除分类
                                $.supplierAddApp.store.remove(record);
                            }
                        } else {
                            //删除分类
                            $.supplierAddApp.store.remove(record);
                        }
                    }
                });


                var categorys;
                var dialog = new Overlay.Dialog({
                    title: '选择类目',
                    width: 800,
                    // height: 300,
                    buttons: [
                        {
                            text: '保存',
                            elCls: 'button button-primary',
                            handler: function () {
                                if (categorys) {
                                    var tmp = categorys.val();
                                    if (undefined == tmp || "" == tmp || "[]" == tmp) {
                                        BUI.Message.Alert("请选择三级类目", "warning");
                                        return false;
                                    }
                                    var _categorys = JSON.parse(tmp);
                                    addSupplierCategory(_categorys);
                                    this.close();
                                }
                            }
                        }, {
                            text: '关闭',
                            elCls: 'button',
                            handler: function () {
                                this.close();
                            }
                        }
                    ],
                    loader: {
                        url: 'supplierCategorySelect.html',
                        autoLoad: false, //不自动加载
                        callback: function (text) {
                            categorys = dialog.get('el').find('#categorys');
                            var currentCategorys = $.supplierAddApp.store.getResult();
                            var _categoryIds = "";
                            for(var i=0; i<currentCategorys.length; i++){
                                _categoryIds += currentCategorys[i]['categoryId']+",";
                            }
                            if(_categoryIds.length > 0){
                                _categoryIds = _categoryIds.substring(0, _categoryIds.length-1);
                            }
                            dialog.get('el').find('#selectCategoryIds').val(_categoryIds);
                        }
                    },
                    mask: false
                });

                $("#add_category_btn").on('click', function () {
                    dialog.get('loader').load({});
                    dialog.show();
                });


                /**
                 * 添加供应商分类
                 * @param categorys 选择的分类记录
                 */
                function addSupplierCategory(categorys) {
                    var results = $.supplierAddApp.store.getResult();
                    var msg = "";
                    for (var i = 0; i < categorys.length; i++) {
                        var categoryId = categorys[i]['categoryId'];
                        var checkResult = $.checkCategoryBrandValidStatus(categoryId, "");
                        if (checkResult[0] == true) {
                            var record = {};
                            record['categoryId'] = categoryId;
                            record['categoryCode'] = categorys[i]['categoryCode'];
                            record['categoryName'] = categorys[i]['categoryName'];
                            var flag = false;
                            for (var j = 0; j < results.length; j++) {
                                if (results[j]['categoryId'] == categoryId) {
                                    flag = true;
                                }
                            }
                            //已经添加过的不添加
                            if (!flag) {
                                $.supplierAddApp.store.add(record);
                            }
                        } else {
                            msg += checkResult[1] + "<br>";
                        }
                    }
                    if (msg != "") {
                        BUI.Message.Alert(msg, "warning");
                        return false;
                    }
                }
            });

        },
        /**
         * 处理已选品牌
         */
        handlerSelectedBrand: function () {
            var items = $.supplierAddApp.brandTable.getData();
            var brandCodes = [];
            for(var i=0;i<items.length;i++){
                brandCodes.push(items[i].categoryCode + "-" + items[i].brandCode);
            }
            $("#selCategoryBrands").val(JSON.stringify(brandCodes));
        },
        /**
         * 初始化供应商品牌
         */
        initSupplierBrand: function () {

            var proxyAptitude = {
                "brandSubdivision": "品牌方",
                "firstAgent": "一级代理",
                "secondAgent": "二级代理",
                "netGeneralAgent": "网络总代理",
                "others": "其他"
            };

            var columns = [
                {title: '品牌ID', dataIndex: 'brandId', visible: false},
                {title: '品牌CODE', dataIndex: 'brandCode', visible: false},
                {title: '所属类目ID', dataIndex: 'categoryId', visible: false},
                {title: '所属类目编码', dataIndex: 'categoryCode', visible: false},
                {title: '品牌名称', dataIndex: 'brandName', width: '10%', elCls: 'center'},
                {title: '所属类目', dataIndex: 'categoryName', width: '15%', elCls: 'center'},
                {
                    title: '<font style="color: red">*</font>代理资质',
                    dataIndex: 'proxyAptitudeId',
                    width: '18%',
                    elCls: 'center',
                    editor: {xtype: 'select', items: proxyAptitude, rules: {required: true}}
                },
                {
                    title: '<font style="color: red">*</font>资质有效期(开始)',
                    dataIndex: 'proxyAptitudeStartDate',
                    width: '15%',
                    elCls: 'center',
                    editor: {
                        xtype: 'date', rules: {required: true}, validator: function (value, obj) {
                            if (obj.proxyAptitudeEndDate && value && obj.proxyAptitudeEndDate < value) {
                                return '开始日期不能晚于截止日期！'
                            }
                        }
                    }
                },
                {
                    title: '<font style="color: red">*</font>资质有效期(截止)',
                    dataIndex: 'proxyAptitudeEndDate',
                    width: '15%',
                    elCls: 'center',
                    editor: {
                        xtype: 'date', rules: {required: true}, validator: function (value, obj) {
                            if (obj.proxyAptitudeStartDate && value && obj.proxyAptitudeStartDate > value) {
                                return '截止日期不能早于开始日期！'
                            }
                        }
                    }
                },
                {
                    title: '<font style="color: red">*</font>资质证明(最多3张)', dataIndex: 'aptitudePic', width: '17%', elCls: 'center', editor: {
                    xtype: 'upload', maxNum: 1, rules: {
                        //文的类型
                        ext: ['.png,.jpg,.jpeg,.bmp', '文件类型只能为{0}'],
                        //上传的最大个数
                        // max: [3, '文件的最大个数不能超过{0}个'],
                        //文件大小的最小值,这个单位是kb
                        minSize: [1, '文件的大小不能小于{0}KB'],
                        //文件大小的最大值,单位也是kb
                        maxSize: [3072, '文件大小不能大于3M']
                    }

                }
                },
                {hasTools: true, moveUpFlag: false, moveDownFlag: false, delFlag: true, width: '10%', elCls: 'center'}
            ];


            $.supplierAddApp.brandTable = new DynamicGrid(columns);
            var dataConfig = {
                gridId: "brandGrid",
                uploadUrl: $.scmServerUrl + 'qinniu/upload/supply',
                batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                uploadMax: 3,
            };
            $.supplierAddApp.brandTable.initData([], dataConfig);


            var categoryBrands;
            var dialog = new BUI.Overlay.Dialog({
                title: '选择品牌',
                width: 500,
                height: 400,
                buttons: [
                    {
                        text: '保存',
                        elCls: 'button button-primary',
                        handler: function () {
                            var tmp = categoryBrands.val();
                            if (undefined == tmp || "" == tmp || "[]" == tmp) {
                                BUI.Message.Alert("请选择品牌", "warning");
                                return false;
                            }
                            var data = addSupplierBrand(JSON.parse(tmp));
                            if (data.length > 0) {
                                $.supplierAddApp.brandTable.addRow(data);

                                $.supplierAddApp.handlerSelectedBrand();
                            }
                            this.close();
                        }
                    }, {
                        text: '关闭',
                        elCls: 'button button-primary',
                        handler: function () {
                            this.close();
                        }
                    }
                ],
                loader: {
                    url: 'supplierBrandSelect.html',
                    autoLoad: false, //不自动加载
                    callback: function (text) {
                        var categoryId = $.supplierAddApp.getCategoryId();
                        $("#categoryIds").val(categoryId);
                        categoryBrands = dialog.get('el').find('#categoryBrands');
                    }
                },
                mask: false
            });

            $("#add_brand_btn").on('click', function () {
                var _categroys = $.supplierAddApp.store.getResult();
                if (_categroys.length == 0) {
                    BUI.Message.Alert("请先添加供应商代理分类!", "warning");
                } else {
                    dialog.show();
                    dialog.get('loader').load({});
                }
            });


            /**
             * 添加供应商品牌
             * @param 分类品牌列表
             */
            function addSupplierBrand(categoryBrands) {
                var _categroys = $.supplierAddApp.store.getResult();
                var results = $.supplierAddApp.brandTable.getData();
                var data = [];
                var msg = "";
                for (var i = 0; i < categoryBrands.length; i++) {
                    var categoryName = "";
                    var categoryId = categoryBrands[i]['categoryId'];
                    var brandId = categoryBrands[i]['brandId'];
                    var checkResult = $.checkCategoryBrandValidStatus(categoryId, brandId);
                    if (checkResult[0] == true) {
                        var record = {};
                        record['brandId'] = brandId;
                        record['brandCode'] = categoryBrands[i]['brandCode'];
                        record['brandName'] = categoryBrands[i]['brandName'];
                        record['categoryCode'] = categoryBrands[i]['categoryCode'];
                        record['isValid'] = categoryBrands[i]['isValid'];
                        record['categoryId'] = categoryId;
                        for (var j = 0; j < _categroys.length; j++) {
                            if (categoryId == _categroys[j]['categoryId']) {
                                categoryName = _categroys[j]['categoryName'];
                                break;
                            }
                        }
                        record['categoryName'] = categoryName;
                        var flag = false;
                        for (var j = 0; j < results.length; j++) {
                            //已删除的数据不能算
                            if (results[j]['status'] != "3" &&
                                results[j]['categoryId'] == categoryBrands[i]['categoryId'] &&
                                results[j]['brandId'] == categoryBrands[i]['brandId']) {
                                flag = true;
                                break;
                            }
                        }
                        //已经添加过的不添加
                        if (!flag) {
                            data.push(record);
                        }
                    } else {
                        msg += checkResult[1] + "<br>";
                    }
                }
                if (msg != "") {
                    BUI.Message.Alert(msg, "warning");
                    return false;
                }
                return data;
            }

        },
        /**
         * 获取分类ID
         */
        getCategoryId: function () {
            var supplierCategory = $.supplierAddApp.store.getResult();
            var categoryId = "";
            for (var i = 0; i < supplierCategory.length; i++) {
                categoryId += supplierCategory[i]['categoryId'] + ",";
            }
            if (categoryId.length > 0) {
                categoryId = categoryId.substring(0, categoryId.length - 1);
            }
            return categoryId;
        },
        checkdate: function () {
        var supplierTypeCode = $('input[name="supplierTypeCode"]:checked').val();
        var certificateTypeId = $('input[name="certificateTypeId"]:checked').val();
        if (supplierTypeCode == "internalSupplier") {//国内供应商
          if (certificateTypeId == "normalThreeCertificate") {//普通三证
            var businessLicenceStartDate = $('#businessLicenceStartDate').val();
            var businessLicenceEndDate = $('#businessLicenceEndDate').val();
            if ((!businessLicenceStartDate && businessLicenceEndDate )|| (businessLicenceStartDate&&!businessLicenceEndDate)) {
              BUI.Message.Alert("请补全营业执照有效期", "warning");
              return false;
            }else if (businessLicenceStartDate > businessLicenceEndDate) {
              BUI.Message.Alert("营业执照结束日期不能小于起始日期", "warning");
              return false;
            }
            var organRegistraStartDate = $('#organRegistraStartDate').val();
            var organRegistraEndDate = $('#organRegistraEndDate').val();
            if ((!organRegistraStartDate&&organRegistraEndDate) || (organRegistraStartDate&&!organRegistraEndDate)) {
              BUI.Message.Alert("请补全组织机构代码证有效期", "warning");
              return false;
            }else if (organRegistraStartDate > organRegistraEndDate) {
              BUI.Message.Alert("组织机构代码证结束日期不能小于起始日期", "warning");
              return false;
            }
            var taxRegistrationStartDate = $('#taxRegistrationStartDate').val();
            var taxRegistrationEndDate = $('#taxRegistrationEndDate').val();
            if ((!taxRegistrationStartDate&&taxRegistrationEndDate) || (taxRegistrationStartDate&&!taxRegistrationEndDate)) {
              BUI.Message.Alert("请补全税务登记证有效期", "warning");
              return false;
            }else if (taxRegistrationStartDate > taxRegistrationEndDate) {
              BUI.Message.Alert("税务登记证结束日期不能小于起始日期", "warning");
              return false;
            }
            var idCardStartDate = $('#idCardStartDate').val();
            var idCardEndDate = $('#idCardEndDate').val();
            if ((!idCardStartDate&&idCardEndDate )|| (idCardStartDate&&!idCardEndDate)) {
              BUI.Message.Alert("请补全法人身份证有效期", "warning");
              return false;
            }else if (idCardStartDate > idCardEndDate) {
              BUI.Message.Alert("法人身份证结束日期不能小于起始日期", "warning");
              return false;
            }
          } else {

            var multiCertificateStartDate = $('#multiCertificateStartDate').val();
            var multiCertificateEndDate = $('#multiCertificateEndDate').val();
            if ((!multiCertificateStartDate&&multiCertificateEndDate) || (multiCertificateStartDate&&!multiCertificateEndDate)) {
              BUI.Message.Alert("请补全多证合一有效期", "warning");
              return false;
            }else if (multiCertificateStartDate > multiCertificateEndDate) {
              BUI.Message.Alert("多证合一结束日期不能小于起始日期", "warning");
              return false;
            }
            var idCardStartDate2 = $('#idCardStartDate2').val();
            var idCardEndDate2 = $('#idCardEndDate2').val();
            if ((!idCardStartDate2&&idCardEndDate2) || (idCardStartDate2&&!idCardEndDate2)) {
              BUI.Message.Alert("请补全法人身份证有效期", "warning");
              return false;
            }else if (idCardStartDate2 > idCardEndDate2) {
              BUI.Message.Alert("法人身份证结束日期不能小于起始日期", "warning");
              return false;
            }
          }
        }
        return true;
        },
        /**
         * 检查证件图片
         */
        checkCertificatePic: function () {
            var supplierTypeCode = $('input[name="supplierTypeCode"]:checked').val();
            var certificateTypeId = $('input[name="certificateTypeId"]:checked').val();
            if (supplierTypeCode == "internalSupplier") {//国内供应商
                if (certificateTypeId == "normalThreeCertificate") {//普通三证
                    if ($("#businessLicencePic").val() == "") {
                        BUI.Message.Alert("营业执照证件图片不能为空", "warning");
                        return false;
                    }
                    if ($("#organRegistraCodeCertificatePic").val() == "") {
                        BUI.Message.Alert("组织机构代码证证件图片不能为空", "warning");
                        return false;
                    }
                    if ($("#taxRegistrationCertificatePic").val() == "") {
                        BUI.Message.Alert("税务登记证证件图片不能为空", "warning");
                        return false;
                    }
                    if ($("#legalPersonIdCardPic").val() == "") {
                        BUI.Message.Alert("法人身份证正面图片不能为空", "warning");
                        return false;
                    }
                    if ($("#legalPersonIdCardPic2").val() == "") {
                        BUI.Message.Alert("法人身份证反面图片不能为空", "warning");
                        return false;
                    }
                } else {//三证合一
                    if ($("#multiCertificateCombinePic").val() == "") {
                        BUI.Message.Alert("多证合一证件图片不能为空", "warning");
                        return false;
                    }
                    if ($("#legalPersonIdCardPic3").val() == "") {
                        BUI.Message.Alert("法人身份证正面图片不能为空", "warning");
                        return false;
                    }
                    if ($("#legalPersonIdCardPic4").val() == "") {
                        BUI.Message.Alert("法人身份证反面图片不能为空", "warning");
                        return false;
                    }

                }

            }
            return true;
        },

        /**
         * 检查财务和售后信息
         */
        checkFinacialAfterSale: function () {
            var myform = $.supplierAddApp._form.getChild("supplierFinancial");
            myform.valid()
            if(myform.isValid() == false){
                $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(2));
                return false;
            }
            var myform2 = $.supplierAddApp._form.getChild("supplierAfterSale")
            myform2.valid()
            if(myform2.isValid() == false){
                $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(3));
                return false;
            }
            return true;
        },


        /**
         * 设置特殊字段值
         */
        setSpecialField: function (fromData) {
            var supplierTypeCode = $('input[name="supplierTypeCode"]:checked');
            if (supplierTypeCode.val() == "internalSupplier") {
                fromData['address'] = $("#address").val();
            } else {
                fromData['address'] = $("#address2").val();
            }
            var certificateTypeId = $('input[name="certificateTypeId"]:checked');
            if (certificateTypeId.val() == "normalThreeCertificate") {
                fromData['legalPersonIdCard'] = $("#legalPersonIdCard").val();
                fromData['idCardStartDate'] = $("#idCardStartDate").val();
                fromData['idCardEndDate'] = $("#idCardEndDate").val();
                fromData['legalPersonIdCardPic1'] = $("#legalPersonIdCardPic").val();
                fromData['legalPersonIdCardPic2'] = $("#legalPersonIdCardPic2").val();
            } else {
                fromData['legalPersonIdCard'] = $("#legalPersonIdCard2").val();
                fromData['idCardStartDate'] = $("#idCardStartDate2").val();
                fromData['idCardEndDate'] = $("#idCardEndDate2").val();
                fromData['legalPersonIdCardPic1'] = $("#legalPersonIdCardPic3").val();
                fromData['legalPersonIdCardPic2'] = $("#legalPersonIdCardPic4").val();
            }
        },

        /***
         * 保存供应商
         * @param fromData
         */
        save: function (fromData) {
            //检查文件上传状态
            if ($.checkUploadStatus() == true) {
                //代理类目数据处理
                var supplierCategory = $.supplierAddApp.store.getResult();
                if (supplierCategory.length == 0) {
                    BUI.Message.Alert("供应商代理分类不能为空", "warning");
                    $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(0));
                    return false;
                }
                fromData['supplierCetegory'] = JSON.stringify(supplierCategory);
                //代理品牌数据处理
                var supplierBrand = $.supplierAddApp.brandTable.getData();
                if (supplierBrand.length == 0) {
                    BUI.Message.Alert("供应商代理品牌不能为空", "warning");
                    $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(1));
                    return false;
                }
                if ($.supplierAddApp.brandTable.isValid()) {
                    fromData['supplierBrand'] = JSON.stringify(supplierBrand);
                    //供应商相关渠道数据处理
                    var channels = fromData['channel'];
                    if (undefined == channels) {
                        BUI.Message.Alert('渠道不能为空!', 'warning');
                        $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(1));
                        return false;
                    }
                    var channel = "";
                    if (channels instanceof Array) {
                        for (var i = 0; i < channels.length; i++) {
                            channel += channels[i] + ',';
                        }
                        if (channel.length > 0) {
                            channel = channel.substring(0, channel.length - 1);
                        }
                    } else {
                        channel = channels;
                    }

                    if ($.supplierAddApp.checkFinacialAfterSale()) {

                        $.supplierAddApp.setSpecialField(fromData);

                        fromData['channel'] = channel;
                        $.showLoadMask();
                        var aContent = $.AjaxContent();
                        aContent.url = $.scmServerUrl + "supplier/supplier";
                        aContent.data = fromData;
                        aContent.type = "POST";
                        aContent.success = function (result, textStatus) {
                            if (result.appcode != 1) {
                                // tip.set('title',result.databuffer);
                                // tip.show();
                                BUI.Message.Alert(result.databuffer, 'warning');
                            } else {
                                window.location.href = "supplierList.html";
                            }
                        };
                        aContent.complete = function () {
                            $.hideLoadMask();
                        };
                        $.ajax(aContent);
                    }

                } else {
                    BUI.Message.Alert('请补全代理商品牌信息!', 'warning');
                    $.supplierAddApp.tab.setSelected($.supplierAddApp.tab.getItemAt(1));
                }
            }
        }
    };
    $(document).ready(function (e) {
        $.supplierAddApp.init();
    });
    // function changeTab(clickId) {
    //     $(".tab ul li").removeClass("active")
    //
    // <li class="bui-tab-panel-item active" id="supplierCategoryLi"><a href="#supplierCategory">代理类目</a></li>
    //     <li class="bui-tab-panel-item" id="supplierBrandLi"><a href="#supplierBrand">代理品牌</a></li>
    //     <li class="bui-tab-panel-item" id="supplierFinancialLi"><a href="#supplierFinancial">财务信息</a></li>
    //     <li class="bui-tab-panel-item" id="supplierAfterSaleLi"><a href="#supplierAfterSale">售后信息</a></li>
    // }
}(jQuery));
