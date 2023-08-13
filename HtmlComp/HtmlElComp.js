import Obj from '../../Obj/Obj.js'
import HtmlComp from './HtmlComp.js'
import Html from '../Html/Html.js'
import Vars from '../../Vars/Vars.js'
/**
 * @class
 * @augments HtmlComp
 * base class for html-package
 * - add optional container, a HTMLElement for this Component
 * - add optional heading
 * - only for extend purposes, dont initiate it
 * - if not explicity call constructed, dom will not be called through super constructed
 */
// TODO may be sucessed through HtmlComp if container and heading handled correctly
class HtmlElComp extends HtmlComp {
	/** may also be used as data obj cotnaing unmodified data for next component */
	constructor() {
		super(Html.mergeDatas.apply(null,arguments))

		/** @type {object} some container object with args see {@link Html#create} */
		this.container = undefined

		const thisTypeHier = Vars.typeHier(this) // test if this is BaseClass
		if (thisTypeHier.indexOf('HtmlElComp')==0) {
			this.constructed()
		}
	}
	/**
	 * creates container (if given), heading (if given) for component
	 * - load arg in this
	 * - call it at begin of dom()
	 * - use .div to work or .containerObj
	 * @param {object} arg see {@link Html#create}
	 * @param {object} arg.container if valid then build a Container for this Component, if nothing given create <div>
	 * @param {object} arg.heading if valid give container a header, if nothing given create <h2>
	 */
	// TODO once rename to dom, to keep things easy
	// eslint-disable-next-line no-unused-vars
	domCreate(arg) {
		const obj = Html.mergeDatas.apply(null,arguments)
		super.domCreate(obj)
		if (this.container) { // TODO fix overlap with Html.container
			const containerProps = Html.mergeDatas({html:'div'},Obj.giveKey(this,'container'))
			/**
			 * use it as parent for underlying html elements,
			 * - will be overwritten each time
			 * @type {Html}
			 */
			this.containerObj = new Html({parent:this.parent,...containerProps}) // TODO call top.obj
			/**
			 * use this.div, if container is created or not, it represents the actual HTMLElement
			 * @type {HTMLElement}
			 * @deprecated use containerObj for more functionality
			 */
			this.div = this.containerObj.my.el // TODO call top.el
		} else if (!this.div) this.div = Html.getEl(this.parent)
		if (this.heading && this.heading.val) {
			const headingProps = Html.mergeDatas({html:'h2'},Obj.giveKey(this,'heading'))
			/**
			 * optional heading independend in container or parent
			 * - will be overwritten each time
			 * @type {Html}
			 */
			this.headingObj = new Html({parent:{el:this.div}},...headingProps)
		}
	}
}
export default HtmlElComp