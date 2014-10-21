/*https://github.com/nurun/resourceTable*/

(function(){

//scope wide vars
var localResources = [],
	externalResources = [],
	allRessourcesCalc = [],
	fileTypes = [],
	fileTypesBySource = [],
	resources,
	marks,
	perfTiming,
	outputHolder;

//feature check gate
if(window.performance && window.performance.getEntriesByType !== undefined) {
	resources = window.performance.getEntriesByType("resource");
	marks = window.performance.getEntriesByType("mark");
}else if(window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	resources = window.performance.webkitGetEntriesByType("resource");
	marks = window.performance.webkitGetEntriesByType("mark");
}else{
	alert("Oups, looks like this browser does not support the Ressource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	return;
}

if(window.performance.timing){
	perfTiming = window.performance.timing;
}else{
	alert("Oups, looks like this browser does not support performance timing");		
}

var svgNs = "http://www.w3.org/2000/svg";

//remove this bookmarklet from the result
resources = resources.filter(function(currR){
	return !currR.name.match(/http[s]?\:\/\/nurun.github.io\/resourceTable\/.*/);
});


//helper functions
var newTag = function(tagName, id, text, css){
	var tag = document.createElement(tagName);
	tag.textContent = text || "";
	tag.style.cssText = css || "";
	tag.id = id || "";
	return tag;
};

var getRandomColor = function() {
	var letters = '0123456789ABCDEF'.split(''),
		color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

var getItemCount = function(arr, keyName) {
	var counts = {},
		resultArr = [];

	arr.forEach(function(key){
		counts[key] = counts[key] ? counts[key]+1 : 1;
	});

	//pivot data
	for(var fe in counts){
		obj = {};
		obj[keyName||"key"] = fe;
		obj.count = counts[fe];

		resultArr.push(obj);
	}
	return resultArr.sort(function(a, b) {
		return a.count < b.count ? 1 : -1;
	});
};

// find or create holder element
outputHolder = document.getElementById("resourceTable-holder");
if(!outputHolder){
	outputHolder = newTag("div", "resourceTable-holder", "", "position:absolute; top:0; left:0; z-index: 9999; padding:1em 1em 3em; background:rgba(255,255,255, 0.95);");
}else{
	//clear existing data
	while (outputHolder.firstChild) {
		outputHolder.removeChild(outputHolder.firstChild);
	}
}


//Logic for Request pie charts

function createPieChart(data, size){
	//inpired by http://jsfiddle.net/da5LN/62/

	var chart = document.createElementNS(svgNs, "svg:svg"),
		unit = (Math.PI * 2) / 100,
		startAngle = 0; // init startAngle

	var createCircle = function(cx, cy, r, fill){
		var circle = document.createElementNS(svgNs, "circle");
		circle.setAttributeNS(null, "cx", cx);
		circle.setAttributeNS(null, "cy", cy);
		circle.setAttributeNS(null, "r",  r);
		circle.setAttributeNS(null, "fill", fill);
		return circle;
	};

	var getNodeTextWidth = function(textNode){
		var tmp = document.createElementNS(svgNs, "svg:svg");
		tmp.style.visibility = "hidden";
		tmp.appendChild(textNode);
		document.body.appendChild(tmp);
		var nodeWidth = textNode.getBBox().width;
		tmp.parentNode.removeChild(tmp);
		return nodeWidth;
	};

	var createWedge = function(id, size, percentage, labelTxt, colour){
		var path = document.createElementNS(svgNs, "path"), // wedge path
			endAngle = startAngle + (percentage * unit - 0.001),
			labelAngle = startAngle + (percentage/2 * unit - 0.001),
			x1 = (size/2) + (size/2) * Math.sin(startAngle),
			y1 = (size/2) - (size/2) * Math.cos(startAngle),
			x2 = (size/2) + (size/2) * Math.sin(endAngle),
			y2 = (size/2) - (size/2) * Math.cos(endAngle),
			x3 = (size/2) + (size/2.3) * Math.sin(labelAngle),
			y3 = (size/2) - (size/2.3) * Math.cos(labelAngle),
			big = (endAngle - startAngle > Math.PI) ? 1 : 0;

		var d = "M " + (size/2) + "," + (size/2) +	// Start at circle center
				" L " + x1 + "," + y1 +				// Draw line to (x1,y1)
				" A " + (size/2) + "," + (size/2) +	// Draw an arc of radius r
				" 0 " + big + " 1 " +				// Arc details...
				x2 + "," + y2 +						// Arc goes to to (x2,y2)
				" Z";								// Close path back to (cx,cy)
		path.setAttribute("d", d); // Set this path 
		path.setAttribute("fill", colour);
		path.setAttribute("id", id);

		var wedgeTitle = document.createElementNS(svgNs, "title");
		wedgeTitle.textContent = labelTxt;
		path.appendChild(wedgeTitle); // Add tile to wedge path
		path.addEventListener("mouseover", function(evt){
			evt.target.setAttribute("fill", "#ccc");
			document.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
		});
		path.addEventListener("mouseout", function(evt){
			evt.target.setAttribute("fill", colour);
			document.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
		});

		startAngle = endAngle;
		if(percentage > 10){
			var wedgeLabel = document.createElementNS(svgNs, "text");
			wedgeLabel.style.pointerEvents = "none"
			wedgeLabel.textContent = labelTxt;
			wedgeLabel.setAttribute("y", y3);
			wedgeLabel.style.textShadow = "0 0 2px #fff";
			wedgeLabel.style.pointerEvents = "none"

			if(labelAngle < Math.PI){
				wedgeLabel.setAttribute("x", x3 - getNodeTextWidth(wedgeLabel));
			}else{
				wedgeLabel.setAttribute("x", x3);
			}

			return [path, wedgeLabel];
		}			
		return [path];
	};
	
	//setup chart
	chart.setAttribute("width", "100%");
	chart.setAttribute("height", "100%");
	chart.setAttribute("viewBox", "0 0 " + size + " " + size);
	var labelWrap = document.createElementNS(svgNs, "g");
	labelWrap.style.pointerEvents = "none"

	//loop through data and create wedges
	data.forEach(function(dataObj){
		var label = dataObj.label + " (" + dataObj.count + ")";
		var wedgeAndLabel = createWedge(dataObj.id, size, dataObj.perc, label, getRandomColor());
		chart.appendChild(wedgeAndLabel[0]);

		if(wedgeAndLabel[1]){
			labelWrap.appendChild(wedgeAndLabel[1]);
		}
	});

	// foreground circle
	chart.appendChild(createCircle(size/2, size/2, (size*0.05), "#fff"));
	chart.appendChild(labelWrap);
	return chart;
};

var createTable = function(title, data){
	//create table
	var tableHolder = newTag("div", "", "", "float:left; width:100%; overflow-x:auto");
	var table = newTag("table", "", "", "float:left; width:100%;");
	var thead = newTag("thead");
	var tbody = newTag("tbody");
	thead.appendChild(newTag("th", "", title, "text-align: left; padding:0 0.5em 0 0;"));
	thead.appendChild(newTag("th", "", "Requests", "text-align: left; padding:0 0.5em 0 0;"));
	thead.appendChild(newTag("th", "", "Percentage", "text-align: left; padding:0 0.5em 0 0;"));
	table.appendChild(thead);

	data.forEach(function(y){
		var row = newTag("tr", y.id + "-table");
		row.appendChild(newTag("td", "", y.label));
		row.appendChild(newTag("td", "", y.count));
		row.appendChild(newTag("td", "", y.perc.toPrecision(2) + "%"));
		tbody.appendChild(row);
	});

	table.appendChild(tbody);
	tableHolder.appendChild(table);

	return tableHolder;
};

//crunch the resources data into something easier to work with
allRessourcesCalc = resources.map(function(currR, i, arr){
	var urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/),
		maybeFileName = urlFragments[2].split("/").pop(),
		fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1);
	
	var currRes = {
		name : currR.name,
		domain : urlFragments[1],
		initiatorType : currR.initiatorType || fileExtension || "SourceMap or Not Defined",
		fileExtension : fileExtension || "XHR or Not Defined",
		loadtime : currR.duration,
		isLocalDomain : urlFragments[1] === location.host
	};

	if(currR.requestStart){
		currRes.requestStartDelay = currR.requestStart - currR.startTime;
		currRes.dns = currR.domainLookupEnd - currR.domainLookupStart;
		currRes.tcp = currR.connectEnd - currR.connectStart;
		currRes.ttfb = currR.responseStart - currR.startTime;
		currRes.requestDuration = currR.responseStart - currR.requestStart;
	}
	if(currR.secureConnectionStart){
		currRes.ssl = currR.connectEnd - currR.secureConnectionStart;
	}

	if(currRes.isLocalDomain){
		localResources.push(currRes);
	}else{
		externalResources.push(currRes);
	}

	return currRes;
});

//get counts
var fileExtensionCounts = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
	return currR.initiatorType;
}), "fileType");

