/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $.brandAddApp = {
        uploadExt1 : null,//品牌文件上传对象
        init:function(){
            this.initPicUpload();
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
                
                $("#save_btn").on("click",function(){
                	// var formData = form.serializeToObject();
                	// if(form.isValid()){
                    //     $.showLoadMask();
	                //     $.brandAddApp.save(formData, tip);
                    // }                    
                    if (form.isValid()){
                        $.brandAddApp.checkBrand(false, function () {
                            var formData = form.serializeToObject();
                            formData.name = $.trim(formData.name)
                            $.brandAddApp.save(formData, tip);
                        });
                    }
                });
                
                $("#btn_list").on("click",function(){
                    window.location.href = "brandList.html";
                });

                $("#reset_btn").on("click",function(){
                    form.clearErrors(true,true);
                });

                $("#name").on("blur",function(){
                    form.valid();
                    if (form.isValid()){
                        $.brandAddApp.checkBrand(true);
                    }
                });

                $("#webUrl").on("blur",function(){
                    var webUrl = $("#webUrl").val();
                    if(webUrl!=""){
                        var re=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
                        var result=webUrl.match(re);
                        if(!result){
                            BUI.Message.Alert("该品牌网址格式有误,请重新输入！");
                            $("#webUrl").val("");
                        }
                    }
                });
            });
        },
        // 品牌名称唯一性校验
        checkBrand: function (isShowAlert, successFun) {
            var name = $.trim($("#name").val())
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/brand/checkName";
            aContent.data = {"name": name};
            aContent.type = "POST";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, "warning");
                } else {
                    if ("" != result.result && null != result.result) {
                        if (isShowAlert) {
                            BUI.Message.Alert("该品牌名称已经存在,请用其他名称！", "warning");
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
         * 保存品牌
         * @param fromData
         */
        save:function(fromData,tip){
            //检查文件上传状态
            if($.checkUploadStatus() == true){
                var aContent = $.AjaxContent(function(){
                    $.hideLoadMask();
                });
                aContent.url = $.scmServerUrl+"category/brand";
                aContent.data = fromData;
                aContent.type = "POST";
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
        $.brandAddApp.init();
    });
}(jQuery));
