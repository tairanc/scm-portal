$(function () {
    $.loginCenter ={ init:function(){
            $('#myFrame',parent.document.body).attr("src",$.loginUrl);
        }
    };
    $(document).ready(function(e) {
        $.loginCenter.init();
    });
}(jQuery));