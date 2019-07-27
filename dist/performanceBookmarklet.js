/* https://github.com/micmro/performance-bookmarklet by Michael Mrowetz @MicMro
   build:27/07/2019 */

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _waterfall = _interopRequireDefault(require("../helpers/waterfall"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Logic for Legned
*/
var legendComponent = {};

var createLegend = function createLegend(className, title, dlArray) {
  var legendHolder = _dom["default"].newTag("div", {
    "class": "legend-holder"
  });

  legendHolder.appendChild(_dom["default"].newTag("h4", {
    text: title
  }));

  var dl = _dom["default"].newTag("dl", {
    "class": "legend " + className
  });

  dlArray.forEach(function (definition) {
    dl.appendChild(_dom["default"].newTag("dt", {
      "class": "colorBoxHolder",
      childElement: _dom["default"].newTag("span", {}, "background:" + definition[1])
    }));
    dl.appendChild(_dom["default"].newTag("dd", {
      text: definition[0]
    }));
  });
  legendHolder.appendChild(dl);
  return legendHolder;
}; //Legend


legendComponent.init = function () {
  var chartHolder = _dom["default"].newTag("section", {
    "class": "resource-timing chart-holder"
  });

  chartHolder.appendChild(_dom["default"].newTag("h3", {
    text: "Legend"
  }));

  var legendsHolder = _dom["default"].newTag("div", {
    "class": "legends-group "
  });

  legendsHolder.appendChild(createLegend("initiator-type-legend", "Block color: Initiator Type", [["css", "#afd899"], ["iframe", "#85b3f2"], ["img", "#bc9dd6"], ["script", "#e7bd8c"], ["link", "#89afe6"], ["swf", "#4db3ba"], //["font", "#e96859"],
  ["xmlhttprequest", "#e7d98c"]]));
  legendsHolder.appendChild(createLegend("navigation-legend", "Navigation Timing", [["Redirect", "#ffff60"], ["App Cache", "#1f831f"], ["DNS Lookup", "#1f7c83"], ["TCP", "#e58226"], ["SSL Negotiation", "#c141cd"], ["Time to First Byte", "#1fe11f"], ["Content Download", "#1977dd"], ["DOM Processing", "#9cc"], ["DOM Content Loaded", "#d888df"], ["On Load", "#c0c0ff"]]));
  legendsHolder.appendChild(createLegend("resource-legend", "Resource Timing", [["Stalled/Blocking", "#cdcdcd"], ["Redirect", "#ffff60"], ["App Cache", "#1f831f"], ["DNS Lookup", "#1f7c83"], ["TCP", "#e58226"], ["SSL Negotiation", "#c141cd"], ["Initial Connection (TCP)", "#e58226"], ["Time to First Byte", "#1fe11f"], ["Content Download", "#1977dd"]]));
  chartHolder.appendChild(legendsHolder);
  return chartHolder;
};

var _default = legendComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/waterfall":17}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _svg = _interopRequireDefault(require("../helpers/svg"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _tableLogger = _interopRequireDefault(require("../helpers/tableLogger"));

var _waterfall = _interopRequireDefault(require("../helpers/waterfall"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Logic for Naviagtion Timing API and Markers Waterfall
*/
var navigationTimelineComponent = {};

navigationTimelineComponent.init = function () {
  var startTime = _data["default"].perfTiming.navigationStart;
  var perfTimingCalc = {
    "pageLoadTime": _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.navigationStart,
    "output": []
  };

  for (var perfProp in _data["default"].perfTiming) {
    if (_data["default"].perfTiming[perfProp] && typeof _data["default"].perfTiming[perfProp] === "number") {
      perfTimingCalc[perfProp] = _data["default"].perfTiming[perfProp] - startTime;
      perfTimingCalc.output.push({
        "name": perfProp,
        "time (ms)": _data["default"].perfTiming[perfProp] - startTime
      });
    }
  }

  perfTimingCalc.output.sort(function (a, b) {
    return (a["time (ms)"] || 0) - (b["time (ms)"] || 0);
  });
  perfTimingCalc.blocks = [_waterfall["default"].timeBlock("Total", 0, perfTimingCalc.pageLoadTime, "block-total"), _waterfall["default"].timeBlock("Unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "block-unload"), _waterfall["default"].timeBlock("Redirect (" + performance.navigation.redirectCount + "x)", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "block-redirect"), _waterfall["default"].timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "block-appcache"), _waterfall["default"].timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "block-dns"), _waterfall["default"].timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "block-tcp"), _waterfall["default"].timeBlock("Time to First Byte", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "block-ttfb"), _waterfall["default"].timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "block-response"), _waterfall["default"].timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "block-dom"), _waterfall["default"].timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "block-dom-content-loaded"), _waterfall["default"].timeBlock("onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "block-onload")];

  if (perfTimingCalc.secureConnectionStart) {
    perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "block-ssl"));
  }

  if (perfTimingCalc.msFirstPaint) {
    perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "block-ms-first-paint-event"));
  }

  if (perfTimingCalc.domInteractive) {
    perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "block-dom-interactive-event"));
  }

  if (!perfTimingCalc.redirectEnd && !perfTimingCalc.redirectStart && perfTimingCalc.fetchStart > perfTimingCalc.navigationStart) {
    perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("Cross-Domain Redirect (and/or other Delay)", perfTimingCalc.navigationStart, perfTimingCalc.fetchStart, "block-redirect"));
  }

  perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("Network/Server", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "block-network-server")); //add measures to be added as bars

  _data["default"].measures.forEach(function (measure) {
    perfTimingCalc.blocks.push(_waterfall["default"].timeBlock("measure:" + measure.name, Math.round(measure.startTime), Math.round(measure.startTime + measure.duration), "block-custom-measure"));
  });

  _tableLogger["default"].logTables([{
    name: "Navigation Timeline",
    data: perfTimingCalc.blocks,
    columns: ["name", "start", "end", "total"]
  }, {
    name: "Navigation Events",
    data: perfTimingCalc.output
  }, {
    name: "Marks",
    data: _data["default"].marks,
    columns: ["name", "startTime", "duration"]
  }]);

  return _waterfall["default"].setupTimeLine(Math.round(perfTimingCalc.pageLoadTime), perfTimingCalc.blocks, _data["default"].marks, [], "Navigation Timing");
};

var _default = navigationTimelineComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/svg":15,"../helpers/tableLogger":16,"../helpers/waterfall":17}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _persistance = _interopRequireDefault(require("../helpers/persistance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Section to allow persistance of subset values
*/
// import data from "../data";
var pageMetricComponent = {}; //init UI

