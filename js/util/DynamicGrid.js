/*
2017年6月11日 创建
 */

/**
 *
 * @param colConfig     // uploadId 上传控件id
 *                      // moveUpFlag 是否可上移
 *                      // moveDownFlag 是否可下移
 *                      // delFlag 是否可删除
 *                      // userStyle 是否使用自己修改样式
 * @constructor
 */

var index = 0;
var uploadCom;
function showUpload(i, id) {
  index = i;
  $("#" + id.id + " .bui-uploader input").click()
}

function DynamicGrid(colConfig) {
  var _self = this;
  _self.delData = []; //已删除数据集合
  _self.columns = []; //列配置集合
  _self.uploadId = ""; //上传控件id，为了区别同一页面多个动态表格同时有上传功能冲突
  _self.uploadDataIndex = ""; //图片类型dataIndex
  _self.uploadFils = {}; // 上传图片集合{key:value},key:图片key,value:图片url
  _self.initDataFlag = true; //
  _self.evnets={};

  BUI.use(['bui/grid'], function (Grid) {
    //遍历列配置
    $.each(colConfig, function (index, item) {
      item = item || {};
      item.sortable = false;
      // text 添加渲染条件
      if (item.editor && item.editor.xtype && item.editor.xtype == "text") {
        item.renderer = function (val, obj) {
          return '<span style="display: block;" class="' + (obj.source === 1 ? "editor" : "") + '"><input type="text" style="width: auto;pointer-events: none;" value="' + (val ? val : "") + '"></span>';
        };
      }
      if (item.barcode && item.barcode=='barcode') {
        item.renderer = function (val, obj) {
          return '<span style="display: block;" class="' + (obj.source === 1 ? "editor" : "") + '"><input class="barcodeText" type="text" style="width: auto;pointer-events: none;" value="' + (val ? val : "") + '"></span>';
        };
      }
      if (item.property && item.property=='property') {
        item.renderer = function (val, obj) {
          return '<span style="display: block;" class="' + (obj.source === 1 ? "editor" : "") + '"><input class="propertyText" type="text" style="width: auto;pointer-events: none;" value="' + (val ? val : "") + '"></span>';
        };
      }
      // date 添加渲染条件
      if (item.editor && item.editor.xtype && item.editor.xtype == "date") {
        item.renderer = function (val) {
          var a = Grid.Format.dateRenderer(val);
          return '<input type="text" class="calendar" style="width: auto;pointer-events: none;" value="' + a + '">';
        }
      }

      // select 添加渲染条件
      if (item.editor && item.editor.xtype && item.editor.xtype == "select") {
        // item.renderer = Grid.Format.enumRenderer(item.editor.items);
        item.renderer = function (val) {
          var a = item.editor.items[val] || '';
          return '<div class="bui-select"><input type="text" readonly="readonly" class="bui-select-input" style="width: auto;" value="' + a + '"><span class="x-icon x-icon-normal"><i class="icon icon-caret icon-caret-down"></i></span></div>';
        }
      }

      // upload 上传图片组件
      if (item.editor && item.editor.xtype && item.editor.xtype == "upload") {
        _self.uploadId = item.uploadId || "uploadId";
        _self.uploadDataIndex = item.dataIndex;
        _self.uploadRules = item.editor.rules || {};
        _self.uploadMax = item.editor.rules.maxNum;
        // config.editor = {};
        item.editor.xtype = "hidden";        
        item.renderer = function (val, obj, index) {
          var img = "";
          if (val && !_self.initDataFlag) {
            var imgs = val.split(",");
            for (let i= 0, length = imgs.length; i < length; i++) {                
                if(!/^http/.test(imgs)){
                    var aContent = $.AjaxContent();
                    aContent.url = _self.batchDownloadUrl;
                    aContent.data = {"fileNames": imgs[i]};
                    aContent.success = function (result, textStatus) {

                        if (result.appcode != 1) {
                            BUI.Message.Alert(result.databuffer, 'warning');
                        } else {
                            var fileObjs = result.result;                        
                            for (let j = 0; j < fileObjs.length; j++) {
                                    var fileKey = fileObjs[j].fileKey;
                                    _self.uploadFils[fileKey] = fileObjs[j].url; 
                                    setTimeout(function () {
                                        console.log("#" + _self.uploadId+ index)
                                        $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv imgxx imgxx-"+i+"'><img  onclick=\"$.showImg(this)\" src=\"" + fileObjs[j].url + "\"/><div class='del delPicture' id='" + i + "'>删除</div></div>");
                                        setTimeout(function() {
                                            if($("#" + _self.uploadId + "" + index+' .imgxx-'+i).length > 1) {
                                                $($("#" + _self.uploadId + "" + index+' .imgxx-'+i)[0]).remove()
                                            }
                                        })
                                    },1000)
                         
                                //img += '<div class="dynamicGridDiv"><img onclick="$.showImg(this)" src=' + fileObjs[i].url + '><div class="del delPicture" id="' + i + '">删除</div></div>'
                                //$("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv'><img  onclick=\"$.showImg(this)\" src=\"" + fileObjs[i].url + "\"/><div class='del delPicture' id='" + i + "'>删除</div></div>");
                            }
                        }
                    };                    
                $.ajax(aContent);
                }else{
                    img += '<div class="dynamicGridDiv imgxx imgxx-'+i+'"><img onclick="$.showImg(this)" src=' + imgs + '><div class="del delPicture" id="' + i + '">删除</div></div>'
                    setTimeout(function() {
                        if($("#" + _self.uploadId + "" + index+' .imgxx-'+i).length > 1) {
                            $($("#" + _self.uploadId + "" + index+' .imgxx-'+i)[0]).remove()
                        }
                    })
                }                
            }
          }
          if (!obj[_self.uploadDataIndex] || obj[_self.uploadDataIndex].split(",").length < _self.uploadMax) {    
            img += '<label style="cursor: pointer;" class="uploader-btn-'+index+'" onclick="showUpload(' + index + ',' + _self.gridId + ')">上传图片</label>';
          }
          return '<div class="grid-command" id="' + _self.uploadId + "" + index + '\">' + img + '</div>';
        };
      }
      if (item.editor && item.editor.xtype && item.editor.xtype == "uploadDetail") {
        _self.uploadId = item.uploadId || "uploadId";
        _self.uploadDataIndex = item.dataIndex;
        _self.uploadRules = item.editor.rules || {};
        _self.uploadMax = item.editor.rules.maxNum;
        // config.editor = {};
        item.editor.xtype = "hidden";        
        item.renderer = function (val, obj, index) {
          var img = "";
          if (val && !_self.initDataFlag) {
            var imgs = val.split(",");
            for (let i= 0, length = imgs.length; i < length; i++) {                
                if(!/^http/.test(imgs)){
                    var aContent = $.AjaxContent();
                    aContent.url = _self.batchDownloadUrl;
                    aContent.data = {"fileNames": imgs[i]};
                    aContent.success = function (result, textStatus) {

                        if (result.appcode != 1) {
                            BUI.Message.Alert(result.databuffer, 'warning');
                        } else {
                            var fileObjs = result.result;                        
                            for (let j = 0; j < fileObjs.length; j++) {
                                    var fileKey = fileObjs[j].fileKey;
                                    _self.uploadFils[fileKey] = fileObjs[j].url; 
                                    setTimeout(function () {
                                        console.log("#" + _self.uploadId+ index)
                                        $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv imgxx imgxx-"+i+"'><img  onclick=\"$.showImg(this)\" src=\"" + fileObjs[j].url + "\"/><div class='del delPicture' id='" + i + "'></div></div>");
                                        setTimeout(function() {
                                            if($("#" + _self.uploadId + "" + index+' .imgxx-'+i).length > 1) {
                                                $($("#" + _self.uploadId + "" + index+' .imgxx-'+i)[0]).remove()
                                            }
                                        })
                                    },1000)
                         
                                //img += '<div class="dynamicGridDiv"><img onclick="$.showImg(this)" src=' + fileObjs[i].url + '><div class="del delPicture" id="' + i + '">删除</div></div>'
                                //$("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv'><img  onclick=\"$.showImg(this)\" src=\"" + fileObjs[i].url + "\"/><div class='del delPicture' id='" + i + "'>删除</div></div>");
                            }
                        }
                    };                    
                $.ajax(aContent);
                }else{
                    img += '<div class="dynamicGridDiv imgxx imgxx-'+i+'"><img onclick="$.showImg(this)" src=' + imgs + '><div class="del delPicture" id="' + i + '"></div></div>'
                    setTimeout(function() {
                        if($("#" + _self.uploadId + "" + index+' .imgxx-'+i).length > 1) {
                            $($("#" + _self.uploadId + "" + index+' .imgxx-'+i)[0]).remove()
                        }
                    })
                }                
            }
          }
          if (!obj[_self.uploadDataIndex] || obj[_self.uploadDataIndex].split(",").length < _self.uploadMax) {    
            img += '<label style="cursor: pointer;" class="uploader-btn-'+index+'" onclick="showUpload(' + index + ',' + _self.gridId + ')"></label>';
          }
          return '<div class="grid-command" id="' + _self.uploadId + "" + index + '\">' + img + '</div>';
        };
      }

      // 扩展操作列
      if (item.hasTools) {
        item.elCls = "center";
        if (item.userStyle) {
          // item.width = "15%";
          item.title = "删除";
          if(item.userTitle){
            item.title=item.userTitle;
          }
        }else{
          item.width = "200";
          item.title = "操作";
        }
        item.renderer = function () {

          var span = "";
          if (item.moveUpFlag) {
            span = '<span class="grid-command row-up">上移</span>';
          }
          if (item.moveDownFlag) {
            span += '<span class="grid-command row-down">下移</span>';
          }
          if (item.delFlag) {
            if (item.userStyle) {
              span += '<span class="grid-command row-del">X</span>';
            }else{
              span += '<span class="grid-command row-del">删除</span>';
            }
          }

          return span;
        }
      }

      _self.columns.push(item);

    });


  });
}

