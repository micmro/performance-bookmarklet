/*https://github.com/nurun/performance-bookmarklet
 by Michael Mrowetz @MicMro*/

(function(){
"use strict";

var cssFileText = "body {overflow: hidden; background: #fff; font:normal 12px/18px sans-serif; color:#333;} * {box-sizing:border-box;} svg {font:normal 12px/18px sans-serif;} #perfbook-holder {overflow: hidden; width:100%; padding:1em 2em 3em;} #perfbook-content {position:relative;} .perfbook-close {position:absolute; top:0; right:0; padding:1em; z-index:1; background:transparent; border:0; cursor:pointer;} .full-width {width:100%;} h1 {font:bold 18px/18px sans-serif; margin:1em 0; color:#666;} .text-right {text-align: right;} .text-left {text-align: left;} .tiles-holder {margin: 2em -18px 1em 0; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .summary-tile { flex-grow: 1; width:250px; background:#ddd; padding: 1em; margin:0 18px 1em 0; color:#666; text-align:center;} .summary-tile dt {font-weight:bold; font-size:16px; display:block; line-height:1.2em; min-height:2.9em; padding:0 0 0.5em;} .summary-tile dd {font-weight:bold; line-height:60px; margin:0;} .summary-tile-appendix {float:left; clear:both; width:100%; font-size:10px; line-height:1.1em; color:#666;} .summary-tile-appendix dt {float:left; clear:both;} .summary-tile-appendix dd {float:left; margin:0 0 0 1em;} .pie-charts-holder {margin: 0 -72px 0 0; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap;} .pie-chart-holder {flex-grow: 1; width:350px; max-width: 600px; margin: 0 72px 0 0;} .pie-chart-holder h1 {min-height:2em;} .pie-chart {width:100%;} .table-holder {overflow-x:auto} .table-holder table {float:left; width:100%; font-size:12px; line-height:18px;} .table-holder th { padding:0 0.5em 0 0;} .table-holder td {padding:0 0.5em 0 0;} .water-fall-holder {margin: 25px 0; fill:#ccc;} .water-fall-chart {width:100%; background:#f0f5f0;} .water-fall-chart .marker-holder {width:100%;} .water-fall-chart .line-holder {stroke-width:1; stroke: #a971c5; stroke-opacity:0.5;} .water-fall-chart .line-holder.active {stroke: #69009e; stroke-width:2; stroke-opacity:1;} .water-fall-chart .labels {width:100%;} .water-fall-chart .labels .inner-label {pointer-events: none;} .water-fall-chart .time-block.active {opacity: 0.8;} .water-fall-chart .line-end, .water-fall-chart .line-start {display: none; stroke-width:1; stroke-opacity:0.5; stroke: #000;} .water-fall-chart .line-end.active, .water-fall-chart .line-start.active {display: block;} .time-scale line {stroke:#0cc; stroke-width:1;} .time-scale text {font-weight:bold;} .navigation-timing {} .legends-group { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .legends-group .legend-holder { flex-grow: 1; width:250px; padding:0 1em 1em; } .legends-group .legend-holder h4 { margin: 0; padding: 0; } .legend dt {float: left; clear: left; padding: 0 0 0.5em;} .legend dd {float: left; display: inline-block; margin: 0 1em; line-height: 1em;} .legend .colorBoxHolder span {display: inline-block; width: 15px; height: 1em;} .resource-timing .chart-holder {} ";


/*
Initiallize Bookmarklet wide variables, holders and helpers - all other files only don't share scope
*/

//bookmarklet wide vars
var tablesToLog = [],
	resources,
	allResourcesCalc,
	marks,
	measures,
	perfTiming,
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
	resources = window.performance.getEntriesByType("resource");
	marks = window.performance.getEntriesByType("mark");
	measures = window.performance.getEntriesByType("measure");
}else if(window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	resources = window.performance.webkitGetEntriesByType("resource");
	marks = window.performance.webkitGetEntriesByType("mark");
	measures = window.performance.webkitGetEntriesByType("measure");
}else{
	alert("Oups, looks like this browser does not support the Resource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	return;
}

if(window.performance.timing){
	perfTiming = window.performance.timing;
}else{
	alert("Oups, looks like this browser does not support performance timing");
	return;
}

if(perfTiming.loadEventEnd - perfTiming.navigationStart < 0){
	alert("Page is still loading - please try again when page is loaded.");
	return;
}

//extract a resources file type
var getFileType = function(fileExtension, initiatorType){
	if(fileExtension){
		switch(fileExtension){
			case "jpg" :
			case "jpeg" :
			case "png" :
			case "gif" :
			case "webp" :
			case "svg" :
			case "ico" :
				return "image";
			case "js" : 
				return "js"
			case "css":
				return "css"
			case "html":
				return "html"
			case "woff":
			case "woff2":
			case "ttf":
			case "eot":
			case "otf":
				return "font"
			case "swf":
				return "flash"
			case "map":
				return "source-map"
		}
	}
	if(initiatorType){
		switch(initiatorType){
			case "xmlhttprequest" :
				return "ajax"
			case "img" :
				return "image"
			case "script" :
				return "js"
			case "internal" :
			case "iframe" :
				return "html" //actual page
			default :
				return "other"
		}
	}
	return initiatorType;
};


allResourcesCalc = resources.filter(function(currR){
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
			fileType : getFileType(fileExtension, currR.initiatorType),
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
	data : allResourcesCalc,
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


//helper functions


var newTextNode = function(text){
	return document.createTextNode(text);
};

//creat html tag
var newTag = function(tagName, settings, css){
	settings = settings || {};
	var tag = document.createElement(tagName);
	for(var attr in settings){
		if(attr != "text"){
			tag[attr] = settings[attr];
		}
	}
	if(settings.text){
		tag.textContent = settings.text;
	}else if(settings.childElement){
		if(typeof settings.childElement === "object"){
			//if childNodes NodeList is passed in
			if(settings.childElement instanceof NodeList){
				//NodeList is does not inherit from array
				Array.prototype.slice.call(settings.childElement,0).forEach(function(childNode){
					tag.appendChild(childNode);
				});
			}else{
				tag.appendChild(settings.childElement);
			}
		}else{
			tag.appendChild(newTextNode(settings.childElement));
		}
	}
	if(settings.class){
		tag.className = settings.class;
	}
	tag.style.cssText = css||"";
	return tag;
};


var combineNodes = function(a, b){
	var wrapper = document.createElement("div");
	if(typeof a === "object"){
		wrapper.appendChild(a);
	}else if(typeof a === "string"){
		wrapper.appendChild(newTextNode(a));
	}
	if(typeof b === "object"){
		wrapper.appendChild(b);
	}else if(typeof b === "string"){
		wrapper.appendChild(newTextNode(b));
	}
	return wrapper.childNodes;
};

//create svg element
var newElementNs = function(tagName, settings, css){
	var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	settings = settings || {};
	for(var attr in settings){
		if(attr != "text"){
			el.setAttributeNS(null, attr, settings[attr]);
		}
	}
	el.textContent = settings.text||"";
	el.style.cssText = css||"";
	return el;
};

var newTextElementNs = function(text, y, css){
	return newElementNs("text", {
			fill : "#111",
			y : y,
			text : text
		}, (css||"") + " text-shadow:0 0 4px #fff;");
};

var getNodeTextWidth = function(textNode){
	var tmp = newElementNs("svg:svg", {}, "visibility:hidden;");
	tmp.appendChild(textNode);
	outputIFrame.body.appendChild(tmp);
	var nodeWidth = textNode.getBBox().width;
	tmp.parentNode.removeChild(tmp);
	return nodeWidth;
};

var getRandomColor = function(baseRangeRed, baseRangeGreen, baseRangeBlue){
	var range = [baseRangeRed||"0123456789ABCDEF", baseRangeGreen||"0123456789ABCDEF", baseRangeBlue||"0123456789ABCDEF"];
	var color = "#";
	var r = 0;
	for (var i = 0; i < 6; i++){
		r = Math.floor(i/2);
		color += range[r].split("")[Math.floor(Math.random() * range[r].length)];
	}
	return color;
};

var endsWith = function(str, suffix){
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getColourVariation = function(hexColour, variation){
	var r = ((parseInt(hexColour.substr(1,2), 16)) + variation).toString(16);
	var g = ((parseInt(hexColour.substr(3,2), 16)) + variation).toString(16);
	var b = ((parseInt(hexColour.substr(5,2), 16)) + variation).toString(16);
	return "#" + r + g + b;
}

var getInitiatorTypeColour = function(initiatorType, fallbackColour, variation){
	var colour = fallbackColour||"#bebebe"; //default

	//colour the resources by initiator type
	switch(initiatorType) {
		case "css" : colour = "#afd899"; break;
		case "iframe" : colour = "#85b3f2"; break;
		case "img" : colour = "#bc9dd6"; break;
		case "script" : colour = "#e7bd8c"; break; 
		case "link" : colour = "#89afe6"; break;
		case "swf" : colour = "#4db3ba"; break; 
		case "font" : colour = "#e96859"; break; //TODO check if this works
		case "xmlhttprequest" : colour = "#e7d98c"; break;
	}
	if(variation === true){
		return getColourVariation(colour, -5);
	}
	return colour;
};

var getFileTypeColour = function(initiatorType, fallbackColour, variation){
	var colour = fallbackColour||"#bebebe"; //default

	//colour the resources by initiator type
	switch(initiatorType) {
		case "css" : colour = "#afd899"; break;
		case "html" : colour = "#85b3f2"; break;
		case "image" : colour = "#bc9dd6"; break;
		case "js" : colour = "#e7bd8c"; break; 
		case "link" : colour = "#89afe6"; break;
		case "swf" : colour = "#4db3ba"; break; 
		case "font" : colour = "#e96859"; break; //TODO check if this works
		case "ajax" : colour = "#e7d98c"; break;
	}
	if(variation === true){
		return getColourVariation(colour, -5);
	}
	return colour;
};

//counts occurences of items in array arr and returns them as array of key valure pairs
//keyName overwrites the name of the key attribute 
var getItemCount = function(arr, keyName){
	var counts = {},
		resultArr = [],
		obj;

	arr.forEach(function(key){
		counts[key] = counts[key] ? counts[key]+1 : 1;
	});

	//pivot data
	for(var fe in counts){
		obj = {};
		obj[keyName||"key"] = fe;
		obj.count = counts[fe];

		resultArr.push(obj);
	}
	return resultArr.sort(function(a, b) {
		return a.count < b.count ? 1 : -1;
	});
};

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

var addClass = function(el, className){
	if(el.classList){
		el.classList.add(className);
	}else{
		// IE doesn't support classList in SVG - also no need for dublication check i.t.m.
		el.setAttribute("class", el.getAttribute("class") + " " + className);
	}
	return el;
}


var removeClass = function(el, className){
	if(el.classList){
		el.classList.remove(className);
	}else{
		//IE doesn't support classList in SVG - also no need for dublication check i.t.m.
        el.setAttribute("class", el.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
	}
	return el;
}

var onIFrameLoaded = (function(){
	var hasLoaded = false;
	var callOnLoad = [];
	var onIFrameLoadedCb = function(){
		hasLoaded = true;
		window.removeEventListener("iFrameLoaded", onIFrameLoadedCb, false);
		callOnLoad.forEach(function(cb){
			cb();
		})
	};
	window.addEventListener("iFrameLoaded", onIFrameLoadedCb, false);
	return function(cb){
		if(hasLoaded){
			cb();
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
	iFrameEl = newTag("iframe", {
		id : "perfbook-iframe",
		onload : function(){
			outputIFrame = iFrameEl.contentWindow.document;

			//add style to iFrame
			var styleTag = newTag("style", {
				type : "text/css",
				text : cssFileText
			});

			outputIFrame.head.appendChild(styleTag);
			
			triggerEvent(window, "iFrameLoaded");
		}
	}, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index: 9999; width:98%; z-index: 9999; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
	document.body.appendChild(iFrameEl);
}

onIFrameLoaded(function(){
	// find or create holder element
	if(!outputHolder){
		outputHolder = newTag("div", {id : "perfbook-holder"});
		outputContent = newTag("div", {id : "perfbook-content"});
			
		var closeBtn = newTag("button", {
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



/*
Tiles to summarize page performance
*/


onIFrameLoaded(function(){
	var requestsOnly,
		requestsByDomain,
		currAndSubdomainRequests,
		crossDocDomainRequests,
		hostRequests,
		hostSubdomains,
		slowestCalls,
		average,
		createTile,
		createAppendixDefValue,
		tilesHolder,
		appendix;

	//filter out non-http[s] and sourcemaps
	requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	currAndSubdomainRequests = requestsOnly.filter(function(domain){
		return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
	}).length;

	crossDocDomainRequests = requestsOnly.filter(function(domain){
		return !endsWith(domain.domain, document.domain);
	}).length;

	hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	hostSubdomains = requestsByDomain.filter(function(domain){
		return endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
	}).length;

	if(allResourcesCalc.length > 0){
		slowestCalls = allResourcesCalc.filter(function(a){
			return a.name !== location.href;
		}).sort(function(a, b) {
			return b.duration - a.duration;
		});

		average = Math.floor(slowestCalls.reduceRight(function(a,b){
			if(typeof a !== "number"){
				return a.duration + b.duration
			}
			return a + b.duration;
		}) / slowestCalls.length);
	}


	createTile = function(title, value, titleFontSize){
		titleFontSize = titleFontSize || 60;
		var dl = newTag("dl", {
			class : "summary-tile"
		});
		dl.appendChild(newTag("dt", {childElement : title}));
		dl.appendChild(newTag("dd", {childElement : value}, "font-size:"+titleFontSize+"px;"));
		return dl;
	};

	createAppendixDefValue = function(a, definition, value){
		a.appendChild(newTag("dt", {childElement : definition}));
		a.appendChild(newTag("dd", {text : value}));
	};

	tilesHolder = newTag("div", {
		class : "tiles-holder"
	});

	[
		createTile("Requests", requestsOnly.length||"0"),
		createTile("Domains", requestsByDomain.length||"0"),
		createTile(combineNodes("Subdomains of ", newTag("abbr", {title : "Top Level Domain", text : "TLD"})), hostSubdomains||"0"),
		createTile(combineNodes("Requests to ", newTag("span", {title : location.host, text : "Host"})), hostRequests||"0"),
		createTile(combineNodes(newTag("abbr", {title : "Top Level Domain", text : "TLD"}), "& Subdomain Requests"), currAndSubdomainRequests||"0"),
		createTile("Total", perfTiming.loadEventEnd - perfTiming.navigationStart + "ms", 40),
		createTile("Time to First Byte", perfTiming.responseStart - perfTiming.navigationStart + "ms", 40),
		createTile(newTag("span", {title : "domLoading to domContentLoadedEventStart", text : "DOM Content Loading"}), perfTiming.domContentLoadedEventStart - perfTiming.domLoading + "ms", 40),
		createTile(newTag("span", {title : "domLoading to loadEventStart", text : "DOM Processing"}), perfTiming.domComplete - perfTiming.domLoading + "ms", 40)
	].forEach(function(tile){
		tilesHolder.appendChild(tile);
	});

	if(allResourcesCalc.length > 0){
		tilesHolder.appendChild(createTile(newTag("span", {title : slowestCalls[0].name, text : "Slowest Call"}), newTag("span", {title : slowestCalls[0].name, text : Math.floor(slowestCalls[0].duration) + "ms"}), 40));
		tilesHolder.appendChild(createTile("Average Call", average + "ms", 40));
	}

	appendix = newTag("dl", {
		class : "summary-tile-appendix"
	});

	createAppendixDefValue(appendix, newTag("abbr", {title : "Top Level Domain", text : "TLD"}, location.host.split(".").slice(-2).join(".")));
	createAppendixDefValue(appendix, newTextNode("Host:"), location.host);
	createAppendixDefValue(appendix, newTextNode("document.domain:"), document.domain);

	tilesHolder.appendChild(appendix);
	outputContent.appendChild(tilesHolder);
});



/*
Logic for Naviagtion Timing API and Markers Waterfall
*/


onIFrameLoaded(function(){

	var perfTimingCalc = {
		"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.navigationStart,
		"output" : []
	};
	var startTime = perfTiming.navigationStart;
	var propBaseName;

	for(var perfProp in perfTiming) {
		if(perfTiming[perfProp] && typeof perfTiming[perfProp] === "number"){
			perfTimingCalc[perfProp] = perfTiming[perfProp] - startTime;
			perfTimingCalc.output.push({
				"name" : perfProp,
				"time (ms)" : perfTiming[perfProp] - startTime
			});
		}
	}

	perfTimingCalc.output.sort(function(a, b){
		return (a["time (ms)"]||0) - (b["time (ms)"]||0);
	});

	var timeBlock = function(name, start, end, colour){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour
		}
	};

	perfTimingCalc.blocks = [
		timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "#ccc"),
		timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "#909"),
		timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "#ffff60"),
		timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "#1f831f"),
		timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "#1f7c83"),
		timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "#e58226"),
		timeBlock("Timer to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "#1fe11f"),
		timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "#1977dd"),
		timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "#9cc"),
		timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "#d888df"),
		timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "#c0c0ff")
	];

	if(perfTimingCalc.secureConnectionStart){
		perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "#c141cd"));
	}
	if(perfTimingCalc.msFirstPaint){
		perfTimingCalc.blocks.push(timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "#8FBC83"));
	}
	if(perfTimingCalc.domInteractive){
		perfTimingCalc.blocks.push(timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "#d888df"));
	}
	if(!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart){
		perfTimingCalc.blocks.push(timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "#ffff60"));
	}

	perfTimingCalc.blocks.push(timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "#8cd18c"));

	//add measures to be added as bars
	measures.forEach(function(measure){
		perfTimingCalc.blocks.push(timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "#f00"));
	});	

	var setupTimeLine = function(){
		var unit = perfTimingCalc.pageLoadTime / 100;
		var barsToShow = perfTimingCalc.blocks.filter(function(block){
			return (typeof block.start == "number" && typeof block.total == "number");
		}).sort(function(a, b){
			return (a.start||0) - (b.start||0);
		});
		var maxMarkTextLength = marks.length > 0 ? marks.reduce(function(currMax, currValue) {
			return Math.max((typeof currMax == "number" ? currMax : 0), getNodeTextWidth(newTextElementNs(currValue.name, "0")));
		}) : 0;


		var diagramHeight = (barsToShow.length + 1) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

		var chartHolder = newTag("div", {
			class : "navigation-timing water-fall-holder chart-holder"
		});
		var timeLineHolder = newElementNs("svg:svg", {
			height : Math.floor(chartHolderHeight),
			class : "water-fall-chart"
		});
		var timeLineLabelHolder = newElementNs("g", {class : "labels"});

		var endline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-end"
		});
		
		var startline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-start"
		});

		var onRectMouseEnter = function(evt){
			var targetRect = evt.target;
			addClass(targetRect, "active");

			var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
			var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";
			endline.x1.baseVal.valueAsString = xPosEnd;
			endline.x2.baseVal.valueAsString = xPosEnd;
			startline.x1.baseVal.valueAsString = xPosStart;
			startline.x2.baseVal.valueAsString = xPosStart;
			addClass(endline, "active");
			addClass(startline, "active");

			targetRect.parentNode.appendChild(endline);
			targetRect.parentNode.appendChild(startline);
		};

		var onRectMouseLeave = function(evt){
			removeClass(evt.target, "active");
			removeClass(endline, "active");
			removeClass(startline, "active");
		};

		var createRect = function(width, height, x, y, fill, label){
			var rect = newElementNs("rect", {
				width : (width / unit) + "%",
				height : height,
				x :  (x / unit) + "%",
				y : y,
				fill : fill,
				class : "time-block"
			});
			if(label){
				rect.appendChild(newElementNs("title", {
					text : label
				})); // Add tile to wedge path
			}

			rect.addEventListener("mouseenter", onRectMouseEnter);
			rect.addEventListener("mouseleave", onRectMouseLeave);

			return rect;
		};

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { class : "time-scale full-width" });
			for(var i = 0, secs = perfTimingCalc.pageLoadTime / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight);
				if(i > secs - 0.2){
					lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
					lineLabel.setAttribute("text-anchor", "end");
				}else{
					lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
				}
				
				var lineEl = newElementNs("line", {
					x1 : secPerc * i + "%",
					y1 : "0",
					x2 : secPerc * i + "%",
					y2 : diagramHeight
				});
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		
		var renderMarks = function(){
			var marksHolder = newElementNs("g", {
				transform : "scale(1, 1)",
				class : "marker-holder"
			});

			marks.forEach(function(mark, i){
				//mark.duration
				var markHolder = newElementNs("g", {
					class : "mark-holder"
				});
				var lineHolder = newElementNs("g", {
					class : "line-holder"
				});
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight + 25 );
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : "0px",
					x2 : x + "%",
					y2 : diagramHeight
				}));

				if(marks[i-1] && mark.x - marks[i-1].x < 1){
					lineLabel.setAttribute("x", marks[i-1].x+1 + "%");
					mark.x = marks[i-1].x+1;
				}

				//would use polyline but can't use percentage for points 
				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : diagramHeight,
					x2 : mark.x + "%",
					y2 : diagramHeight + 23
				}));

				markHolder.addEventListener("mouseenter", function(evt){
					addClass(lineHolder, "active");
					markHolder.parentNode.appendChild(markHolder);
				});
				markHolder.addEventListener("mouseleave", function(evt){
					removeClass(lineHolder, "active");
				});

				markHolder.appendChild(newElementNs("title", {
					text : mark.name + " (" + Math.round(mark.startTime) + "ms)",
				}));
				markHolder.appendChild(lineHolder);
				markHolder.appendChild(lineLabel);
				marksHolder.appendChild(markHolder);
			});

			return marksHolder;
		};
		
		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function(block, i){
			var blockWidth = block.total||1;
			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)"));

			var blockLabel = newTextElementNs(block.name + " (" + block.total + "ms)", (y + 18));

			if(((block.total||1) / unit) > 10){
				blockLabel.setAttribute("class", "inner-label");
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + 0.5 + "%");
				blockLabel.setAttribute("width", (blockWidth / unit) + "%");
			}else if(((block.start||0.001) / unit) + (blockWidth / unit) < 80){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + (blockWidth / unit) + 0.5 + "%");
			}else {
				blockLabel.setAttribute("x", (block.start||0.001) / unit - 0.5 + "%");
				blockLabel.setAttribute("text-anchor", "end"); 
			}
			timeLineLabelHolder.appendChild(blockLabel);
		});

		timeLineHolder.appendChild(timeLineLabelHolder);

		chartHolder.appendChild(newTag("h1", {
			text : "Navigation Timing"
		}));
		chartHolder.appendChild(timeLineHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine();

	tablesToLog = tablesToLog.concat([
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output},
		{name: "Marks", data : marks, columns : ["name", "startTime", "duration"]}
	]);
});


