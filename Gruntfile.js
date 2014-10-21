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
				src: ["headerAndUtils.js", "pieChart.js", "perfTimeline.js", "consoleOutput.js"],
				dest: "dist/resourceTable.js",
			},
		},
		watch: {
			scripts: {
				files: ["*.js"],
				tasks: ["concat"],
				options: {
					spawn: false,
					interrupt : true
				},
			},
		},
	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("default", ["concat", "watch"]);
};