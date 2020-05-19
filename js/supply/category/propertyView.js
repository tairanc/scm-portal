/**
 * Created by hzszy on 2017/5/19.
 */
(function () {
    $.propertyView = {
        record: null,
        resultImg: null,
        resultUrl: null,
        picHttpImgs:null,
        init: function () {
            this.queryAllProperty();
            var tableArray = new Array();
            tableArray = $.categoryProperty.table.getData();

            BUI.use('bui/form', function (Form) {
                var form = new Form.HForm({
                    srcNode: '#sel_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                form.render();
            });

            // $.propertyView.record = $.categoryProperty.propertyAll;
            for (var i = 0; i < $.propertyView.record.length; i++) {
                // console.log($.propertyView.record[i].name + "     propertyDiv" + $.propertyView.record[i].id);
                $("#propertyName").append("<div id='propertyDiv" + $.propertyView.record[i].id + "'><label class='bui-form-field-radiolist' >" + "<input type='hidden' id='property" + $.propertyView.record[i].id + "' value=" + i + ">" +
                    "<input name='property' type='radio' value=" + $.propertyView.record[i].id + ">" + $.propertyView.record[i].name + "</label>" +
                    "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</div>");
            }

            for (var j = 0; j < tableArray.length; j++) {
                if (tableArray[j].status != 3) {
                    $("#propertyDiv" + tableArray[j].propertyId + "").hide();
                }
            }

            $("#select_btn_property").on("click", function () {
                var id = $("input[name='property']:checked").val();
                if (id == null) {
                    // alert("请选中一个属性!");
                    BUI.Message.Alert("请选中一个属性!",'warning');
                    return false;
                }
                else {
                    var str = "#property" + id;
                    var i = $(str).val();
                    var rowDate = new Array();


                    rowDate = {
                        id: id,
                        propertyId: id,
                        isValid: $.propertyView.record[i].isValid,
                        isDeleted: $.propertyView.record[i].isDeleted,
                        name: $.propertyView.record[i].name,
                        typeCode: $.propertyView.record[i].typeCode,
                    };
                    for (var i = 0; i < tableArray.length; i++) {
                        if (id == tableArray[i].propertyId) {
                            // alert("该属性已关联,请选择其他属性!");
                            BUI.Message.Alert("该属性已关联,请选择其他属性!",'warning');
                            return;
                        }
                    }
                    $.categoryProperty.table.addRow(rowDate,0);
                    $.categoryProperty.dialog.close();
                    $.categoryProperty.propertyGridPager.init();

                }
            });
            $("#btn_back_property").on("click", function () {
                $.categoryProperty.dialog.close();
            });
            $(":radio").click(function () {
                var id = $(this).val();
                $("#propertyValue").empty();
                for (var i = 0; i < $.propertyView.record.length; i++) {
                    if ($.propertyView.record[i].id == id) {
                        $.propertyView.queryValueList(id, $.propertyView.record[i]);
                    }
                }
            });
            //查询按钮
            $("#sel_btn").on("click", function () {
                var queryString = $("#name").val();
                $.propertyView.searchProperty(queryString);
            });
        },
        /***
         * 查询属性值列表
         */
        queryValueList: function (id, record) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/propertyValues/search";
            aContent.data = {"propertyId": id};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    var resultData = result.result;
                    var imgPath = "";
                    var  propertyValue= new Array();
                    if (record.valueType == 1) {
                        for (var i = 0; i < resultData.length; i++) {
                            imgPath +=  resultData[i].picture+",";
                            propertyValue.push(resultData[i].value);
                        }
                    }
                    else {
                        for (var i = 0; i < resultData.length; i++) {
                            $("#propertyValue").append("<text>" + resultData[i].value + "</text></br>");
                        }
                    }
                    if (imgPath != "") {
                        $.propertyView.queryImg(imgPath,propertyValue);
                    }
                }
            }
            ;
            $.ajax(aContent);
        },


        /**
         * 获取图片
         * @param url
         */
        queryImg: function (url,propertyValue) {
            var imgPics = url.substr(0,url.length-1).split(",");
            $.propertyView.picHttpImgs = imgPics;
            for(let j=0;j<imgPics.length;j++){
                if(!/^http/.test(imgPics[j])){
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl + "qinniu/urls?thumbnail=1&fileNames=" + imgPics[j];
                    aContent.success = function (result, textStatus) {
                        if (result.appcode != 1) {
                             BUI.Message.Alert(result.databuffer,'warning');
                        } else {
                            var resultUrl = result.result;
                            $.propertyView.resultImg = resultUrl;
                                $("#propertyValue").append("<div><label style='display:inline-block;width:55px;'>"+propertyValue[j]+"</label><img onclick='$.propertyView.imgClick(" + j + ")' id='img" + j + "' " +
                                    "style='width: 50px;height: 50px;margin: 15px' src=" + resultUrl[0].url + "/></br></div>");

                        }
                    };
                    $.ajax(aContent);
                }else{
                    $("#propertyValue").append("<div><label style='display:inline-block;width:55px;'>"+propertyValue[j]+"</label><img onclick='$.propertyView.imgClickHttp(" + j + ")' id='img" + j + "' " +
                                "style='width: 50px;height: 50px;margin: 15px' src=" + imgPics[j] + "></br></div>");
    
                }  
            }                
        },
        imgClickHttp:function(i){
            var imgUrl = $.propertyView.picHttpImgs[i];
            BUI.use(['bui/overlay'], function (Overlay) {
                var dialog = new Overlay.Dialog({
                    title: '图片查看',
                    width: 800,
                    height: 600,
                    mask: false,
                    buttons: []
                });
                dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="width:auto; height: 100%;max-width:1100px;width:775px;" src=' + imgUrl + '></div>');
                dialog.show();

            });
        },
        imgClick: function (i) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "qinniu/urls?thumbnail=0&fileNames=" + $.propertyView.resultImg[i].fileKey + ",";
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {

                    var url = result.result[0].url;
                    BUI.use(['bui/overlay'], function (Overlay) {
                        var dialog = new Overlay.Dialog({
                            title: '图片查看',
                            width: 800,
                            height: 600,
                            mask: false,
                            buttons: []
                        });
                        dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="width:auto; height: 100%;max-width:1100px;width:775px;" src=' + url + '></div>');
                        dialog.show();

                    });
                }
            };
            $.ajax(aContent);
        },

        /**
         * 查询所有属性
         */
        queryAllProperty: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/propertyall";
            aContent.data = {};
            aContent.async = false;
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    // console.log(result.result);
                    $.propertyView.record = result.result;
                }
            }
            $.ajax(aContent);
        }

        ,


        searchProperty: function (queryString) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/propertyall";
            aContent.data = {"queryString": queryString};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $("#propertyName").empty();
                    $("#propertyValue").empty();
                    $.propertyView.record = result.result;
                    console.log(1111)
                    console.log($.propertyView.record)
                    if($.propertyView.record.length==0){
                        $("#propertyName").append("<div style='color:red;margin-top:15px;font-size:16px;'>未查询到相关属性信息</div>")
                    }else{
                        for (var i = 0; i < $.propertyView.record.length; i++) {
                            $("#propertyName").append("<div><label class='bui-form-field-radiolist' >" + "<input type='hidden' id='property" + $.propertyView.record[i].id + "' value=" + i + ">" +
                                "<input name='property' type='radio' value=" + $.propertyView.record[i].id + ">" + $.propertyView.record[i].name + "</label>" +
                                "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</div>");
                        } 
                    }                    
                    $(":radio").click(function () {
                        var id = $(this).val();
                        $("#propertyValue").empty();
                        for (var i = 0; i < $.propertyView.record.length; i++) {
                            if ($.propertyView.record[i].id == id) {
                                $.propertyView.queryValueList(id, $.propertyView.record[i]);
                            }
                        }
                    });
                }
            }
            $.ajax(aContent);
        }
    }
})(jQuery);