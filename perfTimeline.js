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
		timeLineHolder.setAttributeNS(null, "fill", "#ccc");

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

		perfTimingCalc.blocks.forEach(function(block){
			timeLineHolder.appendChild(createRect((block.total||1), 25, (block.start||0.001), 0, getRandomColor(), block.name + " (" + block.total + "ms)"));
			timeLineHolder
		});

		chartHolder.appendChild(timeLineHolder);

		outputHolder.insertBefore(chartHolder, outputHolder.firstChild);
	};
	setupTimeLine();


})();