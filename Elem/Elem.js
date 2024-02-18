import Arr from '../../Arr/Arr.js'
import Bit from '../../Bit/Bit.js'
import Int from '../../Int/Int.js'
import Obj from '../../Obj/Obj.js'
import Str from '../../Str/Str.js'
import Vars from '../../Vars/Vars.js'
import Html from '../Html/Html.js'

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
	/**
	 * compare may compare 2 or more element
	 * use getEl internally
	 * @param {object[]} objs must have at least 1 argument to comply and then accept unity and return true,
	 * use same parameter as @see {@link this.Elem}
	 * @returns {boolean} true, when all arguments are the same Element, or anything is undefined
	 * - undefined, when one address cannot be detected by getEl
	 * - false, when 1 or more of valid arguments are different
	 */
	// eslint-disable-next-line no-unused-vars
	static equalEl(objs) {
		if (arguments.length==0) return undefined
		// if (arguments[0]==undefined) return // when not defined
		if (arguments.length==1) return true
		let argIx = 0
		let matchCnt = 0
		// let undefinedCnt = 0
		let el1 = Html.getEl(arguments[0])
		if (el1==undefined) return // not valid adress given so forget output
		// if (arguments[0]==undefined) undefinedCnt++ // if not given, no problem will not influence equalness
		for (argIx = 1; argIx < arguments.length; argIx++) {
			// if (arguments[argIx]==undefined) undefinedCnt++
			let el2 = Html.getEl(arguments[argIx])
			if (el2==undefined) return // not valid adress given so forget output
			if (el1.isSameNode(el2)) matchCnt++
			el1 = el2 // prepare next iteration
		}
		return (matchCnt==arguments.length-1) // 1 match less as items
	}
	/**
	 * change property of an element
	 * @param {Element} el DOM-element to change
	 * @param {string} prop a property of the element to change
	 * @param {any} value value to set
	 * @returns {boolean} true, if changed something; false, if already equals the value
	 */
	static change(el,prop,value) {
		const original = el[prop]
		if (original===value) return false
		el[prop] = value
		return true
	}
	/**
	 * find element by tag name and additional atts and change element according to edit
	 * @param {object} el HTMLElement to attach created, and start point for search, if not found
	 * @param {object} search object with certain arguments
	 * @param {string} search.html HTMLElement to search
	 * @param {object} search.atts a obj of HTMLAttribute (all atts must be found)
	 * @param {object} edit Object to change HTMLElement
	 * @param {boolean} create set to create a new Html, defaults to true
	 * @returns {Html} if created, otherwise undefined
	 * @throws {Error} if search.html is not found
	 */
	static findActions(el,search,edit,create=true) { // TODO optional create, use it also for find
		if (!search.html) throw new Error('html not given but needed')
		const foundEls = Elem.getChilds(el,search.html)
		let changeCnt = 0
		for (let ix = 0; ix < foundEls.length; ix++) {
			const foundEl = foundEls[ix]
			let found_atts = 0
			const searchAttsLen = Object.keys(search.atts).length // remember as have to find any atts in foundEl
			Object.keys(search.atts).forEach(attKey => {
				const foundElAtt = foundEl.getAttribute(attKey)
				if (foundElAtt!==null && foundElAtt==search.atts[attKey]) found_atts++
			})
			// for (const attKey in search_attsArr) {
			// 	if (Object.hasOwnProperty.call(search_attsArr,attKey)) {
			// 		// const element = search_attsArr[attKey]; // TODO only use attKey?

			// 	}
			// }
			if (found_atts==searchAttsLen) {
				Html.edit(undefined,{el:foundEl},edit,'change') // TODO shall change el, but static change is deleted
				changeCnt++
			}
		}
		if (changeCnt>1) console.info('multiple elements changed, expected 1, found:'+changeCnt)
		const joinedAtts = Html.mergeDatas(search,edit)
		if (create && changeCnt==0) return new Html({parent:{el},...joinedAtts})
		return undefined
	}
	/**
	 * clean subnodes and text contents from given parent, but leave parent element
	 * @param {object} arg supply at least parent
	 * @param {HTMLElement} arg.parent.el Element to append
	 * @param {string} arg.parent.id id of HTMLElement, optional to el
	 * @param {Html} arg.parent.obj optional to el and id of HTMLElement
	 */
	static removeChilds(arg) {
		const el = Html.getEl(arg)
		if (el==undefined) return
		el.innerHTML = ''
	}
	/**
	 * clean subnodes and text contents from given parent, but leave parent element
	 */
	removeChilds() {
		Elem.removeChilds(this.el)
	}
	static removeAttributes(el) {
		while(el.attributes.length > 0) {
			el.removeAttribute(el.attributes[0].name)
		}
	}
	/**
	 * set some textContent given by Parameter, do overwrite
	 * if el is input set str to value, do not overwrite if no change is detected
	 * @param {HTMLElement} el an Element to modify
	 * @param {string} str text to set textContent, if undefined change nothing
	 * @returns {boolean} true if content has changed
	 */
	static textContentSet(el,str) {
		if (!Str.is(str)) return undefined
		const isInput = (el.localName==='input')
		if (isInput) {
			if (el.value!==str) {
				el.value = str
				return true
			}
		} else {
			if (el.textContent!==str) {
				el.textContent = str
				return true
			}
		}
		return false
	}
	/**
	 * add some textContent given by Parameter, do not overwrite
	 * if el is input add str to value
	 * @param {HTMLElement} el an Element to modify
	 * @param {string} str text to add adjacent to textContent, if undefined change nothing
	 */
	static textContentAdd(el,str) {
		if (!Str.is1(str)) return
		const isInput = (el.localName==='input')
		const oldContent = (isInput)?el.value:el.textContent
		if (isInput) {
			el.value = oldContent + str
		} else {
			el.textContent = oldContent + str
		}
	}
	/**
	 * search in document for first given HTML-tag
	 * @param {string} tag name of HTML-tag
	 * @returns {Element} first found element with given tag-name
	 */
	static getElByNameFirst(tag) {
		const els = document.getElementsByTagName(tag)
		return els.item(0)
	}
	/**
	 * get 1st level children of HTMLElement
	 * @param {HTMLElement} el is undefined than []
	 * @param {string} tag is undefined than all children
	 * @returns {HTMLElement[]} any children of DOM.Node children with tag name as array
	 * - when no children than []
	 */
	static getChilds(el,tag) {
		const childs = []
		if (el==undefined) return childs
		const childNodes = el.childNodes
		if (childNodes==undefined) return childs
		childNodes.forEach(e => {
			const eType = Vars.typeHier(e) // may be more specialiced of Element
			if (eType.includes('HTMLElement')) {
				if (tag==undefined || e.localName==tag) childs.push(e)
			}
		})
		return childs
	}
	/**
	 * get textValue of first child, if given
	 * @param {Element} el element to search in
	 * @param {string} tag tagname f.e. div
	 * @returns {string} textValue if given, else undefined
	 */
	static getChildsFirstVal(el,tag) {
		const els = el.getElementsByTagName(tag)
		const eli = els.item(0)
		if (eli==undefined) return undefined
		return eli.textContent
	}
	/**
	 * get all 1st level childs, if not existing add and return a given htmlObj
	 * - use f.e. to assure a child, if not existing will be added
	 * @param {HTMLElement[]} el base element in dom whose children get observed
	 * @param {string} tag optional, tag name which child should comply
	 * @param {object} htmlObj optional fallback, if no child is found, this will be created and returned
	 * @returns {HTMLElement[]} array of DOM element
	 * - if not found in el create new as given in htmlObj
	 * - with el is undefined than []
	 * - with tag is undefined than all children
	 * - when no children than [fallback] or []
	 */
	static getChildsAssured(el,tag,htmlObj) {
		const childs = Elem.getChilds(el,tag)
		if (childs.length==0) {
			const childHtml = new Html(htmlObj)
			childs.push(childHtml.my.el)
		}
		return childs
	}
	/**
	 * set class from List of Element, and delete other used in List
	 * @param {HTMLElement} el Element to search for class
	 * @param {string|number|boolean} css choose this class instead of other classes
	 * - optional ix in cssList
	 * - when boolean than true represents index 1 and false index 0
	 * - if undefined remove every item in cssList
	 * @param {string[]} cssList Array of classes, optional if css given
	 * @returns {number} cnt of removed in classList
	 */
	static classStateSet(el,css,cssList) {
		if (!Vars.is(el)) return undefined
		if (typeof css==='number') { // css must be an index in cssList
			if (!Arr.is1(cssList)) return undefined
			css = cssList[css].trim()
		} else if (typeof css==='boolean') { // css must be a boolean in cssList
			if (!Arr.is1(cssList)) return undefined
			css = cssList[Bit.toInt(css)].trim()
		} else if (css==undefined) {
			css = ''
		}else{
			css = css.trim()
		}
		let removeCnt = 0
		if (Arr.is1(cssList)) {
			cssList.forEach(e => {
				if (e.length>0 && el.classList.contains(e)) {
					el.classList.remove(e)
					removeCnt++
				}
			})
		}
		if (Str.is1(css)) el.classList.add(css)
		return removeCnt
	}
	/**
	 * get existent classes from List of Element
	 * @param {HTMLElement} el Element to search for class
	 * @param {string[]} cssList Array of classes
	 * @returns {object[]} every item from cssList exist in el with .ix and .name
	 */
	static classStateGet(el,cssList) {
		if (!(cssList instanceof Array)) return []
		Str.clean1(cssList)
		const retArr = []
		for (let i=0; i<cssList.length; i++) {
			if (el.classList.contains(cssList[i])) {
				retArr.push({ix:i,name:cssList[i]})
			}
		}
		return retArr
	}
	/**
	 * return true if class in Element is given
	 * @param {HTMLElement} el Element to search for class
	 * @param {string|string[]} css single item or Array of classes, Array may be modified when cleaning
	 * @returns {boolean} true if each css is found in Element
	 */
	static classStateIs(el,css) {
		if (css==undefined) return false
		if (css instanceof Array) {
			Str.clean1(css)
			const found = css.filter(e => el.classList.contains(e))
			return found.length==css.length
		}
		return el.classList.contains(css)
	}
	/**
	 * toggle or cycle through classes incrementally
	 * - if none of cssList is active, set first
	 * @param {HTMLElement} el Element to search for class
	 * @param {string[]} cssList Array of classes
	 * @returns {object} with .name and .ix
	 * @throws error if more than 1 class of cssList active in element
	 */
	static classStateIncr(el,cssList) {
		const cssActives = Elem.classStateGet(el,cssList)
		if (cssActives.length==0) { // if none of cssList is active, set first
			Elem.classStateSet(el,0,cssList)
			return {name:cssList[0],ix:0}
		} else if (cssActives.length==1) {
			const ix = cssActives[0].ix
			const ixNext = Int.incr(ix,0,cssList.length-1)
			Elem.classStateSet(el,ixNext,cssList)
			return {name:cssList[ixNext],ix:ixNext}
		}
		throw new Error('more than 1 state active in classList')
	}
	/**
	 * find parent of HTMLElement
	 * - if no parameter is given return parent of el
	 * - may set a relative level
	 * - or use relative level to given parentEl
	 * - or return parentEl if it is parent, if parentDepth is undefined
	 * @param {HTMLElement} el
	 * - if not given return undefined
	 * @param {HTMLElement} parentEl optional parent from which to iterate
	 * - but only if el (may from event) is child of parent
	 * - if parentEl is not parent of el return undefined
	 * @param {boolean} parentDepth return closest nth-parent
	 * - if not given and no parentEl given return closest parent
	 * - 0 return itself (or if parentEl is given return parentEl)
	 * @returns {HTMLElement} parent to be found
	 */
	// TODO use getEl for ease adaption
	// TODO old identity compare not work
	static findParent(el,parentEl,parentDepth) {
		if (!el) return undefined
		if (parentDepth==undefined && parentEl==undefined) {
			let parent = el.parentElement
			if (parent===null) return // ease handling when no parent available by avoiding null to undefined
			return parent
		}
		if (parentDepth==0 && parentEl!==undefined) return el
		let thisEl = el
		let evtParentsEl = []
		evtParentsEl.push(thisEl)
		let findParentElEn = (parentEl!==undefined)
		// eslint-disable-next-line no-nested-ternary
		let findParentDepth = (parentDepth==undefined) ? (parentEl==undefined)?1:0 : parentDepth // find next parent if not given
		while (findParentElEn || findParentDepth>0) {
			if (thisEl===null) return undefined // no valid iterated parent any more, than return undefined
			if (findParentElEn) { // when parentEl is given
				if (thisEl.isSameNode(parentEl)) {
					findParentElEn = false
					if (findParentDepth==0) return thisEl // otherwise next parent is shifted, even if I should return thisEl
				}
			} else {
				findParentDepth--
			}
			thisEl = thisEl.parentElement
			evtParentsEl.push(thisEl)
		}
		if (evtParentsEl[evtParentsEl.length-1]===null) return undefined // avoid null
		return evtParentsEl[evtParentsEl.length-1]
	}
}
export default Elem