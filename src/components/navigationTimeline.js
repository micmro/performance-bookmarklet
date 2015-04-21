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

	perfTimingCalc.blocks = [
		waterfall.timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "block-total"),
		waterfall.timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "block-unload"),
		waterfall.timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "block-redirect"),
		waterfall.timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "block-appcache"),
		waterfall.timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "block-dns"),
		waterfall.timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "block-tcp"),
		waterfall.timeBlock("Time to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "block-ttfb"),
		waterfall.timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "block-response"),
		waterfall.timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "block-dom"),
		waterfall.timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "block-dom-content-loaded"),
		waterfall.timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "block-onload")
	];

	if(perfTimingCalc.secureConnectionStart){
		perfTimingCalc.blocks.push(waterfall.timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "block-ssl"));
	}
	if(perfTimingCalc.msFirstPaint){
		perfTimingCalc.blocks.push(waterfall.timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if(perfTimingCalc.domInteractive){
		perfTimingCalc.blocks.push(waterfall.timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "block-dom-interactive-event"));
	}
	if(!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart){
		perfTimingCalc.blocks.push(waterfall.timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "block-redirect"));
	}

	perfTimingCalc.blocks.push(waterfall.timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "block-network-server"));

	//add measures to be added as bars
	data.measures.forEach((measure) => {
		perfTimingCalc.blocks.push(waterfall.timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "block-custom-measure"));
	});
	
	tableLogger.logTables([
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output},
		{name: "Marks", data : data.marks, columns : ["name", "startTime", "duration"]}
	]);

	return waterfall.setupTimeLine(Math.round(perfTimingCalc.pageLoadTime), perfTimingCalc.blocks, data.marks, [], "Navigation Timing");
};

export default navigationTimelineComponent;
