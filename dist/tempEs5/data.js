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

data.allResourcesCalc = data.resources.filter(function (currR) {
	//remove this bookmarklet from the result
	return !currR.name.match(/http[s]?\:\/\/(micmro|nurun).github.io\/performance-bookmarklet\/.*/);
}).map(function (currR, i, arr) {
	//crunch the resources data into something easier to work with
	var isRequest = currR.name.indexOf("http") === 0,
	    urlFragments,
	    maybeFileName,
	    fileExtension;

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

//enhance requestsOnly
//TODO: make immutable
data.requestsOnly.forEach(function (currR) {
	var entry = data.requestsByDomain.filter(function (a) {
		return a.domain == currR.domain;
	})[0] || {};

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