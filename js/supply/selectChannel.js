
$(function(){   

	$.selectChannelApp = {
		init : function(){
			var channelContent = $.AjaxContent();
	        channelContent.type = "GET";
	        channelContent.url = $.scmServerUrl + "api/jurisdictionUserChannel";
	        channelContent.data = {};
	        channelContent.success =function(result){                           
	            var channelList = result.result;
	            if(channelList[0].userType=='overallUser'){
	            	$("#loginSuc").show();
					window.location.href = '/supply/index.html';
					$.selectChannelApp.setChannelCookie(null);
	            }else{
	                if(channelList.length==1){
	                	$("#loginSuc").show();
	                    var confirmContent = $.AjaxContent();
	                    confirmContent.type = "GET";
	                    confirmContent.url = $.scmServerUrl + "api/confirmUser";
	                    confirmContent.data = {channelCode: channelList[0].channelCode};
	                    confirmContent.success =function(){
	                        if (result.appcode != 1) {
	                            BUI.Message.Alert(result.databuffer, 'warning');
	                        } else {
								$.selectChannelApp.setChannelCookie(channelList[0].channelCode);
	                            window.location.href = '/supply/index.html';
	                        }
	                    }; 

	                    $.ajax(confirmContent);
	                } else {
	                	$("#selectCha").show();
		            	$.selectChannelApp.getChannelList();
		            }  
	            }                            
	        }; 
	        $.ajax(channelContent); 
		},
		getChannelList:function(){
			/*查询用户当前拥有业务线*/
		   var queryContent = $.AjaxContent();
			queryContent.type = "GET";
			queryContent.url = $.scmServerUrl + "api/jurisdictionUserChannel";
			queryContent.data = {};
			queryContent.success =function(result){
			    var channelList = result.result;
			    /*var channelList=[
				    {
	            		"channelName": "泰然易购",
	            		"channelCode": "YWX001"
	        		}
	    		];*/
			    var str="";
			    for(let i=0;i<channelList.length;i++){
			    	var codeValue= channelList[i].channelCode;
			    	str+="<div style='width:250px;margin-top:20px;margin-right:30px;height:150px;display:inline-block;border:1px solid #fff;background-color:#fff;border-radius:5px;color:#000;font-weight:normal;display: flex;align-items: center;justify-content: center;' onclick='$.selectChannelApp.confirmChannel(&quot;"+codeValue+"&quot;)'>"+'<div>'+channelList[i].channelName+'</div>'+"</div>"
			    }
			    $("#channelList").append(str);
			}; 
			$.ajax(queryContent);
		},
		confirmChannel:function(channelCode){			
			var confirmContent = $.AjaxContent();
                confirmContent.type = "GET";
                confirmContent.url = $.scmServerUrl + "api/confirmUser";
                confirmContent.data = {channelCode: channelCode};
                confirmContent.success =function(){
					$.selectChannelApp.setChannelCookie(channelCode);
                    window.location.href = '/supply/index.html?channelCode=' +channelCode;
                }; 
                $.ajax(confirmContent);
			},setChannelCookie:function(cookieValue){
				$.cookie('channelCookie', cookieValue);
			}
		}
	$(document).ready(function (e) {
	    $.selectChannelApp.init();
	});
}(jQuery));