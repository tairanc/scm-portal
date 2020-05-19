var Search = {
    ajaxQuery: function (url, _callback) {
        _url = "/transformHttp/initApply/" + url;
        $.ajax({
            type: "get",
            url: _url,
            data: '',
            timeout: 15000,
            dataType: "text",
            async: false,
            success: function (json) {
                //json=JSON.parse(json);
                _callback.fun(json);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                return initError(textStatus, errorThrown);
            },
            complete: function () {
                loadingHide();
            },
            beforeSend: function () {
                return loadingShow(true);
            }
        });
    }
}



