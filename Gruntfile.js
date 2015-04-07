module.exports = function( grunt ) {
	"use strict";

	require("load-grunt-tasks")(grunt);

	var banner = "/* https://github.com/micmro/performance-bookmarklet by Michael Mrowetz @MicMro\n   build:<%= grunt.template.today(\"dd/mm/yyyy\") %> */\n";

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
				banner: banner
			},
			dist: {
				files: {
					"dist/performanceBookmarklet.js": ["dist/tempEs5/**/*.js"],
				}
			}
		},
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
			dist: {
				files: {
					"dist/performanceBookmarklet.min.js": ["dist/performanceBookmarklet.js"]
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
};