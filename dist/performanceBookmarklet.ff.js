/* https://github.com/micmro/performance-bookmarklet by Michael Mrowetz @MicMro
   build:06/12/2015 */

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Logic for Legned
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var dom = _interopRequire(require("../helpers/dom"));

var waterfall = _interopRequire(require("../helpers/waterfall"));

var legendComponent = {};

var createLegend = function createLegend(className, title, dlArray) {
	var legendHolder = dom.newTag("div", {
		"class": "legend-holder"
	});

	legendHolder.appendChild(dom.newTag("h4", {
		text: title
	}));

	var dl = dom.newTag("dl", {
		"class": "legend " + className
	});

	dlArray.forEach(function (definition) {
		dl.appendChild(dom.newTag("dt", {
			"class": "colorBoxHolder",
			childElement: dom.newTag("span", {}, "background:" + definition[1])
		}));
		dl.appendChild(dom.newTag("dd", {
			text: definition[0]
		}));
	});
	legendHolder.appendChild(dl);

	return legendHolder;
};

//Legend
legendComponent.init = function () {

	var chartHolder = dom.newTag("section", {
		"class": "resource-timing chart-holder"
	});

	chartHolder.appendChild(dom.newTag("h3", {
		text: "Legend"
	}));

	var legendsHolder = dom.newTag("div", {
		"class": "legends-group "
	});

	legendsHolder.appendChild(createLegend("initiator-type-legend", "Block color: Initiator Type", [["css", "#afd899"], ["iframe", "#85b3f2"], ["img", "#bc9dd6"], ["script", "#e7bd8c"], ["link", "#89afe6"], ["swf", "#4db3ba"],
	//["font", "#e96859"],
	["xmlhttprequest", "#e7d98c"]]));

	legendsHolder.appendChild(createLegend("navigation-legend", "Navigation Timing", [["Redirect", "#ffff60"], ["App Cache", "#1f831f"], ["DNS Lookup", "#1f7c83"], ["TCP", "#e58226"], ["SSL Negotiation", "#c141cd"], ["Time to First Byte", "#1fe11f"], ["Content Download", "#1977dd"], ["DOM Processing", "#9cc"], ["DOM Content Loaded", "#d888df"], ["On Load", "#c0c0ff"]]));

	legendsHolder.appendChild(createLegend("resource-legend", "Resource Timing", [["Stalled/Blocking", "#cdcdcd"], ["Redirect", "#ffff60"], ["App Cache", "#1f831f"], ["DNS Lookup", "#1f7c83"], ["TCP", "#e58226"], ["SSL Negotiation", "#c141cd"], ["Initial Connection (TCP)", "#e58226"], ["Time to First Byte", "#1fe11f"], ["Content Download", "#1977dd"]]));

	chartHolder.appendChild(legendsHolder);

	return chartHolder;
};

module.exports = legendComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/waterfall":17}],2:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Logic for Naviagtion Timing API and Markers Waterfall
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var svg = _interopRequire(require("../helpers/svg"));

var dom = _interopRequire(require("../helpers/dom"));

var tableLogger = _interopRequire(require("../helpers/tableLogger"));

var waterfall = _interopRequire(require("../helpers/waterfall"));

var navigationTimelineComponent = {};

navigationTimelineComponent.init = function () {

	var startTime = data.perfTiming.navigationStart;
	var perfTimingCalc = {
		pageLoadTime: data.perfTiming.loadEventEnd - data.perfTiming.navigationStart,
		output: []
	},
	    propBaseName;

	for (var perfProp in data.perfTiming) {
		if (data.perfTiming[perfProp] && typeof data.perfTiming[perfProp] === "number") {
			perfTimingCalc[perfProp] = data.perfTiming[perfProp] - startTime;
			perfTimingCalc.output.push({
				name: perfProp,
				"time (ms)": data.perfTiming[perfProp] - startTime
			});
		}
	}

	perfTimingCalc.output.sort(function (a, b) {
		return (a["time (ms)"] || 0) - (b["time (ms)"] || 0);
	});

	perfTimingCalc.blocks = [waterfall.timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "block-total"), waterfall.timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "block-unload"), waterfall.timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "block-redirect"), waterfall.timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "block-appcache"), waterfall.timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "block-dns"), waterfall.timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "block-tcp"), waterfall.timeBlock("Time to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "block-ttfb"), waterfall.timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "block-response"), waterfall.timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "block-dom"), waterfall.timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "block-dom-content-loaded"), waterfall.timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "block-onload")];

	if (perfTimingCalc.secureConnectionStart) {
		perfTimingCalc.blocks.push(waterfall.timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "block-ssl"));
	}
	if (perfTimingCalc.msFirstPaint) {
		perfTimingCalc.blocks.push(waterfall.timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if (perfTimingCalc.domInteractive) {
		perfTimingCalc.blocks.push(waterfall.timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "block-dom-interactive-event"));
	}
	if (!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart) {
		perfTimingCalc.blocks.push(waterfall.timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "block-redirect"));
	}

	perfTimingCalc.blocks.push(waterfall.timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "block-network-server"));

	//add measures to be added as bars
	data.measures.forEach(function (measure) {
		perfTimingCalc.blocks.push(waterfall.timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "block-custom-measure"));
	});

	tableLogger.logTables([{ name: "Navigation Timeline", data: perfTimingCalc.blocks, columns: ["name", "start", "end", "total"] }, { name: "Navigation Events", data: perfTimingCalc.output }, { name: "Marks", data: data.marks, columns: ["name", "startTime", "duration"] }]);

	return waterfall.setupTimeLine(Math.round(perfTimingCalc.pageLoadTime), perfTimingCalc.blocks, data.marks, [], "Navigation Timing");
};

module.exports = navigationTimelineComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/svg":15,"../helpers/tableLogger":16,"../helpers/waterfall":17}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Section to allow persistance of subset values
*/

var dom = _interopRequire(require("../helpers/dom"));

// import data from "../data";

var persistance = _interopRequire(require("../helpers/persistance"));

var pageMetricComponent = {};

//init UI
pageMetricComponent.init = function () {
	//persistance is off by default
	var persistanceEnabled = persistance.persistanceEnabled();

	var chartHolder = dom.newTag("section", {
		"class": "page-metric chart-holder"
	});
	chartHolder.appendChild(dom.newTag("h3", { text: "Persist Data" }));

	var persistDataCheckboxLabel = dom.newTag("label", { text: " Persist Data?" });
	var persistDataCheckbox = dom.newTag("input", {
		type: "checkbox",
		id: "persist-data-checkbox",
		checked: persistanceEnabled
	});
	var printDataButton = dom.newTag("button", { text: "Dumb data to console", disabled: !persistanceEnabled });

	//hook up events
	persistDataCheckbox.addEventListener("change", function (evt) {
		var checked = evt.target.checked;
		if (checked) {
			persistance.activatePersistance();
			printDataButton.disabled = false;
		} else if (window.confirm("this will wipe out all stored data")) {
			persistance.deactivatePersistance();
			printDataButton.disabled = true;
		} else {
			evt.target.checked = true;
		}
	});
	persistDataCheckboxLabel.insertBefore(persistDataCheckbox, persistDataCheckboxLabel.firstChild);

	printDataButton.addEventListener("click", function (evt) {
		persistance.dump(false);
	});

	chartHolder.appendChild(persistDataCheckboxLabel);
	chartHolder.appendChild(printDataButton);

	if (persistanceEnabled) {
		persistance.saveLatestMetrics();
	}

	return chartHolder;
};

module.exports = pageMetricComponent;
},{"../helpers/dom":9,"../helpers/persistance":12}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Logic for Request analysis pie charts
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var svg = _interopRequire(require("../helpers/svg"));

var dom = _interopRequire(require("../helpers/dom"));

var pieChartHelpers = _interopRequire(require("../helpers/pieChartHelpers"));

var pieChartComponent = {};

