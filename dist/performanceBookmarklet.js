/*https://github.com/nurun/performance-bookmarklet
 by Michael Mrowetz @MicMro*/

(function(){
/*
Initiallize Bookmarklet wide variables, holders and helpers - all other files only don't share scope
*/

//bookmarklet wide vars
var tablesToLog = [],	
	resources,
	allRessourcesCalc,
	marks,
	perfTiming,
	iFrameEl,
	outputIFrame,
	outputHolder,
	outputContent;

//feature check gate
if(window.performance && window.performance.getEntriesByType !== undefined) {
	resources = window.performance.getEntriesByType("resource");
	marks = window.performance.getEntriesByType("mark");
}else if(window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	resources = window.performance.webkitGetEntriesByType("resource");
	marks = window.performance.webkitGetEntriesByType("mark");
}else{
	alert("Oups, looks like this browser does not support the Resource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	return;
}

if(window.performance.timing){
	perfTiming = window.performance.timing;
}else{
	alert("Oups, looks like this browser does not support performance timing");
	return;
}

if(perfTiming.loadEventEnd - perfTiming.navigationStart < 0){
	alert("Page is still loading - please try again when page is loaded.");
	return;
}


allRessourcesCalc = resources.filter(function(currR){
		//remove this bookmarklet from the result
		return !currR.name.match(/http[s]?\:\/\/nurun.github.io\/performance-bookmarklet\/.*/);
	}).map(function(currR, i, arr){
		//crunch the resources data into something easier to work with
		var isRequest = currR.name.indexOf("http") === 0,
			urlFragments, maybeFileName, fileExtension;

		if(isRequest){
			urlFragments = currR.name.match(/:\/\/(.[^/]+)([^?]*)\??(.*)/);
			maybeFileName = urlFragments[2].split("/").pop();
			fileExtension = maybeFileName.substr((Math.max(0, maybeFileName.lastIndexOf(".")) || Infinity) + 1);
		}else{
			urlFragments = ["", location.host];
			fileExtension = currR.name.split(":")[0];
		}

		var currRes = {
			name : currR.name,
			domain : urlFragments[1],
			initiatorType : currR.initiatorType || fileExtension || "SourceMap or Not Defined",
			fileExtension : fileExtension || "XHR or Not Defined",
			loadtime : currR.duration,
			isLocalDomain : urlFragments[1] === location.host
		};

		for(var attr in currR){
			if(typeof currR[attr] !== "function") {
				currRes[attr] = currR[attr];
			}
		}

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
		
		return currRes;
	});

tablesToLog.push({
	name : "All loaded ressources",
	data : allRessourcesCalc,
	columns : ["name", "domain", "initiatorType", "fileExtension", "loadtime", "isLocalDomain", "requestStartDelay", "dns", "tcp", "ttfb", "requestDuration", "ssl"]
});


//helper functions

//creat html tag
var newTag = function(tagName, settings, css){
	settings = settings || {};
	var tag = document.createElement(tagName);
	for(var attr in settings){
		if(attr != "text"){
			tag[attr] = settings[attr];
		}
	}
	tag.textContent = settings.text||"";
	tag.style.cssText = css||"";
	return tag;
};

//create svg element
var newElementNs = function(tagName, settings, css){
	var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	settings = settings || {};
	for(var attr in settings){
		if(attr != "text"){
			el.setAttributeNS(null, attr, settings[attr]);
		}
	}
	el.textContent = settings.text||"";
	el.style.cssText = css||"";
	return el;
};

var newTextElementNs = function(text, y, css){
	return newElementNs("text", {
			fill : "#111",
			y : y,
			text : text
		}, (css||"") + " text-shadow:0 0 4px #fff;");
};

var getNodeTextWidth = function(textNode){
	var tmp = newElementNs("svg:svg", {}, "visibility:hidden;");
	tmp.appendChild(textNode);
	outputIFrame.body.appendChild(tmp);
	var nodeWidth = textNode.getBBox().width;
	tmp.parentNode.removeChild(tmp);
	return nodeWidth;
};

var getRandomColor = function(baseRangeRed, baseRangeGreen, baseRangeBlue){
	var range = [baseRangeRed||"0123456789ABCDEF", baseRangeGreen||"0123456789ABCDEF", baseRangeBlue||"0123456789ABCDEF"];
	var color = "#";
	var r = 0;
	for (var i = 0; i < 6; i++){
		r = Math.floor(i/2);
		color += range[r].split("")[Math.floor(Math.random() * range[r].length)];
	}
	return color;
};

var endsWith = function(str, suffix){
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var getInitiatorTypeColour = function(initiatorType, fallbackColour){
	var colour = fallbackColour||"#d6d6d7"; //default

	//colour the resources by initiator type
	switch(initiatorType) {
		case "css" : colour = "#c5efaf"; break;
		case "iframe" : colour = "#85b3f2"; break;
		case "img" : colour = "#c98dfd"; break;
		case "script" : colour = "#feb06a"; break; 
		case "link" : colour = "#6c7385"; break;
		case "xmlhttprequest" : colour = "#efef70"; break;
	}
	return colour;
};


var getItemCount = function(arr, keyName){
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



//setup iFrame overlay
iFrameEl = document.getElementById("perfbook-iframe");
if(iFrameEl){
	outputIFrame = iFrameEl.contentWindow.document;
	outputHolder = outputIFrame.getElementById("perfbook-holder");
}else{
	//var outputIFrameEl = newTag("iframe", {id : "perfbook-iframe"}, "position:fixed; top:0; left:0; right:0; z-index: 9999; width:100%; height:100%;");
	iFrameEl = newTag("iframe", {id : "perfbook-iframe"}, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index: 9999; width:98%; z-index: 9999; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
	document.body.appendChild(iFrameEl);
	outputIFrame = iFrameEl.contentWindow.document;
	outputIFrame.body.style.overflow = "hidden";
}

// find or create holder element
if(!outputHolder){
	outputHolder = newTag("div", {id : "perfbook-holder"}, "overflow: hidden; font:normal 12px/18px sans-serif; width:100%; padding:1em 2em 3em; box-sizing:border-box;");
	outputContent = newTag("div", {id : "perfbook-content"}, "position:relative;");
		
	var closeBtn = newTag("button", {
		class : "perfbook-close",
		text: "close"
	}, "position:absolute; top:0; right:0; padding:1em 0.5em; z-index:1; background:transparent; border:0; cursor:pointer;");
	closeBtn.addEventListener("click", function(){
		iFrameEl.parentNode.removeChild(iFrameEl);
	});

	outputHolder.appendChild(closeBtn);
	outputHolder.appendChild(outputContent);
}else{
	outputContent = outputIFrame.getElementById("perfbook-content");
	//clear existing data
	while (outputContent.firstChild) {
		outputContent.removeChild(outputContent.firstChild);
	}
}



/*
Logic for Naviagtion Timing API and Markers Waterfall
*/


(function(){

	var perfTimingCalc = {
		"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.navigationStart,
		"output" : []
	};
	var startTime = perfTiming.navigationStart;
	var propBaseName;

	for(var perfProp in perfTiming) {
		if(perfTiming[perfProp] && typeof perfTiming[perfProp] === "number"){
			perfTimingCalc[perfProp] = perfTiming[perfProp] - startTime;
			perfTimingCalc.output.push({
				"name" : perfProp,
				"time (ms)" : perfTiming[perfProp] - startTime
			});
		}
	}

	perfTimingCalc.output.sort(function(a, b){
		return (a["time (ms)"]||0) - (b["time (ms)"]||0);
	});

	var timeBlock = function(name, start, end, colour){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour
		}
	};

	perfTimingCalc.blocks = [
		timeBlock("total", 0, perfTimingCalc.pageLoadTime, "#ccc"),
		timeBlock("ttfb", perfTimingCalc.navigationStart, perfTimingCalc.responseStart, "#bbb"),
		timeBlock("unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd, "#909"),
		timeBlock("redirect", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd, "#009"),
		timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart, "#099"),
		timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd, "#090"),
		timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd, "#990"),
		timeBlock("Request", perfTimingCalc.requestStart, perfTimingCalc.responseStart, "#c90"),
		timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd, "#6c0"),
		timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete, "#9cc"),
		timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd, "#c33"),
		timeBlock("Onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd, "#cf3")
	];

	if(perfTimingCalc.secureConnectionStart){
		perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart, "#990"));
	}
	if(perfTimingCalc.msFirstPaint){
		perfTimingCalc.blocks.push(timeBlock("msFirstPaint Event", perfTimingCalc.msFirstPaint, perfTimingCalc.msFirstPaint, "#c33"));
	}
	if(perfTimingCalc.domInteractive){
		perfTimingCalc.blocks.push(timeBlock("domInteractive Event", perfTimingCalc.domInteractive, perfTimingCalc.domInteractive, "#c33"));
	}

	

	var setupTimeLine = function(){
		var unit = perfTimingCalc.pageLoadTime / 100;
		var barsToShow = perfTimingCalc.blocks.filter(function(block){
			return (typeof block.start == "number" && typeof block.total == "number");
		}).sort(function(a, b){
			return (a.start||0) - (b.start||0);
		});
		var maxMarkTextLength = marks.length > 0 ? marks.reduce(function(currMax, currValue) {
			return Math.max((typeof currMax == "number" ? currMax : 0), getNodeTextWidth( newTextElementNs(currValue.name, "0")));
		}) : 0;

		var diagramHeight = (barsToShow.length + 2) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 5;

		var chartHolder = newTag("div", {}, "float:left; width:100%; margin: 25px 0;");
		var timeLineHolder = newElementNs("svg:svg", {
			width : "100%",
			height : chartHolderHeight,
			fill : "#ccc"
		}, "background:#f0f5f0; min-width:1px;");
		var timeLineLabelHolder = newElementNs("g", { width : "100%", class : "labels"});
		

		var createRect = function(width, height, x, y, fill, label){
			var rect = newElementNs("rect", {
				width : (width / unit) + "%",
				height : height,
				x :  (x / unit) + "%",
				y : y,
				fill : fill
			});
			if(label){
				rect.appendChild(newElementNs("title", {
					text : label
				})); // Add tile to wedge path
			}
			return rect;
		};

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { width : "100%", class : "time-scale" });
			for(var i = 0, secs = perfTimingCalc.pageLoadTime / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight, "font-weight:bold;");
				if(i > secs - 0.2){
					lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
					lineLabel.setAttribute("text-anchor", "end");
				}else{
					lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
				}
				
				var lineEl = newElementNs("line", {
					x1 : secPerc * i + "%",
					y1 : "0",
					x2 : secPerc * i + "%",
					y2 : diagramHeight
				}, "stroke:#0cc; stroke-width:1;");
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		
		var renderMarks = function(){
			var marksHolder = newElementNs("g", { width : "100%", transform : "scale(1, 1)", class : "marker-holder" });
			var markerColour = "#aac";

			marks.forEach(function(mark, i){
				//mark.duration
				var markHolder = newElementNs("g", {});
				var lineHolder = newElementNs("g", {}, "stroke:"+markerColour+"; stroke-width:1");
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight + 25 );
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : "0px",
					x2 : x + "%",
					y2 : diagramHeight
				}));

				if(marks[i-1] && mark.x - marks[i-1].x < 1){
					lineLabel.setAttribute("x", marks[i-1].x+1 + "%");
					mark.x = marks[i-1].x+1;
				}

				//would use polyline but can't use percentage for points 
				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : diagramHeight,
					x2 : mark.x + "%",
					y2 : diagramHeight + 23
				}));

				markHolder.addEventListener("mouseover", function(evt){
					lineHolder.style.stroke = "#009";
					lineHolder.style.strokeWidth = "2";
					markHolder.parentNode.appendChild(markHolder);
				});
				markHolder.addEventListener("mouseout", function(evt){
					lineHolder.style.strokeWidth = "1";
					lineHolder.style.stroke = markerColour;
				});

				markHolder.appendChild(newElementNs("title", {
					text : mark.name + " (" + Math.round(mark.startTime) + "ms)",
				}));
				markHolder.appendChild(lineHolder);
				markHolder.appendChild(lineLabel);
				marksHolder.appendChild(markHolder);
			});

			return marksHolder;
		};
		
		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function(block, i){
			var blockWidth = block.total||1;
			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)"));

			var blockLabel = newTextElementNs(block.name + " (" + block.total + "ms)", (y + 18));

			if(((block.total||1) / unit) > 10){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + 0.5 + "%");
				blockLabel.setAttribute("width", (blockWidth / unit) + "%");
			}else if(((block.start||0.001) / unit) + (blockWidth / unit) < 80){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + (blockWidth / unit) + 0.5 + "%");
			}else {
				blockLabel.setAttribute("x", (block.start||0.001) / unit - 0.5 + "%");
				blockLabel.setAttribute("text-anchor", "end"); 
			}
			timeLineLabelHolder.appendChild(blockLabel);
		});

		timeLineHolder.appendChild(timeLineLabelHolder);
		chartHolder.appendChild(newTag("h1", {
			text : "Navigation Timing"
		}, "font:bold 18px/18px sans-serif; margin:1em 0; color:#666;"));
		chartHolder.appendChild(timeLineHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine();

	tablesToLog = tablesToLog.concat([
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output},
		{name: "Marks", data : marks, columns : ["name", "startTime", "duration"]}
	]);
}());


