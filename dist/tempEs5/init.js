"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var data = _interopRequire(require("./data"));

var iFrameHolder = _interopRequire(require("./helpers/iFrameHolder"));

var summaryTilesComponent = _interopRequire(require("./components/summaryTiles"));

var navigationTimelineComponent = _interopRequire(require("./components/navigationTimeline"));

var pieChartComponent = _interopRequire(require("./components/pieChart"));

var tableComponent = _interopRequire(require("./components/table"));

var resourcesTimelineComponent = _interopRequire(require("./components/resourcesTimeline"));

//skip browser internal pages or when data is invalid
if (location.protocol === "about:" || !data.isValid()) {
	return;
}

var onIFrameReady = function onIFrameReady(addComponentFn) {
	[summaryTilesComponent.init(), navigationTimelineComponent.init(), pieChartComponent.init(), tableComponent.init(), resourcesTimelineComponent.init()].forEach(function (componentBody) {
		addComponentFn(componentBody);
	});
};

iFrameHolder.setup(onIFrameReady);