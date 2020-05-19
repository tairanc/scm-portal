/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {
    if($.getUrlParam("hideLogs")){
        $("span[class=logs-btn]").hide();
    }

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=ExternalItemSku&entityId=" + $.getUrlParam("id"));
    });
    
    var flag = $.getUrlParam("flag");

    $.externalGoodsDetailApp = {
        _dialog: null,
        _jdPictureUrl: "",//京东图片查看url
        init: function () {
            var skuCode = $.getUrlParam("skuCode")
            this.queryDetail(skuCode);
            BUI.use(['bui/uploader', 'bui/overlay'], function (Uploader, Overlay) {
                $.externalGoodsDetailApp._dialog = new Overlay.Dialog({
                    title: '图片查看',
                    width: 1000,
                    height: 600,
                    mask: false,
                    buttons: []
                });
            });

            $("#btn_list").on("click", function () {
                if ($.getUrlParam("isQuery")){
                    window.location.href = "goodsQuery.html?fromtab=" + $.getUrlParam("fromtab");
                }
                if($.getUrlParam("isList")){
                    window.location.href = "externalGoodsList.html";
                }
               /* if($.getUrlParam("hideLogs")){
                    window.location.href = "externalGoodsList.html";
                } */               
            });

            $("#btn_close").on("click",function(){
                if ($.getUrlParam("isClose")) {
                    window.parent.removeTab(window.location.href);
                } else {
                    window.close();
                } 
                if($.getUrlParam("orderPage")){
                    window.location.href= "../order/shopOrderDetail.html?platformOrderCode=" + $.getUrlParam("platformOrderCode")+"&shopOrderCode=" + $.getUrlParam("shopOrderCode");
                }                
            });

            if(flag == 1){
                $("#btn_list").hide();
                $("#btn_close").show();
            }

        },
        /***
         * 查询明细
         * @param skuCode
         */
        queryDetail: function (skuCode) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "goods/externalItemSkus";
            aContent.data = {skuCode: skuCode};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    var detail = result.result;
                    if(detail.length > 0){
                        $.externalGoodsDetailApp.setValue(detail[0]);
                    }
                }
            };
            $.ajax(aContent);
        },
        /**
         * 设置明细  b
         * @param detail
         */
        setValue: function (detail) {
            $.externalGoodsDetailApp._jdPictureUrl = detail['jdPictureUrl'];
            for (var key in detail) {
                var val = detail[key];
                if(val == null){
                    val = "";
                }
                $("#"+key).text(val);
            }
            $("#state").text($.dictTranslate("goodsStatus", detail['state']));
            $("#mainPictrue").text("");
            $("#detailPictrues").text("");
            this.showPic(detail['supplierCode2'], detail['mainPictrue'], detail['detailPictrues']);

        },
        /**
         * 显示图片
         * @param supplierCode 供应商编码:LY-粮油,JD-京东
         * @param mainPictrue
         * @param detailPictrues
         */
        showPic: function (supplierCode, mainPictruePath, detailPictruesPath) {
            if(supplierCode == "JD"){//京东
                if (mainPictruePath) {
                    var imgUrl = $.externalGoodsDetailApp._jdPictureUrl + "n4/" + mainPictruePath;
                    var img = $('<image style="width: 125px; height: 125px;" src="' + imgUrl + '"/>');
                    img.on('click', function () {
                        var imgUrl2 = $.externalGoodsDetailApp._jdPictureUrl + "n12/" + mainPictruePath;
                        $.externalGoodsDetailApp.showBigPic(imgUrl2)
                    });
                    $("#mainPictrue").append(img);
                }
                if (detailPictruesPath) {
                    var _tmpPaths = detailPictruesPath.split(",");
                    for (var i = 0; i < _tmpPaths.length; i++) {
                        if(_tmpPaths[i].length > 0){
                            var imgUrl = $.externalGoodsDetailApp._jdPictureUrl + "n4/" + _tmpPaths[i];
                            var imgUrl2 = $.externalGoodsDetailApp._jdPictureUrl + "n12/" + _tmpPaths[i];
                            var img = $('<image  style="width: 125px; height: 125px;float: left;"src="' + imgUrl + '" onclick=$.externalGoodsDetailApp.showBigPic("' + imgUrl2 + '")/>');
                            $("#detailPictrues").append(img);
                        }
                    }
                }
            }else{//粮油
                if (mainPictruePath) {
                    var img = $('<image style="width: 125px; height: 125px;" src="' + mainPictruePath + '"/>');
                    img.on('click', function () {
                        $.externalGoodsDetailApp.showBigPic(mainPictruePath)
                    });
                    $("#mainPictrue").append(img);
                }
                if (detailPictruesPath) {
                    var _tmpPaths = detailPictruesPath.split(",");
                    for (var i = 0; i < _tmpPaths.length; i++) {
                        var imgUrl = _tmpPaths[i];
                        if(imgUrl.length > 0){
                            var img = $('<image style="width: 125px; height: 125px;float: left;" src="' + imgUrl + '" onclick=$.externalGoodsDetailApp.showBigPic("' + imgUrl + '")/>');
                            $("#detailPictrues").append(img);
                        }

                    }
                }
            }


        },
        /**
         * 显示大图
         * @param imgUrl
         */
        showBigPic: function (imgUrl) {
            $.externalGoodsDetailApp._dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="max-width:1100px;width: auto; height: 100%;" src=' + imgUrl + '></div>');
            $.externalGoodsDetailApp._dialog.show();
        }


    };
    $(document).ready(function (e) {
        $.externalGoodsDetailApp.init();
    });
}(jQuery));
