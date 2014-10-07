(function(){
	//you can make these global to inspect them
	var localResources = [],
		externalResources = [],
		allRessourcesCalc = [],
		fileTypes = [],
		fileTypesBySource = [];

	
	//helper functions

	var getItemCount = function(arr) {
		var counts = {};
		for(var i = 0; i< arr.length; i++) {
			var num = arr[i];
			counts[num] = counts[num] ? counts[num]+1 : 1;
		}
		return counts;
	};

	var pivotObject = function(sourceObject, keyName){
		var obj;
		var resultArr = [];
		for(var fe in sourceObject){
			obj = {};
			obj[keyName||"key"] = fe;
			obj.count = sourceObject[fe];

			resultArr.push(obj);
		}
		return resultArr.sort(function(a, b) {
			return a.count < b.count ? 1 : -1;
		});
	};


	//feature check

	if(!window.performance || !window.performance.getEntriesByType){
		console.error("\n\nOups, looks like this browser does not support the Ressource Timing API - check http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
		return;
	}


	//crunch the data

	allRessourcesCalc = performance.getEntriesByType("resource").map(function(currR, i, arr){
		var urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
		var maybeFileName = urlFragments[2].split("/").pop();
		var urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
		var fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1)

		var currRes = {
			name : currR.name,
			domain : urlFragments[1],
			initiatorType : currR.initiatorType || fileExtension || "SourceMap or Not Defined",
			fileExtension : fileExtension || "XHR or Not Defined",
			loadtime : currR.duration,
			isLocalDomain : urlFragments[1] === location.host
		};

		if (currR.requestStart) {
			currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
			currRes.tcp = currR.connectEnd - currR.connectStart;
			currRes.ttfb = currR.responseStart - currR.startTime;
		}
		if (currR.secureConnectionStart) {
			currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
		}

		if(currRes.isLocalDomain){
			localResources.push(currRes);
		}else{
			externalResources.push(currRes);
		}

		return currRes;
	});
	
	var fileExtensionCounts = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
		return currR.initiatorType;
	}));

	var fileExtensionCountLocalExt = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
		return currR.initiatorType + " " + (currR.isLocalDomain ? "(local)" : "(extenal)");
	}));

	var requestsByDomain = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
		return currR.domain;
	}));

	console.log("\n\n\nAll loaded ressources:");
	console.table(allRessourcesCalc);

	console.log("\n\n\nFile type count:");
	console.table(pivotObject(fileExtensionCounts, "fileType"));

	console.log("\n\n\nFile type count (local / external):");
	console.table(pivotObject(fileExtensionCountLocalExt, "fileType"));


	console.log("\n\n\nRequests by domain");
	console.table(pivotObject(requestsByDomain, "domain"));

})();