function UploadExt(paramDict) {
    this.text = paramDict['text'];//上传按钮名称
    this.theme = paramDict['theme'];//主题
    this.render = paramDict['render'];//上传div
    this.filed = paramDict['filed'];//存储路径的隐藏域ID
    this.url = paramDict['url'];//上传地址
    this.delUrl = paramDict['delUrl'];//删除地址
    this.downloadUrl = paramDict['downloadUrl'];//下载地址
    this.batchDownloadUrl = paramDict['batchDownloadUrl'];//批量下载地址
    this.resultTpl = paramDict['resultTpl'];//显示结果模板
    this.rules = paramDict['rules'];//规则
    this.multiple = paramDict['multiple'];//是否支付批量上传
    this.imgShowWidth = paramDict['imgShowWidth'];//图片显示框宽度,
    this.imgShowHeight = paramDict['imgShowHeight'];//图片显示框高度,
    this.imgShowHeight = paramDict['imgShowHeight'];//图片显示框高度,
    this.onlyShow = paramDict['onlyShow'];//是否仅用于显示数据,默认false
    this.uploadStatusFiledId = paramDict['filed'] + "_" + "uploadStatusFiled";//文件上传状态隐藏域ID
    this.deleteFiles = "";//删除的文件,多个图片路径用逗号隔开,如:"supply/1111.jpg,supply/2222.jpg"
}

var _uploader;
var UPLOAD_STATUS_FIELD = "uploadStatusFiled";
/**
 * 创建上传控件
 */
