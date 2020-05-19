/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    window.showCategoryAll=true;
    $.goodsApp = {
        _store : null,
        init : function(){
            this.queryValidList();
            this.initGoodsCategory();
            this.queryBrand();
            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var columns = [
                    {sortable:false,title : '商品ID',dataIndex :'id', visible : false},
                    {sortable:false,title : '所属分类ID',dataIndex :'categoryId', visible : false},
                    {sortable:false,title : '所属品牌ID',dataIndex :'brandId', visible : false},
                    {sortable:false,title : '商品SPU编号',sortable: false,dataIndex :'spuCode', width:'12%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command spuDtl">'+val+'</span>';
                    }},
                    {sortable:false,title : '商品名称',sortable: false,dataIndex :'name', width:'15%',elCls : 'center',renderer : function(val){
                        return val.replace(/ /g,"&nbsp;");
                    }},
                    // {sortable:false,title : '条形码',sortable: false,dataIndex :'barCode', width:'12%',elCls : 'center'},
                    {sortable:false,title : '品牌',sortable: false,dataIndex :'brandName', width:'12%',elCls : 'center'},
                    {sortable:false,title : '类目',sortable: false,dataIndex :'categoryName', width:'25%',elCls : 'center'},
                    {sortable:false,title : '商品货号',sortable: false,dataIndex :'itemNo', width:'12%',elCls : 'center'},
                    {sortable:false,title : '状态',sortable: false,dataIndex :'isValid', width:'4%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                    }},
                    {sortable:false,title : '最近更新时间',sortable: false,dataIndex :'updateTime', width:'10%',elCls : 'center'},
                    {
                        sortable:false,
                        title : '操作',
                        sortable: false,
                        dataIndex :'isValid',
                        width:'10%',
                        renderer : function(val, record, index){
                            var _hmtl = '<span class="grid-command edit">编辑</span>';
                            if(val == "0"){
                                _hmtl += '<span class="grid-command valid1">启用</span>';
                            }else{
                                _hmtl += '<span class="grid-command valid2">停用</span>';
                            }
                            return _hmtl;
                    }}
                ];

                var columns2 = [
                    {sortable:false,title : 'SKU编号',dataIndex :'skuCode', width:'20%',elCls : 'center'},
                    {sortable:false,title : 'SKU名称',dataIndex :'skuName', width:'20%',elCls : 'center',renderer:function(val){
                        if(val){
                            return '<span>'+val+'</span>';
                        }else{
                            return '<span></span>';
                        }
                    }},
                    {sortable:false,title : '规格',dataIndex :'propertyCombineName', width:'25%',elCls : 'center'},
                    {sortable:false,title : '条形码',sortable: false,dataIndex :'barCode', width:'12%',elCls : 'center'},
                    {sortable:false,title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                    }},
                    {
                        sortable:false,
                        title : '操作',
                        dataIndex :'isValid',
                        width:'10%',
                        elCls : 'center',
                        renderer : function(val, record){
                            var _hmtl = "";
                            if(val == "0"){
                                _hmtl = '<span id="'+record.id+'" class="grid-command valid_1">启用</span>';
                            }else{
                                _hmtl = '<span id="'+record.id+'" class="grid-command valid_2">停用</span>';
                            }
                            return _hmtl;
                    }}
                ];


                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();


                var Grid = Grid,
                    Store = Data.Store;


                 // 实例化 Grid.Plugins.Cascade 插件
                 var cascade = new Grid.Plugins.Cascade({
                         renderer : function(record){
                             return '<div class="inner-grid"></div>';	//生成简单表格的容器
                         }
                     }),
                     //简单表格的配置信息
                     simpleGridConfig = {
                         autoRender:true,
                         columns:columns2
                     };


                 var store = new Store({
                     url : $.scmServerUrl + "goods/goodsPage",
                     autoLoad:true,
                     proxy : {
                         method : 'get',
                         dataType : 'json', //返回数据的类型
                         limitParam : 'pageSize', //一页多少条记录
                         pageIndexParam : 'pageNo', //页码
                         startParam : 'start', //起始记录
                         pageStart : 1 //页面从1开始
                     },
                     pageSize : 15,  // 配置分页数目
                     root:'result',
                     totalProperty:'totalCount'
                 }),
                 grid = new Grid.Grid({
                     render:'#grid',
                     columns : columns,
                     store: store,
                     emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                    /* bbar: {
                         pagingBar: true
                     },*/
                     plugins: [cascade]
                 });

                 grid.render();
                 var bar = new PagingBarExt({
                     render: "#bar",
                     elCls: 'bui-pagingbar bui-bar',
                     store: store
                 }).render();
                 $.goodsApp._store = store;

                 store.on("exception", function (e) {
                     $.storeErrorHander(e);
                 });


                 cascade.on('expand',function(ev){
                     var data = ev.record,
                         row = ev.row,
                         sgrid = $(row).data('sub-grid');
                     if(!sgrid){
                         var container = $(row).find('.inner-grid'),
                             gridConfig = BUI.cloneObject(simpleGridConfig);
                         gridConfig.render = container;

                         sgrid = new Grid.SimpleGrid(gridConfig);
                         sgrid.showData(data.records);
                         $(row).data('sub-grid',sgrid);
                     }
                 });

                 grid.on('cellclick',function  (ev) {
                     var record = ev.record; //点击行的记录
                     var target = $(ev.domTarget); //点击的元素
                     if(target.hasClass('edit')){
                         var updateUrl = "goodsUpdate.html?spuCode="+record.spuCode+"&categoryId="+record.categoryId+"&id="+record.id;
                         window.location.href = updateUrl;
                     }
                     var url, isValid, data;
                     if(target.hasClass('valid1') || target.hasClass('valid2')){
                         url = $.scmServerUrl+"goods/isValid/"+record.id;
                         data = {isValid: record.isValid};
                     }else if(target.hasClass('spuDtl')){
                        record['isListGood']= true;
                         window.location.href = "goodsDetail.html?spuCode="+record.spuCode+"&id="+record.id+'&isListGood=' + (record['isListGood']);
                     }else{
                         if(target.hasClass('valid_1') || target.hasClass('valid_2')){
                             url = $.scmServerUrl+"goods/skuValid/"+record.id;
                             data = {spuCode: record.spuCode, isValid: record.isValid};
                         }
                     }
                     if(url){
                         BUI.Message.Confirm('确认执行此操作？',function(){
                             $.goodsApp.setIsValid(url, data);
                         },'question');

                     }

                 });
                 $("#barCode").on("blur", function () {
                    var alertWrong = $("#barCode").val();
                    if (alertWrong.indexOf("，") != -1) {
                        BUI.Message.Alert("存在不合法字符，请输入英文逗号做分隔！",'warning');
                    } 
                });

                $("#add_btn").on("click",function(){
                    $.goodsApp.add();
                });                
                $("#sel_btn").on("click",function(){                              
                    var categoryName = $("#categoryId").text();                 
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        if(categoryName.indexOf('-')==-1){
                            formData.categoryLevel = 1;
                        }else{                            
                            var categoryLevelList= categoryName.split('-');
                            if(categoryLevelList.length==2){
                                formData.categoryLevel = 2;
                            }
                            if(categoryLevelList.length==3){
                                formData.categoryLevel = 3;
                            }
                        }
                        bar.jumpToPageFix(1,formData);
                    }
                });

                 $("#reset_btn").on("click",function(){
                    $("#categoryId").html('');
                    $(".chosen-single span").html('全部品牌')
                     $("#categoryId").append('<option value="">选择类目</option>');
                 });

             });
            },
        /**
         * 设置启用/停用
         * @param url
         * @param data
         */
        setIsValid : function (url, data) {
            var aContent = $.AjaxContent();
            aContent.url = url;
            aContent.data = data;
            aContent.type = "PUT";
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    BUI.Message.Alert(result.databuffer,'info');
                    $.goodsApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /**
         * 添加字典
         */
        add:function(){
            window.location.href = "goodsAdd.html";
        },
        /***
         * 查询启用/停用列表
         */
        queryValidList : function () {            
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"select/validList";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('isValid', result.result,'code','name',true);
                }
            };
            $.ajax(aContent);
        },
        /**
         * 初始化商品分类
         */
        initGoodsCategory: function () {

            BUI.use(['bui/overlay','bui/mask'],function(Overlay){

                var categorys;
                var dialog = new Overlay.Dialog({
                    title:'选择类目',
                    width:800,
                    // height:300,
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary',
                            handler : function(){
                                if(categorys){
                                    var tmp = categorys.val();
                                    if(undefined == tmp || "" == tmp || "[]" == tmp){
                                        BUI.Message.Alert("请选择三级类目", "warning");
                                        return false;
                                    }                                    
                                    var _categorys = JSON.parse(tmp);
                                    var select = $('#categoryId');
                                    var option = $('<option value="'+_categorys[0]["categoryId"]+'" selected="true">'+_categorys[0]["categoryName"]+'</option'+'>');
                                    select.html(option);
                                    this.close();
                                }
                            }
                        },{
                            text:'关闭',
                            elCls : 'button',
                            handler : function(){
                                this.close();
                            }
                        }
                    ],
                    loader : {
                        url : 'goodsCategorySelect.html?showAll=true',
                        autoLoad : false, //不自动加载
                        callback : function(text){
                            categorys = dialog.get('el').find('#categorys');
                        }
                    },
                    mask:true
                });

                $("#categoryId").on('click', function () {
                    dialog.get('loader').load({});
                    dialog.show();
                });


            });


        },
        /**
         * 品牌查询
         */
        queryBrand : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"category/brands";
            aContent.data = {};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem2("brandId", result.result,'id','name','全部品牌',[]);
                    $("#brandId").chosen();
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function(e) {
        $.goodsApp.init();
    });
}(jQuery));