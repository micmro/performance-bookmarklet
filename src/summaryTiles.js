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


	var createTile = function(title, value){
		var dl = newTag("dl", {}, "float:left; width:10%; min-width:200px; background:#ddd; padding: 1em; margin:0 1em 1em 0; color:#666; text-align:center;");
		dl.appendChild(newTag("dt", {text : title}, "font-weight:bold; font-size:16px; display:block; line-height:1.2em; min-height:2.4em; padding:0 0 0.5em;"));
		dl.appendChild(newTag("dt", {text : value}, "font-weight:bold; font-size:60px; line-height:1em;"));
		return dl;
	};

	var createAppendixDefValue = function(a, definition, value){
		a.appendChild(newTag("dt", {html : definition}, "float:left; clear:both;"));
		a.appendChild(newTag("dd", {html : value}, "float:left; margin:0 0 0 1em;"));
	};

	var tilesHolder = newTag("div", {}, "float:left; width:100%; overflow-x:auto");
	
	tilesHolder.appendChild(createTile("Total Domains", requestsByDomain.length));
	tilesHolder.appendChild(createTile("Subdomains of TLD", hostSubdomains));
	tilesHolder.appendChild(createTile("Current TLD & Subdomain Requests", currAndSubdomainRequests));
	tilesHolder.appendChild(createTile("Requests to Host", hostRequests));
	tilesHolder.appendChild(createTile("CrossDomain Requests (document.domain)", crossDocDomainRequests));


	var appendix = newTag("dl", {}, "float:left; clear:both; width:100%; font-size:10px; line-height:1.1em; color:#666;");

	createAppendixDefValue(appendix, "<abbr title=\"Top Level Domain\">TLD</abbr>:", location.host.split(".").slice(-2).join(".") + " (Top Level Domain)");
	createAppendixDefValue(appendix, "Host:", location.host);
	createAppendixDefValue(appendix, "document.domain:", document.domain);

	tilesHolder.appendChild(appendix);
	outputContent.appendChild(tilesHolder);
}());