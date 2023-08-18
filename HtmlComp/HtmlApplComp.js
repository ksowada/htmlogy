import dateFormat from 'dateformat'
import Html from '../Html/Html.js'
import HtmlUtils from '../HtmlUtils/HtmlUtils.js'
import HtmlElComp from './HtmlElComp.js'
import pkg from '../../../../package.json'
import build_datetime from '../../../../build.datetime.json'
import Times from '../../Times.js'
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
class HtmlApplComp extends HtmlElComp {
	static DATE_TIME_FORMAT = 'yyyy-mm-dd HH:MM:ss'
	/**
	 * @param {object} arg for Html-create function
	 * @param {Function} arg.onResize {Method} may used as onResize Event
	 */
	// TODO package get public through import
	constructor(arg) {
		super(arg)
		/** use log for relative time measures, and other issues */
		Times.log(`package.version:${pkg.version}`)
		/** app for access major app features, for later use */
		this.app = this
		/** rest has URLParts from query results */
		this.rest = this.queryREST() // the only data input
		/** url of this webapp red from window */
		this.webappUrl = window.location.href
		Times.log(`url:${this.webappUrl}`)
		if (this.onResize) window.addEventListener('resize',this.onResize.bind(this))
		// load external build datetime file for internal purpose
		// FetchFile.fetch('build.datetime.json',this.onLoadDateTime.bind(this))
	}
	/**
	 * creates div for component, load obj in this, call at begin of dom()
	 * @param {object} arg object for Html-create
	 * @param {any} arg.el will be attached
	 */
	// TODO rename domCreate to dom
	domCreate(arg) {
		// care for body
		super.remove() // remove noscript message from el
		super.domCreate({container: undefined,...arg})
		// care for head
		const headEl = Html.getElByNameFirst('head')
		if (pkg.keywords) {
			const keywordsStr = pkg.keywords.join(',')
			Html.findActions({html: 'meta',atts: {name: 'keywords'}},{atts: {content: keywordsStr}},headEl)
		}
		if (pkg.description) Html.findActions({html: 'meta',atts: {name: 'description'}},{atts: {content: pkg.description}},headEl)
		if (pkg.name) Html.findActions({html: 'title'},{val: pkg.name},headEl)
		if (build_datetime) this.rest.build_datetime = build_datetime
		// TODO some metas missing ask twitter or facebook here a hint: https://www.vioma.de/de/wiki/online-marketing/seo/meta-tags/#Meta%20Keywords
		// TODO https://web.dev/learn/pwa/web-app-manifest/ and show it in html
	}
	queryREST() {
		const rest = HtmlUtils.searchParamToJson()
		Times.log('rest:') // dont show compile-time twice, thus preciding date attach
		Times.log(rest)
		const dateStr = dateFormat(Date.now(),HtmlApplComp.DATE_TIME_FORMAT)
		rest.datetime = dateStr
		Times.log('compile-time:' + rest.datetime)
		return rest
	}
}
export default HtmlApplComp