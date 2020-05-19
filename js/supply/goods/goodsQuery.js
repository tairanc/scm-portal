/**
 * Created by sone on 2017/4/28.
 */

$(function(){    
    window.showCategoryAll=true;
    $.goodsQueryApp = {
        _store : null,
        init : function(){

            this.queryValidList();
            this.initGoodsCategory();
            this.queryBrand();
            this.querySupplier();
             BUI.use(['bui/form','bui/grid','bui/data','bui/tab','bui/mask'],function(Form,Grid,Data,Tab){
                 var tab = new Tab.TabPanel({
                     srcNode : '#tab',
                     elCls : 'nav-tabs',
                     itemStatusCls : {
                         'selected' : 'active'
                     },
                     panelContainer : '#tabContent'//如果不指定容器的父元素，会自动生成
                 });
                 tab.render();
             });

            this.initGoodsQuery();
            this.initExternalGoodsQuery();
        },
        /**
         * 初始化自采商品查询
         */
        initGoodsQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var columns = [
                    {sortable:false,title : '商品ID',dataIndex :'id', visible : false,},
                    {sortable:false,title : '商品SKU编号',sortable: false,dataIndex :'skuCode', width:'10%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {sortable:false,title : 'SKU名称',dataIndex :'skuName',width:'10%', elCls : 'center'},
                    {sortable:false,title : 'SPU编号',sortable: false,dataIndex :'spuCode', width:'12%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command spuDtl">'+val+'</span>';
                    }},
                    {sortable:false,title : '规格',dataIndex :'propertyValue',width:'10%',elCls : 'center'}, 
                    {sortable:false,title : '条形码',sortable: false,dataIndex :'barCode', width:'10%',elCls : 'center'},
                    {sortable:false,title : '类目',sortable: false,dataIndex :'categoryName', width:'10%',elCls : 'center'},
                    {sortable:false,title : '品牌',sortable: false,dataIndex :'brandName', width:'8%',elCls : 'center'},
                    {sortable:false,title : '可用正品总库存',sortable: false,dataIndex :'availableInventory', width:'8%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {sortable:false,title : '仓库锁定正品总库存',sortable: false,dataIndex :'realInventory', width:'8%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }, visible : false},
                    {sortable:false,title : '商品状态',sortable: false,dataIndex :'isValid', width:'7%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                    }},
                    {sortable:false,title : '最近更新时间',sortable: false,dataIndex :'updateTime', width:'10%',elCls : 'center'}
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

                var store = new Store({
                        url : $.scmServerUrl + "goods/goodsSkuPage",
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
                        totalProperty:'totalCount'
                    }),
                    grid = new Grid.Grid({
                        render:'#grid',
                        columns : columns,
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        store: store,
                        // bbar:{
                            // pagingBar:表明包含分页栏
                            // pagingBar:true
                        // }
                    });

                store.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                grid.render();
                var bar = new PagingBarExt({
                    render: "#bar",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();

                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('skuDtl')){
                        window.location.href = "goodsSkuDetail.html?spuCode="+record['spuCode']+"&skuCode="+record['skuCode'];
                    }else if(target.hasClass('spuDtl')){
                        record['isQueryGood']= true;
                        window.location.href = "goodsDetail.html?hideLogs=true&hideEdit=true&spuCode="+record['spuCode']+'&isQueryGood=' + (record['isQueryGood']);
                    }
                });

                $("#sel_btn").on("click",function(){
                    var categoryLevelList=[];
                    var categoryName = $("#categoryId").text();  
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        if(categoryName.indexOf('-')==-1){
                            formData.categoryLevel = 1;
                        }else{
                            categoryLevelList= categoryName.split('-');
                            if(categoryLevelList.length==2){
                                formData.categoryLevel = 2;
                            }
                            if(categoryLevelList.length==3){
                                formData.categoryLevel = 3;
                            }
                        }
                        //store.load(formData);
                        if(formData.itemName!=''){
                            var _self = bar,
                                //store = _self.get('store'),
                                pageSize = _self.get('pageSize'),
                                index =0,
                                start = index * pageSize;
                            var result = _self.fire('beforepagechange', {from: _self.get('curPage'), to: 1});
                            store.load($.extend({start: 0,limit: pageSize, pageIndex: index},formData))
                        }else{
                            store.load(formData);
                            bar.jumpToPage(1);
                        }
                    }
                });

                $("#reset_btn").on("click",function(){
                    $("#categoryId").html('');
                    $(".chosen-single span").html('全部品牌');
                    $("#categoryId").append('<option value="">选择类目</option>');
                });
                //导出自采商品列表
                $("#export_btn").on('click',function(){
                    var option = $("#J_Form").serialize();
                    var categoryOption="";
                    var categoryLevelList=[];
                    var categoryName = $("#categoryId").text();  
                        if(categoryName.indexOf('-')==-1){
                            categoryOption="&categoryLevel=1";
                        }else{
                            categoryLevelList= categoryName.split('-');
                            if(categoryLevelList.length==2){
                                categoryOption="&categoryLevel=2";
                            }
                            if(categoryLevelList.length==3){
                                categoryOption="&categoryLevel=3";;
                            }
                        }

                    window.open($.scmServerUrl+ "goods/itemsExport?" + option+categoryOption);
                });

            })

        },
        /**
         * 初始化代发商品查询
         */
        initExternalGoodsQuery : function () {

            BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){
                var columns = [
                    {sortable:false,title : '商品ID',dataIndex :'id', visible : false},
                    {sortable:false,title : '供应商ID',dataIndex :'supplierId', visible : false},
                    {sortable:false,title : '供应商编号',dataIndex :'supplierCode', visible : false},
                    {sortable:false,title : '商品SKU编号',dataIndex :'skuCode', width:'10%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {sortable:false,title : '供应商名称',dataIndex :'supplierName', width:'6%',elCls : 'center'},
                    {sortable:false,title : '供应商商品SKU编号',dataIndex :'supplierSkuCode', width:'10%',elCls : 'center'},
                    {sortable:false,title : '商品名称',dataIndex :'itemName', width:'26%',elCls : 'center',renderer : function(val){
                        return val.replace(/ /g,"&nbsp;");
                    }},
                    {sortable:false,title : '条形码',dataIndex :'barCode', width:'8%',elCls : 'center', renderer : function(val){
                        if(val == 0 || val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {sortable:false,title : '供货价(元)',dataIndex :'supplyPrice', width:'6%',elCls : 'center', renderer : function(val){
                        if(val == 0 || val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {sortable:false,title : '市场参考价(元)',dataIndex :'marketReferencePrice', width:'7%',elCls : 'center', renderer : function(val){
                        if(val == 0 || val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {sortable:false,title : '品牌',dataIndex :'brand', width:'6%',elCls : 'center'},
                    {sortable:false,title : '库存',dataIndex :'stock', width:'5%',elCls : 'center', renderer : function(val){
                        if(val == 0 || val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '供应商商品状态',sortable: false,dataIndex :'state', width:'9%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("goodsStatus", val)+'</span>';
                    }},
                    {sortable:false,title : '最近同步时间',dataIndex :'notifyTime', width:'8%',elCls : 'center'},
                    {sortable:false,title : '最近更新时间',dataIndex :'updateTime', width:'8%',elCls : 'center'}
                ];

                var form = new Form.HForm({
                    srcNode : '#J_Form2',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();


                var Grid = Grid,
                    Store = Data.Store;

                var editing = new Grid.Plugins.CellEditing({
                    triggerSelected: false //触发编辑的时候不选中行
                });

                var store = new Store({
                        url : $.scmServerUrl + "goods/externalGoodsPage",
                        autoLoad:true,
                        proxy : {
                            method : 'get',
                            dataType : 'json', //返回数据的类型
                            limitParam : 'pageSize', //一页多少条记录
                            pageIndexParam : 'pageNo', //页码
                            startParam : 'start', //起始记录
                            pageStart : 1 //页面从1开始
                        },
                        params : {querySource : '0'},
                        pageSize : 10,  // 配置分页数目
                        root:'result',
                        totalProperty:'totalCount'
                    }),
                    grid = new Grid.Grid({
                        render:'#grid2',
                        columns : columns,
                        width:'100%',
                        store: store,
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        // bbar:{
                            // pagingBar:表明包含分页栏
                            // pagingBar:true
                        // },
                        plugins: [editing]
                    });

                grid.render();
                var bar = new PagingBarExt({
                    render: "#bar2",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store
                }).render();
                grid.on('cellclick',function  (ev) {
                    var record = ev.record; //点击行的记录
                    var target = $(ev.domTarget); //点击的元素
                    if(target.hasClass('skuDtl')){
                        record['isQuery']=true;       

                        window.location.href = "externalGoodsDetail.html?hideLogs=true&skuCode="+record['skuCode']+"&id="+record['id']+'&isQuery=' + (record['isQuery'])+'&fromtab='+$("#externalId").hasClass("active");
                    }
                });

                $("#sel_btn2").on("click",function(){
                    /*if(form.isValid()){
                        var formData = form.serializeToObject();
                        store.load(formData);
                        bar.jumpToPage(1);
                    }*/
                    var supplierCodeval = $("#supplierCode  option:selected").val();
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        //store.load(formData);
                        if(supplierCodeval!=''){
                            var _self = bar,
                                //store = _self.get('store'),
                                pageSize = _self.get('pageSize'),
                                index =0,
                                start = index * pageSize;
                            var result = _self.fire('beforepagechange', {from: _self.get('curPage'), to: 1});
                            store.load($.extend({start: 0,limit: pageSize, pageIndex: index},$.extend(formData,{supplierCode:supplierCodeval})))
                        }else{
                            store.load(formData);
                            bar.jumpToPage(1);
                        }
                    }
                });
                $("#export_btn2").on('click',function(){
                    var option = $("#J_Form2").serialize();
                    console.log(option)
                    window.open($.scmServerUrl+ "goods/externalItemExport?" + option);
                });

            });


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
                    $.AddItem2("brandId", result.result,'id','name', "全部品牌", []);
                    $("#brandId").chosen();
                }
            };
            $.ajax(aContent);
        },
        /**
         * 查询性质为一件代发的供应商
         * @param url
         * @param data
         */
        querySupplier : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"goods/suppliersList";
            aContent.data = {supplierKindCode: "oneAgentSelling",status:"2"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem("supplierCode", result.result, "supplierInterfaceId", "supplierName", true);
                }
            };
            $.ajax(aContent);
        }



    }
    $(document).ready(function(e) {
        if($.getUrlParam("fromtab")){
            $($(".bui-tab-panel-item")[1]).addClass("active");        
        }else{
            $($(".bui-tab-panel-item")[0]).addClass("active")
        }
        //$($(".bui-tab-panel-item")[0]).addClass("active")
        $.goodsQueryApp.init();
        
        $("#tab1").click(function() {
            $("#grid .bui-grid-header").css("width", "100%")
            $("#grid .bui-grid").css("width", "100%")
            $("#grid .bui-grid-body").css("width", "100%")
            $("#grid .bui-grid-table").css("width", "100%")
            
        })
    });
}(jQuery));