var allRessources = performance.getEntriesByType("resource");


var allRessourcesCalc = allRessources.map(function(currR, i, arr){

	var urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
	var maybeFileName = urlFragments[2].split("/").pop();
	var urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);

	var currRes = {
		name : currR.name,
		domain : urlFragments[1],
		fileExtension : maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1),
		loadtime : currR.duration,
	};

	if (currR.requestStart) {
		currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
		currRes.tcp = currR.connectEnd - currR.connectStart;
		currRes.ttfb = currR.responseStart - currR.startTime;
	}
	if (currR.secureConnectionStart) {
		currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
	}
	return currRes;
});

console.table(allRessourcesCalc);