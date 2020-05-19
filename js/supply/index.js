$(function (w) {
    var content = $.AjaxContent();
    content.type = "GET";
    content.url = $.scmServerUrl + "accredit/html";
    content.success = function (data) {
        localStorage.setItem("menuConfig", JSON.stringify(data.result));
        var aContent = $.AjaxContent();
        aContent.url = $.scmServerUrl + "accredit/getName" ;
        aContent.data = {};
        aContent.success = function (result, textStatus) {
            if (result.appcode != 1) {
                BUI.Message.Alert("根据手机号码查询用户名称失败." + result.databuffer)
            } else {
                $("#userPhone").html("欢迎您，" + result.result);
            }
        };
    $.ajax(aContent);

    $("#action").html("[ 退出 ]")


      BUI.use(['common/main'], function () {
        var arr = [{
          homePage: '',
          id: 'menu',
          menu: $.newGetShowMenu()
        }]
        if (localStorage.getItem("menuConfig")) {
            new PageUtil.MainPage({
                modulesConfig: $.getShowMenu()
            });
        } else {
            BUI.Message.Show({
                title: "操作提示",
                msg: "您还未登录，请先登录",
                icon: 'info',
                buttons: [
                    {
                        text: '确定',
                        elCls: 'button button-primary',
                        handler: function () {
                            if( window.location.origin.indexOf('tairanmall.com') != -1 ) {  
                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;                                 
                            }  else {
                                window.location.href = '/supply/login.html';                                                                     
                            }
                            this.close();
                        }
                    }
                ]
            });
        }

    });

    };        
    $.ajax(content);

    w.addTab = function (config) {
        window.TopTab.addTab(config);
        window.TopTab.setActived(window.TopTab.getChildAt(window.TopTab.getTabContentContainer().children().length-1).get("id"));
    };

    w.removeTab = function (href) {

        window.TopTab.eachChild(function (child) {

            if (child && href.indexOf(child.get("href")) != -1) {
                window.TopTab.removeChild(child);
                child.destroy();
                window.TopTab.setActived(window.TopTab.getChildAt(window.TopTab.getTabContentContainer().children().length-1).get("id"));
            }

        });
    };
    //获取业务线
    var channelCodeDefault=$.getUrlParamdecode("channelCode");
    var channelContent = $.AjaxContent();
    channelContent.type = "GET";
    channelContent.url = $.scmServerUrl + "api/jurisdictionUserChannel";
    channelContent.data = {};
    channelContent.success =function(result){                           
        var channelList = result.result;
        if(channelList.length==1){
            $("#channelPart").hide();
        }else{
            for (var i = 0; i < channelList.length; i++) {
                var option = $('<option value="' + channelList[i].channelCode + '">' + channelList[i].channelName + '</option' + '>');
                $("#channelList").append(option);
            }  
            channelCodeDefault=channelCodeDefault||$.cookie('channelCookie');
            $("#channelList").val(channelCodeDefault);
        }                         
    }; 
    $.ajax(channelContent); 
    //切换业务线
    $("#channelList").on("change",function(){
        BUI.Message.Confirm('您确认要切换业务线吗？',function(){
            var channelCode =  $("#channelList").val();
            var confirmContent = $.AjaxContent();
            confirmContent.type = "GET";
            confirmContent.url = $.scmServerUrl + "api/confirmUser";
            confirmContent.data = {channelCode:channelCode};
            confirmContent.success =function(result){
                var urlStr = window.location.href;
                var reloadUrl = urlStr.replace(/channelCode=[a-zA-Z0-9_]+/, function($1){
                    return "channelCode=" + channelCode + "";
                })
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $("#channelList").val(channelCode); 
                    $.cookie('channelCookie', channelCode);
                    window.location.href = reloadUrl;
                }
            }; 
            $.ajax(confirmContent);
        },'question');         
    })

    w.userAction = function () {
            BUI.Message.Show({
                title: "操作提示",
                msg: "是否退出登录？",
                icon: 'info',
                buttons: [
                    {
                        text: '确定',
                        elCls: 'button button-primary',
                        handler: function () {
                            var aContent = $.AjaxContent();
                            aContent.type = "POST";
                            aContent.url = $.scmServerUrl + "account/user/logout/";
                            aContent.success = function () {
                                var sessionContent = $.AjaxContent();
                                    sessionContent.type = "GET";
                                    sessionContent.url = $.scmServerUrl + "api/clearSession/";
                                    sessionContent.data = {};
                                    sessionContent.success =function(){
                                        if( window.location.origin.indexOf('tairanmall.com') != -1 ) {
                                            var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                            window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                                        }  else {
                                            window.location.href = '/supply/login.html';
                                        }
                                        localStorage.clear();
                                    };
                                $.ajax(sessionContent);

                            };
                            $.ajax(aContent);
                            this.close();
                        }
                    }
                ]
            });
    };  
   
}(window));