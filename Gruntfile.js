module.exports = function( grunt ) {
	"use strict";

	require("load-grunt-tasks")(grunt);

	var banner = "/* https://github.com/micmro/performance-bookmarklet by Michael Mrowetz @MicMro\n   build:<%= grunt.template.today(\"dd/mm/yyyy\") %> */\n";

	grunt.initConfig({
		copy : {
			distBookmarklet: {
				files: [{
					expand: true,
					cwd: "src/",
					src: ["**/*.js"],
					dest: "dist/tempCollect",
					filter: function(fileName){
						return !fileName.match(/.+\.(?:chromeExtension|firefoxAddon).js$/);
					},
					ext: ".js"
				}]
			},
			distFirefoxAddon: {
				files: [{
					expand: true,
					cwd: "src/",
					src: ["**/*.js"],
					dest: "dist/tempCollect",
					filter: function(fileName){
						return !fileName.match(/.+\.(?:bookmarklet|chromeExtension).js$/);
					},
					ext: ".js"
				}]
			},
			distChromeExtension: {
				files: [{
					expand: true,
					cwd: "src/",
					src: ["**/*.js"],
					dest: "dist/tempCollect",
					filter: function(fileName){
						return !fileName.match(/.+\.(?:bookmarklet|firefoxAddon).js$/);
					},
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
			distBookmarklet: {
				files: {
					"dist/performanceBookmarklet.js": ["dist/tempEs5/**/*.js"],
				}
			},
			distFirefoxAddon: {
				files: {
					"dist/performanceBookmarklet.ff.js": ["dist/tempEs5/**/*.js"],
				}
			},
			distChromeExtension: {
				files: {
					"dist/performanceBookmarklet.chrome.js": ["dist/tempEs5/**/*.js"],
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
			distBookmarklet: {
				files: {
					"dist/performanceBookmarklet.min.js": ["dist/performanceBookmarklet.js"]
				}
			},
			distFirefoxAddon: {
				files: {
					"dist/performanceBookmarklet.ff.min.js": ["dist/performanceBookmarklet.ff.js"]
				}
			},
			distChromeExtension: {
				files: {
					"dist/performanceBookmarklet.chrome.min.js": ["dist/performanceBookmarklet.chrome.js"]
				}
			}
		},
		watch: {
			babelBookmarklet: {
				files: ["src/**/*", "Gruntfile.js"],
				tasks: ["distBookmarklet"],
				options: {
					spawn: false,
					interrupt: true
				},
			},
			babelFirefoxAddon: {
				files: ["src/**/*", "Gruntfile.js"],
				tasks: ["distFirefoxAddon"],
				options: {
					spawn: false,
					interrupt: true
				},
			},
			babelChromeExtension: {
				files: ["src/**/*", "Gruntfile.js"],
				tasks: ["distChromeExtension"],
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

	grunt.registerTask("distBookmarklet", ["inlineCssToJs", "copy:distBookmarklet", "babel", "browserify:distBookmarklet", "uglify:distBookmarklet"]);
	grunt.registerTask("distFirefoxAddon", ["inlineCssToJs", "copy:distFirefoxAddon", "babel", "browserify:distFirefoxAddon", "uglify:distFirefoxAddon"]);
	grunt.registerTask("distChromeExtension", ["inlineCssToJs", "copy:distChromeExtension", "babel", "browserify:distChromeExtension", "uglify:distChromeExtension"]);
	grunt.registerTask("distAll", ["distBookmarklet", "distFirefoxAddon", "distChromeExtension"]);

	grunt.registerTask("watchDistBookmarklet", ["distBookmarklet", "watch:babelBookmarklet"]);
	grunt.registerTask("watchDistFirefoxAddon", ["distFirefoxAddon", "watch:babelFirefoxAddon"]);
	grunt.registerTask("watchDistChromeExtension", ["distChromeExtension", "watch:babelChromeExtension"]);



	grunt.registerTask("default", ["watchDistBookmarklet"]);
};