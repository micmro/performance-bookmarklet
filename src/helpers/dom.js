/*
DOM Helpers
*/

/**
 * @param  {string} text
 * @returns {Text}
 */
const newTextNode = (text) => {
	return document.createTextNode(text);
};



/**
 * creats a html tag
 *
 * @param  {string} tagName
 * @param  {Object} settings
 * @param  {string} css
 * @return {HTMLElement} new HTMLElement tag
 */
const newTag = (tagName, settings, css) => {
	settings = settings || {};
	const tag = document.createElement(tagName);
	for(let attr in settings){
		if(attr != "text"){
			tag[attr] = settings[attr];
		}
	}
	if(settings.text){
		tag.textContent = settings.text;
	}else if(settings.childElement){
		if(typeof settings.childElement === "object"){
			//if childNodes NodeList is passed in
			if(settings.childElement instanceof NodeList){
				//NodeList is does not inherit from array
				Array.prototype.slice.call(settings.childElement,0).forEach((childNode) => {
					tag.appendChild(childNode);
				});
			}else{
				tag.appendChild(settings.childElement);
			}
		}else{
			tag.appendChild(newTextNode(settings.childElement));
		}
	}
	if(settings.class){
		tag.className = settings.class;
	}
	tag.style.cssText = css||"";
	return tag;
};

/**
 * Helper to create a table
 *
 * @param  {string} id - id of holder
 * @param  {function} headerBuilder
 * @param  {function} rowBuilder
 * @returns {HTMLDivElement} `table` wrapped in a holder `div`
 */
const tableFactory = (id, headerBuilder, rowBuilder) => {
	const tableHolder = newTag("div", {
		id : id || "",
		class : "table-holder"
	});
	const table = newTag("table");
	const thead = newTag("thead");

	thead.appendChild(headerBuilder(newTag("tr")));
	table.appendChild(thead);
	table.appendChild(rowBuilder(newTag("tbody")));
	tableHolder.appendChild(table);
	return tableHolder;
};

/**
 * Combines 2 nodes into a wrapper `div`
 *
 * @param  {Element|string} a - fist node
 * @param  {Element|string} b - second node
 * @returns {HTMLDivElement}
 */
const combineNodes = (a, b) => {
	const wrapper = document.createElement("div");
	if(typeof a === "object"){
		wrapper.appendChild(a);
	}else if(typeof a === "string"){
		wrapper.appendChild(newTextNode(a));
	}
	if(typeof b === "object"){
		wrapper.appendChild(b);
	}else if(typeof b === "string"){
		wrapper.appendChild(newTextNode(b));
	}
	return wrapper.childNodes;
};

/**
 * Adds CSS classname to `el`
 *
 * @param  {HTMLElement} el
 * @param  {string} className
 * @returns {HTMLElement} returns `el` again for chaining
 */
const addClass = (el, className) => {
	if(el.classList){
		el.classList.add(className);
	}else{
		// IE doesn't support classList in SVG - also no need for dublication check i.t.m.
		el.setAttribute("class", el.getAttribute("class") + " " + className);
	}
	return el;
};

/**
 * Removes CSS classname from `el`
 *
 * @param  {HTMLElement} el
 * @param  {string} className
 * @returns {HTMLElement} returns `el` again for chaining
 */
const removeClass = (el, className) => {
	if(el.classList){
		el.classList.remove(className);
	}else{
		//IE doesn't support classList in SVG - also no need for dublication check i.t.m.
        el.setAttribute("class", el.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
	}
	return el;
};


export default {
	newTextNode: newTextNode,
	newTag: newTag,
	tableFactory: tableFactory,
	combineNodes:combineNodes,
	addClass:addClass,
	removeClass:removeClass
}