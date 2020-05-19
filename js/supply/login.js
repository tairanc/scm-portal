$(function (w) {

    w.login = function () {
        var re = new RegExp(" ", "g");
        var telephone = $("#phone").val().replace(re, "");
        var password = $("#password").val().replace(re, "");

        if (telephone == null || telephone == "") {
            return showMsgDialog("phone", "手机号不能为空！");
        }

        if (password == null || password == "") {
            return showMsgDialog("password", "密码不能为空！");
        }

        var loginContent = $.AjaxContent();
        loginContent.type = "POST";
        loginContent.url = $.scmServerUrl + "account/user/login/";
        loginContent.data = {phone: telephone, password: password};
        loginContent.success = function (data) {    
            window.location.href = '/supply/selectChannel.html';                           
        };
        loginContent.error = function(err){
            console.log(err);
            var errorMsg = JSON.parse(err.responseText);
            console.log(errorMsg)
            BUI.Message.Alert(errorMsg.error.description,"warning");
        };
        $.ajax(loginContent);
    };
    function showMsgDialog(id, msg) {
        BUI.use('bui/tooltip', function (Tooltip) {
            new Tooltip.Tip({
                align: {
                    node: '#' + id,
                    offset: [10, -10]
                },
                closeAction: 'remove',
                alignType: 'right',
                showArrow: false, //不显示箭头
                triggerEvent: 'click',
                autoHideType: 'click',
                title: msg,
                elCls: 'tips tips-warning',
                titleTpl: '<span class="x-icon x-icon-small x-icon-error"><i class="icon icon-white icon-bell"></i></span><div class="tips-content">{title}</div>'
            }).render().on('autohide', function () {
                var _self = this;
                _self.hide();
                setTimeout(function () {
                    _self.remove(true)
                }, 300)
            }).show();
        })
    }
}(window));