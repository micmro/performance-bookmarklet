"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/*
iFrame and holder logic
*/

var dom = _interopRequire(require("../helpers/dom"));

var style = require("../helpers/style").style;

var iFrameHolder = {};

var iFrameEl, outputIFrame, outputHolder, outputContent;

//setup iFrame overlay
var initHolderEl = function initHolderEl() {
	// find or create holder element
	if (!outputHolder) {
		outputHolder = dom.newTag("div", { id: "perfbook-holder" });
		outputContent = dom.newTag("div", { id: "perfbook-content" });
		window.outputContent;

		var closeBtn = dom.newTag("button", {
			"class": "perfbook-close",
			text: "close"
		});
		closeBtn.addEventListener("click", function () {
			iFrameEl.parentNode.removeChild(iFrameEl);
		});

		outputHolder.appendChild(closeBtn);
		outputHolder.appendChild(outputContent);
	} else {
		outputContent = outputIFrame.getElementById("perfbook-content");
		//clear existing data
		while (outputContent.firstChild) {
			outputContent.removeChild(outputContent.firstChild);
		}
	}
};

var addComponent = function addComponent(domEl) {
	outputContent.appendChild(domEl);
};

iFrameHolder.setup = function (onIFrameReady) {

	iFrameEl = document.getElementById("perfbook-iframe");

	var finalize = function finalize() {
		initHolderEl();
		onIFrameReady(addComponent);
		outputIFrame.body.appendChild(outputHolder);
		iFrameEl.style.height = outputHolder.clientHeight + "px";
	};

	if (iFrameEl) {
		outputIFrame = iFrameEl.contentWindow.document;
		outputHolder = outputIFrame.getElementById("perfbook-holder");

		initHolderEl();

		onIFrameReady(addComponent);

		finalize();
	} else {
		iFrameEl = dom.newTag("iframe", {
			id: "perfbook-iframe",
			onload: function onload() {
				outputIFrame = iFrameEl.contentWindow.document;

				//add style to iFrame
				var styleTag = dom.newTag("style", {
					type: "text/css",
					text: style
				});

				outputIFrame.head.appendChild(styleTag);
				finalize();
			}
		}, "position:absolute; top:1%; right:1%; margin-bottom:1em; left:1%; z-index: 9999; width:98%; z-index: 9999; border:0; box-shadow:0 0 25px 0 rgba(0,0,0,0.5); background:#fff;");
		document.body.appendChild(iFrameEl);
	}
};

iFrameHolder.getOutputIFrame = function () {
	return outputIFrame;
};

module.exports = iFrameHolder;