// JScript 文件 zn 2014-10-28修改
$(function() { ResultTable.init(); });
var ResultTable = {
	hfSortExpression:"",
	hfSortDirection:"",
	hfPageCount:0,
	hfPageSize:10,
	hfPageIndex:1,
	
	//============
	//   查询
	//============	
	searchurl:"",
	searchdata:{},
	searchcallback:null,
	searchcomplete:null,
	
	//================新加入属性===================================================
	insertClear:true,
	insertCallback:null,
	backup:null,
	attribute:{data:null},
	trclickcallback:null,///-----------------tr单击事件
	trmousedowncallback:null,////右键单击事件
	chkclickcallback:null,////----------------------checkbox单击事件
	otherid:"",///
	resultData:null,
	
	///////////--------------parm 用于放置绑定各种事件---------------------------------------------------------------------
	search:function(url,param,callback,complete,parm){
		
		data={data:JSON.stringify(param)};
		
		this.hfPageIndex=1;
		this.searchurl=url;
		
		this.searchdata=data;
		this.searchcallback=callback;
		this.searchcomplete=complete;
		if(parm && parm.trclickcallback){ this.trclickcallback=parm.trclickcallback;}else{this.trclickcallback=function(n){}};
		if(parm && parm.chkclickcallback){ this.chkclickcallback=parm.chkclickcallback;}else{this.chkclickcallback=function(n){}};		
		if(parm && parm.trmousedowncallback){ this.trmousedowncallback=parm.trmousedowncallback;}else{this.trmousedowncallback=function(n){}};
		
		this.research();
	},
	research:function(){
		this.searchdata = $.extend({},this.searchdata,{
					            sortExp:this.hfSortExpression,
					            sortDir:this.hfSortDirection,
					            pageSize:this.hfPageSize,
					            currentPage:this.hfPageIndex
							});
		var bRet = false;
	    $("#searching").show();
	    $("#btnSearch").val("查询中...").attr("disabled", "disabled");
	    CallWebMethod(this.searchurl,this.searchdata,
				function(json, textStatus){	    	 	    	 
	                if (json && json.error) {
	                	ResultTable.msg(json.error);
	                    return;
	                }	          
	                if (!json || !json.resultList || json.resultList.length == 0) {
	                	if(this.hfPageIndex>1){
	                		this.gotoPage(1);
	                		return;
	                	}
	                	ResultTable.msg("查询结果为空！");
	                    return;
	                }	                
	                /////==============================把查询出的内容放到arrtribute。data中
	    	        ResultTable.attribute.data=json.resultList;
	    	        ////========================================================
	                if (json && json.resultList.totalPage) ResultTable.setCount(json.resultList.totalPage);
	                if (json && json.resultList.currentPage) ResultTable.setIndex(json.resultList.currentPage);	                	                	                
	                if(typeof ResultTable.searchcallback == 'function')ResultTable.searchcallback();
	                bRet = true;
	                if (json.backup){  ResultTable.backup=json.backup;}	         
	                if(json.resultList.result==undefined){
	                	ResultTable.fill(json.resultList);
	                }else{
	                	ResultTable.fill(json.resultList.result);
	                }	                
	                ResultTable.showPager();
	        	},
	        	function(){
	        		$("#btnSearch").val("查询").removeAttr("disabled");
	                $("#searching").hide();
	                if (!bRet) {
	                	ResultTable.clearPager();
	                }
	                if(typeof ResultTable.searchcomplete == 'function')ResultTable.searchcomplete();
	        	}
	    );
	},
	
	//============
	//  查询结果
	//============
	hasResult: false,
    column:[],
    keyid:"",
    init: function(parm) {
        $("#result").hide();
        this.keyid =  $("#result").attr("keyid");
        this.otherid=$("#result").attr("otherid");
        this.column=[];
        $("#result tr th").each(function(){
        	if($(this).attr("display")=='none')
    		{
    		$(this).hide();
    		}
        	switch($(this).attr("type")){
        	case "xh":ResultTable.column.push({type:"xh"});break;
        	case "btn":
        		var btn=[];
        		$.each($(this).attr("btn").split('&'),function(i,b){
        			var tmp = b.split('|');
        			btn.push({id:tmp[0],text:tmp[1]});
        		});
        		ResultTable.column.push({type:"btn",btn:btn});
        		break;
        	case "callback":ResultTable.column.push({type:"callback",fun:$(this).attr("fun")});break;
        	case "checkbox":
        		ResultTable.column.push({type:"checkbox"});
        		$(this).html("<input type='checkbox' id='selall' />");
        		break;
        	case "child":
        		ResultTable.column.child=true;
        		ResultTable.column.childlist=$(this).attr("childlist");
        		ResultTable.column.push({type:"child",fun:$(this).attr("fun")});
        		break;
        	default:       	
        		if($(this).attr("column"))
        			if ($(this).attr("fun")){
	        			ResultTable.column.push({type:"col",col:$(this).attr("column"),width:$(this).attr("width"),display:$(this).attr("display"),fun:$(this).attr("fun")});
        			}else{
        				ResultTable.column.push({type:"col",col:$(this).attr("column"),width:$(this).attr("width"),display:$(this).attr("display")});
        			}
        		else
        			ResultTable.column.push({type:"none"});
        		break;
        	}
		});
        this.hasResult = false;
    },
 ////--------------------------------------------------------------------填充表格---------------------------------------------
    fill: function(arr) {
    	this.resultData=arr;
    	//var _length=arr.length();
    	if(arr.length>0){
    	  if(arr[0].sendTime!=undefined){
    		  talkerLastTime=arr[0].sendTime;
    	  }
    	}
    	
    	$("#result tr:gt(0)").remove();
        if (arr.length <= 0) return;
        $("#selall").removeAttr('checked');
        $("#result tr:gt(0)").remove();
        $.each(arr, function(i, n) {
    		var rowspan=ResultTable.column.child?" rowspan='"+n[ResultTable.column.childlist].length+"'":"";
    		var background = (i%2==1?" style='background:#eff7f9'":"");
    		var rows = ResultTable.column.child&&n[ResultTable.column.childlist]&&n[ResultTable.column.childlist].length>0?n[ResultTable.column.childlist].length:1;
    		var index=i+1;n.index=index;
    		var id='tr'+index;
    		var hideid='trdiv'+index;
    		var chkid='chk'+index;
    		for(var r=0;r<rows;r++){    			
            	$("#result").append("<tr id='"+id+"'"+(ResultTable.keyid?" key='"+n[ResultTable.keyid]+"'":"")+background+"></tr>");           	            	
            	$.each(ResultTable.column,function(j, l){
            		var str_style="class='newLine' "; var tdid="tr"+index+"td"+j;
            		str_style+="style=\"";
            		if(l.width!=undefined){
            			str_style+="max-width:"+l.width+"px;";
            		}
            		if(l.display!=undefined){
            			str_style+="display:"+l.display;
            		}    
            		str_style+="\"";
        			switch(l.type){
            		case "xh":
            			if(r>0) return true;  
            			$("#result tr:last-child").append("<td id='"+tdid+"'"+rowspan+">" + (i+1) + "</td>");
            			break;
            		case "btn":
            			if(r>0) return true;
            			var tmp ="<td id='"+tdid+"'"+rowspan+" >";
            			$.each(l.btn,function(t,c){
            				tmp+=" <a mode='"+c.id+"' nid='" + n[ResultTable.keyid] + "'>"+c.text+"</a>";
            			});
            			tmp+="</td>";
            			$("#result tr:last-child").append(tmp);
            			break;
            		case "callback":
            			if(r>0) return true;
            			$("#result tr:last-child").append("<td  id='"+tdid+"'"+rowspan+">" + eval(l.fun+"(n,i)")+ "</td>");
            			break;
            		case "checkbox":
            			if(r>0) return true;
            			$("#result tr:last-child").append("<td  id='"+chkid+"'"+rowspan
            			+" ><input onclick='checkSelect()' type='checkbox' nid='" 
            			+ n[ResultTable.keyid] + "'" + "  oid='"+n[ResultTable.otherid]+"'"+
            					" /></td>");
            			break;
            		case "col":
            			if(r>0) return true;
            			$("#result tr:last-child").append("<td  id='"+tdid+"'"+rowspan+" "+str_style+" >" + (n[l.col]||"") + "</td>");            			
            			break;
            		case "child":
            			$("#result tr:last-child").append("<td  id='"+tdid+"'>"+eval(l.fun+"(n,i,r)")+"</td>");
            			break;
            		default:
            			if(r>0) return true;
            		   
            			$("#result tr:last-child").append("<td  id='"+tdid+"'"+rowspan+"  "+str_style+"></td>");
            			break;
            		}
        			if(j==0){
        				var width=$("#result").width()-100;
        				$("#tr"+index+"td0").append("<div  type='trtd' id='"+hideid+"'"+ 
        			"style='position:absolute;width:"+width+"px;height:auto;background-color:#ffffff; z-index:99999;border:2px solid #d6d6d6;overflow-y:auto;display:none;'>");     				
        			}       			
    			});              	
    		}
    		$("#"+id).bind("click",function(e){
         	   ResultTable.trclickcallback(e,this,n);
         	});
    		
    		$("#"+chkid).bind("click",function(e){
          	   ResultTable.chkclickcallback(e,this,n);
          	});
    		
    		$("#"+id).mousedown(function(e){
    			 ResultTable.trmousedowncallback(e,this,n);
           	});	    		
        });
        $("#result").find("tr").show().end()
                    .show();
        this.hasResult = true;
    },
    clear: function() {
        $("#result tr:gt(0)").remove();
        $("#result").hide();
        this.clearPager();
        this.hasResult = false;
    },
/*   -----------------------zn ------------------------------添加数据操作-*/
  

    
    msg: function(s) {
    	this.clearPager();
        $("#result").find("tr:gt(0)").remove().end()
                    .find("tr").hide().end()
                    .append("<tr><td colspan='100'>" + s + "</td></tr>").show();
        this.hasResult = false;
    },
    
	//============
	//  分页
	//============
	  gotoPage: function(index) {
	      this.hfPageIndex=parseInt(index);
	      this.research();
	  },
	  setCount: function(count) {
	      this.hfPageCount=parseInt(count);
	  },
	  setIndex: function(index) {
	      this.hfPageIndex=parseInt(index);
	  },
	  showPager: function() {
	      var count = this.hfPageCount;
	      var index = this.hfPageIndex;
	      $("#pager").empty().hide();
	      if (count <= 1) return;
	      $("#pager").append("<span id='lIndex'>第" + index + "页</span>")
	                 .append("<span id='lCount'>/共" + count + "页</span>")
	                 .append("<div></div>");
	      if (index > 1) {
	          $("#pager div").append("<a page='1' class='disabled'>首页</a>")
	                     .append("<a page='" + (index - 1) + "' class='disabled'>上一页</a>");
	      }
	      for (var i = Math.floor((index - 1) / 5) * 5 + 1; i <= count && i <= Math.floor((index - 1) / 5 + 1) * 5; i++) {
	          if (i == index)
	              $("#pager div").append("<a class='selected'>" + i + "</a>");
	          else
	              $("#pager div").append("<a page='" + i + "' class='bg'>" + i + "</a>");
	      }
	      if (index < count) {
	          $("#pager div").append("<a page='" + (index + 1) + "' class='disabled'>下一页</a>")
	                     .append("<a page='" + count + "' class='disabled'>末页</a>");
	      }
	      $("#pager").show();
	  },
	  clearPager: function() {
	      $("#pager").empty().hide();
	  },
	  
	//============
	//	添加
	//============
	insertTitle:"",
	insert:function(url,param,success,complete) {
		$("#searching").show();  
		data={data:JSON.stringify(param)};
		CallWebMethod(url,data,
			function(json, textStatus){
	            if (json) {
	                if (json.appCode!='0')
	                    jAlert(json.dataBuffer);
	                //jAlert("输入有误，请检查输入！");data:{data:JSON.stringify(editData)},
	                else {
	                    jAlert('添加成功', function() {
	                    	if(typeof success == 'function')success();
	                        if (ResultTable.hasResult) ResultTable.research();
	                        $("#btnSearch").click();
	                    });
	                }
	            }
	    	},
	    	function(){
	    		if(typeof complete == 'function')complete();
	    		$("#searching").hide();
	    	}
		);
	},
	//============
	//	修改
	//============
	editTitle:"",
	edit:function(url,param,success,complete) {					
		$("#searching").show();
		data={data:JSON.stringify(param)};
		CallWebMethod(url,data,
				function(json, textStatus){
	                if (json) {
	                    if (json.appCode!='0')
	                    	jAlert(json.dataBuffer);
	                    //jAlert("输入有误，请检查输入！");
	                    else {
	                        jAlert('修改成功', function() {
	                        	if(typeof success == 'function')success();
	                            if (ResultTable.hasResult) ResultTable.research();
	                            $("#btnSearch").click();
	                        });
	                    }
	                }
	        	},
	        	function(){
	        		if(typeof complete == 'function')complete();
	        		$("#searching").hide();
	        	}
			);
	},
	//============
	//	删除
	//============
	del:function(url,param,success,complete) {
		$("#searching").show();
		data={data:JSON.stringify(param)};
		CallWebMethod(url,data,
			function(json, textStatus){
				if (json) {
	                if (json.error)
	                    jAlert(json.error);
	                else {
	                    jAlert('删除成功', function() {
	                    	if(typeof success == 'function')success();
	                        if (ResultTable.hasResult) ResultTable.research();
	                        $("#btnSearch").click();
	                    });
	                }
	            }
	    	},
	    	function(){
	    		if(typeof complete == 'function')complete();
	    		$("#searching").hide();
	    	}
		);
	},


	//============
	//  选择角色
	//============	
	getSelectedRole:function(){
		var sels=[];
		$("input[type='checkbox'][nid]").each(function(){
			if($(this).attr("checked"))
				sels.push($(this).attr("nid"));
		});
		return sels;
	},
	
	//============
	//  选择 otherKEY
	//============
	getSelectedOther:function(){
		var sels=[];
		$("input[type='checkbox'][oid]").each(function(){
			if($(this).attr("checked"))	
				sels.push($(this).attr("oid"));
		});
		return sels;
	},
	
	
	//============
	//  选择
	//============
	getSelected:function(){
		var sels=[];
		$("input[type='checkbox'][nid]").each(function(){
			if($(this).attr("checked"))
				//alert($(this).attr("nid"));
				sels.push($(this).attr("nid"));
		});
		return sels;
	},
	
	
	//============
	//  绑定
	//============
	bindDetail:function bindDetail(url,param,success,complete){
		$("#searching").show();
		data={data:JSON.stringify(param)};
		CallWebMethod(url,data,
				function(json, textStatus){
					if (json) {					
						if (json.appCode!="0")
							jAlert(json.dataBuffer);
		                else {
		                	success(json,textStatus);
		                }
		            }
		    	},
		    	function(){
		    		if(typeof complete == 'function')complete();
		    		$("#searching").hide();
		    	}
			);
	},	
	///------------------------还原原有样式
	SetToTrOriginalcss:function(id)
	{	

		if(id%2 ==0)
		{
		  $("#tr"+id).css("background","#eff7f9");
		}else{
		  $("#tr"+id).css("background","");
		}				
	},
	SetAllToTrOriginalcss:function(id)
	{	
		var rows= ResultTable.attribute.data;
		for(var r=0;r<rows.length;r++){
			if(rows[r].trid%2 ==0)
			{
			  $("#tr"+rows[r].trid).css("background","#eff7f9");
			}else{
			  $("#tr"+rows[r].trid).css("background","");
			}		
		}
	},
	////----------------------设置样式
	SetTrcss:function(id,css)
	{		
		  $("#tr"+id).css("background",css);
	},
	////--------------根据id获取tr的属性
	getTrArrtributeByid:function(id){
		var rows= ResultTable.attribute.data;
		for(var r=0;r<rows.length;r++){
		   if(id==	rows[r][ResultTable.keyid]){	
			   inRow.trid=r+1;
			   return rows[r];			  
		   }
		}		
	},
    ////获取当前页选择的 data
	getThisPageCheckedTr:function(){
		var data=[];var i=0;
		$("input[type='checkbox'][nid]").each(function(){			
			if($(this).attr("checked"))	{
				data.push(ResultTable.attribute.data[i])
			}						
			i++;
		});	
		return data;
	},
	TrSearch:function(cloumn,value,callback){
		var rows= ResultTable.attribute.data;
		var arr=new Array();
		for(var r=0;r<rows.length;r++){
			 if(rows[r][cloumn]==value){
				 var inRow=rows[r];	
				 inRow.trid=r+1;
                 arr.push(inRow);				
				 if(callback){
					 callback(arr);
				 }				 
			 }
		}		
	},
	TrAutoSearch:function(cloumn,value,callback){
		var rows= ResultTable.attribute.data;
		var arr=new Array();
		if (value&&value!=""){
		for(var r=0;r<rows.length;r++){
			 var dd=rows[r][cloumn].indexOf(value);  
			 var inRow=rows[r];	
			 inRow.trid=r+1;
			 if(dd!=-1){ 
				 arr.push(inRow);
			 }
			 if(callback){
				 callback(arr);
			 }
			   
		   }
		}
	},
	RebulidTable:function(){		
		ResultTable.fill(ResultTable.attribute.data)	;	
	}
	
};
//============
//  选择init
//============
$(function() {
	$("#selall").click(function(){
		$("input[type='checkbox'][nid]").attr("checked",!!$(this).attr("checked"));
	});
});

