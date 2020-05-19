/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {


    if ($.getUrlParam("isClose")) {
        $("#btn_close").html("关闭");
        $("#btn_edit").hide();
    }


    $("#btn_close").on("click", function () {
        if ($.getUrlParam("isClose")) {
            window.parent.removeTab(window.location.href);
        } else {
            window.location.href = "supplierList.html";
        }
    });


    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=Supplier&entityId=" + $.getUrlParam("id"));
    });
    if ($.getUrlParam("hideLogs")) {
        $("span[class=logs-btn]").hide();
    }

    var flag = $.getUrlParam("flag");
    if (flag == "0") {
        $("#btn_close").html("返回");
    } else {
        $("#btn_edit").hide();
        $("#btn_close").html("关闭");
    }

    $.supplierDetailApp = {
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

            BUI.use(['bui/form', 'bui/tooltip', 'bui/uploader', 'bui/tab', 'bui/mask'], function (Form, Tooltip, Uploader, Tab) {
                $.supplierDetailApp.supplierCode = $.getUrlParam("supplierCode");
                $("#supplierCode2").val(this.supplierCode);
                //this.querySupplierNatureList();
                $.supplierDetailApp.queryCountryList();
                $.supplierDetailApp.querySupplierInfo();
                $.supplierDetailApp.getAddedChannels();
                $.supplierDetailApp.initChannel();
                $.supplierDetailApp.setSupplierChannel($.supplierDetailApp._channels);
                $.supplierDetailApp.initSupplierCategory();
                $.supplierDetailApp.initSupplierBrand();
                var form = new Form.HForm({
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
                    render: '#tab',
                    elCls: 'nav-tabs',
                    autoRender: true,
                    children: [
                        {text: '代理类目', value: '1'},
                        {text: '代理品牌', value: '2'},
                        {text: '财务信息', value: '3'},
                        {text: '售后信息', value: '4'}
                    ]

                });
                tab.on('selectedchange', function (ev) {
                    $("#supplierCategory").hide();
                    $("#supplierBrand").hide();
                    $("#supplierFinancial").hide();
                    $("#supplierAfterSale").hide();
                    var item = ev.item;
                    if (item.get('value') == 1) {
                        $("#supplierCategory").show();
                    } else if (item.get('value') == 2) {
                        $("#supplierBrand").show();
                    } else if (item.get('value') == 3) {
                        $("#supplierFinancial").show();
                    } else if (item.get('value') == 4) {
                        $("#supplierAfterSale").show();
                    }

                });
                tab.setSelected(tab.getItemAt(0));

            });


            $("#btn_edit").on("click", function () {
                window.location.href = "supplierUpdate.html?supplierCode=" + $.supplierDetailApp.supplierCode;
            });

        },
        /**
         * 查询供应商信息
         */
        querySupplierInfo: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "supplier/supplier/" + $.supplierDetailApp.supplierCode;
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
                    $.supplierDetailApp._channels = supplierChannel;
                    $.supplierDetailApp._province = supplier['province'];
                    $.supplierDetailApp._city = supplier['city'];
                    $.supplierDetailApp._area = supplier['area'];


                    $.supplierDetailApp.hideDiv(supplier['supplierTypeCode'], supplier['certificateTypeId']);


                    $.setRadioChecked('isValid', supplier['isValid']);
                    $.setRadioChecked('supplierTypeCode', supplier['supplierTypeCode']);
                    $.setRadioChecked('supplierKindCode', supplier['supplierKindCode']);
                    $.setRadioChecked('certificateTypeId', supplier['certificateTypeId']);

                    $("#province").attr("value", supplier['province']);
                    $("#province").trigger("change");
                    $("#city").attr("value", supplier['city']);
                    $("#city").trigger("change");
                    $("#area").attr("value", supplier['area']);

                    $.supplierDetailApp.setSupplierBase(supplier);
                    $.supplierDetailApp.setCertificate(certificate);
                    $.supplierDetailApp.setFinancial(financial);
                    $.supplierDetailApp.setAfterSale(afterSale);

                    $.supplierDetailApp.initPicUpload();
                }
            };
            $.ajax(aContent);
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
         * 设置供应商基本信息
         * @param supplier
         */
        setSupplierBase: function (supplier) {
            delete supplier['channel'];//删除渠道字典内容，否则会影像渠道复选框的值为空
            delete supplier['isValid'];//删除渠道字典内容，否则会影像渠道复选框的值为空
            delete supplier['supplierTypeCode'];//删除渠道字典内容，否则会影像渠道复选框的值为空
            $.setFormFieldValue(supplier);
            $("#id").val(supplier['id']);
            $("#remark").val(supplier['remark']);
            $.supplierDetailApp._isValid = supplier['isValid'];
            $.supplierDetailApp._supplierKindCode = supplier['supplierKindCode'];
            $.supplierDetailApp._certificateTypeId = supplier['certificateTypeId'];
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
            setTimeout(function () {
                $.setSelectItem("country", supplier['country']);
            }, 200);
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
                        $.supplierDetailApp.createChannelCheckBox(channels);
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
            var addedChannels = $.supplierDetailApp._currentChannels;
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
                    html += '<label class="control-label checkbox" style="text-align: left; margin-left: 10px; width: auto;"><input name="channel" type="checkbox" value=' + tmp + ' checked="checked" disabled="disabled"/>' + channels[i]["name"] + '</label>';
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
            aContent.data = {supplierCode: $.supplierDetailApp.supplierCode};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.supplierDetailApp._currentChannels = result.result;
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

                $.supplierDetailApp.store = new Store({
                    url: $.scmServerUrl + "supplier/supplierCategorys",
                    proxy: {
                        method: 'get',
                        dataType: 'json' //返回数据的类型
                    },
                    autoLoad: true,
                    params: {supplierCode: $.supplierDetailApp.supplierCode}
                });

                var grid = new Grid.Grid({
                    render: '#categoryGrid',
                    columns: columns,
                    width: "100%",
                    loadMask: true,
                    emptyDataTpl: '<div class="centered"><h2>无数据</h2></div>',
                    store: $.supplierDetailApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    plugins: [BUI.Grid.Plugins.RowNumber] //表格插件
                });

                grid.render();


            });


        },
        initSupplierBrand: function () {

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
                {title: '品牌名称', dataIndex: 'brandName', width: '35%', elCls: 'center'},
                {title: '所属类目', dataIndex: 'categoryName', width: '45%', elCls: 'center'},
                {
                    title: '代理资质',
                    dataIndex: 'proxyAptitudeId',
                    width: '25%',
                    disable: true,
                    elCls: 'center',
                    renderer: BUI.Grid.Format.enumRenderer(proxyAptitude)

                }
            ];

            $.supplierDetailApp.brandTable = new DynamicGrid(columns);
            var dataConfig = {
                gridId: "brandGrid",
                uploadUrl: $.scmServerUrl + 'qinniu/upload/supply',
                uploadMax: 3,
                dataUrl: $.scmServerUrl + "supplier/supplierBrands?supplierCode=" + $.supplierDetailApp.supplierCode,
                batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                // sortName:""
            };
            $.supplierDetailApp.brandTable.initDataAjax({}, dataConfig);

        },
        /**
         * 获取分类ID
         */
        getCategoryId: function () {
            var supplierCategory = $.supplierDetailApp.store.getResult();
            var categoryId = "";
            for (var i = 0; i < supplierCategory.length; i++) {
                categoryId += supplierCategory[i]['categoryId'] + ",";
            }
            if (categoryId.length > 0) {
                categoryId = categoryId.substring(0, categoryId.length - 1);
            }
            return categoryId;
        }
    };
    $.supplierDetailApp.init();

});
