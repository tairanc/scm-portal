/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=Brand&entityId=" + $.getUrlParam("id"));
    });
    var temp = "";//用于标记原始的name
    $.brandUpdateApp = {
            _isValid : "",
        uploadExt1 : null,//品牌文件上传对象

        init:function(){
            var id = $.getUrlParam("id")
            var brandUrl=$.getUrlParam("webUrl")
            $.brandUpdateApp.fileForm(id);

        	BUI.use(['bui/form','bui/tooltip'],function(Form, Tooltip){
                var form = new Form.HForm({
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

                // $("#save_btn").on("click",function(){
                //     var formData = form.serializeToObject();
                //     if(form.isValid()){
                //         $.showLoadMask();
                //         $.brandUpdateApp.save(formData, tip);
                //     }
                // });

                $("#save_btn").on("click", function () {
                    if (form.isValid()){
                        var nameflag = false;
                        if(temp == $("#name").val()){
                            nameflag = true;
                        };
                        $.brandUpdateApp.checkBrand(false, function () {
                            var formData = form.serializeToObject();
                            formData.name = $.trim(formData.name);
                            $.brandUpdateApp.save(formData, tip);                                                                
                        },nameflag);
                    }
                });

                $("#btn_list").on("click",function(){
                    window.location.href = "brandList.html";
                });

                $("#name").on("blur", function () {                    
                    var name = $.trim($("#name").val());
                    if (temp == name) {
                        return;
                    }
                    if (name == "") {
                        return false;
                    }
                    if (form.isValid()){
                        $.brandUpdateApp.checkBrand(true);
                    }
                });

                $("#reset_btn").on("click",function(){
                    var currentUrl = window.location.href;
                    window.location.href = currentUrl;
                });

                $("#webUrl").on("blur",function(){
                    var webUrl = $("#webUrl").val();
                    if(webUrl!=""){
                        var re=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
                        var result=webUrl.match(re);
                        if(!result){
                            BUI.Message.Alert("该品牌网址格式有误,请重新输入！");
                            $("#webUrl").val(brandUrl);
                        }
                    }
                });
            });
        },
        /***
         * 填充表单
         * @param id zhujianID
         */
        fileForm:function (id) {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/brand/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    alert("查询品牌类型明细失败."+result.databuffer)
                }else{
                    var brandDtl = result.result;
                    $("#id").val(brandDtl.id);
                    $("#name").val(brandDtl.name);
                    $("#alise").val(brandDtl.alise);
                    $("#webUrl").val(brandDtl.webUrl);
                    $("#logo").val(brandDtl.logo);
                    // $.brandUpdateApp._isValid = brandDtl.isValid;
                    $.setRadioChecked('isValid',brandDtl.isValid);
                    $.brandUpdateApp.initPicUpload();
                }
            };
            $.ajax(aContent);
        },

        //校验品牌名称唯一性
        checkBrand: function (isShowAlert, successFun,nameflag) {
            var name = $.trim($("#name").val());
            var id = $.getUrlParam("id");
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/brand/checkName";
            aContent.data = {"name": name,"id":id};
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该品牌名称已经存在,请用其他名称！", "warning");
                        }
                        if(nameflag) {
                            successFun()
                        }
                        $("#name").val("");
                    }else {
                        if (successFun) {
                            successFun()
                        }
                    }
                }
            };
            $.ajax(aContent);
        },

        /***
         * 保存字典类型
         * @param fromData
         */
        save:function(fromData, tip){
            //删除图片
            if($.brandUpdateApp.uploadExt1.removeFiles() == false){
                return false;
            }
            //检查文件上传状态
            if($.checkUploadStatus() == true){
            var aContent = $.AjaxContent(function(){
                $.hideLoadMask();
            });
            aContent.url = $.scmServerUrl+"category/brand/"+fromData['id'];
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                window.location.href = "brandList.html";
            };
            $.ajax(aContent);
            }
        },

        /***
         * 初始化图片上传
         */
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
                max: [1, '文件的最大个数不能超过{0}个'],
                //文件大小的最小值,这个单位是kb
                minSize: [1, '文件的大小不能小于{0}KB'],
                //文件大小的最大值,单位也是kb
                maxSize: [2048, '文件大小不能大于2M']
            };

            /**
             * 创建营业执照上传
             * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
             */
            var props = {
                text: '上传',
                theme:"imageView",
                render:"#brandLogoPicUploader",
                filed:"logo",
                downloadUrl: downloadUrl,
                url:url,
                delUrl:delUrl,
                batchDownloadUrl: batchDownloadUrl,
                multiple : false,
                maxNum:1,
                rules:rules,
                imgShowWidth: imgShowWidth,
                imgShowHeight: imgShowHeight
            };

            this.uploadExt1 = new UploadExt(props);
            this.uploadExt1.createUploader();

        }
    };
    $(document).ready(function(e) {
        $.brandUpdateApp.init();
    });
}(jQuery));
