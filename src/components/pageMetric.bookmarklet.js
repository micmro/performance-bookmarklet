/*
Section to allow persistance of subset values
*/

import dom from "../helpers/dom";
import persistance from "../helpers/persistance"

const pageMetricComponent = {};



//init UI
pageMetricComponent.init = () => {
	//persistance is off by default
	const persistanceEnabled = persistance.persistanceEnabled();

	const chartHolder = dom.newTag("section", {
		class : "page-metric chart-holder"
	});
	chartHolder.appendChild(dom.newTag("h3", {text : "Persist Data"}));

	const persistDataCheckboxLabel = dom.newTag("label", {text : " Persist Data?"});
	const persistDataCheckbox = dom.newTag("input", {
		type : "checkbox",
		id : "persist-data-checkbox",
		checked : persistanceEnabled
	});
	const printDataButton = dom.newTag("button", {text : "Dumb data to console", disabled: !persistanceEnabled});

	//hook up events
	persistDataCheckbox.addEventListener("change", (evt) => {
		const checked = evt.target.checked;
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
