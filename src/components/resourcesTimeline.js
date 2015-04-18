/*
Logic for Resource Timing API Waterfall 
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";
import waterfall from "../helpers/waterfall";

var resourcesTimelineComponent = {};

resourcesTimelineComponent.init = function(){

	var calc = {
		"pageLoadTime" : data.perfTiming.loadEventEnd - data.perfTiming.responseStart,
		"lastResponseEnd" : data.perfTiming.loadEventEnd - data.perfTiming.responseStart,
	};

	for (let perfProp in data.perfTiming) {
		if(data.perfTiming[perfProp] && typeof data.perfTiming[perfProp] === "number"){
			calc[perfProp] = data.perfTiming[perfProp] - data.perfTiming.navigationStart;
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
		var legendHolder = dom.newTag("div", {
			class : "legend-holder"
		});

		legendHolder.appendChild(dom.newTag("h4", {
			text : title
		}));

		var dl = dom.newTag("dl", {
			class : "legend " + className
		});

		dlArray.forEach((definition) => {
			dl.appendChild(dom.newTag("dt", {
				class : "colorBoxHolder",
				childElement :  dom.newTag("span", {}, "background:"+definition[1])
			}));
			dl.appendChild(dom.newTag("dd", {
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

	data.allResourcesCalc.forEach((resource, i) => {
		var segments = [
			resourceSectionSegment("Redirect", resource.redirectStart, resource.redirectEnd, "#ffff60"),
			resourceSectionSegment("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "#1f7c83"),
			resourceSectionSegment("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "#e58226"),
			resourceSectionSegment("secureConnect", resource.secureConnectionStart||undefined, resource.connectEnd, "#c141cd"),
			resourceSectionSegment("Timer to First Byte", resource.requestStart, resource.responseStart, "#1fe11f"),
			resourceSectionSegment("Content Download", resource.responseStart||undefined, resource.responseEnd, "#1977dd")
		];

		var resourceTimings = [0, resource.redirectStart, resource.domainLookupStart, resource.connectStart, resource.secureConnectionStart, resource.requestStart, resource.responseStart];

		var firstTiming = resourceTimings.reduce((currMinTiming, currentValue) => {
			if(currentValue > 0 && (currentValue < currMinTiming || currMinTiming <= 0) && currentValue != resource.startTime){
				return currentValue;
			} else {
				return currMinTiming;
			}
		});

		if(resource.startTime < firstTiming){
			segments.unshift(resourceSectionSegment("Stalled/Blocking", resource.startTime, firstTiming, "#cdcdcd"));
		}

		calc.blocks.push(resourceSection(resource.name, Math.round(resource.startTime), Math.round(resource.responseEnd), helper.getInitiatorOrFileTypeColour(resource.initiatorType), segments, resource));
		calc.lastResponseEnd = Math.max(calc.lastResponseEnd,resource.responseEnd);
	});

	calc.loadDuration = Math.round(calc.lastResponseEnd);


	var chartHolder = waterfall.setupTimeLine(calc.loadDuration, calc.blocks, "Resource Timing");

	chartHolder.appendChild(dom.newTag("h3", {
		text : "Legend"
	}));

	var legendsHolder = dom.newTag("div", {
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

	return chartHolder;
};

export default resourcesTimelineComponent;
