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

	var resourceSectionSegment = function(name, start, end, cssClass){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			cssClass : cssClass
		}
	};

	var resourceSection = function(name, start, end, cssClass, segments, rawResource){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			cssClass : cssClass,
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

	var onDomLoad = resourceSectionSegment("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "block-dom-content-loaded");
	var onLoadEvt = resourceSectionSegment("Onload Event", calc.loadEventStart, calc.loadEventEnd, "block-onload");
	var navigationApiTotal = [
		resourceSectionSegment("Unload", calc.unloadEventStart, calc.unloadEventEnd, "block-unload"),
		resourceSectionSegment("Redirect", calc.redirectStart, calc.redirectEnd, "block-redirect"),
		resourceSectionSegment("App cache", calc.fetchStart, calc.domainLookupStart, "block-appcache"),
		resourceSectionSegment("DNS", calc.domainLookupStart, calc.domainLookupEnd, "block-dns"),
		resourceSectionSegment("TCP", calc.connectStart, calc.connectEnd, "block-tcp"),
		resourceSectionSegment("Timer to First Byte", calc.requestStart, calc.responseStart, "block-ttfb"),
		resourceSectionSegment("Response", calc.responseStart, calc.responseEnd, "block-response"),
		resourceSectionSegment("DOM Processing", calc.domLoading, calc.domComplete, "block-dom"),
		onDomLoad,
		onLoadEvt
	];

	if(calc.secureConnectionStart){
		navigationApiTotal.push(resourceSectionSegment("SSL", calc.connectStart, calc.secureConnectionStart, "block-ssl"));
	}
	if(calc.msFirstPaint){
		navigationApiTotal.push(resourceSectionSegment("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if(calc.domInteractive){
		navigationApiTotal.push(resourceSectionSegment("domInteractive Event", calc.domInteractive, calc.domInteractive, "block-dom-interactive-event"));
	}
	if(!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart){
		navigationApiTotal.push(resourceSectionSegment("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "block-redirect"));
	}

	calc.blocks = [
		resourceSection("Navigation API total", 0, calc.loadEventEnd, "block-navigation-api-total", navigationApiTotal),
	];

	data.allResourcesCalc.filter((resource) => {
			//do not show items up to 15 seconds after onload - else beacon ping etc make diagram useless
			return resource.startTime < (calc.loadEventEnd + 15000)
		}).forEach((resource, i) => {
			var segments = [
				resourceSectionSegment("Redirect", resource.redirectStart, resource.redirectEnd, "block-redirect"),
				resourceSectionSegment("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "block-dns"),
				resourceSectionSegment("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "block-dns"),
				resourceSectionSegment("secureConnect", resource.secureConnectionStart||undefined, resource.connectEnd, "block-ssl"),
				resourceSectionSegment("Timer to First Byte", resource.requestStart, resource.responseStart, "block-ttfb"),
				resourceSectionSegment("Content Download", resource.responseStart||undefined, resource.responseEnd, "block-response")
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
				segments.unshift(resourceSectionSegment("Stalled/Blocking", resource.startTime, firstTiming, "block-blocking"));
			}

			calc.blocks.push(resourceSection(resource.name, resource.startTime, resource.responseEnd, "block-" + resource.initiatorType, segments, resource));
			calc.lastResponseEnd = Math.max(calc.lastResponseEnd,resource.responseEnd);
		});

	calc.loadDuration = Math.round(Math.max(calc.lastResponseEnd, (data.perfTiming.loadEventEnd-data.perfTiming.navigationStart)));


	var chartHolder = waterfall.setupTimeLine(calc.loadDuration, calc.blocks, data.marks, [
			onDomLoad,
			onLoadEvt
		], "Resource Timing");

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
