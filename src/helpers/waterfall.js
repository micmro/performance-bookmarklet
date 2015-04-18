/*
Helper to create waterfall timelines 
*/

import data from "../data";
import helper from "../helpers/helpers";
import svg from "../helpers/svg";
import dom from "../helpers/dom";


var waterfall = {};

waterfall.setupTimeLine = function(durationMs, blocks, title){
	const unit = durationMs / 100,
		barsToShow = blocks
			.filter((block) => (typeof block.start == "number" && typeof block.total == "number"))
			.sort((a, b) => (a.start||0) - (b.start||0)),
		maxMarkTextLength = data.marks.length > 0 ? data.marks.reduce((currMax, currValue) => {
			return Math.max((typeof currMax == "number" ? currMax : 0), svg.getNodeTextWidth( svg.newTextEl(currValue.name, "0")));
		}) : 0,
		diagramHeight = (barsToShow.length + 1) * 25,
		chartHolderHeight = diagramHeight + maxMarkTextLength + 35;

	var chartHolder = dom.newTag("section", {
		class : "resource-timing water-fall-holder chart-holder"
	});
	var timeLineHolder = svg.newEl("svg:svg", {
		height : Math.floor(chartHolderHeight),
		class : "water-fall-chart"
	});
	var timeLineLabelHolder = svg.newEl("g", {class : "labels"});

	var endline = svg.newEl("line", {
		x1 : "0",
		y1 : "0",
		x2 : "0",
		y2 : diagramHeight,
		class : "line-end"
	});
	
	var startline = svg.newEl("line", {
		x1 : "0",
		y1 : "0",
		x2 : "0",
		y2 : diagramHeight,
		class : "line-start"
	});

	var onRectMouseEnter = function(evt){
		var targetRect = evt.target;
		dom.addClass(targetRect, "active");

		const xPosEnd = targetRect.x.baseVal.valueInSpecifiedUnits + targetRect.width.baseVal.valueInSpecifiedUnits + "%";
		const xPosStart = targetRect.x.baseVal.valueInSpecifiedUnits + "%";

		endline.x1.baseVal.valueAsString = xPosEnd;
		endline.x2.baseVal.valueAsString = xPosEnd;
		startline.x1.baseVal.valueAsString = xPosStart;
		startline.x2.baseVal.valueAsString = xPosStart;
		dom.addClass(endline, "active");
		dom.addClass(startline, "active");

		targetRect.parentNode.appendChild(endline);
		targetRect.parentNode.appendChild(startline);
	};

	var onRectMouseLeave = function(evt){
		dom.removeClass(evt.target, "active");
		dom.removeClass(endline, "active");
		dom.removeClass(startline, "active");
	};

	var createRect = function(width, height, x, y, fill, label, segments){
		var rectHolder;
		var rect = svg.newEl("rect", {
			width : (width / unit) + "%",
			height : height-1,
			x :  (x / unit) + "%",
			y : y,
			fill : fill,
			class : (segments && segments.length > 0) ? "time-block" : "segment"
		});
		if(label){
			rect.appendChild(svg.newEl("title", {
				text : label
			})); // Add tile to wedge path
		}

		rect.addEventListener("mouseenter", onRectMouseEnter);
		rect.addEventListener("mouseleave", onRectMouseLeave);

		if(segments && segments.length > 0){
			rectHolder = svg.newEl("g");
			rectHolder.appendChild(rect);
			segments.forEach((segment) => {
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
		var timeHolder = svg.newEl("g", { class : "time-scale full-width" });
		for(let i = 0, secs = durationMs / 1000, secPerc = 100 / secs; i <= secs; i++){
			var lineLabel = svg.newTextEl(i + "sec",  diagramHeight);
			if(i > secs - 0.2){
				lineLabel.setAttribute("x", secPerc * i - 0.5 + "%");
				lineLabel.setAttribute("text-anchor", "end");
			}else{
				lineLabel.setAttribute("x", secPerc * i + 0.5 + "%"); 
			}
			
			var lineEl = svg.newEl("line", {
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
		var marksHolder = svg.newEl("g", {
			transform : "scale(1, 1)",
			class : "marker-holder"
		});

		data.marks.forEach((mark, i) => {
			//mark.duration
			var markHolder = svg.newEl("g", {
				class : "mark-holder"
			});
			var lineHolder = svg.newEl("g", {
				class : "line-holder"
			});
			var x = mark.startTime / unit;
			mark.x = x;
			var lineLabel = svg.newTextEl(mark.name,  diagramHeight + 25 );
			lineLabel.setAttribute("writing-mode", "tb");
			lineLabel.setAttribute("x", x + "%");
			lineLabel.setAttribute("stroke", "");

			lineHolder.appendChild(svg.newEl("line", {
				x1 : x + "%",
				y1 : 0,
				x2 : x + "%",
				y2 : diagramHeight
			}));

			if(data.marks[i-1] && mark.x - data.marks[i-1].x < 1){
				lineLabel.setAttribute("x", data.marks[i-1].x+1 + "%");
				mark.x = data.marks[i-1].x+1;
			}

			//would use polyline but can't use percentage for points 
			lineHolder.appendChild(svg.newEl("line", {
				x1 : x + "%",
				y1 : diagramHeight,
				x2 : mark.x + "%",
				y2 : diagramHeight + 23
			}));

			lineLabel.addEventListener("mouseenter", (evt) => {
				dom.addClass(lineHolder, "active");
				markHolder.parentNode.appendChild(markHolder);
			});
			lineLabel.addEventListener("mouseleave", (evt) => {
				dom.removeClass(lineHolder, "active");
			});

			markHolder.appendChild(svg.newEl("title", {
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

	barsToShow.forEach((block, i) => {
		var blockWidth = block.total||1;

		var y = 25 * i;
		timeLineHolder.appendChild(createRect(blockWidth, 25, block.start||0.001, y, block.colour, block.name + " (" + block.start + "ms - " + block.end + "ms | total: " + block.total + "ms)", block.segments));

		var blockLabel = svg.newTextEl(block.name + " (" + block.total + "ms)", (y + (block.segments? 20 : 17)));

		if(((block.total||1) / unit) > 10 && svg.getNodeTextWidth(blockLabel) < 200){
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
	
	chartHolder.appendChild(dom.newTag("h1", {
		text : title
	}));
	chartHolder.appendChild(timeLineHolder);

	

	
	return chartHolder;
};

export default waterfall;
