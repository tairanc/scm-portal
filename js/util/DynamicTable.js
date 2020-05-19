/**
 * 动态编辑表格
 * Created by hzwdx on 2017/5/11.
 */

/**
 * 数据状态说明：
 * source:0-查询的数据,1-新增的数据
 * status:0-未更新,1-新增,2-已更新,3-已删除
 * sortStatus:0-排序字段未更新,1-排序字段已更新
 */


var tableCls = "bui-grid-table";
var trCls = "bui-grid-header-row";
var tdCls = "bui-grid-cell-inner";
var trSplit = "-";//行id分隔符

function DynamicTable(paramDict){
    this.lineNum = 0;
    this.delData = [];//删除的数据集*/
    this.tableId = paramDict['tableId'];//表格ID
    this.render = paramDict['render'];//上传div
    this.columns = paramDict['columns'];
    this.url = paramDict['url'];//数据加载的url
    if(paramDict['params']){
        this.params = paramDict['params'];//请求参数，字典格式{}
    }else{
        this.params = {};
    }
    this.uploader = paramDict['uploader'];//上传控件配置
    this.sortField = paramDict['sortField'];//排序字段
    this.width = paramDict['width'];//表格宽度
    this.height = paramDict['height'];//表格高度
    this.showLineNum = getBoolean(paramDict['showLineNum'], false);//显示行号,默认false
    this.autoLoad = getBoolean(paramDict['autoLoad'],false);//是否自动加载数据,默认true
    this.imgShowWidth = paramDict['imgShowWidth'];//图片显示框宽度,
    this.imgShowHeight = paramDict['imgShowHeight'];//图片显示框高度,
    this.up = getBoolean(paramDict['up'], false);//是否开通上移，默认false
    this.down = getBoolean(paramDict['down'], false);//是否开通上移，默认false
    this.del = getBoolean(paramDict['del'], false);//是否开通删除，默认false
    this.onlyShow = getBoolean(paramDict['onlyShow'], false);//是否仅用于显示数据,默认false


    var _self = this;

    BUI.use(['bui/form', 'bui/calendar'],function(Form,Calendar){
        var tbStyle = "padding: 5px;";
        if(_self.width){
            tbStyle += 'width:'+_self.width+';';
        }
        if(_self.height){
            tbStyle += 'height:'+_self.height+';';
        }

        var table = '<table id="'+_self.tableId+'" style="'+tbStyle+'" class="bui-grid-table" border="1">';
        //创建标题
        table += createTitle(_self);

        table += '</table>';
        $("#"+_self.render).append(table);


        if(_self.onlyShow != true){
            $("#"+_self.tableId).on('dblclick', function (e) {
                var target = e.target;
                var tr = $(target).parent().parent();//获取当前行
                if($(target).hasClass('bui-grid-cell')){//点击单元格

                    //表格当前值
                    var currentVal = $(target).children('.cell_content').text();
                    $(target).children('input').each(function () {
                        $(target).children('.cell_content').hide();
                        $(this).val(currentVal);
                        $(this).show();
                    });
                    $(target).children('select').each(function () {
                        $(target).children('.cell_content').hide();
                        $(target).children('.cell_content2').hide();
                        $('#select_id option[value="'+currentVal+'"]').attr("selected", "selected");
                        $(this).show();
                    });

                }

            });
        }


        $("#"+_self.tableId).on('click', function (e) {
            var target = e.target;
            var tr = $(target).parent().parent();//获取当前行
            if(target.className == 'grid-command btn-del'){//删除
                if (confirm("确定要删除改记录吗？")) {
                    del(tr, _self);
                }
            }else if(target.className == 'grid-command btn-up'){//上移
                up(tr, _self);
            }else if(target.className == 'grid-command btn-down'){//下移
                down(tr, _self);
            }

        });


        if(undefined == _self.autoLoad || null == _self.autoLoad || _self.autoLoad == true){
            _self.load(_self.params);
        }


    });



}


/**
 * 获取参数布尔类型结果
 * @param val 布尔参数
 * @param defaultBool 默认值
 * @returns {*}
 */
function getBoolean(val, defaultBool) {
    if(undefined == val){
        return defaultBool;
    }else{
        return val;
    }
}

/**
 * 行数加
 * @param num
 */
DynamicTable.prototype.lineNumAdd = function(num) {
    this.lineNum += num;
}


/**
 * 加载数据
 * @param param 参数,json格式
 */
