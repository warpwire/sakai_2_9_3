/**********************************************************************
//
// Warpwire Sakai Plugin 1.8.3
//
// Copyright 2016 Warpwire, Inc Licensed under the
//  Educational Community License, Version 2.0 (the "License"); you may
//  not use this file except in compliance with the License. You may
//  obtain a copy of the License at
//
// http://www.osedu.org/licenses/ECL-2.0
//
//  Unless required by applicable law or agreed to in writing,
//  software distributed under the License is distributed on an "AS IS"
//  BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
//  or implied. See the License for the specific language governing
//  permissions and limitations under the License.
//	
**********************************************************************/

$(function(){
	
	// append url arguments to a given url
	var addUrlArgument = function(url, key, value) {
		var urlElement = document.createElement('a');
		var getParams = "";
		
		urlElement.href = url;
		getParams = urlElement.search.replace(/^\?/, '');
		
		if(getParams.length > 0)
			getParams = getParams+'&';
		return(url+'?'+getParams+key+'='+value);
	};
	
	// locates all iframes on a page, adds allowfullscreen, and runs the display code
  var getIframes = function(doc) {
  	// find all iframes in the current context
    $(doc).find("iframe").each(function(key, iframe){
    	// the iframe has loaded
      $(iframe).load( function(){
      	try{
	        var windowDoc = this.contentWindow.document || this.contentDocument;
	        // recursively get iframes
	        getIframes(windowDoc);
        } catch(e) { }
      });
    });
    
    displayIframeContent(doc);
  };

	var displayIframeContent = function(doc) {
		// add allowfullscreen to the outer iframe container
		$(window.top.document).find(".portletMainWrap iframe").each(function(key, element){
    		$(element).attr('allowfullscreen','allowfullscreen');
  		});

    	var wwSakaiTool = $(".icon-sakai-warpwire");
		var wwToolExists = true;
		// add a note if the ww sakai button does not exist
		if((typeof wwSakaiTool == 'undefined') || (wwSakaiTool.length <= 0)) {

			// installed warpwire tool does not exist - look for external tool installations
			wwSakaiTool = $(".menuTitle");
			var wwSakaiToolLongText = {};
			$.each(wwSakaiTool, function(key, value){
				if($(value).html().trim().toLowerCase().indexOf('warpwire') >= 0){
					wwSakaiToolLongText = $(value);
					return(false);
				}
			});

			// assign the wwSakaiTool to the temporary object
			wwSakaiTool = wwSakaiToolLongText;
			// warpwire tool does not exist as an installed or external tool
			if((typeof wwSakaiTool == 'undefined') || (wwSakaiTool.length <= 0))
				wwToolExists = false;
		}
	
		var authCheck = false;
		// find any embedded Warpwire content
	    $(doc).find("span._ww_iframe_embed").each(function(index, div){
	    	if(!$(div).children('img')) {
	    		return(true);
	    	}
	    	var self = this;
	    	$.each($(div).children('img'), function(key, value){
		    	if(!$(value).hasClass('_ww_img')) {
		    		return(true);
		    	}

				var iframeTemp = $('<iframe />');
		    	var relData = $(self).attr("rel");
		    	var relObj = JSON.parse(relData);
		    	for (var prop in relObj) {
		    		var oldProp = prop;
		    		prop = prop.replace("_ww_","");
					
					if(prop == "src")
	        			iframeTemp.attr(prop, addUrlArgument(relObj[oldProp],'co','sakai'));
					else  
						iframeTemp.attr(prop, relObj[oldProp]);					
				}
		      
				// checks to see if the span is nested - if so prepend the iframe, otherwise append
				// this keeps ordering intact
				if($(value).parent('span._ww_img')) {
					$(div).prepend(iframeTemp);
				} else {
					$(div).append(iframeTemp);
				}
		    				
				if(!authCheck && wwToolExists) {
					if((typeof wwSakaiTool != 'undefined') && (wwSakaiTool.length > 0) && (wwSakaiTool.parent().attr('href'))) {
						// the iframe which will handle login on page load
						var iframeAuth = $('<iframe />');
						// add a unique id for the iframe
						iframeAuth.attr('id','ww_login_iframe');
						iframeAuth.attr('height', '1px');
						iframeAuth.attr('width', '1px');
						iframeAuth.attr('style', 'left: -9999px; position: absolute;');
						iframeAuth.attr('src', wwSakaiTool.parent().attr('href'));
						$(div).append(iframeAuth);
						authCheck = true;
						// remove login iframe after enough time has passed to login
						var removeLoginIframe = setTimeout(function(){
							$(div).children("#ww_login_iframe").remove();
						},15000);
					}
				}

				// remove the placeholder image
				$(value).remove();
	    	});
		});

		if( !authCheck && wwToolExists && (typeof wwSakaiTool != 'undefined') && (wwSakaiTool.length > 0) && (wwSakaiTool.parent().attr('href')) ) {
			$(doc).find("iframe").each(function(index, div){
				if($(div).attr('src').trim().toLowerCase().indexOf('warpwire') < 0){
					return(true);
				}

				var iframeAuth = $('<iframe />');
				// add a unique id for the iframe
				iframeAuth.attr('id','ww_login_iframe');
				iframeAuth.attr('height', '1px');
				iframeAuth.attr('width', '1px');
				iframeAuth.attr('style', 'left: -9999px; position: absolute;');
				iframeAuth.attr('src', wwSakaiTool.parent().attr('href'));
				$(div).append(iframeAuth);
				authCheck = true;
				// remove login iframe after enough time has passed to login
				var removeLoginIframe = setTimeout(function(){
					$(div).children("#ww_login_iframe").remove();
				},15000);
				return(false);
			});
		}

		return(true);
	};

	$(document).ready(function(){
		getIframes(this);
	});
});