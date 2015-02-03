/*
Logic for Request analysis pie charts
*/


onIFrameLoaded(function(){
	function createPieChart(data, size){
		//inpired by http://jsfiddle.net/da5LN/62/

		var chart = newElementNs("svg:svg", {
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

	var createTable = function(title, data, columns){
		columns = columns||[{name: "Requests", field: "count"}];

		//create table
		var tableHolder = newTag("div", {
			class : "table-holder"
		});
		var table = newTag("table", {}, "");
		var thead = newTag("thead");
		var tbody = newTag("tbody");
		thead.appendChild(newTag("th", {text : title, class: "text-left"}));
		// thead.appendChild(newTag("th", {text : "Requests"}));
		columns.forEach(function(column){
			thead.appendChild(newTag("th", {text : column.name, class: "text-right"}));
		});
		thead.appendChild(newTag("th", {text : "Percentage", class: "text-right"}));
		table.appendChild(thead);

		data.forEach(function(y){
			var row = newTag("tr", {id : y.id + "-table"});
			row.appendChild(newTag("td", {text : y.label}));
			columns.forEach(function(column){				
				row.appendChild(newTag("td", {text : y[column.field], class: "text-right"}));
			});
			row.appendChild(newTag("td", {text : y.perc.toPrecision(2) + "%", class: "text-right"}));
			tbody.appendChild(row);
		});

		table.appendChild(tbody);
		tableHolder.appendChild(table);

		return tableHolder;
	};

	//filter out non-http[s] and sourcemaps
	var requestsOnly = allResourcesCalc.filter(function(currR) {
		return currR.name.indexOf("http") === 0 && !currR.name.match(/js.map$/);
	});

	//get counts
	var fileExtensionCounts = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.initiatorType || currR.fileExtension;
	}), "fileType");

	var fileExtensionCountHostExt = getItemCount(requestsOnly.map(function(currR, i, arr){
		return (currR.initiatorType  || currR.fileExtension) + " " + (currR.isRequestToHost ? "(host)" : "(external)");
	}), "fileType");

	var requestsByDomain = getItemCount(requestsOnly.map(function(currR, i, arr){
		return currR.domain;
	}), "domain");

	requestsOnly.forEach(function(currR){
		var entry = requestsByDomain.filter(function(a){
			return a.domain == currR.domain
		})[0]||{};

		entry.durationTotal = (entry.durationTotal||0) + currR.duration;
	});



	var hostRequests = requestsOnly.filter(function(domain){
		return domain.domain === location.host;
	}).length;

	var chartsHolder = newTag("div", {
		class : "pie-charts-holder chart-holder"
	});

	// create a chart and table section
	var setupChart = function(title, data, countTexts, columns){
		var chartHolder = newTag("div", {
			class : "pie-chart-holder"
		});
		chartHolder.appendChild(newTag("h1", {text : title}));
		chartHolder.appendChild(createPieChart(data, 400));
		chartHolder.appendChild(newTag("p", {text : "Total Requests: " + requestsOnly.length}));
		if(countTexts && countTexts.length){
			countTexts.forEach(function(countText){
				chartHolder.appendChild(newTag("p", {text : countText}, "margin-top:-1em"));
			})
		}
		chartHolder.appendChild(createTable(title, data, columns));
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
			domain.colour = getRandomColor("56789abcdef", "01234567", "abcdef");
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

	setupChart("Requests by Initiator Type (host/external domain)", fileExtensionCountHostExt.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getInitiatorTypeColour((fileType.fileType.split(" ")[0]), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByTypeLocEx-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}),[
		"Requests to Host: " + hostRequests,
		"Host: " + location.host,
	]);

	setupChart("Requests by Initiator Type", fileExtensionCounts.map(function(fileType){
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = getInitiatorTypeColour((fileType.fileType), getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	tablesToLog = tablesToLog.concat([
		{
			name : "Requests by domain",
			data : requestsByDomain
		},
		{
			name : "File type count (host / external)",
			data : fileExtensionCounts,
			columns : ["fileType", "count", "perc"]},
		{
			name : "File type count",
			data : fileExtensionCountHostExt,
			columns : ["fileType", "count", "perc"]
		}
	]);
});
