/*
Logic for Legned
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";
import waterfall from "../helpers/waterfall";

var legendComponent = {};


var createLegend = function(className, title, dlArray){
	var legendHolder = dom.newTag("div", {
		class : "legend-holder"
	});

	legendHolder.appendChild(dom.newTag("h4", {
		text : title
	}));

	var dl = dom.newTag("dl", {
		class : "legend " + className
	});

	dlArray.forEach((definition) => {
		dl.appendChild(dom.newTag("dt", {
			class : "colorBoxHolder",
			childElement :  dom.newTag("span", {}, "background:"+definition[1])
		}));
		dl.appendChild(dom.newTag("dd", {
			text : definition[0]
		}));
	});
	legendHolder.appendChild(dl);

	return legendHolder;
};

//Legend
legendComponent.init = function(){

	var chartHolder = dom.newTag("section", {
		class : "resource-timing chart-holder"
	});

	chartHolder.appendChild(dom.newTag("h3", {
		text : "Legend"
	}));

	var legendsHolder = dom.newTag("div", {
		class : "legends-group "
	});

	legendsHolder.appendChild(createLegend("initiator-type-legend", "Block color: Initiator Type", [
		["css", "#afd899"],
		["iframe", "#85b3f2"],
		["img", "#bc9dd6"],
		["script", "#e7bd8c"],
		["link", "#89afe6"],
		["swf", "#4db3ba"],
		//["font", "#e96859"],
		["xmlhttprequest", "#e7d98c"]
	]));

	legendsHolder.appendChild(createLegend("navigation-legend", "Navigation Timing", [
		["Redirect", "#ffff60"],
		["App Cache","#1f831f"],
		["DNS Lookup", "#1f7c83"],
		["TCP","#e58226"],
		["SSL Negotiation","#c141cd"],
		["Time to First Byte", "#1fe11f"],
		["Content Download", "#1977dd"],
		["DOM Processing", "#9cc"],
		["DOM Content Loaded", "#d888df"],
		["On Load", "#c0c0ff"]
	]));

	legendsHolder.appendChild(createLegend("resource-legend", "Resource Timing", [
		["Stalled/Blocking", "#cdcdcd"],
		["Redirect", "#ffff60"],
		["App Cache","#1f831f"],
		["DNS Lookup", "#1f7c83"],
		["TCP","#e58226"],
		["SSL Negotiation","#c141cd"],
		["Initial Connection (TCP)", "#e58226"],
		["Time to First Byte", "#1fe11f"],
		["Content Download", "#1977dd"]
	]));

	chartHolder.appendChild(legendsHolder);

	return chartHolder;
};

export default legendComponent;