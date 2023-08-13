import Obj from '../../Obj/Obj.js'
import Str from '../../Str/Str.js'

/**
 * @class
 * utilities for exact one DOM element
 *
 * you can stringify this element, than .all contains all of the content of it, except of its events and child elements, so you may detect changes easily, as Element.outerHTML does not incude styles,value and other things added programmatically, that's the only way to do this
 * @example
 * {"el":{}} // an empty element
 */
class El {
	/** all names of items of EL that describe HTMLElement */
	static items = ['name','css','styles','id','atts','val']

	// TODO extends Element may provide easier access to other functions
	constructor(el) {
		this.el = el
	}
	get name() {
		return this.el.nodeName // usally upper-case
	}
	get css() {
		return this.el.classList.value
	}
	get styles() {
		return this.el.style.cssText
	}
	get id() {
		return this.el.id
	}
	get atts() {
		return El.attributes(this.el)
	}
	// get evts()// cannot find out them
	/**
	 * @returns {string} textContent of the element without subelements, or when input the value
	 */
	get val() {
		let str = El.textContentNode(this.el)
		if (this.el.value) {
			if (str.length>0) str+= ' ' // sperator if other value present
			str += this.el.value // for input value
		}
		return str
	}
	get all() {
		const obj = {}
		for (const item of El.items) {
			if (Obj.hasDefined(this,item)) { //  prevent undefined values
				const val = this[item]
				if (val!==undefined && val!=='') obj[item] = this[item] // prevent empty values
			}
		}
		return obj
	}
	// static functions on one HTMLElement
	// ###################################
	/**
	 * extract attributes from DOM element
	 * @param {HTMLElement} el an element from DOM
	 * @returns {object} each attribute creates key from name and its value; if no attributes existing empty object is returned
	 */
	static attributes(el) {
		const output = {}
		if (el.hasAttributes()) {
			for (const attr of el.attributes) {
				output[attr.name] = attr.value
			}
		} else {
			return undefined
		}
		return output
	}
	static textContentNode(el,separator=' ') {
		let str = ''
		el.childNodes.forEach((node,ix) => {
			if (node.nodeType === 3) { // as in test Node.TEXT_NODE is not defined so use int
				str += node.nodeValue
				if (ix < el.childNodes.length-1) str += separator
			}
		})
		return str
	}
	textContent(el,separator=' ') {
		let str = ''
		el.childNodes.forEach((node,ix) => {
			if (node.nodeType === 3) { // as in test Node.TEXT_NODE is not defined so use int
				str += node.nodeValue
				if (ix < el.childNodes.length-1) str += separator
			}
		})
		return Str.replaceAll(str)
	}
	/**
	 * find dimensions
	 * @param {HTMLElement} htmlEl delivers dimension
	 * @property {number} width width of actual element
	 * @property {number} height height of actual element
	 * @returns {object} dimensions of actual element, consists of 2 sizes
	 */
	static dimensions(htmlEl) {
		const ret = {}
		ret.width = htmlEl.clientWidth // div > a > img
		ret.height = htmlEl.clientHeight // div > a > img
		return ret
	}
}
export default El