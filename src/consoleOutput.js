//add charts to body
document.body.appendChild(outputHolder);


// also output the data as table in console
tablesToLog.forEach(function(table, i){
	// console.log("\n\n\n" + table.name + ":");
	// console.table(table.data, table.columns);
});