/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.supplierBrandSelectApp = {
        supplierCode : "",
        brandList : "",
        init : function(){

            setTimeout(function () {
                $.supplierBrandSelectApp.queryBrand();
            },300);


            BUI.use(['bui/form','bui/select','bui/list'],function(Form, Select, List){

                var _defautItems = [{text:'选择品牌', value:""}];
                $.supplierBrandSelectApp.brandList = new List.SimpleList({
                    elCls:'bui-select-list',
                    multipleSelect : true,
                    itemTpl : '<li><span class="x-checkbox"></span>{text}</li>',
                    items :_defautItems,
                    render : '#brand',
                    listeners : {
                        'itemselected' : function (e) {
                            var item = e.item;
                            if(item['value'] != ""){
                                selectBrand(item);
                            }
                        },
                        'itemunselected' : function (e) {
                            var item = e.item;
                            if(item['value'] != ""){
                                unSelectBrand(item);
                            }
                        }
                    }
                });
                $.supplierBrandSelectApp.brandList.render();

                /**
                 * 选择品牌
                 * @param item
                 */
                function selectBrand(item) {
                    var brandId = item['value'];
                    var brandName = item['text'];
                    var brandCode = item['brandCode'];
                    var categoryId = item['categoryId'];
                    var categoryCode = item['categoryCode'];
                    var categoryName = item['categoryName'];

                    //将选择的分类值付给<span>和隐藏域
                    var categoryBrands = $("#categoryBrands").val();
                    var _categoryBrands = [];
                    if("" != categoryBrands){
                        _categoryBrands = JSON.parse(categoryBrands);
                    }
                    var spanText = $("#brandNames").text();
                    if(hasBrandId(categoryId, brandId, _categoryBrands) == false){
                        _categoryBrands.push({brandId:brandId, brandCode:brandCode, brandName:brandName, categoryId: categoryId, categoryCode: categoryCode, categoryName:categoryName});
                        $("#categoryBrands").val(JSON.stringify(_categoryBrands));
                        if("" != spanText){
                            spanText += ",";
                        }
                        spanText += brandName;
                        $("#brandNames").text(spanText);
                    }else{
                        BUI.Message.Alert("品牌"+brandName+"已选择",'warning');
                    }
                }

                /**
                 * 取消选择品牌
                 * @param item
                 */
                function unSelectBrand(item) {
                    var brandId = item['value'];
                    var brandName = item['text'];
                    var brandCode = item['brandCode'];
                    var categoryId = item['categoryId'];
                    var categoryCode = item['categoryCode'];
                    var categoryName = item['categoryName'];

                    //将选择的分类值付给<span>和隐藏域
                    var categoryBrands = $("#categoryBrands").val();
                    var _categoryBrands = [];
                    if("" != categoryBrands){
                        _categoryBrands = JSON.parse(categoryBrands);
                    }
                    var spanText = $("#brandNames").text();
                    var _categoryBrands2 = [];
                    for(var i=0; i<_categoryBrands.length; i++){
                        if(brandId != _categoryBrands[i]['brandId']){
                            _categoryBrands2.push(_categoryBrands[i]);
                        }
                    }
                    $("#categoryBrands").val(JSON.stringify(_categoryBrands2));
                    var _len = spanText.length;
                    var _str = "," + brandName;
                    spanText = spanText.replace(_str, "");
                    if(_len == spanText.length){
                        var _str2 = brandName + ",";
                        spanText = spanText.replace(_str2, "");
                    }
                    if(_len == spanText.length){
                        spanText = spanText.replace(brandName, "");
                    }
                    $("#brandNames").text(spanText);
                }
                

                /**
                 * 判断列表里面是否包含品牌ID
                 * @param categoryId 分类ID
                 * @param brandId 品牌ID
                 * @param categoryBrands 分类品牌记录列表
                 */
                function hasBrandId(categoryId, brandId, categoryBrands) {
                    for(var i=0; i<categoryBrands.length; i++){
                        if(categoryId == categoryBrands[i]['categoryId'] && brandId == categoryBrands[i]['brandId']){
                            return true;
                        }
                    }
                    return false;
                }

            });

        },
        /**
         * 品牌查询
         */
        queryBrand : function () {

            $.supplierAddApp.handlerSelectedBrand();

            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/categoryBrands";
            var categoryId = $("#categoryIds").val();
            aContent.data = {categoryId : categoryId};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else {
                    var data = result.result;
                    var items = [];
                    if (data.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i]['isValid'] == "1") {
                                var item = {};
                                var categoryId = data[i]['categoryId'];
                                var categoryCode = data[i]['categoryCode'];
                                var brandId = data[i]['brandId'];
                                var brandCode = data[i]['brandCode'];
                                item['text'] = data[i]['brandName'];
                                item['value'] = brandId;
                                item['brandCode'] = data[i]['brandCode'];
                                item['categoryId'] = categoryId;
                                item['categoryCode'] = data[i]['categoryCode'];
                                item['categoryName'] = data[i]['categoryName'];
                                var flag = false;
                                for (var j = 0; j < items.length; j++) {
                                    if (categoryId == items[j]['categoryId'] && brandId == items[j]['value']) {
                                        flag = true;
                                        break;
                                    }
                                }
                                var ids = JSON.parse($("#selCategoryBrands").val() || "[]");
                                var _tmp = categoryCode+"-"+brandCode;
                                if (flag == false && ids.indexOf(_tmp) == -1) {
                                    items.push(item);
                                }
                            }
                        }
                        if (items.length > 0) {
                            $.supplierBrandSelectApp.brandList.set('items', items);
                        }
                        // $.AddItem2("brand", data, 'brandId', 'brandName','请选择品牌',[]);
                        // $("#brand").chosen();  
                        // $('#brand').trigger('chosen:updated');
                        // $(".chosen-container-multi").css('width','300px')
                    }
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.supplierBrandSelectApp.init();
    });
}(jQuery));