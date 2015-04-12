/*
DOM Helpers
*/
var dom = {}

dom.newTextNode = function(text){
	return document.createTextNode(text);
};

//creat html tag
dom.newTag = function(tagName, settings, css){
	settings = settings || {};
	var tag = document.createElement(tagName);
	for(var attr in settings){
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
			tag.appendChild(dom.newTextNode(settings.childElement));
		}
	}
	if(settings.class){
		tag.className = settings.class;
	}
	tag.style.cssText = css||"";
	return tag;
};


dom.tableFactory = function(id, headerBuilder, rowBuilder){
	var tableHolder = dom.newTag("div", {
		id : id || "",
		class : "table-holder"
	});
	var table = dom.newTag("table");
	var thead = dom.newTag("thead");

	thead.appendChild(headerBuilder(dom.newTag("tr")));
	table.appendChild(thead);
	table.appendChild(rowBuilder(dom.newTag("tbody")));
	tableHolder.appendChild(table);
	return tableHolder;
};


dom.combineNodes = function(a, b){
	var wrapper = document.createElement("div");
	if(typeof a === "object"){
		wrapper.appendChild(a);
	}else if(typeof a === "string"){
		wrapper.appendChild(dom.newTextNode(a));
	}
	if(typeof b === "object"){
		wrapper.appendChild(b);
	}else if(typeof b === "string"){
		wrapper.appendChild(dom.newTextNode(b));
	}
	return wrapper.childNodes;
};

dom.addClass = function(el, className){
	if(el.classList){
		el.classList.add(className);
	}else{
		// IE doesn't support classList in SVG - also no need for dublication check i.t.m.
		el.setAttribute("class", el.getAttribute("class") + " " + className);
	}
	return el;
};


dom.removeClass = function(el, className){
	if(el.classList){
		el.classList.remove(className);
	}else{
		//IE doesn't support classList in SVG - also no need for dublication check i.t.m.
        el.setAttribute("class", el.getAttribute("class").replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2"));
	}
	return el;
};


export default dom;