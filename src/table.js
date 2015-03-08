/*
Logic for Request analysis table
*/


onIFrameLoaded(function(){
	var requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	window.requestsOnly = requestsOnly;

	var output = requestsOnly.reduce(function(collectObj, currR){
		if(collectObj[currR.fileType]){
			collectObj[currR.fileType].count++;
		}else{
			collectObj[currR.fileType] = {
				"fileType" : currR.fileType,
				"count" : 1,
				"initiatorType" : {},
				"requestsToHost" : 0,
				"requestsToExternal" : 0
			};
		}
		collectObj[currR.fileType].initiatorType[currR.initiatorType] = (collectObj[currR.fileType].initiatorType[currR.initiatorType]||0) + 1;
		if(currR.isRequestToHost){
			collectObj[currR.fileType].requestsToHost++;
		}else{
			collectObj[currR.fileType].requestsToExternal++;
		}

		return collectObj;
	}, {});

	Object.keys(output).map(function(key){
		console.log(output[key]);
	});


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
