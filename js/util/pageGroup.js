/**
 * 前端分页控件
 * @version 1.0
 * @author hzdjz
 */
;(function($, window, document,undefined) {
    //定义Beautifier的构造函数
    var ScmPager = function(element, opt) {
        _this=this;
        _this.$element = $(element),
        _this.defaults = {
            target:null,
            totalData: 0, //总条数
            showData: 10, //每页条数，默认为20
            pageCount: 1, //总页数
            //pageSize:20,//
            current: 1, //当前页码
            prevCls: 'prev', //上一页文本
            nextCls: 'next', //下一页文本
            prevContent: '<', //上一页内容
            nextContent: '>', //下一页内容
            homePage: '', //首页
            endPage: '' //尾页
        },
        _this.options = $.extend({}, _this.defaults, opt);        
        /**
         * 设置总页数
         * @param {int} page 页码
         * @return opts.pageCount 总页数配置
         */
        _this.setPageCount = function (page) {
            return _this.options.pageCount = page;
        };
        /**
         * 获取总页数
         * 如果配置了总条数和每页显示条数，将会自动计算总页数并略过总页数配置，反之
         * @return {int} 总页数
         */
        _this.getPageCount = function () {
            return _this.options.totalData && _this.options.showData ? Math.ceil(parseInt(_this.options.totalData) / _this.options.showData) : _this.options.pageCount;
        };
        /**
         * 获取当前页
         * @return {int} 当前页码
         */
        this.getCurrent = function () {
            return _this.options.current;
        };

        _this.init=function(index){

            var $objs=$(_this.options.target);
            _this.options.totalData=$objs.length;
            _this.options.pageCount=_this.getPageCount();
            var html="";
            var current=parseInt(index)||parseInt(_this.options.current);
            var prevStyle=(current==1?'class="bui-button-disabled" disabled="disabled"':'');
            var nextStyle=(current==_this.options.pageCount?'class="bui-button-disabled" disabled="disabled"':'');

            html='<ul class="bui-pagingbar bui-bar scm_bar" role="toolbar"  aria-disabled="false" aria-pressed="false">';
            //首页
            html+='<li class="bui-bar-item-button bui-bar-item bui-pb-first bui-inline-block bui-bar-item-button-disabled bui-bar-item-disabled" aria-disabled="true"><button type="button" '+prevStyle+' data-page="1">首 页</button></li>';
            //上一页
            html+='<li class="bui-bar-item-button bui-bar-item bui-pb-prev bui-inline-block bui-bar-item-button-disabled bui-bar-item-disabled" aria-disabled="true"><button type="button" '+prevStyle+' data-page="'+(current-1)+'">上一页</button></li>';
            //分隔位
            html+='<li class="bui-bar-item-separator bui-bar-item bui-inline-block" aria-disabled="false" role="separator"></li>';
            //页条数选择
            html+='<li class="bui-bar-item bui-bar-item-disabled bui-inline-block bar-item" aria-disabled="true"><div><select style="width: 80px;height:20px;margin: 0 4px;padding:0 4px; " class="scmBarSel"><option value="10">10条/页</option><option value="20">20条/页</option><option value="50">50条/页</option><option value="100">100条/页</option></select></div></li>';
            //总共多少页
            html+='<li class="bui-bar-item-text bui-bar-item bui-inline-block" aria-disabled="false" aria-pressed="false">共 '+_this.options.pageCount+' 页</li>';
            //当前第几页
            html+='<li class="bui-bar-item-text bui-bar-item bui-inline-block" aria-disabled="false" aria-pressed="false">第 <input type="text" autocomplete="off" class="bui-pb-page scmInputItem" size="3" value="'+current+'" name="inputItem" /> 页</li>';
            //跳转确定按钮
            html+='<li class="bui-bar-item-button bui-bar-item bui-pb-skip bui-inline-block" aria-disabled="false" aria-pressed="false"><button type="button" class="bui-page-goto">确定</button></li>';
            //分隔位
            html+='<li class="bui-bar-item-separator bui-bar-item bui-inline-block" aria-disabled="false" role="separator" aria-pressed="false"></li>';
            //下一页
            html+='<li class="bui-bar-item-button bui-bar-item bui-pb-next bui-inline-block" aria-disabled="false" aria-pressed="false"><button type="button" '+nextStyle+' data-page="'+(current+1)+'">下一页</button></li>';
            //末页
            html+='<li class="bui-bar-item-button bui-bar-item bui-pb-last bui-inline-block" aria-disabled="false" aria-pressed="false"><button type="button" '+nextStyle+' data-page="'+_this.options.pageCount+'">末 页</button></li>';
            //分隔位
            html+='<li class="bui-bar-item-separator bui-bar-item bui-inline-block" aria-disabled="false"  role="separator"></li>';
            //总记录数
            html+='<li class="bui-bar-item-text bui-bar-item bui-inline-block" aria-disabled="false" aria-pressed="false">共'+_this.options.totalData+'条记录</li>';

            html+='</ul>';
            var start_from=(current-1)*_this.options.showData;
            var start_end=(current-1)*_this.options.showData+_this.options.showData;
            $objs.hide().slice(start_from,start_end).show();

            _this.$element.empty().html(html);
            $(".scmBarSel",_this.$element).val(_this.options.showData);
            _this.options.current=current;
            
        };

        _this.eventBind=function (){
            var index=1;
            _this.$element.off().on('click', 'button[data-page]', function () {
                if($(this).data('page')){
                    index = parseInt($(this).data('page'));
                }                
                _this.init(index);
            }).on('change', 'select', function () {
                _this.options.showData=$(this).val()-0;
                _this.init(1);
            }).on('input propertychange','.scmInputItem',function(){
                var thisObj=$(this);
                var val = thisObj.val();
                var reg = /[^\d]/g;
                if (reg.test(val)) thisObj.val(val.replace(reg, ''));
                (parseInt(val) > _this.options.pageCount) && thisObj.val(_this.options.pageCount);
                if (parseInt(val) === 0) thisObj.val(1); //最小值为1
            }).on("click",'.bui-page-goto',function(){
                var index = parseInt($(".scmInputItem",_this.$element).val());
                _this.init(index);               
            }).on("keydown",function (ev) {
                if (ev.keyCode == 13) {
                    var index = parseInt($(".scmInputItem",_this.$element).val());
                    _this.init(index);   
                    ev.stopPropagation();
                }
            });
        };

        _this.init(1);
        _this.eventBind();
    }

    //在插件中使用Beautifier对象
    $.fn.scmPager = function(options) {
        //创建Beautifier的实体
        $(this).show();
        var scmPager = new ScmPager(this, options);
        //调用其方法
        return scmPager;
    }
})(jQuery, window, document);
