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
		}));
		chartHolder.appendChild(timeLineHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine(calc.loadDuration, calc.blocks);
}());