pageMetricComponent.init = function () {
  //persistance is off by default
  var persistanceEnabled = _persistance["default"].persistanceEnabled();

  var chartHolder = _dom["default"].newTag("section", {
    "class": "page-metric chart-holder"
  });

  chartHolder.appendChild(_dom["default"].newTag("h3", {
    text: "Persist Data"
  }));

  var persistDataCheckboxLabel = _dom["default"].newTag("label", {
    text: " Persist Data?"
  });

  var persistDataCheckbox = _dom["default"].newTag("input", {
    type: "checkbox",
    id: "persist-data-checkbox",
    checked: persistanceEnabled
  });

  var printDataButton = _dom["default"].newTag("button", {
    text: "Dumb data to console",
    disabled: !persistanceEnabled
  }); //hook up events


  persistDataCheckbox.addEventListener("change", function (evt) {
    var checked = evt.target.checked;

    if (checked) {
      _persistance["default"].activatePersistance();

      printDataButton.disabled = false;
    } else if (window.confirm("this will wipe out all stored data")) {
      _persistance["default"].deactivatePersistance();

      printDataButton.disabled = true;
    } else {
      evt.target.checked = true;
    }
  });
  persistDataCheckboxLabel.insertBefore(persistDataCheckbox, persistDataCheckboxLabel.firstChild);
  printDataButton.addEventListener("click", function (evt) {
    _persistance["default"].dump(false);
  });
  chartHolder.appendChild(persistDataCheckboxLabel);
  chartHolder.appendChild(printDataButton);

  if (persistanceEnabled) {
    _persistance["default"].saveLatestMetrics();
  }

  return chartHolder;
};

