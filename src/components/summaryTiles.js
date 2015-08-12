/*
Tiles to summarize page performance
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";

var summaryTilesComponent = {};


summaryTilesComponent.init = function(){

	var createTile = function(title, value, titleFontSize){
		titleFontSize = titleFontSize || 60;
		var dl = dom.newTag("dl", {
			class : "summary-tile"
		});
		dl.appendChild(dom.newTag("dt", {childElement : title}));
		dl.appendChild(dom.newTag("dd", {childElement : value}, "font-size:"+titleFontSize+"px;"));
		return dl;
	};

	var createAppendixDefValue = function(a, definition, value){
		a.appendChild(dom.newTag("dt", {childElement : definition}));
		a.appendChild(dom.newTag("dd", {text : value}));
	};

	var tilesHolder = dom.newTag("section", {
		class : "tiles-holder chart-holder"
	});
	var appendix = dom.newTag("dl", {
		class : "summary-tile-appendix"
	});

	[
		createTile("Requests", data.requestsOnly.length||"0"),
		createTile("Domains", data.requestsByDomain.length||"0"),
		createTile(dom.combineNodes("Subdomains of ", dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"})), data.hostSubdomains||"0"),
		createTile(dom.combineNodes("Requests to ", dom.newTag("span", {title : location.host, text : "Host"})), data.hostRequests||"0"),
		createTile(dom.combineNodes(dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"}), " & Subdomain Requests"), data.currAndSubdomainRequests||"0"),
		createTile("Total", data.perfTiming.loadEventEnd - data.perfTiming.navigationStart + "ms", 40),
		createTile("Time to First Byte", data.perfTiming.responseStart - data.perfTiming.navigationStart + "ms", 40),
		createTile(dom.newTag("span", {title : "domLoading to domContentLoadedEventStart", text : "DOM Content Loading"}), data.perfTiming.domContentLoadedEventStart - data.perfTiming.domLoading + "ms", 40),
		createTile(dom.newTag("span", {title : "domLoading to loadEventStart", text : "DOM Processing"}), data.perfTiming.domComplete - data.perfTiming.domLoading + "ms", 40)
	].forEach(function(tile){
		tilesHolder.appendChild(tile);
	});

	if(data.allResourcesCalc.length > 0){
		tilesHolder.appendChild(createTile(dom.newTag("span", {title : data.slowestCalls[0].name, text : "Slowest Call"}), dom.newTag("span", {title : data.slowestCalls[0].name, text : Math.floor(data.slowestCalls[0].duration) + "ms"}), 40));
		tilesHolder.appendChild(createTile("Average Call", data.average + "ms", 40));
	}

	createAppendixDefValue(appendix, dom.newTag("abbr", {title : "Top Level Domain", text : "TLD"}, location.host.split(".").slice(-2).join(".")));
	createAppendixDefValue(appendix, dom.newTextNode("Host:"), location.host);
	createAppendixDefValue(appendix, dom.newTextNode("document.domain:"), document.domain);

	tilesHolder.appendChild(appendix);
	return tilesHolder;
};

export default summaryTilesComponent;
