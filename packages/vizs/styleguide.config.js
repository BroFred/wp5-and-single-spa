const webpackConfig = require('./webpack.config');
const path = require('path');

module.exports = {
	title: 'React Style Guide Example',
	components: 'src/*(viz|form)/*.js',
	serverPort: 3005,
	dangerouslyUpdateWebpackConfig(webpackConfig, env) {
		// WARNING: inspect Styleguidist Webpack config before modifying it, otherwise you may break Styleguidist
		webpackConfig.entry = [
			path.resolve('./src/bootstrap'),
			'/Users/chenxingyi/wp5-and-single-spa/packages/vizs/node_modules/react-dev-utils/webpackHotDevClient.js'
		]
		webpackConfig.output ={
			publicPath: "http://localhost:3005/",
		  };
		return webpackConfig
	  }
};