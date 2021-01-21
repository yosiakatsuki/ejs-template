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

const buildAll = ( cb = undefined ) => {
	sass();
	buildJs();
	buildEjs();
	if ( cb ) {
		cb();
	}
};

const watchFiles = () => {
	buildAll();
	watch( [ './src/sass/**/*.scss', './blocks/**/*.scss' ], sass );
	watch( [ './src/js/app/*.js' ], buildJs );
	watch( [ './pages/**/*.ejs', './pages/**/*.json' ], buildEjs );
};

exports.watch = series( watchFiles );
exports.build = buildAll;
exports.default = series( watchFiles );
