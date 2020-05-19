/**
 * Created by Administrator on 2016/3/25.
 */
$(function () {

    $.brandApp = {
        uploadExt1: null,//对象
        init: function () {
            BUI.use('bui/calendar',function(Calendar){
                var datepicker = new Calendar.DatePicker({
                   trigger:'.calendar',
                   autoRender : true
                 });
            });
            $("#isValid").find("option[value='1']").attr("selected",true);             
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'], function(Form,Grid,Data,PagingBarExt,Tooltip) {
                var columns = [
                    {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                    {title: '品牌名称', dataIndex: 'name', width: '18%', elCls: 'center',renderer:function (val, obj) {
                        return obj.highLightName?obj.highLightName:val;
                    }},
                    {title: '品牌别名', dataIndex: 'alise', width: '18%', elCls: 'center'},
                    {
                        sortable: false,title: '品牌LOGO', dataIndex: 'logo', width: '100', elCls: 'center', renderer: function (value) {
                        if (value != null && value != '') {
                            return '<img src="' + value + '" onclick=" $.showImg(this);" style="width: 50%"/>'
                        }
                    }
                    },
                    {
                        title: '品牌网址', dataIndex: 'webUrl', width: '20%', elCls: 'center', renderer: function (value) {
                        if(value!= null && value!=''){
                            return '<a href="'+value+'" target="_blank" >'+value+'</a>'
                        }                    
                    }
                    },
                    {
                        title: '状态', dataIndex: 'isValid', width: '6%', elCls: 'center'
                        ,renderer :function(value){
                        return '<span>'+$.dictTranslate("isValid", value)+'</span>'
                    }
                    },
                    {title: '最近更新人', dataIndex: 'lastEditOperator', width: '12%', elCls: 'center'},
                    {title: '最近更新时间', dataIndex: 'updateTime', width: '15%', elCls: 'center'},
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
                //form.render();
                var Grid = Grid,
                    Store = Data.Store;
                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });  
                var store = new Store({
                    url : $.scmServerUrl + "category/brandPage",
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
                    params: {isValid:1}
                }),
                grid = new Grid.Grid({
                    render:'#grid',
                    columns : columns,
                    store: store,
                    width:'100%',
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    // bbar:{
                        // pagingBar:表明包含分页栏
                        // pagingBar:true
                    // },
                    plugins: [editing]
                });

                grid.render();
                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('update')){
                        window.location.href= encodeURI("brandUpdate.html?id="+record['id']);
                    }else if(target.hasClass('disable')){
                        BUI.Message.Confirm('您确认要停用吗？',function(){
                            $.brandApp.updateState(record['id'],'1');
                        },'question'); 
                    }else if(target.hasClass('enable')){
                        BUI.Message.Confirm('您确认要启用吗？',function(){
                            $.brandApp.updateState(record['id'],'0');
                        },'question'); 
                    }
                });
                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                });
                $("#add_btn").on("click", function () {
                    $.brandApp.add();
                });
                $("#reset").on('click',function(){
                    $("#isValid").find('option[value="1"]').attr("selected",false); 
                    form.clearErrors();
                })
            });
        },
        /**
         * 添加品牌
         */
        add: function () {
            window.location.href = "brandAdd.html";
        },
        /***
         * 查询启用/停用列表
         */
        queryValidList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "config/dicts";
            aContent.data = {typeCode: "isValid"};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                     BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('isValid', result.result, 'value', 'name',true);
                }
            };
            $.ajax(aContent);
        },

        //操作启停用
        updateState :function(id,isValid){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "category/brand/state/" + id;
            aContent.data = {
                isValid:isValid
            };
            aContent.type = "PUT";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    window.location.href = "brandList.html";
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.brandApp.init();
    });
}(jQuery));