DynamicTable.prototype.load = function(param) {
    for(var key in this.params){
        param[key] = this.params[key];
    }
    //清除数据
    $("#"+this.render+" table tr").each(function () {
        var tr = $(this);
        if(!tr.hasClass("myTitle")) {//去掉标题行
            del(this, _self);
        }
    });

    var render = this.render;
    var columns = this.columns;

    //查询数据
    var _self = this;
    var aContent = $.AjaxContent();
    aContent.url = this.url;
    aContent.data = param;
    aContent.success = function(result, textStatus){
        if(result.appcode != 1){
            BUI.Message.Alert(result.databuffer,"warning");
        }else{
            var data = result.result;
            for(var i=0; i<data.length; i++){
                createTr("0", data[i], _self)
            }
        }
    };
    $.ajax(aContent);
}


/**
 * 添加记录
 * @param record 记录,可以是单个也可以是数组
 * @param source 数据来源：0-查询,1-新增
 */
DynamicTable.prototype.addRow = function(record, source) {
    var records = new Array();
    var columns = this.columns;
    if({} == record || "" == record || [] == record || null == record || undefined == record){
        var _record = {};
        for(var i=0; i<columns.length; i++){
            _record[columns[i]['dataIndex']] = "";
        }
        records.push(_record);
    }else{
        if(record instanceof Array){
            for(var i in record){
                records.push(record[i]);
            }
        }else{
            records.push(record);
        }

    }
    var _records = new Array();
    for(var i=0; i<records.length; i++){
        _records.push(handlerRecord(records[i], columns));
    }
    for(var i=0; i<_records.length; i++){
        var _source = "1";//默认新增
        if(source){
            _source = source;
        }
        createTr(_source, _records[i], this)
    }
}

/**
 * 删除行
 * @param record
 */
DynamicTable.prototype.delRow = function(record) {
    var _self = this;
    $("#"+_self.tableId+" tr").each(function () {
        var tr = $(this);
        if(tr.attr('class') != "myTitle"){
            var flag = false;
            tr.children("td").each(function () {
                var td = $(this);
                if(td.attr('class') == "bui-grid-hd x-grid-rownumber"){
                    var idx = td.text();
                    if(idx == record['index']){
                        flag = true;
                    }
                }
            });
            if(flag){
                del(tr, _self);
                return false;//此处加这个返回代码是为了防止删除第一行后，表格会把所有数据都删掉
            }
        }
    })


}



/**
 * 获取表格数据
 */
DynamicTable.prototype.getData = function() {
    var data = [];
    $("#"+this.render+" table tr").each(function () {
        var tr = $(this);
        var item = {source:tr.attr("source"), status:tr.attr("status"), sortStatus:tr.attr("sortStatus")};
        if(!tr.hasClass("myTitle")) {//去掉标题行
            tr.children('td').each(function () {
                var td = $(this);
                if(td.hasClass('x-grid-rownumber')){
                    item['index'] = td.text();
                }
                var uploadflag = td.attr("uploadflag");
                if(uploadflag == "1"){
                    td.children('input[type="hidden"]').each(function () {
                        var hidden = $(this);
                        item[td.attr("dataIndex")] = hidden.val();
                    });
                }else{
                    td.children('.cell_content').each(function () {
                        var span = $(this);
                        item[td.attr("dataIndex")] = span.text();
                    });
                }
            });
            data.push(item);
        }
    });
    for(var i=0; i<this.delData.length; i++){
        data.push(this.delData[i]);
    }
    return data;
}

/**
 * 删除记录
 * @param record
 * @param _self
 */
function delRecord(record, _self) {
    if(record){
        var records = [];
        if(record instanceof Array){
            for(var i=0; i<record.length; i++){
                records.push(record[i]);
            }
        }else{
            records.push(record);
        }
        for(var i=0; i<records.length; i++){
            if(record['source'] == "0"){
                _self.delData.push(record);
            }
            _self.lineNumAdd(-1);
        }
    }
}


/**
 * 处理记录
 * @param record 记录
 * @param columns 列
 */
function handlerRecord(record, columns) {
    var _record = {};
    for(var i=0; i<columns.length; i++){
        var dataIndex = columns[i]['dataIndex'];
        var colVal = record[dataIndex];
        if(colVal){
            _record[dataIndex] = colVal;
        }else{
            _record[dataIndex] = "";
        }
    }
    return _record;
}



