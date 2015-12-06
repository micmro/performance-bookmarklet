/*
Section to allow persistance of subset values
*/

import dom from "../helpers/dom";
// import data from "../data";
import persistance from "../helpers/persistance"

var pageMetricComponent = {};



//init UI
pageMetricComponent.init = function(){
	//persistance is off by default
	var persistanceEnabled = persistance.persistanceEnabled();

	var chartHolder = dom.newTag("section", {
		class : "page-metric chart-holder"
	});
	chartHolder.appendChild(dom.newTag("h3", {text : "Persist Data"}));

	var persistDataCheckboxLabel = dom.newTag("label", {text : " Persist Data?"});
	var persistDataCheckbox = dom.newTag("input", {
		type : "checkbox",
		id : "persist-data-checkbox",
		checked : persistanceEnabled
	});
	var printDataButton = dom.newTag("button", {text : "Dumb data to console", disabled: !persistanceEnabled});

	//hook up events
	persistDataCheckbox.addEventListener("change", (evt) => {
		var checked = evt.target.checked;
		if(checked){
			persistance.activatePersistance();
			printDataButton.disabled = false;
		}else if(window.confirm("this will wipe out all stored data")){
			persistance.deactivatePersistance();
			printDataButton.disabled = true;
		} else {
			evt.target.checked = true;
		}
	});
	persistDataCheckboxLabel.insertBefore(persistDataCheckbox, persistDataCheckboxLabel.firstChild);

	printDataButton.addEventListener("click", (evt) => {
		persistance.dump(false);
	});

	chartHolder.appendChild(persistDataCheckboxLabel);
	chartHolder.appendChild(printDataButton);

	if(persistanceEnabled){
		persistance.saveLatestMetrics();
	}

	return chartHolder;
};



export default pageMetricComponent;
