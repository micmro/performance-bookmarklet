/*
Misc helpers
*/

"use strict";

var helper = {};

//extract a resources file type
helper.getFileType = function (fileExtension, initiatorType) {
	if (fileExtension) {
		switch (fileExtension) {
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
			case "webp":
			case "svg":
			case "ico":
				return "image";
			case "js":
				return "js";
			case "css":
				return "css";
			case "html":
				return "html";
			case "woff":
			case "woff2":
			case "ttf":
			case "eot":
			case "otf":
				return "font";
			case "swf":
				return "flash";
			case "map":
				return "source-map";
		}
	}
	if (initiatorType) {
		switch (initiatorType) {
			case "xmlhttprequest":
				return "ajax";
			case "img":
				return "image";
			case "script":
				return "js";
			case "internal":
			case "iframe":
				return "html"; //actual page
			default:
				return "other";
		}
	}
	return initiatorType;
};

helper.getRandomColor = function (baseRangeRed, baseRangeGreen, baseRangeBlue) {
	var range = [baseRangeRed || "0123456789ABCDEF", baseRangeGreen || "0123456789ABCDEF", baseRangeBlue || "0123456789ABCDEF"];
	var color = "#";
	var r = 0;
	for (var i = 0; i < 6; i++) {
		r = Math.floor(i / 2);
		color += range[r].split("")[Math.floor(Math.random() * range[r].length)];
	}
	return color;
};

helper.endsWith = function (str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getColourVariation = function getColourVariation(hexColour, variation) {
	var r = (parseInt(hexColour.substr(1, 2), 16) + variation).toString(16);
	var g = (parseInt(hexColour.substr(3, 2), 16) + variation).toString(16);
	var b = (parseInt(hexColour.substr(5, 2), 16) + variation).toString(16);
	return "#" + r + g + b;
};

helper.getInitiatorTypeColour = function (initiatorType, fallbackColour, variation) {
	var colour = fallbackColour || "#bebebe"; //default

	//colour the resources by initiator type
	switch (initiatorType) {
		case "css":
			colour = "#afd899";break;
		case "iframe":
			colour = "#85b3f2";break;
		case "img":
			colour = "#bc9dd6";break;
		case "script":
			colour = "#e7bd8c";break;
		case "link":
			colour = "#89afe6";break;
		case "swf":
			colour = "#4db3ba";break;
		case "font":
			colour = "#e96859";break; //TODO check if this works
		case "xmlhttprequest":
			colour = "#e7d98c";break;
	}
	if (variation === true) {
		return getColourVariation(colour, -5);
	}
	return colour;
};

helper.getFileTypeColour = function (initiatorType, fallbackColour, variation) {
	var colour = fallbackColour || "#bebebe"; //default

	//colour the resources by initiator type
	switch (initiatorType) {
		case "css":
			colour = "#afd899";break;
		case "html":
			colour = "#85b3f2";break;
		case "image":
			colour = "#bc9dd6";break;
		case "js":
			colour = "#e7bd8c";break;
		case "link":
			colour = "#89afe6";break;
		case "swf":
			colour = "#4db3ba";break;
		case "font":
			colour = "#e96859";break; //TODO check if this works
		case "ajax":
			colour = "#e7d98c";break;
	}
	if (variation === true) {
		return getColourVariation(colour, -5);
	}
	return colour;
};

//counts occurences of items in array arr and returns them as array of key valure pairs
//keyName overwrites the name of the key attribute
helper.getItemCount = function (arr, keyName) {
	var counts = {},
	    resultArr = [],
	    obj;

	arr.forEach(function (key) {
		counts[key] = counts[key] ? counts[key] + 1 : 1;
	});

	//pivot data
	for (var fe in counts) {
		obj = {};
		obj[keyName || "key"] = fe;
		obj.count = counts[fe];

		resultArr.push(obj);
	}
	return resultArr.sort(function (a, b) {
		return a.count < b.count ? 1 : -1;
	});
};

module.exports = helper;