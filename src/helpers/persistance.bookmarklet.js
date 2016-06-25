import dom from "../helpers/dom";
import data from "../data";

const storageKey = "performance-bookmarklet-metrics";

var persistance = {};

var getMetrics = function(){
	return {
		timestamp: (new Date(data.perfTiming.navigationStart)).toISOString(),
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

var getStoredValues = function(){
	return JSON.parse(localStorage.getItem(storageKey)) || [];
};

persistance.persistanceEnabled =  function(){
	return !!JSON.parse(localStorage.getItem(storageKey));
};

persistance.activatePersistance = function(){
	persistance.saveLatestMetrics();
};


persistance.deactivatePersistance = function(){
	persistance.dump();
};


persistance.saveLatestMetrics = function(metrics){
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
persistance.dump = function(clear = true){
	var sourceData = getStoredValues();

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


export default persistance;
