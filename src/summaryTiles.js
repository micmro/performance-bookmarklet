/*
Tiles to summarize page performance
*/


onIFrameLoaded(function(){
	var requestsOnly,
		requestsByDomain,
		currAndSubdomainRequests,
		crossDocDomainRequests,
		hostRequests,
		hostSubdomains,
		slowestCalls,
		average,
		createTile,
		createAppendixDefValue,
		tilesHolder,
		appendix;

	//filter out non-http[s] and sourcemaps
	requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	currAndSubdomainRequests = requestsOnly.filter(function(domain){
		return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
	}).length;

	crossDocDomainRequests = requestsOnly.filter(function(domain){
		return !endsWith(domain.domain, document.domain);
	}).length;

	hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	hostSubdomains = requestsByDomain.filter(function(domain){
		return endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
	}).length;

	if(allResourcesCalc.length > 0){
		slowestCalls = allResourcesCalc.filter(function(a){
			return a.name !== location.href;
		}).sort(function(a, b) {
			return b.duration - a.duration;
		});

		average = Math.floor(slowestCalls.reduceRight(function(a,b){
			if(typeof a !== "number"){
				return a.duration + b.duration
			}
			return a + b.duration;
		}) / slowestCalls.length);
	}


	createTile = function(title, value, titleFontSize){
		titleFontSize = titleFontSize || 60;
		var dl = newTag("dl", {
			class : "summary-tile"
		});
		dl.appendChild(newTag("dt", {childElement : title}));
		dl.appendChild(newTag("dd", {childElement : value}, "font-size:"+titleFontSize+"px;"));
		return dl;
	};

	createAppendixDefValue = function(a, definition, value){
		a.appendChild(newTag("dt", {childElement : definition}));
		a.appendChild(newTag("dd", {text : value}));
	};

	tilesHolder = newTag("section", {
		class : "tiles-holder chart-holder"
	});

	[
		createTile("Requests", requestsOnly.length||"0"),
		createTile("Domains", requestsByDomain.length||"0"),
		createTile(combineNodes("Subdomains of ", newTag("abbr", {title : "Top Level Domain", text : "TLD"})), hostSubdomains||"0"),
		createTile(combineNodes("Requests to ", newTag("span", {title : location.host, text : "Host"})), hostRequests||"0"),
		createTile(combineNodes(newTag("abbr", {title : "Top Level Domain", text : "TLD"}), "& Subdomain Requests"), currAndSubdomainRequests||"0"),
		createTile("Total", perfTiming.loadEventEnd - perfTiming.navigationStart + "ms", 40),
		createTile("Time to First Byte", perfTiming.responseStart - perfTiming.navigationStart + "ms", 40),
		createTile(newTag("span", {title : "domLoading to domContentLoadedEventStart", text : "DOM Content Loading"}), perfTiming.domContentLoadedEventStart - perfTiming.domLoading + "ms", 40),
		createTile(newTag("span", {title : "domLoading to loadEventStart", text : "DOM Processing"}), perfTiming.domComplete - perfTiming.domLoading + "ms", 40)
	].forEach(function(tile){
		tilesHolder.appendChild(tile);
	});

	if(allResourcesCalc.length > 0){
		tilesHolder.appendChild(createTile(newTag("span", {title : slowestCalls[0].name, text : "Slowest Call"}), newTag("span", {title : slowestCalls[0].name, text : Math.floor(slowestCalls[0].duration) + "ms"}), 40));
		tilesHolder.appendChild(createTile("Average Call", average + "ms", 40));
	}

	appendix = newTag("dl", {
		class : "summary-tile-appendix"
	});

	createAppendixDefValue(appendix, newTag("abbr", {title : "Top Level Domain", text : "TLD"}, location.host.split(".").slice(-2).join(".")));
	createAppendixDefValue(appendix, newTextNode("Host:"), location.host);
	createAppendixDefValue(appendix, newTextNode("document.domain:"), document.domain);

	tilesHolder.appendChild(appendix);
	outputContent.appendChild(tilesHolder);
});
