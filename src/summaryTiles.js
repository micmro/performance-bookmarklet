/*
Tiles to summarize page performance
*/


(function(){

	//filter out non-http[s] and sourcemaps
	var requestsOnly = allRessourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	var requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	var currAndSubdomainRequests = requestsOnly.filter(function(domain){
		return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
	}).length;

	var crossDocDomainRequests = requestsOnly.filter(function(domain){
		return !endsWith(domain.domain, document.domain);
	}).length;

	var hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	var hostSubdomains = requestsByDomain.filter(function(domain){
		return endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
	}).length;

	var slowestCalls = allRessourcesCalc.filter(function(a){
		return a.name !== location.href;
	}).sort(function(a, b) {
		return b.duration - a.duration;
	});

	var average = Math.floor(slowestCalls.reduceRight(function(a,b){
		if(typeof a !== "number"){
			return a.duration + b.duration
		}
		return a + b.duration;
	}) / slowestCalls.length);


	var createTile = function(title, value, titleFontSize){
		titleFontSize = titleFontSize || 60;
		var dl = newTag("dl", {}, "float:left; width:13%; min-width:150px; background:#ddd; padding: 1em; margin:0 2% 1em 0; color:#666; text-align:center;");
		dl.appendChild(newTag("dt", {html : title}, "font-weight:bold; font-size:16px; display:block; line-height:1.2em; min-height:2.4em; padding:0 0 0.5em;"));
		dl.appendChild(newTag("dt", {html : value}, "font-weight:bold; font-size:"+titleFontSize+"px; line-height:60px;"));
		return dl;
	};

	var createAppendixDefValue = function(a, definition, value){
		a.appendChild(newTag("dt", {html : definition}, "float:left; clear:both;"));
		a.appendChild(newTag("dd", {html : value}, "float:left; margin:0 0 0 1em;"));
	};

	var tilesHolder = newTag("div", {}, "float:left; margin: 2em 0 1em; width:102%; overflow-x:auto");
	
	tilesHolder.appendChild(createTile("Requests", requestsOnly.length||"0"));
	tilesHolder.appendChild(createTile("Domains", requestsByDomain.length||"0"));
	tilesHolder.appendChild(createTile("Subdomains of <abbr title=\"Top Level Domain\">TLD</abbr>", hostSubdomains||"0"));
	tilesHolder.appendChild(createTile("Requests to <span title=\""+location.host+"\">Host</span>", hostRequests||"0"));
	tilesHolder.appendChild(createTile("<abbr title=\"Top Level Domain\">TLD</abbr> & Subdomain Requests", currAndSubdomainRequests||"0"));
	tilesHolder.appendChild(createTile("Total", perfTiming.loadEventEnd - perfTiming.navigationStart + "ms", 40));
	tilesHolder.appendChild(createTile("Time to First Byte", perfTiming.responseStart - perfTiming.navigationStart + "ms", 40));
	tilesHolder.appendChild(createTile("<span title=\"domLoading to domContentLoadedEventStart\">DOM Content Loading</span>", perfTiming.domContentLoadedEventStart - perfTiming.domLoading + "ms", 40));
	tilesHolder.appendChild(createTile("<span title=\"domLoading to loadEventStart\">DOM Processing</span>", perfTiming.domComplete - perfTiming.domLoading + "ms", 40));
	tilesHolder.appendChild(createTile("<span title=\"" + slowestCalls[0].name +"\">Slowest Call</span>", "<span title=\"" + slowestCalls[0].name +"\">"+ Math.floor(slowestCalls[0].duration) + "ms</span>", 40));
	tilesHolder.appendChild(createTile("Average Call", average + "ms", 40));



	var appendix = newTag("dl", {}, "float:left; clear:both; width:100%; font-size:10px; line-height:1.1em; color:#666;");

	createAppendixDefValue(appendix, "<abbr title=\"Top Level Domain\">TLD</abbr>:", location.host.split(".").slice(-2).join("."));
	createAppendixDefValue(appendix, "Host:", location.host);
	createAppendixDefValue(appendix, "document.domain:", document.domain);

	tilesHolder.appendChild(appendix);
	outputContent.appendChild(tilesHolder);
}());