var fileExtensionCountLocalExt = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
	return currR.initiatorType + " " + (currR.isLocalDomain ? "(local)" : "(extenal)");
}), "fileType");

var requestsByDomain = getItemCount(allRessourcesCalc.map(function(currR, i, arr){
	return currR.domain;
}), "domain");



// create a chart and table section
var setupChart = function(title, data){
	var chartHolder = newTag("div", "", "", "float:left; width:28%; margin: 0 5.3333% 0 0;");

	chartHolder.appendChild(newTag("h1", "", title, "font:bold 16px/18px sans-serif; margin:1em 0;"));
	chartHolder.appendChild(createPieChart(data, 400));
	chartHolder.appendChild(newTag("p", "", "total requests: (" + resources.length + ")"));
	chartHolder.appendChild(createTable(title, data));
	outputHolder.appendChild(chartHolder);
};


// init data for charts

var requestsUnit = resources.length / 100;
setupChart("Requests by Domain", requestsByDomain.map(function(domain){
	domain.perc = domain.count / requestsUnit;
	domain.label = domain.domain;
	domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
	return domain;
}));

setupChart("Requests by Type (local/external domain)", fileExtensionCountLocalExt.map(function(fileType){
	fileType.perc = fileType.count / requestsUnit;
	fileType.label = fileType.fileType;
	fileType.id = "reqByTypeLocEx-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
	return fileType;
}));

