/**
 * Created by SunXin on 2017/6/14.
 */
$(function () {

    $.warehouseManage = {
        _dialog: null,
        init: function () {                
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'], function (Form,Grid,Data,PagingBarExt,Tooltip) {
                var columns = [
                    {title : '主键',dataIndex :'id', width:'3%', visible : false},
                    {title: '仓库编号', dataIndex: 'code', width: '12%', elCls: 'center'},
                    {title: '仓库名称', dataIndex: 'warehouseName', width: '12%', elCls: 'center'},
                    {title: '仓库类型', dataIndex: 'warehouseTypeCode', width: '12%', elCls: 'center',renderer:function(val){
                        return '<span>'+$.dictTranslate("warehouseTypeCode", val)+'</span>';
                    }},
                    {title: '运营性质-运营类型', dataIndex: 'isValid', width: '15%', elCls: 'center',renderer:function(val,record){
                            var newtype = '';
                            var newnature = '';
                            if (record.operationalType === "0") {
                                newtype = '-纯仓库'
                            }else if (record.operationalType === "1") {
                                newtype = '-门店仓(普通门店)'
                            }else if (record.operationalType === "2") {
                                newtype = '-门店仓(无人店)'
                            }else{
                                newtype = ''
                            }
                            
                            if (record.operationalNature === "0") {
                                newnature = '第三方仓库'
                            }else if (record.operationalNature === "1") {
                                newnature = '自营仓库'
                            }else{
                                newnature = ''
                            }
                            return '<span>'+newnature+newtype+'</span>';
                    }},
                    {title: 'SKU数量', dataIndex: 'skuNum', width: '8%', elCls: 'center'},
                    {title: '货主仓库状态', dataIndex: 'ownerWarehouseState', width: '8%', elCls: 'center',renderer:function(val,obj){
                        if(obj.operationalNature === "1"){
                            return '<span >'+'通知成功'+'</span>';
                        }else{
                            return '<span>'+val+'</span>';
                        }
                    }},
                    {title: '状态', dataIndex: 'isValid', width: '10%', elCls: 'center',renderer:function(val){
                        if(val=="0"){
                            return '<span style="color:orange;">'+$.dictTranslate("isValid", val)+'</span>';
                        }else{
                            return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                        }
                    }},
                    {title: '创建人', dataIndex: 'createOperator', width: '8%', elCls: 'center'},
                    {title: '最近更新时间', dataIndex: 'updateTime', width: '12%', elCls: 'center'},
                    {title: '货主管理', dataIndex: '', width: '8%', elCls: 'center',renderer:function (val,obj) {
                        if(obj.operationalNature === "1"){
                            return '<span >'+'-'+'</span>';
                        }else{
                            return '<span class="grid-command ownerDtl">'+'货主管理'+'</span>';
                        }
                    }},
                    {title: '商品管理', dataIndex: '', width: '8%', elCls: 'center',renderer:function () {
                        return '<span class="grid-command goodDtl">'+'商品管理'+'</span>';
                    }},
                    {title: '操作', dataIndex: 'isValid', width: '8%', elCls: 'center',renderer:function(val,record){
                        if(val =="1"){
                            return '<span class="grid-command update">编辑</span>'+'<span class="grid-command disable ">停用</span>';
                        }
                        if(val=="0"){
                            return '<span class="grid-command update">编辑</span>'+'<span class="grid-command enable ">启用</span>';
                        }
                    }}
                ];
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                var Grid = Grid,
                    Store = Data.Store;
                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                }); 
                var store = new Store({
                    url : $.scmServerUrl + "system/warehousePage",
                    autoLoad:true,
                    proxy : {
                        method : 'get',
                        dataType : 'json', //返回数据的类型
                        limitParam : 'pageSize', //一页多少条记录
                        pageIndexParam : 'pageNo', //页码
                        startParam : 'start', //起始记录
                        pageStart : 1 //页面从1开始
                    },
                    pageSize : 10,  // 配置分页数目
                    root:'result',
                    totalProperty:'totalCount',
                    params: {}
                }),
                grid = new Grid.Grid({
                    render:'#grid',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    plugins: [editing,BUI.Grid.Plugins.RowNumber]
                });
                grid.render();
                $.warehouseManage._store = store;
                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                $("#add_btn").on("click",function(){
                    $.warehouseManage.add();
                });
                
                 $("#operationalNature").on("change",function(){
                     var formData = form.serializeToObject();
                    if (formData.operationalNature == 1) {
                        $("#operationalType").show();
                    }else{
                        $("#operationalType").hide();
                    }
                 });

                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    if (formData.operationalNature != 1) {
                       formData.operationalType = null 
                    }
                    bar.jumpToPageFix(1,formData);
                });
                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('ownerDtl')){
                        window.location.href = "ownerInfo.html?" + encodeURIComponent("ownerName="+record['ownerName']+"&remark="+record["remark"]+"&warehouseOwnerId="+ record['warehouseOwnerId']+"&ownerId="+record['ownerId']+"&ownerWarehouseState="+record['ownerWarehouseState']+'&warehouseName='+record['warehouseName']+'&id='+record['id']+'&isNoticeSuccess='+record['isNoticeSuccess']);
                    }else if(target.hasClass('goodDtl')){
                        window.location.href = "goodInfo.html?" + encodeURIComponent("warehouseCode="+record['code']+"&warehouseName="+record['warehouseName']+"&id="+record['id']+'&isNoticeWarehouseItems='+record['isNoticeWarehouseItems']+"&operationalNature="+record['operationalNature']);
                    }else if(target.hasClass('update')){
                        window.location.href= "warehouseUpdate.html?" + encodeURI("id="+record['id']);
                    }else if(target.hasClass('disable')){
                        BUI.Message.Confirm('您确认要停用吗？',function(){
                            $.warehouseManage.updateState(record['id'],'1');
                        },'question'); 
                    }else if(target.hasClass('enable')){
                        BUI.Message.Confirm('您确认要启用吗？',function(){
                            $.warehouseManage.updateState(record['id'],'0');
                        },'question'); 
                    }
                }); 
            });                      
        },
        //修改仓库状态
        updateState:function(id,isValid){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse/updateState/" + id;
            aContent.data = {
                isValid:isValid
            };
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "warehouseManage.html";
                }
            };
            $.ajax(aContent);
        },
        add:function(){
            window.location.href = "warehouseAdd.html";
        }
    }
    $(document).ready(function (e) {
        $.warehouseManage .init();
    });
}(jQuery));