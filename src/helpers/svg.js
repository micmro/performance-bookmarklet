/*
SVG Helpers
*/

import {getOutputIFrame} from "../helpers/iFrameHolder";

var svg = {};

svg.newEl = function(tagName, settings, css){
	var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	settings = settings || {};
	for(let attr in settings){
		if(attr != "text"){
			el.setAttributeNS(null, attr, settings[attr]);
		}
	}
	el.textContent = settings.text||"";
	el.style.cssText = css||"";
	return el;
};

svg.newTextEl = function(text, y, css){
	return svg.newEl("text", {
			fill : "#111",
			y : y,
			text : text
		}, (css||"") + " text-shadow:0 0 4px #fff;");
};

//needs access to iFrame
svg.getNodeTextWidth = function(textNode){
	var tmp = svg.newEl("svg:svg", {}, "visibility:hidden;");
	tmp.appendChild(textNode);
	getOutputIFrame().body.appendChild(tmp);

	const nodeWidth = textNode.getBBox().width;
	tmp.parentNode.removeChild(tmp);
	return nodeWidth;
};

export default svg;