/**
 *
 * @param data 加载数据集 可为
 * @param config    // uploadUrl  图片上传地址
 *                  // sortName  排序字段
 *                  // uploadMax  最大上传图片数 ,为0时，不显示上传和删除组件
 *                  // oldDateNotEdit 旧数据不可编辑，true不可编辑，false 可编辑，默认false
 */
DynamicGrid.prototype.initData = function (data, config) {
  var _self = this;
  _self.oldDateNotEdit = config.oldDateNotEdit;
  _self.gridId = config.gridId || ""; // 表格id
  _self.uploadUrl = config.uploadUrl || ""; // 图片上传地址
  _self.batchDownloadUrl = config.batchDownloadUrl || ""; //
  _self.uploadMax = config.uploadMax || 0; // 最大上传图片数
  _self.sortName = config.sortName || ""; // 排序字段
  _self.detailName = config.detailName || 0;
  BUI.use(['bui/grid', 'bui/data', 'bui/uploader'], function (Grid, Data, Uploader) {
    _self.Uploader = Uploader;
    _self.initUpload(index)
    _self.store = new Data.Store({
      data: data || [],
      autoSync: true,
      autoLoad:true
    });
    var plugins = [];
    _self.editing = new Grid.Plugins.CellEditing({
      errorTpl: '<div class="cell-error" style="margin-top:7px;"><span class="x-icon bui-grid-cell-error x-icon-mini x-icon-error" style="overflow: visible;    position: static;" title="{error}">!</span>&nbsp;<span>{error}</span></div>'
    });

    if (config.oldDateNotEdit) {
      _self.editing.set('triggerCls', 'editor');
    }
    plugins.push(_self.editing);
    if (config.showRowNumber) {
      _self.columns.unshift({
        width: 60, title: '序号', elCls: 'center', renderer: function (val, obj, index) {
          return index + 1;
        }
      });
    }
    _self.grid = new Grid.Grid({
      render: '#' + _self.gridId,
      columns: _self.columns,
      store: _self.store,
      width: "100%",
      emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
      plugins: plugins
    });
    _self.grid.render();

    $(".bui-editor .bui-form-field input").on("keyup", function () {

      var top = $(this).parent().parent().css("top");

      var left = Number($(this).parent().parent().css("left").replace("px", ""));
      var pWidth = Number($(this).parent().parent().css("width").replace("px", ""));
      var tWidth = Number($(this).css("width").replace("px", ""));

      $(".x-editor-tips").css({top: top});
      $(".x-editor-tips").css({left: left + (pWidth + tWidth) / 2 + 20});

    });


    for (let i = 0, length = _self.grid.getCount(); i < length; i++) {
      _self.store.setValue(_self.grid.getItemAt(i), "source", 0);
      _self.store.setValue(_self.grid.getItemAt(i), "status", 0);
      _self.store.setValue(_self.grid.getItemAt(i), "sortStatus", 0);


      if (_self.uploadId && _self.grid.getItemAt(i)[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
        // _self.initUpload(i);
      }      

      if (_self.batchDownloadUrl&&_self.detailName==1) {
        _self.getPicsDetail(i)
      }
      if(_self.batchDownloadUrl&&_self.detailName==0){
        _self.getPics(i);
      }

    }


    _self.grid.on('itemupdated', function (ev) {
      _self.initDataFlag = false;
      let index = _self.store.findIndexBy(ev.item); //当前元素位置

      let self = ev.item;

      if (self.status != 1) {
        self.status = 2;
      }

      _self.store.remove(ev.item);
      _self.store.addAt(self, index);

      if (!self[_self.uploadDataIndex] || self[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
        // _self.initUpload(index)
      }


    });

    _self.grid.on('cellclick', function (ev) {
      var record = ev.record, //点击行的记录
        field = ev.field,
        target = $(ev.domTarget); //点击的元素

      $(target).parent().parent().find('div[class=cell-error]').hide();

      if (record[field]) {
        $(".x-editor-tips").show();
      } else {
        $(".x-editor-tips").hide();
      }
      if (target.hasClass('row-up')) {
        _self.moveUpRow(ev.record)
      }

      if (target.hasClass('row-down')) {
        _self.moveDownRow(ev.record)
      }

      if (target.hasClass('row-del')) {
        BUI.Message.Show({
          msg: "确认要删除吗？",
          zIndex: 9999,
          icon: 'warning',
          closeable: false,
          buttons: [{
            text: '确定',
            elCls: 'button button-primary',
            handler: function () {
              this.close();
              _self.delRow(ev.record);
            }
          }, {
            text: '取消',
            elCls: 'button ',
            handler: function () {
              this.close();
            }
          }]
        });
      }

      if (target.hasClass('delPicture')) {
        let index = _self.store.findIndexBy(record); //当前元素位置
        _self.store.remove(record);
        var delIndex = ev.domTarget.id;
        var imgs = record[_self.uploadDataIndex].split(",");        
        var data = record;
        data[_self.uploadDataIndex] = "";
        $.each(imgs, function (index, img) {
          if (index != delIndex) {
            if (data[_self.uploadDataIndex]) {
              data[_self.uploadDataIndex] += "," + img;
            } else {
              data[_self.uploadDataIndex] = img;
            }
          }
        })

        if (data.status != 1) {
          data.status = 2;
        }
        _self.store.addAt(data, index);
        _self.getPics(index)
      }
      if (target.hasClass('checkbox')) {
        _self.store.setValue(record, field, target.is(':checked') ? "1" : "0");
        return false;
      }
    });
  })
};

/**
 * 加载数据
 * @param param 参数,json格式
 */
 DynamicGrid.prototype.getPics = function (index) {
  let _self = this;
  var fileNames = _self.grid.getItemAt(index)[_self.uploadDataIndex];
  if (fileNames) {
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
            var fileKey = fileObjs[i].fileKey;
            _self.uploadFils[fileKey] = fileObjs[i].url;
            $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv imgxx-"+i+"'><img  onclick=\"$.showImg(this)\" src=" + fileObjs[i].url + "/><div class='del delPicture' id='" + i + "'>删除</div></div>");
          }
          /*if (_self.uploadMax == 0) {
            $(".delPicture").remove();
          }*/
        }
      };
      $.ajax(aContent);
    }else{
      $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv'><img  onclick=\"$.showImg(this)\" src=\"" + fileNames + "\" ><div class='del delPicture' id='" + 0 + "'>删除</div></div>");
    }   
  }
}
DynamicGrid.prototype.getPicsDetail = function (index) {
  let _self = this;
  var fileNames = _self.grid.getItemAt(index)[_self.uploadDataIndex];
  if (fileNames) {
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
            var fileKey = fileObjs[i].fileKey;
            _self.uploadFils[fileKey] = fileObjs[i].url;
            $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv imgxx-"+i+"'><img  onclick=\"$.showImg(this)\" src=" + fileObjs[i].url + "/><div class='del delPicture' id='" + i + "'></div></div>");
          }
          /*if (_self.uploadMax == 0) {
            $(".delPicture").remove();
          }*/
        }
      };
      $.ajax(aContent);
    }else{
      $("#" + _self.uploadId + "" + index).prepend("<div class='dynamicGridDiv'><img  onclick=\"$.showImg(this)\" src=\"" + fileNames + "\" ><div class='del delPicture' id='" + 0 + "'></div></div>");
    }   
  }
}


