/*
Logic for Request analysis table
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";

var tableComponent = {};

tableComponent.init = function(){

	var output = data.requestsOnly.reduce((collectObj, currR) => {
		var fileTypeData = collectObj[currR.fileType],
			initiatorTypeData;

		if(!fileTypeData){
			fileTypeData = collectObj[currR.fileType] = {
				"fileType" : currR.fileType,
				"count" : 0,
				"initiatorType" : {},
				"requestsToHost" : 0,
				"requestsToExternal" : 0
			};
		}

		initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType];
		if(!initiatorTypeData){
			initiatorTypeData = fileTypeData.initiatorType[currR.initiatorType] = {
				"initiatorType" : currR.initiatorType,
				"count" : 0,
				"requestsToHost" : 0,
				"requestsToExternal" : 0
			}
		}

		fileTypeData.count++;
		initiatorTypeData.count++;

		if(currR.isRequestToHost){
			fileTypeData.requestsToHost++;
			initiatorTypeData.requestsToHost++;
		}else{
			fileTypeData.requestsToExternal++;
			initiatorTypeData.requestsToExternal++;
		}

		return collectObj;
	}, {});

	var sectionHolder = dom.newTag("section", {
		class : "table-section-holder chart-holder"
	});
	sectionHolder.appendChild(dom.newTag("h1", {text : "Request FileTypes & Initiators"}));

	
	sectionHolder.appendChild(dom.tableFactory("filetypes-and-intiators-table", (theadTr) => {
			[
				"FileType",
				"Count",
				"Count Internal",
				"Count External",
				"Initiator Type",
				"Count by Initiator Type",
				"Initiator Type Internal",
				"Initiator Type External"
			].forEach((x) => {
				theadTr.appendChild(dom.newTag("th", {
					text : x,
					width : (x.indexOf("ternal") > 0) ? "12%" : ""
				}));
			});
			return theadTr;

		}, (tbody) => {
			Object.keys(output).forEach((key, i) => {
				var fileTypeData = output[key],
					initiatorTypeKeys = Object.keys(fileTypeData.initiatorType),
					firstinitiatorTypeKey = fileTypeData.initiatorType[initiatorTypeKeys[0]],
					rowspan = initiatorTypeKeys.length;

				var tr = dom.newTag("tr", {
					class : "file-type-row " + (fileTypeData.fileType||"other") + "-light"
				});

				[
					fileTypeData.fileType,
					fileTypeData.count,
					fileTypeData.requestsToHost,
					fileTypeData.requestsToExternal,
					firstinitiatorTypeKey.initiatorType,
					firstinitiatorTypeKey.count,
					firstinitiatorTypeKey.requestsToHost,
					firstinitiatorTypeKey.requestsToExternal,

				].forEach((val, i) => {
					var settings = {
						text : val
					};
					if(i < 4 && initiatorTypeKeys.length > 1){
						settings.rowSpan = rowspan;
					}else if(i >= 4){
						settings.class = (initiatorTypeKeys[0]||"other") + "-light";

					}
					tr.appendChild(dom.newTag("td", settings));
				});

				tbody.appendChild(tr);

				initiatorTypeKeys.slice(1).forEach((initiatorTypeKey) => {
					var initiatorTypeData = fileTypeData.initiatorType[initiatorTypeKey];
					var tr2 = dom.newTag("tr", {
						class : "initiator-type-more " + (initiatorTypeKey||"other") + "-light"
					});
					tr2.appendChild(dom.newTag("td", {
						text : initiatorTypeKey
					}));
					tr2.appendChild(dom.newTag("td", {
						text : initiatorTypeData.count
					}));
					tr2.appendChild(dom.newTag("td", {
						text : initiatorTypeData.requestsToHost
					}));  
					tr2.appendChild(dom.newTag("td", {
						text : initiatorTypeData.requestsToExternal
					}));  

					tbody.appendChild(tr2)
				});
			});

			return tbody;
	}));

	return sectionHolder;
}

export default tableComponent;
