/**
 * Created by hzszy on 2017/5/19.
 */
$(function () {
    $.supplierSelect = {        
        init: function () {
            $.supplierSelect.querySupplierKindCodeList()
            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#sel_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();
            });

            var columns = [
                {title : '主键',dataIndex :'id',visible:false},
                {title : '供应商名称',dataIndex :'supplierName',width:'15%',elCls : 'center'},
                {title : '供应商编号',dataIndex :'supplierCode', width:'15%',elCls : 'center'},
                {title : '供应商性质',dataIndex :'supplierKindCode',width:'15%',elCls : 'center',renderer :function(value){
                return '<span>'+$.dictTranslate("supplierNature", value)+'</span>'
            }},
                {title : '代理品牌',dataIndex :'brandName',width:'15%',elCls : 'center'},
            ];

            var props = {
                formRender:"sel_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                render : "supplierList", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "supplier/applySupplierPage",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber,BUI.Grid.Plugins.RadioSelection], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                pagingBarArr: [10,20,50],
                storeParams:{"isValid":"1"},
                primaryKey: "id", //数据主键Id
                handlerCollections:{}
            };
            var myGrid = new GridSelect(props);
            myGrid.createGrid();
        },
        /***
         * 查询供应商性质列表
         */
        querySupplierKindCodeList : function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl+"config/dicts" ;
            aContent.data = {typeCode:"supplierNature"};
            aContent.success = function(result,textStatus){
                if(result.appcode != 1){
                     BUI.Message.Alert(result.databuffer,'warning');
                }else{
                    $.AddItem('supplierKindCode3', result.result,'value','name',true);
                }
            };
            $.ajax(aContent);
        },

    }
    $(document).ready(function (e) {
        $.supplierSelect.init();
    });
}(jQuery));