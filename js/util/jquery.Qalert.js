/**
 * Created by carlos on 2015/5/19.
 * 1、Qalert 页面提示插件，可以传入对应参数修改提示的位置和css
 * 2、QloadingCover 页面加载提示插件。    $.QloadingCover.options 可以改变默认属性
 * 3、setPosition 方法可以单独调用可以设置对象的位置，注意是position:fixed
 * 4、Qmodal 页面弹出框插件，默认ios样式
 * 5、Q_confirm 确定提示，类似于js中的confirm
 * 6、Q_alert 提示，类似于js中的alert
 * 7、Qstorage 本地缓存方法
 */
(function ($) {
    $.fn.Qalert = function(params){
        var defaults = {
            text:'alert页面',                         //文本信息
            duration:3000,                           //显示时间长度
            position:'bottom',                       //显示的提示框的位置：top、middle、bottom
            space:50,                                //与上下边框的间隔距离，只有当top和bottom时候生效
            debug:false,                             //是否显示debug调试信息，主要是定位信息
            css:{                                    //alert的提示框的css
                color:'#ffffff',
                background:'#222222',
                padding:'10px 15px',
                "border-radius":'5px',
                "font-size":'14px'
            }
        };
        var Qthis=$(this);
        var options = params || defaults;
        var Q_alert = $('<span id="Q_alert"></span>');
        Q_alert.css(options.css||defaults.css);
        Q_alert.css({display:'none',"text-shadow":"none"});
        Q_alert.html(options.text||defaults.text);
        Qthis.append(Q_alert);
        Q_alert.setPosition({
            position:options.position||defaults.position,
            space:options.space||defaults.space,
            debug:options.debug||defaults.debug
        });
        Q_alert.fadeIn();
        setTimeout(function(){
            Q_alert.fadeOut();
            Q_alert.remove();
        },options.duration||defaults.duration)
    };
    $.fn.setPosition = function(poss){
//        poss = {
//            position:'bottom',
//            space:20,
//            debug:false
//        }
        init(poss,this);
        function init(poss,obj){
            var Pthis = $(obj);
            var Pthis_W = Pthis.outerWidth(true);
            var Pthis_H = Pthis.outerHeight(true);
            var win_W = $(window).width();
            var win_H = $(window).height();
            var obj_left = null, obj_top = null;
            obj_left = (win_W - Pthis_W)/2;
            if(poss.position == "middle"){
                obj_top = (win_H - Pthis_H)/2;
            }
            else if(poss.position == 'top'){
                obj_top = poss.space;
            }
            else{
                obj_top = win_H - Pthis_H - poss.space;
            }
            //alert(obj_left+','+obj_top);
            Pthis.css({"position":"fixed","z-index":10000,"left":obj_left,"top":obj_top});
            if(poss.debug){
                console.log("提示框宽度："+Pthis_W,"提示框高度："+Pthis_H);
                console.log("屏幕宽度："+win_W,"屏幕高度："+win_H);
                console.log("提示框距离左边："+obj_left,"提示框距离上边："+obj_top);
            }
        }
    };
    $.QloadingCover = function(action,params,sign){
        params = params || {};
        sign = sign || 'loadingCover';
        if(action=='show') $.QloadingCover.sign = sign;
        var defaults = {
            text:"加载中",                         //显示文本
            showText:true,                        //是否显示文本
            customContent:"",                     //当showText和showImage同时为false，此项自定义内容生效
            imageUrl:'',                          //图片url
            imageAuto:true,                       //图片原大小显示，默认为true
            imageWidth:50,                        //图片宽度，当imageAuto=为false时生效
            imageHeight:50,                       //图片高度，当imageAuto=为false时生效
            showImage:false,                      //是否显示图片，默认为false
            debug:false,                          //是否显示debug调试信息，主要是定位信息
            zIndex:9999,                          //cover的z层高度
            coverColor:'#3A3A3A',                 //cover的颜色
            coverOpacity:0.5,                     //cover的透明度
            close:false,                          //点击非提示框是否关闭，默认false
            css:{                                 //loading的提示框的css
                color:'#ffffff',
                background:'#222222',
                padding:'10px 15px',
                "border-radius":'5px',
                "font-size":'14px'
            }
        };
        var options = $.QloadingCover.options;      //改变默认属性
        defaults = $.extend({},defaults,options,params);
        if(action=="show"){
            var Qcover = createCover();
            if($('#Qloadingbox').length>0){$('#Qloadingbox').remove();}
            var Qloadingbox = $('<div id="Qloadingbox">');
            $('body').append(Qcover,Qloadingbox);
            Qloadingbox.css('display','none');
            Qloadingbox.css(GetResultValue('css'));
            Qloadingbox.css({display:'none',"text-shadow":"none","z-index":GetResultValue('zIndex')+1,"text-align":'center'});
            if(GetResultValue('showImage')){
                var img = $('<img/>');
                if(!GetResultValue('imageAuto')){img.css({width:GetResultValue('imageWidth')+'px',height:GetResultValue('imageHeight')+'px'});}
                img.css({"margin-bottom":"5px"});
                img.attr('src',GetResultValue('imageUrl'));
                Qloadingbox.append(img);
            }
            if(GetResultValue('showText')){
                var span = $('<span id="loadingText">');
                span.html(GetResultValue('text'));
                if(GetResultValue('showImage')) Qloadingbox.append('<br/>');
                Qloadingbox.append(span);
            }
            if(!GetResultValue('showText')&&!GetResultValue('showImage')){
                Qloadingbox.append(GetResultValue('customContent'));
            }
            Qloadingbox.setPosition({position:'middle',space:0,debug:GetResultValue('debug')});
            $(window).resize(function(){
                $('#Qloadingbox').setPosition({position:'middle',space:0,debug:GetResultValue('debug')})
            });
            $('body').css('overflow','hidden');
            Qcover.fadeIn();
            Qloadingbox.fadeIn();
            initCover(Qcover, Qloadingbox);
            return Qloadingbox;
        }
        else if(action=="hide"){
            if($.QloadingCover.sign!=sign) return;
            var Qcover = $('#Qcover');
            var Qloadingbox = $('#Qloadingbox');
            $('body').css('overflow','auto');
            Qcover.fadeOut();
            Qloadingbox.fadeOut();
        }
        else{
            console.log('action is invalid');
        }
        function initCover(c,l){
            if(GetResultValue('close')){
                closeCover(c,l);
            }
        }
        function closeCover(c,l){
            c.bind('click',function(e){
                c.fadeOut();
                l.fadeOut();
                $('body').css('overflow','auto');
            });
        }
        function createCover(){
            this.coverWidth = $(window).width();
            this.coverHeight = $(document).height();
            if($('#Qcover').length>0){$('#Qcover').remove();}
            this.cover = $('<div id="Qcover">');
            this.coverOpacity = GetResultValue('coverOpacity');
            this.cover.css({
                "position":"absolute",
                "width":this.coverWidth,
                "height":this.coverHeight,
                "z-index":GetResultValue('zIndex'),
                filter:'alpha(opacity='+this.coverOpacity*10+')',
                "-moz-opacity":this.coverOpacity,
                "-khtml-opacity": this.coverOpacity,
                "opacity": this.coverOpacity,
                "background":GetResultValue('coverColor'),
                "top":0,
                "left":0,
                "display":"none"
            });
            return this.cover;
        }
        function GetResultValue(name){
            return defaults[name];
        }
    };
    $.Qmodal = function(action,params,sign){
        params = params || {};
        sign = sign || 'modal';
        var defaults = {
            theme:"ios",                                            //默认样式ios
            showHead:false,                                         //是否显示头部，默认false
            showBtn:false,                                          //是否显示按钮，默认false
            btnVertical:false,                                      //按钮是否垂直布局，默认false
            headText:"modal提示",                                    //头部显示文字
            headColor:"#2C73DF",                                    //头部文字颜色
            contentHtml:"<div style='padding:20px'></div>",         //要显示的内容html
            close:false,                                            //点击非提示框是否关闭,默认false
            modalWidth:"75%"                                        //modal的宽度设置
        };
        var defaultBtns = [{
            name:"取消",
            fun:modalCancel
            },{
            name:"确定",
            fun:modalSubmit
        }];
        defaults.btns = defaultBtns;                //showBtn为true时默认按钮
        var ios = {                                 //ios皮肤样式
            background:"#EFEFEF",
            overflow:"hidden",
            "-webkit-border-radius": "4px",
            "-moz-border-radius": "4px",
            "border-radius":'4px',
            "-webkit-box-shadow": "#666 3px 3px 5px",
            "-moz-box-shadow": "#666 3px 3px 5px",
            "box-shadow":"#666 3px 3px 5px"
        };
        defaults = $.extend({},defaults,params);
        ios.width = defaults.modalWidth;
        defaults.showText = false;
        defaults.showImage = false;
        defaults.css = eval(defaults.theme);
        var headstyle = {
            'overflow':'hidden',
            'padding':'8px 10px',
            'text-align': 'left',
            'font-size':'1.1em',
            'color':defaults.headColor,
            'border-bottom':'2px solid '+defaults.headColor
        };
        var Qmodal_html = $('<div id="Qmodal-html">');
        Qmodal_html.html(defaults.contentHtml);
        var Qmodal_box = $('<div id="Qmodal-box">');
        if(defaults.showHead){
            var Qmodal_head = $('<div id="Qmodal-head">');
            var Qmodal_head_text = $('<span id="Qmodal-head-text">');
            Qmodal_head_text.html(defaults.headText);
            Qmodal_head.css(headstyle);
            Qmodal_head.append(Qmodal_head_text);
            Qmodal_box.append(Qmodal_head);
        }
        Qmodal_box.append(Qmodal_html);
        var td_style = {
            "text-align":"center",
            "padding":"10px 0",
            "border":"1px solid #C9C9C9",
            "font-size":"0.8em"
        };
        if(defaults.showBtn){
            var Qmodal_foot = $('<div id="Qmodal-foot">');
            var count = defaults.btns.length;
            var foot_table = $('<table id="foot-table">');
            foot_table.css({"width":"100%","border-collapse":"collapse"});
            var avg_width = 100/count;
            if(defaults.btnVertical){
                for(var i=0;i<count;i++){
                    var btn_params = defaults.btns[i];
                    var tr = $('<tr>');
                    var td = $('<td>');
                    td.css(td_style);
                    td.html(btn_params.name);
                    td.bind('click',btn_params.fun);
                    tr.append(td);
                    foot_table.append(tr);
                }
            }
            else{
                var tr = $('<tr>');
                for(var i=0;i<count;i++){
                    var btn_params = defaults.btns[i];
                    var td = $('<td>');
                    td.css(td_style);
                    td.html(btn_params.name);
                    td.bind('click',btn_params.fun);
                    tr.append(td);
                }
                foot_table.append(tr);
            }
            Qmodal_box.append(foot_table);
        }
        defaults.customContent = Qmodal_box;
        return $.QloadingCover(action,defaults,sign);
        function modalCancel(){$.Qmodal('hide');}
        function modalSubmit(){$.Qmodal('hide');}
    };
    $.Q_confirm = function(text, params){
        params = params || {};
        var confirm = params.confirm;
        var cancel = params.cancel;
        if(typeof(cancel)!="function"){cancel=function(){}}
        if(typeof(confirm)!="function"){confirm=function(){}}
        var content = $('<div>');
        content.css({"padding":"10px"});
        content.html(text);
        return $.Qmodal("show",{
            contentHtml:content,
            showBtn:true,
            modalWidth:"250px",
            btns:[{
                name:"取消",
                fun:function(){
                    cancel();
                    $.Qmodal('hide',{},'confirm');
                }},
                {
                name:"确定",
                fun:function(){
                    confirm();
                    $.Qmodal('hide',{},'confirm');
                }
                }]
        },'confirm');
    };
    $.Q_alert = function(text, params){
        params = params || {};
        var confirm = params.confirm;
        if(typeof(confirm)!="function"){confirm=function(){}}
        var content = $('<div>');
        content.css({"padding":"10px"});
        content.html(text);
        var modalObj = $.Qmodal("show",{
            contentHtml:content,
            showBtn:true,
            modalWidth:"250px",
            btns:[{
            name:"确定",
            fun:function(){
                confirm();
                $.Qmodal('hide',{},'_alert');
            }
        }]},'_alert');
    };
    $.Qstorage = {
        kset:function(key, value){
            window.localStorage.setItem(key, value);
        },
        kget:function(key){
            return window.localStorage.getItem(key);
        },
        kremove:function(key){
            window.localStorage.removeItem(key);
        },
        kclear:function(){
            window.localStorage.clear();
        }
    }
})(jQuery);