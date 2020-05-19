/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){
    $.goodsSkuDetailApp = {
        NATURE_PROPERTY : 'natureProperty',//自然属性
        PURCHASE_PROPERTY : 'purchaseProperty',//采购属性
        _checkbox_css : 'checked',//复选框选中时的样式
        _purchasPropertys : [],//所有采购属性
        _purchasPropertyValues : [],//所有采购属性值
        _checkedPropertys : [],//已经选中的采购属性
        _normIds : [], //已经选择的sku规格id
        _normNames : [], //已经选择的sku规格名称
        _skuPropertyNames : [], //已经选择的sku属性名称
        _normIds2 : [], //已经选择的sku规格id
        _normNames2 : [], //已经选择的sku规格名称
        _skuPropertyNames2 : [], //已经选择的sku属性名称
        _currentCategoryId : "", //当前分类ID
        _currentCategoryValid : "", //当前分类启停用状态
        _currentBrandId : "", //当前品牌ID
        _currentBrandName : "", //当前品牌名称
        _currentBrandValid : "", //当前品牌启停用状态
        _currentNaturePropertys : [],//当前自然属性
        _currentPurchasePropertys : [],//当前采购属性
        _warehose : "仓库",//默认仓库名称
        skuTable : null,
        spuCode : "",//商品spu编码
        skuCode : "",//商品sku编码
        init:function(){

            this.spuCode = $.getUrlParam("spuCode");
            this.skuCode = $.getUrlParam("skuCode");

            this.queryTradeType();
            this.queryItemsInfo(this.spuCode, this.skuCode);
            BUI.use(['bui/form','bui/tooltip','bui/uploader','bui/mask'],function(Form, Tooltip, Uploader){
                var form = new Form.Form({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

                if($.getUrlParam("orderPage")){
                    $("#btn_list").on("click",function(){
                        window.location.href ="../order/shopOrderDetail.html?platformOrderCode=" + $.getUrlParam("platformOrderCode")+"&shopOrderCode=" + $.getUrlParam("shopOrderCode");  
                    })     
                }else{
                    $("#btn_list").on("click",function(){
                        window.location.href = "goodsQuery.html";
                        //window.history.go(-1);
                    });
                }                

            });

        },
        /**
         * 查询当前分类信息
         * @param categoryId
         */
        queryCurrentCategoryInfo: function (categoryId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/categorys";
            aContent.data = {id: categoryId};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var categorys = result.result;
                    if(categorys.length > 0){
                        $.goodsSkuDetailApp._currentCategoryValid = categorys[0]['isValid'];
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询商品信息
         * @param spuCode 商品SPU编码
         */
        queryItemsInfo : function (spuCode, skuCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "goods/goods/spuCode/"+spuCode;
            aContent.data = {skuCode: skuCode};
            aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer, "warning");
                }else{
                    $.goodsSkuDetailApp.fillForm(result.result);
                    $.goodsSkuDetailApp.showPic(result.result.items.mainPicture);
                    $.goodsSkuDetailApp.initWarehouseDetail(result.result.skus[0].requestSkuStockList)
                }
            };
            $.ajax(aContent);
        },
        /*显示商品主图*/
        showPic: function(url){
            if(url){
                if(url.length>1){
                    var picNum = url.split(",");
                }else{
                    var picNum = url;
                }  
                for(var i=0; i< picNum.length;i++){
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "qinniu/urls?thumbnail=1&fileNames=" + picNum[i];
                    aContent.success = function (result, textStatus) {
                        if (result.appcode != 1) {
                            BUI.Message.Alert(result.databuffer,'warning');
                        } else {
                            var resultUrl = result.result;
                            for (var j = 0; j < resultUrl.length; j++) {
                                var img = $('<image style="width: 125px; height: 125px;margin-left:5px;" src="' + resultUrl[j].url + '" onclick=$.goodsSkuDetailApp.showImgDialog("' + resultUrl[j].url + '")/>');
                            };
                            $("#mainPictrue").append(img);
                        }
                    }
                    $.ajax(aContent);
                }  
            }                                            
        },
        /**
         * 填充表单
         */
        fillForm : function (itemsExt) {
            //商品基础信息
            var items = itemsExt.items;
            this.setItems(items);
            //商品自然属性信息
            var itemNatureProperys = itemsExt.itemNatureProperys;
            $.goodsSkuDetailApp._currentNaturePropertys = itemsExt.itemNatureProperys;
            setTimeout(function () {
                $.goodsSkuDetailApp.setNatureProperty(itemNatureProperys);
            },600);
            //商品SKU信息
            var skus = itemsExt.skus[0];
            //商品采购属性信息
            var itemSalesProperies = itemsExt.itemSalesProperies;
            $.goodsSkuDetailApp._currentPurchasePropertys = itemsExt.itemSalesProperies;
            setTimeout(function () {
                $.goodsSkuDetailApp.setSaleProperty(itemSalesProperies, skus);
            },600);

            setTimeout(function () {
                $.goodsSkuDetailApp.setSkus(skus);
            },600);
        },
        /*设置库存信息=====*/
        initWarehouseDetail:function(warehouseInfo){
            BUI.use(['bui/grid','bui/data'],function(Grid, Data) {
                var data = warehouseInfo;
                var Grid = Grid, Store = Data.Store;
                var columns = [
                    {title : '仓库名称',dataIndex :'warehouseName', width:200,elCls : 'center'},
                    {title : '可用正品总库存',dataIndex :'availableInventory', width:200,elCls : 'center',summary:true},
                    {title : '仓库锁定正品总库存',dataIndex :'warehouseLockInventory',width:200, elCls : 'center',summary:true, visible : false},
                    {title : '临期锁定正品总库存',dataIndex :'adventLockInventory',width:200, elCls : 'center',summary:true, visible : false},
                    {title : '盘点锁定正品总库存',dataIndex :'checkLockInventory', width:200,elCls : 'center',summary:true, visible : false},
                    {title : '残品总库存',dataIndex :'defectiveInventory',width:200,elCls : 'center',summary:true}
                ];
                $.goodsSkuDetailApp.store = new Store({
                    data : data,
                    autoLoad: true
                });

                var grid = new Grid.Grid({
                    render: '#skuGrid',
                    columns: columns,
                    loadMask: true,
                    store: $.goodsSkuDetailApp.store,
                    bbar: {
                        pagingBar: false
                    },
                    forceFit : true,
                    plugins : [Grid.Plugins.Summary] //表格插件
                });
                grid.render();
            });
        },
        /**
         * 设置商品基础信息
         * @param items
         */
        setItems : function (items) {
            $.setFormFieldValue(items);
            $.setSelectItem("tradeType",items['tradeType']);//贸易类型
            $("#remark").val(items['remark']);
            $("#id").val(items['id']);            
            setTimeout(function () {
                $("#isValid").val($.dictTranslate("isValid", items['isValid']));
            },400);
            $.goodsSkuDetailApp._currentCategoryId = items['categoryId'];
            $.goodsSkuDetailApp._currentBrandId = items['brandId'];
            //设置分类
            var select = $('#categoryId');
            var option = $('<option value="'+items["categoryId"]+'" selected="true">'+items["categoryName"]+'</option'+'>');
            select.append(option);
            //查询当前分类信息
            this.queryCurrentCategoryInfo(items["categoryId"]);
            //查询当前品牌信息
            this.queryCurrentBrand(items["brandId"]);
            //设置品牌
            this.queryBrand(items["categoryId"], items["brandId"]);
            setTimeout(function () {
                $.setSelectItem("brandId",items['brandId']);//品牌
            },800);
            //查询分类相关属性
            $.goodsSkuDetailApp.queryCategoryProperty(items["categoryId"]);
        },
        /**
         * 设置商品自然属性
         * @param itemNatureProperys
         */
        setNatureProperty : function (itemNatureProperys) {
            $('.naturePropertySelect ').find("option").each(function () {
                var opt = $(this);
                var propertyId = opt.attr("propertyId");
                var propertyValueId = opt.val();
                for(var i=0; i<itemNatureProperys.length; i++){
                    if(propertyId == itemNatureProperys[i]['propertyId'] &&
                        propertyValueId == itemNatureProperys[i]['propertyValueId']){
                        opt.attr("selected", true);
                    }
                }
            })
            this.delUnusedNatureProperty();
            $('.naturePropertySelect ').each(function () {
                var obj = $(this);
                obj.attr("disabled", "disabled");
            })
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
                if(isValid == "0" || selVal == ""){
                    sel.parent().parent().parent().remove();
                }

            })
        },
        /**
         * 设置商品采购属性
         * @param itemNatureProperys
         */
        setSaleProperty : function (itemSalesProperies, skus) {
            var ckName = "purchasePropery";
            var _propertyValueIds = skus['propertyValueId'].split(",");
            $('input[name="'+ckName+'"]').each(function () {
                var ck = $(this);
                var propertyId = ck.attr("propertyId");
                var propertyValueId = ck.val();
                for(var i=0; i<itemSalesProperies.length; i++){
                    if(propertyId == itemSalesProperies[i]['propertyId'] &&
                        propertyValueId == itemSalesProperies[i]['propertyValueId']){
                        for(var j=0; j<_propertyValueIds.length; j++){
                            if(_propertyValueIds[j] == propertyValueId){
                                ck.attr("checked", "checked");
                                ck.attr("disabled","disabled");
                                ck.addClass($.goodsSkuDetailApp._checkbox_css);
                            }
                        }
                    }
                }
            })
            this.delUnusedSaleProperty();
        },
        /**
         * 删除没有用到的商品采购属性
         * @param itemNatureProperys
         */
        delUnusedSaleProperty : function () {
            var ckName = "purchasePropery";
            $('input[name="'+ckName+'"]').each(function () {
                var ck = $(this);
                if(undefined == ck.attr("checked")){
                    ck.parent().remove();
                }

            })
        },
        /**
         * 设置skus信息
         * @param skus
         */
        setSkus : function (skus) {
            for(key in skus){
                if(skus[key]){

                }else{
                    skus[key] = "";
                }
            }
            $("#skuCode").val(skus['skuCode']);
            $("#barCode").val(skus['barCode']);
            $("#weight").val(skus['weight2']);
            $("#skuName").val(skus['skuName']);
            $("#marketPrice").val(skus['marketPrice2']);
            $("#picture").val(skus['picture']);
            if(skus['warehouse']){
                $("#warehouse").text(skus['warehouse']);
            }else {
                $("#warehouse").text($.goodsSkuDetailApp._warehose);
            }
            var availableInventory = this.getNumber(skus['availableInventory']);
            var realInventory = this.getNumber(skus['realInventory']);
            var defectiveInventory = this.getNumber(skus['defectiveInventory']);
            var lockAvailableInventory = realInventory - availableInventory;

            $("#availableInventory").text(availableInventory);
            $("#lockAvailableInventory").text(lockAvailableInventory);
            $("#realInventory").text(realInventory);
            $("#defectiveInventory").text(defectiveInventory);

            $("#availableInventory2").text(availableInventory);
            $("#lockAvailableInventory2").text(lockAvailableInventory);
            $("#realInventory2").text(realInventory);
            $("#defectiveInventory2").text(defectiveInventory);

            setTimeout(function () {
                $("#isValid2").val($.dictTranslate("isValid", skus['isValid']));
            },200);
            this.initPicUpload();
        },
        getNumber : function (val) {
            if(undefined == val || null == val || "" == val){
                return 0;
            }else{
                return val;
            }
        },
        /***
         * 初始化图片上传
         */
        initPicUpload : function () {
            var url = $.scmServerUrl + 'qinniu/upload/goods';
            var delUrl = $.scmServerUrl + 'qinniu/delete/goods';
            var downloadUrl = $.scmServerUrl + 'qinniu/download';
            var batchDownloadUrl = $.scmServerUrl + 'qinniu/urls?thumbnail=1';
            var imgShowWidth = 1200;//
            var imgShowHeight = 800;
            var rules = {};
            var props = {
                text: '上传',
                theme:"imageView",
                render:"#picturePic",
                filed:"picture",
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

            this.uploadExt = new UploadExt(props);
            this.uploadExt.createUploader();
        },
        /**
         * 获取sku规格名称
         * @param propertyValue 属性值名称,多个用逗号分隔
         */
        getNormName : function (propertyValueId, propertyValue) {
            var _name = "";
            var _purchasPropertyValues = $.goodsSkuDetailApp._purchasPropertyValues;
            var _purchasProperty = $.goodsSkuDetailApp._purchasPropertys;
            if(propertyValueId.length > 0){
                var _tmp = propertyValueId.split(",");
                var _tmp2 = propertyValue.split(",");
                for(var i=0; i<_tmp.length; i++){
                    var _propertyName = "";
                    for(var k=0; k<_purchasPropertyValues.length; k++){
                        if(_tmp[i] == _purchasPropertyValues[k]['id']){
                            for(var j=0; j<_purchasProperty.length; j++){
                                if(_purchasPropertyValues[k]['propertyId'] == _purchasProperty[j]['propertyId']){
                                    _propertyName = _purchasProperty[j]['name'];
                                    break;
                                }
                            }
                        }
                    }
                    _name += _propertyName+":"+_tmp2[i]+" | ";
                }
                _name = _name.substring(0, _name.length-2)+" ";
                $.goodsSkuDetailApp._normNames.push(propertyValue);
                $.goodsSkuDetailApp._skuPropertyNames.push(_name);
            }
            return _name;
        },
        /**
         * 重置表单
         */
        resetForm : function () {
            $('#categoryId').html("");
            $('#naturePropertys').html("");
            $('#purchasePropertys').html("");
        },
        /**
         * 品牌查询
         */
        queryBrand : function (categoryId, brandId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/categoryBrands";
            aContent.data = {isValid : "1", categoryId : categoryId};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var data = result.result;
                    var items = [];
                    for(var i=0; i<data.length; i++){
                        if(data[i]['isValid'] == "1"){
                            items.push(data[i]);
                        }
                    }
                    if($.goodsSkuDetailApp._currentBrandValid == "0"){
                        var record = {brandId: $.goodsSkuDetailApp._currentBrandId, brandName: $.goodsSkuDetailApp._currentBrandName};
                        items.push(record);
                    }
                    $.AddItem2("brandId", items,'brandId','brandName', "全部品牌", []);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询当前品牌信息
         */
        queryCurrentBrand : function (brandId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/brand/"+brandId;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var brand = result.result;
                    $.goodsSkuDetailApp._currentBrandName = brand.name;
                    $.goodsSkuDetailApp._currentBrandValid = brand.isValid;
                }
            };
            $.ajax(aContent);
        },
        /**
         * 贸易类型查询
         */
        queryTradeType : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/tradeType";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2("tradeType", result.result,'value','name', "请选择", []);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 分类属性查询
         */
        queryCategoryProperty : function (categoryId) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"goods/itemsCategoryProperty/"+$.goodsSkuDetailApp.spuCode+"/"+categoryId;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var propertys = result.result;
                    var propertyIds = "";//属性ID
                    var natureProps = [];//自然属性
                    var purchaseProps = [];//采购属性
                    for(var i=0; i<propertys.length; i++){
                        propertyIds += propertys[i]['propertyId']+",";
                        if($.goodsSkuDetailApp.NATURE_PROPERTY == propertys[i]['typeCode']){
                            natureProps.push(propertys[i]);
                        }else{
                            purchaseProps.push(propertys[i]);
                        }
                    }
                    if(propertyIds != ""){
                        propertyIds = propertyIds.substring(0, propertyIds.length-1);
                    }
                    $.goodsSkuDetailApp.setPropertyForm(propertyIds, natureProps, purchaseProps);
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
        setPropertyForm : function (propertyIds, natureProps, purchaseProps) {
            if("" == propertyIds){
                return false;
            }
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/propertyValues/multiIdsSearch";
            aContent.data = {propertyIds: propertyIds};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var propertyValues = result.result;//属性值
                    var naturePropertyValues = [];//自然属性值
                    var purchasePropertyValues = [];//采购属性值
                    for(var i=0; i<natureProps.length; i++){
                        var propertyId = natureProps[i]['propertyId'];
                        for(var j=0; j<propertyValues.length; j++){
                            var _propertyId = propertyValues[j]['propertyId'];
                            if(propertyId == _propertyId){
                                naturePropertyValues.push(propertyValues[j]);
                            }
                        }
                    }
                    for(var i=0; i<purchaseProps.length; i++){
                        var propertyId = purchaseProps[i]['propertyId'];
                        for(var j=0; j<propertyValues.length; j++){
                            var _propertyId = propertyValues[j]['propertyId'];
                            if(propertyId == _propertyId){
                                purchasePropertyValues.push(propertyValues[j]);
                            }
                        }
                    }
                    $.goodsSkuDetailApp._purchasPropertys = purchaseProps;
                    $.goodsSkuDetailApp._purchasPropertyValues = purchasePropertyValues;

                    $.goodsSkuDetailApp.setProperty("naturePropertys", natureProps, naturePropertyValues);
                    $.goodsSkuDetailApp.setProperty("purchasePropertys", purchaseProps, purchasePropertyValues);
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
        setProperty : function (reder, propertys, propertyValues) {
            for(var i=0; i<propertys.length; i++){
                var _row = $('<div class="row"></div>');
                var _group = $('<div class="control-group span20"></div>');
                var _label = $('<label style="margin-top: 5px;" class="control-label">'+propertys[i]['name']+':</label>');
                var _controls = $('<div  class="controls"></div>');
                var _target = "";
                var valueType = propertys[i]['valueType'];
                var propertyId = propertys[i]['propertyId'];
                var propertyName = propertys[i]['name'];
                var propertySort = propertys[i]['propertySort'];
                var typeCode = propertys[i]['typeCode'];
                var isValid = propertys[i]['isValid'];
                var name = "naturePropery";
                if($.goodsSkuDetailApp.PURCHASE_PROPERTY == typeCode){
                    name = "purchasePropery";
                }
                if($.goodsSkuDetailApp.NATURE_PROPERTY == typeCode){
                    _target = $('<select name="'+name+'" class="naturePropertySelect" propertyName="' + propertyName + '" isValid="' + isValid + '"><option value="">请选择</option></select>');
                    for(var j=0; j<propertyValues.length; j++){
                        var propertyValueId = propertyValues[j]["id"];
                        var propertyValue = propertyValues[j]["value"];
                        var _propertyId = propertyValues[j]["propertyId"];
                        if(propertyId == _propertyId){
                            var _option = $('<option propertyId="'+propertyId+'" value="'+propertyValueId+'" isValid="'+isValid+'">'+propertyValue+'</option>');
                            _target.append(_option);
                        }
                    }
                }else {
                    _target = $('<div id="purchaseDiv" style="margin-top: 12px;"></div>');
                    for (var j = 0; j < propertyValues.length; j++) {
                        var propertyValueId = propertyValues[j]["id"];
                        var propertyValue = propertyValues[j]['value'];
                        var picture = propertyValues[j]["picture"];
                        var sort = propertyValues[j]["sort"];
                        var _propertyId = propertyValues[j]["propertyId"];
                        var _isValid = propertyValues[j]["isValid"];
                        if (propertyId == _propertyId) {
                            var label = $('<label style="margin-top: 5px; margin-left: 20px;" class="checkbox"></label>');
                            var _ckCls = "myCk";
                            if ($.goodsSkuDetailApp.NATURE_PROPERTY == typeCode) {
                                _ckCls = "naturePropertyCheck";
                            }
                            var _ckbox = $('<input type="checkbox" class="' + _ckCls + '" name="' + name + '" type="checkbox" propertyId="' + propertyId + '" ' +
                                'propertyName="' + propertyName + '" propertySort="' + propertySort + '" sort="' + sort + '" picture="' + picture + '" ' +
                                'propertyValue="' + propertyValue + '"  value="' + propertyValueId + '" isValid="' + isValid + '"/>');
                            //复选框状态改变事件
                            _ckbox.on('change', function () {
                                var _target = $(this);
                                if (_target.hasClass($.goodsSkuDetailApp._checkbox_css)) {
                                    _target.removeClass($.goodsSkuDetailApp._checkbox_css);
                                } else {
                                    _target.addClass($.goodsSkuDetailApp._checkbox_css);
                                }
                                //处理复选框选择
                                $.goodsSkuDetailApp.handerProertyChecked();
                                //添加sku
                                $.goodsSkuDetailApp.addSku();
                                //删除sku
                                $.goodsSkuDetailApp.delSku();
                            });

                            label.append(_ckbox);
                            label.append('<span style="margin-top: 10px;">' + propertyValue + '</span>&nbsp;');
                            if (valueType == "1") {
                                var img = $('<img style="width: 30px; height: 30px;" onclick=$.goodsSkuDetailApp.showImg("' + picture + '") src="' + propertyValues[j]["picUrl"] + '"/>')
                                label.append(img);
                            }
                            _target.append(label);
                        }
                    }
                }
                if (_target != "") {
                    _controls.append(_target);
                    _group.append(_label);
                    _group.append(_controls);
                    _row.append(_group);
                    $("#"+reder).append(_row);
                }
            }
        },
        /**
         * 显示图片
         * @param key
         */
        showImg : function (key) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + 'qinniu/download';
            aContent.data = {fileName: key};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.goodsSkuDetailApp.showImgDialog(result.result);
                }
            };
            $.ajax(aContent);
        },


        /**
         * 查看图片
         * @param key
         */
        showImgDialog: function (url) {
            BUI.use(['bui/overlay'],function(Overlay){
                var dialog = new Overlay.Dialog({
                    title:'图片查看',
                    width:1000,
                    height:600,
                    mask:false,
                    buttons:[]
                });

                dialog.set("bodyContent", '<div style="text-align: center; height: 100%;"><img style="max-width:1100px;width: auto; height: 100%;" src='+url+'></div>');
                dialog.show();

            });
        },
        /**
         * 处理复选框选择
         */
        handerProertyChecked : function () {
            $.goodsSkuDetailApp._normIds = [];
            $.goodsSkuDetailApp._normNames = [];
            $.goodsSkuDetailApp._skuPropertyNames = [];
            var count = 0;
            var checkedList = $.goodsSkuDetailApp.getCheckedList($.goodsSkuDetailApp._purchasPropertys);
            if($.goodsSkuDetailApp._purchasPropertys.length == 1){
                var _property = $.goodsSkuDetailApp._purchasPropertys[count];
                for(var i=0; i<checkedList.length; i++){
                    var checkbox = checkedList[i];
                    if($.goodsSkuDetailApp._purchasPropertys[count]['propertyId'] == checkedList[i]['propertyId']){
                        var name = $.goodsSkuDetailApp._purchasPropertys[count]['name']+":"+checkedList[i]['propertyValue'];
                        var id = checkbox['propertyValueId'];
                        var name = checkbox['propertyValue'];
                        var skuName = _property['name']+':'+checkbox['propertyValue'];
                        if($.goodsSkuDetailApp.hasItem(id, $.goodsSkuDetailApp._normIds) == false){
                            $.goodsSkuDetailApp._normIds.push(id);
                        }
                        if($.goodsSkuDetailApp.hasItem(name, $.goodsSkuDetailApp._normNames) == false){
                            $.goodsSkuDetailApp._normNames.push(name);
                        }
                        if($.goodsSkuDetailApp.hasItem(skuName, $.goodsSkuDetailApp._skuPropertyNames) == false){
                            $.goodsSkuDetailApp._skuPropertyNames.push(skuName);
                        }
                    }
                }

            }else{
                for(var i=0; i<checkedList.length; i++){
                    if($.goodsSkuDetailApp._purchasPropertys[count]['propertyId'] == checkedList[i]['propertyId']){
                        var name = $.goodsSkuDetailApp._purchasPropertys[count]['name']+":"+checkedList[i]['propertyValue'];
                        $.goodsSkuDetailApp.getNorm(checkedList[i]['propertyValueId'], checkedList[i]['propertyValue'], name, checkedList, count+1);
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
        getNorm : function (prePropertyValueId, prePropertyValueName, prePropertyName, checkedList, count) {
            var _property = $.goodsSkuDetailApp._purchasPropertys[count];
            for(var i=0; i<checkedList.length; i++){
                var checkbox = checkedList[i];
                if(_property['propertyId'] == checkbox['propertyId']){
                    var id = prePropertyValueId+","+checkbox['propertyValueId'];
                    var name = prePropertyValueName+","+checkbox['propertyValue'];
                    var skuName = prePropertyName+" | "+_property['name']+':'+checkbox['propertyValue'];
                    if(count == ($.goodsSkuDetailApp._purchasPropertys.length-1)){
                        if($.goodsSkuDetailApp.hasItem(id, $.goodsSkuDetailApp._normIds) == false){
                            $.goodsSkuDetailApp._normIds.push(id);
                        }
                        if($.goodsSkuDetailApp.hasItem(name, $.goodsSkuDetailApp._normNames) == false){
                            $.goodsSkuDetailApp._normNames.push(name);
                        }
                        if($.goodsSkuDetailApp.hasItem(skuName, $.goodsSkuDetailApp._skuPropertyNames) == false){
                            $.goodsSkuDetailApp._skuPropertyNames.push(skuName);
                        }
                    }else{
                        $.goodsSkuDetailApp.getNorm(id, name, skuName, checkedList, count+1);
                    }
                }
            }
        },
        /**
         * 添加sku
         */
        addSku : function () {
            var addNorms = $.goodsSkuDetailApp.getAddNorm();
            var _normIds = $.goodsSkuDetailApp._normIds;
            var _normNames = $.goodsSkuDetailApp._normNames;
            var _skuPropertyNames = $.goodsSkuDetailApp._skuPropertyNames;
            for(var i=0; i<addNorms.length; i++){
                for(var j=0; j<_normIds.length; j++){
                    if(addNorms[i] == _normIds[j]){
                        var record = {
                            skuCode: "",
                            propertyValueId: _normIds[j],//属性值ID,多个用逗号分隔
                            propertyValue: _normNames[j],//属性值名称,多个用逗号分隔
                            normName: _skuPropertyNames[j],//规格名称
                            barCode: '',//条形码
                            marketPrice2: '',//市场价
                            weight2: '',//重量
                            picture: '',//图片
                            isValid: ''//状态
                        };
                        $.goodsSkuDetailApp.skuTable.addRow(record, "1");
                    }
                }
            }
            if(addNorms.length > 0){
                $.goodsSkuDetailApp._normIds2 = [];
                $.goodsSkuDetailApp._normNames2 = [];
                $.goodsSkuDetailApp._skuPropertyNames2 = [];
                for(var i=0; i<$.goodsSkuDetailApp._normIds.length; i++){
                    $.goodsSkuDetailApp._normIds2.push($.goodsSkuDetailApp._normIds[i]);
                    $.goodsSkuDetailApp._normNames2.push($.goodsSkuDetailApp._normNames[i]);
                    $.goodsSkuDetailApp._skuPropertyNames2.push($.goodsSkuDetailApp._skuPropertyNames[i]);
                }
            }

        },

        /**
         * 获取新增的规格信息
         */
        getAddNorm : function () {
            var _normIds = $.goodsSkuDetailApp._normIds;
            var _normIds2 = $.goodsSkuDetailApp._normIds2;
            var addNormIds = [];
            for(var i=0; i<_normIds.length; i++){
                var flag = false;
                for(var j=0; j<_normIds2.length; j++){
                    if(_normIds[i] == _normIds2[j]){
                        flag = true;
                        break;
                    }
                }
                if(flag == false){
                    addNormIds.push(_normIds[i]);
                }
            }
            return addNormIds;
        },
        /**
         * 删除sku
         */
        delSku : function () {
            var delNorms = $.goodsSkuDetailApp.getDelNorm();
            var delRecords = [];
            for(var i=0; i<delNorms.length; i++){
                var datas = $.goodsSkuDetailApp.skuTable.getData();
                for(var j=0; j<datas.length; j++){
                    var record = datas[j];
                    //查询的数据要保留
                    if(record['source'] == "1" && delNorms[i] == record['propertyValueId']){
                        delRecords.push(record);
                        $.goodsSkuDetailApp.skuTable.delRow(delRecords[i]);
                    }
                }
            }
            if(delRecords.length > 0){
                var datas = $.goodsSkuDetailApp.skuTable.getData();
                if(datas.length == 0){
                    $.goodsSkuDetailApp._normIds = [];
                    $.goodsSkuDetailApp._normNames = [];
                    $.goodsSkuDetailApp._skuPropertyNames = [];
                    $.goodsSkuDetailApp._normIds2 = [];
                    $.goodsSkuDetailApp._normNames2 = [];
                    $.goodsSkuDetailApp._skuPropertyNames2 = [];
                }else{
                    for(var i=0; i<$.goodsSkuDetailApp._normIds.length; i++){
                        for(var j=0; j<delNorms.length; j++){
                            if($.goodsSkuDetailApp._normIds[i] == delNorms[j]){
                                $.goodsSkuDetailApp._normIds.pop($.goodsSkuDetailApp._normIds[i]);
                                $.goodsSkuDetailApp._normNames.pop($.goodsSkuDetailApp._normNames[i]);
                                $.goodsSkuDetailApp._skuPropertyNames.pop($.goodsSkuDetailApp._skuPropertyNames[i]);
                            }
                        }
                    }
                    $.goodsSkuDetailApp._normIds2 = [];
                    $.goodsSkuDetailApp._normNames2 = [];
                    $.goodsSkuDetailApp._skuPropertyNames2 = [];
                    for(var i=0; i<$.goodsSkuDetailApp._normIds.length; i++){
                        $.goodsSkuDetailApp._normIds2.push($.goodsSkuDetailApp._normIds[i]);
                        $.goodsSkuDetailApp._normNames2.push($.goodsSkuDetailApp._normNames[i]);
                        $.goodsSkuDetailApp._skuPropertyNames2.push($.goodsSkuDetailApp._skuPropertyNames[i]);
                    }
                }
            }
        },
        /**
         * 获取删除的规格信息
         */
        getDelNorm : function () {
            var _normIds = $.goodsSkuDetailApp._normIds;
            var _normIds2 = $.goodsSkuDetailApp._normIds2;
            var delNormIds = [];
            for(var i=0; i<_normIds2.length; i++){
                var flag = false;
                for(var j=0; j<_normIds.length; j++){
                    if(_normIds2[i] == _normIds[j]){
                        flag = true;
                        break;
                    }
                }
                if(flag == false){
                    delNormIds.push(_normIds2[i]);
                }
            }
            return delNormIds;
        },
        /**
         * 获取选中的复选框
         */
        getCheckedList : function (purchasPropertys) {
            var _propertys = [];
            for(var i=0; i<purchasPropertys.length; i++){
                var ckName = "purchasePropery";
                $('input[name="'+ckName+'"]').each(function () {
                    var ck = $(this);
                    if(ck.hasClass($.goodsSkuDetailApp._checkbox_css)){
                        var propertyObj ={
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
                        for(var i=0; i<_propertys.length; i++){
                            var _tmp = _propertys[i];
                            if(propertyObj['propertyId'] == _tmp['propertyId'] && propertyObj['propertyValueId'] == _tmp['propertyValueId']){
                                flag = true;
                                break;
                            }
                        }
                        if(flag == false){
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
        hasItem : function (item, items) {
            var flag = false;
            for(var i=0; i<items.length; i++){
                if(item == items[i]){
                    flag = true;
                    break;
                }
            }
            return flag;
        },
        /* 获取自然属性信息
         */
        getNaturePropertyInfo : function () {
            var _naturePropertys = [];
            $('.naturePropertySelect').find("option:selected").each(function () {
                var opt = $(this);
                var propertyId = opt.attr("propertyId");
                if(propertyId != "" && undefined != propertyId){
                    var propertyObj ={
                        propertyId: opt.attr("propertyId"),//属性ID
                        propertyValueId: opt.attr("value"),//属性值ID
                        propertyValue: opt.text(),//属性值文字
                        isValid: opt.attr("isValid")//启停用状态
                    }
                    _naturePropertys.push(propertyObj);
                }
            })
            return _naturePropertys;
        }

    };
    $(document).ready(function (e) {
        $.goodsSkuDetailApp.init();
    });
}(jQuery));