/**
 * 创建tr行
 * @param columns
 * @param record
 * @param source 来源：0-查询,1-新增
 * @param up 上移
 * @param down 下移
 * @param del 删除
 */
function createTr(source, record, _self) {
    var render = _self.render;
    var columns = _self.columns;
    var up = _self.up;
    var down = _self.down;
    var del = _self.del;
    var showLineNum = _self.showLineNum;
    var lineNum = _self.lineNum;
    var status = "0";//无改变
    if(source == "1"){
        status = 1;//新增
    }
    //行id格式:表格ID+*+lineNum
    var trId = generateTrId(_self.tableId, lineNum);
    var tr = $('<tr id="'+trId+'" source="'+source+'" status="'+status+'" sortStatus="0" class="bui-grid-row"></tr>');
    if(showLineNum){
        tr.append('<td class="bui-grid-hd x-grid-rownumber" style="width: 2%; text-align: center;">'+(lineNum+1)+'</td>')
    }
    var td = "";
    for(var i=0; i<columns.length; i++){
        var visible = getColumuVisible(columns[i]);
        var style = "width:"+columns[i]["width"]+';text-align: '+columns[i].elCls+';';
        if(!visible){
            style += "display:none;";
        }
        if(undefined != columns[i]['renderer'] && "" != columns[i]['renderer']){
            td = $('<td class="bui-grid-cell" dataIndex="'+columns[i]['dataIndex']+'" style="'+style+'">'+columns[i]['renderer']+'</td>');
        }else{
            td = $('<td class="bui-grid-cell" dataIndex="'+columns[i]['dataIndex']+'"style="'+style+'"></td>');
            var val = "";
            if(record[columns[i]['dataIndex']]){
                val = record[columns[i]['dataIndex']];
            }
            var span = $('<span class="cell_content">'+val+'</span>');
            td.append(span);
            if(undefined != columns[i]['editor'] && [] != columns[i]['editor'] && null != columns[i]['editor']){
                //如果是下拉框/上传,那么设置span隐藏
                var _editor = columns[i]['editor'];
                for(var j=0; j<_editor.length; j++){
                    if(_editor[j]['xtype'] == "select" || _editor[j]['xtype'] == "upload"){
                        span.hide();
                    }
                }
                //创建列信息
                createField(td, columns[i], lineNum, record, _self);
            }
        }
        tr.append(td);
    }
    if(up == true ||  down == true || del == true){
        //添加操作列
        var _td = '<td class="bui-grid-cell" style="width: 10%; text-align: center;">';
        if(up){
            _td += '<span class="grid-command btn-up">上移</span>&nbsp;&nbsp;&nbsp;';
        }
        if(down){
            _td += '<span class="grid-command btn-down">下移</span>&nbsp;&nbsp;&nbsp;';
        }
        if(del){
            _td += '<span class="grid-command btn-del">删除</span>';
        }
        tr.append(_td);
    }
    $("#"+render+" table").append(tr);

    BUI.use(['bui/form', 'bui/calendar'],function(Form,Calendar){

        new Form.HForm({
            srcNode : '#J_Form',
            defaultChildCfg : {
                // validEvent : 'blur' //移除时进行验证
            }
        }).render();

        var datepicker = new Calendar.DatePicker({
            trigger:'.calendar',
            autoRender : true
        });


    });

    _self.lineNumAdd(1);

}


/**
 * 创建标题
 * @param columns
 */
function createTitle(_self) {
    var columns = _self.columns;
    var up = _self.up;
    var down = _self.down;
    var del = _self.del;
    var showLineNum = _self.showLineNum;
    var th = "<tr class='myTitle'>";
    if(showLineNum){
        th += '<td class="bui-grid-hd x-grid-rownumber" style="width: 2%; text-align: center;">序号</td>';
    }
    for(var i=0; i<columns.length; i++){
        var visible = getColumuVisible(columns[i]);
        var style = "width:"+columns[i]["width"]+';text-align: '+columns[i].elCls+';';
        if(!visible){
            style += "display:none;";
        }
        th += '<td class="bui-grid-hd x-grid-rownumber" style="'+style+'">'+columns[i]['title']+'</td>';
    }
    if(up == true ||  down == true || del == true){
        //添加操作列
        th += '<td class="bui-grid-hd x-grid-rownumber" style="width: 10%; text-align: center;">操作</td>';
    }
    th += "</tr>";
    return th;
}

