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

var timeBlock = function(name, start, end){
	return {
		name : name,
		start : start,
		end : end,
		total : ((typeof start !== "number" || typeof end !== "number") ? undefined : (end - start))
	}
};

perfTimingCalc.blocks = [
	//timeBlock("pageLoadTime", 0, perfTimingCalc.loadEventEnd),
	timeBlock("unload", perfTimingCalc.unloadEventStart, perfTimingCalc.unloadEventEnd),
	timeBlock("redirect", perfTimingCalc.redirectStart, perfTimingCalc.redirectEnd),
	timeBlock("App cache", perfTimingCalc.fetchStart, perfTimingCalc.domainLookupStart),
	timeBlock("DNS", perfTimingCalc.domainLookupStart, perfTimingCalc.domainLookupEnd),
	timeBlock("TCP", perfTimingCalc.connectStart, perfTimingCalc.connectEnd),
	timeBlock("Request", perfTimingCalc.requestStart, perfTimingCalc.responseStart),
	timeBlock("Response", perfTimingCalc.responseStart, perfTimingCalc.responseEnd),
	timeBlock("DOM Processing", perfTimingCalc.domLoading, perfTimingCalc.domComplete),
	timeBlock("domContentLoaded Event", perfTimingCalc.domContentLoadedEventStart, perfTimingCalc.domContentLoadedEventEnd),
	timeBlock("Onload Event", perfTimingCalc.loadEventStart, perfTimingCalc.loadEventEnd)
];
/*

  "totals": {
    "pageLoadTime": 5520,
    "ttfb": 714,
    "domProcessing": 4601,
    "loadEvent": 144,
    "domContentLoadedEvent": 29,
    "response": 32,
    "connect": 0,
    "domainLookup": 0,
    "redirect": 374,
    "unloadEvent": 9
  },
  "loadEventEnd": 5520,
  "loadEventStart": 5376,
  "domComplete": 5375,
  "domContentLoadedEventEnd": 1615,
  "domContentLoadedEventStart": 1586,
  "domInteractive": 1586,
  "domLoading": 774,
  "responseEnd": 746,
  "responseStart": 714,
  "requestStart": 379,
  "connectEnd": 377,
  "connectStart": 377,
  "domainLookupEnd": 377,
  "domainLookupStart": 377,
  "fetchStart": 377,
  "redirectEnd": 377,
  "redirectStart": 3,
  "unloadEventEnd": 729,
  "unloadEventStart": 720,
  "navigationStart": 0,
*/


if(perfTimingCalc.secureConnectionStart){
	perfTimingCalc.blocks.push(timeBlock("SSL", perfTimingCalc.connectStart, perfTimingCalc.secureConnectionStart));
}

var setupTimeLine = function(){
	var chartHolder = newTag("div", "", "", "float:left; width:100%; margin: 25px 0;");
	var svgNs = "http://www.w3.org/2000/svg";
	//var outputHolder = document.getElementById("resourceTable-holder");
	var timeLineHolder = document.createElementNS(svgNs, "svg:svg");
	timeLineHolder.setAttributeNS(null, "width", "100%");
	timeLineHolder.setAttributeNS(null, "height", perfTimingCalc.blocks.length * 25 + 45 + "px");
	timeLineHolder.setAttributeNS(null, "fill", "#ccc");

	var timeLineLabelHolder = document.createElementNS(svgNs, "svg:svg");
	timeLineLabelHolder.setAttributeNS(null, "width", "100%");

	var unit = perfTimingCalc.totals.pageLoadTime / 100;

	var createRect = function(width, height, x, y, fill, label){
		var rect = document.createElementNS(svgNs, "rect");
		rect.setAttributeNS(null, "width", (width / unit) + "%");
		rect.setAttributeNS(null, "height", height + "px");
		rect.setAttributeNS(null, "x", (x / unit) + "%");NaN
		rect.setAttributeNS(null, "y", y + "px");
		rect.setAttributeNS(null, "fill", fill);
		if(label){
			var title = document.createElementNS(svgNs, "title");
			title.textContent = label;
			rect.appendChild(title); // Add tile to wedge path
		}
		return rect;
	};


	var barsToShow = perfTimingCalc.blocks.filter(function(block){
		return (typeof block.start == "number" && typeof block.total == "number");
	}).sort(function(a, b){
		return (a.start||0) - (b.start||0);
	});
	barsToShow.unshift(timeBlock("total", 0, perfTimingCalc.totals.pageLoadTime));

	barsToShow.forEach(function(block, i){
		var blockWidth = block.total||1;
		var y = 25 * (i+1);
		timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, getRandomColor(), block.name + " (" + block.total + "ms)"));
		
		var blockLabel = document.createElementNS(svgNs, "text");
		blockLabel.style.pointerEvents = "none"
		blockLabel.textContent = block.name + " (" + block.total + "ms)";			
		blockLabel.style.textShadow = "0 0 2px #fff";
		blockLabel.style.pointerEvents = "none";
		
		blockLabel.setAttribute("fill", "#000");
		blockLabel.setAttribute("y", (y + 18) + "px");

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
	chartHolder.appendChild(timeLineHolder);
	outputHolder.insertBefore(chartHolder, outputHolder.firstChild);
};
setupTimeLine();