var _default = pageMetricComponent;
exports["default"] = _default;


},{"../helpers/dom":9,"../helpers/persistance":12}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _svg = _interopRequireDefault(require("../helpers/svg"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _pieChartHelpers = _interopRequireDefault(require("../helpers/pieChartHelpers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Logic for Request analysis pie charts
*/
var pieChartComponent = {};

pieChartComponent.init = function () {
  var chartsHolder = _dom["default"].newTag("div", {
    "class": "pie-charts-holder chart-holder"
  }); // create a chart and table section


  var setupChart = function setupChart(title, chartData, countTexts, columns, id) {
    var chartHolder = _dom["default"].newTag("div", {
      "class": "pie-chart-holder",
      id: id || ""
    });

    chartHolder.appendChild(_dom["default"].newTag("h1", {
      text: title
    }));
    chartHolder.appendChild(_pieChartHelpers["default"].createPieChart(chartData, 400));
    chartHolder.appendChild(_dom["default"].newTag("p", {
      text: "Total Requests: " + _data["default"].requestsOnly.length
    }));

    if (countTexts && countTexts.length) {
      countTexts.forEach(function (countText) {
        chartHolder.appendChild(_dom["default"].newTag("p", {
          text: countText
        }, "margin-top:-1em"));
      });
    }

    chartHolder.appendChild(_pieChartHelpers["default"].createChartTable(title, chartData, columns));
    chartsHolder.appendChild(chartHolder);
  }; // init data for charts


  var requestsUnit = _data["default"].requestsOnly.length / 100;
  var colourRangeR = "789abcdef";
  var colourRangeG = "789abcdef";
  var colourRangeB = "789abcdef"; //argument data

  var requestsByDomainData = _data["default"].requestsByDomain.map(function (sourceDomain) {
    var domain = _helpers["default"].clone(sourceDomain);

    domain.perc = domain.count / requestsUnit;
    domain.label = domain.domain;

    if (domain.domain === location.host) {
      domain.colour = "#0c0";
    } else if (domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".")) {
      domain.colour = "#0a0";
    } else {
      domain.colour = _helpers["default"].getRandomColor("56789abcdef", "01234567", "abcdef");
    }

    domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
    domain.durationAverage = Math.round(domain.durationTotal / domain.count);
    domain.durationTotal = Math.round(domain.durationTotal);
    domain.durationTotalParallel = Math.round(domain.durationTotalParallel);
    return domain;
  });

  setupChart("Requests by Domain", requestsByDomainData, ["Domains Total: " + _data["default"].requestsByDomain.length], [{
    name: "Requests",
    field: "count"
  }, {
    name: "Avg. Duration (ms)",
    field: "durationAverage"
  }, {
    name: "Duration Parallel (ms)",
    field: "durationTotalParallel"
  }, {
    name: "Duration Sum (ms)",
    field: "durationTotal"
  }], "pie-request-by-domain");
  setupChart("Requests by Initiator Type", _data["default"].initiatorTypeCounts.map(function (initiatorType) {
    initiatorType.perc = initiatorType.count / requestsUnit;
    initiatorType.label = initiatorType.initiatorType;
    initiatorType.colour = _helpers["default"].getInitiatorOrFileTypeColour(initiatorType.initiatorType, _helpers["default"].getRandomColor(colourRangeR, colourRangeG, colourRangeB));
    initiatorType.id = "reqByInitiatorType-" + initiatorType.label.replace(/[^a-zA-Z]/g, "-");
    return initiatorType;
  }));
  setupChart("Requests by Initiator Type (host/external domain)", _data["default"].initiatorTypeCountHostExt.map(function (initiatorype) {
    var typeSegments = initiatorype.initiatorType.split(" ");
    initiatorype.perc = initiatorype.count / requestsUnit;
    initiatorype.label = initiatorype.initiatorType;
    initiatorype.colour = _helpers["default"].getInitiatorOrFileTypeColour(typeSegments[0], _helpers["default"].getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
    initiatorype.id = "reqByInitiatorTypeLocEx-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
    return initiatorype;
  }), ["Requests to Host: " + _data["default"].hostRequests, "Host: " + location.host]);
  setupChart("Requests by File Type", _data["default"].fileTypeCounts.map(function (fileType) {
    fileType.perc = fileType.count / requestsUnit;
    fileType.label = fileType.fileType;
    fileType.colour = _helpers["default"].getInitiatorOrFileTypeColour(fileType.fileType, _helpers["default"].getRandomColor(colourRangeR, colourRangeG, colourRangeB));
    fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
    return fileType;
  }));
  setupChart("Requests by File Type (host/external domain)", _data["default"].fileTypeCountHostExt.map(function (fileType) {
    var typeSegments = fileType.fileType.split(" ");
    fileType.perc = fileType.count / requestsUnit;
    fileType.label = fileType.fileType;
    fileType.colour = _helpers["default"].getInitiatorOrFileTypeColour(typeSegments[0], _helpers["default"].getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
    fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
    return fileType;
  }), ["Requests to Host: " + _data["default"].hostRequests, "Host: " + location.host]);
  return chartsHolder;
};

var _default = pieChartComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10,"../helpers/pieChartHelpers":13,"../helpers/svg":15}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _waterfall = _interopRequireDefault(require("../helpers/waterfall"));

var _this = void 0;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var resourcesTimelineComponent = {};

var getChartData = function getChartData(filter) {
  var calc = {
    pageLoadTime: _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.responseStart,
    lastResponseEnd: _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.responseStart
  };

  for (var perfProp in _data["default"].perfTiming) {
    if (_data["default"].perfTiming[perfProp] && typeof _data["default"].perfTiming[perfProp] === "number") {
      calc[perfProp] = _data["default"].perfTiming[perfProp] - _data["default"].perfTiming.navigationStart;
    }
  }

  var onDomLoad = _waterfall["default"].timeBlock("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "block-dom-content-loaded");

  var onLoadEvt = _waterfall["default"].timeBlock("Onload Event", calc.loadEventStart, calc.loadEventEnd, "block-onload");

  var navigationApiTotal = [_waterfall["default"].timeBlock("Unload", calc.unloadEventStart, calc.unloadEventEnd, "block-unload"), _waterfall["default"].timeBlock("Redirect", calc.redirectStart, calc.redirectEnd, "block-redirect"), _waterfall["default"].timeBlock("App cache", calc.fetchStart, calc.domainLookupStart, "block-appcache"), _waterfall["default"].timeBlock("DNS", calc.domainLookupStart, calc.domainLookupEnd, "block-dns"), _waterfall["default"].timeBlock("TCP", calc.connectStart, calc.connectEnd, "block-tcp"), _waterfall["default"].timeBlock("Timer to First Byte", calc.requestStart, calc.responseStart, "block-ttfb"), _waterfall["default"].timeBlock("Response", calc.responseStart, calc.responseEnd, "block-response"), _waterfall["default"].timeBlock("DOM Processing", calc.domLoading, calc.domComplete, "block-dom"), onDomLoad, onLoadEvt];

  if (calc.secureConnectionStart) {
    navigationApiTotal.push(_waterfall["default"].timeBlock("SSL", calc.connectStart, calc.secureConnectionStart, "block-ssl"));
  }

  if (calc.msFirstPaint) {
    navigationApiTotal.push(_waterfall["default"].timeBlock("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "block-ms-first-paint-event"));
  }

  if (calc.domInteractive) {
    navigationApiTotal.push(_waterfall["default"].timeBlock("domInteractive Event", calc.domInteractive, calc.domInteractive, "block-dom-interactive-event"));
  }

  if (!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart) {
    navigationApiTotal.push(_waterfall["default"].timeBlock("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "block-redirect"));
  }

  calc.blocks = [_waterfall["default"].timeBlock("Navigation API total", 0, calc.loadEventEnd, "block-navigation-api-total", navigationApiTotal)];

  _data["default"].allResourcesCalc.filter(function (resource) {
    //do not show items up to 15 seconds after onload - else beacon ping etc make diagram useless
    return resource.startTime < calc.loadEventEnd + 15000;
  }).filter(filter || function () {
    return true;
  }).forEach(function (resource, i) {
    var segments = [_waterfall["default"].timeBlock("Redirect", resource.redirectStart, resource.redirectEnd, "block-redirect"), _waterfall["default"].timeBlock("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "block-dns"), _waterfall["default"].timeBlock("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "block-dns"), _waterfall["default"].timeBlock("secureConnect", resource.secureConnectionStart || undefined, resource.connectEnd, "block-ssl"), _waterfall["default"].timeBlock("Timer to First Byte", resource.requestStart, resource.responseStart, "block-ttfb"), _waterfall["default"].timeBlock("Content Download", resource.responseStart || undefined, resource.responseEnd, "block-response")];
    var resourceTimings = [0, resource.redirectStart, resource.domainLookupStart, resource.connectStart, resource.secureConnectionStart, resource.requestStart, resource.responseStart];
    var firstTiming = resourceTimings.reduce(function (currMinTiming, currentValue) {
      if (currentValue > 0 && (currentValue < currMinTiming || currMinTiming <= 0) && currentValue != resource.startTime) {
        return currentValue;
      } else {
        return currMinTiming;
      }
    });

    if (resource.startTime < firstTiming) {
      segments.unshift(_waterfall["default"].timeBlock("Stalled/Blocking", resource.startTime, firstTiming, "block-blocking"));
    }

    calc.blocks.push(_waterfall["default"].timeBlock(resource.name, resource.startTime, resource.responseEnd, "block-" + resource.initiatorType, segments, resource));
    calc.lastResponseEnd = Math.max(calc.lastResponseEnd, resource.responseEnd);
  });

  return {
    loadDuration: Math.round(Math.max(calc.lastResponseEnd, _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.navigationStart)),
    blocks: calc.blocks,
    bg: [onDomLoad, onLoadEvt]
  };
};

resourcesTimelineComponent.init = function () {
  var chartData = getChartData();

  var chartHolder = _waterfall["default"].setupTimeLine(chartData.loadDuration, chartData.blocks, _data["default"].marks, chartData.bg, "Resource Timing");

  if (_data["default"].requestsByDomain.length > 1) {
    var selectBox = _dom["default"].newTag("select", {
      "class": "domain-selector",
      onchange: function onchange() {
        var domain = _this.options[_this.selectedIndex].value;

        if (domain === "all") {
          chartData = getChartData();
        } else {
          chartData = getChartData(function (resource) {
            return resource.domain === domain;
          });
        }

        var tempChartHolder = _waterfall["default"].setupTimeLine(chartData.loadDuration, chartData.blocks, _data["default"].marks, chartData.bg, "Temp");

        var oldSVG = chartHolder.getElementsByClassName("water-fall-chart")[0];
        var newSVG = tempChartHolder.getElementsByClassName("water-fall-chart")[0];
        chartHolder.replaceChild(newSVG, oldSVG);
      }
    });

    selectBox.appendChild(_dom["default"].newTag("option", {
      text: "show all",
      value: "all"
    }));

    _data["default"].requestsByDomain.forEach(function (domain) {
      selectBox.appendChild(_dom["default"].newTag("option", {
        text: domain.domain
      }));
    });

    var chartSvg = chartHolder.getElementsByClassName("water-fall-chart")[0];
    chartSvg.parentNode.insertBefore(selectBox, chartSvg);
  }

  return chartHolder;
};

var _default = resourcesTimelineComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/waterfall":17}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Tiles to summarize page performance
*/
var summaryTilesComponent = {};

summaryTilesComponent.init = function () {
  var createTile = function createTile(title, value, titleFontSize) {
    titleFontSize = titleFontSize || 60;

    var dl = _dom["default"].newTag("dl", {
      "class": "summary-tile"
    });

    dl.appendChild(_dom["default"].newTag("dt", {
      childElement: title
    }));
    dl.appendChild(_dom["default"].newTag("dd", {
      childElement: value
    }, "font-size:" + titleFontSize + "px;"));
    return dl;
  };

  var createAppendixDefValue = function createAppendixDefValue(a, definition, value) {
    a.appendChild(_dom["default"].newTag("dt", {
      childElement: definition
    }));
    a.appendChild(_dom["default"].newTag("dd", {
      text: value
    }));
  };

  var tilesHolder = _dom["default"].newTag("section", {
    "class": "tiles-holder chart-holder"
  });

  var appendix = _dom["default"].newTag("dl", {
    "class": "summary-tile-appendix"
  });

  [createTile("Requests", _data["default"].requestsOnly.length || "0"), createTile("Domains", _data["default"].requestsByDomain.length || "0"), createTile(_dom["default"].combineNodes("Subdomains of ", _dom["default"].newTag("abbr", {
    title: "Top Level Domain",
    text: "TLD"
  })), _data["default"].hostSubdomains || "0"), createTile(_dom["default"].combineNodes("Requests to ", _dom["default"].newTag("span", {
    title: location.host,
    text: "Host"
  })), _data["default"].hostRequests || "0"), createTile(_dom["default"].combineNodes(_dom["default"].newTag("abbr", {
    title: "Top Level Domain",
    text: "TLD"
  }), " & Subdomain Requests"), _data["default"].currAndSubdomainRequests || "0"), createTile("Total", _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.navigationStart + "ms", 40), createTile("Time to First Byte", _data["default"].perfTiming.responseStart - _data["default"].perfTiming.navigationStart + "ms", 40), createTile(_dom["default"].newTag("span", {
    title: "domLoading to domContentLoadedEventStart",
    text: "DOM Content Loading"
  }), _data["default"].perfTiming.domContentLoadedEventStart - _data["default"].perfTiming.domLoading + "ms", 40), createTile(_dom["default"].newTag("span", {
    title: "domLoading to loadEventStart",
    text: "DOM Processing"
  }), _data["default"].perfTiming.domComplete - _data["default"].perfTiming.domLoading + "ms", 40)].forEach(function (tile) {
    tilesHolder.appendChild(tile);
  });

  if (_data["default"].allResourcesCalc.length > 0) {
    tilesHolder.appendChild(createTile(_dom["default"].newTag("span", {
      title: _data["default"].slowestCalls[0].name,
      text: "Slowest Call"
    }), _dom["default"].newTag("span", {
      title: _data["default"].slowestCalls[0].name,
      text: Math.floor(_data["default"].slowestCalls[0].duration) + "ms"
    }), 40));
    tilesHolder.appendChild(createTile("Average Call", _data["default"].average + "ms", 40));
  }

  createAppendixDefValue(appendix, _dom["default"].newTag("abbr", {
    title: "Top Level Domain",
    text: "TLD"
  }, location.host.split(".").slice(-2).join(".")));
  createAppendixDefValue(appendix, _dom["default"].newTextNode("Host:"), location.host);
  createAppendixDefValue(appendix, _dom["default"].newTextNode("document.domain:"), document.domain);
  tilesHolder.appendChild(appendix);
  return tilesHolder;
};

var _default = summaryTilesComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _data = _interopRequireDefault(require("../data"));

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Logic for Request analysis table
*/
var tableComponent = {};

tableComponent.init = function () {
  var output = _data["default"].requestsOnly.reduce(function (collectObj, currR) {
    var fileTypeData = collectObj[currR.fileType],
        initiatorTypeData;

    if (!fileTypeData) {
      fileTypeData = collectObj[currR.fileType] = {
        "fileType": currR.fileType,
        "count": 0,
        "initiatorType": {},
        "requestsToHost": 0,
        "requestsToExternal": 0
      };
    }

    initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType];

    if (!initiatorTypeData) {
      initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType] = {
        "initiatorType": currR.initiatorType,
        "count": 0,
        "requestsToHost": 0,
        "requestsToExternal": 0
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

  var sectionHolder = _dom["default"].newTag("section", {
    "class": "table-section-holder chart-holder"
  });

  sectionHolder.appendChild(_dom["default"].newTag("h1", {
    text: "Request FileTypes & Initiators"
  }));
  sectionHolder.appendChild(_dom["default"].tableFactory("filetypes-and-intiators-table", function (theadTr) {
    ["FileType", "Count", "Count Internal", "Count External", "Initiator Type", "Count by Initiator Type", "Initiator Type Internal", "Initiator Type External"].forEach(function (x) {
      theadTr.appendChild(_dom["default"].newTag("th", {
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

      var tr = _dom["default"].newTag("tr", {
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

        tr.appendChild(_dom["default"].newTag("td", settings));
      });
      tbody.appendChild(tr);
      initiatorTypeKeys.slice(1).forEach(function (initiatorTypeKey) {
        var initiatorTypeData = fileTypeData.initiatorType[initiatorTypeKey];

        var tr2 = _dom["default"].newTag("tr", {
          "class": "initiator-type-more " + (initiatorTypeKey || "other") + "-light"
        });

        tr2.appendChild(_dom["default"].newTag("td", {
          text: initiatorTypeKey
        }));
        tr2.appendChild(_dom["default"].newTag("td", {
          text: initiatorTypeData.count
        }));
        tr2.appendChild(_dom["default"].newTag("td", {
          text: initiatorTypeData.requestsToHost
        }));
        tr2.appendChild(_dom["default"].newTag("td", {
          text: initiatorTypeData.requestsToExternal
        }));
        tbody.appendChild(tr2);
      });
    });
    return tbody;
  }));
  return sectionHolder;
};

var _default = tableComponent;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9,"../helpers/helpers":10}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _helpers = _interopRequireDefault(require("./helpers/helpers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _isValid = true;
var data = {
  resources: [],
  marks: [],
  measures: [],
  perfTiming: [],
  allResourcesCalc: [],
  isValid: function isValid() {
    return _isValid;
  }
};

var supportsFeatures = function supportsFeatures() {
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
    return false;
  }

  if (window.performance.timing) {
    data.perfTiming = window.performance.timing;
  } else {
    alert("Oups, looks like this browser does not support performance timing");
    return false;
  }

  if (data.perfTiming.loadEventEnd - data.perfTiming.navigationStart < 0) {
    alert("Page is still loading - please try again when page is loaded.");
    return false;
  }

  return true;
};

(function () {
  _isValid = supportsFeatures();
  data.allResourcesCalc = data.resources //remove this bookmarklet from the result
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
      fileType: _helpers["default"].getFileType(fileExtension, currR.initiatorType),
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
  }); //filter out non-http[s] and sourcemaps

  data.requestsOnly = data.allResourcesCalc.filter(function (currR) {
    return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
  }); //get counts

  data.initiatorTypeCounts = _helpers["default"].getItemCount(data.requestsOnly.map(function (currR, i, arr) {
    return currR.initiatorType || currR.fileExtension;
  }), "initiatorType");
  data.initiatorTypeCountHostExt = _helpers["default"].getItemCount(data.requestsOnly.map(function (currR, i, arr) {
    return (currR.initiatorType || currR.fileExtension) + " " + (currR.isRequestToHost ? "(host)" : "(external)");
  }), "initiatorType");
  data.requestsByDomain = _helpers["default"].getItemCount(data.requestsOnly.map(function (currR, i, arr) {
    return currR.domain;
  }), "domain");
  data.fileTypeCountHostExt = _helpers["default"].getItemCount(data.requestsOnly.map(function (currR, i, arr) {
    return currR.fileType + " " + (currR.isRequestToHost ? "(host)" : "(external)");
  }), "fileType");
  data.fileTypeCounts = _helpers["default"].getItemCount(data.requestsOnly.map(function (currR, i, arr) {
    return currR.fileType;
  }), "fileType");
  var tempResponseEnd = {}; //TODO: make immutable

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
  }); //Request counts

  data.hostRequests = data.requestsOnly.filter(function (domain) {
    return domain.domain === location.host;
  }).length;
  data.currAndSubdomainRequests = data.requestsOnly.filter(function (domain) {
    return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
  }).length;
  data.crossDocDomainRequests = data.requestsOnly.filter(function (domain) {
    return !_helpers["default"].endsWith(domain.domain, document.domain);
  }).length;
  data.hostSubdomains = data.requestsByDomain.filter(function (domain) {
    return _helpers["default"].endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
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
})();

var _default = data;
exports["default"] = _default;


},{"./helpers/helpers":10}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
DOM Helpers
*/

/**
 * @param  {string} text
 * @returns {Text}
 */
var newTextNode = function newTextNode(text) {
  return document.createTextNode(text);
};
/**
 * creats a html tag
 *
 * @param  {string} tagName
 * @param  {Object} settings
 * @param  {string} css
 * @return {HTMLElement} new HTMLElement tag
 */


var newTag = function newTag(tagName, settings, css) {
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
    if (_typeof(settings.childElement) === "object") {
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
      tag.appendChild(newTextNode(settings.childElement));
    }
  }

  if (settings["class"]) {
    tag.className = settings["class"];
  }

  tag.style.cssText = css || "";
  return tag;
};
/**
 * Helper to create a table
 *
 * @param  {string} id - id of holder
 * @param  {function} headerBuilder
 * @param  {function} rowBuilder
 * @returns {HTMLDivElement} `table` wrapped in a holder `div`
 */


var tableFactory = function tableFactory(id, headerBuilder, rowBuilder) {
  var tableHolder = newTag("div", {
    id: id || "",
    "class": "table-holder"
  });
  var table = newTag("table");
  var thead = newTag("thead");
  thead.appendChild(headerBuilder(newTag("tr")));
  table.appendChild(thead);
  table.appendChild(rowBuilder(newTag("tbody")));
  tableHolder.appendChild(table);
  return tableHolder;
};
/**
 * Combines 2 nodes into a wrapper `div`
 *
 * @param  {Element|string} a - fist node
 * @param  {Element|string} b - second node
 * @returns {HTMLDivElement}
 */


var combineNodes = function combineNodes(a, b) {
  var wrapper = document.createElement("div");

  if (_typeof(a) === "object") {
    wrapper.appendChild(a);
  } else if (typeof a === "string") {
    wrapper.appendChild(newTextNode(a));
  }

  if (_typeof(b) === "object") {
    wrapper.appendChild(b);
  } else if (typeof b === "string") {
    wrapper.appendChild(newTextNode(b));
  }

  return wrapper.childNodes;
};
/**
 * Adds CSS classname to `el`
 *
 * @param  {HTMLElement} el
 * @param  {string} className
 * @returns {HTMLElement} returns `el` again for chaining
 */


var addClass = function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    // IE doesn't support classList in SVG - also no need for dublication check i.t.m.
    el.setAttribute("class", el.getAttribute("class") + " " + className);
  }

  return el;
};
/**
 * Removes CSS classname from `el`
 *
 * @param  {HTMLElement} el
 * @param  {string} className
 * @returns {HTMLElement} returns `el` again for chaining
 */


var removeClass = function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    //IE doesn't support classList in SVG - also no need for dublication check i.t.m.
    el.setAttribute("class", el.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
  }

  return el;
};

var _default = {
  newTextNode: newTextNode,
  newTag: newTag,
  tableFactory: tableFactory,
  combineNodes: combineNodes,
  addClass: addClass,
  removeClass: removeClass
};
exports["default"] = _default;


},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
Misc helpers
*/
var helper = {}; //extract a resources file type

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
        return "html";
      //actual page

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
      colour = "#afd899";
      break;

    case "iframe":
    case "html":
      colour = "#85b3f2";
      break;

    case "img":
    case "image":
      colour = "#bc9dd6";
      break;

    case "script":
    case "js":
      colour = "#e7bd8c";
      break;

    case "link":
      colour = "#89afe6";
      break;

    case "swf":
      colour = "#4db3ba";
      break;

    case "font":
      colour = "#e96859";
      break;
    //TODO check if this works

    case "xmlhttprequest":
    case "ajax":
      colour = "#e7d98c";
      break;
  }

  if (variation === true) {
    return getColourVariation(colour, -5);
  }

  return colour;
}; //counts occurrences of items in array arr and returns them as array of key valure pairs
//keyName overwrites the name of the key attribute


helper.getItemCount = function (arr, keyName) {
  var counts = {},
      resultArr = [],
      obj;
  arr.forEach(function (key) {
    counts[key] = counts[key] ? counts[key] + 1 : 1;
  }); //pivot data

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
  var copy; // Handle the 3 simple types, and null or undefined

  if (null == obj || "object" != _typeof(obj)) return obj; // Handle Date

  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  } // Handle Array


  if (obj instanceof Array) {
    copy = [];

    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = helper.clone(obj[i]);
    }

    return copy;
  } // Handle Object


  if (obj instanceof Object) {
    copy = {};

    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = helper.clone(obj[attr]);
    }

    return copy;
  }

  throw new Error("Unable to helper.clone obj");
};

var _default = helper;
exports["default"] = _default;


},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _style = require("../helpers/style");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
iFrame and holder logic
*/