setupChart("Requests by Type", fileExtensionCounts.map(function(fileType){
	fileType.perc = fileType.count / requestsUnit;
	fileType.label = fileType.fileType;
	fileType.id = "reqByType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
	return fileType;
}));


//marks WIP Start 
var perfTimingCalc;

(function(){
	perfTimingCalc = {
		totals : {
			"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.navigationStart,
			"ttfb" : perfTiming.responseStart - perfTiming.navigationStart,
			"domProcessing" : perfTiming.domComplete - perfTiming.domLoading
		}
	};
	var startTime = perfTiming.navigationStart;
	var propBaseName;
	for (var perfProp in perfTiming) {
		if(perfTiming.hasOwnProperty(perfProp)){
			if(perfTiming[perfProp]){
				perfTimingCalc[perfProp] = perfTiming[perfProp] - startTime;
				propBaseName = perfProp.match(/(.*)End$/);
				if(propBaseName && perfTiming[propBaseName[1] + "Start"]){
					perfTimingCalc.totals[propBaseName[1]] = perfTiming[perfProp] - perfTiming[propBaseName[1]+"Start"];
				}
			}
		} 
	}

	var timeBlock = function(name, start, end){
		return {
			name : name,
			start : start,
			end : end,
			total : end - start
		}
	};

	perfTimingCalc.blocks = [
		//timeBlock("pageLoadTime", 0, perfTimingCalc.loadEventEnd),
		timeBlock("DOM Processing", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventStart),
		timeBlock("unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd),
		timeBlock("redirect", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd),
		timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart),
		timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd),
		timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd),
		timeBlock("Request", perfTimingCalc.requestStart, perfTimingCalc.responseStart),
		timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd),
		timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete),
		timeBlock("Onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd)
	];
	if(perfTimingCalc.secureConnectionStart){
		perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart));
	}

	var setupTimeLine = function(){
		var chartHolder = newTag("div", "", "", "float:left; width:100%; margin: 25px 0;");
		var svgNs = "http://www.w3.org/2000/svg";
		//var outputHolder = document.getElementById("resourceTable-holder");
		var timeLineHolder = document.createElementNS(svgNs, "svg:svg");
		timeLineHolder.setAttributeNS(null, "width", "100%");
		timeLineHolder.setAttributeNS(null, "height", perfTimingCalc.blocks.length * 15 + "px");
		timeLineHolder.setAttributeNS(null, "fill", "#ccc");

		var timeLineLabelHolder = document.createElementNS(svgNs, "svg:svg");
		timeLineLabelHolder.setAttributeNS(null, "width", "100%");

		var unit = perfTimingCalc.totals.pageLoadTime / 100;

		var createRect = function(width, height, x, y, fill, label){
			var rect = document.createElementNS(svgNs, "rect");
			rect.setAttributeNS(null, "width", (width / unit) + "%");
			rect.setAttributeNS(null, "height", height + "px");
			rect.setAttributeNS(null, "x", (x / unit) + "%");
			rect.setAttributeNS(null, "y", y + "px");
			rect.setAttributeNS(null, "fill", fill);
			if(label){
				var title = document.createElementNS(svgNs, "title");
				title.textContent = label;
				rect.appendChild(title); // Add tile to wedge path
			}
			return rect;
		};


		var bg = createRect(unit*100, 25, 0, 0, "#ccc");
		timeLineHolder.appendChild(bg);

		perfTimingCalc.blocks.forEach(function(block, i){
			timeLineHolder.appendChild(createRect((block.total||1), 25, (block.start||0.001), 0, getRandomColor(), block.name + " (" + block.total + "ms)"));
			
			var wedgeLabel = document.createElementNS(svgNs, "text");
			wedgeLabel.style.pointerEvents = "none"
			wedgeLabel.textContent = block.name + " (" + block.total + "ms)";
			wedgeLabel.setAttribute("y", (15 * i + 45) +"px");
			wedgeLabel.style.textShadow = "0 0 2px #fff";
			wedgeLabel.style.pointerEvents = "none"
			wedgeLabel.setAttribute("x", ((block.start||0.001) / unit) + "%");

			timeLineLabelHolder.appendChild(wedgeLabel);

		});

		timeLineHolder.appendChild(timeLineLabelHolder);
		chartHolder.appendChild(timeLineHolder);




		outputHolder.insertBefore(chartHolder, outputHolder.firstChild);
	};
	setupTimeLine();


})();


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

})();