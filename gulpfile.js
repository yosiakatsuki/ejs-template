const { series, parallel, watch, src, dest } = require( 'gulp' );
const gulpSass = require( 'gulp-dart-sass' );
const postcss = require( 'gulp-postcss' );
const autoprefixer = require( 'autoprefixer' );
const cssnano = require( 'cssnano' );
const plumber = require( 'gulp-plumber' );
const babel = require( 'gulp-babel' );
const ejs = require( 'gulp-ejs' );
const rename = require( 'gulp-rename' );
const fs = require( 'fs' );
const browserSync = require( 'browser-sync' ).create();

const postcssPlugins = [
	autoprefixer( {
		grid: 'autoplace'
	} ),
	cssnano( {
			preset: [
				'default',
				{ minifyFontValues: { removeQuotes: false } }
			]
		}
	),
];

function sass() {
	return src( './src/sass/*.scss' )
		.pipe( gulpSass( { outputStyle: 'compressed' } ) )
		.pipe( postcss( postcssPlugins ) )
		.pipe( dest( './dest/css' ) );
}

const buildJs = () => {
	return src( './src/js/*.js' )
		.pipe( babel( {
			presets: [ '@babel/env' ]
		} ) )
		.pipe( dest( './dest/js' ) );
};
const buildEjs = () => {
	const meta = JSON.parse( fs.readFileSync( "./pages/data/meta.json", "utf-8" ) );
	return src( [ './pages/**/*.ejs', '!./pages/**/_*.ejs' ] )
		.pipe( ejs( { meta: meta } ) )
		.pipe( rename( { extname: '.html' } ) )
		.pipe( dest( './dest' ) );
};

const copyAssets = () => {
	return src( [ './pages/assets/**/*.*' ] )
		.pipe( dest( './dest/assets' ) )
};

const buildAll = ( cb = undefined ) => {
	sass();
	buildJs();
	buildEjs();
	copyAssets();
	if ( cb ) {
		cb();
	}
};

const initBrowserSync = ( done ) => {
	browserSync.init( {
		server: {
			baseDir: 'dest',
			index: 'index.html'
		},
		port: 8080
	} );
	done();
};

const reloadBrowserSync = ( done ) => {
	browserSync.reload();
	done();
};


const watchFiles = () => {
	watch( [ './src/sass/**/*.scss', './blocks/**/*.scss' ], sass );
	watch( [ './src/js/*.js' ], buildJs );
	watch( [ './pages/**/*.ejs', './pages/**/*.json' ], buildEjs );
	watch( [ './pages/assets/**/*.*' ], copyAssets );
	watch( [ './dest/**/*.*' ], reloadBrowserSync );
};

exports.watch = series( buildAll, initBrowserSync, watchFiles );
exports.build = series( buildAll );
exports.default = exports.watch;