/*
Logic for Request analysis pie charts
*/


(function(){
	function createPieChart(data, size){
		//inpired by http://jsfiddle.net/da5LN/62/

		var chart = newElementNs("svg:svg", {
			width : "100%",
			viewBox : "0 0 " + size + " " + size
		}, "float: left; max-height:"+((window.innerWidth * 0.98 - 64) / 3)+"px;");

		var unit = (Math.PI * 2) / 100,
			startAngle = 0; // init startAngle


		var createWedge = function(id, size, percentage, labelTxt, colour){
			var radius = size/2,
				endAngle = startAngle + (percentage * unit - 0.001),
				labelAngle = startAngle + (percentage/2 * unit - 0.001),
				x1 = radius + radius * Math.sin(startAngle),
				y1 = radius - radius * Math.cos(startAngle),
				x2 = radius + radius * Math.sin(endAngle),
				y2 = radius - radius * Math.cos(endAngle),
				x3 = radius + radius * 0.85 * Math.sin(labelAngle),
				y3 = radius - radius * 0.85 * Math.cos(labelAngle),
				big = (endAngle - startAngle > Math.PI) ? 1 : 0;

			var d = "M " + radius + "," + radius +	// Start at circle center
					" L " + x1 + "," + y1 +				// Draw line to (x1,y1)
					" A " + radius + "," + radius +	// Draw an arc of radius r
					" 0 " + big + " 1 " +				// Arc details...
					x2 + "," + y2 +						// Arc goes to to (x2,y2)
					" Z";								// Close path back to (cx,cy)

			var path = newElementNs("path", {
				id : id,
				d : d,
				fill : colour
			});

			path.appendChild(newElementNs("title", {
				text : labelTxt
			})); // Add tile to wedge path
			path.addEventListener("mouseover", function(evt){
				evt.target.style.opacity = "0.5";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
			});
			path.addEventListener("mouseout", function(evt){
				evt.target.style.opacity = "1";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
			});

			startAngle = endAngle;
			if(percentage > 10){
				var wedgeLabel = newTextElementNs(labelTxt, y3);

				//first half or second half
				if(labelAngle < Math.PI){
					wedgeLabel.setAttribute("x", x3 - getNodeTextWidth(wedgeLabel));
				}else{
					wedgeLabel.setAttribute("x", x3);
				}

				return { path: path, wedgeLabel: wedgeLabel};
			}			
			return { path: path };
		};
		
		//setup chart
		var labelWrap = newElementNs("g", {}, "pointer-events:none; font-weight:bold;");
		var wedgeWrap = newElementNs("g");

		//loop through data and create wedges
		data.forEach(function(dataObj){
			var wedgeAndLabel = createWedge(dataObj.id, size, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || getRandomColor());
			wedgeWrap.appendChild(wedgeAndLabel.path);

			if(wedgeAndLabel.wedgeLabel){
				labelWrap.appendChild(wedgeAndLabel.wedgeLabel);
			}
		});

		// foreground circle
		wedgeWrap.appendChild(newElementNs("circle", {
			cx : size/2,
			cy : size/2,
			r : size*0.05,
			fill : "#fff"
		}));
		chart.appendChild(wedgeWrap);
		chart.appendChild(labelWrap);
		return chart;
	};

	var createTable = function(title, data){
		//create table
		var tableHolder = newTag("div", {}, "float:left; width:100%; overflow-x:auto");
		var table = newTag("table", {}, "float:left; width:100%; font-size:12px; line-height:18px;");
		var thead = newTag("thead");
		var tbody = newTag("tbody");
		thead.appendChild(newTag("th", {text : title}, "text-align: left; padding:0 0.5em 0 0;"));
		thead.appendChild(newTag("th", {text : "Requests"}, "text-align: left; padding:0 0.5em 0 0;"));
		thead.appendChild(newTag("th", {text : "Percentage"}, "text-align: left; padding:0 0.5em 0 0;"));
		table.appendChild(thead);

		data.forEach(function(y){
			var row = newTag("tr", {id : y.id + "-table"});
			row.appendChild(newTag("td", {text : y.label}));
			row.appendChild(newTag("td", {text : y.count}));
			row.appendChild(newTag("td", {text : y.perc.toPrecision(2) + "%"}));
			tbody.appendChild(row);
		});

		table.appendChild(tbody);
		tableHolder.appendChild(table);

		return tableHolder;
	};

	//filter out non-http[s] and sourcemaps
	var requestsOnly = allRessourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	//get counts
	fileExtensionCounts = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.initiatorType || currR.fileExtension;
	}), "fileType");

	fileExtensionCountLocalExt = getItemCount(requestsOnly.map(function(currR, i, arr){
		return (currR.initiatorType  || currR.fileExtension) + " " + (currR.isLocalDomain ? "(local)" : "(extenal)");
	}), "fileType");

	requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");



	// create a chart and table section
	var setupChart = function(title, data, countTexts){
		var chartHolder = newTag("div", {}, "float:left; width:28%; margin: 0 5.3333% 0 0;");
		chartHolder.appendChild(newTag("h1", {text : title}, "font:bold 16px/18px sans-serif; margin:1em 0; color:#666; min-height:2em;"));
		chartHolder.appendChild(createPieChart(data, 400));
		chartHolder.appendChild(newTag("p", {text : "Total Requests: " + requestsOnly.length}));
		if(countTexts && countTexts.length){
			countTexts.forEach(function(countText){
				chartHolder.appendChild(newTag("p", {text : countText}, "margin-top:-1em"));
			})
		}
		chartHolder.appendChild(createTable(title, data));
		outputContent.appendChild(chartHolder);
	};


	// init data for charts

	var requestsUnit = requestsOnly.length / 100;
	var colourRangeR = "789abcdef";
	var colourRangeG = "789abcdef";
	var colourRangeB = "789abcdef";
	var currAndSubdomainRequests = requestsOnly.filter(function(domain){
		return domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".");
	}).length;

	var crossDocDomainRequests = requestsOnly.filter(function(domain){
		return !endsWith(domain.domain, document.domain);
	}).length;

	var hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	var hostSubdomains = requestsByDomain.filter(function(domain){
		return endsWith(domain.domain, location.host.split(".").slice(-2).join(".")) && domain.domain !== location.host;
	}).length;

	var requestsByDomainData = requestsByDomain.map(function(domain){
		domain.perc = domain.count / requestsUnit;
		domain.label = domain.domain;
		if(domain.domain === location.host){
			domain.colour = "#0c0";
		}else if(domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".")){
			domain.colour = "#0a0";
		}else{
			domain.colour = getRandomColor("56789abcdef", "01234567", "abcdef");
		}
		domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
		return domain;
	});


	setupChart("Requests by Domain", requestsByDomainData, [
		"Domains Total: " + requestsByDomain.length,
		"Subdomains of TLD: " + hostSubdomains,
		"Current TLD & Subdomain Requests: " + currAndSubdomainRequests,
		"Requests to Host: " + hostRequests,
		"CrossDomain Requests (document.domain): " + crossDocDomainRequests,
		"-----------------------",
		"TLD = Top Level Domain"
	]);

	setupChart("Requests by Initiator Type (local/external domain)", fileExtensionCountLocalExt.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getInitiatorTypeColour((fileType.fileType.split(" ")[0]), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByTypeLocEx-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	setupChart("Requests by Initiator Type", fileExtensionCounts.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getInitiatorTypeColour((fileType.fileType), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	tablesToLog = tablesToLog.concat([
		{name : "Requests by domain", data : requestsByDomain},
		{name : "File type count (local / external)", data : fileExtensionCounts, columns : ["fileType", "count", "perc"]},
		{name : "File type count", data : fileExtensionCountLocalExt, columns : ["fileType", "count", "perc"]}
	]);
}());


/*
Logic for Resource Timing API Waterfall 
*/

(function(){

	var calc = {
		"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.responseStart,
		"lastResponseEnd" : perfTiming.loadEventEnd - perfTiming.responseStart,
	};

	for (var perfProp in perfTiming) {
		if(perfTiming[perfProp] && typeof perfTiming[perfProp] === "number"){
			calc[perfProp] = perfTiming[perfProp] - perfTiming.navigationStart;
		}
	}

	var resourceSectionSegment = function(name, start, end, colour){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour
		}
	};

	var resourceSection = function(name, start, end, colour, segments, rawResource){
		return {
			name : name,
			start : start,
			end : end,
			total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start)),
			colour : colour,
			segments : segments,
			rawResource : rawResource
		}
	};

	calc.blocks = [
		resourceSection("Navigation API total", 0, calc.loadEventEnd, "#ccc", [
			resourceSectionSegment("ttfb", calc.navigationStart, calc.responseStart, "#bbb"),
			resourceSectionSegment("unload", calc.unloadEventStart, calc.unloadEventEnd, "#909"),
			resourceSectionSegment("redirect", calc.redirectStart, calc.redirectEnd, "#009"),
			resourceSectionSegment("App cache", calc.fetchStart, calc.domainLookupStart, "#099"),
			resourceSectionSegment("DNS", calc.domainLookupStart, calc.domainLookupEnd, "#090"),
			resourceSectionSegment("TCP", calc.connectStart, calc.connectEnd, "#990"),
			resourceSectionSegment("Request", calc.requestStart, calc.responseStart, "#c90"),
			resourceSectionSegment("Response", calc.responseStart, calc.responseEnd, "#6c0"),
			resourceSectionSegment("DOM Processing", calc.domLoading, calc.domComplete, "#9cc"),
			resourceSectionSegment("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "#c33"),
			resourceSectionSegment("Onload Event", calc.loadEventStart, calc.loadEventEnd, "#cf3")
		]),
	];

	allRessourcesCalc.forEach(function(resource, i){
		var segments = [
			resourceSectionSegment("redirect", resource.redirectStart, resource.redirectEnd, "#030"),
			resourceSectionSegment("domainLookup", resource.domainLookupStart, resource.domainLookupEnd, "#060"),
			resourceSectionSegment("connect", resource.connectStart, resource.connectEnd, "#090"),
			resourceSectionSegment("secureConnect", resource.secureConnectionStart, resource.connectEnd, "#0c0"),
			resourceSectionSegment("requestToResponseStart", resource.requestStart, resource.responseStart, "#0f0"),
			resourceSectionSegment("response", resource.responseStart, resource.responseEnd, "#0fc")
		];

		calc.blocks.push(resourceSection(resource.name, Math.round(resource.startTime), Math.round(resource.responseEnd), getInitiatorTypeColour(resource.initiatorType), segments, resource));
		calc.lastResponseEnd = Math.max(calc.lastResponseEnd,resource.responseEnd);
	});

	calc.loadDuration = Math.round(calc.lastResponseEnd);

	var setupTimeLine = function(durationMs, blocks){
		var unit = durationMs / 100;
		var barsToShow = blocks.filter(function(block){
			return (typeof block.start == "number" && typeof block.total == "number");
		}).sort(function(a, b){
			return (a.start||0) - (b.start||0);
		});
		var maxMarkTextLength = marks.length > 0 ? marks.reduce(function(currMax, currValue) {
			return Math.max((typeof currMax == "number" ? currMax : 0), getNodeTextWidth( newTextElementNs(currValue.name, "0")));
		}) : 0;

		var diagramHeight = (barsToShow.length + 2) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 5;

		var chartHolder = newTag("div", {}, "float:left; width:100%; margin: 25px 0;");
		var timeLineHolder = newElementNs("svg:svg", {
			width : "100%",
			height : chartHolderHeight,
			fill : "#ccc"
		}, "background:#f0f5f0;");
		var timeLineLabelHolder = newElementNs("g", { width : "100%", class : "labels"});
		

		var createRect = function(width, height, x, y, fill, label, segments){
			var rectHolder;
			var rect = newElementNs("rect", {
				width : (width / unit) + "%",
				height : height-1,
				x :  (x / unit) + "%",
				y : y,
				fill : fill,
				class : (segments && segments.length > 0) ? "main" : "segment"
			});
			if(label){
				rect.appendChild(newElementNs("title", {
					text : label
				})); // Add tile to wedge path
			}
			if(segments && segments.length > 0){
				rectHolder = newElementNs("g");
				rectHolder.appendChild(rect);
				segments.forEach(function(segment){
					if(segment.total > 0 && segment.start){
						rectHolder.appendChild(createRect(segment.total, 8, segment.start||0.001, y,  segment.colour, segment.name + " (" + Math.round(segment.start) + "ms - " +  Math.round(segment.end) + "ms | total: " + Math.round(segment.total) + "ms)"));
					}
				});
				return rectHolder;
			}else{
				return rect;
			}
			
		};

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { width : "100%", class : "time-scale" });
			for(var i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight, "font-weight:bold;");
				if(i > secs - 0.2){
					lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
					lineLabel.setAttribute("text-anchor", "end");
				}else{
					lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
				}
				
				var lineEl = newElementNs("line", {
					x1 : secPerc * i + "%",
					y1 : "0",
					x2 : secPerc * i + "%",
					y2 : diagramHeight
				}, "stroke:#0cc; stroke-width:1;");
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		
		var renderMarks = function(){
			var marksHolder = newElementNs("g", { width : "100%", transform : "scale(1, 1)", class : "marker-holder" });
			var markerColour = "#aac";

			marks.forEach(function(mark, i){
				//mark.duration
				var markHolder = newElementNs("g", {});
				var lineHolder = newElementNs("g", {}, "stroke:"+markerColour+"; stroke-width:1");
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight + 25 );
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : "0px",
					x2 : x + "%",
					y2 : diagramHeight
				}));

				if(marks[i-1] && mark.x - marks[i-1].x < 1){
					lineLabel.setAttribute("x", marks[i-1].x+1 + "%");
					mark.x = marks[i-1].x+1;
				}

				//would use polyline but can't use percentage for points 
				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : diagramHeight,
					x2 : mark.x + "%",
					y2 : diagramHeight + 23
				}));

				lineLabel.addEventListener("mouseover", function(evt){
					//evt.target.parent.
					lineHolder.style.stroke = "#009";
					lineHolder.style.strokeWidth = "2";
					markHolder.parentNode.appendChild(markHolder);
				});
				lineLabel.addEventListener("mouseout", function(evt){
					lineHolder.style.strokeWidth = "1";
					lineHolder.style.stroke = markerColour;
				});

				markHolder.appendChild(newElementNs("title", {
					text : mark.name + " (" + Math.round(mark.startTime) + "ms)",
				}));
				markHolder.appendChild(lineHolder);
				markHolder.appendChild(lineLabel);
				marksHolder.appendChild(markHolder);
			});

			return marksHolder;
		};
		
		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function(block, i){
			var blockWidth = block.total||1;

			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)", block.segments));

			var blockLabel = newTextElementNs(block.name + " (" + block.total + "ms)", (y + 20));

			if(((block.total||1) / unit) > 10 && getNodeTextWidth(blockLabel) < 200){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + 0.5 + "%");
				blockLabel.setAttribute("width", (blockWidth / unit) + "%");
			}else if(((block.start||0.001) / unit) + (blockWidth / unit) < 80){
				blockLabel.setAttribute("x", ((block.start||0.001) / unit) + (blockWidth / unit) + 0.5 + "%");
			}else {
				blockLabel.setAttribute("x", (block.start||0.001) / unit - 0.5 + "%");
				blockLabel.setAttribute("text-anchor", "end"); 
			}
			blockLabel.style.opacity = block.name.match(/js.map$/) ? "0.5" : "1";
			timeLineLabelHolder.appendChild(blockLabel);
		});

		timeLineHolder.appendChild(timeLineLabelHolder);
		chartHolder.appendChild(newTag("h1", {
			text : "Resource Timing"
		}, "font:bold 16px/18px sans-serif; margin:1em 0; color:#666;"));
		chartHolder.appendChild(timeLineHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine(calc.loadDuration, calc.blocks);
}());


/*
Footer that finally outputs the data to the DOM and the console
*/

//add charts to iFrame holder in body
outputIFrame.body.appendChild(outputHolder);
iFrameEl.style.height = outputHolder.clientHeight + "px";


// also output the data as table in console
tablesToLog.forEach(function(table, i){
	if(table.data.length > 0 && console.table){
		console.log("\n\n\n" + table.name + ":");
		console.table(table.data, table.columns);
	}
});

})();