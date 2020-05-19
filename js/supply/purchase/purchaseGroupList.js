/**
 * Created by sone on 2017/5/2.
 */
$(function(){
    $.purchaseGroupListApp = {
        init : function(){
            $.purchaseGroupListApp.queryValidList();
            var columns = [
                {title : '主键',dataIndex :'id', width:'1%', visible : false},
                {title : '采购组编号',dataIndex :'code', width:'10%',elCls : 'center',renderer :function(value,obj){
                    return '<a href='+'purchaseGroupInfo.html'+"?"+'code='+value+'>'+value+'</a>';
                }},
                {title : '采购组名称',dataIndex :'name', width:'10%',elCls : 'center'},
                {title : '组长',dataIndex :'leaderName', width:'10%',elCls : 'center'},
                {title : '状态',dataIndex :'isValid', width:'6%',elCls : 'center', renderer : function(val){
                    return '<span>'+$.dictTranslate("isValid", val)+'</span>';
                }},
                {title : '创建人',dataIndex :'createOperator', width:'10%',elCls : 'center'},
                {title : '更新时间',dataIndex :'updateTime', width:'13%',elCls : 'center'}
            ];

            BUI.use('bui/form',function(Form){
                var form = new Form.HForm({
                    srcNode : '#J_Form',
                    defaultChildCfg : {
                        validEvent : 'blur'
                    }
                });
                //form.render();
                
                $("#add_btn").on("click",function(){
                    $.purchaseGroupListApp.add();
                });
            });

            var props = {
                formRender:"J_Form",
                queryBtnRender:"sel_btn",
                resetBtnRender:'reset',
                render : "grid",
                dataUrl: $.scmServerUrl + "purchase/purchaseGroupPage",
                columns: columns,
                plugins: [BUI.Grid.Plugins.RowNumber],
                autoLoad: true,
                pageSize: 10,
                remoteSort:true,
                pagingBar: "bar",
                storeParams:{},
                //width:"100%",
                //height:"100%",
                primaryKey: "id",
                handlerColumnTitle: '操作',
                handlerCollections: [
                    {
                        name: "编辑",
                        operateType: "1",
                        submitUrl: "",
                        redictUrl: "purchaseGroupUpdate.html"
                    },
                    {
                        name: "启用",
                        ajaxMethod:"PUT",
                        msg:'启用后采购组可正常使用。',
                        relyField : {"fieldName":"isValid", "fieldValue":"0"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseGroup/updateState",
                        redictUrl: ""
                    },
                    {
                        name: "停用",
                        ajaxMethod:"PUT",
                        msg:'停用后该采购组将不能正常使用。',
                        relyField : {"fieldName":"isValid", "fieldValue":"1"},
                        confirm:"1",
                        operateType: "0",
                        submitUrl: $.scmServerUrl+"purchase/purchaseGroup/updateState",
                        redictUrl: ""
                    }
                ]
            } ;
            var myGrid = new GridExt(props);
            myGrid.createGrid();
        },
        /**
         * 添加字典类型
         */
        add:function(){
            window.location.href = "purchaseGroupAdd.html";
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
        }
    }
    $(document).ready(function(e) {
        $.purchaseGroupListApp.init();
    });
}(jQuery));