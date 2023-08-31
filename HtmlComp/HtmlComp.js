import Elem from '../Elem/Elem.js'
import Html from '../Html/Html.js'
/**
 * @class
 * super class for own html-package,
 * - does not create a div
 * - more like infrastructure, like timing
 */
class HtmlComp {
	// TODO remove it, has no special function left, begin to cut unused methods
	/**
	 * may also be used as data obj containing unmodified data for next component
	 * - capture Object and attach it to this
	 * - in Sub-Components: constructor not use it to edit DOM, use method dom() for clearness, even if HtmlComp call dom after constructed
	 * @param {object} obj of @see {@link Html#create}
	 */
	// eslint-disable-next-line no-unused-vars
	constructor(obj) {
		Html.mergeModDatas(this,Html.mergeDatas.apply(null,arguments))
	}
	/**
	 * call me in constructor at last
	 * - if not called dom will not be rendered
	 * - will call dom(), if .parent is given so please overload if needed
	 */
	constructed() {
		if (this.parent) {
			if (this.dom) {
				this.dom()
			} else if (this.domCreate) this.domCreate() // if not already  extended by an Component f.e. HtmlElComp itself
		}
	}
	// eslint-disable-next-line jsdoc/check-param-names
	/**
	 * - creates nothing for component
	 * - load concated obj (last will overwrite) in this {@link Html#mergeDatas}
	 * - call at begin of dom()
	 * - will reset dom each time
	 * @param {object[]} objs manual addition to merge with obj, see {@link Html#create}
	 */
	// eslint-disable-next-line no-unused-vars
	domCreate(objs) {
		const obj = Html.mergeDatas.apply(null,arguments)
		Html.mergeModDatas(this,obj)
	}
	/** clear el */
	remove() {
		Elem.removeChilds(this.parent) // FIXME would also remove other siblings of parent
	}
	removeChilds() {
		Elem.removeChilds(this)
	}
}
export default HtmlComp