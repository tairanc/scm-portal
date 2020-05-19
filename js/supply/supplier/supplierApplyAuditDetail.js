/**
 * Created by Tony-Li on 2016/3/15.
 */
$(function () {

    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?entityType=SupplierApply&entityId=" + $.getUrlParam("id"));
    });

    $.supplierApplyAuditDetail = {

        init: function () {
            BUI.use(['bui/form', 'bui/tooltip', 'bui/overlay'], function (Form, Tooltip, overlay) {
                var form = new Form.HForm({
                    srcNode: '#J_Form'
                });
                form.render();

                var aContent = $.AjaxContent();
                aContent.url = $.scmServerUrl + "supplier/supplierApplyAudit/" + $.getUrlParam("id");
                aContent.data = {};
                aContent.success = function (result, textStatus) {
                    if (result.appcode != 1) {
                        alert("查询品牌类型明细失败." + result.databuffer,"warning")
                    } else {
                        var supplierApplyDtl = result.result;
                        $("#channelName").html(supplierApplyDtl.channelName);

                        $("#supplierCode").html(supplierApplyDtl.supplierCode);

                        $.supplierApplyAuditDetail.data = supplierApplyDtl;

                        $("#applyCode").html(supplierApplyDtl.applyCode);
                        $("#supplierKindCode").html($.dictTranslate("supplierNature", supplierApplyDtl.supplierKindCode));
                        $("#supplierName").html(supplierApplyDtl.supplierName);
                        $("#supplierTypeCode").html($.dictTranslate("supplierType", supplierApplyDtl.supplierTypeCode));
                        $("#brandNames").html(supplierApplyDtl.brandNames);
                        $("#description").html(supplierApplyDtl.description);
                        $("#auditResult").html($.dictTranslate("supplierApplyStatus", supplierApplyDtl.status));
                        $("#auditOpinion").html(supplierApplyDtl.auditOpinion);
                    }
                };
                $.ajax(aContent);

            });
        }
    };

    $("#btn_list").on("click", function () {
        window.location.href = "supplierApplyAuditList.html";
        //window.history.go(-1);
    });

    window.toSupplierDetail = function () {
        $.supplierApplyAuditDetail.data.isClose = true;
        var config = {
            title: "供应商详情",
            href: "supplier/supplierDetail.html?hideLogs=true&" + $.param($.supplierApplyAuditDetail.data)
        };
        window.parent.addTab(config)
    };

    $(document).ready(function (e) {
        $.supplierApplyAuditDetail.init();
    });
}(jQuery));
