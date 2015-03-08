module.exports = function( grunt ) {
	"use strict";


	grunt.initConfig({
		concat: {
			options: {
				separator: "\n\n\n",
				banner: "/*https://github.com/nurun/performance-bookmarklet\n by Michael Mrowetz @MicMro*/\n\n(function(){\n\"use strict\";\n\n",
				footer: "\n\n})();",
			},
			dist: {
				src: ["dist/style.js", "src/scopeVarsAndUtils.js", "src/summaryTiles.js", "src/navigationTimeline.js", "src/pieChart.js", "src/table.js", "src/resourcesTimeline.js", "src/consoleOutput.js"],
				dest: "dist/performanceBookmarklet.js",
			},
		},
		uglify : {
			options: {
				compress: {
					global_defs: {
						"DEBUG": false
					},
					dead_code: true
				},
				banner : "/*https://github.com/nurun/performance-bookmarklet by Michael Mrowetz @MicMro*/\n"
			},
			my_target: {
				files: {
					'dist/performanceBookmarklet.min.js': ["dist/performanceBookmarklet.js"]
				}
			}
		},
		watch: {
			scripts: {
				files: ["src/*.js", "src/*.css", "Gruntfile.js"],
				tasks: ["inlineCssToJs", "concat", "uglify"],
				options: {
					spawn: false,
					interrupt : true
				},
			},
		}
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-contrib-uglify');


	//transform CSS file to JS variable
	grunt.registerTask("inlineCssToJs", function() {
		var cssFile = "src/style.css";
		var cssFileDestination = "dist/style.js";
		var varName = "cssFileText";

		var cssContent = grunt.file.read(cssFile);

		//clean CSS content
		cssContent = cssContent.replace( /\/\*(?:(?!\*\/)[\s\S])*\*\//g, "").replace(/[\r\n\t]+/g, " ").replace(/[ ]{2,}/g, " ").replace(/\"/g,"\\\"");

		//make JS Var
		cssContent = "var " + varName + " = \"" + cssContent + "\";";

		grunt.log.writeln(cssFile + " transformed to " + cssFileDestination);

		grunt.file.write(cssFileDestination, cssContent);
	});

	grunt.registerTask("default", ["inlineCssToJs", "concat", "uglify", "watch"]);
	grunt.registerTask("dist", ["concat", "uglify"]);
};