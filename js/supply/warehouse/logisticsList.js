/**
 * Created by steven on 2018/5/8.
 */
$(function(){
    // 采购单管理这里使用 添加id 未知
    $("span[class=logs-btn]").click(function(){
        $.showLogsDialog("logInfoPage?operateType=0&entityType=LogisticsCorporation&entityId="+$.logisticsListApp._record.id);
        // $.showLogsDialog("logInfoPage?operateType=0&entityType=PurchaseOrder&entityId=" + $.getUrlParam("id"));
    }).hide();
    $.logisticsListApp = {
        _flag: 0,
        _record:{},
        init : function(){
            var columns = [
                {title : '主键',dataIndex :'id',  visible : false},
                {title : '物流公司编号',dataIndex :'logisticsCode', width:'10%',elCls : 'center',},
                {title : '物流公司名称',dataIndex :'logisticsCorporationName', width:'20%',elCls : 'center'},
                // {title : '物流公司编码',dataIndex :'logisticsCorporationCode', width:'10%',elCls : 'center',},
                {title : '物流公司类型',dataIndex :'logisticsCorporationType', width:'10%',elCls : 'center',renderer : function(val){
                    // var logisticsCorporationTypeName = val == 0 ? "快递企业" : "货运其他"
                    // return '<span>'+logisticsCorporationTypeName+'</span>';
                    return '<span>'+$.dictTranslate("logisticsCorporationType", val)+'</span>';
                }},
                {title : '联系人',dataIndex :'contacts', width:'10%',elCls : 'center'},
                {title : '联系人电话',dataIndex :'contactsNumber', width:'10%',elCls : 'center'},
                {title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center', renderer : function(val){
                    return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                }},
                {title : '更新时间',dataIndex :'updateTime', width:'15%',elCls : 'center'},
                {title : '操作',dataIndex :'isValid',elCls : 'center',renderer:function(val,record,index){
                    var tip="停用";
                    if(val==0){
                        tip="启用";
                    }
                    if(record.logisticsCode.indexOf("WL")>=0){
                        return '<span class="grid-command edit">编辑</span>'+ '<span class="grid-command update">'+tip+'</span>';
                    }
                    return "-";
                }},
                {title : '备注',dataIndex :'remark',  visible : false}
            ];

            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                //form.render();
                
                $("#add_btn").on("click",function(){
                    $.logisticsListApp.form2.clearErrors();
                    $("#logisticsCode2").val("");
                    $("#logisticsCorporationName2").val("");
                    $("#logisticsCorporationCode2").val("");
                    $("#logisticsCorporationType2").val("");
                    $("#contacts2").val("");
                    $("#contactsNumber2").val("");
                    $("#remark").val("");
                    $("#isValid2").attr("checked",true);                    
                    $.logisticsListApp.dialog.show();
                });
            });

            var props = {
                formRender:"J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                render : "grid", //渲染grid的div的id
                resetBtnRender:'reset',
                dataUrl: $.scmServerUrl + "system/logisticsCorporationPage",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{},
                //width:"100%",//表格宽度
                //height:"100%",//表格高度
                primaryKey: "id",//数据主键Id
                onCellClick:function(ev){
                    var record = ev.record, //点击行的记录
                        target = $(ev.domTarget); //点击的元素
                    if (target.hasClass('edit')) {
                        $("#showLogs").show();
                        $.logisticsListApp.form2.clearErrors();
                        $.logisticsListApp.dialog.set("title","编辑物流公司");
                        $("#logisticsCode2").val(record.logisticsCode);
                        $("#logisticsCorporationName2").val(record.logisticsCorporationName);
                        $("#logisticsCorporationCode2").val(record.logisticsCorporationCode);
                        $("#logisticsCorporationType2").val(record.logisticsCorporationType);
                        $("#contacts2").val(record.contacts);
                        $("#contactsNumber2").val(record.contactsNumber);
                        $("#remark").val(record.remark);
                        if (record.isValid == 1) {
                            $("#isValid2").attr("checked", "checked");
                        }
                        if (record.isValid == 0) {
                            $("#isValid3").attr("checked", "checked");
                        }

                        $.logisticsListApp._record=record;
                        $.logisticsListApp.dialog.show();
                    }else if(target.hasClass('update')){
                        var msg='您确认要'+target.text()+'吗？';
                        BUI.Message.Confirm(msg, function () {                            
                            $.logisticsListApp._record=record;
                            $.logisticsListApp.updateState(record.id);
                        }, 'question');
                    }
                }
                // handlerColumnTitle:"操作",//操作栏标题
                // handlerCollections: [
                //     {
                //         name: "编辑", //操作名称
                //         operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                //         submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                //         redictUrl: "logisticsUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                //     },
                //     {
                //         name: "启用", //操作名称
                //         ajaxMethod:"PUT",
                //         relyField : {"fieldName":"isValid", "fieldValue":"0"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                //         confirm:"1", //是否弹出确认窗口:0-否,1-是
                //         operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                //         submitUrl: $.scmServerUrl+"system/updateState", //提交后台地址, 当 operateType=0时不能为空
                //         redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                //     },
                //     {
                //         name: "停用", //操作名称
                //         ajaxMethod:"PUT",
                //         relyField : {"fieldName":"isValid", "fieldValue":"1"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                //         confirm:"1", //是否弹出确认窗口:0-否,1-是
                //         operateType: "0", //操作类型: 0-ajax提交后台, 1-页面跳转
                //         submitUrl: $.scmServerUrl+"system/updateState", //提交后台地址, 当 operateType=0时不能为空
                //         redictUrl: "" //页面跳转地址, 当 operateType=1时不能为空
                //     },

                //     {
                //         name: "--", //操作名称
                //         relyField : {"fieldName":"name", "fieldValue":"admin"},//依赖字段和字段值,如果字段值不等于这里的值，那么不显示改操作
                //     },
                // ] //操作集合
            } ;
            $.logisticsListApp.myGrid = new GridExt(props);
            $.logisticsListApp.myGrid.createGrid();
        },
        /**
         * 初始化一件代发商品弹出框
         */
        initDialog : function () {
            BUI.use(['bui/overlay','bui/form'],function(Overlay,Form){

                $.logisticsListApp.form2 = new Form.Form({
                    srcNode : '#J_Form2',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                }).render();

                $.logisticsListApp.dialog = new Overlay.Dialog({
                    title:'新增物流公司',
                    width:'810',
                    height:'70%',
                    //配置DOM容器的编号
                    contentId:'externalItemsDiv',
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary myBtn',
                            handler : function(){
                                if($.logisticsListApp.form2.isValid()){
                                    var formDatasecond = $.logisticsListApp.form2.serializeToObject();
                                    if ($.trim(formDatasecond.logisticsCorporationName2) == "") {
                                        BUI.Message.Alert('请输入公司名称！',"warning");
                                        return
                                    }
                                    var contactsNumberValue = formDatasecond.contactsNumber2
                                    if (contactsNumberValue != "") {
                                        var regexp = new RegExp(/^(0\d{2,3}-?\d{7,8}$)|((((1[3-7][0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$)/);
                                        if (!regexp.test(contactsNumberValue)) {
                                            BUI.Message.Alert('电话号码格式错误',"warning");
                                            return
                                        }
                                    }
                                    formDatasecond['isValid'] = formDatasecond['isValid2'];
                                    formDatasecond['logisticsCorporationName'] = formDatasecond['logisticsCorporationName2'];
                                    formDatasecond['logisticsCorporationCode'] = formDatasecond['logisticsCorporationCode2'];
                                    formDatasecond['logisticsCorporationType'] = formDatasecond['logisticsCorporationType2'];
                                    formDatasecond['contacts'] = formDatasecond['contacts2'];
                                    formDatasecond['contactsNumber'] = formDatasecond['contactsNumber2'];
                                    formDatasecond['logisticsCode2'] = $("#logisticsCode2").val();
                                    if(formDatasecond['logisticsCode2']!=""){
                                        $.logisticsListApp.saveUpdate(formDatasecond,$.logisticsListApp._record.id);
                                    }else{
                                        $.logisticsListApp.saveAdd(formDatasecond, '');
                                    }
                                    

                                }
                            }
                        },{
                            text:'取消',
                            elCls : 'button',
                            handler : function(){
                              $('#J_Form2').find('.x-field-error').hide();
                              $('#J_Form2').find('input').removeClass('bui-form-field-error');
                                this.close();
                            }
                        }
                    ]
                });

            });
        },
        /**
         * 新加保存
         */
        saveAdd:function(fromData,tip){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/logisticsCorporation";
            aContent.data = fromData;
            aContent.type = "POST";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,function() {
                        //window.location.reload();
                    },'error');
                }else{
                    //window.location.reload();
                    $.logisticsListApp.myGrid.store.load();
                    $.logisticsListApp.dialog.close();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 编辑数据
         */
        saveUpdate:function(fromData,id){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/logisticsCorporation/"+id;
            aContent.data = fromData;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,function() {
                        //window.location.reload();
                    },'error');
                }else{
                    //window.location.reload();
                    $.logisticsListApp.myGrid.store.load();
                    $.logisticsListApp.dialog.close();
                }
            };
            $.ajax(aContent);
        },
        updateState:function(id){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/updateState/"+id;
            aContent.data = {"id":id};
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,function() {
                        //window.location.reload();
                    },'error');
                }else{
                    //window.location.reload();
                    $.logisticsListApp.myGrid.store.load();
                    //$.logisticsListApp.dialog.close();
                }
            };
            $.ajax(aContent);
        },
        add:function(){
           window.location.href = "logisticsAdd.html";
        }
    }
    $(document).ready(function(e) {
        $.logisticsListApp.init();
        $.logisticsListApp.initDialog();
    });
}(jQuery));