DynamicGrid.prototype.initDataAjax = function (param, config, successFun) {
  //查询数据
  var _self = this;

  if(config.onDelRow){
    _self.evnets.onDelRow=config.onDelRow;
  }
  if(config.onMoved){
    _self.evnets.onMoved=config.onMoved;
  }
  var aContent = $.AjaxContent(function () {
    _self.initData([], config);
  });
  aContent.url = config.dataUrl;
  aContent.data = param;
  aContent.success = function (result, textStatus) {
    if (result.appcode != 1) {
      _self.initData([], config);
      if (successFun) successFun();
      BUI.Message.Alert(result.databuffer, "warning");
    } else {
      var data = result.result;
      _self.initData(data, config);
      if (successFun) successFun();
    }
  };
  $.ajax(aContent);
}



/**
 *  添加行数据
 * @param addData
 */
DynamicGrid.prototype.addRow = function (addData,addIndex) {
  var _self = this;
  _self.initDataFlag = false;

  if (addData instanceof Array) {
    $.each(addData, function (index, data) {
      var newData = data || {};
      newData.source = 1;
      newData.status = 1;
      newData.sortStatus = 0;
      if (_self.sortName) {
        newData[_self.sortName] = _self.grid.getCount() == 0 ? 0 : _self.grid.getLastItem()[_self.sortName] + 1
        // newData[_self.sortName] = 0;
        // $.each(_self.getData(), function (index, data) {
        //     if(data){
        //       data[_self.sortName]++;
        //     }
        // });
      }
      // if(typeof(addIndex)=="number"){
      //   _self.store.addAt([newData],addIndex);
      //   _self.store.addAt([{source:1}],0);
      //   _self.delRow(_self.store.findByIndex(0));
      // }else{

      //   _self.store.add(newData);
      // }
      _self.store.add(newData);
      var index = _self.store.findIndexBy(newData); //当前元素位置
      if(typeof(addIndex)=="number"){
        if(index>addIndex){
          for(var i=0;i<index-addIndex;i++){
            _self.moveUpRow(newData,true);
          }
        }
      }
      // _self.initUpload(index);
      if (_self.sortName && _self.delData) {
        $.each(_self.delData, function (i, item) {
          item[_self.sortName] = item[_self.sortName] + 1;
        })
      }
    })
  } else {
    _self.addRow([addData],addIndex)
  }

};

