/**
 * Created by Administrator on 2016/3/25.
 */
$(function () {

    $.dictTypeApp = {
        init: function () {
            $.dictTypeApp.queryValidList();
            var columns = [
                {title: '主键', dataIndex: 'id', width: '1%', visible: false},
                {title: '类型编码', dataIndex: 'code', width: '15%', elCls: 'center'},
                {title: '类型名称', dataIndex: 'name', width: '15%', elCls: 'center'},
                {title: '说明', dataIndex: 'description', width: '20%', elCls: 'center'},
                /*{title : '创建人',dataIndex :'createOperator', width:'10%',elCls : 'center'},*/
                {title: '更新时间', dataIndex: 'updateTime', width: '15%', elCls: 'center'}/*,
                {title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center'}*/
            ];

            BUI.use(['bui/form'], function (Form) {
                var form = new Form.HForm({
                    srcNode: '#J_Form',
                    defaultChildCfg: {
                        validEvent: 'blur' //移除时进行验证
                    }
                });
                /*form.render();*/

                $("#add_btn").on("click", function () {
                    $.dictTypeApp.add();
                });
            });

            var props = {
                formRender: "J_Form",//查询条件的所在的form渲染的div的id
                queryBtnRender: "sel_btn",//查询触发按钮的id
                render: "grid", //渲染grid的div的id
                dataUrl: $.scmServerUrl + "config/dictTypePage",
                columns: columns, //列定义数字
                plugins: [BUI.Grid.Plugins.RowNumber], //表格插件
                autoLoad: true, //自动加载数据：true/false
                pageSize: 10,	// 配置分页数目
                remoteSort: true, //是否远程排序：true/false
                pagingBar: "bar",
                storeParams: {},
                //width: "100%",//表格宽度
                //height: "100%",//表格高度
                primaryKey: "id", //数据主键Id
                handlerColumnTitle: '操作',
                handlerCollections: [
                    {
                        name: "修改", //操作名称
                        operateType: "1", //操作类型: 0-ajax提交后台, 1-页面跳转
                        submitUrl: "", //提交后台地址, 当 operateType=0时不能为空
                        redictUrl: "dictTypeUpdate.html" //页面跳转地址, 当 operateType=1时不能为空
                    }
                ] //操作集合
            };
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         * 添加字典类型
         */
        add: function () {
            window.location.href = "dictTypeAdd.html";
        },
        /***
         * 查询启用/停用列表
         */
        queryValidList: function () {
            var aContent = $.AjaxContent();
            aContent.url = $.scmServerUrl + "select/validList";
            aContent.data = {};
            aContent.success = function (result, textStatus) {
                if (result.appcode != 1) {
                    BUI.Message.Alert(result.databuffer,'warning');
                } else {
                    $.AddItem('isValid', result.result, 'code', 'name', true);
                }
            };
            $.ajax(aContent);
        }
    }
    $(document).ready(function (e) {
        $.dictTypeApp.init();
    });
}(jQuery));