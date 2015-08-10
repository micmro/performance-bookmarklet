import data from "../data";

/**
 * Represent and store page performance metrics.
 * 
 * @param [Object] metrics Object of metrics to record.
 * @param [String] metrics.page The current page's URL.
 * @param [Number] metrics.contentLoading In MS, how long the content was loading.
 * @param [Number] metrics.loadStart In MS, from dom loading to dom complete.
 * @param [Number] metrics.firstByte In MS, when the browser received the first byte from the server.
 * @param [Number] metrics.total In MS, how long the request took.
 */
class PageMetric {
  constructor() {
  	var metrics = {
		page: window.location.href,
		contentLoading: data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading,
		loadStart: data.perfTiming.domComplete - data.perfTiming.domLoading,
		firstByte: data.perfTiming.responseStart - data.perfTiming.navigationStart,
		total: data.perfTiming.loadEventEnd - data.perfTiming.navigationStart
	};
	console.log(metrics);
    this.page = metrics.page;
    this.contentLoading = metrics.contentLoading;
    this.loadStart = metrics.loadStart;
    this.firstByte = metrics.firstByte;
    this.total = metrics.total;

    
    this.save();
    console.log(metrics, this);
  }

  /**
   * Save the current record to the data store.
   */ 
  save() {
    var _PageMetric = this.constructor,
        data = _PageMetric.load();

    data.push(this); 

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Return the current record with the attributes specified in `csvColumns` delimited by the specified delimeter
   *
   * @param [String] delimiter Default: \t
   * @return [String]
   */ 
  toDelimitedValue(delimiter = "\t") {
    var result = "",
        _PageMetric = this.constructor;

    _PageMetric.prototype.csvColumns.forEach((k, ix) => {
      if (ix) {
        result += delimiter;
      }
      result += this[k]; 
    });

    return result;
  }

  /**
   * Convenience method for accessing a PageMetric instance"s storageKey.
   */
  static storageKey() {
    return this.__proto__.storageKey;
  }

  /**
   * Load the page metrics from the data store.
   * 
   * @return [Array<PageMetric>]
   */
  static load() {
    return JSON.parse(localStorage.getItem(this.prototype.storageKey)) || new Array();
  }

  /**
   * Dump the current page metrics from the data store to the console. 
   *
   * Example: 
   *    PerformanceBookmarklet.PageMetric.dump(); // Dumps the data as TSV and clears the data store.
   *    PerformanceBookmarklet.PageMetric.dump(",", false); // Dumps the data as CSV and retains the data.
   *
   * @param [String] delimiter The delimiter to use for the output columns. Default: "\t".
   * @param [Boolean] clear Should the data be cleared from the data store?
   */
  static dump(delimiter = "\t", clear = true) {
    var _PageMetric = this;
    var storageKey = _PageMetric.prototype.storageKey;
    var sourceData = _PageMetric.load();

    // Nothing to analyze. Return early.
    if(sourceData.length === 0) {
      console.log("There are no page metrics. Try refreshing the page and/or reloading the bookmarklet.");
      return;
    }

    // Remove the data from the data store.
    if(clear === true) {
      localStorage.removeItem(storageKey);
      console.log("Storage for %s has been cleared", storageKey);
    }

    // Build header
    var result = _PageMetric.prototype.csvColumns.join(delimiter) + "\n";

    // Add the rows
    sourceData.forEach(function(metricObj){
        var pageMetric = new _PageMetric(metricObj);
        result += pageMetric.toDelimitedValue(delimiter);
        result += "\n";
    });

    console.log(result);
  }
}


PageMetric.prototype.csvColumns = ["page", "contentLoading", "loadStart", "firstByte", "total"];
PageMetric.prototype.storageKey = "performance-bookmarklet-metrics";

export default PageMetric;
