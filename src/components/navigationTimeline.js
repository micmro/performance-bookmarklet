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
	data.measures.forEach((measure) => {
		perfTimingCalc.blocks.push(timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "#f00"));
	});
	
	tableLogger.logTables([
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output},
		{name: "Marks", data : data.marks, columns : ["name", "startTime", "duration"]}
	]);

	return waterfall.setupTimeLine(Math.round(perfTimingCalc.pageLoadTime), perfTimingCalc.blocks, "Navigation Timing");
};

export default navigationTimelineComponent;