/**
 * iFrame to contain perf-bookmarklet's diagrams
 * @type {HTMLIFrameElement}
 */
var iFrameEl;
/**
 * Holder element
 * @type {HTMLDivElement}
 */

var outputHolder;
/** @type {HTMLDivElement}  */

var outputContent;
/**
 * Holder document for perf-bookmarklet (in iFrame)
 * @type {Document}
 */

var outputIFrame;
/** setup iFrame overlay */

var initHolderEl = function initHolderEl() {
  // find or create holder element
  if (!outputHolder) {
    outputHolder = _dom["default"].newTag("div", {
      id: "perfbook-holder"
    });
    outputContent = _dom["default"].newTag("div", {
      id: "perfbook-content"
    });
    window.outputContent;

    var closeBtn = _dom["default"].newTag("button", {
      "class": "perfbook-close",
      text: "close"
    });

    closeBtn.addEventListener("click", function () {
      iFrameEl.parentNode.removeChild(iFrameEl);
    });
    outputHolder.appendChild(closeBtn);
    outputHolder.appendChild(outputContent);
  } else {
    outputContent = outputIFrame.getElementById("perfbook-content"); //clear existing data

    while (outputContent.firstChild) {
      outputContent.removeChild(outputContent.firstChild);
    }
  }
};