/**
 * 获取列的是否显示
 * @param column
 * @returns {boolean}
 */
function getColumuVisible(column) {
    var visible = true;//默认显示
    var v = column['visible'];
    if(undefined != v){
        visible = v;
    }
    return visible;
}

/**
 * 生成行ID
 * @param tableId 表格ID
 * @param lineNum 行号
 * @returns {string}
 */
function generateTrId(tableId, lineNum) {
    return tableId+trSplit+lineNum;
}

/**
 * 拆分行ID
 * @param trId
 * @return [tableId, lineNum]
 */
function splitTrId(trId) {
    return trId.split(trSplit);
}

/**
 * 删除
 * @param tr 行dom对象
 * @returns {boolean}
 */
function del(tr, _self) {
    var lineNum = _self.lineNum;
    var sortField = _self.sortField;
    var id = $(tr).attr("id");
    var item = {source:$(tr).attr("source"), status:"3"};
    //获取删除行的数据
    $(tr).children('td').each(function () {
        var td = $(this);
        var uploadflag = td.attr("uploadflag");
        if(uploadflag == "1"){
            td.children('input[type="hidden"]').each(function () {
                var hidden = $(this);
                item[td.attr("dataIndex")] = hidden.val();
            });
        }else{
            td.children('.cell_content').each(function () {
                var span = $(this);
                item[td.attr("dataIndex")] = span.text();
            });
        }
    });
    if({} != item){
        delRecord(item, _self);
    }
    $("#"+id).remove();
    var splitTr = splitTrId(id);
    var nextId = parseInt(splitTr[splitTr.length-1]) + 1;
    for(var i=nextId; i<lineNum; i++){
        var newId = generateTrId(_self.tableId, i-1);
        var newId2 = generateTrId(_self.tableId, i);
        $("#"+newId2).attr("id", newId);

        //修改显示序号
        var td1 = $($("#"+newId).children("td").get(0));
        var td2 = $($("#"+newId2).children("td").get(0));
        td1.text(i);
        td2.text(i+1);
    }

}





/**
 * 上移
 * @param tr 行dom对象
 * @param sortField 排序字段
 * @returns {boolean}
 */
function up(tr, _self) {
    var sortField = _self.sortField;
    var id = $(tr).attr("id");
    var splitTr = splitTrId(id);
    var _lineNum = parseInt(splitTr[splitTr.length-1]);
    if(_lineNum == 0){
        BUI.Message.Alert("已经到顶嘞!",'warning');
        return false;
    }else{
        var upId = generateTrId(_self.tableId, _lineNum-1);
        //获取两行数据的状态
        var source = $("#"+id).attr("source");
        var status = $("#"+id).attr("status");
        /*if(source == "0"){//查询
            status = "2";
        }*/
        var source2 = $("#"+upId).attr("source");
        var status2 = $("#"+upId).attr("status");
        /*if(source2 == "0"){//查询
            status2 = "2";
        }*/
        //取得两行的排序字段值
        var upSortTd = $("#"+upId).children('td[dataindex="'+sortField+'"]').get(0);
        var upSortVal = $(upSortTd).children('.cell_content').text();
        var currentSortTd = $("#"+id).children('td[dataindex="'+sortField+'"]').get(0);
        var currentSortVal = $(currentSortTd).children('.cell_content').text();
        //取得两行的内容
        var upContent = $("#"+upId).html();
        var currentContent = $("#"+id).html();
        //修改序号
        $("#"+upId).attr("id", id);
        $("#"+id).attr("id", upId);
        //修改数据状态
        $("#"+upId).attr("source", source);
        $("#"+upId).attr("status", status);
        $("#"+id).attr("source", source2);
        $("#"+id).attr("status", status2);
        //交换当前行与上一行内容
        $("#"+upId).html(currentContent);
        $("#"+id).html(upContent);
        //修改排序字段值
        $("#"+upId).children('td').each(function () {
            var td = $(this);
            if(sortField == td.attr("dataindex")){
                td.children('.cell_content').each(function () {
                    $(this).text(upSortVal);
                });
            }
        });
        $("#"+id).children('td').each(function () {
            var td = $(this);
            if(sortField == td.attr("dataindex")){
                td.children('.cell_content').each(function () {
                    $(this).text(currentSortVal);
                });
            }
        });
        //更新排序字段更新状态
        $("#"+upId).attr("sortStatus", "1");
        $("#"+id).attr("sortStatus", "1");
        //修改显示序号
        var td1 = $($("#"+upId).children("td").get(0));
        var td2 = $($("#"+id).children("td").get(0));
        td1.text(_lineNum);
        td2.text(_lineNum+1);
        event.stopPropagation(); //阻止事件冒泡
    }

}


