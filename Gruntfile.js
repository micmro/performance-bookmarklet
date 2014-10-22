module.exports = function( grunt ) {
	"use strict";

	grunt.initConfig({
		concat: {
			options: {
				separator: "\n\n\n",
				banner: "/*https://github.com/nurun/resourceTable*/\n\n(function(){\n",
				footer: "\n\n})();",
			},
			dist: {
				src: ["scopeVarsAndUtils.js", "pieChart.js", "perfTimeline.js", "consoleOutput.js"],
				dest: "dist/resourceTable.js",
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
				banner : "/*https://github.com/nurun/resourceTable*/\n"
			},
			my_target: {
				files: {
					'dist/resourceTable.min.js': ["dist/resourceTable.js"]
				}
			}
		},
		watch: {
			scripts: {
				files: ["*.js"],
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

	grunt.registerTask("default", ["concat", "watch"]);
};