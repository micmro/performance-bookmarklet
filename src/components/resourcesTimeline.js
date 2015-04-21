/*
Logic for Resource Timing API Waterfall 
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";
import waterfall from "../helpers/waterfall";

var resourcesTimelineComponent = {};

var getChartData = function(filter){
	var calc = {
		"pageLoadTime" : data.perfTiming.loadEventEnd - data.perfTiming.responseStart,
		"lastResponseEnd" : data.perfTiming.loadEventEnd - data.perfTiming.responseStart,
	};


	for (let perfProp in data.perfTiming) {
		if(data.perfTiming[perfProp] && typeof data.perfTiming[perfProp] === "number"){
			calc[perfProp] = data.perfTiming[perfProp] - data.perfTiming.navigationStart;
		}
	}

	var onDomLoad = waterfall.timeBlock("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "block-dom-content-loaded");
	var onLoadEvt = waterfall.timeBlock("Onload Event", calc.loadEventStart, calc.loadEventEnd, "block-onload");
	var navigationApiTotal = [
		waterfall.timeBlock("Unload", calc.unloadEventStart, calc.unloadEventEnd, "block-unload"),
		waterfall.timeBlock("Redirect", calc.redirectStart, calc.redirectEnd, "block-redirect"),
		waterfall.timeBlock("App cache", calc.fetchStart, calc.domainLookupStart, "block-appcache"),
		waterfall.timeBlock("DNS", calc.domainLookupStart, calc.domainLookupEnd, "block-dns"),
		waterfall.timeBlock("TCP", calc.connectStart, calc.connectEnd, "block-tcp"),
		waterfall.timeBlock("Timer to First Byte", calc.requestStart, calc.responseStart, "block-ttfb"),
		waterfall.timeBlock("Response", calc.responseStart, calc.responseEnd, "block-response"),
		waterfall.timeBlock("DOM Processing", calc.domLoading, calc.domComplete, "block-dom"),
		onDomLoad,
		onLoadEvt
	];

	if(calc.secureConnectionStart){
		navigationApiTotal.push(waterfall.timeBlock("SSL", calc.connectStart, calc.secureConnectionStart, "block-ssl"));
	}
	if(calc.msFirstPaint){
		navigationApiTotal.push(waterfall.timeBlock("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if(calc.domInteractive){
		navigationApiTotal.push(waterfall.timeBlock("domInteractive Event", calc.domInteractive, calc.domInteractive, "block-dom-interactive-event"));
	}
	if(!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart){
		navigationApiTotal.push(waterfall.timeBlock("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "block-redirect"));
	}

	calc.blocks = [
		waterfall.timeBlock("Navigation API total", 0, calc.loadEventEnd, "block-navigation-api-total", navigationApiTotal),
	];

	data.allResourcesCalc.filter((resource) => {
			//do not show items up to 15 seconds after onload - else beacon ping etc make diagram useless
			return resource.startTime < (calc.loadEventEnd + 15000)
		})
		.filter(filter||(() => true))
		.forEach((resource, i) => {
			var segments = [
				waterfall.timeBlock("Redirect", resource.redirectStart, resource.redirectEnd, "block-redirect"),
				waterfall.timeBlock("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "block-dns"),
				waterfall.timeBlock("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "block-dns"),
				waterfall.timeBlock("secureConnect", resource.secureConnectionStart||undefined, resource.connectEnd, "block-ssl"),
				waterfall.timeBlock("Timer to First Byte", resource.requestStart, resource.responseStart, "block-ttfb"),
				waterfall.timeBlock("Content Download", resource.responseStart||undefined, resource.responseEnd, "block-response")
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
				segments.unshift(waterfall.timeBlock("Stalled/Blocking", resource.startTime, firstTiming, "block-blocking"));
			}

			calc.blocks.push(waterfall.timeBlock(resource.name, resource.startTime, resource.responseEnd, "block-" + resource.initiatorType, segments, resource));
			calc.lastResponseEnd = Math.max(calc.lastResponseEnd,resource.responseEnd);
		});

	return {
		loadDuration : Math.round(Math.max(calc.lastResponseEnd, (data.perfTiming.loadEventEnd-data.perfTiming.navigationStart))),
		blocks : calc.blocks,
		bg : [
			onDomLoad,
			onLoadEvt
		]
	};
};

resourcesTimelineComponent.init = function(){
	var chartData = getChartData();
	var chartHolder = waterfall.setupTimeLine(chartData.loadDuration, chartData.blocks, data.marks, chartData.bg, "Resource Timing");

	if(data.requestsByDomain.length > 1){
		var selectBox = dom.newTag("select", {
			class : "domain-selector",
			onchange : function(){
				var domain = this.options[this.selectedIndex].value;
				if(domain === "all"){
					chartData = getChartData();
				}else{
					chartData = getChartData((resource) => resource.domain === domain);
				}
				var tempChartHolder = waterfall.setupTimeLine(chartData.loadDuration, chartData.blocks, data.marks, chartData.bg, "Temp");
				var oldSVG = chartHolder.getElementsByClassName("water-fall-chart")[0];
				var newSVG = tempChartHolder.getElementsByClassName("water-fall-chart")[0];
				chartHolder.replaceChild(newSVG, oldSVG);
			}
		});

		selectBox.appendChild(dom.newTag("option", {
			text : "show all",
			value : "all"
		}));

		data.requestsByDomain.forEach((domain) => {
			selectBox.appendChild(dom.newTag("option", {
				text : domain.domain
			}));
		});
		var chartSvg = chartHolder.getElementsByClassName("water-fall-chart")[0];
		chartSvg.parentNode.insertBefore(selectBox, chartSvg);
	}

	return chartHolder;
};

export default resourcesTimelineComponent;