/**
 * 下移
 * @param tr 行dom对象
 * @param sortField 排序字段
 * @returns {boolean}
 */
function down(tr, _self) {
    var sortField = _self.sortField;
    var lineNum = _self.lineNum;
    var id = $(tr).attr("id");
    var splitTr = splitTrId(id);
    var _lineNum = parseInt(splitTr[splitTr.length-1]);
    if(_lineNum >= (lineNum-1)){
        BUI.Message.Alert("已经到底嘞!",'warning');
        return false;
    }else{
        var downId = generateTrId(_self.tableId, _lineNum+1);
        //获取两行数据的状态
        var source = $("#"+id).attr("source");
        var status = $("#"+id).attr("status");
        /*if(source == "0"){//查询
            status = "2";
        }*/
        var source2 = $("#"+downId).attr("source");
        var status2 = $("#"+downId).attr("status");
        /*if(source2 == "0"){//查询
            status2 = "2";
        }*/
        //取得两行的排序字段值
        var currentSortTd = $("#"+id).children('td[dataindex="'+sortField+'"]').get(0);
        var currentSortVal = $(currentSortTd).children('.cell_content').text();
        var downSortTd = $("#"+downId).children('td[dataindex="'+sortField+'"]').get(0);
        var downSortVal = $(downSortTd).children('.cell_content').text();
        //取得两行的内容
        var currentContent = $("#"+id).html();
        var downContent = $("#"+downId).html();
        //修改序号
        $("#"+id).attr("id", downId);
        $("#"+downId).attr("id", id);
        //修改数据状态
        $("#"+id).attr("source", source2);
        $("#"+id).attr("status", status2);
        $("#"+downId).attr("source", source);
        $("#"+downId).attr("status", status);
        //修改排序字段值
        $("#"+id).children('td').each(function () {
            var td = $(this);
            if(sortField == td.attr("dataindex")){
                td.children('.cell_content').each(function () {
                    $(this).text(downSortVal);
                });
            }
        });
        $("#"+downId).children('td').each(function () {
            var td = $(this);
            if(sortField == td.attr("dataindex")){
                td.children('.cell_content').each(function () {
                    $(this).text(currentSortVal);
                });
            }
        });
        //交换当前行与下一行内容
        $("#"+id).html(downContent);
        $("#"+downId).html(currentContent);
        //更新排序字段更新状态
        $("#"+id).attr("sortStatus", "1");
        $("#"+downId).attr("sortStatus", "1");
        //修改显示序号
        var td1 = $($("#"+id).children("td").get(0));
        var td2 = $($("#"+downId).children("td").get(0));
        td1.text(_lineNum+1);
        td2.text(_lineNum+2);
        event.stopPropagation(); //阻止事件冒泡
    }

}


/**
 * 更新行状态
 * @param tr
 */
function updateTrStatus(tr) {
    var source = tr.attr("source");
    var status = tr.attr("status");
    if(source == "0"){//查询
        tr.attr("status","2");//修改
    }
}


/**
 * 创建表单控件
 * @param td
 * @param column
 * @Param rowNo 行号
 * @param up 上移
 * @param down 下移
 */