function checkSelect(){
	//alert(11);
	var sels=[];
	$("input[type='checkbox'][nid]").each(function(){
		if($(this).attr("checked"))
			//alert($(this).attr("nid"));
			sels.push($(this).attr("nid"));
	});
	if(sels.length>0){$("#selall").attr("checked",true);}
	else {$("#selall").removeAttr('checked');}
}

//============
//    分页init
//============
$(function() { $("a[page]").live("click", function() { ResultTable.gotoPage($(this).attr("page")); }); });
//============
//   排序
//============
$(function() {
    $("th[sort]").live("click", function() {
        $("th[sort]").each(function() { $(this).html($(this).html().replace(/[↑↓]/g, '')); });
        if ($(this).attr("sort") == ResultTable.hfSortExpression) {
        	ResultTable.hfSortDirection = (ResultTable.hfSortDirection == "desc" ? "" : "desc");
        }
        ResultTable.hfSortExpression=$(this).attr("sort");
        $(this).html($(this).html() + (ResultTable.hfSortDirection == "desc" ? "↑" : "↓"));
        ResultTable.research();
    }).live("mouseover",function(){
    	$(this).css("cursor","hand");
    });
});

//============
//  添删改
//============
$(function(){
	$("#btnAdd").click(function() {
		if( typeof initFile == 'function' ){
			initFile();
		}	
		if (ResultTable.insertClear==true)
		{
	     /* $('#DetailsDiv').find('input[type=text]').val('').end()
					      .find('input[type=password]').val('');	    */ 	  
			$('#DetailsDiv').find('input[type=text]').val('').end()
		      .find('input[type=password]').val('').end()
		      .find('textarea').val('');
		}
		if(ResultTable.insertCallback!=null)
	    {
	    	  ResultTable.insertCallback();
	    }
		

	    if(ResultTable.insertTitle)$('#DetailsDiv').dialog('option', 'title', ResultTable.insertTitle);
	    $('#DetailsDiv').find('#aInsert').show().end()
	                    .find('#aEdit').hide().end()
	                    .dialog('open');
	});

	$("#btnDel").click(function() {
		var ids=ResultTable.getSelected();
		var ods=ResultTable.getSelectedOther();
		if(ids.length==0){
			jAlert("请先选择要删除的数据！");
			return;
		}
		jConfirm("确定删除?",function(){ del(ids,ods); });
	});

	$("#btnEdit").click(function() {
		if( typeof initFile == 'function' ){
			initFile();
		}	
	    $('#DetailsDiv').find('input[type=text]').val('').end()
						.find('input[type=password]').val('');
	    if(ResultTable.editTitle)$('#DetailsDiv').dialog('option', 'title', ResultTable.editTitle);
	    var id=ResultTable.getSelected();
	    var ods=ResultTable.getSelectedOther();
	    //alert(id);
		if(id.length!=1){
			jAlert("请先选择一条修改的数据！");
			return;
		}
		bindDetail(id[0],ods[0]);
	    $('#DetailsDiv').find('#aInsert').hide().end()
	                    .find('#aEdit').show().end()
	                    .dialog('open');
	});
	
	$("#btnRight").click(function() {
	    $('#DetailsDiv').find('input[type=text]').val('').end()
						.find('input[type=password]').val('');
	    if(ResultTable.editTitle)$('#DetailsDiv').dialog('option', 'title', ResultTable.editTitle);
	    var role_id=ResultTable.getSelectedRole();
		if(role_id.length!=1){
			jAlert("请先选择一条数据来修改角色的权限！");
			return;
		}
		bindDetail(role_id[0]);
		//this.href="RoleRight.jsp?rr_id="+role_id;
		hs.deletesleep(this);
		return hs.htmlExpand(this,{objectType: 'iframe', headingText : "权限分配", src:"RoleRight.jsp?rr_id="+role_id, width:320 ,height:408} );
	});	
});

