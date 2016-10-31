/**********************************************************************
//
// Warpwire Sakai Plugin 1.8.3
//
// Copyright 2015 Warpwire, Inc Licensed under the
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

// shim for window origin
if (!window.location.origin) {
  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}

function isIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf('MSIE ');
	var trident = ua.indexOf('Trident/');
	
	// is internet explorer
	if (msie > 0 || trident > 0)
		return(true);
	
	// other browser
	return false;	
};

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

// fn arg can be an object or a function, thanks to handleEvent
// read more about the explanation at: http://www.thecssninja.com/javascript/handleevent
function addEvt(el, evt, fn, bubble) {
    if ('addEventListener' in el) {
        // BBOS6 doesn't support handleEvent, catch and polyfill
        try {
            el.addEventListener(evt, fn, bubble);
        } catch(e) {
            if (typeof fn == 'object' && fn.handleEvent) {
                el.addEventListener(evt, function(e){
                    // Bind fn as this and set first arg as event object
                    fn.handleEvent.call(fn,e);
                }, bubble);
            } else {
                throw e;
            }
        }
    } else if ('attachEvent' in el) {
        // check if the callback is an object and contains handleEvent
        if (typeof fn == 'object' && fn.handleEvent) {
            el.attachEvent('on' + evt, function(){
                // Bind fn as this
                fn.handleEvent.call(fn);
            });
        } else {
            el.attachEvent('on' + evt, fn);
        }
    }
}

function rmEvt(el, evt, fn, bubble) {
    if ('removeEventListener' in el) {
        // BBOS6 doesn't support handleEvent, catch and polyfill
        try {
            el.removeEventListener(evt, fn, bubble);
        } catch(e) {
            if (typeof fn == 'object' && fn.handleEvent) {
                el.removeEventListener(evt, function(e){
                    // Bind fn as this and set first arg as event object
                    fn.handleEvent.call(fn,e);
                }, bubble);
            } else {
                throw e;
            }
        }
    } else if ('detachEvent' in el) {
        // check if the callback is an object and contains handleEvent
        if (typeof fn == 'object' && fn.handleEvent) {
            el.detachEvent("on" + evt, function() {
                // Bind fn as this
                fn.handleEvent.call(fn);
            });
        } else {
            el.detachEvent('on' + evt, fn);
        }
    }
}

function checkIEGet(editor, pluginId, checkGetCounter, waitIndicator) {
										    
	if(checkGetCounter >= 10) {
		CKEDITOR.document.getById('_wwWaitIndicator').remove();
		return(false);
	}
													
	var xmlhttp = createCORSRequest("GET", editor.config.warpwireURL+'/api/staging/c/'+pluginId+'/o/'+pluginId);
	
	if (xmlhttp){
	  xmlhttp.onload = function(){
			var frames = JSON.parse(xmlhttp.responseText);
			for(var i=0; i < frames.length; i++) {
	      iframeNode  = new CKEDITOR.dom.element('span');
	      
				for (var prop in frames[i].iframe) {
					var tempFrame = frames[i].iframe;
					if(prop == '_ww_src')
						tempFrame[prop] = tempFrame[prop].replace("http://","https://");
				}
				iframeNode.setAttribute('class', "_ww_iframe_embed");
				iframeNode.setAttribute('rel', JSON.stringify(frames[i].iframe));
				iframeNode.setHtml('<img width="90" height="90" class="_ww_img" src="'+frames[i]._ww_img.replace("http://","https://")+'"/>');
				
	      if (editor.mode === 'wysiwyg' && frames[i]) {
	        editor.insertElement(iframeNode);
	      }
			}
			try {
				waitIndicator.remove();
			} catch(e) { }
			
			return(true);
	  };
	  xmlhttp.onerror = function(){
	  	checkGetCounter = checkGetCounter + 1;
	  	setTimeout(checkIEGet(editor, pluginId, checkGetCounter, waitIndicator),1000);
	  };
	  xmlhttp.send();
	}
	
}

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'warpwire', {

	// Register the icons. They must match command names.
	icons: 'warpwire',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {

		var pluginEditor = this;

		// Define an editor command that inserts a warpwire.
		editor.addCommand( 'insertWarpwire', {

			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				
				var waitIndicator  = new CKEDITOR.dom.element('span');
				waitIndicator.setAttribute('id', '_wwWaitIndicator');
				waitIndicator.setHtml('<span>...</span>');
				
				addEvt(window, "message", function(ev) {
					// plugin ids do not match
					if(ev.data.pluginId != pluginEditor.pluginId)
						return(false);

				    if (ev.data.message === "deliverResult") {
				    	var frames = JSON.parse(ev.data.result);
				    	for(var i=0; i < frames.length; i++) {
                  			iframeNode  = new CKEDITOR.dom.element('span');
                  			for (var prop in frames[i].iframe) {
								var tempFrame = frames[i].iframe;
								if(prop == '_ww_src')
									tempFrame[prop] = tempFrame[prop].replace("http://","https://");
									//iframeNode.setAttribute(prop, tempFrame[prop]);
								}
								iframeNode.setAttribute('class', "_ww_iframe_embed");
								iframeNode.setAttribute('rel', JSON.stringify(frames[i].iframe));
								iframeNode.setHtml('<img width="90" height="90" class="_ww_img" src="'+frames[i]._ww_img.replace("http://","https://")+'"/>');
								
                  				if (editor.mode === 'wysiwyg' && frames[i]) {
                    				editor.insertElement(iframeNode);
                  				}
				    		}
				    	ev.data.message = '';
				    }
				});

				// Get the unique group id
        var sakaiUrl    = top.document.URL;
        var uniqueId  = "";
        
        if(sakaiUrl.indexOf("/site/") > 0)
        {
            uniqueId = sakaiUrl.split("/site/")[1].split('/')[0];
        }

				pluginEditor.pluginId = '';

				var checkGetCounter = 0;
				for (i = 0; i < 32; i++) {
					pluginEditor.pluginId += Math.floor(Math.random() * 16).toString(16);
				}

				var editorPath = pluginEditor.path.replace(/(\/)+$/g,'');
				editorPath = window.location.origin + editorPath.replace(window.location.origin, '');

				var child = window.open(editor.config.warpwireURL.replace(/(\/)+$/g,'')+'/p/checkGroup?uniqueId='+uniqueId+"&externalContext=sakai_1_8_3&pluginLaunchReturnUrl="+encodeURIComponent(editorPath+"/html/warpwire.html")+"&pluginId="+pluginEditor.pluginId,'_wwPlugin','width=400, height=500');
				
				var leftDomain = false;
		    var interval = setInterval(function() {
		        try {
		            if (child.document.domain === document.domain)
		            {
		                if (leftDomain && child.document.readyState === "complete")
		                {
		                    // we're here when the child window returned to our domain
		                    clearInterval(interval);
		                    child.postMessage({ message: "requestResult" }, "*");
		                }
		            }
		            else {
		                // this code should never be reached, 
		                // as the x-site security check throws
		                // but just in case
		                leftDomain = true;
		            }
		        }
		        catch(e) {
		            // we're here when the child window has been navigated away or closed
		            if (child.closed) {
		                clearInterval(interval);
		                // if IE, we are using a GET method rather than a window listener
		            		if(isIE()) {
		            			editor.insertElement(waitIndicator);
		            			var checkGet = checkIEGet(editor, pluginEditor.pluginId, 0, waitIndicator);
		            		}
		                
		                return; 
		            }
		            // navigated to another domain  
		            leftDomain = true;
		        }
		    }, 500);
		    
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'warpwire', {
			label: 'Insert Warpwire',
			command: 'insertWarpwire',
			toolbar: 'warpwire',
			icon: pluginEditor.path.replace(/(\/)+$/g,'')+'/images/icon-warpwire-integration.gif'
		});
	}
});