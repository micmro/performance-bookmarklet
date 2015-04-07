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

var navigationTimelineComponent = {};

navigationTimelineComponent.init = function () {

	var perfTimingCalc = {
		pageLoadTime: data.perfTiming.loadEventEnd - data.perfTiming.navigationStart,
		output: []
	};
	var startTime = data.perfTiming.navigationStart;
	var propBaseName;

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

	var timeBlock = function timeBlock(name, start, end, colour) {
		return {
			name: name,
			start: start,
			end: end,
			total: typeof start !== "number" || typeof end !== "number" ? undefined : end - start,
			colour: colour
		};
	};

	perfTimingCalc.blocks = [timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "#ccc"), timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "#909"), timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "#ffff60"), timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "#1f831f"), timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "#1f7c83"), timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "#e58226"), timeBlock("Timer to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "#1fe11f"), timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "#1977dd"), timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "#9cc"), timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "#d888df"), timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "#c0c0ff")];

	if (perfTimingCalc.secureConnectionStart) {
		perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "#c141cd"));
	}
	if (perfTimingCalc.msFirstPaint) {
		perfTimingCalc.blocks.push(timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "#8FBC83"));
	}
	if (perfTimingCalc.domInteractive) {
		perfTimingCalc.blocks.push(timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "#d888df"));
	}
	if (!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart) {
		perfTimingCalc.blocks.push(timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "#ffff60"));
	}

	perfTimingCalc.blocks.push(timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "#8cd18c"));

	//add measures to be added as bars
	data.measures.forEach(function (measure) {
		perfTimingCalc.blocks.push(timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "#f00"));
	});

	var setupTimeLine = function setupTimeLine() {
		var unit = perfTimingCalc.pageLoadTime / 100;
		var barsToShow = perfTimingCalc.blocks.filter(function (block) {
			return typeof block.start == "number" && typeof block.total == "number";
		}).sort(function (a, b) {
			return (a.start || 0) - (b.start || 0);
		});
		var maxMarkTextLength = data.marks.length > 0 ? data.marks.reduce(function (currMax, currValue) {
			return Math.max(typeof currMax == "number" ? currMax : 0, svg.getNodeTextWidth(svg.newTextEl(currValue.name, "0")));
		}) : 0;

		var diagramHeight = (barsToShow.length + 1) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

		var chartHolder = dom.newTag("section", {
			"class": "navigation-timing water-fall-holder chart-holder"
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

		var createRect = function createRect(width, height, x, y, fill, label) {
			var rect = svg.newEl("rect", {
				width: width / unit + "%",
				height: height,
				x: x / unit + "%",
				y: y,
				fill: fill,
				"class": "time-block"
			});
			if (label) {
				rect.appendChild(svg.newEl("title", {
					text: label
				})); // Add tile to wedge path
			}

			rect.addEventListener("mouseenter", onRectMouseEnter);
			rect.addEventListener("mouseleave", onRectMouseLeave);

			return rect;
		};

		var createTimeWrapper = function createTimeWrapper() {
			var timeHolder = svg.newEl("g", { "class": "time-scale full-width" });
			for (var i = 0, secs = perfTimingCalc.pageLoadTime / 1000, secPerc = 100 / secs; i <= secs; i++) {
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

			data.marks.forEach(function (mark, i) {
				//mark.duration
				var markHolder = svg.newEl("g", {
					"class": "mark-holder"
				});
				var lineHolder = svg.newEl("g", {
					"class": "line-holder"
				});
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = svg.newTextEl(mark.name, diagramHeight + 25);
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(svg.newEl("line", {
					x1: x + "%",
					y1: "0px",
					x2: x + "%",
					y2: diagramHeight
				}));

				if (data.marks[i - 1] && mark.x - data.marks[i - 1].x < 1) {
					lineLabel.setAttribute("x", data.marks[i - 1].x + 1 + "%");
					mark.x = data.marks[i - 1].x + 1;
				}

				//would use polyline but can't use percentage for points
				lineHolder.appendChild(svg.newEl("line", {
					x1: x + "%",
					y1: diagramHeight,
					x2: mark.x + "%",
					y2: diagramHeight + 23
				}));

				markHolder.addEventListener("mouseenter", function (evt) {
					dom.addClass(lineHolder, "active");
					markHolder.parentNode.appendChild(markHolder);
				});
				markHolder.addEventListener("mouseleave", function (evt) {
					dom.removeClass(lineHolder, "active");
				});

				markHolder.appendChild(svg.newEl("title", {
					text: mark.name + " (" + Math.round(mark.startTime) + "ms)" }));
				markHolder.appendChild(lineHolder);
				markHolder.appendChild(lineLabel);
				marksHolder.appendChild(markHolder);
			});

			return marksHolder;
		};

		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function (block, i) {
			var blockWidth = block.total || 1;
			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start || 0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)"));

			var blockLabel = svg.newTextEl(block.name + " (" + block.total + "ms)", y + 18);

			if ((block.total || 1) / unit > 10) {
				blockLabel.setAttribute("class", "inner-label");
				blockLabel.setAttribute("x", (block.start || 0.001) / unit + 0.5 + "%");
				blockLabel.setAttribute("width", blockWidth / unit + "%");
			} else if ((block.start || 0.001) / unit + blockWidth / unit < 80) {
				blockLabel.setAttribute("x", (block.start || 0.001) / unit + blockWidth / unit + 0.5 + "%");
			} else {
				blockLabel.setAttribute("x", (block.start || 0.001) / unit - 0.5 + "%");
				blockLabel.setAttribute("text-anchor", "end");
			}
			timeLineLabelHolder.appendChild(blockLabel);
		});

		timeLineHolder.appendChild(timeLineLabelHolder);

		chartHolder.appendChild(dom.newTag("h1", {
			text: "Navigation Timing"
		}));
		chartHolder.appendChild(timeLineHolder);
		return chartHolder;
	};

	tableLogger.logTables([{ name: "Navigation Timeline", data: perfTimingCalc.blocks, columns: ["name", "start", "end", "total"] }, { name: "Navigation Events", data: perfTimingCalc.output }, { name: "Marks", data: data.marks, columns: ["name", "startTime", "duration"] }]);

	return setupTimeLine();
};

module.exports = navigationTimelineComponent;