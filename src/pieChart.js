/*
Logic for Request analysis pie charts
*/


onIFrameLoaded(function(helper, dom, svg){
	function createPieChart(data, size){
		//inpired by http://jsfiddle.net/da5LN/62/

		var chart = svg.newEl("svg:svg", {
			viewBox : "0 0 " + size + " " + size,
			class : "pie-chart"
		}, "max-height:"+((window.innerWidth * 0.98 - 64) / 3)+"px;");

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

			var path = svg.newEl("path", {
				id : id,
				d : d,
				fill : colour
			});

			path.appendChild(svg.newEl("title", {
				text : labelTxt
			})); // Add tile to wedge path
			path.addEventListener("mouseenter", function(evt){
				evt.target.style.opacity = "0.5";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
			});
			path.addEventListener("mouseleave", function(evt){
				evt.target.style.opacity = "1";
				outputIFrame.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
			});

			startAngle = endAngle;
			if(percentage > 10){
				var wedgeLabel = svg.newTextEl(labelTxt, y3);

				//first half or second half
				if(labelAngle < Math.PI){
					wedgeLabel.setAttribute("x", x3 - svg.getNodeTextWidth(wedgeLabel));
				}else{
					wedgeLabel.setAttribute("x", x3);
				}

				return { path: path, wedgeLabel: wedgeLabel};
			}			
			return { path: path };
		};
		
		//setup chart
		var labelWrap = svg.newEl("g", {}, "pointer-events:none; font-weight:bold;");
		var wedgeWrap = svg.newEl("g");

		//loop through data and create wedges
		data.forEach(function(dataObj){
			var wedgeAndLabel = createWedge(dataObj.id, size, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || helper.getRandomColor());
			wedgeWrap.appendChild(wedgeAndLabel.path);

			if(wedgeAndLabel.wedgeLabel){
				labelWrap.appendChild(wedgeAndLabel.wedgeLabel);
			}
		});

		// foreground circle
		wedgeWrap.appendChild(svg.newEl("circle", {
			cx : size/2,
			cy : size/2,
			r : size*0.05,
			fill : "#fff"
		}));
		chart.appendChild(wedgeWrap);
		chart.appendChild(labelWrap);
		return chart;
	};

	var createChartTable = function(title, data, columns){
		columns = columns||[{name: "Requests", field: "count"}];

		//create table
		return dom.tableFactory("", function(thead){
				thead.appendChild(dom.newTag("th", {text : title, class: "text-left"}));
				columns.forEach(function(column){
					thead.appendChild(dom.newTag("th", {text : column.name, class: "text-right"}));
				});
				thead.appendChild(dom.newTag("th", {text : "Percentage", class: "text-right"}));

				return thead;
			}, function(tbody){
				data.forEach(function(y){
					var row = dom.newTag("tr", {id : y.id + "-table"});
					row.appendChild(dom.newTag("td", {text : y.label}));
					columns.forEach(function(column){				
						row.appendChild(dom.newTag("td", {text : y[column.field], class: "text-right"}));
					});
					row.appendChild(dom.newTag("td", {text : y.perc.toPrecision(2) + "%", class: "text-right"}));
					tbody.appendChild(row);
				});
				return tbody;
		});
	};

	//filter out non-http[s] and sourcemaps
	var requestsOnly = data.allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	//get counts
	var initiatorTypeCounts = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.initiatorType || currR.fileExtension;
	}), "initiatorType");

	var initiatorTypeCountHostExt = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return (currR.initiatorType  || currR.fileExtension) + " " + (currR.isRequestToHost ? "(host)" : "(external)");
	}), "initiatorType");

	var requestsByDomain = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	var fileTypeCountHostExt = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.fileType  + " " + (currR.isRequestToHost ? "(host)" : "(external)");
	}), "fileType");

	var fileTypeCounts = helper.getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.fileType;
	}), "fileType");

	requestsOnly.forEach(function(currR){
		var entry = requestsByDomain.filter(function(a){
			return a.domain == currR.domain
		})[0]||{};

		entry.durationTotal = (entry.durationTotal||0) + currR.duration;
	});



	var hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	var chartsHolder = dom.newTag("div", {
		class : "pie-charts-holder chart-holder"
	});

	// create a chart and table section
	var setupChart = function(title, data, countTexts, columns){
		var chartHolder = dom.newTag("div", {
			class : "pie-chart-holder"
		});
		chartHolder.appendChild(dom.newTag("h1", {text : title}));
		chartHolder.appendChild(createPieChart(data, 400));
		chartHolder.appendChild(dom.newTag("p", {text : "Total Requests: " + requestsOnly.length}));
		if(countTexts && countTexts.length){
			countTexts.forEach(function(countText){
				chartHolder.appendChild(dom.newTag("p", {text : countText}, "margin-top:-1em"));
			})
		}
		chartHolder.appendChild(createChartTable(title, data, columns));
		chartsHolder.appendChild(chartHolder);
	};

	outputContent.appendChild(chartsHolder);


	// init data for charts

	var requestsUnit = requestsOnly.length / 100;
	var colourRangeR = "789abcdef";
	var colourRangeG = "789abcdef";
	var colourRangeB = "789abcdef";


	var requestsByDomainData = requestsByDomain.map(function(domain){
		domain.perc = domain.count / requestsUnit;
		domain.label = domain.domain;
		if(domain.domain === location.host){
			domain.colour = "#0c0";
		}else if(domain.domain.split(".").slice(-2).join(".") === location.host.split(".").slice(-2).join(".")){
			domain.colour = "#0a0";
		}else{
			domain.colour = helper.getRandomColor("56789abcdef", "01234567", "abcdef");
		}
		domain.id = "reqByDomain-" + domain.label.replace(/[^a-zA-Z]/g, "-");
		domain.durationAverage =  Math.round(domain.durationTotal / domain.count);
		return domain;
	});

	
	setupChart("Requests by Domain", requestsByDomainData, [
		"Domains Total: " + requestsByDomain.length
	], [
		{name:"Requests", field: "count"},
		{name: "Avg. Duration (ms)", field: "durationAverage"}
	]);

	setupChart("Requests by Initiator Type", initiatorTypeCounts.map(function(initiatorype){
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = helper.getInitiatorTypeColour((initiatorype.initiatorType), helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		initiatorype.id = "reqByInitiatorType-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}));

	setupChart("Requests by Initiator Type (host/external domain)", initiatorTypeCountHostExt.map(function(initiatorype){
		var typeSegments = initiatorype.initiatorType.split(" ");
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = helper.getInitiatorTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		initiatorype.id = "reqByInitiatorTypeLocEx-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}),[
		"Requests to Host: " + hostRequests,
		"Host: " + location.host,
	]);

	setupChart("Requests by File Type", fileTypeCounts.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getFileTypeColour((fileType.fileType), helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	setupChart("Requests by File Type (host/external domain)", fileTypeCountHostExt.map(function(fileType){
		var typeSegments = fileType.fileType.split(" ");
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getFileTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}),[
		"Requests to Host: " + hostRequests,
		"Host: " + location.host,
	]);

	tablesToLog = tablesToLog.concat([
		{
			name : "Requests by domain",
			data : requestsByDomain
		},
		{
			name : "Requests by Initiator Type",
			data : initiatorTypeCounts,
			columns : ["initiatorType", "count", "perc"]
		},
		{
			name : "Requests by Initiator Type (host/external domain)",
			data : initiatorTypeCountHostExt,
			columns : ["initiatorType", "count", "perc"]
		},
		{
			name : "Requests by File Type",
			data : fileTypeCounts,
			columns : ["fileType", "count", "perc"]
		}
	]);
});
