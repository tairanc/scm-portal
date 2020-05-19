/**
 * Created by steven on 2018/5/4.
 */
$(function(){
    var storelist=[];
    // 采购单管理这里使用 添加id 未知
    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?operateType=0&entityType=WarehousePriority");
        // $.showLogsDialog("logInfoPage?operateType=0&entityType=PurchaseOrder&entityId=" + $.getUrlParam("id"));
    });
    $.shipMentsListApp = {
        shipGrid:null,
        init : function(){
            var columns = [
                {title : '主键',dataIndex :'id', width:'10%', visible : false},
                {title : 'warehouseCode',dataIndex :'warehouseCode', width:'10%', visible : false},
                {title : '仓库名称',dataIndex :'warehouseName', width:'50%',elCls : 'center'},
                // {title : '发货优先级',dataIndex :'priority', width:'20%',elCls : 'center'},
                {userTitle : '发货优先级', hasTools: true, moveUpFlag: true, moveDownFlag: true, delFlag: false,elCls: 'center',width: '25%',userStyle:true,},
                {title : '是否启用',dataIndex :'isValid', width:'20%',elCls : 'center',renderer:function(val,item,index){
                    if (item.isValid != 1) {
                        return "<input type='checkbox' name='check_index' onchange='$.shipMentsListApp.checkboxClick(this,"+index+")' style='margin-left: 10px;'";
                    }else{
                      return "<input type='checkbox' name='check_index' onchange='$.shipMentsListApp.checkboxClick(this,"+index+")' checked style='margin-left: 10px;'";  
                    }
                    
                }},
            ];

            BUI.use(['bui/overlay','bui/form','bui/grid','bui/data','common/pagingbarext'],function(Overlay,Form, Grid, Data,PagingBarExt){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();
                
                $("#add_btn").on("click",function(){
                    $.shipMentsListApp.queryValidList();
                    $.shipMentsListApp.getcheckboxlist(textTable.getData());
                    dialog.show();
                });

                var dialog = new Overlay.Dialog({
                    title:'新增发货仓',
                    width:'600',
                    height:'400',
                    //配置DOM容器的编号
                    contentId:'show_addmore',
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary myBtn',
                            handler : function(){
                                var formValue = form.serializeToObject();
                                if (formValue.warehouseName == "") {
                                    BUI.Message.Alert("请选择仓库！",'warning');
                                    return
                                }
                                if(formValue.warehouseIndex==""){
                                    BUI.Message.Alert("请选择发货优先级！",'warning');
                                    return
                                }
                                if (formValue.new_checkbox) {
                                    formValue.isValid = 1
                                }else{
                                    formValue.isValid = 0
                                }                                 
                                // var newTextData = textTable.getData();
                                //     newTextData.splice(inIndex,0,formValue);
                                //     console.log(newTextData)
                                if(form.isValid()){
                                    textTable.addRow({
                                        warehouseCode:$("#warehouseName").val(),
                                        warehouseName:$("#warehouseName").find("option:selected").text(),
                                        isValid:formValue.isValid
                                    },formValue.warehouseIndex-0);
                                    this.close();
                                }
                            }
                        },{
                            text:'取消',
                            elCls : 'button',
                            handler : function(){
                                this.close();
                            }
                        }
                    ]
                });
            });

            var textTable = new DynamicGrid(columns);
            var textDataConfig = {
                gridId: "grid",
                sortName: "sort",
                showRowNumber:true,
                oldDateNotEdit: true,
                emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                dataUrl: $.scmServerUrl + "warehousePriority/warehousePriorityList"
            };
            textTable.initDataAjax({}, textDataConfig);
            $.shipMentsListApp.shipGrid=textTable;
            $("#save_btn").on('click', function () {
                // console.log(storelist)
                var records = textTable.getData();
                var checklist = $('input:checkbox[name=check_index]');
                var checkedNum = 0;
                for (var i = 0; i < checklist.length; i++) {
                    if (checklist[i].checked) {
                        checkedNum ++ ;
                    }
                    records[i].isValid = checklist[i].checked ? "1" : "0"
                }
                if (checkedNum <= 0 ) {
                   BUI.Message.Alert("请确保至少一个仓库处于“启用”状态!",'warning'); 
                }else{
                    var formData = {
                        "warehousePriorityInfo":JSON.stringify(records)
                    }
                    $.shipMentsListApp.savechild(formData, '');
                }
            });
        },
        /*
        * 触发checkbox 事件
        */
        getcheckboxlist : function(value){
            // console.log(value);
            var _getcheckboxlist = [];
            for (var i = 0; i < value.length; i++) {
                var _pushdata = {
                    warehouseIndex:i,
                    index:i
                }
                _getcheckboxlist.push(_pushdata)
            }
            if(_getcheckboxlist.length==0){
                _getcheckboxlist.push({warehouseIndex:0,index:0});
            }
            $.AddItem2("warehouseIndex", _getcheckboxlist, "warehouseIndex", "index", "请选择");
        },
        checkboxClick : function(obj,index){
            storelist = [];
            var checklist = $('input:checkbox[name=check_index]');
            for (var i = 0; i < checklist.length; i++) {
                if (checklist[i].checked) {
                    storelist.push(i);
                }
            }

            setTimeout(function(){                
                var record=$.shipMentsListApp.shipGrid.getData()[index];
                record.isValid=obj.checked ? "1" : "0";
                if(record.isValid=="0"){
                    for(var i=index;i<$.shipMentsListApp.shipGrid.getData().length;i++){
                        $.shipMentsListApp.shipGrid.moveDownRow(record,true);
                    };
                    // var rowContanter= $(obj).parent().parent().parent().prev().children(".bui-grid-cell-inner");
                    // rowContanter.append("<span class='bui-grid-cell-text spanhide'>-</span>");
                    // rowContanter.children().eq(0).hide();
                }
                
            },500);
        },
        /***
         * 查询启用/停用列表
         */
        queryValidList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"warehousePriority/warehouseList";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var _result = result.result;
                    var _showResult=[];
                    //$.AddItem("warehouseName", _result, "code", "warehouseName", true);
                    var dataResult= $.shipMentsListApp.shipGrid.getData();
                    $.each(_result,function(i,n){
                        var _exist=false;
                        $.each(dataResult,function(i2,n2){
                            if(n.code==n2.warehouseCode){
                                _exist=true;
                            }
                        });
                        if(!_exist){
                            _showResult.push(n);
                        }
                    });
                    $.AddItem2("warehouseName", _showResult, "code", "warehouseName", "请选择");
                }
            };
            $.ajax(aContent);
        },
        savechild:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "warehousePriority/warehousePriority";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,function() {
                        window.location.reload();
                    },'error');
                }else{
                    BUI.Message.Alert(result.databuffer,function(){
                        window.location.reload();
                    },'success');
                    // $.purchaseGroupAddApp.dialog.hide();
                }
            };
            $.ajax(aContent);
        },
    }
    $(document).ready(function(e) {
        $.shipMentsListApp.init();
    });
}(jQuery));