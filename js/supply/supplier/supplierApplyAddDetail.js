/**
 * Created by Tony-Li on 2016/3/15.
 */
(function($){
    $.supplierApplyAddDetailApp = {
        supplierCode : '',
        supplierName : '',
        _isValid : '',//是否启用
        _supplierKindCode : '',//供应商性质
        _certificateTypeId : '',//证件类型
        _channels : [],//渠道列表
        _currentChannels : [], //当前渠道列表
        _province : "",
        _city : "",
        _area : "",
        store : null,//代理分类表格数据对象
        brandTable : null,//代理品牌表格对象
        uploadExt1 : null,//营业执照文件上传对象
        uploadExt2 : null,//组织机构代码证文件上传对象
        uploadExt3 : null,//税务登记证文件上传对象
        uploadExt4 : null,//法人身份证文件上传对象
        init:function(supplierCode){
            this.resetPage();
            this.supplierCode = supplierCode;
            $("#supplierCode2").val(this.supplierCode);
            //this.querySupplierNatureList();
            this.queryCountryList();
            this.querySupplierInfo();
            this.getAddedChannels();
            setTimeout(function () {
                $.supplierApplyAddDetailApp.initChannel();
            },200);
            this.initSupplierCategory();
            this.initSupplierBrand();
            BUI.use(['bui/form','bui/tooltip','bui/uploader','bui/tab','bui/mask'],function(Form, Tooltip, Uploader, Tab){
                var form = new Form.Form({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        //validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

                var tab = new Tab.TabPanel({
                    srcNode : '#tab',
                    elCls : 'nav-tabs',
                    itemStatusCls : {
                        'selected' : 'active'
                    },
                    panelContainer : '#tabContent'//如果不指定容器的父元素，会自动生成
                });

                tab.render();


                var tip = new Tooltip.Tip({
                    align:{
                        node : '#save_btn'
                    },
                    alignType : 'top-left',
                    offset : 10,
                    triggerEvent : 'click',
                    autoHideType:'click',
                    title : '',
                    elCls : 'tips tips-warning',
                    titleTpl : '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span>\
                                <div class="tips-content" style="height: auto;width: 200px;">{title}</div>'
                });


                $("#save_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        //检查证件图片是否为空
                        var rel = $.supplierApplyAddDetailApp.checkCertificatePic();
                        if(rel){
                            $.supplierApplyAddDetailApp.save(formData, tip);
                        }
                    }
                });

                $("#btn_list").on("click",function(){
                    window.location.href="supplierList.html";
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });

                //供应商性质点击切换div
                /*$("#supplierKindCode").on("change",function(){
                    if("oneAgentSelling" == $("#supplierKindCode").val()){
                        $("#interfaceIdDiv").show();
                    }else{
                        $("#interfaceIdDiv").hide();
                    }
                });
*/
                //验证供应商名称是不是已经被使用
                $("#supplierName").on("blur",function(){
                    var supplierName = $("#supplierName").val();
                    if(supplierName == "" || supplierName == $.supplierApplyAddDetailApp.supplierName){
                        return false;
                    }
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "supplier/suppliers";
                    aContent.data = {supplierName:supplierName};
                    aContent.success = function(result,textStatus){
                        if(result.appcode != 1){
                            BUI.Message.Alert(result.databuffer, "warning");
                        }else{
                            if("" != result.result && null != result.result && [] != result.result){
                                BUI.Message.Alert("该供应商名称已经存在,请用其他名称！","warning")
                                $("#supplierName").val($.supplierApplyAddDetailApp.supplierName);
                            }
                        }
                    };
                    $.ajax(aContent);
                });

                form.getField('supplierCode').set('value', $("#supplierCode2").val());
                form.getField('supplierId').set('value', $("#id").val());
                $("#commit_btn").on("click",function(){
                    form.getField('status').set('value', "1");
                    var formData = form.serializeToObject();
                    $.supplierApplyAddDetailApp.save(formData, tip);
                });
                $("#commit_save_btn").on("click",function(){
                    form.getField('status').set('value', "0");
                    var formData = form.serializeToObject();
                    $.supplierApplyAddDetailApp.save(formData, tip);
                });
                $("#commit_btn_list").on("click",function(){
                    window.history.go(-1);
                });
            });
        },
        /**
         * 重置页面
         */
        resetPage : function () {
            $("#categoryGrid").html("");
            $("#brandGrid").html("");
            $("#businessLicencePicUploader").html("");
            $("#organRegistraCodeCertificatePicUploader").html("");
            $("#taxRegistrationCertificatePicUploader").html("");
            $("#legalPersonIdCardPicUploader").html("");
            $("#legalPersonIdCardPic2Uploader").html("");
            $("#multiCertUnionPicUploader").html("");
            $("#legalPersonIdCardPic3Uploader").html("");
        },

        /**
         * 查询供应商信息
         */
        querySupplierInfo : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/supplier/"+$.supplierApplyAddDetailApp.supplierCode;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var supplierExt = result.result;
                    var supplier = supplierExt.supplier;
                    var certificate = supplierExt.certificate;
                    var financial = supplierExt.supplierFinancialInfo;
                    var afterSale = supplierExt.supplierAfterSaleInfo;
                    var supplierChannel = supplierExt.supplierChannelRelations;
                    $.supplierApplyAddDetailApp.supplierName = supplier['supplierName'];
                    $.supplierApplyAddDetailApp._channels = supplierChannel;
                    $.supplierApplyAddDetailApp._province = supplier['province'];
                    $.supplierApplyAddDetailApp._city = supplier['city'];
                    $.supplierApplyAddDetailApp._area = supplier['area'];
                    /*if(supplier['supplierTypeCode'] == "internalSupplier"){
                        $.supplierApplyAddDetailApp.setCertificate(supplier['certificateTypeId'], certificate);
                    }*/
                    $.supplierApplyAddDetailApp.setSupplierBase(supplier);
                    $.supplierApplyAddDetailApp.setCertificate(certificate);
                    $.supplierApplyAddDetailApp.setFinancial(financial);
                    $.supplierApplyAddDetailApp.setAfterSale(afterSale);
                    $.supplierApplyAddDetailApp.hideDiv(supplier['supplierTypeCode'], supplier['certificateTypeId']);
                    //初始化上传控件
                    $.supplierApplyAddDetailApp.initPicUpload();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 隐藏div
         * @param supplierTypeCode 供应商类型编码
         * @param certificateTypeId 证件类型ID
         */
        hideDiv : function (supplierTypeCode, certificateTypeId) {
            if(supplierTypeCode == "internalSupplier"){
                $("#innerSupplier").show();
                $("#outerSupplier").hide();
            }else{
                $("#innerSupplier").hide();
                $("#outerSupplier").show();
            }
            if(certificateTypeId == "normalThreeCertificate"){
                $("#threeCertUnion").hide();
                $("#normal3Cert").show();
            }else{
                $("#threeCertUnion").show();
                $("#normal3Cert").hide();
            }
        },
        /**
         * 设置供应商基本信息
         * @param supplier
         */
        setSupplierBase : function (supplier) {
            delete supplier['channel'];//删除渠道字典内容，否则会影像渠道复选框的值为空
            $.setFormFieldValue(supplier);
            $("#supplierKindCode").val("purchase");
            $("#supplierKindCode2").val("oneAgentSelling");
            if(supplier['supplierKindCode'] == "oneAgentSelling"){//一件代发
                $("#interfaceIdDiv").show();
            }
            $.setRadioChecked("supplierKindCode", supplier['supplierKindCode']);
            $("#supplierTypeCode").val("internalSupplier");
            $("#supplierTypeCode2").val("overseasSupplier");
            $("#certificateTypeId").val("normalThreeCertificate");
            $("#certificateTypeId2").val("multiCertificateUnion");
            $("#isValid").val("1");
            $("#isValid2").val("0");
            $("#id").val(supplier['id']);
            $("#remark").val(supplier['remark']);
            var supplierTypeCode = supplier['supplierTypeCode'];
            if(supplierTypeCode == "internalSupplier"){
                $("#address").val(supplier['address']);
            }else{
                $("#address2").val(supplier['address']);
            }
            $.supplierApplyAddDetailApp._isValid = supplier['isValid'];
            $.supplierApplyAddDetailApp._supplierKindCode = supplier['supplierKindCode'];
            $.supplierApplyAddDetailApp._certificateTypeId = supplier['certificateTypeId'];
            //$.setSelectItem("supplierKindCode",supplier['supplierKindCode']);
            $.supplierApplyAddDetailApp.setSupplierType(supplier['supplierTypeCode'], supplier['certificateTypeId']);
            setTimeout(function () {
                $("#province").attr("value", supplier['province']);
                $("#city").attr("value", supplier['city']);
                $("#area").attr("value", supplier['area']);
                $.setSelectItem("country",supplier['country']);
            },200);
            $.setRadioChecked("isValid", supplier['isValid']);
        },
        /**
         * 设置供应商类型和证件类型
         * @param type 类型
         */
        setSupplierType : function (type, certificateTypeId) {
            $('input[name="supplierTypeCode"]').each(function () {
                var radio = $(this);
                var val = radio.val();
                if(val == type){
                    radio.attr("checked", "checked");
                }
            });
            $('input[name="certificateTypeId"]').each(function () {
                var radio = $(this);
                var val = radio.val();
                if(val == certificateTypeId){
                    radio.attr("checked", "checked");
                }
            });
        },
        /**
         * 设置证件信息
         * @param certificate
         */
        setCertificate : function (certificateTypeId, certificate) {
            $.setFormFieldValue(certificate);

            if(certificateTypeId == "normalThreeCertificate"){
                $("#legalPersonIdCard").val(certificate['legalPersonIdCard']);
                $("#idCardStartDate").val(certificate['idCardStartDate']);
                $("#idCardEndDate").val(certificate['idCardEndDate']);
                $("#legalPersonIdCardPic").val(certificate['legalPersonIdCardPic1']);
                $("#legalPersonIdCardPic2").val(certificate['legalPersonIdCardPic2']);
                $("#legalPersonIdCard2").val("");
                $("#idCardStartDate2").val("");
                $("#idCardEndDate2").val("");
                $("#legalPersonIdCardPic3").val("");
                $("#legalPersonIdCardPic4").val("");
            }else{
                $("#legalPersonIdCard").val("");
                $("#idCardStartDate").val("");
                $("#idCardEndDate").val("");
                $("#legalPersonIdCardPic").val("");
                $("#legalPersonIdCardPic2").val("");
                $("#legalPersonIdCard2").val(certificate['legalPersonIdCard']);
                $("#idCardStartDate2").val(certificate['idCardStartDate']);
                $("#idCardEndDate2").val(certificate['idCardEndDate']);
                $("#legalPersonIdCardPic3").val(certificate['legalPersonIdCardPic1']);
                $("#legalPersonIdCardPic4").val(certificate['legalPersonIdCardPic2']);
            }
        },
        /**
         * 设置财务信息
         * @param financial
         */
        setFinancial : function (financial) {
            $.setFormFieldValue(financial);
        },
        /**
         * 设置售后信息
         * @param afterSale
         */
        setAfterSale : function (afterSale) {
            $.setFormFieldValue(afterSale);
            $("#goodsReturnStrategy").val(afterSale['goodsReturnStrategy']);
        },

        /***
         * 初始化供应商
         */
        initChannel : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"system/channels";
            aContent.data = {};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var channels = result.result;
                    setTimeout(function () {
                        $.supplierApplyAddDetailApp.createChannelCheckBox(channels);
                    },100);
                }
            };
            $.ajax(aContent);

        },
        /**
         * 创建渠道的复选框
         * @param channels 所有可用渠道
         * @param addedChannels 已经添加的渠道
         */
        createChannelCheckBox : function (channels) {
            var addedChannels = $.supplierApplyAddDetailApp._currentChannels;
            for(var i=0; i< channels.length; i++){
                var tmp = channels[i]["id"] + "-" + channels[i]["code"];
                var flag = false;
                if(addedChannels instanceof Array){
                    for(var j=0; j<addedChannels.length; j++){
                        if(channels[i]['code'] == addedChannels[j]['channelCode']){
                            flag = true;
                            break;
                        }
                    }
                }
                var label = $('<label class="checkbox"></label>');
                var ck = $('<input name="channel" type="checkbox" value="'+tmp+'"/>');
                if(flag){
                    ck.attr("checked", "checked");
                }
                var _name = $('<span>'+channels[i]["name"]+'</span>');
                label.append(ck);
                label.append(_name);
                $("#channelDiv").append("&nbsp;");
                $("#channelDiv").append(label);
                $("#channelDiv").append("&nbsp;&nbsp;");
            }
        },
        /***
         * 查询已经添加的渠道
         */
        getAddedChannels : function () {
            var channels = "";
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/channels";
            aContent.data = {supplierCode:$.supplierApplyAddDetailApp.supplierCode};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.supplierApplyAddDetailApp._currentChannels = result.result;
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询供应商性质
         */
        querySupplierNatureList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/supplierNature";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('supplierKindCode', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 查询国家列表
         */
        queryCountryList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/country";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('country', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },
        /***
         * 初始化图片上传
         */
        initPicUpload : function () {
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
                theme:"imageView",
                render:"#businessLicencePicUploader",
                filed:"businessLicencePic",
                downloadUrl: downloadUrl,
                url:url,
                delUrl:delUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt1 = new UploadExt(props);
            this.uploadExt1.createUploader();


            /**
             *创建组织机构代码证上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props2 = {
                text: '上传',
                theme:"imageView",
                render:"#organRegistraCodeCertificatePicUploader",
                filed:"organRegistraCodeCertificatePic",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt2 = new UploadExt(props2);
            this.uploadExt2.createUploader();

            /**
             *创建税务登记证上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props3 = {
                text: '上传',
                theme:"imageView",
                render:"#taxRegistrationCertificatePicUploader",
                filed:"taxRegistrationCertificatePic",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt3 = new UploadExt(props3);
            this.uploadExt3.createUploader();


            /**
             *创建法人身份证正面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */

            var props4 = {
                text: '上传正面',
                theme:"imageView",
                render:"#legalPersonIdCardPicUploader",
                filed:"legalPersonIdCardPic",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt4 = new UploadExt(props4);
            this.uploadExt4.createUploader();

            /**
             *创建法人身份证背面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props5 = {
                text: '上传背面',
                theme:"imageView",
                render:"#legalPersonIdCardPic2Uploader",
                filed:"legalPersonIdCardPic2",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt5 = new UploadExt(props5);
            this.uploadExt5.createUploader();

            /**
             *创建多证合一证件上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props6 = {
                text: '上传',
                theme:"imageView",
                render:"#multiCertUnionPicUploader",
                filed:"multiCertificateCombinePic",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt6 = new UploadExt(props6);
            this.uploadExt6.createUploader();


            /**
             *创建多证合一法人身份证正面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props7 = {
                text: '上传正面',
                theme:"imageView",
                render:"#legalPersonIdCardPic3Uploader",
                filed:"legalPersonIdCardPic3",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt7 = new UploadExt(props7);
            this.uploadExt7.createUploader();

            /**
             *创建多证合一法人身份证背面上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props8 = {
                text: '上传背面',
                theme:"imageView",
                render:"#legalPersonIdCardPic3Uploader",
                filed:"legalPersonIdCardPic4",
                url:url,
                delUrl:delUrl,
                downloadUrl: downloadUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight,
                onlyShow:true
            };

            this.uploadExt8 = new UploadExt(props8);
            this.uploadExt8.createUploader();

        },
        /**
         * 初始化供应商分类
         */
        initSupplierCategory: function () {

            BUI.use(['bui/grid','bui/data','bui/overlay','bui/mask'],function(Grid, Data, Overlay){

                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : '分类ID',dataIndex :'categoryId', visible : false},
                    {title : '分类编号',dataIndex :'categoryCode', visible : false},
                    {title : '类目名称（一级-二级-三级）',dataIndex :'categoryName', width:'80%', elCls : 'center'}/*,
                    {title : '操作', dataIndex :'', elCls : 'center', width:'18%', renderer : function(value, obj){
                        return '<span class="grid-command btn-del">删除</span>';
                    }}*/
                ];

                $.supplierApplyAddDetailApp.store = new Store({
                    url : $.scmServerUrl + "supplier/supplierCategorys",
                    proxy : {
                        method : 'get',
                        dataType : 'json' //返回数据的类型
                    },
                    autoLoad:true,
                    params:{supplierCode: $.supplierApplyAddDetailApp.supplierCode}
                });

                var grid = new Grid.Grid({
                    render:'#categoryGrid',
                    columns : columns,
                    loadMask: true,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    store: $.supplierApplyAddDetailApp.store,
                    bbar : {
                        pagingBar:false
                    },
                    plugins: [BUI.Grid.Plugins.RowNumber] //表格插件
                });

                grid.render();

                /**
                 * 删除事件
                 */
                grid.on("cellclick",function(ev){
                    var css = ev.domTarget.className;
                    var record = ev.record;
                    if(ev.domTarget.className == "grid-command btn-del"){
                        var flag = false;
                        //判断是否又该分类相关的品牌
                        var categoryBrands = $.supplierApplyAddDetailApp.brandTable.getData();
                        if(categoryBrands.length > 0){
                            for(var i=0; i<categoryBrands.length; i++){
                                if(record['categoryId'] == categoryBrands[i]['categoryId']){
                                    flag = true;
                                    BUI.Message.Confirm('该分类相关品牌已被添加到代理品牌中,删除该分类会自动删除已添加的该分类相关的代理品牌！确定要删除改记录吗？',function(){
                                        delSupplierBrand(record, categoryBrands);
                                        //删除分类
                                        $.supplierApplyAddDetailApp.store.remove(record);
                                    },'question');
                                }
                            }
                            if(!flag){
                                //删除分类
                                $.supplierApplyAddDetailApp.store.remove(record);
                            }
                        }else{
                            //删除分类
                            $.supplierApplyAddDetailApp.store.remove(record);
                        }
                    }
                });

                /**
                 * 删除分类
                 * @param records
                 */
                function delSupplierBrand(record, categoryBrands) {
                    //删除已添加的分类相关品牌
                    for(var i=0; i<categoryBrands.length; i++){
                        if(record['categoryId'] == categoryBrands[i]['categoryId']){
                            $.supplierApplyAddDetailApp.brandTable.delRow(categoryBrands[i]);
                        }
                    }
                }


                var categorys;
                var dialog = new Overlay.Dialog({
                    title:'选择类目',
                    width:800,
                    // height:300,
                    buttons:[
                        {
                            text:'保存',
                            elCls : 'button button-primary',
                            handler : function(){
                                if(categorys){
                                    var tmp = categorys.val();
                                    if(undefined == tmp || "" == tmp || "[]" == tmp){
                                        BUI.Message.Alert("请选择三级类目", "warning");
                                        return false;
                                    }
                                    var _categorys = JSON.parse(tmp);
                                    addSupplierCategory(_categorys);
                                    this.close();
                                }
                            }
                        },{
                            text:'关闭',
                            elCls : 'button',
                            handler : function(){
                                this.close();
                            }
                        }
                    ],
                    loader : {
                        url : 'supplierCategorySelect2.html',
                        autoLoad : true, //不自动加载
                        callback : function(text){
                            categorys = dialog.get('el').find('#categorys');
                        }
                    },
                    mask:false
                });

                $("#add_category_btn").on('click', function () {
                    //dialog.get('loader').load({});
                    dialog.show();
                });


                /**
                 * 添加供应商分类
                 * @param categorys 选择的分类记录
                 */
                function addSupplierCategory(categorys) {
                    var results = $.supplierApplyAddDetailApp.store.getResult();
                    var data = [];
                    for(var i=0; i<categorys.length; i++){
                        var record = {};
                        //record['supplierCode'] = $.supplierApplyAddDetailApp.supplierCode;
                        record['categoryId'] = categorys[i]['categoryId'];
                        record['categoryCode'] = categorys[i]['categoryCode'];
                        record['categoryName'] = categorys[i]['categoryName'];
                        var flag = false;
                        for(var j=0; j<results.length; j++){
                            if(results[j]['categoryId'] == categorys[i]['categoryId']){
                                flag = true;
                            }
                        }
                        //已经添加过的不添加
                        if(!flag){
                            data.push(record);
                        }
                    }
                    $.supplierApplyAddDetailApp.store.add(data);
                }

            });

        },
        initSupplierBrand : function () {
            BUI.use(['bui/form','bui/overlay','bui/mask'],function(Form, Overlay) {
                //代理资质列表
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
                    {title: '所属类目', dataIndex: 'categoryName', width: '10%', elCls: 'center'},
                    {
                        title: '代理资质',
                        dataIndex: 'proxyAptitudeId',
                        width: '8%',
                        elCls: 'center',
                        editor: [{xtype: 'select', items: proxyAptitude, rules: "{required:true}"}]
                    },
                    {
                        title: '资质有效期(开始)',
                        dataIndex: 'proxyAptitudeStartDate',
                        width: '8%',
                        elCls: 'center',
                        editor: [{xtype: 'date', rules: "{required:true}"}]
                    },
                    {
                        title: '资质有效期(截止)',
                        dataIndex: 'proxyAptitudeEndDate',
                        width: '8%',
                        elCls: 'center',
                        editor: [{xtype: 'date', rules: "{required:true}"}]
                    },
                    {
                        title: '资质证明(最多3张)', dataIndex: 'aptitudePic', width: '12%', elCls: 'left', editor: [{
                        xtype: 'upload', maxNum: 1, rules: {
                            //文的类型
                            ext: ['.png,.jpg,.jpeg,.bmp', '文件类型只能为{0}'],
                            //上传的最大个数
                            max: [3, '文件的最大个数不能超过{0}个'],
                            //文件大小的最小值,这个单位是kb
                            minSize: [1, '文件的大小不能小于{0}KB'],
                            //文件大小的最大值,单位也是kb
                            maxSize: [1024, '文件大小不能大于1M']
                        }
                    }]
                    }
                ];

                var props = {
                    tableId: "brandTable",
                    render: "brandGrid",
                    columns: columns,
                    showLineNum: true,
                    autoLoad : true,
                    url: $.scmServerUrl + "supplier/supplierBrands?supplierCode="+$.supplierApplyAddDetailApp.supplierCode,
                    uploader: {
                        text: '上传',
                        theme:"imageView",
                        url:$.scmServerUrl + 'qinniu/upload/supply',
                        delUrl:$.scmServerUrl + 'qinniu/delete/supply',
                        downloadUrl: $.scmServerUrl + 'qinniu/download',
                        batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                        multiple : false,
                        imgShowWidth: 1200,
                        imgShowHeight: 800,
                        onlyShow:true
                    },
                    imgShowWidth: 700,
                    imgShowHeight: 500,
                    up: false,
                    down: false,
                    del: false,
                    onlyShow:false
                };
                $.supplierApplyAddDetailApp.brandTable = new DynamicTable(props);

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
                                if(undefined == tmp || "" == tmp || "[]" == tmp){
                                    BUI.Message.Alert("请选择品牌", "warning");
                                    return false;
                                }
                                var data = addSupplierBrand(JSON.parse(tmp));
                                if(data.length > 0){
                                    $.supplierApplyAddDetailApp.brandTable.addRow(data);
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
                            var categoryId = $.supplierApplyAddDetailApp.getCategoryId();
                            $("#categoryIds").val(categoryId);
                            categoryBrands = dialog.get('el').find('#categoryBrands');
                        }
                    },
                    mask: true
                });

                $("#add_brand_btn").on('click', function () {
                    var _categroys = $.supplierApplyAddDetailApp.store.getResult();
                    if(_categroys.length == 0){
                        BUI.Message.Alert("请先添加供应商代理分类!", "warning");
                    }else {
                        dialog.show();
                        dialog.get('loader').load({});
                    }
                });


                /**
                 * 添加供应商品牌
                 * @param 分类品牌列表
                 */
                function addSupplierBrand(categoryBrands) {
                    var results = $.supplierApplyAddDetailApp.brandTable.getData();
                    var _categroys = $.supplierApplyAddDetailApp.store.getResult();
                    var data = [];
                    for (var i = 0; i < categoryBrands.length; i++) {
                        var record = {};
                        record['brandId'] = categoryBrands[i]['brandId'];
                        record['brandCode'] = categoryBrands[i]['brandCode'];
                        record['brandName'] = categoryBrands[i]['brandName'];
                        record['categoryCode'] = categoryBrands[i]['categoryCode'];
                        var categoryName = "";
                        var categoryId = categoryBrands[i]['categoryId'];
                        record['categoryId'] = categoryId;
                        for(var j=0; j<_categroys.length; j++){
                            if(categoryId == _categroys[j]['categoryId']){
                                categoryName = _categroys[j]['categoryName'];
                                break;
                            }
                        }
                        record['categoryName'] = categoryName;
                        var flag = false;
                        for (var j = 0; j < results.length; j++) {
                            //已删除的数据不能算
                            if (results[j]['status'] != "3" && results[j]['brandId'] == categoryBrands[i]['brandId']) {
                                flag = true;
                                break;
                            }
                        }
                        //已经添加过的不添加
                        if (!flag) {
                            data.push(record);
                        }
                    }
                    return data;
                }

            });
        },
        /**
         * 获取分类ID
         */
        getCategoryId : function () {
            var supplierCategory = $.supplierApplyAddDetailApp.store.getResult();
            var categoryId = "";
            for(var i=0; i<supplierCategory.length; i++){
                categoryId += supplierCategory[i]['categoryId']+",";
            }
            if(categoryId.length > 0){
                categoryId = categoryId.substring(0, categoryId.length-1);
            }
            return categoryId;
        },
        /**
         * 检查证件图片
         */
        checkCertificatePic : function () {
            var supplierTypeCode = $('input[name="supplierTypeCode"]:checked').val();
            var certificateTypeId = $('input[name="certificateTypeId"]:checked').val();
            if(supplierTypeCode == "internalSupplier"){//国内供应商
                if(certificateTypeId == "normalThreeCertificate"){//普通三证
                    if($("#businessLicencePic").val() == ""){
                        BUI.Message.Alert("营业执照证件图片不能为空", "warning");
                        return false;
                    }
                    if($("#organRegistraCodeCertificatePic").val() == ""){
                        BUI.Message.Alert("组织机构代码证证件图片不能为空", "warning");
                        return false;
                    }
                    if($("#taxRegistrationCertificatePic").val() == ""){
                        BUI.Message.Alert("税务登记证证件图片不能为空", "warning");
                        return false;
                    }
                    if($("#legalPersonIdCardPic").val() == ""){
                        BUI.Message.Alert("法人身份证正面图片不能为空", "warning");
                        return false;
                    }
                    if($("#legalPersonIdCardPic2").val() == ""){
                        BUI.Message.Alert("法人身份证反面图片不能为空", "warning");
                        return false;
                    }
                }else{//三证合一
                    if($("#multiCertificateCombinePic").val() == ""){
                        BUI.Message.Alert("多证合一证件图片不能为空", "warning");
                        return false;
                    }
                    if($("#legalPersonIdCardPic3").val() == ""){
                        BUI.Message.Alert("法人身份证正面图片不能为空", "warning");
                        return false;
                    }
                    if($("#legalPersonIdCardPic4").val() == ""){
                        BUI.Message.Alert("法人身份证反面图片不能为空", "warning");
                        return false;
                    }

                }

            }
            return true;
        },
        /**
         * 设置特殊字段值
         */
        setSpecialField : function (fromData) {
            var supplierTypeCode = $('input[name="supplierTypeCode"]:checked');
            if(supplierTypeCode.val() == "internalSupplier"){
                fromData['address'] = $("#address").val();
            }else{
                fromData['address'] = $("#address2").val();
            }
            var certificateTypeId = $('input[name="certificateTypeId"]:checked');
            if(certificateTypeId.val() == "normalThreeCertificate"){
                fromData['legalPersonIdCard'] = $("#legalPersonIdCard").val();
                fromData['idCardStartDate'] = $("#idCardStartDate").val();
                fromData['idCardEndDate'] = $("#idCardEndDate").val();
                fromData['legalPersonIdCardPic1'] = $("#legalPersonIdCardPic").val();
                fromData['legalPersonIdCardPic2'] = $("#legalPersonIdCardPic2").val();
            }else{
                fromData['legalPersonIdCard'] = $("#legalPersonIdCard2").val();
                fromData['idCardStartDate'] = $("#idCardStartDate2").val();
                fromData['idCardEndDate'] = $("#idCardEndDate2").val();
                fromData['legalPersonIdCardPic1'] = $("#legalPersonIdCardPic3").val();
                fromData['legalPersonIdCardPic2'] = $("#legalPersonIdCardPic4").val();
            }
        },

        /***
         * 保存供应商申请
         * @param fromData
         */
        save:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/supplierApply";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    window.history.go(-1);
                }
            };
            $.ajax(aContent);
        }
    };
})(jQuery);