/**
 * 删除数据所在行
 * @param record
 */
DynamicGrid.prototype.delRow = function (record) {
  var _self = this;
  _self.initDataFlag = false;
  var index = _self.store.findIndexBy(record); //当前元素位置

  if (index != -1) {
    var length = _self.grid.getCount();
    for (var i = index; i < length; i++) {
      _self.moveDownRow(_self.store.findByIndex(i), true)
    }

    if (record.source == 1) {
      if (_self.sortName && _self.delData.length) {
        $.each(_self.delData, function (i, item) {
          item[_self.sortName] = item[_self.sortName] - 1;
        })
      }
      _self.store.remove(_self.grid.getLastItem());
    } else {
      var data = _self.grid.getLastItem();
      data.status = 3;
      _self.delData.push(data);
      _self.store.remove(_self.grid.getLastItem());
    }
  }

  if(_self.evnets.onDelRow){
    _self.evnets.onDelRow();
  }

};


/**
 *  需要上移的数据
 * @param record
 */
DynamicGrid.prototype.moveUpRow = function (record) {
  var _self = this;
  _self.initDataFlag = false;
  var index = _self.store.findIndexBy(record); //当前元素位置

  var self = _self.store.findByIndex(index);
  var previous = _self.store.findByIndex(index - 1);

  if (previous) {
    _self.store.remove([self, previous]);

    if (_self.sortName) {
      var selfIndex = self[_self.sortName];
      var previousIndex = previous[_self.sortName];
      self[_self.sortName] = previousIndex;
      previous[_self.sortName] = selfIndex;

      if (self.status != 1) {
        self.status = 2;
      }
      if (previous.status != 1) {
        previous.status = 2;
      }

      self.sortStatus = 1;
      previous.sortStatus = 1;
    }
    _self.store.addAt([self, previous], index - 1);

    if (!previous[_self.uploadDataIndex] || previous[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
      // _self.initUpload(index);
    }
    if (!self[_self.uploadDataIndex] || self[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
      // _self.initUpload(index - 1);
    }

    if(_self.evnets.onMoved){
      _self.evnets.onMoved();
    }

  } else {
    // alert("到顶了")
    BUI.Message.Alert("到顶了", 'warning');
  }
};

/**
 *  需要下移的数据
 * @param record
 */
DynamicGrid.prototype.moveDownRow = function (record, dialogFlag) {
  var _self = this;
  _self.initDataFlag = false;
  var index = _self.store.findIndexBy(record); //当前元素位置

  var self = _self.store.findByIndex(index);
  var next = _self.store.findByIndex(index + 1);

  if (next) {
    _self.store.remove([self, next]);
    if (_self.sortName) {
      var selfIndex = self[_self.sortName];
      var nextIndex = next[_self.sortName];
      self[_self.sortName] = nextIndex;
      next[_self.sortName] = selfIndex;
      if (self.status != 1) {
        self.status = 2;
      }
      if (next.status != 1) {
        next.status = 2;
      }
      self.sortStatus = 1;
      next.sortStatus = 1;
    }
    _self.store.addAt([next, self], index);
    if (!self[_self.uploadDataIndex] || self[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
      // _self.initUpload(index + 1);
    }
    if (!next[_self.uploadDataIndex] || next[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
      // _self.initUpload(index);
    }
    if(_self.evnets.onMoved){
      _self.evnets.onMoved();
    }

  } else {
    if (!dialogFlag) {
      // alert("到底了")
      BUI.Message.Alert("到底了", 'warning');
    }
  }
};
/**
 *  加载行上传图片控件
 * @param rowIndex
 */
DynamicGrid.prototype.initUpload = function (rowIndex) {
  $("div[class=cell-error]").show();
  let _self = this;

  // $("#" + _self.uploadId + rowIndex).parent().parent().addClass("upload");

  let uploader = new _self.Uploader.Uploader({    
    render: "#" + _self.gridId,
    data: {fileName: "testFileName.png"},
    url: _self.uploadUrl,
    rules: _self.uploadRules,
    multiple: false,
    listeners: {
        "change": function (ev) {
            if (!ev.items[0].success && ev.items[0].result) {
              BUI.Message.Alert(ev.items[0].msg, "warning");
            }
        },
        "start":function(ev){         
             $("[class*='uploader-btn-']").hide()
        },
        "success":function(ev){
             $("[class*='uploader-btn-']").show();            
        }
    },

    queue: {
      visible: false
    }
  }).render();
  uploader.hide()

  uploader.on('success', function (ev) {
    _self.initDataFlag = false;
    //获取上传返回的结果
    var result = ev.result;
    var self = _self.store.findByIndex(index);
    var update = self;

    if (self[_self.uploadDataIndex]) {
      update[_self.uploadDataIndex] += "," + result.key;
    } else {
      update[_self.uploadDataIndex] = result.key;
    }

    _self.uploadFils[result.key] = result.url;
    _self.store.remove(self);

    if (update.source != 1) {
      update.status = 2
    }

    _self.store.addAt(update, index);

    if (update[_self.uploadDataIndex].split(",").length < _self.uploadMax) {
      // _self.initUpload(index)
    }

  });
};


/**
 * 清空动态表单内容
 */
DynamicGrid.prototype.clear = function () {
  let _self = this;
  $.each(_self.store.getResult(), function (i, item) {
    _self.delRow(_self.store.findByIndex(0))
  })
};

/**
 * 表单验证
 */
DynamicGrid.prototype.isValid = function () {
  $("div[class=cell-error]").show();
  var ret= this.editing.isValid();
  if(ret!=false){ret=true}
    return ret;
};


/**
 *  获取动态表单数据
 * @returns {*|Array} 动态表单数据集合
 */
DynamicGrid.prototype.getData = function () {

  var result = this.store.getResult();
  var delData = this.delData;
  var resultData = [];
  if (delData) {
    // resultData = $.extend(resultData,result, delData)
    resultData = resultData.concat(result)
    resultData = resultData.concat(delData)
  }

  for (var i = 0; i < result.length; i++) {
    if (result[i].hasOwnProperty("isValid") && !result[i].isValid) {
      result[i].isValid = "0"
    }
  }

  return resultData;
};

/**
 *  获取动态表单数据
 * @returns {*|Array} 动态表单数据集合
 */
DynamicGrid.prototype.getDataIndex = function (obj) {

  return this.store.findIndexBy(obj);
  
};


DynamicGrid.prototype.resetData = function (data) {
   //this.initData(params.data,config);
   //var _self=this;
  // var oldDatas=_self.store.getResult();
   // $.each(oldDatas,function(index, el) {
   //    _self.store.remove(el);
   // });
   //_self.store.setResult(data);

   // $.each(data,function(index, el) {
   //    _self.store.add(el);
   // });
};



