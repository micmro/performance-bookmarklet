/*
Tiles to summarize page performance
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";

var summaryTilesComponent = {};


summaryTilesComponent.init = function(){
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
	requestsOnly = data.allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	requestsByDomain = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	currAndSubdomainRequests = requestsOnly.filter(function(domain){
		return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
	}).length;

	crossDocDomainRequests = requestsOnly.filter(function(domain){
		return !helper.endsWith(domain.domain, document.domain);
	}).length;

	hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	hostSubdomains = requestsByDomain.filter(function(domain){
		return helper.endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
	}).length;

	if(data.allResourcesCalc.length > 0){
		slowestCalls = data.allResourcesCalc.filter(function(a){
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
		var dl = dom.newTag("dl", {
			class : "summary-tile"
		});
		dl.appendChild(dom.newTag("dt", {childElement : title}));
		dl.appendChild(dom.newTag("dd", {childElement : value}, "font-size:"+titleFontSize+"px;"));
		return dl;
	};

	createAppendixDefValue = function(a, definition, value){
		a.appendChild(dom.newTag("dt", {childElement : definition}));
		a.appendChild(dom.newTag("dd", {text : value}));
	};

	tilesHolder = dom.newTag("section", {
		class : "tiles-holder chart-holder"
	});

	[
		createTile("Requests", requestsOnly.length||"0"),
		createTile("Domains", requestsByDomain.length||"0"),
		createTile(dom.combineNodes("Subdomains of ", dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"})), hostSubdomains||"0"),
		createTile(dom.combineNodes("Requests to ", dom.newTag("span", {title : location.host, text : "Host"})), hostRequests||"0"),
		createTile(dom.combineNodes(dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"}), "& Subdomain Requests"), currAndSubdomainRequests||"0"),
		createTile("Total", data.perfTiming.loadEventEnd - data.perfTiming.navigationStart + "ms", 40),
		createTile("Time to First Byte", data.perfTiming.responseStart - data.perfTiming.navigationStart + "ms", 40),
		createTile(dom.newTag("span", {title : "domLoading to domContentLoadedEventStart", text : "DOM Content Loading"}), data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading + "ms", 40),
		createTile(dom.newTag("span", {title : "domLoading to loadEventStart", text : "DOM Processing"}), data.perfTiming.domComplete - data.perfTiming.domLoading + "ms", 40)
	].forEach(function(tile){
		tilesHolder.appendChild(tile);
	});

	if(data.allResourcesCalc.length > 0){
		tilesHolder.appendChild(createTile(dom.newTag("span", {title : slowestCalls[0].name, text : "Slowest Call"}), dom.newTag("span", {title : slowestCalls[0].name, text : Math.floor(slowestCalls[0].duration) + "ms"}), 40));
		tilesHolder.appendChild(createTile("Average Call", average + "ms", 40));
	}

	appendix = dom.newTag("dl", {
		class : "summary-tile-appendix"
	});

	createAppendixDefValue(appendix, dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"}, location.host.split(".").slice(-2).join(".")));
	createAppendixDefValue(appendix, dom.newTextNode("Host:"), location.host);
	createAppendixDefValue(appendix, dom.newTextNode("document.domain:"), document.domain);

	tilesHolder.appendChild(appendix);
	return tilesHolder;
};

export default summaryTilesComponent;
