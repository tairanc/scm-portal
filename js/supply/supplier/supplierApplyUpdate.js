/**
 * Created by hzszy on 2017/5/19.
 */
$(function () {

    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=SupplierApply&operateType=0&entityId=" + $.getUrlParam("id"));
    });



    if ($.getUrlParam("btnsFlag")) {
        $("#group_btn").hide();
        $("#back_btn").html("返回");

        if ($.getUrlParam("updateAuth") == 1) {
            $("#edit_btn").show();
            $("#group_apply").hide();
        }
    }

    $.supplierApplyUpdateApp = {
        supplierCode: '',
        _isValid: '',//是否启用
        _supplierKindCode: '',//供应商性质
        _certificateTypeId: '',//证件类型
        _channels: [],//渠道列表
        _currentChannels: [], //当前渠道列表
        _province: "",
        _city: "",
        _area: "",
        store: null,//代理分类表格数据对象
        brandTable: null,//代理品牌表格对象
        uploadExt1: null,//营业执照文件上传对象
        uploadExt2: null,//组织机构代码证文件上传对象
        uploadExt3: null,//税务登记证文件上传对象
        uploadExt4: null,//法人身份证文件上传对象
        init: function () {
            this.supplierCode = $.getUrlParam("supplierCode");
            $("#supplierCode2").val(this.supplierCode);
            //this.querySupplierNatureList();
            $.supplierApplyUpdateApp.queryCountryList();
            this.querySupplierInfo();
            this.getAddedChannels();
            this.initChannel();
            this.fileForm($.getUrlParam("id"));
            $.supplierApplyUpdateApp.setSupplierChannel($.supplierApplyUpdateApp._channels);
            this.initSupplierCategory();
            this.initSupplierBrand();
            BUI.use(['bui/form', 'bui/tooltip', 'bui/uploader', 'bui/tab', 'bui/mask'], function (Form, Tooltip, Uploader, Tab) {
                var form = new Form.Form({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();
                // var tab = new Tab.TabPanel({
                //     srcNode: '#tab',
                //     elCls: 'nav-tabs',
                //     itemStatusCls: {
                //         'selected': 'active'
                //     },
                //     panelContainer: '#tabContent'//如果不指定容器的父元素，会自动生成
                // });
                //
                // tab.render();
                var tab = new Tab.Tab({
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
                tab.on('selectedchange',function (ev) {
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
                tab.setSelected(tab.getItemAt(0));


                var tip = new Tooltip.Tip({
                    align: {
                        node: '#commit_save_btn'
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


                $("#commit_btn").on("click", function () {
                    form.getField('status').set('value', "1");
                    var formData = form.serializeToObject();
                    $.showLoadMask()
                    $.supplierApplyUpdateApp.update(formData, tip);
                });
                $("#commit_save_btn").on("click", function () {
                    form.getField('status').set('value', "0");
                    var formData = form.serializeToObject();
                    $.showLoadMask()
                    $.supplierApplyUpdateApp.update(formData, tip);
                });
                $("#back_btn").on("click", function () {
                    window.location.href = "supplierApplyList.html";
                });
                $("#edit_btn").on("click", function () {
                    $(this).hide();
                    $("#group_btn").show();
                    $("#group_apply").show();
                    $("#back_btn").html("取消");
                });
            });

        },
        /**
         * 隐藏div
         * @param supplierTypeCode 供应商类型编码
         * @param certificateTypeId 证件类型ID
         */
        hideDiv: function (supplierTypeCode, certificateTypeId) {
            if (supplierTypeCode == "internalSupplier") {
                $("#innerSupplier").show();
                $("#outerSupplier").hide();
            } else {
                $("#innerSupplier").hide();
                $("#outerSupplier").show();
            }
            if (certificateTypeId == "normalThreeCertificate") {
                $("#threeCertUnion").hide();
                $("#normal3Cert").show();
            } else {
                $("#threeCertUnion").show();
                $("#normal3Cert").hide();
            }
        },
        /**
         * 查询供应商信息
         */
        querySupplierInfo: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "supplier/supplier/" + $.supplierApplyUpdateApp.supplierCode;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var supplierExt = result.result;
                    var supplier = supplierExt.supplier;
                    var certificate = supplierExt.certificate;
                    var financial = supplierExt.supplierFinancialInfo;
                    var afterSale = supplierExt.supplierAfterSaleInfo;
                    var supplierChannel = supplierExt.supplierChannelRelations;
                    $.supplierApplyUpdateApp._channels = supplierChannel;
                    $.supplierApplyUpdateApp._province = supplier['province'];
                    $.supplierApplyUpdateApp._city = supplier['city'];
                    $.supplierApplyUpdateApp._area = supplier['area'];
                    $.supplierApplyUpdateApp.setSupplierBase(supplier);
                    $.supplierApplyUpdateApp.setCertificate(certificate);
                    $.supplierApplyUpdateApp.setFinancial(financial);
                    $.supplierApplyUpdateApp.setAfterSale(afterSale);
                    $.supplierApplyUpdateApp.hideDiv(supplier['supplierTypeCode'], supplier['certificateTypeId']);
                    $.supplierApplyUpdateApp.initPicUpload();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 设置供应商基本信息
         * @param supplier
         */
        setSupplierBase: function (supplier) {
            delete supplier['channel'];//删除渠道字典内容，否则会影像渠道复选框的值为空
            $.setFormFieldValue(supplier);
            $("#supplierKindCode").val("purchase");
            $("#supplierKindCode2").val("oneAgentSelling");
            if (supplier['supplierKindCode'] == "oneAgentSelling") {//一件代发
                $("#interfaceIdDiv").show();
                $(".certCls").each(
                    function () {
                        $(this).hide();
                    }
                );
            }else{
                $("#interfaceIdDiv").hide();
                $(".certCls").each(
                    function () {
                        $(this).show();
                    }
                );
            }
            $("#supplierTypeCode").val("internalSupplier");
            $("#supplierTypeCode2").val("overseasSupplier");
            $("#certificateTypeId").val("normalThreeCertificate");
            $("#certificateTypeId2").val("multiCertificateUnion");
            $("#isValid").val("1");
            $("#isValid2").val("0");
            $.supplierApplyUpdateApp._isValid = supplier['isValid'];
            $.supplierApplyUpdateApp._supplierKindCode = supplier['supplierKindCode'];
            $.supplierApplyUpdateApp._certificateTypeId = supplier['certificateTypeId'];
            $("#province").attr("value", supplier['province']);
            $("#city").attr("value", supplier['city']);
            $("#area").attr("value", supplier['area']);
            $("#remark").val(supplier['remark']);
            $.setSelectItem("country", supplier['country']);
            $.setRadioChecked("supplierKindCode", supplier['supplierKindCode']);
            $.setRadioChecked("certificateTypeId", supplier['certificateTypeId']);
            $.setRadioChecked("supplierTypeCode", supplier['supplierTypeCode']);
            $.setRadioChecked("isValid", supplier['isValid']);
        },
        /**
         * 设置证件信息
         * @param certificate
         */
        setCertificate: function (certificate) {
            $.setFormFieldValue(certificate);
        },
        /**
         * 设置财务信息
         * @param financial
         */
        setFinancial: function (financial) {
            $.setFormFieldValue(financial);
        },
        /**
         * 设置售后信息
         * @param afterSale
         */
        setAfterSale: function (afterSale) {
            $.setFormFieldValue(afterSale);
            $("#goodsReturnStrategy").val(afterSale['goodsReturnStrategy']);
        },
        /**
         * 设置渠道信息
         * @param supplierChannel
         */
        setSupplierChannel: function (supplierChannel) {
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
                    var channels = result.result;
                    setTimeout(function () {
                        $.supplierApplyUpdateApp.createChannelCheckBox(channels);
                    }, 200);

                }
            };
            $.ajax(aContent);

        },
        /**
         * 创建渠道的复选框
         * @param channels 所有可用渠道
         * @param addedChannels 已经添加的渠道
         */
        createChannelCheckBox: function (channels) {
            var addedChannels = $.supplierApplyUpdateApp._currentChannels;
            var html = "";
            for (var i = 0; i < channels.length; i++) {
                var tmp = channels[i]["id"] + "-" + channels[i]["code"];
                var flag = false;
                if (addedChannels instanceof Array) {
                    for (var j = 0; j < addedChannels.length; j++) {
                        if (channels[i]['code'] == addedChannels[j]['channelCode']) {
                            flag = true;
                            break;
                        }
                    }
                }
                if (flag) {
                    html += '<label class="checkbox"><input name="channel" type="checkbox" value=' + tmp + ' checked="checked" disabled="disabled"/>' + channels[i]["name"] + '</label>&nbsp;&nbsp;&nbsp;';
                } else {
                    html += '<label class="checkbox"><input name="channel" type="checkbox" value=' + tmp + ' disabled="disabled"/>' + channels[i]["name"] + '</label>&nbsp;&nbsp;&nbsp;';
                }

            }
            $("#channelDiv").html(html);
        }
        ,
        /***
         * 查询已经添加的供应商
         */
        getAddedChannels: function () {
            var channels = "";
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "supplier/channels";
            aContent.data = {supplierCode: $.supplierApplyUpdateApp.supplierCode};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.supplierApplyUpdateApp._currentChannels = result.result;
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询供应商性质
         */
        querySupplierNatureList: function () {
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
        },
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
                maxSize: [1024, '文件大小不能大于1M']
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                imgShowHeight: imgShowHeight,
                onlyShow: true
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
                    {title: '类目名称（一级-二级-三级）', dataIndex: 'categoryName', width: '80%', elCls: 'center'}
                ];

                $.supplierApplyUpdateApp.store = new Store({
                    url: $.scmServerUrl + "supplier/supplierCategorys",
                    proxy: {
                        method: 'get',
                        dataType: 'json' //返回数据的类型
                    },
                    autoLoad: true,
                    params: {supplierCode: $.supplierApplyUpdateApp.supplierCode}
                });

                var grid = new Grid.Grid({
                    render: '#categoryGrid',
                    columns: columns,
                    loadMask: true,
                    emptyDataTpl: '<div class="centered"><h2>无数据</h2></div>',
                    store: $.supplierApplyUpdateApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    plugins: [BUI.Grid.Plugins.RowNumber] //表格插件
                });

                grid.render();


            });


        },
        initSupplierBrand: function () {
            BUI.use(['bui/form', 'bui/overlay', 'bui/mask'], function (Form, Overlay) {
                //代理资质列表
                var proxyAptitude = {
                    "brandSubdivision": "品牌方",
                    "firstAgent": "一级代理",
                    "secondAgent": "二级代理",
                    "netGeneralAgent": "网络总代理",
                    "others": "其他"
                };

                var columns = [
                    {title: 'ID', dataIndex: 'id', visible: false},
                    {title: '品牌ID', dataIndex: 'brandId', visible: false},
                    {title: '品牌CODE', dataIndex: 'brandCode', visible: false},
                    {title: '所属类目ID', dataIndex: 'categoryId', visible: false},
                    {title: '状态', dataIndex: 'isValid', visible: false},
                    {title: '所属类目编码', dataIndex: 'categoryCode', visible: false},
                    {title: '品牌名称', dataIndex: 'brandName', width: '10%', elCls: 'center'},
                    {title: '所属类目', dataIndex: 'categoryName', width: '20%', elCls: 'center'},
                    {
                        title: '<font style="color: red">*</font>代理资质',
                        dataIndex: 'proxyAptitudeId',
                        width: '20%',
                        elCls: 'center',
                        renderer : function(val){
                            return '<span>'+proxyAptitude[val]+'</span>';
                        }
                    },
                    {
                        title: '<font style="color: red">*</font>资质有效期(开始)',
                        dataIndex: 'proxyAptitudeStartDate',
                        width: '15%',
                        elCls: 'center',
                        renderer : function(val){
                            return '<span>'+$.timestampToDateStr(val)+'</span>';
                        }
                    },
                    {
                        title: '<font style="color: red">*</font>资质有效期(截止)',
                        dataIndex: 'proxyAptitudeEndDate',
                        width: '15%',
                        elCls: 'center',
                        renderer : function(val){
                            return '<span>'+$.timestampToDateStr(val)+'</span>';
                        }
                    },
                    {
                        title: '<font style="color: red">*</font>资质证明(最多3张)', dataIndex: 'aptitudePic', width: '17%', elCls: 'center', editor: {
                        xtype: 'upload',
                        maxNum: 1,
                        rules: {
                            required: true,
                            //文的类型
                            ext: ['.png,.jpg,.jpeg,.bmp', '文件类型只能为{0}'],
                            //上传的最大个数
                            // max: [3, '文件的最大个数不能超过{0}个'],
                            //文件大小的最小值,这个单位是kb
                            minSize: [1, '文件的大小不能小于{0}KB'],
                            //文件大小的最大值,单位也是kb
                            maxSize: [1024, '文件大小不能大于1M']
                        }
                    }
                    }
                ];

                $.supplierApplyUpdateApp.brandTable = new DynamicGrid(columns);
                var dataConfig = {
                    gridId: "brandGrid",
                    uploadUrl: $.scmServerUrl + 'qinniu/upload/supply',
                    uploadMax: 0,
                    dataUrl: $.scmServerUrl + "supplier/supplierBrands?supplierCode=" + $.supplierApplyUpdateApp.supplierCode,
                    batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                    // sortName:""
                };
                $.supplierApplyUpdateApp.brandTable.initDataAjax({}, dataConfig);


                var categoryBrands;
                var dialog = new Overlay.Dialog({
                    title: '选择商品',
                    width: 300,
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
                                    $.supplierApplyUpdateApp.brandTable.addRow(data);
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
                        url: 'supplierBrandSelect2.html',
                        autoLoad: false, //自动加载
                        callback: function (text) {
                            var categoryId = $.supplierApplyUpdateApp.getCategoryId();
                            $("#categoryIds").val(categoryId);
                            categoryBrands = dialog.get('el').find('#categoryBrands');
                        }
                    },
                    mask: true
                });

                $("#add_brand_btn").on('click', function () {
                    var _categroys = $.supplierApplyUpdateApp.store.getResult();
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
                    var _categroys = $.supplierApplyUpdateApp.store.getResult();
                    var results = $.supplierApplyUpdateApp.brandTable.getData();
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

            });
        },
        /**
         * 获取分类ID
         */
        getCategoryId: function () {
            var supplierCategory = $.supplierApplyUpdateApp.store.getResult();
            var categoryId = "";
            for (var i = 0; i < supplierCategory.length; i++) {
                categoryId += supplierCategory[i]['categoryId'] + ",";
            }
            if (categoryId.length > 0) {
                categoryId = categoryId.substring(0, categoryId.length - 1);
            }
            return categoryId;
        },

        /***
         * 填充表单
         * @param id zhujianID
         */
        fileForm: function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "supplier/supplierApply/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    alert("查询供应商申请信息失败." + result.databuffer)
                } else {
                    var brandDtl = result.result;
                    $("#description").val(brandDtl.description);
                    $("#supplierApplyId").val(brandDtl.id);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 保存供应商申请
         * @param fromData
         */
        update: function (fromData, tip) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "supplier/supplierApply/" + fromData['supplierApplyId'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                $.hideLoadMask()
                if (result.appcode != 1) {
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "supplierApplyList.html";
                    //window.history.go(-1);
                }
            };
            aContent.error =function(XMLHttpRequest){
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
                } else if (XMLHttpRequest.status == 403) {
                    if (result.appcode == 0) {
                        if (window.location.origin.indexOf('tairanmall.com') != -1) {
                            var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                            window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                        } else {
                            window.location.href = '/supply/login.html';
                        }
                    }
                } else if (XMLHttpRequest.status == 404) {
                    window.top.location = "/supply/404.html";
                } else if (XMLHttpRequest.status == 500) {
                    window.top.location = "/supply/500.html";
                } else {
                    if (result.appcode == 0) {                        
                        BUI.Message.Alert(result.databuffer || "", 'error');
                        $.hideLoadMask();
                    }
                }
            }
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.supplierApplyUpdateApp.init();
    });
}(jQuery));
