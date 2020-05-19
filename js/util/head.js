(function () {
    // 未添加版本号
    document.writeln("<link href='/bui/assets/css/bs3/dpl.css' rel='stylesheet' />");
    document.writeln("<link href='/bui/assets/css/bs3/bui.css' rel='stylesheet' />");
    document.writeln("<link href='/bui/assets/css/main.css' rel='stylesheet' />");
    document.writeln("<link href='/js/util/zTree/css/zTreeStyle/zTreeStyle.css' rel='stylesheet' />");
    document.writeln("<link href='/js/util/flexselect/flexselect.css' rel='stylesheet'/>");
     document.writeln("<link href='/js/util/chosen/chosen.css' rel='stylesheet'/>"); 

    document.writeln("<script src='/bui/assets/js/jquery-1.8.1.min.js'></script>");
    document.writeln("<script src='/js/util/zTree/js/jquery.ztree.core-3.5.min.js'></script>");
    document.writeln("<script src='/js/util/zTree/js/jquery.ztree.excheck-3.5.min.js'></script>");
    document.writeln("<script src='/bui/build/seed-min.js'></script>");
    document.writeln("<script src='/bui/build/sea.js'></script>");
    document.writeln("<script src='/bui/build/config.js'></script>");
    document.writeln("<script src='/bui/assets/js/bui.js'></script>");
    document.writeln("<script src='/bui/assets/js/config-min.js'></script>");
    document.writeln("<script src='/bui/assets/js/common/main.js'></script>");
    document.writeln("<script src='/js/util/flexselect/liquidmetal.js'></script>");
    document.writeln("<script src='/js/util/flexselect/jquery.flexselect.js'></script>");    
    document.writeln("<script src='/js/util/chosen/chosen.jquery.js'></script>");  
    document.writeln("<script src='/js/util/jquery.cookie.js'></script>"); 

    // 已添加版本号
    document.writeln("<link href='/css/ext.css" + getVersion() + "' rel='stylesheet'/>");
    document.writeln("<script src='/js/util/common.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/UploadExt.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/GridExt.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/GridSelect.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/DynamicGrid.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/DynamicTable.js" + getVersion() + "'></script>");
    document.writeln("<script src='/js/util/pageGroup.js" + getVersion() + "'></script>");


    /**
     * 获取版本号
     * @returns {*}
     */
    function getVersion() {
        if (localStorage.getItem("config")) {
            var config = JSON.parse(localStorage.getItem("config"));
            return "?" + config.version;
        } else {
            return "";
        }
    }

    /**
     * 获取配置信息
     * @param init
     */
    function getConfig(init) {
        $.ajax({
            type: "get",
            url: "/supply/config.json",
            data: {},
            cache: false,
            dataType: "json",
            success: function (data) {
                localStorage.setItem("config", JSON.stringify(data));
                if (init) {
                    initConfig(false);
                }
            },
            error: function (data) {
                if (init) {
                    var cont = document.getElementsByTagName('head')[0];

                    var url = location.href.split("#")[0].split("?")[0];
                    var names = url.split("/");
                    var name = names[names.length - 1].split(".")[0];

                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = "/" + name + ".js";
                    cont.appendChild(script);
                }
            }

        });
    }

    /**
     * 加载配置信息
     * @param refresh
     */
    function initConfig(refresh) {

        var cont = document.getElementsByTagName('head')[0];

        var config = JSON.parse(localStorage.getItem("config"));
        var version = config.version;

        var url = location.href.split("#")[0].split("?")[0];
        var names = url.split("/");
        var name = names[names.length - 1].split(".")[0];

        if (config.href[name]) {

            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = config.href[name] + "?v" + version;
            cont.appendChild(script);

        }

        if (refresh) {
            getConfig(false)
        }

    }


    window.onload = function () {

        if (localStorage.getItem("config")) {
            initConfig(true);
        } else {
            getConfig(true);
        }

    };
}());