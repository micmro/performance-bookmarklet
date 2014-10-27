module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		concat: {
			options: {
				separator: "\n\n\n",
				banner: "/*https://github.com/nurun/performance-bookmarklet\n by Michael Mrowetz @MicMro*/\n\n(function(){\n",
				footer: "\n\n})();",
			},
			dist: {
				src: ["src/scopeVarsAndUtils.js", "src/pieChart.js", "src/perfTimeline.js", "src/consoleOutput.js"],
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
				files: ["src/*.js"],
				tasks: ["concat", "uglify"],
				options: {
					spawn: false,
					interrupt : true
				},
			},
		},
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask("default", ["concat", "uglify", "watch"]);
	grunt.registerTask("dist", ["concat", "uglify"]);
};