import data from "../data";
import helper from "../helpers/helpers";
import svg from "../helpers/svg";
import dom from "../helpers/dom";

var pieChartHelpers = {};

const unit = (Math.PI * 2) / 100;

var createWedge = function(id, size, startAngle, percentage, labelTxt, colour){
	const radius = size/2,
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
	path.addEventListener("mouseenter", (evt) => {
		evt.target.style.opacity = "0.5";
		evt.target.ownerDocument.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "#ccc";
	});
	path.addEventListener("mouseleave", (evt) => {
		evt.target.style.opacity = "1";
		evt.target.ownerDocument.getElementById(evt.target.getAttribute("id") + "-table").style.backgroundColor = "transparent";
	});

	if(percentage > 10){
		var wedgeLabel = svg.newTextEl(labelTxt, y3);

		//first half or second half
		if(labelAngle < Math.PI){
			wedgeLabel.setAttribute("x", x3 - svg.getNodeTextWidth(wedgeLabel));
		}else{
			wedgeLabel.setAttribute("x", x3);
		}

		return { path: path, wedgeLabel: wedgeLabel, endAngle: endAngle};
	}			
	return { path: path, endAngle: endAngle};
};


const chartMaxHeight = (() => {
	const contentWidth = (window.innerWidth * 0.98 - 64);
	if(contentWidth < 700){
		return 350;
	} else if(contentWidth < 800){
		return contentWidth / 2 - 72;
	} else {
		return contentWidth / 3 - 72;
	}
})();

pieChartHelpers.createPieChart = function(data, size){
	//inpired by http://jsfiddle.net/da5LN/62/

	var startAngle = 0, // init startAngle
		chart = svg.newEl("svg:svg", {
			viewBox : "0 0 " + size + " " + size,
			class : "pie-chart"
		}, "max-height:"+chartMaxHeight+"px;"),
		labelWrap = svg.newEl("g", {}, "pointer-events:none; font-weight:bold;"),
		wedgeWrap = svg.newEl("g");

	//loop through data and create wedges
	data.forEach((dataObj) => {
		var wedgeData = createWedge(dataObj.id, size, startAngle, dataObj.perc, dataObj.label + " (" + dataObj.count + ")", dataObj.colour || helper.getRandomColor());
		wedgeWrap.appendChild(wedgeData.path);
		startAngle = wedgeData.endAngle;

		if(wedgeData.wedgeLabel){
			labelWrap.appendChild(wedgeData.wedgeLabel);
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


pieChartHelpers.createChartTable = function(title, data, columns){
	columns = columns||[{name: "Requests", field: "count"}];

	//create table
	return dom.tableFactory("", (thead) => {
			thead.appendChild(dom.newTag("th", {text : title, class: "text-left"}));
			columns.forEach((column) => {
				thead.appendChild(dom.newTag("th", {text : column.name, class: "text-right"}));
			});
			thead.appendChild(dom.newTag("th", {text : "Percentage", class: "text-right"}));

			return thead;
		}, (tbody) => {
			data.forEach((y) => {
				var row = dom.newTag("tr", {id : y.id + "-table"});
				row.appendChild(dom.newTag("td", {text : y.label}));
				columns.forEach((column) => {				
					row.appendChild(dom.newTag("td", {text : y[column.field].toString(), class: "text-right"}));
				});
				row.appendChild(dom.newTag("td", {text : y.perc.toPrecision(2) + "%", class: "text-right"}));
				tbody.appendChild(row);
			});
			return tbody;
	});
};


export default pieChartHelpers;