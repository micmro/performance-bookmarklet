//marks WIP Start 

var perfTimingCalc = {
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
	//timeBlock("pageLoadTime", 0, perfTimingCalc.loadEventEnd),
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

var setupTimeLine = function(){
	var chartHolder = newTag("div", {}, "float:left; width:100%; margin: 25px 0;");
	var timeLineHolder = newElementNs("svg:svg", {
		width : "100%",
		height : perfTimingCalc.blocks.length * 25  + "px",
		fill : "#ccc"
	});
	var timeLineLabelHolder = newElementNs("g", { width : "100%" });
	var timeHolder = newElementNs("g", { width : "100%" });

	var unit = perfTimingCalc.totals.pageLoadTime / 100;

	var createRect = function(width, height, x, y, fill, label){
		var rect = newElementNs("rect", {
			width : (width / unit) + "%",
			height : height + "px",
			x :  (x / unit) + "%",
			y : y + "px",
			fill : fill
		});
		if(label){
			rect.appendChild(newElementNs("title", {
				text : label
			})); // Add tile to wedge path
		}
		return rect;
	};

	for(var i = 0, secs = perfTimingCalc.totals.pageLoadTime / 1000, secPerc = 100 / secs; i <= secs; i++){
		var lineLabel = newTextElementNs(i + "sec", "100%");
		if(i > secs - 0.2){
			lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
			lineLabel.setAttribute("text-anchor", "end");
		}else{
			lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
		}
		
		var lineEl = newElementNs("line", {
			x1 : secPerc * i + "%",
			y1 : "0px",
			x2 : secPerc * i + "%",
			y2 : "100%"
		}, "stroke:#ccc; stroke-width:1");
		timeHolder.appendChild(lineEl);
		timeHolder.appendChild(lineLabel);
	}
	timeLineHolder.appendChild(timeHolder);


	var barsToShow = perfTimingCalc.blocks.filter(function(block){
		return (typeof block.start == "number" && typeof block.total == "number");
	}).sort(function(a, b){
		return (a.start||0) - (b.start||0);
	});
	barsToShow.unshift(timeBlock("total", 0, perfTimingCalc.totals.pageLoadTime, "#ccc"));

	barsToShow.forEach(function(block, i){
		var blockWidth = block.total||1;
		var y = 25 * i;
		timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.total + "ms)"));

		var blockLabel = newTextElementNs(block.name + " (" + block.total + "ms)", (y + 18) + "px");

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
	}, "font:bold 16px/18px sans-serif; margin:1em 0; color:#666;"));
	chartHolder.appendChild(timeLineHolder);
	outputContent.insertBefore(chartHolder, outputContent.firstChild);
};
setupTimeLine();