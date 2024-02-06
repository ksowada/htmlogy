// import pkg from './../../../../package.json'
// import build_datetime from '../../../../build.datetime.json'
import Html from '../Html/Html.js'
import HtmlUtils from '../HtmlUtils/HtmlUtils.js'
import Times from '../../Times.js'
import Elem from '../Elem/Elem.js'
/**
 * @class
 * @augments HtmlElComp
 * super class for App
 * - ease dom-creation
 * use a div or any HTMLElement for App
 * - build .rest from URLQuery
 */
// TODO rename Appl => App, remove Html prefix, what for
// TODO extends HTMLElement (see ACE https://mkslanc.github.io/ace-playground/#shadow-dom)
// TODO use Appl customElements https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements
class HtmlApplComp {
	static DATE_TIME_FORMAT = 'yyyy-mm-dd HH:MM:ss'
	/**
	 * create .app with arg.my
	 * @param {object} arg for Html-create function
	 * @param {Function} arg.onResize {Method} may used as onResize Event
	 * @param {object} arg.my address parent element, via .getEl method
	 */
	// TODO package get public through import
	constructor(arg) {
		/**
		 * HTML-element for app, holding parent element
		 * @type {HtmlElement}
		 */
		this.app = new Html(arg)
		/** use log for relative time measures, and other issues */
		/** rest has URLParts from query results */
		this.rest = this.queryREST() // the only data input
		/** url of this webapp red from window */
		this.webappUrl = window.location.href
		Times.log(`url:${this.webappUrl}`)
		if (arg.onResize) window.addEventListener('resize',arg.onResize.bind(this))
		// load external build datetime file for internal purpose
		// FetchFile.fetch('build.datetime.json',this.onLoadDateTime.bind(this))
	}
	// TODO rename domCreate to dom
	/**
	 * Creates the HTML document's <head> element by adding meta tags for keywords, description
	 * @deprecated use static htmlPrepare instead
	 */
	domCreate(arg) {
	}
	/**
	 * Prepares the HTML document's <head> element by adding meta tags for keywords, description, and title, as well as other metadata as needed.
	 * @param {object} arg - An object containing the metadata to be added to the <head> element.
	 * @param {string[]} arg.keywords - An array of keywords to be added as a meta tag.
	 * @param {string} arg.description - A description to be added as a meta tag.
	 * @param {string} arg.title - The title to be added to the <title> element.
	 */
	static htmlPrepare(arg) {
		// get the <head> element
		const headEl = Elem.getElByNameFirst('head')

		// add keywords meta tag
		if (arg.keywords) {
			const keywordsStr = arg.keywords.join(',')
			Elem.findActions(headEl,{html: 'meta',atts: {name: 'keywords'}},{atts: {content: keywordsStr}})
		}

		// add description meta tag
		if (arg.description) {
			Elem.findActions(headEl,{html: 'meta',atts: {name: 'description'}},{atts: {content: arg.description}})
		}

		// add title element
		if (arg.title) {
			Elem.findActions(headEl,{html: 'title'},{val: arg.title})
		}

		// TODO: add other metadata as needed (e.g., Open Graph tags)
		// TODO some metas missing ask twitter or facebook here a hint: https://www.vioma.de/de/wiki/online-marketing/seo/meta-tags/#Meta%20Keywords
		// TODO https://web.dev/learn/pwa/web-app-manifest/ and show it in html
	}
	queryREST() {
		const rest = HtmlUtils.searchParamToJson()
		Times.log('rest:') // dont show compile-time twice, thus preciding date attach
		Times.log(rest)
		return rest
	}
}
export default HtmlApplComp