import data from "./data";
import iFrameHolder from "./helpers/iFrameHolder";

import summaryTilesComponent from "./components/summaryTiles";
import navigationTimelineComponent from "./components/navigationTimeline";
import pieChartComponent from "./components/pieChart";
import tableComponent from "./components/table";
import resourcesTimelineComponent from "./components/resourcesTimeline";
import logger from "./logger";

//skip browser internal pages or when data is invalid
if(location.protocol === "about:" || !data.isValid()){
	return;
}

var onIFrameReady = function(addComponentFn){
	[
		summaryTilesComponent.init(),
		navigationTimelineComponent.init(),
		pieChartComponent.init(),
		tableComponent.init(),
		resourcesTimelineComponent.init()
	].forEach(function(componentBody){
		addComponentFn(componentBody);
	});
};

iFrameHolder.setup(onIFrameReady);