//div 模拟下拉框
function Selecter(listId){
    this.list =document.getElementById(listId) ;
    this.selectedElement=null;
    this.state = false;
    this.list.style.display="none";
    
    this.changeListState = function(event){
        var e = event ? event : window.event;
        this.selectedElement = e.srcElement || e.target ;
        this.list.style.left = (this.selectedElement.offsetLeft-117) + "px" ;
        this.list.style.top = (this.selectedElement.offsetTop+22) + "px";
        this.list.style.display=this.list.style.display=="block"?"none":"block";
      //  this.list.requestFocus(function(){ this.status=true;});
    };
    this.changeSelected = function(option,event){
    	document.getElementById(this.selectedElement.id+"_html").innerHTML=option.innerHTML;
        var value = option.getAttribute("value") ;
        document.getElementById(this.selectedElement.id+"_value").value=value;
        this.changeListState(event);
    };
    this.hiddenList = function(){
    	/*if(this.list.style.display=="block"){
    		 this.list.style.display="none";
    	}*/
    	//alert(this.state)
        if(!this.state)
            this.list.style.display="none";
    };
  this.hiddenDiv= function(){
	  this.list.style.display="none";
  }; 
/*  this.value= function(data){
	  this.selectedElement.innerHTML= data;

  };*/
};