/*
Logic for Request analysis pie charts
*/


onIFrameLoaded(function(){
	function createPieChart(data, size){
		//inpired by http://jsfiddle.net/da5LN/62/

		var chart = newElementNs("svg:svg", {
			viewBox : "0 0 " + size + " " + size,
			class : "pie-chart"
		}, "max-height:"+((window.innerWidth * 0.98 - 64) / 3)+"px;");

		var unit = (Math.PI * 2) / 100,
			startAngle = 0; // init startAngle


		var createWedge = function(id, size, percentage, labelTxt, colour){
			var radius = size/2,
				endAngle = startAngle + (percentage * unit - 0.001),
				labelAngle = startAngle + (percentage/2 * unit - 0.001),
				x1 = radius + radius * Math.sin(startAngle),
				y1 = radius - radius * Math.cos(startAngle),
				x2 = radius + radius * Math.sin(endAngle),
				y2 = radius - radius * Math.cos(endAngle),
				x3 = radius + radius * 0.85 * Math.sin(labelAngle),
				y3 = radius - radius * 0.85 * Math.cos(labelAngle),
				big = (endAngle - startAngle > Math.PI) ? 1 : 0;

			var d = "M " + radius + "," + radius +	// Start at circle center
					" L " + x1 + "," + y1 +				// Draw line to (x1,y1)
					" A " + radius + "," + radius +	// Draw an arc of radius r
					" 0 " + big + " 1 " +				// Arc details...
					x2 + "," + y2 +						// Arc goes to to (x2,y2)
					" Z";								// Close path back to (cx,cy)

			var path = newElementNs("path", {
				id : id,
				d : d,
				fill : colour
			});

			path.appendChild(newElementNs("title", {
				text : labelTxt
			})); // Add tile to wedge path
			path.addEventListener("mouseenter", function(evt){
				evt.target.style.opacity = "0.5";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
			});
			path.addEventListener("mouseleave", function(evt){
				evt.target.style.opacity = "1";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
			});

			startAngle = endAngle;
			if(percentage > 10){
				var wedgeLabel = newTextElementNs(labelTxt, y3);

				//first half or second half
				if(labelAngle < Math.PI){
					wedgeLabel.setAttribute("x", x3 - getNodeTextWidth(wedgeLabel));
				}else{
					wedgeLabel.setAttribute("x", x3);
				}

				return { path: path, wedgeLabel: wedgeLabel};
			}			
			return { path: path };
		};
		
		//setup chart
		var labelWrap = newElementNs("g", {}, "pointer-events:none; font-weight:bold;");
		var wedgeWrap = newElementNs("g");

		//loop through data and create wedges
		data.forEach(function(dataObj){
			var wedgeAndLabel = createWedge(dataObj.id, size, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || getRandomColor());
			wedgeWrap.appendChild(wedgeAndLabel.path);

			if(wedgeAndLabel.wedgeLabel){
				labelWrap.appendChild(wedgeAndLabel.wedgeLabel);
			}
		});

		// foreground circle
		wedgeWrap.appendChild(newElementNs("circle", {
			cx : size/2,
			cy : size/2,
			r : size*0.05,
			fill : "#fff"
		}));
		chart.appendChild(wedgeWrap);
		chart.appendChild(labelWrap);
		return chart;
	};

	var createTable = function(title, data, columns){
		columns = columns||[{name: "Requests", field: "count"}];

		//create table
		var tableHolder = newTag("div", {
			class : "table-holder"
		});
		var table = newTag("table", {}, "");
		var thead = newTag("thead");
		var tbody = newTag("tbody");
		thead.appendChild(newTag("th", {text : title, class: "text-left"}));
		// thead.appendChild(newTag("th", {text : "Requests"}));
		columns.forEach(function(column){
			thead.appendChild(newTag("th", {text : column.name, class: "text-right"}));
		});
		thead.appendChild(newTag("th", {text : "Percentage", class: "text-right"}));
		table.appendChild(thead);

		data.forEach(function(y){
			var row = newTag("tr", {id : y.id + "-table"});
			row.appendChild(newTag("td", {text : y.label}));
			columns.forEach(function(column){				
				row.appendChild(newTag("td", {text : y[column.field], class: "text-right"}));
			});
			row.appendChild(newTag("td", {text : y.perc.toPrecision(2) + "%", class: "text-right"}));
			tbody.appendChild(row);
		});

		table.appendChild(tbody);
		tableHolder.appendChild(table);

		return tableHolder;
	};

	//filter out non-http[s] and sourcemaps
	var requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	//get counts
	var initiatorTypeCounts = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.initiatorType || currR.fileExtension;
	}), "initiatorType");

	var initiatorTypeCountHostExt = getItemCount(requestsOnly.map(function(currR, i, arr){
		return (currR.initiatorType  || currR.fileExtension) + " " + (currR.isRequestToHost ? "(host)" : "(external)");
	}), "initiatorType");

	var requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	var fileTypeCountHostExt = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.fileType  + " " + (currR.isRequestToHost ? "(host)" : "(external)");
	}), "fileType");

	var fileTypeCounts = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.fileType;
	}), "fileType");

	requestsOnly.forEach(function(currR){
		var entry = requestsByDomain.filter(function(a){
			return a.domain == currR.domain
		})[0]||{};

		entry.durationTotal = (entry.durationTotal||0) + currR.duration;
	});



	var hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	var chartsHolder = newTag("div", {
		class : "pie-charts-holder chart-holder"
	});

	// create a chart and table section
	var setupChart = function(title, data, countTexts, columns){
		var chartHolder = newTag("div", {
			class : "pie-chart-holder"
		});
		chartHolder.appendChild(newTag("h1", {text : title}));
		chartHolder.appendChild(createPieChart(data, 400));
		chartHolder.appendChild(newTag("p", {text : "Total Requests: " + requestsOnly.length}));
		if(countTexts && countTexts.length){
			countTexts.forEach(function(countText){
				chartHolder.appendChild(newTag("p", {text : countText}, "margin-top:-1em"));
			})
		}
		chartHolder.appendChild(createTable(title, data, columns));
		chartsHolder.appendChild(chartHolder);
	};

	outputContent.appendChild(chartsHolder);


	// init data for charts

	var requestsUnit = requestsOnly.length / 100;
	var colourRangeR = "789abcdef";
	var colourRangeG = "789abcdef";
	var colourRangeB = "789abcdef";


	var requestsByDomainData = requestsByDomain.map(function(domain){
		domain.perc = domain.count / requestsUnit;
		domain.label = domain.domain;
		if(domain.domain === location.host){
			domain.colour = "#0c0";
		}else if(domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".")){
			domain.colour = "#0a0";
		}else{
			domain.colour = getRandomColor("56789abcdef", "01234567", "abcdef");
		}
		domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
		domain.durationAverage =  Math.round(domain.durationTotal / domain.count);
		return domain;
	});

	
	setupChart("Requests by Domain", requestsByDomainData, [
		"Domains Total: " + requestsByDomain.length
	], [
		{name:"Requests", field: "count"},
		{name: "Avg. Duration (ms)", field: "durationAverage"}
	]);

	setupChart("Requests by Initiator Type", initiatorTypeCounts.map(function(initiatorype){
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = getInitiatorTypeColour((initiatorype.initiatorType), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		initiatorype.id = "reqByInitiatorType-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}));

	setupChart("Requests by Initiator Type (host/external domain)", initiatorTypeCountHostExt.map(function(initiatorype){
		var typeSegments = initiatorype.initiatorType.split(" ");
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = getInitiatorTypeColour(typeSegments[0], getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		initiatorype.id = "reqByInitiatorTypeLocEx-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}),[
		"Requests to Host: " + hostRequests,
		"Host: " + location.host,
	]);

	setupChart("Requests by File Type", fileTypeCounts.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getFileTypeColour((fileType.fileType), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	setupChart("Requests by File Type (host/external domain)", fileTypeCountHostExt.map(function(fileType){
		var typeSegments = fileType.fileType.split(" ");
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getFileTypeColour(typeSegments[0], getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}),[
		"Requests to Host: " + hostRequests,
		"Host: " + location.host,
	]);

	tablesToLog = tablesToLog.concat([
		{
			name : "Requests by domain",
			data : requestsByDomain
		},
		{
			name : "Requests by Initiator Type",
			data : initiatorTypeCounts,
			columns : ["initiatorType", "count", "perc"]
		},
		{
			name : "Requests by Initiator Type (host/external domain)",
			data : initiatorTypeCountHostExt,
			columns : ["initiatorType", "count", "perc"]
		},
		{
			name : "Requests by File Type",
			data : fileTypeCounts,
			columns : ["fileType", "count", "perc"]
		}
	]);
});



/*
Logic for Request analysis table
*/


onIFrameLoaded(function(){
	var requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	window.requestsOnly = requestsOnly;

	var output = requestsOnly.reduce(function(collectObj, currR){
		var fileTypeData = collectObj[currR.fileType],
			initiatorTypeData;

		if(!fileTypeData){
			fileTypeData = collectObj[currR.fileType] = {
				"fileType" : currR.fileType,
				"count" : 0,
				"initiatorType" : {},
				"requestsToHost" : 0,
				"requestsToExternal" : 0
			};
		}

		initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType];
		if(!initiatorTypeData){
			initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType] = {
				"initiatorType" : currR.initiatorType,
				"count" : 0,
				"requestsToHost" : 0,
				"requestsToExternal" : 0
			}
		}

		fileTypeData.count++;
		initiatorTypeData.count++;

		if(currR.isRequestToHost){
			fileTypeData.requestsToHost++;
			initiatorTypeData.requestsToHost++;
		}else{
			fileTypeData.requestsToExternal++;
			initiatorTypeData.requestsToExternal++;
		}

		return collectObj;
	}, {});

	var outputHtml = "<table><thead>";
	[
		"FileType",
		"Count",
		"Count Internal",
		"count external",
		"Initiator Type",
		"Count by Initiator Type",
		"Initiator Type Internal",
		"Initiator Type external"
	].map(function(title){
		outputHtml += "<th>" + title + "</th>\n";
	});

	outputHtml +=  "</thead><tbody>\n"

	Object.keys(output).forEach(function(key){
		var fileTypeData = output[key],
			initiatorTypeKeys = Object.keys(fileTypeData.initiatorType),
			firstinitiatorTypeKey = fileTypeData.initiatorType[initiatorTypeKeys[0]],
			rowspan = initiatorTypeKeys.length;

		console.log(fileTypeData, initiatorTypeKeys);

		outputHtml += "<tr>\n";

		[
			fileTypeData.fileType,
			fileTypeData.count,
			fileTypeData.requestsToHost,
			fileTypeData.requestsToExternal,
			firstinitiatorTypeKey.initiatorType,
			firstinitiatorTypeKey.count,
			firstinitiatorTypeKey.requestsToHost,
			firstinitiatorTypeKey.requestsToExternal,

		].forEach(function(val, i){
			outputHtml += "\t<td" + ((i < 4 && initiatorTypeKeys.length > 1) ? " rowspan=\""+rowspan+"\"" : "") + ">" + val + "</td>\n";
		});
		outputHtml += "</tr>";

		initiatorTypeKeys.slice(1).forEach(function(initiatorTypeKey){
			var initiatorTypeData = fileTypeData.initiatorType[initiatorTypeKey];
			console.log(initiatorTypeData);
			outputHtml += "<tr>\n\t<td>" + initiatorTypeKey + "</td><td>" + initiatorTypeData.count + "</td><td>" + initiatorTypeData.requestsToHost + "</td><td>" + initiatorTypeData.requestsToExternal + "</td>\n</tr>\n"
		});
	});

	outputHtml += "\n</tbody></table>";

	// outputContent.appendChild(outputHtml);
	console.log(outputHtml);


	//| FileType || Count || Count Internal || count external || Count by Initiator Type || Initiator Type Internal || Initiator Type external ||

	/*
	<table>
		<thead>
			<tr>
				<th>FileType</th>
				<th>Count</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<tr rowspan="x">JS</tr>
				<tr rowspan="x">4</tr>

			</tr>
		</tbody>
	</table>

	*/
});



/*
Logic for Resource Timing API Waterfall 
*/

onIFrameLoaded(function(){

	var calc = {
		"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.responseStart,
		"lastResponseEnd" : perfTiming.loadEventEnd - perfTiming.responseStart,
	};

	for (var perfProp in perfTiming) {
		if(perfTiming[perfProp] && typeof perfTiming[perfProp] === "number"){
			calc[perfProp] = perfTiming[perfProp] - perfTiming.navigationStart;
		}
	}

	var resourceSectionSegment = function(name, start, end, colour){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour
		}
	};

	var resourceSection = function(name, start, end, colour, segments, rawResource){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour,
			segments : segments,
			rawResource : rawResource
		}
	};


	var createLegend = function(className, title, dlArray){
		var legendHolder = newTag("div", {
			class : "legend-holder"
		});

		legendHolder.appendChild(newTag("h4", {
			text : title
		}));

		var dl = newTag("dl", {
			class : "legend " + className
		});

		dlArray.forEach(function(definition){
			dl.appendChild(newTag("dt", {
				class : "colorBoxHolder",
				childElement :  newTag("span", {}, "background:"+definition[1])
			}));
			dl.appendChild(newTag("dd", {
				text : definition[0]
			}));
		});
		legendHolder.appendChild(dl);

		return legendHolder;
	};

	var navigationApiTotal = [
		resourceSectionSegment("Unload", calc.unloadEventStart, calc.unloadEventEnd, "#909"),
		resourceSectionSegment("Redirect", calc.redirectStart, calc.redirectEnd, "#ffff60"),
		resourceSectionSegment("App cache", calc.fetchStart, calc.domainLookupStart, "#1f831f"),
		resourceSectionSegment("DNS", calc.domainLookupStart, calc.domainLookupEnd, "#1f7c83"),
		resourceSectionSegment("TCP", calc.connectStart, calc.connectEnd, "#e58226"),
		resourceSectionSegment("Timer to First Byte", calc.requestStart, calc.responseStart, "#1fe11f"),
		resourceSectionSegment("Response", calc.responseStart, calc.responseEnd, "#1977dd"),
		resourceSectionSegment("DOM Processing", calc.domLoading, calc.domComplete, "#9cc"),
		resourceSectionSegment("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "#d888df"),
		resourceSectionSegment("Onload Event", calc.loadEventStart, calc.loadEventEnd, "#c0c0ff")
	];

	if(calc.secureConnectionStart){
		navigationApiTotal.push(resourceSectionSegment("SSL", calc.connectStart, calc.secureConnectionStart, "#c141cd"));
	}
	if(calc.msFirstPaint){
		navigationApiTotal.push(resourceSectionSegment("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "#8FBC83"));
	}
	if(calc.domInteractive){
		navigationApiTotal.push(resourceSectionSegment("domInteractive Event", calc.domInteractive, calc.domInteractive, "#d888df"));
	}
	if(!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart){
		navigationApiTotal.push(resourceSectionSegment("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "#ffff60"));
	}

	calc.blocks = [
		resourceSection("Navigation API total", 0, calc.loadEventEnd, "#ccc", navigationApiTotal),
	];

	allResourcesCalc.forEach(function(resource, i){
		var segments = [
			resourceSectionSegment("Redirect", resource.redirectStart, resource.redirectEnd, "#ffff60"),
			resourceSectionSegment("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "#1f7c83"),
			resourceSectionSegment("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "#e58226"),
			resourceSectionSegment("secureConnect", resource.secureConnectionStart||undefined, resource.connectEnd, "#c141cd"),
			resourceSectionSegment("Timer to First Byte", resource.requestStart, resource.responseStart, "#1fe11f"),
			resourceSectionSegment("Content Download", resource.responseStart||undefined, resource.responseEnd, "#1977dd")
		];

		var resourceTimings = [0, resource.redirectStart, resource.domainLookupStart, resource.connectStart, resource.secureConnectionStart, resource.requestStart, resource.responseStart];

		var firstTiming = resourceTimings.reduce(function(currMinTiming, currentValue) {
			if(currentValue > 0 && (currentValue < currMinTiming || currMinTiming <= 0) && currentValue != resource.startTime){
				return currentValue;
			} else {
				return currMinTiming;
			}
		});

		if(resource.startTime < firstTiming){
			segments.unshift(resourceSectionSegment("Stalled/Blocking", resource.startTime, firstTiming, "#cdcdcd"));
		}

		calc.blocks.push(resourceSection(resource.name, Math.round(resource.startTime), Math.round(resource.responseEnd), getInitiatorTypeColour(resource.initiatorType), segments, resource));
		calc.lastResponseEnd = Math.max(calc.lastResponseEnd,resource.responseEnd);
	});

	calc.loadDuration = Math.round(calc.lastResponseEnd);

	var setupTimeLine = function(durationMs, blocks){
		var unit = durationMs / 100;
		var barsToShow = blocks.filter(function(block){
			return (typeof block.start == "number" && typeof block.total == "number");
		}).sort(function(a, b){
			return (a.start||0) - (b.start||0);
		});
		var maxMarkTextLength = marks.length > 0 ? marks.reduce(function(currMax, currValue) {
			return Math.max((typeof currMax == "number" ? currMax : 0), getNodeTextWidth( newTextElementNs(currValue.name, "0")));
		}) : 0;

		var diagramHeight = (barsToShow.length + 1) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

		var chartHolder = newTag("div", {
			class : "resource-timing water-fall-holder chart-holder"
		});
		var timeLineHolder = newElementNs("svg:svg", {
			height : Math.floor(chartHolderHeight),
			class : "water-fall-chart"
		});
		var timeLineLabelHolder = newElementNs("g", {class : "labels"});

		var endline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-end"
		});
		
		var startline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-start"
		});

		var onRectMouseEnter = function(evt){
			var targetRect = evt.target;
			addClass(targetRect, "active");
			var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
			var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";
			endline.x1.baseVal.valueAsString = xPosEnd;
			endline.x2.baseVal.valueAsString = xPosEnd;
			startline.x1.baseVal.valueAsString = xPosStart;
			startline.x2.baseVal.valueAsString = xPosStart;
			addClass(endline, "active");
			addClass(startline, "active");

			targetRect.parentNode.appendChild(endline);
			targetRect.parentNode.appendChild(startline);
		};

		var onRectMouseLeave = function(evt){
			removeClass(evt.target, "active");
			removeClass(endline, "active");
			removeClass(startline, "active");
		};

		var createRect = function(width, height, x, y, fill, label, segments){
			var rectHolder;
			var rect = newElementNs("rect", {
				width : (width / unit) + "%",
				height : height-1,
				x :  (x / unit) + "%",
				y : y,
				fill : fill,
				class : (segments && segments.length > 0) ? "time-block" : "segment"
			});
			if(label){
				rect.appendChild(newElementNs("title", {
					text : label
				})); // Add tile to wedge path
			}

			rect.addEventListener("mouseenter", onRectMouseEnter);
			rect.addEventListener("mouseleave", onRectMouseLeave);

			if(segments && segments.length > 0){
				rectHolder = newElementNs("g");
				rectHolder.appendChild(rect);
				segments.forEach(function(segment){
					if(segment.total > 0 && typeof segment.start === "number"){
						rectHolder.appendChild(createRect(segment.total, 8, segment.start||0.001, y,  segment.colour, segment.name + " (" + Math.round(segment.start) + "ms - " +  Math.round(segment.end) + "ms | total: " + Math.round(segment.total) + "ms)"));
					}
				});
				return rectHolder;
			}else{
				return rect;
			}
		};

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { class : "time-scale full-width" });
			for(var i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight);
				if(i > secs - 0.2){
					lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
					lineLabel.setAttribute("text-anchor", "end");
				}else{
					lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
				}
				
				var lineEl = newElementNs("line", {
					x1 : secPerc * i + "%",
					y1 : "0",
					x2 : secPerc * i + "%",
					y2 : diagramHeight
				});
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		
		var renderMarks = function(){
			var marksHolder = newElementNs("g", {
				transform : "scale(1, 1)",
				class : "marker-holder"
			});

			marks.forEach(function(mark, i){
				//mark.duration
				var markHolder = newElementNs("g", {
					class : "mark-holder"
				});
				var lineHolder = newElementNs("g", {
					class : "line-holder"
				});
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight + 25 );
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : 0,
					x2 : x + "%",
					y2 : diagramHeight
				}));

				if(marks[i-1] && mark.x - marks[i-1].x < 1){
					lineLabel.setAttribute("x", marks[i-1].x+1 + "%");
					mark.x = marks[i-1].x+1;
				}

				//would use polyline but can't use percentage for points 
				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : diagramHeight,
					x2 : mark.x + "%",
					y2 : diagramHeight + 23
				}));

				lineLabel.addEventListener("mouseenter", function(evt){
					addClass(lineHolder, "active");
					markHolder.parentNode.appendChild(markHolder);
				});
				lineLabel.addEventListener("mouseleave", function(evt){
					removeClass(lineHolder, "active");
				});

				markHolder.appendChild(newElementNs("title", {
					text : mark.name + " (" + Math.round(mark.startTime) + "ms)",
				}));
				markHolder.appendChild(lineHolder);
				markHolder.appendChild(lineLabel);
				marksHolder.appendChild(markHolder);
			});

			return marksHolder;
		};
		
		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function(block, i){
			var blockWidth = block.total||1;

			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)", block.segments));

			var blockLabel = newTextElementNs(block.name + " (" + block.total + "ms)", (y + 20));

			if(((block.total||1) / unit) > 10 && getNodeTextWidth(blockLabel) < 200){
				blockLabel.setAttribute("class", "inner-label");
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + 0.5 + "%");
				blockLabel.setAttribute("width", (blockWidth / unit) + "%");
			}else if(((block.start||0.001) / unit) + (blockWidth / unit) < 80){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + (blockWidth / unit) + 0.5 + "%");
			}else {
				blockLabel.setAttribute("x", (block.start||0.001) / unit - 0.5 + "%");
				blockLabel.setAttribute("text-anchor", "end"); 
			}
			blockLabel.style.opacity = block.name.match(/js.map$/) ? "0.5" : "1";
			timeLineLabelHolder.appendChild(blockLabel);
		});

		timeLineHolder.appendChild(timeLineLabelHolder);
		
		chartHolder.appendChild(newTag("h1", {
			text : "Resource Timing"
		}));
		chartHolder.appendChild(timeLineHolder);

		chartHolder.appendChild(newTag("h3", {
			text : "Legend"
		}));

		var legendsHolder = newTag("div", {
			class : "legends-group "
		});

		legendsHolder.appendChild(createLegend("initiator-type-legend", "Block color: Initiator Type", [
			["css", "#afd899"],
			["iframe", "#85b3f2"],
			["img", "#bc9dd6"],
			["script", "#e7bd8c"],
			["link", "#89afe6"],
			["swf", "#4db3ba"],
			//["font", "#e96859"],
			["xmlhttprequest", "#e7d98c"]
		]));

		legendsHolder.appendChild(createLegend("navigation-legend", "Navigation Timing", [
			["Redirect", "#ffff60"],
			["App Cache","#1f831f"],
			["DNS Lookup", "#1f7c83"],
			["TCP","#e58226"],
			["SSL Negotiation","#c141cd"],
			["Time to First Byte", "#1fe11f"],
			["Content Download", "#1977dd"],
			["DOM Processing", "#9cc"],
			["DOM Content Loaded", "#d888df"],
			["On Load", "#c0c0ff"]
		]));

		legendsHolder.appendChild(createLegend("resource-legend", "Resource Timing", [
			["Stalled/Blocking", "#cdcdcd"],
			["Redirect", "#ffff60"],
			["App Cache","#1f831f"],
			["DNS Lookup", "#1f7c83"],
			["TCP","#e58226"],
			["SSL Negotiation","#c141cd"],
			["Initial Connection (TCP)", "#e58226"],
			["Time to First Byte", "#1fe11f"],
			["Content Download", "#1977dd"]
		]));

		chartHolder.appendChild(legendsHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine(calc.loadDuration, calc.blocks);
});



/*
Footer that finally outputs the data to the DOM and the console
*/

//add charts to iFrame holder in body
onIFrameLoaded(function(){
	outputIFrame.body.appendChild(outputHolder);
	iFrameEl.style.height = outputHolder.clientHeight + "px";
});


// also output the data as table in console
tablesToLog.forEach(function(table, i){
	if(table.data.length > 0 && console.table){
		// console.log("\n\n\n" + table.name + ":");
		// console.table(table.data, table.columns);
	}
});

})();