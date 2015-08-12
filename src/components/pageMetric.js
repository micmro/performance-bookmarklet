/*
Section to allow persistance of subset values
*/

import dom from "../helpers/dom";
import data from "../data";

const storageKey = "performance-bookmarklet-metrics";

var pageMetricComponent = {};

var getMetrics = function(){
	return {
		timestamp: (new Date(data.perfTiming.navigationStart)).toISOString(),
		url: window.location.href,
		requests: data.requestsOnly.length,
		domains: data.requestsByDomain.length,
		subDomainsOfTdl: data.hostSubdomains,
		requestsToHost: data.hostRequests,
		tldAndSubdomainRequests: data.currAndSubdomainRequests,
		total: data.perfTiming.loadEventEnd - data.perfTiming.navigationStart,
		timeToFirstByte: data.perfTiming.responseStart - data.perfTiming.navigationStart,
		domContentLoading: data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading,
		domProcessing: data.perfTiming.domComplete - data.perfTiming.domLoading
	};	
};


//init UI
pageMetricComponent.init = function(){
	//persistance is off by default
	var persistanceEnabled = !!JSON.parse(localStorage.getItem(storageKey));

	var chartHolder = dom.newTag("section", {
		class : "page-metric chart-holder"
	});
	chartHolder.appendChild(dom.newTag("h3", {text : "Persist Data"}));

	var persistDataCheckboxLabel = dom.newTag("label", {text : " Persist Data?"});
	var persistDataCheckbox = dom.newTag("input", {
		type : "checkbox",
		id : "persist-data-checkbox",
		checked : persistanceEnabled
	});
	var printDataButton = dom.newTag("button", {text : "Dumb data to console", disabled: !persistanceEnabled});

	//hook up events
	persistDataCheckbox.addEventListener("change", (evt) => {
		var checked = evt.target.checked;
		if(checked){
			pageMetricComponent.activatePersistance();
			printDataButton.disabled = false;
		}else if(window.confirm("this will wipe out all stored data")){
			pageMetricComponent.deactivatePersistance();
			printDataButton.disabled = true;
		} else {
			evt.target.checked = true;
		}
	});
	persistDataCheckboxLabel.insertBefore(persistDataCheckbox, persistDataCheckboxLabel.firstChild);

	printDataButton.addEventListener("click", (evt) => {
		pageMetricComponent.dump(false);
	});

	chartHolder.appendChild(persistDataCheckboxLabel);
	chartHolder.appendChild(printDataButton);

	if(persistanceEnabled){
		pageMetricComponent.saveLatestMetrics();
	}

	return chartHolder;
};


pageMetricComponent.activatePersistance = function(){
	pageMetricComponent.saveLatestMetrics();
};


pageMetricComponent.deactivatePersistance = function(){
	pageMetricComponent.dump();
};


pageMetricComponent.getStoredValues = function(){
	return JSON.parse(localStorage.getItem(storageKey)) || [];
};


pageMetricComponent.saveLatestMetrics = function(){
	var data = pageMetricComponent.getStoredValues();
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
pageMetricComponent.dump = function(clear = true){
	var sourceData = pageMetricComponent.getStoredValues();

	// Nothing to analyze. Return early.
	if(sourceData.length === 0){
	  console.log("There are no page metrics. Please tick the 'Persist Data' checkbox.");
	  return;
	}

	// Remove the data from the data store.
	if(clear === true){
	  localStorage.removeItem(storageKey);
	  console.log("Storage for %s has been cleared", storageKey);
	}

	//make accessible publicly only when button is pressed
	window.PerformanceBookmarklet = {
		persistedData : sourceData
	};
	if(console.table){
		console.log("Data also accessible via %cwindow.PerformanceBookmarklet.persistedData%c:\n\n%o", "font-family:monospace", "font-family:inherit", window.PerformanceBookmarklet);
		console.table(sourceData);
	}else{
		//IE fallback
	    console.log("Data also accessible via window.PerformanceBookmarklet.persistedData");
	    console.dir(window.PerformanceBookmarklet.persistedData);
	}
};


export default pageMetricComponent;