pieChartComponent.init = function () {

	var chartsHolder = dom.newTag("div", {
		"class": "pie-charts-holder chart-holder"
	});

	// create a chart and table section
	var setupChart = function (title, chartData, countTexts, columns, id) {
		var chartHolder = dom.newTag("div", {
			"class": "pie-chart-holder",
			id: id || ""
		});
		chartHolder.appendChild(dom.newTag("h1", { text: title }));
		chartHolder.appendChild(pieChartHelpers.createPieChart(chartData, 400));
		chartHolder.appendChild(dom.newTag("p", { text: "Total Requests: " + data.requestsOnly.length }));
		if (countTexts && countTexts.length) {
			countTexts.forEach(function (countText) {
				chartHolder.appendChild(dom.newTag("p", { text: countText }, "margin-top:-1em"));
			});
		}
		chartHolder.appendChild(pieChartHelpers.createChartTable(title, chartData, columns));
		chartsHolder.appendChild(chartHolder);
	};

	// init data for charts

	var requestsUnit = data.requestsOnly.length / 100;
	var colourRangeR = "789abcdef";
	var colourRangeG = "789abcdef";
	var colourRangeB = "789abcdef";

	//argument data
	var requestsByDomainData = data.requestsByDomain.map(function (sourceDomain) {
		var domain = helper.clone(sourceDomain);
		domain.perc = domain.count / requestsUnit;
		domain.label = domain.domain;
		if (domain.domain === location.host) {
			domain.colour = "#0c0";
		} else if (domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".")) {
			domain.colour = "#0a0";
		} else {
			domain.colour = helper.getRandomColor("56789abcdef", "01234567", "abcdef");
		}
		domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
		domain.durationAverage = Math.round(domain.durationTotal / domain.count);
		domain.durationTotal = Math.round(domain.durationTotal);
		domain.durationTotalParallel = Math.round(domain.durationTotalParallel);
		return domain;
	});

	setupChart("Requests by Domain", requestsByDomainData, ["Domains Total: " + data.requestsByDomain.length], [{ name: "Requests", field: "count" }, { name: "Avg. Duration (ms)", field: "durationAverage" }, { name: "Duration Parallel (ms)", field: "durationTotalParallel" }, { name: "Duration Sum (ms)", field: "durationTotal" }], "pie-request-by-domain");

	setupChart("Requests by Initiator Type", data.initiatorTypeCounts.map(function (initiatorype) {
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = helper.getInitiatorOrFileTypeColour(initiatorype.initiatorType, helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		initiatorype.id = "reqByInitiatorType-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}));

	setupChart("Requests by Initiator Type (host/external domain)", data.initiatorTypeCountHostExt.map(function (initiatorype) {
		var typeSegments = initiatorype.initiatorType.split(" ");
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = helper.getInitiatorOrFileTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		initiatorype.id = "reqByInitiatorTypeLocEx-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}), ["Requests to Host: " + data.hostRequests, "Host: " + location.host]);

	setupChart("Requests by File Type", data.fileTypeCounts.map(function (fileType) {
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getInitiatorOrFileTypeColour(fileType.fileType, helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	setupChart("Requests by File Type (host/external domain)", data.fileTypeCountHostExt.map(function (fileType) {
		var typeSegments = fileType.fileType.split(" ");
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getInitiatorOrFileTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}), ["Requests to Host: " + data.hostRequests, "Host: " + location.host]);

	return chartsHolder;
};

module.exports = pieChartComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/pieChartHelpers":13,"../helpers/svg":15}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Logic for Resource Timing API Waterfall
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var dom = _interopRequire(require("../helpers/dom"));

var waterfall = _interopRequire(require("../helpers/waterfall"));

var resourcesTimelineComponent = {};

var getChartData = function getChartData(filter) {
	var calc = {
		pageLoadTime: data.perfTiming.loadEventEnd - data.perfTiming.responseStart,
		lastResponseEnd: data.perfTiming.loadEventEnd - data.perfTiming.responseStart };

	for (var perfProp in data.perfTiming) {
		if (data.perfTiming[perfProp] && typeof data.perfTiming[perfProp] === "number") {
			calc[perfProp] = data.perfTiming[perfProp] - data.perfTiming.navigationStart;
		}
	}

	var onDomLoad = waterfall.timeBlock("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "block-dom-content-loaded");
	var onLoadEvt = waterfall.timeBlock("Onload Event", calc.loadEventStart, calc.loadEventEnd, "block-onload");
	var navigationApiTotal = [waterfall.timeBlock("Unload", calc.unloadEventStart, calc.unloadEventEnd, "block-unload"), waterfall.timeBlock("Redirect", calc.redirectStart, calc.redirectEnd, "block-redirect"), waterfall.timeBlock("App cache", calc.fetchStart, calc.domainLookupStart, "block-appcache"), waterfall.timeBlock("DNS", calc.domainLookupStart, calc.domainLookupEnd, "block-dns"), waterfall.timeBlock("TCP", calc.connectStart, calc.connectEnd, "block-tcp"), waterfall.timeBlock("Timer to First Byte", calc.requestStart, calc.responseStart, "block-ttfb"), waterfall.timeBlock("Response", calc.responseStart, calc.responseEnd, "block-response"), waterfall.timeBlock("DOM Processing", calc.domLoading, calc.domComplete, "block-dom"), onDomLoad, onLoadEvt];

	if (calc.secureConnectionStart) {
		navigationApiTotal.push(waterfall.timeBlock("SSL", calc.connectStart, calc.secureConnectionStart, "block-ssl"));
	}
	if (calc.msFirstPaint) {
		navigationApiTotal.push(waterfall.timeBlock("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "block-ms-first-paint-event"));
	}
	if (calc.domInteractive) {
		navigationApiTotal.push(waterfall.timeBlock("domInteractive Event", calc.domInteractive, calc.domInteractive, "block-dom-interactive-event"));
	}
	if (!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart) {
		navigationApiTotal.push(waterfall.timeBlock("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "block-redirect"));
	}

	calc.blocks = [waterfall.timeBlock("Navigation API total", 0, calc.loadEventEnd, "block-navigation-api-total", navigationApiTotal)];

	data.allResourcesCalc.filter(function (resource) {
		//do not show items up to 15 seconds after onload - else beacon ping etc make diagram useless
		return resource.startTime < calc.loadEventEnd + 15000;
	}).filter(filter || function () {
		return true;
	}).forEach(function (resource, i) {
		var segments = [waterfall.timeBlock("Redirect", resource.redirectStart, resource.redirectEnd, "block-redirect"), waterfall.timeBlock("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "block-dns"), waterfall.timeBlock("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "block-dns"), waterfall.timeBlock("secureConnect", resource.secureConnectionStart || undefined, resource.connectEnd, "block-ssl"), waterfall.timeBlock("Timer to First Byte", resource.requestStart, resource.responseStart, "block-ttfb"), waterfall.timeBlock("Content Download", resource.responseStart || undefined, resource.responseEnd, "block-response")];

		var resourceTimings = [0, resource.redirectStart, resource.domainLookupStart, resource.connectStart, resource.secureConnectionStart, resource.requestStart, resource.responseStart];

		var firstTiming = resourceTimings.reduce(function (currMinTiming, currentValue) {
			if (currentValue > 0 && (currentValue < currMinTiming || currMinTiming <= 0) && currentValue != resource.startTime) {
				return currentValue;
			} else {
				return currMinTiming;
			}
		});

		if (resource.startTime < firstTiming) {
			segments.unshift(waterfall.timeBlock("Stalled/Blocking", resource.startTime, firstTiming, "block-blocking"));
		}

		calc.blocks.push(waterfall.timeBlock(resource.name, resource.startTime, resource.responseEnd, "block-" + resource.initiatorType, segments, resource));
		calc.lastResponseEnd = Math.max(calc.lastResponseEnd, resource.responseEnd);
	});

	return {
		loadDuration: Math.round(Math.max(calc.lastResponseEnd, data.perfTiming.loadEventEnd - data.perfTiming.navigationStart)),
		blocks: calc.blocks,
		bg: [onDomLoad, onLoadEvt]
	};
};

resourcesTimelineComponent.init = function () {
	var chartData = getChartData();
	var chartHolder = waterfall.setupTimeLine(chartData.loadDuration, chartData.blocks, data.marks, chartData.bg, "Resource Timing");

	if (data.requestsByDomain.length > 1) {
		var selectBox = dom.newTag("select", {
			"class": "domain-selector",
			onchange: function onchange() {
				var domain = this.options[this.selectedIndex].value;
				if (domain === "all") {
					chartData = getChartData();
				} else {
					chartData = getChartData(function (resource) {
						return resource.domain === domain;
					});
				}
				var tempChartHolder = waterfall.setupTimeLine(chartData.loadDuration, chartData.blocks, data.marks, chartData.bg, "Temp");
				var oldSVG = chartHolder.getElementsByClassName("water-fall-chart")[0];
				var newSVG = tempChartHolder.getElementsByClassName("water-fall-chart")[0];
				chartHolder.replaceChild(newSVG, oldSVG);
			}
		});

		selectBox.appendChild(dom.newTag("option", {
			text: "show all",
			value: "all"
		}));

		data.requestsByDomain.forEach(function (domain) {
			selectBox.appendChild(dom.newTag("option", {
				text: domain.domain
			}));
		});
		var chartSvg = chartHolder.getElementsByClassName("water-fall-chart")[0];
		chartSvg.parentNode.insertBefore(selectBox, chartSvg);
	}

	return chartHolder;
};

module.exports = resourcesTimelineComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/waterfall":17}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Tiles to summarize page performance
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var dom = _interopRequire(require("../helpers/dom"));

var summaryTilesComponent = {};

summaryTilesComponent.init = function () {

	var createTile = function createTile(title, value, titleFontSize) {
		titleFontSize = titleFontSize || 60;
		var dl = dom.newTag("dl", {
			"class": "summary-tile"
		});
		dl.appendChild(dom.newTag("dt", { childElement: title }));
		dl.appendChild(dom.newTag("dd", { childElement: value }, "font-size:" + titleFontSize + "px;"));
		return dl;
	};

	var createAppendixDefValue = function createAppendixDefValue(a, definition, value) {
		a.appendChild(dom.newTag("dt", { childElement: definition }));
		a.appendChild(dom.newTag("dd", { text: value }));
	};

	var tilesHolder = dom.newTag("section", {
		"class": "tiles-holder chart-holder"
	});
	var appendix = dom.newTag("dl", {
		"class": "summary-tile-appendix"
	});

	[createTile("Requests", data.requestsOnly.length || "0"), createTile("Domains", data.requestsByDomain.length || "0"), createTile(dom.combineNodes("Subdomains of ", dom.newTag("abbr", { title: "Top Level Domain", text: "TLD" })), data.hostSubdomains || "0"), createTile(dom.combineNodes("Requests to ", dom.newTag("span", { title: location.host, text: "Host" })), data.hostRequests || "0"), createTile(dom.combineNodes(dom.newTag("abbr", { title: "Top Level Domain", text: "TLD" }), " & Subdomain Requests"), data.currAndSubdomainRequests || "0"), createTile("Total", data.perfTiming.loadEventEnd - data.perfTiming.navigationStart + "ms", 40), createTile("Time to First Byte", data.perfTiming.responseStart - data.perfTiming.navigationStart + "ms", 40), createTile(dom.newTag("span", { title: "domLoading to domContentLoadedEventStart", text: "DOM Content Loading" }), data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading + "ms", 40), createTile(dom.newTag("span", { title: "domLoading to loadEventStart", text: "DOM Processing" }), data.perfTiming.domComplete - data.perfTiming.domLoading + "ms", 40)].forEach(function (tile) {
		tilesHolder.appendChild(tile);
	});

	if (data.allResourcesCalc.length > 0) {
		tilesHolder.appendChild(createTile(dom.newTag("span", { title: data.slowestCalls[0].name, text: "Slowest Call" }), dom.newTag("span", { title: data.slowestCalls[0].name, text: Math.floor(data.slowestCalls[0].duration) + "ms" }), 40));
		tilesHolder.appendChild(createTile("Average Call", data.average + "ms", 40));
	}

	createAppendixDefValue(appendix, dom.newTag("abbr", { title: "Top Level Domain", text: "TLD" }, location.host.split(".").slice(-2).join(".")));
	createAppendixDefValue(appendix, dom.newTextNode("Host:"), location.host);
	createAppendixDefValue(appendix, dom.newTextNode("document.domain:"), document.domain);

	tilesHolder.appendChild(appendix);
	return tilesHolder;
};

module.exports = summaryTilesComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Logic for Request analysis table
*/

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var dom = _interopRequire(require("../helpers/dom"));

var tableComponent = {};

tableComponent.init = function () {

	var output = data.requestsOnly.reduce(function (collectObj, currR) {
		var fileTypeData = collectObj[currR.fileType],
		    initiatorTypeData;

		if (!fileTypeData) {
			fileTypeData = collectObj[currR.fileType] = {
				fileType: currR.fileType,
				count: 0,
				initiatorType: {},
				requestsToHost: 0,
				requestsToExternal: 0
			};
		}

		initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType];
		if (!initiatorTypeData) {
			initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType] = {
				initiatorType: currR.initiatorType,
				count: 0,
				requestsToHost: 0,
				requestsToExternal: 0
			};
		}

		fileTypeData.count++;
		initiatorTypeData.count++;

		if (currR.isRequestToHost) {
			fileTypeData.requestsToHost++;
			initiatorTypeData.requestsToHost++;
		} else {
			fileTypeData.requestsToExternal++;
			initiatorTypeData.requestsToExternal++;
		}

		return collectObj;
	}, {});

	var sectionHolder = dom.newTag("section", {
		"class": "table-section-holder chart-holder"
	});
	sectionHolder.appendChild(dom.newTag("h1", { text: "Request FileTypes & Initiators" }));

	sectionHolder.appendChild(dom.tableFactory("filetypes-and-intiators-table", function (theadTr) {
		["FileType", "Count", "Count Internal", "Count External", "Initiator Type", "Count by Initiator Type", "Initiator Type Internal", "Initiator Type External"].forEach(function (x) {
			theadTr.appendChild(dom.newTag("th", {
				text: x,
				width: x.indexOf("ternal") > 0 ? "12%" : ""
			}));
		});
		return theadTr;
	}, function (tbody) {
		Object.keys(output).forEach(function (key, i) {
			var fileTypeData = output[key],
			    initiatorTypeKeys = Object.keys(fileTypeData.initiatorType),
			    firstinitiatorTypeKey = fileTypeData.initiatorType[initiatorTypeKeys[0]],
			    rowspan = initiatorTypeKeys.length;

			var tr = dom.newTag("tr", {
				"class": "file-type-row " + (fileTypeData.fileType || "other") + "-light"
			});

			[fileTypeData.fileType, fileTypeData.count, fileTypeData.requestsToHost, fileTypeData.requestsToExternal, firstinitiatorTypeKey.initiatorType, firstinitiatorTypeKey.count, firstinitiatorTypeKey.requestsToHost, firstinitiatorTypeKey.requestsToExternal].forEach(function (val, i) {
				var settings = {
					text: val
				};
				if (i < 4 && initiatorTypeKeys.length > 1) {
					settings.rowSpan = rowspan;
				} else if (i >= 4) {
					settings["class"] = (initiatorTypeKeys[0] || "other") + "-light";
				}
				tr.appendChild(dom.newTag("td", settings));
			});

			tbody.appendChild(tr);

			initiatorTypeKeys.slice(1).forEach(function (initiatorTypeKey) {
				var initiatorTypeData = fileTypeData.initiatorType[initiatorTypeKey];
				var tr2 = dom.newTag("tr", {
					"class": "initiator-type-more " + (initiatorTypeKey || "other") + "-light"
				});
				tr2.appendChild(dom.newTag("td", {
					text: initiatorTypeKey
				}));
				tr2.appendChild(dom.newTag("td", {
					text: initiatorTypeData.count
				}));
				tr2.appendChild(dom.newTag("td", {
					text: initiatorTypeData.requestsToHost
				}));
				tr2.appendChild(dom.newTag("td", {
					text: initiatorTypeData.requestsToExternal
				}));

				tbody.appendChild(tr2);
			});
		});

		return tbody;
	}));

	return sectionHolder;
};

module.exports = tableComponent;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var helper = _interopRequire(require("./helpers/helpers"));

var data = {
	resources: [],
	marks: [],
	measures: [],
	perfTiming: [],
	allResourcesCalc: []
};

var isValid = true;

data.isValid = function () {
	return isValid;
};

//Check if the browser suppots the timing APIs
if (window.performance && window.performance.getEntriesByType !== undefined) {
	data.resources = window.performance.getEntriesByType("resource");
	data.marks = window.performance.getEntriesByType("mark");
	data.measures = window.performance.getEntriesByType("measure");
} else if (window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	data.resources = window.performance.webkitGetEntriesByType("resource");
	data.marks = window.performance.webkitGetEntriesByType("mark");
	data.measures = window.performance.webkitGetEntriesByType("measure");
} else {
	alert("Oups, looks like this browser does not support the Resource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	isValid = false;
	return;
}

if (window.performance.timing) {
	data.perfTiming = window.performance.timing;
} else {
	alert("Oups, looks like this browser does not support performance timing");
	isValid = false;
	return;
}

if (data.perfTiming.loadEventEnd - data.perfTiming.navigationStart < 0) {
	alert("Page is still loading - please try again when page is loaded.");
	isValid = false;
	return;
}

data.allResourcesCalc = data.resources
//remove this bookmarklet from the result
.filter(function (currR) {
	return !currR.name.match(/http[s]?\:\/\/(micmro|nurun).github.io\/performance-bookmarklet\/.*/);
}).map(function (currR, i, arr) {
	//crunch the resources data into something easier to work with
	var isRequest = currR.name.indexOf("http") === 0;
	var urlFragments, maybeFileName, fileExtension;

	if (isRequest) {
		urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
		maybeFileName = urlFragments[2].split("/").pop();
		fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1);
	} else {
		urlFragments = ["", location.host];
		fileExtension = currR.name.split(":")[0];
	}

	var currRes = {
		name: currR.name,
		domain: urlFragments[1],
		initiatorType: currR.initiatorType || fileExtension || "SourceMap or Not Defined",
		fileExtension: fileExtension || "XHR or Not Defined",
		loadtime: currR.duration,
		fileType: helper.getFileType(fileExtension, currR.initiatorType),
		isRequestToHost: urlFragments[1] === location.host
	};

	for (var attr in currR) {
		if (typeof currR[attr] !== "function") {
			currRes[attr] = currR[attr];
		}
	}

	if (currR.requestStart) {
		currRes.requestStartDelay = currR.requestStart - currR.startTime;
		currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
		currRes.tcp = currR.connectEnd - currR.connectStart;
		currRes.ttfb = currR.responseStart - currR.startTime;
		currRes.requestDuration = currR.responseStart - currR.requestStart;
	}
	if (currR.secureConnectionStart) {
		currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
	}

	return currRes;
});

//filter out non-http[s] and sourcemaps
data.requestsOnly = data.allResourcesCalc.filter(function (currR) {
	return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
});

//get counts
data.initiatorTypeCounts = helper.getItemCount(data.requestsOnly.map(function (currR, i, arr) {
	return currR.initiatorType || currR.fileExtension;
}), "initiatorType");

data.initiatorTypeCountHostExt = helper.getItemCount(data.requestsOnly.map(function (currR, i, arr) {
	return (currR.initiatorType || currR.fileExtension) + " " + (currR.isRequestToHost ? "(host)" : "(external)");
}), "initiatorType");

data.requestsByDomain = helper.getItemCount(data.requestsOnly.map(function (currR, i, arr) {
	return currR.domain;
}), "domain");

data.fileTypeCountHostExt = helper.getItemCount(data.requestsOnly.map(function (currR, i, arr) {
	return currR.fileType + " " + (currR.isRequestToHost ? "(host)" : "(external)");
}), "fileType");

data.fileTypeCounts = helper.getItemCount(data.requestsOnly.map(function (currR, i, arr) {
	return currR.fileType;
}), "fileType");

var tempResponseEnd = {};
//TODO: make immutable
data.requestsOnly.forEach(function (currR) {
	var entry = data.requestsByDomain.filter(function (a) {
		return a.domain == currR.domain;
	})[0] || {};

	var lastResponseEnd = tempResponseEnd[currR.domain] || 0;

	currR.duration = entry.duration || currR.responseEnd - currR.startTime;

	if (lastResponseEnd <= currR.startTime) {
		entry.durationTotalParallel = (entry.durationTotalParallel || 0) + currR.duration;
	} else if (lastResponseEnd < currR.responseEnd) {
		entry.durationTotalParallel = (entry.durationTotalParallel || 0) + (currR.responseEnd - lastResponseEnd);
	}
	tempResponseEnd[currR.domain] = currR.responseEnd || 0;
	entry.durationTotal = (entry.durationTotal || 0) + currR.duration;
});

//Request counts
data.hostRequests = data.requestsOnly.filter(function (domain) {
	return domain.domain === location.host;
}).length;

data.currAndSubdomainRequests = data.requestsOnly.filter(function (domain) {
	return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
}).length;

data.crossDocDomainRequests = data.requestsOnly.filter(function (domain) {
	return !helper.endsWith(domain.domain, document.domain);
}).length;

data.hostSubdomains = data.requestsByDomain.filter(function (domain) {
	return helper.endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
}).length;

data.slowestCalls = [];
data.average = undefined;

if (data.allResourcesCalc.length > 0) {
	data.slowestCalls = data.allResourcesCalc.filter(function (a) {
		return a.name !== location.href;
	}).sort(function (a, b) {
		return b.duration - a.duration;
	});

	data.average = Math.floor(data.slowestCalls.reduceRight(function (a, b) {
		if (typeof a !== "number") {
			return a.duration + b.duration;
		}
		return a + b.duration;
	}) / data.slowestCalls.length);
}

module.exports = data;
},{"./helpers/helpers":10}],9:[function(require,module,exports){
/*
DOM Helpers
*/
"use strict";

var dom = {};

dom.newTextNode = function (text) {
	return document.createTextNode(text);
};

//creat html tag
dom.newTag = function (tagName, settings, css) {
	settings = settings || {};
	var tag = document.createElement(tagName);
	for (var attr in settings) {
		if (attr != "text") {
			tag[attr] = settings[attr];
		}
	}
	if (settings.text) {
		tag.textContent = settings.text;
	} else if (settings.childElement) {
		if (typeof settings.childElement === "object") {
			//if childNodes NodeList is passed in
			if (settings.childElement instanceof NodeList) {
				//NodeList is does not inherit from array
				Array.prototype.slice.call(settings.childElement, 0).forEach(function (childNode) {
					tag.appendChild(childNode);
				});
			} else {
				tag.appendChild(settings.childElement);
			}
		} else {
			tag.appendChild(dom.newTextNode(settings.childElement));
		}
	}
	if (settings["class"]) {
		tag.className = settings["class"];
	}
	tag.style.cssText = css || "";
	return tag;
};

dom.tableFactory = function (id, headerBuilder, rowBuilder) {
	var tableHolder = dom.newTag("div", {
		id: id || "",
		"class": "table-holder"
	});
	var table = dom.newTag("table");
	var thead = dom.newTag("thead");

	thead.appendChild(headerBuilder(dom.newTag("tr")));
	table.appendChild(thead);
	table.appendChild(rowBuilder(dom.newTag("tbody")));
	tableHolder.appendChild(table);
	return tableHolder;
};

dom.combineNodes = function (a, b) {
	var wrapper = document.createElement("div");
	if (typeof a === "object") {
		wrapper.appendChild(a);
	} else if (typeof a === "string") {
		wrapper.appendChild(dom.newTextNode(a));
	}
	if (typeof b === "object") {
		wrapper.appendChild(b);
	} else if (typeof b === "string") {
		wrapper.appendChild(dom.newTextNode(b));
	}
	return wrapper.childNodes;
};

dom.addClass = function (el, className) {
	if (el.classList) {
		el.classList.add(className);
	} else {
		// IE doesn't support classList in SVG - also no need for dublication check i.t.m.
		el.setAttribute("class", el.getAttribute("class") + " " + className);
	}
	return el;
};

dom.removeClass = function (el, className) {
	if (el.classList) {
		el.classList.remove(className);
	} else {
		//IE doesn't support classList in SVG - also no need for dublication check i.t.m.
		el.setAttribute("class", el.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
	}
	return el;
};

module.exports = dom;
},{}],10:[function(require,module,exports){
/*
Misc helpers
*/

"use strict";

var helper = {};

//extract a resources file type
helper.getFileType = function (fileExtension, initiatorType) {
	if (fileExtension) {
		switch (fileExtension) {
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "webp":
			case "svg":
			case "ico":
				return "image";
			case "js":
				return "js";
			case "css":
				return "css";
			case "html":
				return "html";
			case "woff":
			case "woff2":
			case "ttf":
			case "eot":
			case "otf":
				return "font";
			case "swf":
				return "flash";
			case "map":
				return "source-map";
		}
	}
	if (initiatorType) {
		switch (initiatorType) {
			case "xmlhttprequest":
				return "ajax";
			case "img":
				return "image";
			case "script":
				return "js";
			case "internal":
			case "iframe":
				return "html"; //actual page
			default:
				return "other";
		}
	}
	return initiatorType;
};

helper.getRandomColor = function (baseRangeRed, baseRangeGreen, baseRangeBlue) {
	var range = [baseRangeRed || "0123456789ABCDEF", baseRangeGreen || "0123456789ABCDEF", baseRangeBlue || "0123456789ABCDEF"];
	var color = "#",
	    r = 0;

	for (var i = 0; i < 6; i++) {
		r = Math.floor(i / 2);
		color += range[r].split("")[Math.floor(Math.random() * range[r].length)];
	}
	return color;
};

helper.endsWith = function (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getColourVariation = function getColourVariation(hexColour, variation) {
	var r = (parseInt(hexColour.substr(1, 2), 16) + variation).toString(16),
	    g = (parseInt(hexColour.substr(3, 2), 16) + variation).toString(16),
	    b = (parseInt(hexColour.substr(5, 2), 16) + variation).toString(16);
	return "#" + r + g + b;
};

helper.getInitiatorOrFileTypeColour = function (initiatorOrFileType, fallbackColour, variation) {
	var colour = fallbackColour || "#bebebe"; //default

	//colour the resources by initiator or file type
	switch (initiatorOrFileType) {
		case "css":
			colour = "#afd899";break;
		case "iframe":
		case "html":
			colour = "#85b3f2";break;
		case "img":
		case "image":
			colour = "#bc9dd6";break;
		case "script":
		case "js":
			colour = "#e7bd8c";break;
		case "link":
			colour = "#89afe6";break;
		case "swf":
			colour = "#4db3ba";break;
		case "font":
			colour = "#e96859";break; //TODO check if this works
		case "xmlhttprequest":
		case "ajax":
			colour = "#e7d98c";break;
	}
	if (variation === true) {
		return getColourVariation(colour, -5);
	}
	return colour;
};

//counts occurences of items in array arr and returns them as array of key valure pairs
//keyName overwrites the name of the key attribute
helper.getItemCount = function (arr, keyName) {
	var counts = {},
	    resultArr = [],
	    obj;

	arr.forEach(function (key) {
		counts[key] = counts[key] ? counts[key] + 1 : 1;
	});

	//pivot data
	for (var fe in counts) {
		obj = {};
		obj[keyName || "key"] = fe;
		obj.count = counts[fe];

		resultArr.push(obj);
	}
	return resultArr.sort(function (a, b) {
		return a.count < b.count ? 1 : -1;
	});
};

helper.clone = function (obj) {
	var copy;

	// Handle the 3 simple types, and null or undefined
	if (null == obj || "object" != typeof obj) return obj;

	// Handle Date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = helper.clone(obj[i]);
		}
		return copy;
	}

	// Handle Object
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = helper.clone(obj[attr]);
		}
		return copy;
	}

	throw new Error("Unable to helper.clone obj");
};

module.exports = helper;
},{}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
iFrame and holder logic
*/

var dom = _interopRequire(require("../helpers/dom"));

var style = require("../helpers/style").style;

var iFrameHolder = {};

var iFrameEl, outputIFrame, outputHolder, outputContent;

//setup iFrame overlay
var initHolderEl = function initHolderEl() {
	// find or create holder element
	if (!outputHolder) {
		outputHolder = dom.newTag("div", { id: "perfbook-holder" });
		outputContent = dom.newTag("div", { id: "perfbook-content" });
		window.outputContent;

		var closeBtn = dom.newTag("button", {
			"class": "perfbook-close",
			text: "close"
		});
		closeBtn.addEventListener("click", function () {
			iFrameEl.parentNode.removeChild(iFrameEl);
		});

		outputHolder.appendChild(closeBtn);
		outputHolder.appendChild(outputContent);
	} else {
		outputContent = outputIFrame.getElementById("perfbook-content");
		//clear existing data
		while (outputContent.firstChild) {
			outputContent.removeChild(outputContent.firstChild);
		}
	}
};

var addComponent = function addComponent(domEl) {
	outputContent.appendChild(domEl);
};

iFrameHolder.setup = function (onIFrameReady) {

	iFrameEl = document.getElementById("perfbook-iframe");

	var finalize = function finalize() {
		initHolderEl();
		onIFrameReady(addComponent);
		outputIFrame.body.appendChild(outputHolder);
		if (getComputedStyle(document.body).overflow != "hidden") {
			iFrameEl.style.height = outputHolder.clientHeight + 36 + "px";
		} else {
			iFrameEl.style.height = "100%";
		}
	};

	if (iFrameEl) {
		outputIFrame = iFrameEl.contentWindow.document;
		outputHolder = outputIFrame.getElementById("perfbook-holder");

		initHolderEl();

		onIFrameReady(addComponent);

		finalize();
	} else {
		iFrameEl = dom.newTag("iframe", {
			id: "perfbook-iframe",
			onload: function onload() {
				outputIFrame = iFrameEl.contentWindow.document;

				//add style to iFrame
				var styleTag = dom.newTag("style", {
					type: "text/css",
					text: style
				});

				outputIFrame.head.appendChild(styleTag);
				finalize();
			}
		}, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index:6543210; width:98%; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
		document.body.appendChild(iFrameEl);
	}
};

iFrameHolder.getOutputIFrame = function () {
	return outputIFrame;
};

module.exports = iFrameHolder;
},{"../helpers/dom":9,"../helpers/style":14}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var dom = _interopRequire(require("../helpers/dom"));

var data = _interopRequire(require("../data"));

var storageKey = "performance-bookmarklet-metrics";

var persistance = {};

var getMetrics = function getMetrics() {
	return {
		timestamp: new Date(data.perfTiming.navigationStart).toISOString(),
		url: window.location.href,
		requests: data.requestsOnly.length,
		domains: data.requestsByDomain.length,
		subDomainsOfTld: data.hostSubdomains,
		requestsToHost: data.hostRequests,
		tldAndSubdomainRequests: data.currAndSubdomainRequests,
		total: data.perfTiming.loadEventEnd - data.perfTiming.navigationStart,
		timeToFirstByte: data.perfTiming.responseStart - data.perfTiming.navigationStart,
		domContentLoading: data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading,
		domProcessing: data.perfTiming.domComplete - data.perfTiming.domLoading
	};
};

var getStoredValues = function getStoredValues() {
	alert("Not impemented");
	// return JSON.parse(localStorage.getItem(storageKey)) || [];
};

persistance.persistanceEnabled = function () {};

persistance.activatePersistance = function () {
	persistance.saveLatestMetrics();
};

persistance.deactivatePersistance = function () {
	persistance.dump();
};

persistance.saveLatestMetrics = function (metrics) {
	alert("Not impemented");
	// var data = getStoredValues();
	// data.push(getMetrics());
	// localStorage.setItem(storageKey, JSON.stringify(data));
};

/**
* Dump the current page metrics from the data store to the console.
*
* Example:
*    PerformanceBookmarklet.PageMetric.dump(); // Dumps the data as TSV and clears the data store.
*    PerformanceBookmarklet.PageMetric.dump(false); // Dumps the data as CSV and retains the data.
*
* @param [Boolean] clear Should the data be cleared from the data store?
*/
persistance.dump = function () {
	var clear = arguments[0] === undefined ? true : arguments[0];

	alert("Not impemented");
};

module.exports = persistance;

// return !!JSON.parse(localStorage.getItem(storageKey));
},{"../data":8,"../helpers/dom":9}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var data = _interopRequire(require("../data"));

var helper = _interopRequire(require("../helpers/helpers"));

var svg = _interopRequire(require("../helpers/svg"));

var dom = _interopRequire(require("../helpers/dom"));

var pieChartHelpers = {};

var unit = Math.PI * 2 / 100;

var createWedge = function createWedge(id, size, startAngle, percentage, labelTxt, colour) {
	var radius = size / 2,
	    endAngle = startAngle + (percentage * unit - 0.001),
	    labelAngle = startAngle + (percentage / 2 * unit - 0.001),
	    x1 = radius + radius * Math.sin(startAngle),
	    y1 = radius - radius * Math.cos(startAngle),
	    x2 = radius + radius * Math.sin(endAngle),
	    y2 = radius - radius * Math.cos(endAngle),
	    x3 = radius + radius * 0.85 * Math.sin(labelAngle),
	    y3 = radius - radius * 0.85 * Math.cos(labelAngle),
	    big = endAngle - startAngle > Math.PI ? 1 : 0;

	var d = "M " + radius + "," + radius + // Start at circle center
	" L " + x1 + "," + y1 + // Draw line to (x1,y1)
	" A " + radius + "," + radius + // Draw an arc of radius r
	" 0 " + big + " 1 " + // Arc details...
	x2 + "," + y2 + // Arc goes to to (x2,y2)
	" Z"; // Close path back to (cx,cy)

	var path = svg.newEl("path", {
		id: id,
		d: d,
		fill: colour
	});

	path.appendChild(svg.newEl("title", {
		text: labelTxt
	})); // Add tile to wedge path
	path.addEventListener("mouseenter", function (evt) {
		evt.target.style.opacity = "0.5";
		evt.target.ownerDocument.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
	});
	path.addEventListener("mouseleave", function (evt) {
		evt.target.style.opacity = "1";
		evt.target.ownerDocument.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
	});

	if (percentage > 10) {
		var wedgeLabel = svg.newTextEl(labelTxt, y3);

		//first half or second half
		if (labelAngle < Math.PI) {
			wedgeLabel.setAttribute("x", x3 - svg.getNodeTextWidth(wedgeLabel));
		} else {
			wedgeLabel.setAttribute("x", x3);
		}

		return { path: path, wedgeLabel: wedgeLabel, endAngle: endAngle };
	}
	return { path: path, endAngle: endAngle };
};

var chartMaxHeight = (function () {
	var contentWidth = window.innerWidth * 0.98 - 64;
	if (contentWidth < 700) {
		return 350;
	} else if (contentWidth < 800) {
		return contentWidth / 2 - 72;
	} else {
		return contentWidth / 3 - 72;
	}
})();

pieChartHelpers.createPieChart = function (data, size) {
	//inpired by http://jsfiddle.net/da5LN/62/

	var startAngle = 0,
	    // init startAngle
	chart = svg.newEl("svg:svg", {
		viewBox: "0 0 " + size + " " + size,
		"class": "pie-chart"
	}, "max-height:" + chartMaxHeight + "px;"),
	    labelWrap = svg.newEl("g", {}, "pointer-events:none; font-weight:bold;"),
	    wedgeWrap = svg.newEl("g");

	//loop through data and create wedges
	data.forEach(function (dataObj) {
		var wedgeData = createWedge(dataObj.id, size, startAngle, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || helper.getRandomColor());
		wedgeWrap.appendChild(wedgeData.path);
		startAngle = wedgeData.endAngle;

		if (wedgeData.wedgeLabel) {
			labelWrap.appendChild(wedgeData.wedgeLabel);
		}
	});

	// foreground circle
	wedgeWrap.appendChild(svg.newEl("circle", {
		cx: size / 2,
		cy: size / 2,
		r: size * 0.05,
		fill: "#fff"
	}));
	chart.appendChild(wedgeWrap);
	chart.appendChild(labelWrap);
	return chart;
};

pieChartHelpers.createChartTable = function (title, data, columns) {
	columns = columns || [{ name: "Requests", field: "count" }];

	//create table
	return dom.tableFactory("", function (thead) {
		thead.appendChild(dom.newTag("th", { text: title, "class": "text-left" }));
		columns.forEach(function (column) {
			thead.appendChild(dom.newTag("th", { text: column.name, "class": "text-right" }));
		});
		thead.appendChild(dom.newTag("th", { text: "Percentage", "class": "text-right" }));

		return thead;
	}, function (tbody) {
		data.forEach(function (y) {
			var row = dom.newTag("tr", { id: y.id + "-table" });
			row.appendChild(dom.newTag("td", { text: y.label }));
			columns.forEach(function (column) {
				row.appendChild(dom.newTag("td", { text: y[column.field].toString(), "class": "text-right" }));
			});
			row.appendChild(dom.newTag("td", { text: y.perc.toPrecision(2) + "%", "class": "text-right" }));
			tbody.appendChild(row);
		});
		return tbody;
	});
};

module.exports = pieChartHelpers;
},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/svg":15}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var style = "body {overflow: auto; background: #fff; font:normal 12px/18px sans-serif; color:#333;} * {box-sizing:border-box;} svg {font:normal 12px/18px sans-serif;} th {text-align: left;} button {cursor:pointer;} button:disabled {cursor:default;} #perfbook-holder {overflow: hidden; width:100%; padding:1em 2em;} #perfbook-content {position:relative;} .perfbook-close {position:absolute; top:0; right:0; padding:1em; z-index:1; background:transparent; border:0; cursor:pointer;} .full-width {width:100%;} .chart-holder {margin: 5em 0;} h1 {font:bold 18px/18px sans-serif; margin:1em 0; color:#666;} .text-right {text-align: right;} .text-left {text-align: left;} .css {background: #afd899;} .iframe, .html, .internal {background: #85b3f2;} .img, .image {background: #bc9dd6;} .script, .js {background: #e7bd8c;} .link {background: #89afe6;} .swf, .flash {background: #4db3ba;} .font {background: #e96859;} .xmlhttprequest, .ajax {background: #e7d98c;} .other {background: #bebebe;} .css-light {background: #b9cfa0;} .iframe-light, .html-light, .internal-light {background: #c2d9f9;} .img-light, .image-light {background: #deceeb;} .script-light, .js-light {background: #f3dec6;} .link-light {background: #c4d7f3;} .swf-light, .flash-light {background: #a6d9dd;} .font-light {background: #f4b4ac;} .xmlhttprequest-light, .ajax-light {background: #f3ecc6;} .other-light {background: #dfdfdf;} .block-css {fill: #afd899;} .block-iframe, .block-html, .block-internal {fill: #85b3f2;} .block-img, .block-image {fill: #bc9dd6;} .block-script, .block-js {fill: #e7bd8c;} .block-link {fill: #89afe6;} .block-swf, .block-flash {fill: #4db3ba;} .block-font {fill: #e96859;} .block-xmlhttprequest, .block-ajax {fill: #e7d98c;} .block-other {fill: #bebebe;} .block-total {fill: #ccc;} .block-unload {fill: #909;} .block-redirect {fill: #ffff60;} .block-appcache {fill: #1f831f;} .block-dns {fill: #1f7c83;} .block-tcp {fill: #e58226;} .block-ttfb {fill: #1fe11f;} .block-response {fill: #1977dd;} .block-dom {fill: #9cc;} .block-dom-content-loaded {fill: #d888df;} .block-onload {fill: #c0c0ff;} .block-ssl {fill: #c141cd; } .block-ms-first-paint-event {fill: #8fbc83; } .block-dom-interactive-event {fill: #d888df; } .block-network-server {fill: #8cd18c; } .block-custom-measure {fill: #f00; } .block-navigation-api-total {fill: #ccc;} .block-blocking {fill: #cdcdcd;} .block-undefined {fill: #0f0;} .tiles-holder {margin: 2em -18px 2em 0; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .summary-tile { flex-grow: 1; width:250px; background:#ddd; padding: 1em; margin:0 18px 1em 0; color:#666; text-align:center;} .summary-tile dt {font-weight:bold; font-size:16px; display:block; line-height:1.2em; min-height:2.9em; padding:0 0 0.5em;} .summary-tile dd {font-weight:bold; line-height:60px; margin:0;} .summary-tile-appendix {float:left; clear:both; width:100%; font-size:10px; line-height:1.1em; color:#666;} .summary-tile-appendix dt {float:left; clear:both;} .summary-tile-appendix dd {float:left; margin:0 0 0 1em;} .pie-charts-holder {margin-right: -72px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap;} .pie-chart-holder {flex-grow: 1; width:350px; max-width: 600px; margin: 0 72px 0 0;} .pie-chart-holder h1 {min-height:2em;} .pie-chart {width:100%;} .table-holder {overflow-x:auto} .table-holder table {float:left; width:100%; font-size:12px; line-height:18px;} .table-holder th, .table-holder td {line-height: 1em; margin:0; padding:0.25em 0.5em 0.25em 0;} #pie-request-by-domain {flex-grow: 2; width:772px; max-width: 1272px;} #filetypes-and-intiators-table {margin: 2em 0 5em;} #filetypes-and-intiators-table table {vertical-align: middle; border-collapse: collapse;} #filetypes-and-intiators-table td {padding:0.5em; border-right: solid 1px #fff;} #filetypes-and-intiators-table td:last-child {padding-right: 0; border-right:0;} #filetypes-and-intiators-table .file-type-row td {border-top: solid 10px #fff;} #filetypes-and-intiators-table .file-type-row:first-child td {border-top: none;} .water-fall-holder {fill:#ccc;} .water-fall-chart {width:100%; background:#f0f5f0;} .water-fall-chart .marker-holder {width:100%;} .water-fall-chart .line-holder {stroke-width:1; stroke: #ccc; stroke-opacity:0.5;} .water-fall-chart .line-holder.active {stroke: #69009e; stroke-width:2; stroke-opacity:1;} .water-fall-chart .labels {width:100%;} .water-fall-chart .labels .inner-label {pointer-events: none;} .water-fall-chart .time-block.active {opacity: 0.8;} .water-fall-chart .line-end, .water-fall-chart .line-start {display: none; stroke-width:1; stroke-opacity:0.5; stroke: #000;} .water-fall-chart .line-end.active, .water-fall-chart .line-start.active {display: block;} .water-fall-chart .mark-holder text {-webkit-writing-mode: tb; writing-mode:vertical-lr; writing-mode: tb;} .time-scale line {stroke:#0cc; stroke-width:1;} .time-scale text {font-weight:bold;} .domain-selector {float:right; margin: -35px 0 0 0;} .navigation-timing {} .legends-group { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .legends-group .legend-holder { flex-grow: 1; width:250px; padding:0 1em 1em; } .legends-group .legend-holder h4 { margin: 0; padding: 0; } .legend dt {float: left; clear: left; padding: 0 0 0.5em;} .legend dd {float: left; display: inline-block; margin: 0 1em; line-height: 1em;} .legend .colorBoxHolder span {display: inline-block; width: 15px; height: 1em;} .page-metric {} .page-metric button {margin-left: 2em;}";
exports.style = style;
},{}],15:[function(require,module,exports){
/*
SVG Helpers
*/

"use strict";

var getOutputIFrame = require("../helpers/iFrameHolder").getOutputIFrame;

var svg = {};

svg.newEl = function (tagName, settings, css) {
	var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	settings = settings || {};
	for (var attr in settings) {
		if (attr != "text") {
			el.setAttributeNS(null, attr, settings[attr]);
		}
	}
	el.textContent = settings.text || "";
	el.style.cssText = css || "";
	return el;
};

svg.newTextEl = function (text, y, css) {
	return svg.newEl("text", {
		fill: "#111",
		y: y,
		text: text
	}, (css || "") + " text-shadow:0 0 4px #fff;");
};

//needs access to iFrame
svg.getNodeTextWidth = function (textNode) {
	var tmp = svg.newEl("svg:svg", {}, "visibility:hidden;");
	tmp.appendChild(textNode);
	getOutputIFrame().body.appendChild(tmp);

	var nodeWidth = textNode.getBBox().width;
	tmp.parentNode.removeChild(tmp);
	return nodeWidth;
};

module.exports = svg;
},{"../helpers/iFrameHolder":11}],16:[function(require,module,exports){
/*
Log tables in console
*/

"use strict";

var tableLogger = {};

tableLogger.logTable = function (table) {
	if (table.data.length > 0 && console.table) {
		console.log("\n\n\n" + table.name + ":");
		console.table(table.data, table.columns);
	}
};

tableLogger.logTables = function (tableArr) {
	tableArr.forEach(tableLogger.logTable);
};

module.exports = tableLogger;
},{}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
Helper to create waterfall timelines
*/

var svg = _interopRequire(require("../helpers/svg"));

var dom = _interopRequire(require("../helpers/dom"));

var waterfall = {};

//model for block and segment
waterfall.timeBlock = function (name, start, end, cssClass, segments, rawResource) {
	return {
		name: name,
		start: start,
		end: end,
		total: typeof start !== "number" || typeof end !== "number" ? undefined : end - start,
		cssClass: cssClass,
		segments: segments,
		rawResource: rawResource
	};
};

waterfall.setupTimeLine = function (durationMs, blocks, marks, lines, title) {
	var unit = durationMs / 100,
	    barsToShow = blocks.filter(function (block) {
		return typeof block.start == "number" && typeof block.total == "number";
	}).sort(function (a, b) {
		return (a.start || 0) - (b.start || 0);
	}),
	    maxMarkTextLength = marks.length > 0 ? marks.reduce(function (currMax, currValue) {
		return Math.max(typeof currMax == "number" ? currMax : 0, svg.getNodeTextWidth(svg.newTextEl(currValue.name, "0")));
	}) : 0,
	    diagramHeight = (barsToShow.length + 1) * 25,
	    chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

	var chartHolder = dom.newTag("section", {
		"class": "resource-timing water-fall-holder chart-holder"
	});
	var timeLineHolder = svg.newEl("svg:svg", {
		height: Math.floor(chartHolderHeight),
		"class": "water-fall-chart"
	});
	var timeLineLabelHolder = svg.newEl("g", { "class": "labels" });

	var endline = svg.newEl("line", {
		x1: "0",
		y1: "0",
		x2: "0",
		y2: diagramHeight,
		"class": "line-end"
	});

	var startline = svg.newEl("line", {
		x1: "0",
		y1: "0",
		x2: "0",
		y2: diagramHeight,
		"class": "line-start"
	});

	var onRectMouseEnter = function onRectMouseEnter(evt) {
		var targetRect = evt.target;
		dom.addClass(targetRect, "active");

		var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
		var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";

		endline.x1.baseVal.valueAsString = xPosEnd;
		endline.x2.baseVal.valueAsString = xPosEnd;
		startline.x1.baseVal.valueAsString = xPosStart;
		startline.x2.baseVal.valueAsString = xPosStart;
		dom.addClass(endline, "active");
		dom.addClass(startline, "active");

		targetRect.parentNode.appendChild(endline);
		targetRect.parentNode.appendChild(startline);
	};

	var onRectMouseLeave = function onRectMouseLeave(evt) {
		dom.removeClass(evt.target, "active");
		dom.removeClass(endline, "active");
		dom.removeClass(startline, "active");
	};

	var createRect = (function (_createRect) {
		var _createRectWrapper = function createRect(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
			return _createRect.apply(this, arguments);
		};

		_createRectWrapper.toString = function () {
			return _createRect.toString();
		};

		return _createRectWrapper;
	})(function (width, height, x, y, cssClass, label, segments) {
		var rectHolder;
		var rect = svg.newEl("rect", {
			width: width / unit + "%",
			height: height - 1,
			x: Math.round(x / unit * 100) / 100 + "%",
			y: y,
			"class": (segments && segments.length > 0 ? "time-block" : "segment") + " " + (cssClass || "block-undefined")
		});
		if (label) {
			rect.appendChild(svg.newEl("title", {
				text: label
			})); // Add tile to wedge path
		}

		rect.addEventListener("mouseenter", onRectMouseEnter);
		rect.addEventListener("mouseleave", onRectMouseLeave);

		if (segments && segments.length > 0) {
			rectHolder = svg.newEl("g");
			rectHolder.appendChild(rect);
			segments.forEach(function (segment) {
				if (segment.total > 0 && typeof segment.start === "number") {
					rectHolder.appendChild(createRect(segment.total, 8, segment.start || 0.001, y, segment.cssClass, segment.name + " (" + Math.round(segment.start) + "ms - " + Math.round(segment.end) + "ms | total: " + Math.round(segment.total) + "ms)"));
				}
			});
			return rectHolder;
		} else {
			return rect;
		}
	});

	var createBgRect = function createBgRect(block) {
		var rect = svg.newEl("rect", {
			width: (block.total || 1) / unit + "%",
			height: diagramHeight,
			x: (block.start || 0.001) / unit + "%",
			y: 0,
			"class": block.cssClass || "block-undefined"
		});

		rect.appendChild(svg.newEl("title", {
			text: block.name
		})); // Add tile to wedge path
		return rect;
	};

	var createTimeWrapper = function createTimeWrapper() {
		var timeHolder = svg.newEl("g", { "class": "time-scale full-width" });
		for (var i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++) {
			var lineLabel = svg.newTextEl(i + "sec", diagramHeight);
			if (i > secs - 0.2) {
				lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
				lineLabel.setAttribute("text-anchor", "end");
			} else {
				lineLabel.setAttribute("x", secPerc * i + 0.5 + "%");
			}

			var lineEl = svg.newEl("line", {
				x1: secPerc * i + "%",
				y1: "0",
				x2: secPerc * i + "%",
				y2: diagramHeight
			});
			timeHolder.appendChild(lineEl);
			timeHolder.appendChild(lineLabel);
		}
		return timeHolder;
	};

	var renderMarks = function renderMarks() {
		var marksHolder = svg.newEl("g", {
			transform: "scale(1, 1)",
			"class": "marker-holder"
		});

		marks.forEach(function (mark, i) {
			var x = mark.startTime / unit;
			var markHolder = svg.newEl("g", {
				"class": "mark-holder"
			});
			var lineHolder = svg.newEl("g", {
				"class": "line-holder"
			});
			var lineLableHolder = svg.newEl("g", {
				"class": "line-lable-holder",
				x: x + "%"
			});
			mark.x = x;
			var lineLabel = svg.newTextEl(mark.name, diagramHeight + 25);
			//lineLabel.setAttribute("writing-mode", "tb");
			lineLabel.setAttribute("x", x + "%");
			lineLabel.setAttribute("stroke", "");

			lineHolder.appendChild(svg.newEl("line", {
				x1: x + "%",
				y1: 0,
				x2: x + "%",
				y2: diagramHeight
			}));

			if (marks[i - 1] && mark.x - marks[i - 1].x < 1) {
				lineLabel.setAttribute("x", marks[i - 1].x + 1 + "%");
				mark.x = marks[i - 1].x + 1;
			}

			//would use polyline but can't use percentage for points
			lineHolder.appendChild(svg.newEl("line", {
				x1: x + "%",
				y1: diagramHeight,
				x2: mark.x + "%",
				y2: diagramHeight + 23
			}));

			var isActive = false;
			var onLableMouseEnter = function onLableMouseEnter(evt) {
				if (!isActive) {
					isActive = true;
					dom.addClass(lineHolder, "active");
					//firefox has issues with this
					markHolder.parentNode.appendChild(markHolder);
				}
			};

			var onLableMouseLeave = function onLableMouseLeave(evt) {
				isActive = false;
				dom.removeClass(lineHolder, "active");
			};

			lineLabel.addEventListener("mouseenter", onLableMouseEnter);
			lineLabel.addEventListener("mouseleave", onLableMouseLeave);
			lineLableHolder.appendChild(lineLabel);

			markHolder.appendChild(svg.newEl("title", {
				text: mark.name + " (" + Math.round(mark.startTime) + "ms)" }));
			markHolder.appendChild(lineHolder);
			marksHolder.appendChild(markHolder);
			markHolder.appendChild(lineLableHolder);
		});

		return marksHolder;
	};

	timeLineHolder.appendChild(createTimeWrapper());
	timeLineHolder.appendChild(renderMarks());

	lines.forEach(function (block, i) {
		timeLineHolder.appendChild(createBgRect(block));
	});

	barsToShow.forEach(function (block, i) {
		var blockWidth = block.total || 1;

		var y = 25 * i;
		timeLineHolder.appendChild(createRect(blockWidth, 25, block.start || 0.001, y, block.cssClass, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)", block.segments));

		var blockLabel = svg.newTextEl(block.name + " (" + Math.round(block.total) + "ms)", y + (block.segments ? 20 : 17));

		if ((block.total || 1) / unit > 10 && svg.getNodeTextWidth(blockLabel) < 200) {
			blockLabel.setAttribute("class", "inner-label");
			blockLabel.setAttribute("x", (block.start || 0.001) / unit + 0.5 + "%");
			blockLabel.setAttribute("width", blockWidth / unit + "%");
		} else if ((block.start || 0.001) / unit + blockWidth / unit < 80) {
			blockLabel.setAttribute("x", (block.start || 0.001) / unit + blockWidth / unit + 0.5 + "%");
		} else {
			blockLabel.setAttribute("x", (block.start || 0.001) / unit - 0.5 + "%");
			blockLabel.setAttribute("text-anchor", "end");
		}
		blockLabel.style.opacity = block.name.match(/js.map$/) ? "0.5" : "1";
		timeLineLabelHolder.appendChild(blockLabel);
	});

	timeLineHolder.appendChild(timeLineLabelHolder);

	if (title) {
		chartHolder.appendChild(dom.newTag("h1", {
			text: title
		}));
	}
	chartHolder.appendChild(timeLineHolder);

	return chartHolder;
};

module.exports = waterfall;
},{"../helpers/dom":9,"../helpers/svg":15}],18:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var data = _interopRequire(require("./data"));

var iFrameHolder = _interopRequire(require("./helpers/iFrameHolder"));

var summaryTilesComponent = _interopRequire(require("./components/summaryTiles"));

var navigationTimelineComponent = _interopRequire(require("./components/navigationTimeline"));

var pieChartComponent = _interopRequire(require("./components/pieChart"));

var tableComponent = _interopRequire(require("./components/table"));

var resourcesTimelineComponent = _interopRequire(require("./components/resourcesTimeline"));

var legendComponent = _interopRequire(require("./components/legend"));

var pageMetricComponent = _interopRequire(require("./components/pageMetric"));

var logger = _interopRequire(require("./logger"));

//skip browser internal pages or when data is invalid
if (location.protocol === "about:" || !data.isValid()) {
	return;
}

var onIFrameReady = function onIFrameReady(addComponentFn) {
	[summaryTilesComponent.init(), navigationTimelineComponent.init(), pieChartComponent.init(), tableComponent.init(), resourcesTimelineComponent.init(), legendComponent.init(), pageMetricComponent.init()].forEach(function (componentBody) {
		addComponentFn(componentBody);
	});
};

iFrameHolder.setup(onIFrameReady);
},{"./components/legend":1,"./components/navigationTimeline":2,"./components/pageMetric":3,"./components/pieChart":4,"./components/resourcesTimeline":5,"./components/summaryTiles":6,"./components/table":7,"./data":8,"./helpers/iFrameHolder":11,"./logger":19}],19:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var data = _interopRequire(require("./data"));

var tableLogger = _interopRequire(require("./helpers/tableLogger"));

tableLogger.logTable({
	name: "All loaded resources",
	data: data.allResourcesCalc,
	columns: ["name", "domain", "fileType", "initiatorType", "fileExtension", "loadtime", "isRequestToHost", "requestStartDelay", "dns", "tcp", "ttfb", "requestDuration", "ssl"]
});

tableLogger.logTables([{
	name: "Requests by domain",
	data: data.requestsByDomain
}, {
	name: "Requests by Initiator Type",
	data: data.initiatorTypeCounts,
	columns: ["initiatorType", "count", "perc"]
}, {
	name: "Requests by Initiator Type (host/external domain)",
	data: data.initiatorTypeCountHostExt,
	columns: ["initiatorType", "count", "perc"]
}, {
	name: "Requests by File Type",
	data: data.fileTypeCounts,
	columns: ["fileType", "count", "perc"]
}]);
},{"./data":8,"./helpers/tableLogger":16}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
