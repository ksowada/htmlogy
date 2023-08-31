import Obj from '../../Obj/Obj.js'
import Str from '../../Str/Str.js'

/**
 * @class
 * utilities for exact one DOM element
 *
 * you can stringify this element, than .all contains all of the content of it, except of its events and child elements, so you may detect changes easily, as Element.outerHTML does not include styles,value and other things added programmatically, that's the only way to do this
 * @example
 * {"el":{}} // an empty element
 */
class Elem {
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
		if (this.el.style) return this.el.style.cssText
		return ''
	}
	get id() {
		return this.el.id
	}
	get atts() {
		return Elem.attributes(this.el)
	}
	// get evts()// cannot find out them
	/**
	 * @returns {string} textContent of the element without subelements, or when input the value
	 */
	get val() {
		let str = Elem.textContent(this.el)
		if (this.el.value) {
			if (str.length>0) str+= ' ' // sperator if other value present
			str += this.el.value // for input value
		}
		return str
	}
	get all() {
		const obj = {}
		for (const item of Elem.items) {
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
	static textContent(el,separator=' ') {
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
	/**
	 * reads the tag of a HTML/XML element
	 * @param {string} text valid HTML/XML string
	 * @returns {string} the tag of the element
	 */
	static tag(text) {
		let textInt = text.trimStart()
		const posStart = 1
		const posEnd = Str.indexOfFirst(textInt,[' ','>','/'])
		return textInt.substring(posStart,posEnd).toLowerCase()
	}
	/**
	 * create text of closing HTML/XML element with lowercase characters
	 * @param {string} tag HTML/XML Tag name
	 * @returns {string} text of closing HTML/XML element
	 */
	static tagClosing(tag) {
		return '</' + tag.toLowerCase()+ '>'
	}
	/**
	 * add a ending tag, if missing
	 * @param {string} text HTML/XML string
	 * @returns {string} HTML/XML string with ending tag
	 */
	static addEndTag(text) {
		let hText = text.trim()
		let hTag = Elem.tag(hText)
		let hTagEnd = Elem.tagClosing(hTag) //
		if (!hText.toLowerCase().endsWith(hTagEnd)) hText += hTagEnd
		return hText
	}
	/**
	 * omit the end tag if given
	 * @param {string} text HTML/XML string to omit end tag
	 * @returns {string} HTML/XML string without ending tag
	 */
	static omitEndTag(text) {
		let hText = text.trim()
		let hTag = Elem.tag(text)
		let hTagEnd = Elem.tagClosing(hTag) //
		if (text.toLowerCase().endsWith(hTagEnd)) hText = Str.omitEnd(hText,hTagEnd.length)
		return hText
	}

	// from https://stackoverflow.com/questions/2474605/how-to-convert-a-htmlelement-to-a-string

	/**
	 * convert DOM element to string
	 * @param {Element} who a DOM element
	 * @param {string} mode 
	 * - when 'deep', return also childs
	 * - when 'text', return text contents
	 * @returns {string} text of the DOM element
	 */
	static getHTML(who,mode) {
		if(!who || !who.tagName) return ''
		// eslint-disable-next-line init-declarations
		var txt,ax,el= document.createElement('div')
		el.appendChild(who.cloneNode(false))
		txt= el.innerHTML
		if(mode==='deep') {
			ax= txt.indexOf('>')+1
			txt= txt.substring(0,ax)+who.innerHTML+ txt.substring(ax)
		}
		if(mode==='text') {
			ax= txt.indexOf('>')+1
			txt= txt.substring(0,ax)+Elem.textContent(who)+ txt.substring(ax)
		}
		el= null
		return txt
	}
}
export default Elem