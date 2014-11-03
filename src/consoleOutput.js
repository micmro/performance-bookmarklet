/*
Footer that finally outputs the data to the DOM and the console
*/

window.outputHolder = outputHolder;


//add charts to body
outputIFrame.body.appendChild(outputHolder);

// also output the data as table in console
tablesToLog.forEach(function(table, i){
	if(table.data.length > 0 && console.table){
		console.log("\n\n\n" + table.name + ":");
		console.table(table.data, table.columns);
	}
});