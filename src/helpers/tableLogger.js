/*
Log tables in console
*/

const tableLogger = {};

tableLogger.logTable = (table) => {
	if(table.data.length > 0 && console.table){
		console.log("\n\n\n" + table.name + ":");
		console.table(table.data, table.columns);
	}
};

tableLogger.logTables = (tableArr) => {
	tableArr.forEach(tableLogger.logTable);
};

export default tableLogger;