var addComponent = function addComponent(domEl) {
  outputContent.appendChild(domEl);
};

var getOutputIFrame = function getOutputIFrame() {
  return outputIFrame;
};

var _default = {
  /**
   * @param  {function} onIFrameReady
   */
  setup: function setup(onIFrameReady) {
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
      iFrameEl = _dom["default"].newTag("iframe", {
        id: "perfbook-iframe",
        onload: function onload() {
          outputIFrame = iFrameEl.contentWindow.document; //add style to iFrame

          var styleTag = _dom["default"].newTag("style", {
            type: "text/css",
            text: _style.style
          });

          outputIFrame.head.appendChild(styleTag);
          finalize();
        }
      }, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index:6543210; width:98%; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
      document.body.appendChild(iFrameEl);
    }
  },
  getOutputIFrame: getOutputIFrame
};
exports["default"] = _default;


},{"../helpers/dom":9,"../helpers/style":14}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dom = _interopRequireDefault(require("../helpers/dom"));

var _data = _interopRequireDefault(require("../data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var storageKey = "performance-bookmarklet-metrics";
var persistance = {};

var getMetrics = function getMetrics() {
  return {
    timestamp: new Date(_data["default"].perfTiming.navigationStart).toISOString(),
    url: window.location.href,
    requests: _data["default"].requestsOnly.length,
    domains: _data["default"].requestsByDomain.length,
    subDomainsOfTld: _data["default"].hostSubdomains,
    requestsToHost: _data["default"].hostRequests,
    tldAndSubdomainRequests: _data["default"].currAndSubdomainRequests,
    total: _data["default"].perfTiming.loadEventEnd - _data["default"].perfTiming.navigationStart,
    timeToFirstByte: _data["default"].perfTiming.responseStart - _data["default"].perfTiming.navigationStart,
    domContentLoading: _data["default"].perfTiming.domContentLoadedEventStart - _data["default"].perfTiming.domLoading,
    domProcessing: _data["default"].perfTiming.domComplete - _data["default"].perfTiming.domLoading
  };
};

var getStoredValues = function getStoredValues() {
  return JSON.parse(localStorage.getItem(storageKey)) || [];
};

persistance.persistanceEnabled = function () {
  return !!JSON.parse(localStorage.getItem(storageKey));
};

persistance.activatePersistance = function () {
  persistance.saveLatestMetrics();
};

persistance.deactivatePersistance = function () {
  persistance.dump();
};

persistance.saveLatestMetrics = function () {
  var data = getStoredValues();
  data.push(getMetrics());
  localStorage.setItem(storageKey, JSON.stringify(data));
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
  var clear = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var sourceData = getStoredValues(); // Nothing to analyze. Return early.

  if (sourceData.length === 0) {
    console.log("There are no page metrics. Please tick the 'Persist Data' checkbox.");
    return;
  } // Remove the data from the data store.


  if (clear === true) {
    localStorage.removeItem(storageKey);
    console.log("Storage for %s has been cleared", storageKey);
  } //make accessible publicly only when button is pressed


  window.PerformanceBookmarklet = {
    persistedData: sourceData
  };

  if (console.table) {
    console.log("Data also accessible via %cwindow.PerformanceBookmarklet.persistedData%c:\n\n%o", "font-family:monospace", "font-family:inherit", window.PerformanceBookmarklet);
    console.table(sourceData);
  } else {
    //IE fallback
    console.log("Data also accessible via window.PerformanceBookmarklet.persistedData");
    console.dir(window.PerformanceBookmarklet.persistedData);
  }
};

var _default = persistance;
exports["default"] = _default;


},{"../data":8,"../helpers/dom":9}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _helpers = _interopRequireDefault(require("../helpers/helpers"));

var _svg = _interopRequireDefault(require("../helpers/svg"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

  var path = _svg["default"].newEl("path", {
    id: id,
    d: d,
    fill: colour
  });

  path.appendChild(_svg["default"].newEl("title", {
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
    var wedgeLabel = _svg["default"].newTextEl(labelTxt, y3); //first half or second half


    if (labelAngle < Math.PI) {
      wedgeLabel.setAttribute("x", x3 - _svg["default"].getNodeTextWidth(wedgeLabel));
    } else {
      wedgeLabel.setAttribute("x", x3);
    }

    return {
      path: path,
      wedgeLabel: wedgeLabel,
      endAngle: endAngle
    };
  }

  return {
    path: path,
    endAngle: endAngle
  };
};

var chartMaxHeight = function () {
  var contentWidth = window.innerWidth * 0.98 - 64;

  if (contentWidth < 700) {
    return 350;
  } else if (contentWidth < 800) {
    return contentWidth / 2 - 72;
  } else {
    return contentWidth / 3 - 72;
  }
}();

pieChartHelpers.createPieChart = function (data, size) {
  //inspired by http://jsfiddle.net/da5LN/62/
  var startAngle = 0; // init startAngle

  var chart = _svg["default"].newEl("svg:svg", {
    viewBox: "0 0 " + size + " " + size,
    "class": "pie-chart"
  }, "max-height:" + chartMaxHeight + "px;"),
      labelWrap = _svg["default"].newEl("g", {}, "pointer-events:none; font-weight:bold;"),
      wedgeWrap = _svg["default"].newEl("g"); //loop through data and create wedges


  data.forEach(function (dataObj) {
    var wedgeData = createWedge(dataObj.id, size, startAngle, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || _helpers["default"].getRandomColor());
    wedgeWrap.appendChild(wedgeData.path);
    startAngle = wedgeData.endAngle;

    if (wedgeData.wedgeLabel) {
      labelWrap.appendChild(wedgeData.wedgeLabel);
    }
  }); // foreground circle

  wedgeWrap.appendChild(_svg["default"].newEl("circle", {
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
  columns = columns || [{
    name: "Requests",
    field: "count"
  }]; //create table

  return _dom["default"].tableFactory("", function (thead) {
    thead.appendChild(_dom["default"].newTag("th", {
      text: title,
      "class": "text-left"
    }));
    columns.forEach(function (column) {
      thead.appendChild(_dom["default"].newTag("th", {
        text: column.name,
        "class": "text-right"
      }));
    });
    thead.appendChild(_dom["default"].newTag("th", {
      text: "Percentage",
      "class": "text-right"
    }));
    return thead;
  }, function (tbody) {
    data.forEach(function (y) {
      var row = _dom["default"].newTag("tr", {
        id: y.id + "-table"
      });

      row.appendChild(_dom["default"].newTag("td", {
        text: y.label
      }));
      columns.forEach(function (column) {
        row.appendChild(_dom["default"].newTag("td", {
          text: y[column.field].toString(),
          "class": "text-right"
        }));
      });
      row.appendChild(_dom["default"].newTag("td", {
        text: y.perc.toPrecision(2) + "%",
        "class": "text-right"
      }));
      tbody.appendChild(row);
    });
    return tbody;
  });
};

var _default = pieChartHelpers;
exports["default"] = _default;


},{"../helpers/dom":9,"../helpers/helpers":10,"../helpers/svg":15}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.style = void 0;
var style = "body {overflow: auto; background: #fff; font:normal 12px/18px sans-serif; color:#333;} * {box-sizing:border-box;} svg {font:normal 12px/18px sans-serif;} th {text-align: left;} button {cursor:pointer;} button:disabled {cursor:default;} #perfbook-holder {overflow: hidden; width:100%; padding:1em 2em;} #perfbook-content {position:relative;} .perfbook-close {position:absolute; top:0; right:0; padding:1em; z-index:1; background:transparent; border:0; cursor:pointer;} .full-width {width:100%;} .chart-holder {margin: 5em 0;} h1 {font:bold 18px/18px sans-serif; margin:1em 0; color:#666;} .text-right {text-align: right;} .text-left {text-align: left;} .css {background: #afd899;} .iframe, .html, .internal {background: #85b3f2;} .img, .image {background: #bc9dd6;} .script, .js {background: #e7bd8c;} .link {background: #89afe6;} .swf, .flash {background: #4db3ba;} .font {background: #e96859;} .xmlhttprequest, .ajax {background: #e7d98c;} .other {background: #bebebe;} .css-light {background: #b9cfa0;} .iframe-light, .html-light, .internal-light {background: #c2d9f9;} .img-light, .image-light {background: #deceeb;} .script-light, .js-light {background: #f3dec6;} .link-light {background: #c4d7f3;} .swf-light, .flash-light {background: #a6d9dd;} .font-light {background: #f4b4ac;} .xmlhttprequest-light, .ajax-light {background: #f3ecc6;} .other-light {background: #dfdfdf;} .block-css {fill: #afd899;} .block-iframe, .block-html, .block-internal {fill: #85b3f2;} .block-img, .block-image {fill: #bc9dd6;} .block-script, .block-js {fill: #e7bd8c;} .block-link {fill: #89afe6;} .block-swf, .block-flash {fill: #4db3ba;} .block-font {fill: #e96859;} .block-xmlhttprequest, .block-ajax {fill: #e7d98c;} .block-other {fill: #bebebe;} .block-total {fill: #ccc;} .block-unload {fill: #909;} .block-redirect {fill: #ffff60;} .block-appcache {fill: #1f831f;} .block-dns {fill: #1f7c83;} .block-tcp {fill: #e58226;} .block-ttfb {fill: #1fe11f;} .block-response {fill: #1977dd;} .block-dom {fill: #9cc;} .block-dom-content-loaded {fill: #d888df;} .block-onload {fill: #c0c0ff;} .block-ssl {fill: #c141cd; } .block-ms-first-paint-event {fill: #8fbc83; } .block-dom-interactive-event {fill: #d888df; } .block-network-server {fill: #8cd18c; } .block-custom-measure {fill: #f00; } .block-navigation-api-total {fill: #ccc;} .block-blocking {fill: #cdcdcd;} .block-undefined {fill: #0f0;} .tiles-holder {margin: 2em -18px 2em 0; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .summary-tile { flex-grow: 1; width:250px; background:#ddd; padding: 1em; margin:0 18px 1em 0; color:#666; text-align:center;} .summary-tile dt {font-weight:bold; font-size:16px; display:block; line-height:1.2em; min-height:2.9em; padding:0 0 0.5em;} .summary-tile dd {font-weight:bold; line-height:60px; margin:0;} .summary-tile-appendix {float:left; clear:both; width:100%; font-size:10px; line-height:1.1em; color:#666;} .summary-tile-appendix dt {float:left; clear:both;} .summary-tile-appendix dd {float:left; margin:0 0 0 1em;} .pie-charts-holder {margin-right: -72px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap;} .pie-chart-holder {flex-grow: 1; width:350px; max-width: 600px; margin: 0 72px 0 0;} .pie-chart-holder h1 {min-height:2em;} .pie-chart {width:100%;} .table-holder {overflow-x:auto} .table-holder table {float:left; width:100%; font-size:12px; line-height:18px;} .table-holder th, .table-holder td {line-height: 1em; margin:0; padding:0.25em 0.5em 0.25em 0;} #pie-request-by-domain {flex-grow: 2; width:772px; max-width: 1272px;} #filetypes-and-intiators-table {margin: 2em 0 5em;} #filetypes-and-intiators-table table {vertical-align: middle; border-collapse: collapse;} #filetypes-and-intiators-table td {padding:0.5em; border-right: solid 1px #fff;} #filetypes-and-intiators-table td:last-child {padding-right: 0; border-right:0;} #filetypes-and-intiators-table .file-type-row td {border-top: solid 10px #fff;} #filetypes-and-intiators-table .file-type-row:first-child td {border-top: none;} .water-fall-holder {fill:#ccc;} .water-fall-chart {width:100%; background:#f0f5f0;} .water-fall-chart .marker-holder {width:100%;} .water-fall-chart .line-holder {stroke-width:1; stroke: #ccc; stroke-opacity:0.5;} .water-fall-chart .line-holder.active {stroke: #69009e; stroke-width:2; stroke-opacity:1;} .water-fall-chart .labels {width:100%;} .water-fall-chart .labels .inner-label {pointer-events: none;} .water-fall-chart .time-block.active {opacity: 0.8;} .water-fall-chart .line-end, .water-fall-chart .line-start {display: none; stroke-width:1; stroke-opacity:0.5; stroke: #000;} .water-fall-chart .line-end.active, .water-fall-chart .line-start.active {display: block;} .water-fall-chart .mark-holder text {-webkit-writing-mode: tb; writing-mode:vertical-lr; writing-mode: tb;} .time-scale line {stroke:#0cc; stroke-width:1;} .time-scale text {font-weight:bold;} .domain-selector {float:right; margin: -35px 0 0 0;} .navigation-timing {} .legends-group { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-flow: row wrap; flex-flow: row wrap; } .legends-group .legend-holder { flex-grow: 1; width:250px; padding:0 1em 1em; } .legends-group .legend-holder h4 { margin: 0; padding: 0; } .legend dt {float: left; clear: left; padding: 0 0 0.5em;} .legend dd {float: left; display: inline-block; margin: 0 1em; line-height: 1em;} .legend .colorBoxHolder span {display: inline-block; width: 15px; height: 1em;} .page-metric {} .page-metric button {margin-left: 2em;}";
exports.style = style;


},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _iFrameHolder = _interopRequireDefault(require("../helpers/iFrameHolder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
SVG Helpers
*/

/**
 * Create new SVG element
 *
 * @param  {string} tagName
 * @param  {Object} settings
 * @param  {string} css
 */
var newEl = function newEl(tagName, settings, css) {
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
/**
 * Creates a new SVG `text` element
 *
 * @param  {string} text
 * @param  {number} y
 * @param  {string} css
 * @returns {SVGTextElement}
 */


var newTextEl = function newTextEl(text, y, css) {
  return newEl("text", {
    fill: "#111",
    y: y,
    text: text
  }, (css || "") + " text-shadow:0 0 4px #fff;");
};
/**
 * Calculates the with of a SVG `text` element
 *
 * _needs access to iFrame, since width depends on context_
 *
 * @param  {SVGTextElement} textNode
 * @returns {number} width of `textNode`
 */


var getNodeTextWidth = function getNodeTextWidth(textNode) {
  var tmp = newEl("svg:svg", {}, "visibility:hidden;");
  tmp.appendChild(textNode);

  _iFrameHolder["default"].getOutputIFrame().body.appendChild(tmp);

  var nodeWidth = textNode.getBBox().width;
  tmp.parentNode.removeChild(tmp);
  return nodeWidth;
};

var _default = {
  newEl: newEl,
  newTextEl: newTextEl,
  getNodeTextWidth: getNodeTextWidth
};
exports["default"] = _default;


},{"../helpers/iFrameHolder":11}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/*
Log tables in console
*/
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

var _default = tableLogger;
exports["default"] = _default;


},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _svg = _interopRequireDefault(require("../helpers/svg"));

var _dom = _interopRequireDefault(require("../helpers/dom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*
Helper to create waterfall timelines
*/
var waterfall = {}; //model for block and segment

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
    return Math.max(typeof currMax == "number" ? currMax : 0, _svg["default"].getNodeTextWidth(_svg["default"].newTextEl(currValue.name, "0")));
  }) : 0,
      diagramHeight = (barsToShow.length + 1) * 25,
      chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

  var chartHolder = _dom["default"].newTag("section", {
    "class": "resource-timing water-fall-holder chart-holder"
  });

  var timeLineHolder = _svg["default"].newEl("svg:svg", {
    height: Math.floor(chartHolderHeight),
    "class": "water-fall-chart"
  });

  var timeLineLabelHolder = _svg["default"].newEl("g", {
    "class": "labels"
  });

  var endLine = _svg["default"].newEl("line", {
    x1: "0",
    y1: "0",
    x2: "0",
    y2: diagramHeight,
    "class": "line-end"
  });

  var startLine = _svg["default"].newEl("line", {
    x1: "0",
    y1: "0",
    x2: "0",
    y2: diagramHeight,
    "class": "line-start"
  });

  var onRectMouseEnter = function onRectMouseEnter(evt) {
    var targetRect = evt.target;

    _dom["default"].addClass(targetRect, "active");

    var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
    var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";
    endLine.x1.baseVal.valueAsString = xPosEnd;
    endLine.x2.baseVal.valueAsString = xPosEnd;
    startLine.x1.baseVal.valueAsString = xPosStart;
    startLine.x2.baseVal.valueAsString = xPosStart;

    _dom["default"].addClass(endLine, "active");

    _dom["default"].addClass(startLine, "active");

    targetRect.parentNode.appendChild(endLine);
    targetRect.parentNode.appendChild(startLine);
  };

  var onRectMouseLeave = function onRectMouseLeave(evt) {
    _dom["default"].removeClass(evt.target, "active");

    _dom["default"].removeClass(endLine, "active");

    _dom["default"].removeClass(startLine, "active");
  };

  var createRect = function createRect(width, height, x, y, cssClass, label, segments) {
    var rectHolder;

    var rect = _svg["default"].newEl("rect", {
      width: width / unit + "%",
      height: height - 1,
      x: Math.round(x / unit * 100) / 100 + "%",
      y: y,
      "class": (segments && segments.length > 0 ? "time-block" : "segment") + " " + (cssClass || "block-undefined")
    });

    if (label) {
      rect.appendChild(_svg["default"].newEl("title", {
        text: label
      })); // Add tile to wedge path
    }

    rect.addEventListener("mouseenter", onRectMouseEnter);
    rect.addEventListener("mouseleave", onRectMouseLeave);

    if (segments && segments.length > 0) {
      rectHolder = _svg["default"].newEl("g");
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
  };

  var createBgRect = function createBgRect(block) {
    var rect = _svg["default"].newEl("rect", {
      width: (block.total || 1) / unit + "%",
      height: diagramHeight,
      x: (block.start || 0.001) / unit + "%",
      y: 0,
      "class": block.cssClass || "block-undefined"
    });

    rect.appendChild(_svg["default"].newEl("title", {
      text: block.name
    })); // Add tile to wedge path

    return rect;
  };

  var createTimeWrapper = function createTimeWrapper() {
    var timeHolder = _svg["default"].newEl("g", {
      "class": "time-scale full-width"
    });

    for (var i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++) {
      var lineLabel = _svg["default"].newTextEl(i + "sec", diagramHeight);

      if (i > secs - 0.2) {
        lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
        lineLabel.setAttribute("text-anchor", "end");
      } else {
        lineLabel.setAttribute("x", secPerc * i + 0.5 + "%");
      }

      var lineEl = _svg["default"].newEl("line", {
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
    var marksHolder = _svg["default"].newEl("g", {
      transform: "scale(1, 1)",
      "class": "marker-holder"
    });

    marks.forEach(function (mark, i) {
      var x = mark.startTime / unit;

      var markHolder = _svg["default"].newEl("g", {
        "class": "mark-holder"
      });

      var lineHolder = _svg["default"].newEl("g", {
        "class": "line-holder"
      });

      var lineLabelHolder = _svg["default"].newEl("g", {
        "class": "line-label-holder",
        x: x + "%"
      });

      mark.x = x;

      var lineLabel = _svg["default"].newTextEl(mark.name, diagramHeight + 25); //lineLabel.setAttribute("writing-mode", "tb");


      lineLabel.setAttribute("x", x + "%");
      lineLabel.setAttribute("stroke", "");
      lineHolder.appendChild(_svg["default"].newEl("line", {
        x1: x + "%",
        y1: 0,
        x2: x + "%",
        y2: diagramHeight
      }));

      if (marks[i - 1] && mark.x - marks[i - 1].x < 1) {
        lineLabel.setAttribute("x", marks[i - 1].x + 1 + "%");
        mark.x = marks[i - 1].x + 1;
      } //would use polyline but can't use percentage for points


      lineHolder.appendChild(_svg["default"].newEl("line", {
        x1: x + "%",
        y1: diagramHeight,
        x2: mark.x + "%",
        y2: diagramHeight + 23
      }));
      var isActive = false;

      var onLabelMouseEnter = function onLabelMouseEnter(evt) {
        if (!isActive) {
          isActive = true;

          _dom["default"].addClass(lineHolder, "active"); //firefox has issues with this


          markHolder.parentNode.appendChild(markHolder);
        }
      };

      var onLabelMouseLeave = function onLabelMouseLeave(evt) {
        isActive = false;

        _dom["default"].removeClass(lineHolder, "active");
      };

      lineLabel.addEventListener("mouseenter", onLabelMouseEnter);
      lineLabel.addEventListener("mouseleave", onLabelMouseLeave);
      lineLabelHolder.appendChild(lineLabel);
      markHolder.appendChild(_svg["default"].newEl("title", {
        text: mark.name + " (" + Math.round(mark.startTime) + "ms)"
      }));
      markHolder.appendChild(lineHolder);
      marksHolder.appendChild(markHolder);
      markHolder.appendChild(lineLabelHolder);
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

    var blockLabel = _svg["default"].newTextEl(block.name + " (" + Math.round(block.total) + "ms)", y + (block.segments ? 20 : 17));

    if ((block.total || 1) / unit > 10 && _svg["default"].getNodeTextWidth(blockLabel) < 200) {
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
    chartHolder.appendChild(_dom["default"].newTag("h1", {
      text: title
    }));
  }

  chartHolder.appendChild(timeLineHolder);
  return chartHolder;
};

var _default = waterfall;
exports["default"] = _default;


},{"../helpers/dom":9,"../helpers/svg":15}],18:[function(require,module,exports){
"use strict";

var _data = _interopRequireDefault(require("./data"));

var _iFrameHolder = _interopRequireDefault(require("./helpers/iFrameHolder"));

var _summaryTiles = _interopRequireDefault(require("./components/summaryTiles"));

var _navigationTimeline = _interopRequireDefault(require("./components/navigationTimeline"));

var _pieChart = _interopRequireDefault(require("./components/pieChart"));

var _table = _interopRequireDefault(require("./components/table"));

var _resourcesTimeline = _interopRequireDefault(require("./components/resourcesTimeline"));

var _legend = _interopRequireDefault(require("./components/legend"));

var _pageMetric = _interopRequireDefault(require("./components/pageMetric"));

var _logger = _interopRequireDefault(require("./logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

(function () {
  //skip browser internal pages or when data is invalid
  if (location.protocol === "about:" || !_data["default"].isValid()) {
    return;
  }

  var onIFrameReady = function onIFrameReady(addComponentFn) {
    [_summaryTiles["default"].init(), _navigationTimeline["default"].init(), _pieChart["default"].init(), _table["default"].init(), _resourcesTimeline["default"].init(), _legend["default"].init(), _pageMetric["default"].init()].forEach(function (componentBody) {
      addComponentFn(componentBody);
    });
  };

  _iFrameHolder["default"].setup(onIFrameReady);
})();


},{"./components/legend":1,"./components/navigationTimeline":2,"./components/pageMetric":3,"./components/pieChart":4,"./components/resourcesTimeline":5,"./components/summaryTiles":6,"./components/table":7,"./data":8,"./helpers/iFrameHolder":11,"./logger":19}],19:[function(require,module,exports){
"use strict";

var _data = _interopRequireDefault(require("./data"));

var _tableLogger = _interopRequireDefault(require("./helpers/tableLogger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_tableLogger["default"].logTable({
  name: "All loaded resources",
  data: _data["default"].allResourcesCalc,
  columns: ["name", "domain", "fileType", "initiatorType", "fileExtension", "loadtime", "isRequestToHost", "requestStartDelay", "dns", "tcp", "ttfb", "requestDuration", "ssl"]
});

_tableLogger["default"].logTables([{
  name: "Requests by domain",
  data: _data["default"].requestsByDomain
}, {
  name: "Requests by Initiator Type",
  data: _data["default"].initiatorTypeCounts,
  columns: ["initiatorType", "count", "perc"]
}, {
  name: "Requests by Initiator Type (host/external domain)",
  data: _data["default"].initiatorTypeCountHostExt,
  columns: ["initiatorType", "count", "perc"]
}, {
  name: "Requests by File Type",
  data: _data["default"].fileTypeCounts,
  columns: ["fileType", "count", "perc"]
}]);


},{"./data":8,"./helpers/tableLogger":16}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
