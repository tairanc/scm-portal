/**
 * Created by hzwdx on 2017/6/26.
 */
$(function(){
    var downurl = null;
    $("#btn_list").on("click",function(){
        window.location.href = "warehouseManage.html";
    });
    $.warehouseOrderDetail2App = {
        _jdSupplierCode : "JD", //京东供应商编码
        _warehouseOrderCode : "",
        _store : null,
        dialog: null,
        errDialog:null,
        grid2: null,
        /**
         * 初始化
         */
        init : function () {
            this.queryBrand();            
            this.warehouseName=$.getUrlParamdecode("warehouseName");
            this.warehouseInfoId=$.getUrlParamdecode("id");
            this.isNoticeWarehouseItems=$.getUrlParamdecode("isNoticeWarehouseItems"); 
            this.operationalNature = $.getUrlParamdecode("operationalNature");

            $("#warehouseName").html(this.warehouseName)
            if(this.isNoticeWarehouseItems!=1){
                $("#downloadFile").css("marginLeft","271px");
                $("#notice").hide();
            }
            if (this.operationalNature === "1") {
                // 自营仓处理
                $("#notice").hide();
                $("#excelFileHide").hide();
                $("#downloadTemplet").hide();
                $("#showNoNature").hide();
                $("#showNature").show();
            }

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext','bui/tooltip'], function (Form,Grid,Data,PagingBarExt,Tooltip){
                var columns = [
                    {title : '商品SKU编号',dataIndex :'skuCode', width:200,elCls : 'center'},
                    {title : '商品SKU名称',dataIndex :'itemName', width:250,elCls : 'center'},
                    {title : '规格',dataIndex :'specNatureInfo',width:300, elCls : 'center'},
                    {title : '条形码',dataIndex :'barCode',width:200, elCls : 'center'},
                    {title : '商品状态',dataIndex :'isValid',width:150, elCls : 'center',renderer:function(val){
                         return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                    }},
                    {title : '仓库商品ID',dataIndex :'warehouseItemId', width:150,elCls : 'center',renderer:function(val,obj){
                        if(this.operationalNature === "1"){
                            if (obj.skuCode) {
                               return '<span class="grid-command">'+obj.skuCode+'</span>'; 
                           }else{
                                return '<span class="grid-command"></span>';
                           }
                        }else{
                            return '<span class="grid-command">'+val+'</span>';
                        }                    
                    }},
                    {title : '通知仓库状态',dataIndex :'noticeStatus',width:100,elCls : 'center',renderer:function(val,obj){
                        if (this.operationalNature === "1") {
                            return '<span>'+'通知成功'+'</span>';
                        }else{
                            var objStr = BUI.JSON.stringify(obj).replace(/\"/g,"'").replace("\\n", " \t ");
                            if(val==1){
                                return '<span class="grid-status" style="color: red" data-title="'+objStr+'">' + $.dictTranslate("noticeStatus", val) + '</span>'
                            }else{
                                return '<span>'+$.dictTranslate("noticeStatus", val)+'</span>';
                            }
                        }
                    }},
                    {title : '最近更新时间',dataIndex :'updateTime', width:200,elCls : 'center'},
                    {title : '操作',dataIndex :'noticeStatus', width:100,elCls : 'center',renderer:function(val){
                        if(val==0||val==1||val==2){
                            return '<span class="grid-command delete">删除</span>';
                        }else{
                            return '<span class="grid-command">--</span>';
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
                    url : $.scmServerUrl + "warehouseInfo/warehouseItemInfoPage/"+$.getUrlParamdecode("warehouseCode"),
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
                    itemStatusFields : { //设置数据跟状态的对应关系
                      disabled : 'disabled'
                    },
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    plugins: [Grid.Plugins.CheckSelection]
                });
                grid.render();
                grid.on("aftershow", function(e) {
                    const Grid = e.target
                    const items = Grid.getItems()
                    var disabledNum = 0; //对头部checkbox 进行处理
                    items.map((item, index) => {
                        if(item['disabled'] && item['disabled'] == 'true'){
                            disabledNum ++ ;
                        }
                    });
                    if (items.length === disabledNum ) {
                        var checkboxhead = $('.bui-grid-header').find(".x-grid-checkbox")
                            checkboxhead.css("background-position", "-48px 3px")
                    }
                })

                var tips = new Tooltip.Tips({
                    tip : {
                        trigger : '.grid-status', //出现此样式的元素显示tip
                        alignType : 'bottom-left', //默认方向
                        elCls : 'panel',
                        width: 280,
                        titleTpl : '<div class="panel-header">\
                        <h3>通知失败信息</h3>\
                      </div>\
                      <div class="panel-body" style="width:250px;word-wrap:break-word; word-break:break-all;overflow: hidden">\
                        <div>{exceptionReason}</div>\
                      </div>',
                        offset : 10 //距离左边的距离
                    }
                });
                tips.render();

                $.warehouseOrderDetail2App._store = store;
                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                $.warehouseOrderDetail2App_store = store;
                $("#export").on('click',function(){
                    var option = $("#J_Form").serialize();
                    window.open($.scmServerUrl+ "warehouseInfo/itemsExport/"+$.getUrlParamdecode("id")+"?" + option);
                });
                $("#downloadTemplet").on("click",function(){
                    $("#downloadFile").show();
                });
                $("#hoverDisplay").mouseleave(function(){
                    $("#downloadFile").hide();
                });
                $("#template").on("click",function(){
                     window.open("/download/WarehouseItemInfoNoticTemplate/template.xls");
                     $("#downloadFile").hide();
                });
                $("#onlySkucode").on("click",function(){
                    window.open("/download/WarehouseItemInfoNoticTemplate/templateForOnlySkuCode.xls");
                    $("#downloadFile").hide();
               });
                // 条形码验证
                $("#barCode").on("blur", function () {
                    var alertWrong = $("#barCode").val();
                    if (alertWrong.indexOf("，") != -1) {
                        BUI.Message.Alert("存在不合法字符，请输入英文逗号做分隔！",'warning');
                    } 
                });
                $("#add_btn").on("click",function(){
                    $("#skuName").val("");
                    $("#skuCode2").val("");   
                    $("#spuCode").val("");
                    $(".chosen-single span").text('全部品牌')
                    $.warehouseOrderDetail2App.initGoodItemsDialog();
                    $.warehouseOrderDetail2App.dialog.show();                    
                });
                $("#notice").on("click",function(){
                    var items = grid.getSelection();                   
                    if(items.length == 0){
                        BUI.Message.Alert("请选择至少一个商品", "warning");
                        return false;
                    };
                    BUI.Message.Confirm('确认执行此操作？',function(){
                        noticeWarehouse();
                    },'question');                   
                });
                $("#backList").on("click",function(){
                    window.location.href = "warehouseManage.html"
                });
                $('#excelFile').on('change',function(e){

                    var file = e.target.files[0]; 
                    if (file == undefined) {
                        return
                    } 
                    strs = (file.name).split(".");  
                    var suffix = strs[strs.length - 1];  
                    if(suffix!="xls"&&suffix!="xlsx"){  
                        BUI.Message.Alert("文件格式不正确", "warning"); 
                        $.hideLoadMask();
                        return;
                    };
                    $.showLoadMask('正在导入...');
                    var formData = new FormData();                    
                    formData.append("warehouseInfoId",$.getUrlParamdecode("id"));
                    formData.append("file",e.target.files[0]);
                    $.ajax({
                            url:$.scmServerUrl + 'warehouseInfo/noticeStatus',      
                            type:'post', 
                            data:formData,    
                            // 告诉jQuery不要去处理发送的数据
                            processData : false,
                            // 告诉jQuery不要去设置Content-Type请求头
                            contentType : false,
                            complete : function(){
                                $.hideLoadMask();     
                            },
                            success : function(responseStr) {
                                if(responseStr.appcode != 1){
                                    BUI.Message.Alert(responseStr.databuffer,'warning');
                                }else{
                                    BUI.Message.Alert('导入成功',function(){
                                        $.warehouseOrderDetail2App_store.load({});
                                    },'success');
                                }
                                $("#excelFile").val(""); 
                            },
                            error:function(err){
                                $.warehouseOrderDetail2App_store.load({});
                                var result=(JSON.parse(err.responseText)).result
                                if(err.status==400){ 
                                    downurl = result.url                                
                                    $.warehouseOrderDetail2App.importFailDialog(result.url);
                                    $.warehouseOrderDetail2App.errDialog.show();
                                    $("#sucNum").html(result.successCount);
                                    $("#failNum").html(result.failCount);
                                    $("#excelFile").val("");   
                                }else{
                                    BUI.Message.Alert(JSON.parse(err.responseText).databuffer,'warning');
                                    $("#excelFile").val("");   
                                }                                                         
                            }
                        });     
                        
                        
                });
                $("#sel_btn").on("click",function(){
                    var formData = form.serializeToObject();
                    bar.jumpToPageFix(1,formData);
                });
                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('delete')){
                        BUI.Message.Confirm('确认执行此操作？',function(){
                             $.warehouseOrderDetail2App.deleteGood(record['id']);
                        },'question');
                    }
                }); 
                function noticeWarehouse() {
                    var items = grid.getSelection();                   
                    if(items.length == 0){
                        BUI.Message.Alert("请选择至少一个商品", "warning");
                        return false;
                    };
                    var itemIds=[];
                    for(var i=0;i<items.length;i++){
                        itemIds.push(items[i].id)
                    };
                    itemIds = itemIds.toString(itemIds);
                    $(".myBtn").attr("disabled","disabled");
                    items = JSON.stringify(items);
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl+"warehouseInfo/warehouseItemNoticeQimen";
                    aContent.data = {itemIds : itemIds};
                    aContent.type = "POST";
                    aContent.success = function(result,textStatus){
                        if(result.appcode != 1){
                            BUI.Message.Alert(result.databuffer,'warning');
                        }else{
                            $.warehouseOrderDetail2App_store.load({});
                            //window.location.href = "goodInfo.html"
                        }
                    };
                    aContent.complete = function () {
                        $(".myBtn").removeAttr("disabled");
                    };
                    $.ajax(aContent);
                }
            });
        },
        /*添加新商品模态框*/
        initGoodItemsDialog : function () {
            BUI.use(['bui/overlay','bui/form','bui/grid','bui/data','common/pagingbarext'],function(Overlay,Form, Grid, Data,PagingBarExt){
                $("#grid2").html("")
                $("#bar2").html("")
                if($.warehouseOrderDetail2App.grid2) {
                    $.warehouseOrderDetail2App.grid2.remove()
                }
                var form2 = new Form.Form({
                    srcNode : '#J_Form2'
                }).render();

                if(!$.warehouseOrderDetail2App.dialog){
                    $.warehouseOrderDetail2App.dialog = new Overlay.Dialog({
                        title:'添加新商品',
                        width:'60%',
                        height:'70%',
                        contentId:'addGoodDiv',
                        buttons:[
                            {
                                text:'确定',
                                elCls : 'button button-primary myBtn',
                                handler : function(){
                                    addGoodItems();
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
                } 
                
                var columns2 = [
                    {title : '商品SKU名称',dataIndex :'skuName', width:'20%',elCls : 'center',renderer:function (val) {
                        if(val){
                            return val.replace(/ /g,"&nbsp;");
                        }if(val==null){
                            return '<span></span>'
                        }                  
                    }},
                    {title : '商品SKU编号',dataIndex :'skuCode', width:'15%',elCls : 'center'},
                    {title : '商品SPU编号',dataIndex :'spuCode', width:'15%',elCls : 'center'},
                    {title : '规格',dataIndex :'specInfo', width:'15%',elCls : 'center'},
                    {title : '条形码',dataIndex :'barCode', width:'15%',elCls : 'center'},
                    {title : '品牌名称',dataIndex :'brandName', width:'15%',elCls : 'center'},
                    {title : '一级分类-二级分类-三级分类',dataIndex :'categoryName', width:'20%',elCls : 'center'}
                ];

                var Grid = Grid,
                    Store = Data.Store;

                var store2 = new Store({
                        url : $.scmServerUrl + "warehouseInfo/itemsPage/"+$.getUrlParamdecode("id"),
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
                        listeners : {
                            'beforeload' : function () {
                                $('#sel_btn2').attr("disabled","disabled");
                            },
                            'load' : function () {
                                $("#sel_btn2").removeAttr("disabled");
                            },
                            'exception' : function () {
                                $('#sel_btn2').removeAttr("disabled");
                            }
                        }
                    });

                $.warehouseOrderDetail2App.grid2 = new Grid.Grid({
                    render:'#grid2',
                    columns : columns2,
                    width : '100%',
                    loadMask : true,
                    store: store2,
                    emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    plugins: [Grid.Plugins.CheckSelection]
                });

                store2.on("exception", function (e) {
                    $.storeErrorHander(e);
                });
                $.warehouseOrderDetail2App.grid2.render();
                var bar = new PagingBarExt({
                    render: "#bar2",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store2
                }).render();
                

                $("#sel_btn2").on("click",function(){
                    if(form2.isValid()){                        
                        var formData = form2.serializeToObject();
                        bar.jumpToPageFix(1,formData);
                    }
                });

                /**
                 * 添加一件代发商品
                 */
                function addGoodItems() {
                    var records = $.warehouseOrderDetail2App.grid2.getSelection();
                    if(records.length == 0){
                        BUI.Message.Alert("请选择至少一个商品再提交", "warning");
                        return false;
                    }
                    $(".myBtn").attr("disabled","disabled");
                    records = JSON.stringify(records);
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl+"warehouseInfo/saveItems/"+$.getUrlParamdecode("id");
                    aContent.data = {itemsList : records};
                    aContent.type = "POST";
                    //aContent.contentType = "application/json;charset=UTF-8";
                    aContent.success = function(result,textStatus){
                        if(result.appcode != 1){
                            BUI.Message.Alert(result.databuffer,'warning');
                        }else{
                            $.warehouseOrderDetail2App.dialog.close();
                            $.warehouseOrderDetail2App_store.load({});
                            //window.location.href = "goodInfo.html"
                        }
                    };
                    aContent.complete = function () {
                        $(".myBtn").removeAttr("disabled");
                    };
                    $.ajax(aContent);
                }

            });

        },
        /*导入失败说明模态框*/
        importFailDialog : function(fileName){
            BUI.use(['bui/overlay','bui/mask'],function(Overlay){ 
                if(!$.warehouseOrderDetail2App.errDialog){
                    $.warehouseOrderDetail2App.errDialog = new Overlay.Dialog({
                        title:'导入失败说明',
                        width:'30%',
                        height:'40%',
                        contentId:'errMsg',
                        buttons:[
                            {
                                text:'下载失败说明',
                                elCls : 'button button-primary myBtn',
                                handler: function(){
                                    window.open($.scmServerUrl+ "warehouseInfo/exceptionExcel/" + downurl);
                                    $.warehouseOrderDetail2App_store.load({});
                                }
                            },
                            {
                                text:'取消',
                                elCls : 'button',
                                handler : function(){
                                    $.warehouseOrderDetail2App_store.load({});
                                    this.close();
                                }
                            }
                        ]
                    });
                }                
            });
        },
        /*删除商品*/
        deleteGood:function(id){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "warehouseInfo/warehouseItemInfo/" +id;
            aContent.type = "DELETE";
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer, 'warning');
                } else {
                    $.warehouseOrderDetail2App_store.load({});
                    //window.location.href = "goodInfo.html";
                }
            };
            $.ajax(aContent);
        },
        /*查询仓库信息*/
        queryWarehouseInfo:function(id){
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "system/warehouse/" + id;
            aContent.data = {};
            aContent.success = function (result, textStatus){
                if (result.appcode != 1) {
                    BUI.Message.Alert("查询仓库失败", "warning");
                }else{
                    var result = result.result;
                    if(result.isNoticeWarehouseItems!=1){
                        $("#notice").hide();
                    }
                }
            };
            $.ajax(aContent);
        },

        //查询品牌列表
        queryBrand : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/brands";
            //aContent.data = {isValid : "1"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2("brandName", result.result,'name','name',"全部品牌",[]);
                    $("#brandName").chosen();
                    $("#brandName_chosen").css('width','147px')
                }
            };
            $.ajax(aContent);
        }
 }
    $(document).ready(function (e) {
        $.warehouseOrderDetail2App.init();
    });
}(jQuery));