/*
Logic for Naviagtion Timing API and Markers Waterfall
*/

import data from "../data";
import helper from "../helpers/helpers";
import svg from "../helpers/svg";
import dom from "../helpers/dom";
import tableLogger from "../helpers/tableLogger";
import waterfall from "../helpers/waterfall";

var navigationTimelineComponent = {};

navigationTimelineComponent.init = function(){

	const startTime = data.perfTiming.navigationStart;
	var perfTimingCalc = {
			"pageLoadTime" : data.perfTiming.loadEventEnd - data.perfTiming.navigationStart,
			"output" : []
		},
		propBaseName;

	for(let perfProp in data.perfTiming) {
		if(data.perfTiming[perfProp] && typeof data.perfTiming[perfProp] === "number"){
			perfTimingCalc[perfProp] = data.perfTiming[perfProp] - startTime;
			perfTimingCalc.output.push({
				"name" : perfProp,
				"time (ms)" : data.perfTiming[perfProp] - startTime
			});
		}
	}

	perfTimingCalc.output.sort((a, b) => (a["time (ms)"]||0) - (b["time (ms)"]||0));

	var timeBlock = function(name, start, end, cssClass){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			cssClass : cssClass
		}
	};

	perfTimingCalc.blocks = [
		timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "block-total"),
		timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "block-unload"),
		timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "block-redirect"),
		timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "block-appcache"),
		timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "block-dns"),
		timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "block-tcp"),
		timeBlock("Time to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "block-ttfb"),
		timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "block-response"),
		timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "block-dom"),
		timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "block-dom-content-loaded"),
		timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "block-onload")
	];

	if(perfTimingCalc.secureConnectionStart){
		perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "block-ssl"));
	}
	if(perfTimingCalc.msFirstPaint){
		perfTimingCalc.blocks.push(timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if(perfTimingCalc.domInteractive){
		perfTimingCalc.blocks.push(timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "block-dom-interactive-event"));
	}
	if(!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart){
		perfTimingCalc.blocks.push(timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "block-redirect"));
	}

	perfTimingCalc.blocks.push(timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "block-network-server"));

	//add measures to be added as bars
	data.measures.forEach((measure) => {
		perfTimingCalc.blocks.push(timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "block-custom-measure"));
	});
	
	tableLogger.logTables([
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output},
		{name: "Marks", data : data.marks, columns : ["name", "startTime", "duration"]}
	]);

	return waterfall.setupTimeLine(Math.round(perfTimingCalc.pageLoadTime), perfTimingCalc.blocks, data.marks, undefined, "Navigation Timing");
};

export default navigationTimelineComponent;
