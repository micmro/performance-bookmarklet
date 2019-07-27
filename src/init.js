import data from "./data";
import iFrameHolder from "./helpers/iFrameHolder";

import summaryTilesComponent from "./components/summaryTiles";
import navigationTimelineComponent from "./components/navigationTimeline";
import pieChartComponent from "./components/pieChart";
import tableComponent from "./components/table";
import resourcesTimelineComponent from "./components/resourcesTimeline";
import legendComponent from "./components/legend";
import pageMetricComponent from "./components/pageMetric";

(() => {
	//skip browser internal pages or when data is invalid
	if(location.protocol === "about:" || !data.isValid()){
		return;
	}
	const onIFrameReady = (addComponentFn) => {
		[
			summaryTilesComponent.init(),
			navigationTimelineComponent.init(),
			pieChartComponent.init(),
			tableComponent.init(),
			resourcesTimelineComponent.init(),
			legendComponent.init(),
			pageMetricComponent.init()
		].forEach((componentBody) => {
			addComponentFn(componentBody);
		});
	};

	iFrameHolder.setup(onIFrameReady);
})();