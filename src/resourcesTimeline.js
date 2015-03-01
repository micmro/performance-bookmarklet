/*
Logic for Resource Timing API Waterfall 
*/

onIFrameLoaded(function(){

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


	var createLegend = function(className, title, dlArray){
		var legendHolder = newTag("div", {
			class : "legend-holder"
		});

		legendHolder.appendChild(newTag("h4", {
			text : title
		}));

		var dl = newTag("dl", {
			class : "legend " + className
		});

		dlArray.forEach(function(definition){
			dl.appendChild(newTag("dt", {
				class : "colorBoxHolder",
				childElement :  newTag("span", {}, "background:"+definition[1])
			}));
			dl.appendChild(newTag("dd", {
				text : definition[0]
			}));
		});
		legendHolder.appendChild(dl);

		return legendHolder;
	};

	var navigationApiTotal = [
		resourceSectionSegment("Unload", calc.unloadEventStart, calc.unloadEventEnd, "#909"),
		resourceSectionSegment("Redirect", calc.redirectStart, calc.redirectEnd, "#ffff60"),
		resourceSectionSegment("App cache", calc.fetchStart, calc.domainLookupStart, "#1f831f"),
		resourceSectionSegment("DNS", calc.domainLookupStart, calc.domainLookupEnd, "#1f7c83"),
		resourceSectionSegment("TCP", calc.connectStart, calc.connectEnd, "#e58226"),
		resourceSectionSegment("Timer to First Byte", calc.requestStart, calc.responseStart, "#1fe11f"),
		resourceSectionSegment("Response", calc.responseStart, calc.responseEnd, "#1977dd"),
		resourceSectionSegment("DOM Processing", calc.domLoading, calc.domComplete, "#9cc"),
		resourceSectionSegment("domContentLoaded Event", calc.domContentLoadedEventStart, calc.domContentLoadedEventEnd, "#d888df"),
		resourceSectionSegment("Onload Event", calc.loadEventStart, calc.loadEventEnd, "#c0c0ff")
	];

	if(calc.secureConnectionStart){
		navigationApiTotal.push(resourceSectionSegment("SSL", calc.connectStart, calc.secureConnectionStart, "#c141cd"));
	}
	if(calc.msFirstPaint){
		navigationApiTotal.push(resourceSectionSegment("msFirstPaint Event", calc.msFirstPaint, calc.msFirstPaint, "#8FBC83"));
	}
	if(calc.domInteractive){
		navigationApiTotal.push(resourceSectionSegment("domInteractive Event", calc.domInteractive, calc.domInteractive, "#d888df"));
	}
	if(!calc.redirectEnd && !calc.redirectStart && calc.fetchStart > calc.navigationStart){
		navigationApiTotal.push(resourceSectionSegment("Cross-Domain Redirect", calc.navigationStart, calc.fetchStart, "#ffff60"));
	}

	calc.blocks = [
		resourceSection("Navigation API total", 0, calc.loadEventEnd, "#ccc", navigationApiTotal),
	];

	allResourcesCalc.forEach(function(resource, i){
		var segments = [
			resourceSectionSegment("Redirect", resource.redirectStart, resource.redirectEnd, "#ffff60"),
			resourceSectionSegment("DNS Lookup", resource.domainLookupStart, resource.domainLookupEnd, "#1f7c83"),
			resourceSectionSegment("Initial Connection (TCP)", resource.connectStart, resource.connectEnd, "#e58226"),
			resourceSectionSegment("secureConnect", resource.secureConnectionStart||undefined, resource.connectEnd, "#c141cd"),
			resourceSectionSegment("Timer to First Byte", resource.requestStart, resource.responseStart, "#1fe11f"),
			resourceSectionSegment("Content Download", resource.responseStart||undefined, resource.responseEnd, "#1977dd")
		];

		var resourceTimings = [0, resource.redirectStart, resource.domainLookupStart, resource.connectStart, resource.secureConnectionStart, resource.requestStart, resource.responseStart];

		var firstTiming = resourceTimings.reduce(function(currMinTiming, currentValue) {
			if(currentValue > 0 && (currentValue < currMinTiming || currMinTiming <= 0) && currentValue != resource.startTime){
				return currentValue;
			} else {
				return currMinTiming;
			}
		});

		if(resource.startTime < firstTiming){
			segments.unshift(resourceSectionSegment("Stalled/Blocking", resource.startTime, firstTiming, "#cdcdcd"));
		}

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

		var diagramHeight = (barsToShow.length + 1) * 25;
		var chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

		var chartHolder = newTag("div", {
			class : "resource-timing water-fall-holder chart-holder"
		});
		var timeLineHolder = newElementNs("svg:svg", {
			height : Math.floor(chartHolderHeight),
			class : "water-fall-chart"
		});
		var timeLineLabelHolder = newElementNs("g", {class : "labels"});

		var endline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-end"
		});
		
		var startline = newElementNs("line", {
			x1 : "0",
			y1 : "0",
			x2 : "0",
			y2 : diagramHeight,
			class : "line-start"
		});

		var onRectMouseEnter = function(evt){
			var targetRect = evt.target;
			addClass(targetRect, "active");
			var xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
			var xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";
			endline.x1.baseVal.valueAsString = xPosEnd;
			endline.x2.baseVal.valueAsString = xPosEnd;
			startline.x1.baseVal.valueAsString = xPosStart;
			startline.x2.baseVal.valueAsString = xPosStart;
			addClass(endline, "active");
			addClass(startline, "active");

			targetRect.parentNode.appendChild(endline);
			targetRect.parentNode.appendChild(startline);
		};

		var onRectMouseLeave = function(evt){
			removeClass(evt.target, "active");
			removeClass(endline, "active");
			removeClass(startline, "active");
		};

		var createRect = function(width, height, x, y, fill, label, segments){
			var rectHolder;
			var rect = newElementNs("rect", {
				width : (width / unit) + "%",
				height : height-1,
				x :  (x / unit) + "%",
				y : y,
				fill : fill,
				class : (segments && segments.length > 0) ? "time-block" : "segment"
			});
			if(label){
				rect.appendChild(newElementNs("title", {
					text : label
				})); // Add tile to wedge path
			}

			rect.addEventListener("mouseenter", onRectMouseEnter);
			rect.addEventListener("mouseleave", onRectMouseLeave);

			if(segments && segments.length > 0){
				rectHolder = newElementNs("g");
				rectHolder.appendChild(rect);
				segments.forEach(function(segment){
					if(segment.total > 0 && typeof segment.start === "number"){
						rectHolder.appendChild(createRect(segment.total, 8, segment.start||0.001, y,  segment.colour, segment.name + " (" + Math.round(segment.start) + "ms - " +  Math.round(segment.end) + "ms | total: " + Math.round(segment.total) + "ms)"));
					}
				});
				return rectHolder;
			}else{
				return rect;
			}
		};

		var createTimeWrapper = function(){
			var timeHolder = newElementNs("g", { class : "time-scale full-width" });
			for(var i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++){
				var lineLabel = newTextElementNs(i + "sec",  diagramHeight);
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
				});
				timeHolder.appendChild(lineEl);
				timeHolder.appendChild(lineLabel);
			}
			return timeHolder;
		};

		
		var renderMarks = function(){
			var marksHolder = newElementNs("g", {
				transform : "scale(1, 1)",
				class : "marker-holder"
			});

			marks.forEach(function(mark, i){
				//mark.duration
				var markHolder = newElementNs("g", {
					class : "mark-holder"
				});
				var lineHolder = newElementNs("g", {
					class : "line-holder"
				});
				var x = mark.startTime / unit;
				mark.x = x;
				var lineLabel = newTextElementNs(mark.name,  diagramHeight + 25 );
				lineLabel.setAttribute("writing-mode", "tb");
				lineLabel.setAttribute("x", x + "%");
				lineLabel.setAttribute("stroke", "");

				lineHolder.appendChild(newElementNs("line", {
					x1 : x + "%",
					y1 : 0,
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

				lineLabel.addEventListener("mouseenter", function(evt){
					addClass(lineHolder, "active");
					markHolder.parentNode.appendChild(markHolder);
				});
				lineLabel.addEventListener("mouseleave", function(evt){
					removeClass(lineHolder, "active");
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
				blockLabel.setAttribute("class", "inner-label");
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

		chartHolder.appendChild(newTag("h3", {
			text : "Legend"
		}));

		var legendsHolder = newTag("div", {
			class : "legends-group "
		});

		legendsHolder.appendChild(createLegend("initiator-type-legend", "Block color: Initiator Type", [
			["css", "#afd899"],
			["iframe", "#85b3f2"],
			["img", "#bc9dd6"],
			["script", "#e7bd8c"],
			["link", "#89afe6"],
			["swf", "#4db3ba"],
			//["font", "#e96859"],
			["xmlhttprequest", "#e7d98c"]
		]));

		legendsHolder.appendChild(createLegend("navigation-legend", "Navigation Timing", [
			["Redirect", "#ffff60"],
			["App Cache","#1f831f"],
			["DNS Lookup", "#1f7c83"],
			["TCP","#e58226"],
			["SSL Negotiation","#c141cd"],
			["Time to First Byte", "#1fe11f"],
			["Content Download", "#1977dd"],
			["DOM Processing", "#9cc"],
			["DOM Content Loaded", "#d888df"],
			["On Load", "#c0c0ff"]
		]));

		legendsHolder.appendChild(createLegend("resource-legend", "Resource Timing", [
			["Stalled/Blocking", "#cdcdcd"],
			["Redirect", "#ffff60"],
			["App Cache","#1f831f"],
			["DNS Lookup", "#1f7c83"],
			["TCP","#e58226"],
			["SSL Negotiation","#c141cd"],
			["Initial Connection (TCP)", "#e58226"],
			["Time to First Byte", "#1fe11f"],
			["Content Download", "#1977dd"]
		]));

		chartHolder.appendChild(legendsHolder);
		outputContent.appendChild(chartHolder);
	};

	setupTimeLine(calc.loadDuration, calc.blocks);
});
