/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){
    var errMsg;
    var sucMsg;
    var codeMsg;
    $.goodsAddApp = {
        uploadExt1 : null,
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
        skuTable : null,
        brandList:[],
        init:function(){
            window.onblur=function(){
                var inputs = $("input");
                for(var i=0; i<inputs.length; i++){
                 document.getElementsByTagName('input')[i].blur();
                }
            };
            this.initGoodsCategory();
            this.queryTradeType();
            this.initSkuTable();
            this.initPicUpload();            
            BUI.use(['bui/form','bui/tooltip','bui/uploader','bui/mask'],function(Form, Tooltip, Uploader, Mask){
                var form = new Form.Form({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();

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

                $(".bui-grid-body").css("overflow-y","auto");
                $("#save_btn").on("click",function(){
                    var formData = form.serializeToObject();                    
                    form.valid();
                    if($("input[name='isQuality']:checked").val()=="1"){
                        var qualityDay = $("#qualityDay").val();
                        if(qualityDay==""){
                            BUI.Message.Alert("请填写保质期天数！", "warning");
                        }else{
                            if(form.isValid()){
                                $.goodsAddApp.save(formData, tip);    
                            }                                                  
                        }
                    }else{
                        $("#qualityDay").val("1");                          
                        if($("input[name='isQuality']:checked").val()=="0"){
                            formData.qualityDay="";
                        }  
                        if(form.isValid()){
                            $.goodsAddApp.save(formData, tip);    
                        } 
                    }                                       
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "goodsList.html";
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });

                $('input[name="isQuality"]').on("change", function () {
                    var val = $(this).val();
                    if (val=="1") {
                        $("#qualityDay").val("");
                        $("#qualityDayDiv").show();                       
                        $("#qualityDay").blur(function(){
                            if($("#qualityDay").val()==''){
                                $("#errorShow").show();
                            }else{
                                $("#errorShow").hide();
                            }
                        });
                    } else {
                        $("#qualityDayDiv").hide();
                        $("#errorShow").hide();
                    }
                });

            });
        },

        /**
         * 初始化商品分类
         */
        initGoodsCategory: function () {

            BUI.use(['bui/overlay','bui/mask'],function(Overlay){

                var categorys;
                var dialog = new Overlay.Dialog({
                    title:'选择类目',
                    width:800,
                    // height:300,
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary',
                            handler : function(){
                                if(categorys){
                                    $.goodsAddApp.resetForm();
                                    var tmp = categorys.val();
                                    if(undefined == tmp || "" == tmp || "[]" == tmp){
                                        BUI.Message.Alert("请选择三级类目", "warning");
                                        return false;
                                    }
                                    var _categorys = JSON.parse(tmp);
                                    var select = $('#categoryId');
                                    var option = $('<option value="'+_categorys[0]["categoryId"]+'" selected="true">'+_categorys[0]["categoryName"]+'</option'+'>');
                                    select.append(option);
                                    //删除错误校验
                                    select.parent().find(".x-field-error").remove();3
                                    var categoryId = _categorys[0]["categoryId"];
                                    //查询分类相关商品                                    
                                    $.goodsAddApp.queryBrand(categoryId);                               
                                    $("#brandId").removeAttr("disabled");
                                    $("#brandId").chosen();
                                    //查询分类相关属性
                                    $.goodsAddApp.queryCategoryProperty(categoryId);
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
                        url : 'goodsCategorySelect.html',
                        autoLoad : false, //不自动加载
                        callback : function(text){
                            categorys = dialog.get('el').find('#categorys');
                        }
                    },
                    mask:true
                });
                $("#categoryId").on('click', function () {
                    $("#brandId").attr("disabled","disabled");
                    //重置全局变量
                    $.goodsAddApp._normIds = [];
                    $.goodsAddApp._normNames = [];
                    $.goodsAddApp._skuPropertyNames = [];
                    $.goodsAddApp._normIds2 = [];
                    $.goodsAddApp._normNames2 = [];
                    $.goodsAddApp._skuPropertyNames2 = [];
                    //清空sku信息
                    $.goodsAddApp.skuTable.clear();

                    dialog.get('loader').load({});
                    dialog.show();
                });

            });

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
        queryBrand : function (categoryId) {
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
                    };
                    $.AddItem2("brandId", items,'brandId','brandName', "全部品牌", []);
                    $('#brandId').trigger('chosen:updated');
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
            aContent.url = $.scmServerUrl+"category/categoryProperty/"+categoryId;
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
                        var isValid = propertys[i]['isValid'];
                        if(isValid == "1"){
                            propertyIds += propertys[i]['propertyId']+",";
                            if($.goodsAddApp.NATURE_PROPERTY == propertys[i]['typeCode']){
                                natureProps.push(propertys[i]);
                            }else{
                                purchaseProps.push(propertys[i]);
                            }
                        }
                    }
                    if(propertyIds != ""){
                        propertyIds = propertyIds.substring(0, propertyIds.length-1);
                    }
                    $.goodsAddApp.setPropertyForm(propertyIds, natureProps, purchaseProps);
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
                    $.goodsAddApp._purchasPropertys = purchaseProps;
                    $.goodsAddApp._purchasPropertyValues = purchasePropertyValues;
                    $.goodsAddApp.setProperty("naturePropertys", natureProps, naturePropertyValues);
                    $.goodsAddApp.setProperty("purchasePropertys", purchaseProps, purchasePropertyValues);
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
                var isValid = propertys[i]['isValid'];
                if(isValid == "1"){
                    var _row = $('<div class="row" style="padding-bottom:20px;"></div>');
                    var _group = $('<div class="control-group span30"></div>');
                    var _label = $('<label style="margin-top: 5px;" class="control-label">'+propertys[i]['name']+':</label>');
                    var _controls = $('<div  class="controls"></div>');
                    var _target = "";
                    var valueType = propertys[i]['valueType'];
                    var propertyId = propertys[i]['propertyId'];
                    var propertyName = propertys[i]['name'];
                    var propertySort = propertys[i]['propertySort'];
                    var typeCode = propertys[i]['typeCode'];

                    var name = "naturePropery";
                    if($.goodsAddApp.PURCHASE_PROPERTY == typeCode){
                        name = "purchasePropery";
                    }
                    if($.goodsAddApp.NATURE_PROPERTY == typeCode){
                        _target = $('<select name="'+name+'" class="naturePropertySelect"><option value="">请选择</option></select>');
                        for(var j=0; j<propertyValues.length; j++){
                            var propertyValueId = propertyValues[j]["id"];
                            var propertyValue = propertyValues[j]["value"];
                            var _propertyId = propertyValues[j]["propertyId"];
                            var _isValid = propertyValues[j]["isValid"];
                            if(_isValid == "1"){
                                if(propertyId == _propertyId){
                                    var _option = $('<option propertyId="'+propertyId+'" value="'+propertyValueId+'">'+propertyValue+'</option>');
                                    _target.append(_option);
                                }
                            }
                        }
                    }else{
                        _target = $('<div id="purchaseDiv" style="margin-top: 12px;"></div>');
                        for(var j=0; j<propertyValues.length; j++){
                            var propertyValueId = propertyValues[j]["id"];
                            var propertyValue = propertyValues[j]['value'];
                            var picture = propertyValues[j]["picture"];
                            var sort = propertyValues[j]["sort"];
                            var _propertyId = propertyValues[j]["propertyId"];
                            var _isValid = propertyValues[j]["isValid"];
                            if(propertyId == _propertyId && _isValid == "1"){
                                var label = $('<label style="margin-top: 5px; margin-left: 20px;" class="checkbox"></label>');
                                var _ckCls = "myCk";
                                if($.goodsAddApp.NATURE_PROPERTY == typeCode){
                                    _ckCls = "naturePropertyCheck";
                                }
                                var _ckbox = $('<input type="checkbox" class="'+_ckCls+'" name="'+name+'" type="checkbox" propertyId="'+propertyId+'" propertyName="'+propertyName+'" propertySort="'+propertySort+'" sort="'+sort+'" picture="'+picture+'" propertyValue="'+propertyValue+'"  value="'+propertyValueId+'"/>');
                                //复选框状态改变事件
                                _ckbox.on('change', function () {
                                    var _target = $(this);
                                    if(_target.hasClass($.goodsAddApp._checkbox_css)){
                                        _target.removeClass($.goodsAddApp._checkbox_css);
                                    }else{
                                        _target.addClass($.goodsAddApp._checkbox_css);
                                    }
                                    //处理复选框选择
                                    $.goodsAddApp.handerProertyChecked();
                                    //添加sku
                                    $.goodsAddApp.addSku();
                                    //删除sku
                                    $.goodsAddApp.delSku();
                                });

                                label.append(_ckbox);
                                label.append('<span style="margin-top: 10px;">'+propertyValue+'</span>&nbsp;');
                                if(valueType == "1"){   
                                    if(!/^http/.test(picture)){
                                        var img = $('<img style="width: 25px; height: 25px;" onclick=$.goodsAddApp.showImg("'+picture+'") src="'+propertyValues[j]["picUrl"]+'"/>')
                                        label.append(img);
                                    }else{
                                        var img = $('<img style="width: 25px; height: 25px;" onclick=$.goodsAddApp.showImg("'+picture+'") src="'+picture+'"/>')
                                        label.append(img);
                                    }                                                                    
                                }
                                _target.append(label);
                            }
                        }
                    }
                    if(_target != ""){
                        _controls.append(_target);
                        _group.append(_label);
                        _group.append(_controls);
                        _row.append(_group);
                        $("#"+reder).append(_row);
                    }

                }

            }
        },
        /**
         * 显示图片
         * @param key
         */
        showImg : function (key) {
            if(!/^http/.test(key)){
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + 'qinniu/download';
                aContent.data = {fileName: key};
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        $.goodsAddApp.showImgDialog(result.result);
                    }
                };
                $.ajax(aContent);   
            }else{
                 $.goodsAddApp.showImgDialog(key);
            }
            
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

                dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="max-width:1100px;width:auto; height: 100%;width:950px;" src='+url+'></div>');
                dialog.show();

            });
        },
        /**
         * 处理复选框选择
         */
        handerProertyChecked : function () {
            var count = 0;
            $.goodsAddApp._normIds = [];
            $.goodsAddApp._normNames = [];
            $.goodsAddApp._skuPropertyNames = [];
            var checkedList = $.goodsAddApp.getCheckedList($.goodsAddApp._purchasPropertys);
            if($.goodsAddApp._purchasPropertys.length == 1){
                var _property = $.goodsAddApp._purchasPropertys[0];
                for(var i=0; i<checkedList.length; i++){
                    var checkbox = checkedList[i];
                    if($.goodsAddApp._purchasPropertys[0]['propertyId'] == checkedList[i]['propertyId']){
                        var name = $.goodsAddApp._purchasPropertys[0]['name']+":"+checkedList[i]['propertyValue'];
                        var id = checkbox['propertyValueId'];
                        var name = checkbox['propertyValue'];
                        var skuName = _property['name']+':'+checkbox['propertyValue'];
                        if($.goodsAddApp.hasItem(id, $.goodsAddApp._normIds) == false){
                            $.goodsAddApp._normIds.push(id);
                        }
                        if($.goodsAddApp.hasItem(name, $.goodsAddApp._normNames) == false){
                            $.goodsAddApp._normNames.push(name);
                        }
                        if($.goodsAddApp.hasItem(skuName, $.goodsAddApp._skuPropertyNames) == false){
                            $.goodsAddApp._skuPropertyNames.push(skuName);
                        }
                    }
                }
            }else{
                for(var i=0; i<checkedList.length; i++){
                    if($.goodsAddApp._purchasPropertys[count]['propertyId'] == checkedList[i]['propertyId']){
                        var name = $.goodsAddApp._purchasPropertys[count]['name']+":"+checkedList[i]['propertyValue'];
                        $.goodsAddApp.getNorm(checkedList[i]['propertyValueId'], checkedList[i]['propertyValue'], name, checkedList, count+1);
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
            var _property = $.goodsAddApp._purchasPropertys[count];
            for(var i=0; i<checkedList.length; i++){
                var checkbox = checkedList[i];
                if(_property['propertyId'] == checkbox['propertyId']){
                    var id = prePropertyValueId+","+checkbox['propertyValueId'];
                    var name = prePropertyValueName+","+checkbox['propertyValue'];
                    var skuName = prePropertyName+" | "+_property['name']+':'+checkbox['propertyValue'];
                    if(count == ($.goodsAddApp._purchasPropertys.length-1)){
                        if($.goodsAddApp.hasItem(id, $.goodsAddApp._normIds) == false){
                            $.goodsAddApp._normIds.push(id);
                        }
                        if($.goodsAddApp.hasItem(name, $.goodsAddApp._normNames) == false){
                            $.goodsAddApp._normNames.push(name);
                        }
                        if($.goodsAddApp.hasItem(skuName, $.goodsAddApp._skuPropertyNames) == false){
                            $.goodsAddApp._skuPropertyNames.push(skuName);
                        }
                    }else{
                        $.goodsAddApp.getNorm(id, name, skuName, checkedList, count+1);
                    }
                }
            }
        },
        /**
         * 添加sku
         */
        addSku : function () {
            var addNorms = $.goodsAddApp.getAddNorm();
            var _normIds = $.goodsAddApp._normIds;
            var _normNames = $.goodsAddApp._normNames;
            var _skuPropertyNames = $.goodsAddApp._skuPropertyNames;
            for(var i=0; i<addNorms.length; i++){
                for(var j=0; j<_normIds.length; j++){
                    if(addNorms[i] == _normIds[j]){
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
                            marketPrice2: '',//市场价
                            weight2: '',//重量
                            picture: '',//图片
                            isValid: '1'//状态
                        };
                        $.goodsAddApp.skuTable.addRow(record);
                    }
                }
            }
            if(addNorms.length > 0){
                $.goodsAddApp._normIds2 = [];
                $.goodsAddApp._normNames2 = [];
                $.goodsAddApp._skuPropertyNames2 = [];
                for(var i=0; i<$.goodsAddApp._normIds.length; i++){
                    $.goodsAddApp._normIds2.push($.goodsAddApp._normIds[i]);
                    $.goodsAddApp._normNames2.push($.goodsAddApp._normNames[i]);
                    $.goodsAddApp._skuPropertyNames2.push($.goodsAddApp._skuPropertyNames[i]);
                }
            }

        },

        /**
         * 获取新增的规格信息
         */
        getAddNorm : function () {
            var _normIds = $.goodsAddApp._normIds;
            var _normIds2 = $.goodsAddApp._normIds2;
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
            var delNorms = $.goodsAddApp.getDelNorm();
            var delRecords = [];
            for(var i=0; i<delNorms.length; i++){
                var datas = $.goodsAddApp.skuTable.getData();
                for(var j=0; j<datas.length; j++){
                    var record = datas[j];
                    if(delNorms[i] == record['propertyValueId']){
                        delRecords.push(record);
                        $.goodsAddApp.skuTable.delRow(delRecords[i]);
                    }
                }
            }
            if(delRecords.length > 0){
                var datas = $.goodsAddApp.skuTable.getData();
                if(datas.length == 0){
                    $.goodsAddApp._normIds = [];
                    $.goodsAddApp._normNames = [];
                    $.goodsAddApp._skuPropertyNames = [];
                    $.goodsAddApp._normIds2 = [];
                    $.goodsAddApp._normNames2 = [];
                    $.goodsAddApp._skuPropertyNames2 = [];
                }else{
                    for(var i=0; i<$.goodsAddApp._normIds.length; i++){
                        for(var j=0; j<delNorms.length; j++){
                            if($.goodsAddApp._normIds[i] == delNorms[j]){
                                $.goodsAddApp._normIds.pop($.goodsAddApp._normIds[i]);
                                $.goodsAddApp._normNames.pop($.goodsAddApp._normNames[i]);
                                $.goodsAddApp._skuPropertyNames.pop($.goodsAddApp._skuPropertyNames[i]);
                            }
                        }
                    }
                    $.goodsAddApp._normIds2 = [];
                    $.goodsAddApp._normNames2 = [];
                    $.goodsAddApp._skuPropertyNames2 = [];
                    for(var i=0; i<$.goodsAddApp._normIds.length; i++){
                        $.goodsAddApp._normIds2.push($.goodsAddApp._normIds[i]);
                        $.goodsAddApp._normNames2.push($.goodsAddApp._normNames[i]);
                        $.goodsAddApp._skuPropertyNames2.push($.goodsAddApp._skuPropertyNames[i]);
                    }
                }
            }
        },
        /**
         * 获取删除的规格信息
         */
        getDelNorm : function () {
            var _normIds = $.goodsAddApp._normIds;
            var _normIds2 = $.goodsAddApp._normIds2;
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
                    if(ck.hasClass($.goodsAddApp._checkbox_css)){
                        var propertyObj ={
                            propertyId: ck.attr("propertyId"),//属性ID
                            propertyName: ck.attr("propertyName"),//属性名称
                            propertySort: ck.attr("propertySort"),//属性排序
                            propertyValueId: ck.attr("value"),//属性值ID
                            propertyValue: ck.attr("propertyValue"),//属性值文字
                            sort: ck.attr("sort"),//属性值排序
                            picture: ck.attr("picture")//属性值图片
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


        /**
         * 初始化sku表格
         */
        initSkuTable : function () {
            // BUI.use(['bui/form','bui/overlay','bui/mask'],function(Form, Overlay) {
            BUI.use(['bui/data'],function(Data){
                var records=[];
                var isValids = {
                    '1' : '启用',
                    '0' : '停用'
                };                
                var columns = [
                    {title: 'SKU编码', dataIndex: 'skuCode', visible: false},
                    {title: '属性值ID', dataIndex: 'propertyValueId', visible: false},
                    {title: '属性值', dataIndex: 'propertyValue', visible: false},
                    {title: '规格', dataIndex: 'normName',
                        width: '25%',
                        elCls: 'center'
                    },
                    {title: '<font style="color: red">*</font>SKU名称', dataIndex: 'skuName',
                        width: '15%',
                        elCls: 'center',
                        editor: {xtype: 'text', rules: {required:true}}
                    },
                    {
                        title: '<font style="color: red">*</font>条形码<br>(多个请用英文逗号,隔开)',
                        dataIndex: 'barCode',
                        width: '15%',
                        height: '30px',
                        elCls: 'center',
                        barcode : 'barcode',
                        editor: {
                            xtype: 'text',validator:function(barCode,skuGrid){    
                            var isValid = skuGrid.isValid;   
                            var barCode =  barCode.replace(/\s+/g, "");                                     
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
                                    var isValidList = []
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
                                        return checkError
                                    }                                  
                                } 
                                var aContent = $.AjaxContent();
                                aContent.url = $.scmServerUrl + "goods/checkBarcodeOnly";
                                aContent.data = {"barCode": barCode,"isValid": isValid};
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
                        title: '参考市场价(元)',
                        dataIndex: 'marketPrice2',
                        width: '15%',
                        elCls: 'center',
                        editor: {xtype: 'text', rules: {number:true, price:0}}
                    },
                    {
                        title: '重量(KG)',
                        dataIndex: 'weight2',
                        width: '15%',
                        elCls: 'center',
                        editor: {xtype: 'text', rules: {number:true, kgNumber:0}}
                    },
                    {
                        title: '图片(最多3张)', dataIndex: 'picture',
                        width: '18%',
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
                        width: '12%',
                        elCls: 'center',
                        renderer:function (val) {
                            var checked ;
                            if(val == 1){
                                checked = "checked";
                            }else{
                                checked = "";
                            }
                            return '<div class="bui-form-group"><input class="checkbox isValidType"  type="checkbox" '+ checked +'><label style="vertical-align: text-bottom;">启用</label></div>';
                        }
                    }
                ];
                $.goodsAddApp.skuTable = new DynamicGrid(columns);
                var dataConfig = {
                    gridId: "skuGrid",
                    // formId: "J_Form",
                    uploadUrl: $.scmServerUrl + 'qinniu/upload/goods',
                    batchDownloadUrl: $.scmServerUrl + 'qinniu/urls?thumbnail=1',
                    uploadMax:3,
                    // uploadId:""
                    // sortName:""
                };
                $.goodsAddApp.skuTable.initData([],dataConfig)
            })
        },
        /**
         * 获取自然属性信息
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
                        propertyValue: opt.text()//属性值文字
                    }
                    _naturePropertys.push(propertyObj);
                }
            })
            return _naturePropertys;
        },
        /***
         * 保存商品
         * @param fromData
         */
        save:function(fromData,tip){
            //检查文件上传状态
            if($.checkUploadStatus() == true){
                //$.showLoadMask();
                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl+"goods/goods";
                aContent.type = "POST";
                aContent.success = function(result,textStatus){
                    if(result.appcode != 1){
                        BUI.Message.Alert(result.databuffer,'warning');
                    }else{
                        window.location.href = "goodsList.html";
                    }
                };

                if($.goodsAddApp.skuTable.isValid()){
                    //设置sku参数
                    var skus = $.goodsAddApp.skuTable.getData();
                    if(skus.length == 0){
                        $.hideLoadMask();
                        BUI.Message.Alert("商品sku信息不能为空","warning");
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
                        };                    
                    }
                    fromData['skusInfo'] = JSON.stringify(skus);
                    //设置自然属性参数
                    var _naturePropertys = $.goodsAddApp.getNaturePropertyInfo();
                    if(_naturePropertys.length > 0){
                        fromData['naturePropertys'] = JSON.stringify(_naturePropertys);
                    }
                    //设置采购属性参数
                    var _purchasePropertys = $.goodsAddApp.getCheckedList($.goodsAddApp._purchasPropertys);
                    fromData['salesPropertys'] = JSON.stringify(_purchasePropertys);

                    aContent.data = fromData;

                    $.ajax(aContent);
                }
            }            
        }
    };
    $(document).ready(function (e) {
        $.goodsAddApp.init();
    });
}(jQuery));
