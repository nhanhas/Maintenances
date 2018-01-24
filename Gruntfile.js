module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                sourceMap: false,
                sourceComments: false
            },
            src: {
                files: [{
                    expand: true,
                    cwd: 'app/src/',
                    src: ['**/*.scss'],
                    dest: 'www/',
                    ext: '.css'
                }]
            }
        },
        watch: {
            options:{
                event: 'all'
            },
            css: {
                files: ['app/src/**/*.scss'],
                tasks: ['sass']
            },
            js:{
                files: ['app/src/**/*.js'],
                tasks: ['copy:scripts']
            },
            html:{
                files: ['app/src/**/*.html'],
                tasks: ['copy:html']
            }
        },
        copy: {
            libs: {
                files:[{
                    expand: true,
                    cwd: 'bower_components/',
                    src: ['**'],
                    dest: 'www/libs'
                }]
            },
            scripts: {
                files:[{
                    expand: true,
                    cwd: 'app/src/',
                    src: ['**','!**/*.scss', '!**/*.html'],
                    dest: 'www/'
                }]
            },
            html: {
                files:[{
                    expand: true,
                    cwd: 'app/src/',
                    src: ['**','!**/*.scss', '!**/*.js'],
                    dest: 'www/'
                }]
            }
        },
        uglify: {
            build: {
                src: 'app/src/<%= pkg.name %>.js',
                dest: 'www/<%= pkg.name %>.min.js'
            }
        }


    });

    /*=====================================
     =        Default Configuration        =
     =====================================*/
    //Sass
    grunt.loadNpmTasks('grunt-sass');
    //Watch
    grunt.loadNpmTasks('grunt-contrib-watch');
    //Copy to deploy
    grunt.loadNpmTasks('grunt-contrib-copy');
    //Uglify
    grunt.loadNpmTasks('grunt-contrib-uglify');

    /*=====================================
     =        TASKS Resgistration         =
     =====================================*/
    // $ grunt
    grunt.registerTask('default',['dev']);

    //--------------------------------------

    //copy All project to DEPLOY
    grunt.registerTask('toDeploy', 'Start coping source files', function() {
        grunt.log.writeln('Currently building all project to deploy...');
        grunt.task.run(['copy']);
    });

    //compile sass
    grunt.registerTask('styles', 'Start compiling sass files', function() {
        grunt.log.writeln('Currently compiling sass to deploy...');
        grunt.task.run(['sass']);
    });

    //default custom task
    grunt.registerTask('dev',['toDeploy','styles','watch']);


}