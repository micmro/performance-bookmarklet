/*
Logic for Request analysis table
*/


onIFrameLoaded(function(){
	var requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	window.requestsOnly = requestsOnly;

	var output = requestsOnly.reduce(function(collectObj, currR){
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

	var outputHtml = "<table><thead>";
	[
		"FileType",
		"Count",
		"Count Internal",
		"count external",
		"Initiator Type",
		"Count by Initiator Type",
		"Initiator Type Internal",
		"Initiator Type external"
	].map(function(title){
		outputHtml += "<th>" + title + "</th>\n";
	});

	outputHtml +=  "</thead><tbody>\n"

	Object.keys(output).forEach(function(key){
		var fileTypeData = output[key],
			initiatorTypeKeys = Object.keys(fileTypeData.initiatorType),
			firstinitiatorTypeKey = fileTypeData.initiatorType[initiatorTypeKeys[0]],
			rowspan = initiatorTypeKeys.length;

		console.log(fileTypeData, initiatorTypeKeys);

		outputHtml += "<tr>\n";

		[
			fileTypeData.fileType,
			fileTypeData.count,
			fileTypeData.requestsToHost,
			fileTypeData.requestsToExternal,
			firstinitiatorTypeKey.initiatorType,
			firstinitiatorTypeKey.count,
			firstinitiatorTypeKey.requestsToHost,
			firstinitiatorTypeKey.requestsToExternal,

		].forEach(function(val, i){
			outputHtml += "\t<td" + ((i < 4 && initiatorTypeKeys.length > 1) ? " rowspan=\""+rowspan+"\"" : "") + ">" + val + "</td>\n";
		});
		outputHtml += "</tr>";

		initiatorTypeKeys.slice(1).forEach(function(initiatorTypeKey){
			var initiatorTypeData = fileTypeData.initiatorType[initiatorTypeKey];
			console.log(initiatorTypeData);
			outputHtml += "<tr>\n\t<td>" + initiatorTypeKey + "</td><td>" + initiatorTypeData.count + "</td><td>" + initiatorTypeData.requestsToHost + "</td><td>" + initiatorTypeData.requestsToExternal + "</td>\n</tr>\n"
		});
	});

	outputHtml += "\n</tbody></table>";

	// outputContent.appendChild(outputHtml);
	console.log(outputHtml);


	//| FileType || Count || Count Internal || count external || Count by Initiator Type || Initiator Type Internal || Initiator Type external ||

	/*
	<table>
		<thead>
			<tr>
				<th>FileType</th>
				<th>Count</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<tr rowspan="x">JS</tr>
				<tr rowspan="x">4</tr>

			</tr>
		</tbody>
	</table>

	*/
});
