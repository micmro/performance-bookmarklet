import data from "../data";

const storageKey = "performance-bookmarklet-metrics";

const persistance = {};

const getMetrics = () => {
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

const getStoredValues = () => {
	alert("Not impemented");
	// return JSON.parse(localStorage.getItem(storageKey)) || [];
};

persistance.persistanceEnabled =  () => {
	// return !!JSON.parse(localStorage.getItem(storageKey));
};

persistance.activatePersistance = () => {
	persistance.saveLatestMetrics();
};


persistance.deactivatePersistance = () => {
	persistance.dump();
};


persistance.saveLatestMetrics = (metrics) => {
	alert("Not impemented");
	// const data = getStoredValues();
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
persistance.dump = (clear = true) => {
	alert("Not impemented");
};


export default persistance;
