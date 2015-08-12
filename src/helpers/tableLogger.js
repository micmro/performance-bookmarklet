/*
Log tables in console
*/

var tableLogger = {};

tableLogger.logTable = function(table){
	if(table.data.length > 0 && console.table){
		console.log("\n\n\n" + table.name + ":");
		console.table(table.data, table.columns);
	}
};

tableLogger.logTables = function(tableArr){
	tableArr.forEach(tableLogger.logTable);
};

export default tableLogger;
