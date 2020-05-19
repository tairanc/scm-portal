/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {
    var errMsg;
    var sucMsg;
    $("span[class=logs-btn]").click(function () {
        $.showLogsDialog("logInfoPage?entityType=Items&entityId=" + $.getUrlParam("id"));
    });

    $.goodsUpdateApp = {
        NATURE_PROPERTY: 'natureProperty',//自然属性
        PURCHASE_PROPERTY: 'purchaseProperty',//采购属性
        _checkbox_css: 'checked',//复选框选中时的样式
        _naturePropertys: [],//所有自然属性
        _naturePropertyValues: [],//所有自然属性值
        _purchasPropertys: [],//所有采购属性
        _purchasPropertyValues: [],//所有采购属性值
        _allPropertyValues: [],//所有的属性值
        _checkedPropertys: [],//已经选中的采购属性
        _normIds: [], //已经选择的sku规格id
        _normNames: [], //已经选择的sku规格名称
        _skuPropertyNames: [], //已经选择的sku属性名称
        _normIds2: [], //已经选择的sku规格id
        _normNames2: [], //已经选择的sku规格名称
        _skuPropertyNames2: [], //已经选择的sku属性名称
        _currentCategoryId: "", //当前分类ID
        _currentCategoryValid: "", //当前分类启停用状态
        _currentBrandId: "", //当前品牌ID
        _currentBrandName: "", //当前品牌名称
        _currentBrandValid: "", //当前品牌启停用状态
        _currentNaturePropertys: [],//当前自然属性
        _currentPurchasePropertys: [],//当前采购属性
        _stopedNaturePropertys: [],//停用的自然属性
        _stopedPurchasePropertys: [],//停用的采购属性
        skuTable: null,
        spuCode: "",//商品sup编码
        init: function () {
            this.initPicUpload();
            this.spuCode = $.getUrlParam("spuCode");

            this.initGoodsCategory();
            this.queryTradeType();
            this.initSkuTable();
            this.queryItemsInfo(this.spuCode);
            BUI.use(['bui/form', 'bui/tooltip', 'bui/uploader', 'bui/mask'], function (Form, Tooltip, Uploader) {
                var form = new Form.Form({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();

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

                $(".bui-grid-body").css("overflow-y","auto");
                $("#save_btn").on("click", function () {
                    if($.goodsUpdateApp.checkPropetyStatus()){
                        var formData = form.serializeToObject();                                            
                        form.valid();
                            if($('#isQualityTrue').attr('checked')){
                                formData.isQuality =1;
                                var qualityDay = $("#qualityDay").val();
                                if(qualityDay==""){
                                    BUI.Message.Alert("请填写保质期天数！", "warning");
                                }else{
                                    if(form.isValid()){
                                        try {
                                            $.goodsUpdateApp.checkNaturePropertyValid(formData, tip);
                                        } catch (e) {
            
                                        }
                                    }                                
                                }
                            }else{
                                $("#qualityDay").val("1"); 
                                formData.isQuality =0;
                                formData.qualityDay="";
                                if(form.isValid()){
                                    try {
                                        $.goodsUpdateApp.checkNaturePropertyValid(formData, tip);
                                    } catch (e) {
        
                                    }
                                }                                
                            }                       
                    }
                });

                $("#btn_list").on("click", function () {
                    window.location.href = "goodsList.html";
                });

                $("#reset_btn").on("click", function () {
                    form.clearErrors(true, true);
                });

                $('input[name="isQuality"]').on("change", function () {
                    if($('#isQualityTrue').attr('checked')){                        
                        $("#qualityDayDiv").show();                       
                        $("#qualityDay").blur(function(){
                            if($("#qualityDay").val()==''){
                                $("#errorShow").show();
                            }else{
                                $("#errorShow").hide(); 
                            }
                        });
                    }else if($('#isQualityFalse').attr('checked')) {
                        $("#qualityDayDiv").hide();
                        $("#errorShow").hide();
                    }
                });

            });
        },
        /**
         * 查询当前分类信息
         * @param categoryId
         */
        queryCurrentCategoryInfo: function (categoryId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/categorys";
            aContent.data = {id: categoryId};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var categorys = result.result;
                    if (categorys.length > 0) {
                        $.goodsUpdateApp._currentCategoryValid = categorys[0]['isValid'];
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询商品信息
         * @param spuCode 商品SPU编码
         */
        queryItemsInfo: function (spuCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "goods/goods/spuCode/" + spuCode;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    $.goodsUpdateApp.fillForm(result.result);
                }
            };
            $.ajax(aContent);
        },
        /*初始化图片上传*/
        initPicUpload : function () {
            var url = $.scmServerUrl + 'qinniu/upload/brand';
            var delUrl = $.scmServerUrl + 'qinniu/delete/brand';
            var downloadUrl = $.scmServerUrl + 'qinniu/download';
            var batchDownloadUrl = $.scmServerUrl + 'qinniu/urls?thumbnail=1';
            var imgShowWidth = 1200;//
            var imgShowHeight = 800;
            var rules = {
                //文的类型
                ext: ['.png,.jpg,.bmp,.jpeg','文件类型只能为{0}'],
                //上传的最大个数
                max: [5, '文件的最大个数不能超过{0}个'],
                //文件大小的最小值,这个单位是kb
                minSize: [1, '文件的大小不能小于{0}KB'],
                //文件大小的最大值,单位也是kb
                maxSize: [3072, '文件大小不能大于3M']
            };

            var props = {
                text: '上传',
                theme:"imageView",
                render:"#mainPicUploader",
                filed:"mainPicture",
                downloadUrl: downloadUrl,
                url:url,
                delUrl:delUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                maxNum:5,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt1 = new UploadExt(props);
            this.uploadExt1.createUploader();

        },

        /**
         * 填充表单
         */
        fillForm: function (itemsExt) {
            //商品基础信息
            var items = itemsExt.items;
            this.setItems(items);
            //商品自然属性信息
            $.goodsUpdateApp._currentNaturePropertys = itemsExt.itemNatureProperys;
            //商品采购属性信息
            $.goodsUpdateApp._currentPurchasePropertys = itemsExt.itemSalesProperies;
            //商品SKU信息
            var skus = itemsExt.skus;
            $.goodsUpdateApp.setNatureProperty($.goodsUpdateApp._currentNaturePropertys);
            $.goodsUpdateApp.setSaleProperty($.goodsUpdateApp._currentPurchasePropertys);
            $.goodsUpdateApp.setSkus(skus);
        },
        /**
         * 设置商品基础信息
         * @param items
         */
        setItems: function (items) {
            $.setFormFieldValue(items);
            $.setSelectItem("tradeType", items['tradeType']);//贸易类型
            $("#remark").val(items['remark']);
            $("#id").val(items['id']);
            if(items['isQuality']=="1"){
                $("#qualityDayDiv").show();
                $("#isQualityFalse").removeAttr("checked");
                $("#isQualityTrue").attr("checked", "checked");
                $("#qualityDay").val(items['qualityDay'])
            }else{
                $("#qualityDay").val("");
                $("#qualityDayDiv").hide();
                $("#isQualityTrue").removeAttr("checked");
                $("#isQualityFalse").attr("checked", "checked");
            }
            $.goodsUpdateApp._currentCategoryId = items['categoryId'];
            $.goodsUpdateApp._currentBrandId = items['brandId'];
            //设置分类
            var select = $('#categoryId');
            var option = $('<option value="' + items["categoryId"] + '" selected="true">' + items["categoryName"] + '</option' + '>');
            select.append(option);
            //查询当前分类信息
            this.queryCurrentCategoryInfo(items["categoryId"]);
            //查询当前品牌信息
            this.queryCurrentBrand(items["brandId"]);
            //设置品牌
            this.queryBrand(items["categoryId"], items["brandId"]);            
            //查询分类相关属性
            $.goodsUpdateApp.queryCategoryProperty(items["categoryId"]);
        },
        /**
         * 设置商品自然属性
         * @param itemNatureProperys
         */
        setNatureProperty: function (itemNatureProperys) {
            $('.naturePropertySelect ').find("option").each(function () {
                var opt = $(this);
                var propertyId = opt.attr("propertyId");
                var propertyValueId = opt.val();
                for (var i = 0; i < itemNatureProperys.length; i++) {
                    if (propertyId == itemNatureProperys[i]['propertyId'] &&
                        propertyValueId == itemNatureProperys[i]['propertyValueId']) {
                        opt.attr("selected", true);
                    }
                }
            })
            this.delUnusedNatureProperty();
        },
        /**
         * 删除没有用到的停用的商品自然属性
         * @param itemNatureProperys
         */
        delUnusedNatureProperty: function () {
            var selName = "naturePropery";
            $('select[name="' + selName + '"]').each(function () {
                var sel = $(this);
                //首先删除已经停用的选项
                sel.find('option').each(function () {
                    var _opt = $(this);
                    var selected = _opt.attr("selected");
                    var isValid = _opt.attr("isValid");
                    if (selected != "selected" && isValid == "0") {
                        _opt.remove();
                    }
                });
                //然后，删除已经被停用，但是还未被使用过的属性
                var isValid = sel.attr("isValid");
                var selVal = sel.val();
                if(isValid == "0" && selVal == ""){
                    sel.parent().parent().parent().remove();
                }

            })
        },
        /**
         * 设置商品采购属性
         * @param itemNatureProperys
         */
        setSaleProperty: function (itemSalesProperies) {
            var ckName = "purchasePropery";
            $('input[name="' + ckName + '"]').each(function () {
                var ck = $(this);
                var propertyId = ck.attr("propertyId");
                var propertyValueId = ck.val();
                for (var i = 0; i < itemSalesProperies.length; i++) {
                    if (propertyId == itemSalesProperies[i]['propertyId'] &&
                        propertyValueId == itemSalesProperies[i]['propertyValueId']) {
                        ck.attr("checked", "checked");
                        ck.attr("disabled", "disabled");
                        ck.addClass($.goodsUpdateApp._checkbox_css);
                    }
                }
            })
            //this.delUnusedSaleProperty();
        },
        /**
         * 删除没有用到的停用的商品采购属性
         * @param itemNatureProperys
         */
        delUnusedSaleProperty: function () {
            var ckName = "purchasePropery";
            $('input[name="' + ckName + '"]').each(function () {
                var ck = $(this);
                var isValid = ck.attr("isValid");
                if (undefined == ck.attr("checked") && isValid == "0") {
                    ck.parent().remove();
                }

            })
        },
        /**
         * 设置skus信息
         * @param skus
         */
        setSkus: function (skus) {
            var data = [];
            for (var i = 0; i < skus.length; i++) {
                var propertyValueId = skus[i]['propertyValueId'];//属性值ID,多个用逗号分隔
                var propertyValue = skus[i]['propertyValue'];//属性值名称,多个用逗号分隔
                var normName = this.getNormName(propertyValueId, propertyValue);//规格名称
                var record = {
                    skuCode: skus[i]['skuCode'],
                    propertyValueId: propertyValueId,
                    propertyValue: propertyValue,
                    normName: normName,
                    barCode: skus[i]['barCode'],//条形码
                    skuName: skus[i]['skuName'],
                    marketPrice2: skus[i]['marketPrice2'],//市场价
                    weight2: skus[i]['weight2'],//重量
                    picture: skus[i]['picture'],//图片
                    isValid: skus[i]['isValid']//状态
                };
                // $.goodsUpdateApp.skuTable.addRow(record, "0");
                data.push(record);
                $.goodsUpdateApp._normIds.push(propertyValueId);
            }

            var dataConfig = {
                gridId: "skuGrid",
                // formId: "J_Form",
                uploadUrl: $.scmServerUrl + 'qinniu/upload/goods',
                batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                uploadMax: 3,
                // uploadId:""
                // sortName:""
            };
            $.goodsUpdateApp.skuTable.initData(data, dataConfig);

            $.goodsUpdateApp._normIds2 = $.goodsUpdateApp._normIds;
        },
        /**
         * 获取sku规格名称
         * @param propertyValue 属性值名称,多个用逗号分隔
         */
        getNormName: function (propertyValueId, propertyValue) {
            var _name = "";
            var _purchasPropertyValues = $.goodsUpdateApp._purchasPropertyValues;
            var _purchasProperty = $.goodsUpdateApp._purchasPropertys;
            if (propertyValueId.length > 0) {
                var _tmp = propertyValueId.split(",");
                var _tmp2 = propertyValue.split(",");
                for (var i = 0; i < _tmp.length; i++) {
                    var _propertyName = "";
                    for (var k = 0; k < _purchasPropertyValues.length; k++) {
                        if (_tmp[i] == _purchasPropertyValues[k]['id']) {
                            for (var j = 0; j < _purchasProperty.length; j++) {
                                if (_purchasPropertyValues[k]['propertyId'] == _purchasProperty[j]['propertyId']) {
                                    _propertyName = _purchasProperty[j]['name'];
                                    break;
                                }
                            }
                        }
                    }
                    if (_propertyName == "") {
                        var _stopedPurchasePropertys = $.goodsUpdateApp._stopedPurchasePropertys;//停用的采购属性
                        var _allPropertyValues = $.goodsUpdateApp._allPropertyValues;//所有的属性值
                        for (var k = 0; k < _allPropertyValues.length; k++) {
                            if (_tmp[i] == _allPropertyValues[k]['id']) {
                                for (var j = 0; j < _allPropertyValues.length; j++) {
                                    if (_allPropertyValues[k]['propertyId'] == _stopedPurchasePropertys[j]['propertyId']) {
                                        _propertyName = _stopedPurchasePropertys[j]['name'];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    _name += _propertyName + ":" + _tmp2[i] + " | ";
                }
                _name = _name.substring(0, _name.length - 2) + " ";
                $.goodsUpdateApp._normNames.push(propertyValue);
                $.goodsUpdateApp._skuPropertyNames.push(_name);
            }
            return _name;
        },
        /**
         * 初始化商品分类
         */
        initGoodsCategory: function () {

            BUI.use(['bui/overlay', 'bui/mask'], function (Overlay) {

                var categorys;
                var dialog = new Overlay.Dialog({
                    title: '选择类目',
                    width: 800,
                    // height:300,
                    buttons: [
                        {
                            text: '确定',
                            elCls: 'button button-primary',
                            handler: function () {
                                if (categorys) {
                                    $.goodsUpdateApp.resetForm();
                                    var tmp = categorys.val();
                                    if (undefined == tmp || "" == tmp || "[]" == tmp) {
                                        BUI.Message.Alert("请选择三级类目", "warning");
                                        return false;
                                    }
                                    var _categorys = JSON.parse(tmp);
                                    var select = $('#categoryId');
                                    var option = $('<option value="' + _categorys[0]["categoryId"] + '" selected="true">' + _categorys[0]["categoryName"] + '</option' + '>');
                                    select.append(option);
                                    //删除错误校验
                                    select.parent().find(".x-field-error").remove();
                                    3
                                    var categoryId = _categorys[0]["categoryId"];
                                    //查询分类相关商品
                                    $.goodsUpdateApp.queryBrand(categoryId);
                                    $("#brandId").removeAttr("disabled");                        
                                    $("#brandId").chosen();
                                    //查询分类相关属性
                                    $.goodsUpdateApp.queryCategoryProperty(categoryId);
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
                        url: 'goodsCategorySelect.html',
                        autoLoad: false, //不自动加载
                        callback: function (text) {
                            categorys = dialog.get('el').find('#categorys');
                        }
                    },
                    mask: true
                });

                $("#categoryId").on('click', function () {
                    $("#brandId").attr("disabled", "disabled");
                    dialog.get('loader').load({categoryId: $.goodsUpdateApp._currentCategoryId});
                    dialog.show();
                });


            });

        },
        /**
         * 重置表单
         */
        resetForm: function () {
            $('#categoryId').html("");
            $('#naturePropertys').html("");
            $('#purchasePropertys').html("");
        },
        /**
         * 品牌查询
         */
        queryBrand: function (categoryId, brandId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/categoryBrands";
            aContent.data = {isValid: "1", categoryId: categoryId};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var data = result.result;
                    var items = [];
                    var flag = false;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i]['isValid'] == "1") {
                            items.push(data[i]);
                            if(flag == false && $.goodsUpdateApp._currentBrandId == data[i]['brandId']){
                                flag = true;
                            }
                        }
                    }
                    if(flag == false){
                        var record = {
                            brandId: $.goodsUpdateApp._currentBrandId,
                            brandName: $.goodsUpdateApp._currentBrandName
                        };
                        items.push(record);
                    }                    
                    $.AddItem2("brandId", items, 'brandId', 'brandName','全部品牌',[]);      
                    $("#brandId").chosen();  
                    $("#brandId").find("option[value=" + $.goodsUpdateApp._currentBrandId + "]").attr("selected", true);  
                    $('#brandId').trigger('chosen:updated');

                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询当前品牌信息
         */
        queryCurrentBrand: function (brandId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/brand/" + brandId;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var brand = result.result;
                    $.goodsUpdateApp._currentBrandName = brand.name;
                    $.goodsUpdateApp._currentBrandValid = brand.isValid;
                }
            };
            $.ajax(aContent);
        },
        /**
         * 贸易类型查询
         */
        queryTradeType: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/tradeType";
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.AddItem2("tradeType", result.result, 'value', 'name', "请选择", []);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 分类属性查询
         */
        queryCategoryProperty: function (categoryId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "goods/itemsCategoryProperty/" + $.goodsUpdateApp.spuCode + "/" + categoryId;
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    var propertys = result.result;
                    var propertyIds = "";//属性ID
                    var natureProps = [];//自然属性
                    var purchaseProps = [];//采购属性
                    for (var i = 0; i < propertys.length; i++) {
                        propertyIds += propertys[i]['propertyId'] + ",";
                        var isValid = propertys[i]['isValid'];
                        if ($.goodsUpdateApp.NATURE_PROPERTY == propertys[i]['typeCode']) {
                            natureProps.push(propertys[i]);
                        } else {
                            if (isValid == "1") {
                                purchaseProps.push(propertys[i]);
                            }else {
                                $.goodsUpdateApp._stopedPurchasePropertys.push(propertys[i]);
                            }
                        }
                    }
                    if (propertyIds != "") {
                        propertyIds = propertyIds.substring(0, propertyIds.length - 1);
                    }
                    $.goodsUpdateApp.setPropertyForm(propertyIds, natureProps, purchaseProps);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 设置属性表单
         * @param propertyIds 属性ID字符串,多个用逗号分隔
         * @param natureProps 自然属性数组
         * @param purchaseProps 采购属性数组
         */
        setPropertyForm: function (propertyIds, natureProps, purchaseProps) {
            if ("" == propertyIds) {
                return false;
            }
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/propertyValues/multiIdsSearch";
            aContent.data = {propertyIds: propertyIds};
            aContent.async = false,
                aContent.success = function (result, textStatus) {
                    if (result.appcode != 1) {
                        BUI.Message.Alert(result.databuffer, 'warning');
                    } else {
                        var propertyValues = result.result;//属性值
                        for (var i = 0; i < propertyValues.length; i++) {
                            $.goodsUpdateApp._allPropertyValues.push(propertyValues[i]);
                        }
                        var naturePropertyValues = [];//自然属性值
                        var purchasePropertyValues = [];//采购属性值
                        for (var i = 0; i < natureProps.length; i++) {
                            var propertyId = natureProps[i]['propertyId'];
                            for (var j = 0; j < propertyValues.length; j++) {
                                var _propertyId = propertyValues[j]['propertyId'];
                                if (propertyId == _propertyId) {
                                    naturePropertyValues.push(propertyValues[j]);
                                }
                            }
                        }
                        for (var i = 0; i < purchaseProps.length; i++) {
                            var propertyId = purchaseProps[i]['propertyId'];
                            for (var j = 0; j < propertyValues.length; j++) {
                                var _propertyId = propertyValues[j]['propertyId'];
                                if (propertyId == _propertyId) {
                                    purchasePropertyValues.push(propertyValues[j]);
                                }
                            }
                        }
                        $.goodsUpdateApp._purchasPropertys = purchaseProps;
                        $.goodsUpdateApp._purchasPropertyValues = purchasePropertyValues;

                        $.goodsUpdateApp._naturePropertys = natureProps;
                        $.goodsUpdateApp._naturePropertyValues = naturePropertyValues;

                        $.goodsUpdateApp.setProperty("naturePropertys", natureProps, naturePropertyValues);
                        $.goodsUpdateApp.setProperty("purchasePropertys", purchaseProps, purchasePropertyValues);
                    }
                };
            $.ajax(aContent);
        },
        /**
         * 设置属性
         * @param reder 控件渲染的div
         * @param propertys
         * @param propertyValues
         */
        setProperty: function (reder, propertys, propertyValues) {
            for (var i = 0; i < propertys.length; i++) {
                var isValid = propertys[i]['isValid'];
                var _row = $('<div class="row"></div>');
                var _group = $('<div class="control-group span30"></div>');
                var _label = $('<label style="margin-top: 5px;" class="control-label">' + propertys[i]['name'] + ':</label>');
                var _controls = $('<div  class="controls"></div>');
                var _target = "";
                var valueType = propertys[i]['valueType'];
                var propertyId = propertys[i]['propertyId'];
                var propertyName = propertys[i]['name'];
                var propertySort = propertys[i]['propertySort'];
                var typeCode = propertys[i]['typeCode'];
                var name = "naturePropery";
                if ($.goodsUpdateApp.PURCHASE_PROPERTY == typeCode) {
                    name = "purchasePropery";
                }
                if ($.goodsUpdateApp.NATURE_PROPERTY == typeCode) {
                    _target = $('<select name="' + name + '" class="naturePropertySelect" propertyName="' + propertyName + '" isValid="' + isValid + '"><option value="">请选择</option></select>');
                    for (var j = 0; j < propertyValues.length; j++) {
                        var propertyValueId = propertyValues[j]["id"];
                        var propertyValue = propertyValues[j]["value"];
                        var _propertyId = propertyValues[j]["propertyId"];
                        var _isValid = propertyValues[j]["isValid"];
                        if (propertyId == _propertyId) {
                            var _option = $('<option propertyId="' + propertyId + '" value="' + propertyValueId + '" isValid="' + _isValid + '">' + propertyValue + '</option>');
                            _target.append(_option);
                        }
                    }
                } else {
                    if (isValid == "1") {
                        _target = $('<div id="purchaseDiv" style="margin-top: 12px;"></div>');
                        for (var j = 0; j < propertyValues.length; j++) {
                            var propertyValueId = propertyValues[j]["id"];
                            var propertyValue = propertyValues[j]['value'];
                            var picture = propertyValues[j]["picture"];
                            var sort = propertyValues[j]["sort"];
                            var _propertyId = propertyValues[j]["propertyId"];
                            var _isValid = propertyValues[j]["isValid"];
                            if (propertyId == _propertyId && _isValid == "1") {
                                var label = $('<label style="margin-top: 5px; margin-left: 20px;" class="checkbox"></label>');
                                var _ckCls = "myCk";
                                if ($.goodsUpdateApp.NATURE_PROPERTY == typeCode) {
                                    _ckCls = "naturePropertyCheck";
                                }
                                var _ckbox = $('<input type="checkbox" class="' + _ckCls + '" name="' + name + '" type="checkbox" propertyId="' + propertyId + '" ' +
                                    'propertyName="' + propertyName + '" propertySort="' + propertySort + '" sort="' + sort + '" picture="' + picture + '" ' +
                                    'propertyValue="' + propertyValue + '"  value="' + propertyValueId + '" isValid="' + _isValid + '"/>');
                                //复选框状态改变事件
                                _ckbox.on('change', function () {
                                    var _target = $(this);
                                    if (_target.hasClass($.goodsUpdateApp._checkbox_css)) {
                                        _target.removeClass($.goodsUpdateApp._checkbox_css);
                                    } else {
                                        _target.addClass($.goodsUpdateApp._checkbox_css);
                                    }
                                    //处理复选框选择
                                    $.goodsUpdateApp.handerProertyChecked();
                                    //添加sku
                                    $.goodsUpdateApp.addSku();
                                    //删除sku
                                    $.goodsUpdateApp.delSku();
                                });

                                label.append(_ckbox);
                                label.append('<span style="margin-top: 10px;">' + propertyValue + '</span>&nbsp;');
                                if(!/^http/.test(picture)){
                                    if (valueType == "1") {
                                        var img = $('<img style="width: 30px; height: 30px;" onclick=$.goodsUpdateApp.showImg("' + picture + '") src="' + propertyValues[j]["picUrl"] + '"/>')
                                        label.append(img);
                                    }
                                }else{
                                    if (valueType == "1") {
                                        var img = $('<img style="width: 30px; height: 30px;" onclick=$.goodsUpdateApp.showImgDialog("' + picture + '") src="' +picture + '"/>')
                                        label.append(img);
                                    }
                                }                                
                                _target.append(label);
                            }
                        }
                    }
                }
                if (_target != "") {
                    _controls.append(_target);
                    _group.append(_label);
                    _group.append(_controls);
                    _row.append(_group);
                    $("#" + reder).append(_row);
                }
            }
        },
        /**
         * 显示图片
         * @param key
         */
        showImg: function (key) {         
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + 'qinniu/download';
            aContent.data = {fileName: key};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.goodsUpdateApp.showImgDialog(result.result);                    
                }
            };
            $.ajax(aContent);
        },


        /**
         * 查看图片
         * @param key
         */
        showImgDialog: function (url) {
            BUI.use(['bui/overlay'], function (Overlay) {
                var dialog = new Overlay.Dialog({
                    title: '图片查看',
                    width: 1000,
                    height: 600,
                    mask: false,
                    buttons: []
                });
                dialog.set("bodyContent", '<div style="height: 100%;text-align:center;"><img style="max-width:1100px;width:auto;height: 100%;" src=' + url + '></div>');
                dialog.show();
                $(".bui-dialog .bui-stdmod-body").css("text-align","center");
                $(".bui-stdmod-body img").css("width","auto");
            });
        },
        /**
         * 处理复选框选择
         */
        handerProertyChecked: function () {
            $.goodsUpdateApp._normIds = [];
            $.goodsUpdateApp._normNames = [];
            $.goodsUpdateApp._skuPropertyNames = [];
            var count = 0;
            var checkedList = $.goodsUpdateApp.getCheckedList($.goodsUpdateApp._purchasPropertys);
            if ($.goodsUpdateApp._purchasPropertys.length == 1) {
                var _property = $.goodsUpdateApp._purchasPropertys[count];
                for (var i = 0; i < checkedList.length; i++) {
                    var checkbox = checkedList[i];
                    if ($.goodsUpdateApp._purchasPropertys[count]['propertyId'] == checkedList[i]['propertyId']) {
                        var name = $.goodsUpdateApp._purchasPropertys[count]['name'] + ":" + checkedList[i]['propertyValue'];
                        var id = checkbox['propertyValueId'];
                        var name = checkbox['propertyValue'];
                        var skuName = _property['name'] + ':' + checkbox['propertyValue'];
                        if ($.goodsUpdateApp.hasItem(id, $.goodsUpdateApp._normIds) == false) {
                            $.goodsUpdateApp._normIds.push(id);
                        }
                        if ($.goodsUpdateApp.hasItem(name, $.goodsUpdateApp._normNames) == false) {
                            $.goodsUpdateApp._normNames.push(name);
                        }
                        if ($.goodsUpdateApp.hasItem(skuName, $.goodsUpdateApp._skuPropertyNames) == false) {
                            $.goodsUpdateApp._skuPropertyNames.push(skuName);
                        }
                    }
                }

            } else {
                for (var i = 0; i < checkedList.length; i++) {
                    if ($.goodsUpdateApp._purchasPropertys[count]['propertyId'] == checkedList[i]['propertyId']) {
                        var name = $.goodsUpdateApp._purchasPropertys[count]['name'] + ":" + checkedList[i]['propertyValue'];
                        $.goodsUpdateApp.getNorm(checkedList[i]['propertyValueId'], checkedList[i]['propertyValue'], name, checkedList, count + 1);
                    }
                }
            }
        },
        /**
         * 获取规格信息
         * @param prePropertyValueId 前一个属性值ID
         * @param prePropertyValueName 前一个属性值名称
         * @param prePropertyName 前一个属性名称
         * @param checkedList 已经选择的采购属性复选框
         * @param count 当前属性第几个
         */
        getNorm: function (prePropertyValueId, prePropertyValueName, prePropertyName, checkedList, count) {
            var _property = $.goodsUpdateApp._purchasPropertys[count];
            for (var i = 0; i < checkedList.length; i++) {
                var checkbox = checkedList[i];
                if (_property['propertyId'] == checkbox['propertyId']) {
                    var id = prePropertyValueId + "," + checkbox['propertyValueId'];
                    var name = prePropertyValueName + "," + checkbox['propertyValue'];
                    var skuName = prePropertyName + " | " + _property['name'] + ':' + checkbox['propertyValue'];
                    if (count == ($.goodsUpdateApp._purchasPropertys.length - 1)) {
                        if ($.goodsUpdateApp.hasItem(id, $.goodsUpdateApp._normIds) == false) {
                            $.goodsUpdateApp._normIds.push(id);
                        }
                        if ($.goodsUpdateApp.hasItem(name, $.goodsUpdateApp._normNames) == false) {
                            $.goodsUpdateApp._normNames.push(name);
                        }
                        if ($.goodsUpdateApp.hasItem(skuName, $.goodsUpdateApp._skuPropertyNames) == false) {
                            $.goodsUpdateApp._skuPropertyNames.push(skuName);
                        }
                    } else {
                        $.goodsUpdateApp.getNorm(id, name, skuName, checkedList, count + 1);
                    }
                }
            }
        },
        /**
         * 添加sku
         */
        addSku: function () {
            var addNorms = $.goodsUpdateApp.getAddNorm();
            var _normIds = $.goodsUpdateApp._normIds;
            var _normNames = $.goodsUpdateApp._normNames;
            var _skuPropertyNames = $.goodsUpdateApp._skuPropertyNames;
            var datas = $.goodsUpdateApp.skuTable.getData();
            for (var i = 0; i < addNorms.length; i++) {
                for (var j = 0; j < _normIds.length; j++) {
                    if (addNorms[i] == _normIds[j]) {
                        //这段针对属性名称和规格名称的判断是为了防止只有2个属性值，但是2个属性值名称一样的情况
                        var _propertyValue = _normNames[j];
                        if(undefined == _propertyValue){
                            _propertyValue = _normNames[0];
                        }
                        var _normName = _skuPropertyNames[j];
                        if(undefined == _normName){
                            _normName = _skuPropertyNames[0];
                        }
                        var record = {
                            skuCode: "",
                            propertyValueId: _normIds[j],//属性值ID,多个用逗号分隔
                            propertyValue: _propertyValue,//属性值名称,多个用逗号分隔
                            normName: _normName,//规格名称
                            barCode: '',//条形码
                            skuName:'',//SKU名称
                            marketPrice2: '',//市场价
                            weight2: '',//重量
                            picture: '',//图片
                            isValid: '1'//状态
                        };
                        var flag = false;
                        for (var k = 0; k < datas.length; k++) {
                            var _data = datas[k];
                            //查询的数据要保留
                            if (addNorms[i] == _data['propertyValueId']) {
                                flag = true;
                                break;
                            }
                        }
                        if (flag == false) {
                            $.goodsUpdateApp.skuTable.addRow(record, "1");
                        }
                    }
                }
            }
            if (addNorms.length > 0) {
                $.goodsUpdateApp._normIds2 = [];
                $.goodsUpdateApp._normNames2 = [];
                $.goodsUpdateApp._skuPropertyNames2 = [];
                for (var i = 0; i < $.goodsUpdateApp._normIds.length; i++) {
                    $.goodsUpdateApp._normIds2.push($.goodsUpdateApp._normIds[i]);
                    $.goodsUpdateApp._normNames2.push($.goodsUpdateApp._normNames[i]);
                    $.goodsUpdateApp._skuPropertyNames2.push($.goodsUpdateApp._skuPropertyNames[i]);
                }
            }

        },

        /**
         * 获取新增的规格信息
         */
        getAddNorm: function () {
            var _normIds = $.goodsUpdateApp._normIds;
            var _normIds2 = $.goodsUpdateApp._normIds2;
            var addNormIds = [];
            for (var i = 0; i < _normIds.length; i++) {
                var flag = false;
                for (var j = 0; j < _normIds2.length; j++) {
                    if (_normIds[i] == _normIds2[j]) {
                        flag = true;
                        break;
                    }
                }
                if (flag == false) {
                    addNormIds.push(_normIds[i]);
                }
            }
            return addNormIds;
        },
        /**
         * 删除sku
         */
        delSku: function () {
            var delNorms = $.goodsUpdateApp.getDelNorm();
            var delRecords = [];
            for (var i = 0; i < delNorms.length; i++) {
                var datas = $.goodsUpdateApp.skuTable.getData();
                for (var j = 0; j < datas.length; j++) {
                    var record = datas[j];
                    //查询的数据要保留
                    if (record['source'] == "1" && delNorms[i] == record['propertyValueId']) {
                        delRecords.push(record);
                        $.goodsUpdateApp.skuTable.delRow(record);
                    }
                }
            }
            if (delRecords.length > 0) {
                var datas = $.goodsUpdateApp.skuTable.getData();
                if (datas.length == 0) {
                    $.goodsUpdateApp._normIds = [];
                    $.goodsUpdateApp._normNames = [];
                    $.goodsUpdateApp._skuPropertyNames = [];
                    $.goodsUpdateApp._normIds2 = [];
                    $.goodsUpdateApp._normNames2 = [];
                    $.goodsUpdateApp._skuPropertyNames2 = [];
                } else {
                    for (var i = 0; i < $.goodsUpdateApp._normIds.length; i++) {
                        for (var j = 0; j < delNorms.length; j++) {
                            if ($.goodsUpdateApp._normIds[i] == delNorms[j]) {
                                $.goodsUpdateApp._normIds.pop($.goodsUpdateApp._normIds[i]);
                                $.goodsUpdateApp._normNames.pop($.goodsUpdateApp._normNames[i]);
                                $.goodsUpdateApp._skuPropertyNames.pop($.goodsUpdateApp._skuPropertyNames[i]);
                            }
                        }
                    }
                    $.goodsUpdateApp._normIds2 = [];
                    $.goodsUpdateApp._normNames2 = [];
                    $.goodsUpdateApp._skuPropertyNames2 = [];
                    for (var i = 0; i < $.goodsUpdateApp._normIds.length; i++) {
                        $.goodsUpdateApp._normIds2.push($.goodsUpdateApp._normIds[i]);
                        $.goodsUpdateApp._normNames2.push($.goodsUpdateApp._normNames[i]);
                        $.goodsUpdateApp._skuPropertyNames2.push($.goodsUpdateApp._skuPropertyNames[i]);
                    }
                }
            }
        },
        /**
         * 获取删除的规格信息
         */
        getDelNorm: function () {
            var _normIds = $.goodsUpdateApp._normIds;
            var _normIds2 = $.goodsUpdateApp._normIds2;
            var delNormIds = [];
            for (var i = 0; i < _normIds2.length; i++) {
                var flag = false;
                for (var j = 0; j < _normIds.length; j++) {
                    if (_normIds2[i] == _normIds[j]) {
                        flag = true;
                        break;
                    }
                }
                if (flag == false) {
                    delNormIds.push(_normIds2[i]);
                }
            }
            return delNormIds;
        },
        /**
         * 获取选中的复选框
         */
        getCheckedList: function (purchasPropertys) {
            var _propertys = [];
            for (var i = 0; i < purchasPropertys.length; i++) {
                var ckName = "purchasePropery";
                $('input[name="' + ckName + '"]').each(function () {
                    var ck = $(this);
                    if (ck.hasClass($.goodsUpdateApp._checkbox_css)) {
                        var propertyObj = {
                            propertyId: ck.attr("propertyId"),//属性ID
                            propertyName: ck.attr("propertyName"),//属性名称
                            propertySort: ck.attr("propertySort"),//属性排序
                            propertyValueId: ck.attr("value"),//属性值ID
                            propertyValue: ck.attr("propertyValue"),//属性值文字
                            sort: ck.attr("sort"),//属性值排序
                            picture: ck.attr("picture"),//属性值图片
                            isValid: ck.attr("isValid")//启停用状态
                        }
                        var flag = false;
                        for (var i = 0; i < _propertys.length; i++) {
                            var _tmp = _propertys[i];
                            if (propertyObj['propertyId'] == _tmp['propertyId'] && propertyObj['propertyValueId'] == _tmp['propertyValueId']) {
                                flag = true;
                                break;
                            }
                        }
                        if (flag == false) {
                            _propertys.push(propertyObj);
                        }
                    }
                })
            }
            return _propertys;
        },
        /**
         * 判断数组里面是否包含元素
         * @param item
         * @param items
         */
        hasItem: function (item, items) {
            var flag = false;
            for (var i = 0; i < items.length; i++) {
                if (item == items[i]) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },


        /**
         * 初始化sku表格
         */
        initSkuTable: function () {
            BUI.use(['bui/form', 'bui/overlay', 'bui/mask'], function (Form, Overlay) {

                var columns = [
                    {title: 'SKU编码', dataIndex: 'skuCode', visible: false},
                    {title: '属性值ID', dataIndex: 'propertyValueId', visible: false},
                    {title: '属性值', dataIndex: 'propertyValue', visible: false},
                    {
                        title: '规格', dataIndex: 'normName',
                        width: '15%',
                        elCls: 'center'
                    },
                    {
                        title: 'SKU编号', dataIndex: 'skuCode',
                        width: '14%',
                        elCls: 'center'
                    },
                    {
                        title: '<font style="color: red">*</font>SKU名称', dataIndex: 'skuName',
                        width: '14%',
                        elCls: 'center',
                        editor: {xtype: 'text',rules:{required:true}},
                    },
                    {
                        title: '<font style="color: red">*</font>条形码<br>(多个请用英文逗号,隔开)',
                        dataIndex: 'barCode',
                        width: '14%',
                        elCls: 'center',
                        barcode : 'barcode',
                        editor: {xtype: 'text',validator:function(barCode,skuGrid){   
                            var isValid = skuGrid.isValid;                         
                            var barCode =  barCode.replace(/\s+/g, "");
                            var skuCode = skuGrid.skuCode;
                            if(barCode== skuGrid.barCode.replace(/\s+/g, "")||barCode==(skuGrid.barCode.replace(/\s+/g, ""))+','){
                                return;
                            }else{
                                var regexp = new RegExp(/^[0-9a-zA-Z-#,]+$/);
                                if(barCode.length>100){
                                    return '条形码最大长度不能超过100位'
                                }else if(barCode.length===0){
                                    return '条形码不能为空'
                                }else if(barCode&&!regexp.test(barCode)){
                                    return '条形码格式错误'
                                }else if(barCode.length>0){ 
                                    //本地形码重复校验
                                    if(barCode!=skuGrid.barCode){                                        
                                        var codeList=[]
                                        var checkError="";
                                        $(".barcodeText").each(function(index, el) {
                                            var elValue=$(el).val();
                                            var isValidCheck = $(".isValidType")[index].checked;
                                            if(elValue!=skuGrid.barCode&&isValidCheck==true)
                                            {
                                                codeList=codeList.concat(elValue.split(","));
                                            }
                                        });
                                        var result=barCode.split(",");
                                        var newResult = result.sort(); 
                                        for(var i=0;i<newResult.length;i++){ 
                                            if(!newResult[i]&&!newResult[i+1]){
                                                checkError="条形码格式错误";
                                                return checkError;   
                                            }
                                            if (newResult[i]&&newResult[i+1]&&newResult[i]==newResult[i+1]){ 
                                                checkError="条形码"+newResult[i]+"已存在";
                                                return checkError;  
                                            }    
                                        } 
                                        if(isValid=="1"){
                                            $.each(barCode.split(","), function(index, val) {
                                                $.each(codeList,function(index2, el) {
                                                    if(val&&el&&val==el){                                                    
                                                        checkError="条形码"+val+"已存在";
                                                        return;
                                                     }
                                                });
                                                if(checkError!="")
                                                    return;
                                            });
                                            if(checkError!="")
                                            {
                                                return checkError;
                                            }
                                        }else{
                                            return checkError;
                                        }
                                        
                                    }

                                    var notIn=[];
                                    var skuDataArray=$.goodsUpdateApp.skuTable.getData();
                                    $.each(skuDataArray,function(index, el) {
                                        if(el.skuCode!=""&&el.isValid==0){
                                            notIn.push(el.skuCode);
                                        }
                                    });
                                    var aContent = $.AjaxContent();
                                    aContent.url = $.scmServerUrl + "goods/checkBarcodeOnly";
                                    aContent.data = {"barCode": barCode,"skuCode":skuCode,"isValid" :isValid,"notIn":notIn.join(",")};
                                    aContent.type = "POST";
                                    aContent.async=false; 
                                    aContent.success = function (result, textStatus) {
                                        if (result.appcode != 1) {
                                            
                                        }else{
                                            sucMsg = result.databuffer;
                                            errMsg=1;
                                            codeReq =1;                                         
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
                            }
                        }},
                        renderer : function(val){
                            if(val == null){
                                val = "";
                            }
                            return '<span>'+val+'</span>';
                        }
                    },
                    {
                        title: '参考市场价(元)',
                        dataIndex: 'marketPrice2',
                        width: '14%',
                        elCls: 'center',
                        editor: {xtype: 'text', rules: {number: true, price: 0}},
                        renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                        }
                    },
                    {
                        title: '重量(KG)',
                        dataIndex: 'weight2',
                        width: '14%',
                        elCls: 'center',
                        editor: {xtype: 'text', rules: {number: true, kgNumber: 0}},
                        renderer : function(val){
                            if(val == null){
                                val = "";
                            }
                            return '<span>'+val+'</span>';
                        }
                    },
                    {
                        title: '图片(最多3张)', dataIndex: 'picture',
                        width: '17%',
                        elCls: 'center', editor: {
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
                    {
                        title: '状态',
                        dataIndex: 'isValid',
                        width: '17%',
                        elCls: 'center',
                        renderer: function (val) {
                            var checked;
                            if (val == 1) {
                                checked = "checked";
                            } else {
                                checked = "";
                            }
                            return '<div class="bui-form-group"><input class="checkbox isValidType"  type="checkbox" ' + checked + '><label style="vertical-align: text-bottom;">启用</label></div>';
                        }
                    }
                ];
                $.goodsUpdateApp.skuTable = new DynamicGrid(columns);
            });
        },
        /**
         * 获取自然属性信息
         */
        getNaturePropertyInfo: function () {
            var _naturePropertys = [];
            $('.naturePropertySelect').find("option:selected").each(function () {
                var opt = $(this);
                var propertyId = opt.attr("propertyId");
                if (propertyId != "" && undefined != propertyId) {
                    var propertyObj = {
                        propertyId: opt.attr("propertyId"),//属性ID
                        propertyValueId: opt.attr("value"),//属性值ID
                        propertyValue: opt.text(),//属性值文字
                        isValid: opt.attr("isValid")//启停用状态
                    }
                    _naturePropertys.push(propertyObj);
                }
            })
            return _naturePropertys;
        },

        /**
         * 检查自然属性启停用状态
         */
        checkNaturePropertyValid: function (fromData, tip) {
            $('select[name="naturePropery"]').each(function () {
                var sel = $(this);
                if (sel.attr("isValid") == "0") {
                    var msg = '自然属性"' + sel.attr("propertyName") + '"已被停用,<br>继续保存的话该数据将丢失';
                    BUI.Message.Confirm(msg, function () {
                        sel.val("");
                        $.goodsUpdateApp.save(fromData, tip);
                    }, 'question');
                    throw new Error("");
                }
                {
                    var _opt = sel.find('option:selected');
                    var selected = _opt.attr("selected");
                    var isValid = _opt.attr("isValid");
                    if (selected == "selected" && isValid == "0") {
                        BUI.Message.Alert(sel.attr("propertyName") + '"字段中的"' + _opt.text() + '"已被删除,<br>请重新选择后再保存', "warning");
                        throw new Error("");
                    }
                }
            })

            $.goodsUpdateApp.save(fromData, tip);
        },
        /**
         * 检查属性启停用状态
         */
        checkPropetyStatus: function () {
            var flag = true;
            var naturePropertys = [];
            for(var i=0;i<$.goodsUpdateApp._naturePropertys.length;i++){
                var _property = $.goodsUpdateApp._naturePropertys[i];
                if(_property['isValid'] == "1"){
                    naturePropertys.push(_property);
                }
            }
            var purchasPropertys = [];
            for(var i=0;i<$.goodsUpdateApp._purchasPropertys.length;i++){
                var _property = $.goodsUpdateApp._purchasPropertys[i];
                if(_property['isValid'] == "1"){
                    purchasPropertys.push(_property);
                }
            }
            var propertyInfo = {};
            propertyInfo['naturePropertys'] = naturePropertys;
            propertyInfo['purchasPropertys'] = purchasPropertys;
            propertyInfo = JSON.stringify(propertyInfo);
            var aContent = $.AjaxContent();
            aContent.async = false;
            aContent.data = {propertyInfo: propertyInfo};
            aContent.url = $.scmServerUrl + "goods/checkPropetyStatus/";
            aContent.error = function (XMLHttpRequest) {
                flag = false;
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
                if (result.appcode == 0) {
                    BUI.Message.Confirm(result.databuffer, function () {
                        location.reload();
                    }, 'question');
                }
            };
            $.ajax(aContent);
            return flag;
        },
        /***
         * 保存商品
         * @param fromData
         */
        save: function (fromData, tip) {
            if ($.goodsUpdateApp._currentCategoryId == fromData['categoryId'] &&
                $.goodsUpdateApp._currentCategoryValid == "0") {
                var categoryName = $("#categoryId").find("option:selected").text();
                BUI.Message.Alert("分类" + categoryName + "已被停用,不能提交编辑", "warning");
                return false;
            }
            if ($.goodsUpdateApp._currentBrandId == fromData['brandId'] &&
                $.goodsUpdateApp._currentBrandValid == "0") {
                var brandName = $("#brandId").find("option:selected").text();
                BUI.Message.Alert("品牌" + brandName + "已被停用,请选择其他品牌或者取消编辑", "warning");
                return false;
            }
            //检查文件上传状态
            $.checkUploadStatus();
            var id = $("#id").val();
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "goods/goods/" + id;
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    // tip.set('title',result.databuffer);
                    // tip.show();
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "goodsList.html";
                }
            };
            //设置分类
            fromData['categoryId'] = $("#categoryId").val();

            //if ($.goodsUpdateApp.skuTable.isValid()) {
            if (true) {
                //设置sku参数
                var skus = $.goodsUpdateApp.skuTable.getData();
                if (skus.length == 0) {
                    BUI.Message.Alert("商品sku信息不能为空", "warning");
                    return false;
                }else{
                    for(var i=0;i<skus.length;i++){
                        if(skus[i]["barCode"]){
                           var barcode =(skus[i]["barCode"]).replace(/\s+/g, ""); 
                           skus[i]["barCode"]= barcode;
                        }
                    };
                }  
                var barCodeStr;
                if(skus){                    
                    for(var i=0;i<skus.length;i++){
                        barCodeStr = skus[i]["barCode"]                   
                        if(barCodeStr[barCodeStr.length-1]==","){
                            BUI.Message.Alert('条形码不能以,结尾!','warning');
                            return false;
                        }
                        if(skus[i]["skuName"]==""){
                        	BUI.Message.Alert('sku名称不能为空!','warning');
                        	return false;
                        }                       
                    };                    
                }
                fromData['skusInfo'] = JSON.stringify(skus);
                //设置自然属性参数
                var _naturePropertys = $.goodsUpdateApp.getNaturePropertyInfo();
                if (_naturePropertys.length > 0) {
                    fromData['naturePropertys'] = JSON.stringify(_naturePropertys);
                }
                //设置采购属性参数
                var _purchasePropertys = $.goodsUpdateApp.getCheckedList($.goodsUpdateApp._purchasPropertys);
                fromData['salesPropertys'] = JSON.stringify(_purchasePropertys);

                aContent.data = fromData;
                $.ajax(aContent);
            }
        }
    };
    $(document).ready(function (e) {
        $.goodsUpdateApp.init();
    });
}(jQuery));
