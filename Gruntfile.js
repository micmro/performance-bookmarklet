module.exports = function( grunt ) {
	"use strict";

	require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks


	var banner = "/*https://github.com/micmro/performance-bookmarklet by Michael Mrowetz @MicMro*/\n";

	grunt.initConfig({
		copy : {
			dist: {
				files: [{
					expand: true,
					cwd: "src/",
					src: ["**/*.js"],
					dest: "dist/tempCollect",
					ext: ".js"
				}]
			}
		},
		babel: {
			options: {
				returnUsedHelpers: true
			},
			dist: {
				files: [{
					expand: true,
					cwd: "dist/tempCollect",
					src: ["**/*.js"],
					dest: "dist/tempEs5",
					ext: ".js"
				}]
			}
		},
		browserify: {
			options: {
				banner : banner
				},
			files: {
				"dist/performanceBookmarklet.js": ["dist/tempEs5/**/*.js"],
			},
		},
		// concat: {
		// 	options: {
		// 		separator: "\n\n\n",
		// 		banner: "/*https://github.com/micmro/performance-bookmarklet\n by Michael Mrowetz @MicMro*/\n\n(function(){\n\"use strict\";\n\n",
		// 		footer: "\n\n})();",
		// 	},
		// 	dist: {
		// 		src: ["dist/style.js", "src/helpers/helpers.js", "src/helpers/dom.js", "src/helpers/svg.js", "src/init.js", "src/summaryTiles.js", "src/navigationTimeline.js", "src/pieChart.js", "src/table.js", "src/resourcesTimeline.js", "src/consoleOutput.js"],
		// 		dest: "dist/performanceBookmarklet.js",
		// 	},
		// },
		uglify : {
			options: {
				compress: {
					global_defs: {
						"DEBUG": false
					},
					dead_code: true
				},
				banner: banner
			},
			my_target: {
				files: {
					'dist/performanceBookmarklet.min.js': ["dist/performanceBookmarklet.js"]
				}
			}
		},
		watch: {
			babel: {
				files: ["src/**/*", "Gruntfile.js"],
				tasks: ["inlineCssToJs", "copy", "babel", "browserify", "uglify"],
				options: {
					spawn: false,
					interrupt: true
				},
			},
		}
	});


	//transform CSS file to JS variable
	grunt.registerTask("inlineCssToJs", function() {
		var cssFile = "src/style.css";
		var cssFileDestination = "dist/tempCollect/helpers/style.js";
		var varName = "style";

		var cssContent = grunt.file.read(cssFile);

		//clean CSS content
		cssContent = cssContent.replace( /\/\*(?:(?!\*\/)[\s\S])*\*\//g, "").replace(/[\r\n\t]+/g, " ").replace(/[ ]{2,}/g, " ").replace(/\"/g,"\\\"");

		//make JS Var and export as module
		cssContent = "export const " + varName + " = \"" + cssContent.trim() + "\";";

		grunt.log.writeln(cssFile + " transformed to " + cssFileDestination);

		grunt.file.write(cssFileDestination, cssContent);
	});

	grunt.registerTask("default", ["inlineCssToJs", "copy", "babel", "browserify", "uglify", "watch:babel"]);
	//grunt.registerTask("default", ["inlineCssToJs", "concat", "uglify", "watch:scripts"]);
};