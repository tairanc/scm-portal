/**
 * Created by sone on 2017/4/28.
 */
$(function(){
    $.externalGoodsApp = {
        _store : null,
        _supplierList : null,
        _flag: 0,
        init : function(){
            this.querySupplier(); 
             /*图片查看*/
            BUI.use(['bui/imgview','bui/uploader', 'bui/overlay'], function (ImgView,Uploader, Overlay) {
                $.externalGoodsApp.imgView = new ImgView.ImgView({
                    render: "#contentImage",
                    width: 800,
                    height: 521,
                    autoRender: true // 是否自动渲染,默认为false
                });
                $.externalGoodsApp._dialog = new Overlay.Dialog({
                    title: '图片查看',
                    width: 830,
                    height: 600,
                    mask: false,
                    elCls:'imgview-dialog',
                    contentId:'contentImage',
                    success: function () {
                      // alert('确认');
                      this.close();
                    },
                    buttons: []
                });

            });            
             BUI.use(['bui/form','bui/grid','bui/data','common/pagingbarext'],function(Form,Grid,Data,PagingBarExt){                

                var columns = [
                    {title : '商品ID',dataIndex :'id', visible : false},
                    {title : '供应商ID',dataIndex :'supplierId', visible : false},
                    {title : '供应商编号',dataIndex :'supplierCode', visible : false},
                    {title : '商品SKU编号',sortable: false,dataIndex :'skuCode', width:'10%',elCls : 'center', renderer : function(val){
                        return '<span class="grid-command skuDtl">'+val+'</span>';
                    }},
                    {title : '供应商名称',sortable: false,dataIndex :'supplierName', width:'6%',elCls : 'center'},
                    {title : '供应商商品SKU编号',sortable: false,dataIndex :'supplierSkuCode', width:'10%',elCls : 'center'},
                    {title : '商品名称',sortable: false,dataIndex :'itemName', width:'24%',elCls : 'center',renderer : function(val){
                        return val.replace(/ /g,"&nbsp;");
                    }},
                    {title : '条形码',sortable: false,dataIndex :'barCode', width:'8%',elCls : 'center', editor : {xtype :'text', validator: barCodeValid, rules:"{maxlength:64}"}},
                    {title : '供货价(元)',sortable: false,dataIndex :'supplyPrice', width:'6%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '市场参考价(元)',sortable: false,dataIndex :'marketReferencePrice', width:'7%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '仓库名称',sortable: false,dataIndex :'warehouse', width:'6%',elCls : 'center'},
                    {title : '库存',sortable: false,dataIndex :'stock', width:'5%',elCls : 'center', renderer : function(val){
                        if(val == null){
                            val = "";
                        }
                        return '<span>'+val+'</span>';
                    }},
                    {title : '供应商商品状态',sortable: false,dataIndex :'state', width:'8%',elCls : 'center', renderer : function(val){
                        return '<span>'+$.dictTranslate("goodsStatus", val)+'</span>';
                    }},
                    {title : '最近同步时间',sortable: false,dataIndex :'notifyTime', width:'8%',elCls : 'center'},
                    {title : '最近更新时间',sortable: false,dataIndex :'updateTime', width:'8%',elCls : 'center'}
                ];

                 /**
                  * 条形码校验
                  * @param value
                  * @param obj
                  * @return {string}
                  */
                 function barCodeValid (value,obj) {
                     var result = "";
                     var re =  /^[0-9a-zA-Z]*$/;//判断字符串是否为数字和字母组合
                     if (!re.test(value))
                     {
                         result = "条形码必须是数字或者字母";
                     }
                     return result;
                 }

                var form = new Form.HForm({
                    srcNode : '#J_Form',
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

                 editing.on('accept', function (ev) {
                     var record = ev.record;
                     var barCode = record['barCode'];
                     var barCode2 = record['barCode2'];
                     if(barCode == null){
                         barCode = "";
                     }
                     if(barCode2 == null){
                         barCode2 = "";
                     }
                     if(barCode == barCode2){
                         return false;
                     }
                     record['barCode2'] = record['barCode'];
                     var aContent = $.AjaxContent();
                     aContent.url = $.scmServerUrl+"goods/externalItemSku/"+record['id'];
                     aContent.data = {barCode : record['barCode']};
                     aContent.type = "PUT";
                     aContent.success = function(result,textStatus){
                         if(result.appcode != 1){
                             BUI.Message.Alert(result.databuffer,'warning');
                         }else{

                         }
                     };
                     $.ajax(aContent);
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
                     params : {querySource : '1'},
                     pageSize : 10,  // 配置分页数目
                     root:'result',
                     totalProperty:'totalCount'
                 }),
                 grid = new Grid.Grid({
                     render:'#grid',
                     columns : columns,
                     store: store,
                     emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                     // bbar:{
                     //     pagingBar:表明包含分页栏
                         // pagingBar:true
                     // },
                     plugins: [editing]
                 });

                 grid.render();
                  var bar = new PagingBarExt({
                     render: "#bar",
                     elCls: 'bui-pagingbar bui-bar',
                     store: store
                 }).render();

                 $.externalGoodsApp._store = store;

                 grid.on('cellclick',function  (ev) {
                     var record = ev.record; //点击行的记录
                     var target = $(ev.domTarget); //点击的元素
                     var url, data;
                     if(target.hasClass('valid1') || target.hasClass('valid2')){
                         url = $.scmServerUrl+"goods/externalItemsValid/"+record.id;
                         data = {isValid: record.isValid};
                         if(url){
                             BUI.Message.Confirm('确认执行此操作？',function(){
                                 $.externalGoodsApp.setIsValid(url, data);
                             },'question');
                         }
                     }else if(target.hasClass('skuDtl')){
                        record['isList']= true;
                        window.location.href = "externalGoodsDetail.html?skuCode="+record['skuCode']+"&id="+record['id']+'&isList=' + (record['isList']);
                     }
                 });

                $("#sel_btn").on("click",function(){
                    if(form.isValid()){
                        var formData = form.serializeToObject();
                        bar.jumpToPageFix(1,formData);
                    }
                });

             });
        },
        /**
         * 初始化一件代发商品弹出框
         */
        initExternalItemsDialog : function () {
            BUI.use(['bui/overlay','bui/form','bui/grid','bui/data','common/pagingbarext'],function(Overlay,Form, Grid, Data,PagingBarExt){

                var form2 = new Form.Form({
                    srcNode : '#J_Form2'
                }).render();

                var dialog = new Overlay.Dialog({
                    title:'选择一件代发商品',
                    width:'60%',
                    height:'70%',
                    //配置DOM容器的编号
                    contentId:'externalItemsDiv',
                    buttons:[
                        {
                            text:'确定',
                            elCls : 'button button-primary myBtn',
                            handler : function(){
                                addExternalItems();
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

                var columns2 = [
                    {title : '供应商名称',dataIndex :'supplyName', width:'15%',elCls : 'center'},
                    {title : '商品名称',dataIndex :'skuName', width:'40%',elCls : 'center',renderer:function (val, obj) {
                        return obj.highLightName?obj.highLightName:val.replace(/ /g,"&nbsp;");
                    }},
                    {title : '商品SKU编号',dataIndex :'supplySku', width:'15%',elCls : 'center'},
                    {title : '品牌',dataIndex :'brand', width:'15%',elCls : 'center'},
                    {title : '供货价(元)',dataIndex :'supplyPrice', width:'15%',elCls : 'center'},
                    {title : '市场价(元)',dataIndex :'marketPrice', width:'15%',elCls : 'center'},
                    {title : '最小购买量',dataIndex :'minBuyCount', width:'15%',elCls : 'center'},
                    {title : '商品图片', width:'15%',elCls : 'center',renderer:function(){
                        return '<a><span class="grid-command showImg">查看</span></a>';
                    }}
                ];

                var Grid = Grid,
                    Store = Data.Store;

                var store2 = new Store({
                        url : $.scmServerUrl + "goods/externalGoodsPage2",
                        //autoLoad:false,
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
                    }),
                    grid2 = new Grid.Grid({
                        render:'#grid2',
                        columns : columns2,
                        width : '100%',
                        loadMask : true,
                        store: store2,
                        emptyDataTpl : '<div class="centered"><h2>无数据</h2></div>',
                        // bbar:{
                            // pagingBar:表明包含分页栏
                            // pagingBar:true
                        // },
                        plugins: [Grid.Plugins.CheckSelection]
                    });

                store2.on("exception", function (e) {
                    $.storeErrorHander(e);
                });

                grid2.render();
                var bar = new PagingBarExt({
                    render: "#bar2",
                    elCls: 'bui-pagingbar bui-bar',
                    store: store2
                }).render();

                grid2.on('cellclick',function  (ev) {
                    var record = ev.record;
                    var supplierCode =record['supplierCode'];
                    var target = $(ev.domTarget);                
                    var imgList =record['detailImagePath'];                
                    imgList = imgList.split(",");
                    var imageContent=[];
                     if(target.hasClass('showImg')){
                        if(supplierCode=="JD"){
                            for(i=0;i<imgList.length;i++){
                                var imageObj={src: 'http://img13.360buyimg.com/n12/'+imgList[i],miniSrc: 'http://img13.360buyimg.com/n12/'+imgList[i]};
                                imageContent.push(imageObj)
                            };
                            imageContent.unshift({src: 'http://img13.360buyimg.com/n12/'+record['imagePath'],miniSrc: 'http://img13.360buyimg.com/n12/'+record['imagePath']});
                            $.externalGoodsApp.showBigPic(imageContent);
                        }else{
                            for(i=0;i<imgList.length;i++){
                                var imageObj={src: imgList[i],miniSrc: imgList[i]};
                                imageContent.push(imageObj)
                            };
                            console.log(record['imagePath']);
                            imageContent.unshift({src: record['imagePath'],miniSrc: record['imagePath']});
                            $.externalGoodsApp.showBigPic(imageContent);
                        }
                     }
                })
                $("#add_btn").on("click",function(){
                    $("#brand2").val("");
                    $("#sel_btn2").removeAttr("disabled");
                    $.AddItem("supplierCode2", $.externalGoodsApp._supplierList, "supplierInterfaceId", "supplierName", true);
                    $("#supplySku").val("");
                    $("#skuName").val("");                    
                    /*var formData = form2.serializeToObject();
                     formData['supplierCode'] = formData['supplierCode2'];
                     store2.load(formData);
                     $(".x-mask-loading")[0].style.left = '500px';
                     $(".x-mask-loading")[0].style.top = '30px';
                     */
                    if($.externalGoodsApp._flag == 1){
                        var formData = {};
                        formData['supplierCode'] = "908feab8f2760f001291d3ec756005bb066aae87e997e6070720240681ad6a92";
                        grid2.clearData();
                        store2.load(formData);
                    }else {
                        $.externalGoodsApp._flag = 1;
                    }


                    dialog.show();
                    $(".bui-dialog").css("height","815px;");
                    $(".bui-dialog")[0].style.top = '20px';
                    /*$("bui-grid-width").css("height","550px;")
                    $("bui-grid-width").css("overflow-y","scorll")
                    $("bui-grid-width").css("overflow-x","hidden")*/
                    //$(".bui-dialog .bui-grid-body").css("height","450px");
                });

                $("#sel_btn2").on("click",function(){
                    if(form2.isValid()){
                        var formData = form2.serializeToObject();
                        formData['supplierCode'] = formData['supplierCode2'];
                        store2.load(formData);
                        bar.jumpToPage(1);
                    }
                });

                /**
                 * 添加一件代发商品
                 */
                function addExternalItems() {
                    var records = grid2.getSelection();
                    if(records.length == 0){
                        BUI.Message.Alert("请选择至少一个代发商品再提交", "warning");
                        return false;
                    }
                    $(".myBtn").attr("disabled","disabled");
                    var records = JSON.stringify(records);
                    var aContent = $.AjaxContent();
                    aContent.url = $.scmServerUrl+"goods/externalItemSku";
                    aContent.data = {supplySkus : records};
                    aContent.type = "POST";
                    aContent.success = function(result,textStatus){
                        if(result.appcode != 1){
                            BUI.Message.Alert(result.databuffer,'warning');
                        }else{
                            dialog.close();
                            $.externalGoodsApp._store.load({});
                        }
                    };
                    aContent.complete = function () {
                        $(".myBtn").removeAttr("disabled");
                    };
                    $.ajax(aContent);
                }

            });

        },
        /**
         * 查询性质为一件代发的供应商
         * @param url
         * @param data
         */
        querySupplier : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"goods/suppliersList";
            aContent.data = {supplierKindCode: "oneAgentSelling"};
            //aContent.async = false;
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                    BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    var _result = result.result;
                    $.AddItem("supplierCode", _result, "supplierInterfaceId", "supplierName", true);
                    var supplierArray = [];
                    for(var i=0; i<_result.length; i++){
                        var _supplier = {};
                        if(_result[i]['isValid'] == "1"){
                            _supplier['supplierInterfaceId'] = _result[i]['supplierInterfaceId'];
                            _supplier['supplierName'] = _result[i]['supplierName'];
                            supplierArray.push(_supplier);
                        }
                    }
                    $.externalGoodsApp._supplierList = supplierArray;
                    $.externalGoodsApp.initExternalItemsDialog();
                }
            };
            $.ajax(aContent);
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
                    $.externalGoodsApp._store.load({});
                }
            };
            $.ajax(aContent);
        },
        /**
         * 添加字典
         */
        add:function(){
            window.location.href = "externalGoodsAdd.html";
        },
        /*显示图片*/
        showBigPic: function (imgUrlList) {       
            $.externalGoodsApp.imgView.set('imgList', imgUrlList);
            $.externalGoodsApp._dialog.show();
            return false;
        }
    }
    $(document).ready(function(e) {
        $.externalGoodsApp.init();
    });
}(jQuery));