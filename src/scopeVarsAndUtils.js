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
		console.log("xxxxxx", currR.initiatorType);
		var currRes = {
			name : currR.name,
			domain : urlFragments[1],
			initiatorType : currR.initiatorType || fileExtension || "SourceMap or Not Defined",
			fileExtension : fileExtension || "XHR or Not Defined",
			loadtime : currR.duration,
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

var getInitiatorTypeColour = function(initiatorType, fallbackColour){
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
	return colour;
};


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