UploadExt.prototype.createUploader = function () {


    var _self = this;
    BUI.use(['bui/uploader', 'bui/overlay'], function (Uploader, Overlay) {

            var dialog = new Overlay.Dialog({
                title: '图片查看',
                width: _self.imgShowWidth,
                height: _self.imgShowHeight,
                mask: false,
                buttons: []
            });

            var resultTpl = null;
            if (_self.resultTpl) {
                resultTpl = _self.resultTpl;
            }

            function creatItem(){
                var item = {};
                item['add'] = false;
                item['cancel'] = false;
                item['error'] = false;
                item['file'] = null;
                item['id'] = "";
                item['input'] = "init(1)";
                item['isUploaderFile'] = true;
                item['progress'] = false;
                item['start'] = false;
                item['success'] = true;
                //item['type'] = "image/jpeg";
                item['wait'] = false;
                return item;
            }

            var uploader = new Uploader.Uploader({
                theme: _self.theme,
                render: _self.render,
                url: _self.url,
                data: {},
                rules: _self.rules,
                button: {
                    text: _self.text,
                    listeners: {
                        'change': function (e) {
                            var fileName = "";
                            var files = e.files;
                            for (var i = 0; i < files.length; i++) {
                                fileName += files[i].name + ",";
                            }
                            if ("" != fileName) {
                                fileName = fileName.substring(0, fileName.length - 1);
                                uploader.set('data', {fileName: fileName});
                            }

                        }
                    }
                },
                multiple: _self.multiple,
                listeners: {
                    "mouseenter": function () {

                        if (_self.onlyShow == true) {
                            $(_self.render).find(".bui-uploader-htmlButton").hide();
                            $(_self.render).find(".bui-queue-item-del").remove();
                        }
                    },
                    "mousedown": function (e) {
                        var target = $(e.domTarget);
                        if (target.hasClass("file-input")) {
                            var queue = uploader.get('queue');
                            var items = queue.getItems();
                            var rules = _self.rules;
                            if (undefined != rules && {} != rules && "" != rules) {
                                var max = rules['max'];
                                if (undefined != max && [] != rules && "" != rules && max.length == 2) {
                                    if (items.length >= max[0]) {
                                        BUI.Message.Alert("最多允许上传" + max[0] + "个文件", 'warning');
                                    }
                                }

                            }

                        }
                    },
                    "beforeRenderUI": function () {
                        var fileNames = $("#" + _self.filed).val();
                        var items = [];     
                        if (undefined != fileNames && "undefined" != fileNames && "" != fileNames && null != fileNames) {
                            if(!/^http/.test(fileNames)){
                                var aContent = $.AjaxContent();
                                aContent.url = _self.batchDownloadUrl;
                                aContent.data = {"fileNames": fileNames};
                                aContent.success = function (result, textStatus) {
                                    if (result.appcode != 1) {
                                        BUI.Message.Alert(result.databuffer, 'warning');
                                    } else {
                                        var fileObjs = result.result;
                                        for (var i = 0; i < fileObjs.length; i++) {
                                            var key = fileObjs[i].fileKey;
                                            var spl = key.split("/");
                                            var fileName = spl[1];
                                            var spl = fileName.split(".");
                                            var ext = spl[1];
                                            var item = creatItem();
                                            
                                            item["ext"] = "." + ext;
                                            item['key'] = fileObjs[i].fileKey;
                                            item['name'] = fileName;
                                            item['url'] = fileObjs[i].url;
                                            items.push(item);
                                        }
                                        var queue = uploader.get('queue');
                                        queue.set("items", items);
                                        uploader.set("queue", queue);
                                    }
                                };
                                $.ajax(aContent);
                            }else{
                                setTimeout(function(){
                                    var queue = uploader.get('queue');
                                    var item = creatItem();
                                    var ext = /\.[^\.]+$/.exec(fileNames); 
                                    item["ext"] = "" + ext;
                                    item['key'] = fileNames;
                                    item['name'] = fileNames;
                                    item['url']=fileNames;
                                    items.push(item);
                                    queue.set("items", items);
                                    uploader.set("queue", queue);
                                }, 180);
                            }
                            
                        }
                    },
                    'change': function (e) {//选择文件后
                        var queue = uploader.get('queue');
                        rollbackUpload(queue);
                    },
                    'start': function (e) {//开始上传文件
                        //创建文件上传状态隐藏域
                        createUploadStatusField(_self.uploadStatusFiledId);
                    },
                    'error': function (e) {
                        var result = e.result;
                        if (result.appcode != 1) {
                            var queue = uploader.get('queue');
                            rollbackUpload(queue);
                        }
                    }
                },
                complete: function (result) {
                    if (result.success) {
                        //获取上传文件的对列
                        var queue = uploader.get('queue');
                        var items = queue.getItems();
                        var newItems = new Array();
                        var fileNames = "";
                        //给每个fileItem添加信息
                        for (var i = 0; i < items.length; i++) {
                            var tmp = items[i];//目前只做单个文件上传
                            tmp['success'] = true;
                            var key = result.key;//文件上传后再服务器里面的路径
                            var url = result.url;//文件访问的url地址
                            var fileName = result.fileName;//文件上传的原始文件名
                            if (tmp.name == fileName) {
                                tmp['key'] = key;
                                tmp['url'] = url;
                            }
                            newItems.push(tmp);
                            fileNames += tmp['key'] + ",";
                        }
                        queue.setItems(newItems);
                        if (fileNames) {
                            fileNames = fileNames.substring(0, fileNames.length - 1);
                            //将文件赋值给隐藏域
                            $("#" + _self.filed).val(fileNames);
                        }
                    } else {
                        BUI.Message.Alert("文件上传失败,错误信息:" + result.databuffer, function () {
                            if (result.result == 401) {
                                window.top.location = "/supply/401.html";
                            } else if (result.result == 403) {
                                if (window.location.origin.indexOf('tairanmall.com') != -1) {
                                var redirectUrl = window.location.origin + "/supply/selectChannel.html";
                                window.location.href = 'http://passport.tairanmall.com/login?redirectUrl=' + redirectUrl;
                            } else {
                                window.location.href = '/supply/login.html';
                            }
                            } else if (result.result == 404) {
                                window.top.location = "/supply/404.html";
                            } else if (result.result == 500) {
                                window.top.location = "/supply/500.html";
                            }
                        }, "error")

                    }
                    //删除文件上传状态隐藏域
                    $("#" + _self.uploadStatusFiledId).remove();
                },
                queue: {
                    resultTpl: {
                        'success': '<div class="success"><img src="{url}" title="{name}"/></div>',
                        //'error': '<div class="error" style="width: 200px; height: 25px;"><span class="uploader-error">{msg}</span></div>'
                        'error': '<script type="text/javascript">var msg = "{msg}"; if(msg){BUI.Message.Alert("{msg}","warning")}</script>'
                    },
                    listeners: {
                        "itemremoved": function (e) {//文件移除
                            var item = e.item;
                            /*if (item.key) {
                                deleteFile(item.key, _self.delUrl);
                                var items = uploader.get('queue').getItems();
                                var fileNames = "";
                                if (items.length > 0) {
                                    for (var i = 0; i < items.length; i++) {
                                        var tmp = items[i];
                                        fileNames += tmp['key'] + ",";
                                    }
                                    if (fileNames) {
                                        fileNames = fileNames.substring(0, fileNames.length - 1);
                                        //将文件赋值给隐藏域
                                        $("#" + _self.filed).val(fileNames);
                                    }
                                } else {
                                    $("#" + _self.filed).val("");
                                }
                            }*/
                            if (item.key) {
                                if("" == _self.deleteFiles){
                                    _self.deleteFiles = item.key;
                                }else{
                                    _self.deleteFiles = _self.deleteFiles+","+item.key;
                                }
                                var items = uploader.get('queue').getItems();
                                var fileNames = "";
                                if (items.length > 0) {
                                    for (var i = 0; i < items.length; i++) {
                                        var tmp = items[i];
                                        fileNames += tmp['key'] + ",";
                                    }
                                    if (fileNames) {
                                        fileNames = fileNames.substring(0, fileNames.length - 1);
                                        //将文件赋值给隐藏域
                                        $("#" + _self.filed).val(fileNames);
                                    }
                                } else {
                                    $("#" + _self.filed).val("");
                                }
                            }
                        },
                        'itemclick': function (e) {//点击文件
                            var domtarget = e.domTarget;
                            var item = e.item;
                            if ("bui-queue-item-del" == domtarget.className && !item.del) {
                                if (!item.del) {
                                    event.stopPropagation(); //阻止事件冒泡
                                    BUI.Message.Show({
                                        msg: '确认删除图片吗?',
                                        icon: 'question',
                                        buttons: [
                                            {
                                                text: '确定',
                                                elCls: 'button button-primary',
                                                handler: function () {
                                                    this.close();
                                                    item.del = true;
                                                    domtarget.click();
                                                }
                                            },
                                            {
                                                text: '取消',
                                                elCls: 'button',
                                                handler: function () {
                                                    this.close();
                                                }
                                            }

                                        ]
                                    });
                                }
                            } else if(!item.del){
                                var item = e.item;
                                var picKey = item['key'];
                                if(!/^http/.test(picKey)){
                                    if(!picKey){
                                        BUI.Message.Alert("图片上传中,请稍后再查看",'warning');
                                    }else{
                                        var aContent = $.AjaxContent();
                                        aContent.url = _self.downloadUrl;
                                        aContent.data = {"fileName": item['key']};
                                        aContent.success = function (result, textStatus) {
                                            if (result.appcode != 1) {
                                                BUI.Message.Alert(result.databuffer, 'warning');
                                            } else {
                                                dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="width:auto; height: 100%;max-width:1100px;" src=' + result.result + '></div>');
                                                dialog.show();
                                            }
                                        };
                                        $.ajax(aContent);   
                                    }                                    
                                }else{
                                    dialog.set("bodyContent", '<div style="text-align: center;height: 100%;"><img style="width:auto; height: 100%;max-width:1100px;" src=' + picKey + '></div>');
                                    dialog.show();
                                }         
                            }
                        }
                    }
                }
            }).render();


            if (_self.onlyShow == true) {
                $(_self.render).find(".bui-uploader-htmlButton").hide();
                $(_self.render).find(".bui-queue-item-del").remove();
            }

            _uploader = uploader;


        }
    )

};

