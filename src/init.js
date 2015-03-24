/*
Initiallize Bookmarklet wide variables, holders and helpers - all other files only don't share scope
*/

var data = {
	resources: [],
	marks: [],
	measures: [],
	perfTiming: [],
	allResourcesCalc: []
};

//bookmarklet wide vars
var tablesToLog = [],
	iFrameEl,
	outputIFrame,
	outputHolder,
	outputContent;

//skip browser internal pages
if(location.protocol === "about:"){
	return;
}

//feature check gate
if(window.performance && window.performance.getEntriesByType !== undefined) {
	data.resources = window.performance.getEntriesByType("resource");
	data.marks = window.performance.getEntriesByType("mark");
	data.measures = window.performance.getEntriesByType("measure");
}else if(window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	data.resources = window.performance.webkitGetEntriesByType("resource");
	data.marks = window.performance.webkitGetEntriesByType("mark");
	data.measures = window.performance.webkitGetEntriesByType("measure");
}else{
	alert("Oups, looks like this browser does not support the Resource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	return;
}

if(window.performance.timing){
	data.perfTiming = window.performance.timing;
}else{
	alert("Oups, looks like this browser does not support performance timing");
	return;
}

if(data.perfTiming.loadEventEnd - data.perfTiming.navigationStart < 0){
	alert("Page is still loading - please try again when page is loaded.");
	return;
}


data.allResourcesCalc = data.resources.filter(function(currR){
		//remove this bookmarklet from the result
		return !currR.name.match(/http[s]?\:\/\/nurun.github.io\/performance-bookmarklet\/.*/);
	}).map(function(currR, i, arr){
		//crunch the resources data into something easier to work with
		var isRequest = currR.name.indexOf("http") === 0,
			urlFragments, maybeFileName, fileExtension;

		if(isRequest){
			urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
			maybeFileName = urlFragments[2].split("/").pop();
			fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1);
		}else{
			urlFragments = ["", location.host];
			fileExtension = currR.name.split(":")[0];
		}

		var currRes = {
			name : currR.name,
			domain : urlFragments[1],
			initiatorType : currR.initiatorType || fileExtension || "SourceMap or Not Defined",
			fileExtension : fileExtension || "XHR or Not Defined",
			loadtime : currR.duration,
			fileType : helper.getFileType(fileExtension, currR.initiatorType),
			isRequestToHost : urlFragments[1] === location.host
		};

		for(var attr in currR){
			if(typeof currR[attr] !== "function") {
				currRes[attr] = currR[attr];
			}
		}

		if(currR.requestStart){
			currRes.requestStartDelay = currR.requestStart - currR.startTime;
			currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
			currRes.tcp = currR.connectEnd - currR.connectStart;
			currRes.ttfb = currR.responseStart - currR.startTime;
			currRes.requestDuration = currR.responseStart - currR.requestStart;
		}
		if(currR.secureConnectionStart){
			currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
		}
		
		return currRes;
	});

tablesToLog.push({
	name : "All loaded resources",
	data : data.allResourcesCalc,
	columns : [
			"name",
			"domain",
			"fileType",
			"initiatorType",
			"fileExtension",
			"loadtime",
			"isRequestToHost",
			"requestStartDelay",
			"dns",
			"tcp",
			"ttfb",
			"requestDuration",
			"ssl"
		]
});


var triggerEvent = function(element, name){
	var event;
	if(document.createEvent) {
		event = document.createEvent("HTMLEvents");
		event.initEvent(name, true, true);
	}else{
		event = document.createEventObject();
		event.eventType = name;
	}
	event.eventName = name;
	if(document.createEvent) {
		element.dispatchEvent(event);
	}else{
		element.fireEvent("on" + event.eventType, event);
	}
};

var onIFrameLoaded = (function(){
	var hasLoaded = false;
	var callOnLoad = [];
	var onIFrameLoadedCb = function(){
		hasLoaded = true;
		window.removeEventListener("iFrameLoaded", onIFrameLoadedCb, false);
		callOnLoad.forEach(function(cb){
			cb(helper, dom, svg);
		})
	};
	window.addEventListener("iFrameLoaded", onIFrameLoadedCb, false);
	return function(cb){
		if(hasLoaded){
			cb(helper, dom, svg);
		}else{
			callOnLoad.push(cb);
		}
	};
})();



//setup iFrame overlay
iFrameEl = document.getElementById("perfbook-iframe");
if(iFrameEl){
	outputIFrame = iFrameEl.contentWindow.document;
	outputHolder = outputIFrame.getElementById("perfbook-holder");
	triggerEvent(window, "iFrameLoaded");
}else{
	iFrameEl = dom.newTag("iframe", {
		id : "perfbook-iframe",
		onload : function(){
			outputIFrame = iFrameEl.contentWindow.document;

			//add style to iFrame
			var styleTag = dom.newTag("style", {
				type : "text/css",
				text : cssFileText
			});

			outputIFrame.head.appendChild(styleTag);
			
			triggerEvent(window, "iFrameLoaded");
		}
	}, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index: 9999; width:98%; z-index: 9999; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
	document.body.appendChild(iFrameEl);
}

onIFrameLoaded(function(helper, dom, svg){
	// find or create holder element
	if(!outputHolder){
		outputHolder = dom.newTag("div", {id : "perfbook-holder"});
		outputContent = dom.newTag("div", {id : "perfbook-content"});
			
		var closeBtn = dom.newTag("button", {
			class : "perfbook-close",
			text: "close"
		});
		closeBtn.addEventListener("click", function(){
			iFrameEl.parentNode.removeChild(iFrameEl);
		});

		outputHolder.appendChild(closeBtn);
		outputHolder.appendChild(outputContent);
	}else{
		outputContent = outputIFrame.getElementById("perfbook-content");
		//clear existing data
		while (outputContent.firstChild) {
			outputContent.removeChild(outputContent.firstChild);
		}
	}
});
