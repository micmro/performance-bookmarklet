//Logic for Naviagtion API / markers timeline

(function(){

	var perfTimingCalc = {
		"pageLoadTime" : perfTiming.loadEventEnd - perfTiming.navigationStart,
		"output" : []
	};
	var startTime = perfTiming.navigationStart;
	var propBaseName;

	for (var perfProp in perfTiming) {
		if(perfTiming.hasOwnProperty(perfProp)){
			if(perfTiming[perfProp]){
				perfTimingCalc[perfProp] = perfTiming[perfProp] - startTime;
				perfTimingCalc.output.push({
					"name" : perfProp,
					"time (ms)" : perfTiming[perfProp] - startTime
				});
			}
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

	var setupTimeLine = function(){
		var unit = perfTimingCalc.pageLoadTime / 100;
		var barsToShow = perfTimingCalc.blocks.filter(function(block){
			return (typeof block.start == "number" && typeof block.total == "number");
		}).sort(function(a, b){
			return (a.start||0) - (b.start||0);
		});

		var diagramHeight = (barsToShow.length + 2) * 25;
		var chartHolder = newTag("div", {}, "float:left; width:100%; margin: 25px 0;");
		var timeLineHolder = newElementNs("svg:svg", {
			width : "100%",
			height : diagramHeight  + "px",
			fill : "#ccc"
		});
		var timeLineLabelHolder = newElementNs("g", { width : "100%", class : "labels"});
		

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

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { width : "100%", class : "time-scale" });
			for(var i = 0, secs = perfTimingCalc.pageLoadTime / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight  + "px");
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
				}, "stroke:#0cc; stroke-width:1");
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		var renderMarks = function(){
			var marksHolder = newElementNs("g", { width : "100%", class : "marker" });


			marks.forEach(function(mark){
				//mark.duration
				var x = mark.startTime / unit;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight  + "px");
				if(x > 95){
					lineLabel.setAttribute("x", x - 0.5 + "%");
					lineLabel.setAttribute("text-anchor", "end");
				}else{
					lineLabel.setAttribute("x", x + 0.5 + "%"); 
				}

				var line = newElementNs("line", {
					x1 : x + "%",
					y1 : "0px",
					x2 : x + "%",
					y2 : diagramHeight + "px"
				}, "stroke:#f00; stroke-width:1");

				line.appendChild(newElementNs("title", {
					text : mark.name,
				}));

				marksHolder.appendChild(line);
				marksHolder.appendChild(lineLabel)
			});

			return marksHolder;
		};
		
		timeLineHolder.appendChild(createTimeWrapper());
		timeLineHolder.appendChild(renderMarks());

		barsToShow.forEach(function(block, i){
			var blockWidth = block.total||1;
			var y = 25 * i;
			timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)"));

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

	tablesToLog = tablesToLog.concat(tablesToLog, [
		{name: "Navigation Timeline", data : perfTimingCalc.blocks, columns : ["name", "start", "end", "total"]},
		{name: "Navigation Events", data : perfTimingCalc.output}
	]);
}());