/**
 * 删除文件
 */
UploadExt.prototype.removeFiles = function () {
    if(this.deleteFiles.length > 0){
        return deleteFile(this.deleteFiles, this.delUrl);
    }else {
        return true;
    }
};

/**
 * 删除文件
 * @param key 文件路径
 * @param delUrl 删除地址
 */
function deleteFile(key, delUrl) {
    var flag = false;
    var aContent = $.AjaxContent();
    aContent.url = delUrl;
    aContent.data = {"fileNames": key};
    aContent.async = false,
    aContent.success = function (result, textStatus) {
        if (result.appcode != 1) {
            BUI.Message.Alert(result.databuffer, 'warning');
        }else{
            flag = true;
        }
    };
    $.ajax(aContent);
    return flag;
}


/**
 *回滚上传操作
 * @param uploader
 */
function rollbackUpload(queue) {
    var items = queue.getItems();
    var tmpItems = new Array();
    var msgArray = new Array();
    for (var j = 0; j < items.length; j++) {
        if (items[j].error) {
            if (msgArray.indexOf(items[j].msg) == -1) {
                msgArray.push(items[j].msg);
            }
        } else {
            tmpItems.push(items[j]);
        }
    }
    queue.setItems(tmpItems);
    if (msgArray.length > 0) {
        var msg = "";
        if (msgArray.length > 1) {
            for (var i = 0; i < msgArray.length; i++) {
                msg += msgArray[i] + ";";
            }
        } else {
            msg = msgArray[0];
        }

        BUI.Message.Alert(msg, 'warning');
    }
}

/**
 * 创建上传状态隐藏域
 * @param id
 */
function createUploadStatusField(id) {
    var _field = '<input type="hidden" id="' + id + '" name="' + UPLOAD_STATUS_FIELD + '">';
    $("body").append(_field);
}