function createField(td, column, rowNo, record, _self) {
    var editor = column['editor'];
    for(var i=0; i< editor.length; i++){
        var _html = "";
        var xtype = editor[i]['xtype'];
        _html += ' name="'+column['dataIndex']+'"';//设置表单名称
        if(undefined != editor[i]['rules'] && {} != editor[i]['rules'] && "" != editor[i]['rules']){
            if(xtype != "upload"){
                _html += ' data-rules="'+editor[i]['rules']+'"';//设置表单校验规则
            }
        }
        //参数hiddenId、uploadId只给下载控件使用
        var hiddenId = _self.tableId+"_"+column['dataIndex']+rowNo+"_id";//下载隐藏域ID
        var uploadId = _self.tableId+"_"+column['dataIndex']+rowNo+"_upload";//下载Div的ID
        if(xtype == "text"){//文本框
            _html = '<input style="display: none; width: 100%;" type="text"'+_html+' />';
        }else if(xtype == "textArea"){//文本域
            _html = '<textarea style="display: none;" class="control-row4 input-large " '+_html+'/>';
        }else if(xtype == "date"){//日期
            //var _html = Grid.Format.dateRenderer(_html);
            _html = '<input class="input-small calendar" style="display: none; width: 100%;" type="text "'+_html+' />';
        }
        else if(xtype == "select"){//下拉框
            var options = "<option>请选择</option>";
            var items = editor[i]['items'];
            for(var key in items){
                if(key == record[column['dataIndex']]){
                    options += '<option value="'+key+'" selected="selected">'+items[key]+'</option>';
                }else{
                    options += '<option value="'+key+'">'+items[key]+'</option>';
                }
            }
            _html = '<select style="display: none; width: 100%;" '+_html+'>'+options+'</select>';
            //下拉框显示文字
            var selectText = items[record[column['dataIndex']]];
            if(undefined == selectText){
                selectText = "";
            }
            //创建span2,用来页面显示中文
            var span2 = '<span class="cell_content2">'+selectText+'</span>';
            td.append(span2);
        }else if(xtype == "upload"){//下载
            var hiddenField = $('<input id="'+hiddenId+'" style="display: none; width: 100%;" type="hidden" value="'+record[column['dataIndex']]+'"/>');
            _html = '<div id="'+uploadId+'"></div>';
            td.append(hiddenField);
            //上传控件的表格添加标记属性uploadflag=1
            td.attr("uploadflag", "1");
        }
        var field = $(_html);
        td.append(field);

        var tmpEditor = editor[i];
        if(xtype == "upload"){//下载
            td.on('mouseenter',function (e) {
                var target = e.target;//获取td
                if($(target).hasClass("bui-grid-cell")){//表格事件
                    var uploadDiv = $(target).children('div').get(0);
                    if($(uploadDiv).children('div').length == 0){
                        createUpload(hiddenId, uploadId, tmpEditor['rules'], _self.uploader);
                    }
                }
            });
        }else if(xtype == "date"){//日期
            td.on('change',function (e) {
                var target = e.target;//获取td
                $(target).hide();
                //将新值付给表格span
                $(target).parent().children('.cell_content').text($(target).val());
                field.parent().children('.cell_content').show();
                var tr = td.parent();//获取行
                updateTrStatus(tr);
            });
        }

        //编辑完成鼠标移开事件
        field.on('blur',function (e) {
            var target = e.target;
            if(xtype != "date") {//非日期类型
                editComplete(xtype, $(target), td);
            }
        });


        /**
         * 编辑完成
         * @param field
         */
        function editComplete(xtype,field, td) {
            field.hide();
            //当前表格值
            var currentVal = td.children('.cell_content').text();
            var fieldVal = field.val();
            if(currentVal != fieldVal){
                //将新值付给表格span
                field.parent().children('.cell_content').text(field.val());
                if(xtype == "select"){
                    field.parent().children('.cell_content2').text(field.find("option:selected").text());
                    field.parent().children('.cell_content2').show();
                }else{
                    field.parent().children('.cell_content').show();
                }
                var tr = td.parent();//获取行
                updateTrStatus(tr);
            }else{
                td.children('.cell_content').show();
            }
        }

    }
}


/**
 * 创建下载
 * @param hiddenId
 * @param uploadId
 */
function createUpload(hiddenId, uploadId, rules, uploaderConfig) {
    BUI.use(['bui/uploader'],function(Uploader) {
        /**
         * 创建营业执照上传
         * @type {{theme: string, render: string, url: string, delUrl: string, multiple: boolean, maxNum: number, rules: {ext: string[], max: *[], minSize: *[], maxSize: *[]}}}
         */
        var props = {
            text: '上传',
            theme:"imageView",
            render:"#"+uploadId,
            filed:hiddenId,
            downloadUrl: uploaderConfig['downloadUrl'],
            url:uploaderConfig['url'],
            delUrl:uploaderConfig['delUrl'],
            batchDownloadUrl: uploaderConfig['batchDownloadUrl'],
            multiple : uploaderConfig['multiple'],
            imgShowWidth: uploaderConfig['imgShowWidth'],
            imgShowHeight: uploaderConfig['imgShowHeight'],
            //rules:uploaderConfig['rules']
            rules:rules,
            onlyShow:uploaderConfig['onlyShow']
        };

        var uploadExt = new UploadExt(props);
        uploadExt.createUploader();
    });


}








