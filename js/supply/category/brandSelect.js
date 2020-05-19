/**
 * Created by hzszy on 2017/5/19.
 */
$(function () {

    $.brandSelect = {
        myGrid:null,
        init: function () {
            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#sel_Form',
                    defaultChildCfg : {
                        validEvent : 'blur' //移除时进行验证
                    }
                });
                form.render();


            });
            var pageIds = new Array();
            var pageDate = $.categoryBrand.store.getResult();


            if ((pageDate).length>0){
                for (var i=0;i<(pageDate).length;i++){
                    pageIds.push(pageDate[i].brandId);
                }
            }
            var columns = [
                {title : '品牌名称',dataIndex :'name',width:'15%',elCls : 'center'},
                {title : '品牌别名',dataIndex :'alise', width:'15%',elCls : 'center'},
            ];
            var props = {
                formRender:"sel_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender:"sel_btn",//查询触发按钮的id
                render : "brandList", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "category/brandPageCategory",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber,BUI.Grid.Plugins.CheckSelection], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort:true, //是否远程排序：true/false
                pagingBar: "bar", //是否分页：true/false
                storeParams:{"isValid":"1","pageIds":pageIds.toString()},
                primaryKey: "id", //数据主键Id
                handlerCollections:{},
                selectBtn: "#select_btn_brand",
                backBtn: "#btn_back",
            } ;
            $.brandSelect.myGrid = new GridSelect(props);
            $.brandSelect.myGrid.createGrid();

        },
    }
    $(document).ready(function (e) {
        $.brandSelect.init();
    });
})(jQuery);