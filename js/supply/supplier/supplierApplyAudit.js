/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function(){

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=SupplierApply&entityId=" + $.getUrlParam("id"));
    });

    $.supplierApplyAuditApp = {

        init:function(){
            var id = $.getUrlParam("id")
            $.supplierApplyAuditApp.fileForm(id);
        	BUI.use(['bui/form','bui/tooltip','bui/overlay'],function(Form, Tooltip,overlay){
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

                $("#btn_pass").on("click",function(){
                    form.setFieldValue("status",2);
                    form.setFieldValue("id", $.supplierApplyAuditApp.data.id);
                    form.setFieldValue("applyCode", $.supplierApplyAuditApp.data.applyCode);
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        $.supplierApplyAuditApp.save(formData, tip);
                    }
                });

                $("#btn_list").on("click",function(){
                    window.location.href="supplierApplyAuditList.html";
                });

                $("#btn_reject").on("click",function(){
                    var auditOpinion = $("#auditOpinion").val();
                    if(auditOpinion==null||auditOpinion==''){
                        BUI.Message.Alert('驳回时必须填写审核意见！','warning');
                        return false;
                    }
                    form.setFieldValue("status",3);
                    form.setFieldValue("id", $.supplierApplyAuditApp.data.id);
                    form.setFieldValue("applyCode", $.supplierApplyAuditApp.data.applyCode);
                    var formData = form.serializeToObject();
                    if(form.isValid()){
                        $.supplierApplyAuditApp.save(formData, tip);
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
            aContent.url = $.scmServerUrl+"supplier/supplierApplyAudit/"+id;
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    alert("查询品牌类型明细失败."+result.databuffer)
                }else{
                    var supplierApplyDtl = result.result;
                    $.supplierApplyAuditApp.data=supplierApplyDtl;
                    $("#id").html(supplierApplyDtl.id);
                    $("#channelName").html(supplierApplyDtl.channelName);
                    $("#supplierCode").html(supplierApplyDtl.supplierCode);
                    $("#applyCode").html(supplierApplyDtl.applyCode);
                    $("#supplierKindCode").html($.dictTranslate("supplierNature",supplierApplyDtl.supplierKindCode));
                    $("#supplierName").html(supplierApplyDtl.supplierName);
                    $("#supplierTypeCode").html($.dictTranslate("supplierType",supplierApplyDtl.supplierTypeCode));
                    $("#brandNames").html(supplierApplyDtl.brandNames);
                    $("#description").html(supplierApplyDtl.description);

                }
            };
            $.ajax(aContent);
        },
        /***
         * 审核供应商审核信息
         * @param fromData
         */
        save:function(fromData, tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"supplier/supplierApplyAudit/"+ $.supplierApplyAuditApp.data.id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                window.location.href = "supplierApplyAuditList.html";
            };
            $.ajax(aContent);
        },
    };
    window.toSupplierDetail = function () {
        $.supplierApplyAuditApp.data.isClose = true;
        var config = {
            title: "供应商详情",
            href: "supplier/supplierDetail.html?hideLogs=true&" + $.param($.supplierApplyAuditApp.data)
        };
        window.parent.addTab(config)
    };
    $(document).ready(function(e) {
        $.supplierApplyAuditApp.init();
    });
}(jQuery));
