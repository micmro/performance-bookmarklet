document.body.appendChild(outputHolder);

// also output the data as table in console
console.log("\n\n\nAll loaded ressources:");
console.table(allRessourcesCalc);

console.log("\n\n\nRequests by domain");
console.table(requestsByDomain, ["domain", "count", "perc"]);

console.log("\n\n\nFile type count (local / external):");
console.table(fileExtensionCountLocalExt, ["fileType", "count", "perc"]);

console.log("\n\n\nFile type count:");
console.table(fileExtensionCounts, ["fileType", "count", "perc"]);

//timeling from window.performance.timing
console.log("\n\n\nNavigation Timeline:");
console.table(perfTimingCalc.blocks);

console.log("\n\n\nAll times (in ms since navigationStart):");
console.log(perfTimingCalc);