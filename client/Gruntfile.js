module.exports = function ( grunt ) {
 var taskConfig = {
   jshint: {
	 src: ['!src/socket.io.min.js',
		   'src/App.js',
		   'src/socket-factory.js',
		   'src/Controllers/**/*.js'],
	 gruntfile: ['Gruntfile.js'],
	 options: {
		curly:  true,
		  immed:  true,
		  newcap: true,
		  noarg:  true,
		  sub:    true,
		  boss:   true,
		  eqnull: true,
		  node:   true,
		  undef:  true,
		  globals: {
			_:       false,
			jQuery:  false,
			angular: false,
			moment:  false,
			console: false,
			$:       false,
			io:      false
		}
	} 
   },
   concat:{
		 dist: {
		      src: ['src/App.js',
		      		'src/Controllers/**/*.js',
		      		'src/socket-factory.js',
		      		],
		      dest: 'build/concat.min.js',
		    },
		},
	uglify:{
		dist:{
			src: ['build/concat.min.js'],
			dest: 'build/concat.min.js',
		},
	}
};

grunt.initConfig(taskConfig);
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['jshint','concat','uglify'] );
};

