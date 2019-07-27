/*
Logic for Request analysis pie charts
*/

import data from "../data";
import helper from "../helpers/helpers";
import dom from "../helpers/dom";
import pieChartHelpers from "../helpers/pieChartHelpers";

const pieChartComponent = {};

pieChartComponent.init = () => {

	const chartsHolder = dom.newTag("div", {
		class : "pie-charts-holder chart-holder"
	});

	// create a chart and table section
	const setupChart = (title, chartData, countTexts, columns, id) => {
		const chartHolder = dom.newTag("div", {
			class : "pie-chart-holder",
			id : id||""
		});
		chartHolder.appendChild(dom.newTag("h1", {text : title}));
		chartHolder.appendChild(pieChartHelpers.createPieChart(chartData, 400));
		chartHolder.appendChild(dom.newTag("p", {text : "Total Requests: " + data.requestsOnly.length}));
		if(countTexts && countTexts.length){
			countTexts.forEach((countText) => {
				chartHolder.appendChild(dom.newTag("p", {text : countText}, "margin-top:-1em"));
			})
		}
		chartHolder.appendChild(pieChartHelpers.createChartTable(title, chartData, columns));
		chartsHolder.appendChild(chartHolder);
	};


	// init data for charts

	const requestsUnit = data.requestsOnly.length / 100;
	const colourRangeR = "789abcdef";
	const colourRangeG = "789abcdef";
	const colourRangeB = "789abcdef";


	//argument data
	const requestsByDomainData = data.requestsByDomain.map((sourceDomain) => {
		const domain = helper.clone(sourceDomain);
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
		domain.durationTotal =  Math.round(domain.durationTotal);
		domain.durationTotalParallel =  Math.round(domain.durationTotalParallel);
		return domain;
	});

	setupChart("Requests by Domain", requestsByDomainData, [
		"Domains Total: " + data.requestsByDomain.length
	], [
		{name:"Requests", field: "count"},
		{name: "Avg. Duration (ms)", field: "durationAverage"},
		{name: "Duration Parallel (ms)", field: "durationTotalParallel"},
		{name: "Duration Sum (ms)", field: "durationTotal"}
	], "pie-request-by-domain");

	setupChart("Requests by Initiator Type", data.initiatorTypeCounts.map((initiatorType) => {
		initiatorType.perc = initiatorType.count / requestsUnit;
		initiatorType.label = initiatorType.initiatorType;
		initiatorType.colour = helper.getInitiatorOrFileTypeColour((initiatorType.initiatorType), helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		initiatorType.id = "reqByInitiatorType-" + initiatorType.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorType;
	}));

	setupChart("Requests by Initiator Type (host/external domain)", data.initiatorTypeCountHostExt.map((initiatorype) => {
		const typeSegments = initiatorype.initiatorType.split(" ");
		initiatorype.perc = initiatorype.count / requestsUnit;
		initiatorype.label = initiatorype.initiatorType;
		initiatorype.colour = helper.getInitiatorOrFileTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		initiatorype.id = "reqByInitiatorTypeLocEx-" + initiatorype.label.replace(/[^a-zA-Z]/g, "-");
		return initiatorype;
	}),[
		"Requests to Host: " + data.hostRequests,
		"Host: " + location.host,
	]);

	setupChart("Requests by File Type", data.fileTypeCounts.map((fileType) => {
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getInitiatorOrFileTypeColour((fileType.fileType), helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB));
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}));

	setupChart("Requests by File Type (host/external domain)", data.fileTypeCountHostExt.map((fileType) => {
		const typeSegments = fileType.fileType.split(" ");
		fileType.perc = fileType.count / requestsUnit;
		fileType.label = fileType.fileType;
		fileType.colour = helper.getInitiatorOrFileTypeColour(typeSegments[0], helper.getRandomColor(colourRangeR, colourRangeG, colourRangeB), typeSegments[1] !== "(host)");
		fileType.id = "reqByFileType-" + fileType.label.replace(/[^a-zA-Z]/g, "-");
		return fileType;
	}),[
		"Requests to Host: " + data.hostRequests,
		"Host: " + location.host,
	]);


	return chartsHolder;
};

export default pieChartComponent;
