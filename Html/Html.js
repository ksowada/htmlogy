import {html} from 'htm/preact'
import Arr from '../../Arr/Arr.js'
import Obj from '../../Obj/Obj.js'
import ObjObj from '../../Obj/ObjObj.js'
import Str from '../../Str/Str.js'
import Timer from '../../Timer/Timer.js'
import Vars from '../../Vars/Vars.js'
import Elem from '../Elem/Elem.js'
/**
 * @class
 * Virtual DOM tree - handles easy programmatic DOM creation, manipulation and removement
 * handles creation and update for 1 or more HTMLElement
 */
class Html {
	// TODO add interactivity and store parent hierarchy via non-static if getEl get obj hook it and show in log, easy to handle debug info
	// TODO feature create this from existing elements to easy handle foreign html
	// TODO at real data or change isssue tell parents
	// TODO atts>att|evts>evt|styles>sty - arrays|single item as css,val,sty,evt,att
	// TODO #unity .valid => .is (as in Int)
	// TODO extend constructor to support string from HTM close JSX https://github.com/developit/htm
	// TODO extends HTMLElement (see ACE https://mkslanc.github.io/ace-playground/#shadow-dom)
	// TODO extend constructor to add child elements in array
	// TODO eliminate .top and .container through sub-class or in render (split it up) that enables this, causes trouble with htmlNamespace
	// TODO what about operations that are not supported without rendered element, f.e. classStateSet, see doc
	// TODO optimize member names .arg duplicates as argument
	/**
	 * creates dynamic HTMLElement
	 *
	 * usage:
	 * - to instantly create element in parent given as .el[element], .id, or .obj[Html]
	 * - for parent, use with .my without creation of element but use existing element
	 * - you may render later, also you can define the parent element later at render(), you can even add childs after creation and render them later, some operations are not supported without rendered element, f.e. classStateSet
	 * @param {Html~createarg} arg supply create()-like arg @see {@link this.create}
	 * @param {boolean} arg.domLater if non-existent or false, don't render() directly
	 * @param {Html~domadr} arg.my if given, don't render(), just use as parent
	 * @param {Html~domadr} arg.parent if not given, don't render() directly
	 * @param {object[]} childs these items get constructor-args, and will be append as children of this
	 */
	constructor(arg={},childs=[]) {
		/**
		 * remember arg for later create or other purposes
		 * @type {object[]}
		 */
		this.arg = arg

		/** if container in use, this is top created item, else it is usual Element created and equal this.my */
		// TODO .top.obj sometimes unfilled @html.test.create2 alternative
		this.top = {}

		/**
		 * stores all added events in an array, for removing or dispatching later in time
		 * @private
		 */
		this.top.evts = []

		/** fills in .el | .obj | .id of constructed Html-Object, and other created obj as icon and other things to remember */
		// TODO circular reference when this. is included in this.my.obj, problems with JSON.stringify
		this.my = {} // create my only after create, overwise this gets unused my

		/**
		 * stores all added events in an array, for removing or dispatching later in time
		 * @private
		 */
		this.my.evts = []

		// TODO rename to subs, as they shall be accessed indpenden of hierarchy depth, or use add feature to pack it into subobject of Html
		/**
		 * Array of object in which key represent an item, as named child in which you lay subelements (Html-Objects) for some State or Select-actions, no internal usage, just for access directly, f.e. for HtmlState which contain actions for the element as well as for subelements, at once
		 * @type {object[]}
		 */
		this.childs = []

		// TODO pack all html* in .hier. object for a clear view
		/**
		 * hold parent, detected at creation when parent given as .parent.obj
		 * @type {Html}
		 */
		this.htmlParent = undefined

		/**
		 * hold all childs, detected at creation when parent given as .parent.obj
		 * @type {Html[]}
		 */
		this.htmlChilds = []

		/**
		 * created {Html} my.obj
		 * - this will produce virtual(in debugger) y  an infinite depth of this.my.obj.my.obj....
		 */
		this.my.obj = this

		/**
		 * abbreviation for direct access to dom-element
		 * @type {HTMLElement}
		 */
		this.el = this.my.el

		/**
		 * short utility to jsonify and compare the element without its child and events
		 * @type {Elem}
		 */
		this.elo = undefined
		/**
		 * collect all timers, to remove them also at remove()
		 * @type {Timer[]}
		 */
		this.timers = []

		// TODO pack all dom* in one render* object for a clear view
		// TODO may replace it with this.my.el !== undefined
		/**
		 * indicates if it is already mounted in DOM through Html,
		 * it may exist when manual DOM mainpulation outside this class happened
		 * @type {boolean}
		 */
		this.domed = false

		/**
		 * indicate that construcotr will not render to DOM, if true
		 * - you may render later with render()
		 * @type {boolean}
		 */
		this.domLater = undefined

		// if arg my is given, only use this element for later add() or as parent
		if (arg.my !== undefined) {
			this.useEl(this.arg)
			this.domed = true
			this.domLater = false
		// existing .domLater or no parent given or parent has .domLater indiciate later processing
		} else if (Obj.hasEql(this,['arg','domLater'],true) || this.arg.parent == undefined || (this.arg.parent.obj && this.arg.parent.obj.domLater == true)) {
			this.domLater = true
		} else {
			this.domLater = false
			this.render(this.arg)
		}
		childs.forEach(child => this.add(child)) // just a abbreviation to shorten calls
	}
	/**
	 * create dom from parameters given in constructor and here as arg. Use to create the constructed Html
	 * - you can add a parent at this point
	 * - the Html-object may contain childs already
	 * @param {object} arg Html-parameters as described in constructor
	 */
	render(arg) {
		Html.mergeModDatas(this.arg,arg,{doming: true}) // merge args
		this.create(this.arg)
	}
	/**
	 * use existing element for Html construction, address it by .my
	 * @param {object} arg hold address info
	 * @param {Html~domadr} arg.my address info for accessing HTMLElement
	 * @private
	 */
	useEl(arg) {
		// find matching HTMLElement to operate
		this.el = Html.getEl(arg.my)
		this.elo = new Elem(this.el)
		this.elo.removeChilds()
		this.my.el = this.el
	}
	/**
	 * @typedef {object} Html~createarg common ways to address HTMLElement in DOM, choose only 1 of those
	 * @param {object} arg.evts events of HTMLElelement (an element must be on DOM to be triggered)
	 * @property {object} arg contains information about the element	 *
	 * @property {string} arg.id id of HTMLElement, optional to el
	 * @property {string} arg.h template syntax, see htm from https://github.com/developit/htm/tree/master
	 * - you may deliver a string, valid html or optionally with missing end tag
	 * - for template syntax, use import {html} from 'htm/preact'
	 * @property {string} arg.html htmlTagName, div if unused, SVG supported, it adds namespace automatically
	 * @property {string} arg.htmlNS html Namespace, f.e. svg Element
	 * @property {string|Array} arg.css row of CSSClass (str space-separated or arr of classes)
	 * @property {object} arg.styles extra inline styles, like background-color
	 * @property {string} arg.val value (input use value else use innerText)
	 * @property {string} arg.valhtml @deprecated optional subelement with and instead for val, f.e. use to center with val in grid use extra div
	 * @property {object} arg.atts attributes of HTMLElement
	 */
	/**
	 * create DOMElement
	 * @param {Html~createarg} arg may be segmented in different arguments, obj will be merged with last-win
	 * @param {Html~domadr} arg.parent address info for accessing HTMLElement
	 * - if not given, it will not be appended to dom
	 * - for use when manually appended or inserted on certain pos
	 * @param {Html} arg.parent.obj optional to el and id of HTMLElement; when parent given this way, it enable backtrace of dom-hierarchy, it create htmlParent in this object, and  add htmlChilds in its parent
	 * @param {object} arg.container optional container
	 * @param {string} arg.container.html container, div if unused
	 * @param {string} arg.container.htmlNS html Namespace, f.e. svg Element
	 * @param {boolean} arg.domLater do not render Html instantly, but may be later with calling render()
	 * - this property will be inherit to all childs
	 * @param {boolean} arg.doming indicate that render() process is in progress, is used to dom childs even if domLater is set, only invoked from render()
	 * @private
	 * @example
	 * {
	 *   css:'blinking',
	 *   val:'cameleon',
	 *   styles:{'background-color':'red'}
	 * }
	 */
	create(arg) {
		// if domLater in parent, inherit this property and break creation, but if doming create
		if (ObjObj.childsHasEql(arg,['parent','obj'],'htmlParent','domLater',true) && !Obj.hasEql(arg,'doming',true)) {
			return
		}
		// if parent given by .obj, remember the parent, and in parent add child
		if (Obj.has(arg,'parent','obj')) {
			arg.parent.obj.htmlChilds.push(this)
			this.htmlParent = arg.parent.obj
		}
		// if it is already domed cancel
		if (this.domed) return

		// find matching HTMLElement to operate
		arg.el = Html.getEl(arg.parent)

		// html-mode
		if (!arg.html) arg.html = 'div' // if html not given create a div
		arg.html = arg.html.toLowerCase()

		// h-mode will overwrite .html and add to .atts and .val
		if (arg.h) {
			// eslint-disable-next-line init-declarations
			let hVal // use copy to keep the original
			if (Str.valid(arg.h)) {
				// add eventually missing endtag
				const hText = Elem.addEndTag(arg.h)
				// let hText = arg.h.trim()
				// let hTag = Elem.tag(hText) //first space  or closing bracket
				// let hTagEnd = Elem.tagClosing(hTag) //
				// if (!hText.toLowerCase().endsWith(hTagEnd)) hText += hTagEnd

				hVal = html([hText])
			} else {
				hVal = Object.assign(arg.h)
			}

			// type contains tag
			arg.html = hVal.type

			// props contains attributes
			const hPropsVal = Object.assign(hVal.props)
			if (!arg.val) arg.val = ''
			if (hPropsVal.children) arg.val = hPropsVal.children + arg.val // join val from htm and props
			Obj.omitMod(hPropsVal,'children') // omit no regular attributes
			arg.atts = Object.assign(hPropsVal,arg.atts)
		}
		// html-namespace issues
		const htmlNamespaceParent = ObjObj.childsHasDefined(arg,['parent','obj'],'htmlParent','htmlNamespace')
		if (htmlNamespaceParent) { // inherit namespace from parent
			this.htmlNamespace = htmlNamespaceParent
		}
		if (arg.html === 'svg') { // auto build svg namespace
			this.htmlNamespace = 'http://www.w3.org/2000/svg' // will also inherit to child elements
		}
		this.createEl(this.my,arg,this.htmlNamespace)
		// TODO container may be unused or duplicate with HtmlElComp.container
		// TODO use new Html for Container creation
		if (arg.container) {
			if (!arg.container.html) arg.container.html = 'div' // if html not given create a div
			if (arg.container.html === 'svg') { // auto build svg namespace
				arg.container.htmlNamespace = 'http://www.w3.org/2000/svg' // will also inherit to child elements
			}
			this.createEl(this.top,arg.container,arg.container.htmlNamespace)
			this.top.el.appendChild(this.my.el)
			if (arg.el) arg.el.appendChild(this.top.el)
			Html.edit(this,this.top,arg.container,{append: true})
		} else {
			this.top.el = this.my.el
			if (arg.el) {
				arg.el.appendChild(this.my.el)
			}
		}

		this.el = this.my.el
		this.elo = new Elem(this.el)
		Html.edit(this,this.my,arg,{append: true}) // TODO this.my is not type Html
		// also involve childs when doming (before change arg)
		// TODO may integrate List
		if (arg.doming == true) {
			this.htmlChilds.forEach(child => {
				child.create({...child.arg,doming: true})
			})
		}
		this.domed = true
		this.doming = false
	}
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * @param {Html} parentObj parent with which the new element is created with
	 * @param {object} arg hold create parameters
	 * @param {string} htmlNamespace optional html namespace
	 * @private
	 */
	createEl(parentObj,arg,htmlNamespace) {
		if (arg.htmlNS) { // manual given namespace
			parentObj.el = document.createElementNS(arg.htmlNS,arg.html)
		} else if (htmlNamespace) { // auto or inherit namespace
			parentObj.el = document.createElementNS(htmlNamespace,arg.html)
		} else if (arg.atts && arg.atts.xmlns) { // auto or inherit namespace
			parentObj.el = document.createElementNS(arg.atts.xmlns,arg.html)
		} else { // usual tag without namespace
			parentObj.el = document.createElement(arg.html)
		}
	}
	// TODO unused, you may use edit directly
	/**
	 * change Html, this modifies given parameters
	 * see details for change {@link Html#edit}
	 * @param {object} arg same arguments as create @see {@link this.create}
	 * @returns {boolean} true when html has changed (do not notify changes on events)
	 */
	change(arg) { return Html.edit(this,this.my,arg,{change: true}) }
	/**
	 * append Html, this create or add given parameters to existing
	 * see details for change {@link Html#edit}
	 * @param {object} arg same arguments as create @see {@link this.create}
	 * @returns {boolean} true when html has changed (do not notify changes on events)
	 */
	append(arg) { return Html.edit(this,this.my,arg,{append: true}) }
	/**
	 * remove HTMLElement or if given in argument, some item of it
	 * - removeEventHandler before remove from DOM
	 * - remove optional icon
	 * - remove optional top
	 * @param {object} arg arguments so you can Html.obj.parameters as .atts, .val, .evts, see @link {Html#edit}
	 */
	remove(arg) {
		if (Obj.valid(arg) && Object.keys(arg).length) { // if given Object it will remove these item of it, if existing
			Html.edit(this,this.my,arg,{remove: true})
		} else { // remove itself
			// also care for childs
			this.htmlChilds.forEach(child => {
				child.remove()
			})
			this.timers.forEach(timer => timer.remove())
			if (this.domed) {
				this.domed = false
				// remove given events manually, because old browsers may get memory leaks when removing element
				this.my.evts.forEach(evt => {
					this.my.el.removeEventListener(evt.key,evt.cbk)
				})
				this.my.evts = [] // empty array at once

				this.top.evts.forEach(evt => {
					this.top.el.removeEventListener(evt.key,evt.cbk)
				})
				this.top.evts = [] // empty array at once

				// remove elements in my and top
				if (this.my.iconObj !== undefined) this.my.iconObj.remove()
				if (this.my.subElement !== undefined) this.my.subElement.remove()
				this.my.el.remove()
				if (this.top.iconObj !== undefined) this.top.iconObj.remove() // maybe unused at the moment
				if (this.top.subElement !== undefined) this.top.subElement.remove() // maybe unused at the moment
				if (this.top.el !== undefined) this.top.el.remove()
			}
		}
	}
	/**
	 * edit given HTMLElement, may attach to new, change or remove,
	 * also may edit a Html, when not mounted in .el, then change in .arg
	 * also change this.arg according to dom (neithertheless this is mounted to DOM)
	 * - class from .css: at change: remove all given css class and then edit new // TODO only allow 1 string at change and remove
	 * - style from .styles: at change: enrich given style
	 * - various attributes from .atts: at change: enrich given HTMLElement
	 * - events from .evts: at change: enrich given events
	 * - i from .icon: at change: replace given icon
	 * - subHTMLElement from .valhtml: at change: remove and add new
	 * in mode remove
	 * @param {object} thisObj usually this when called non-static, if leaved off major Html-Feature as later doming or parent and children gathering is impossible, but staic DOM-create,edit or remove is possible
	 * @param {Html} elem usually this.my or this.el
	 * - important to modify this item later on or remove
	 * - contains sub-variables to modify, adapt or remove
	 * @param {Html~createarg} arg supply create()-like arg @see {@link this.create}
	 * @param {object} mode may contain 1 item of these set to true:
	 * - append [default]
	 * - change
	 * - remove
	 * - if atts:{item:value} is given: only delete if it is equal to value
	 * - if atts:{item:''} | atts:{item:undefined} remove attribute
	 * @returns {boolean} true when html has changed (do not notify changes on events)
	 */
	// TODO at id make auto atts to appreviate and overwrite defined from atts
	// TODO topObj is not Html, but .my or .top
	// TODO remove not implemented for any item, just css
	static edit(thisObj={arg:{}},elem,arg,mode) {
		const inDOM = (elem.el!== undefined) // thisObj.domed not working at test
		const inHtml = Vars.type(elem)==='Html'
		const elo = new Elem(elem.el) // build own elo, instead of this, cause at construction not existent, and topObj may vary between my or top
		const eloWatch = new Vars(inDOM?elo.all:Obj.omit(thisObj.arg,'parent')) // to find out if really something changed
		let item = undefined

		if (Obj.hasDefined(arg,item = 'css')) {
			const key = arg[item]
			if (mode.remove) {
				if (inDOM) {
					elem.el.classList.remove(key)
				}
				thisObj.arg = Str.enrichList(' ',thisObj.arg[item]) // if array convert to string
				thisObj.arg = Str.removeFromList(thisObj.arg,' ',key)
			} else {
				if (mode.change) {
					if (inDOM) elem.el.removeAttribute('class') // at change, delete old classes, only use new given
					thisObj.arg[item] = ''
				}
				if (inDOM) {
					let csss = []
					csss = Str.enrichList(' ',arg[item]) // add arrays or list of whitespace seperated str
					csss = Str.split(csss,' ') // convert into Array
					csss.forEach(e => elem.el.classList.add(e))
				}
				thisObj.arg[item] = key
			}
		}
		if (Obj.hasDefined(arg,item = 'styles')) {
			for (const key in arg[item]) {
				if (Object.hasOwnProperty.call(arg[item],key)) {
					const valItem = arg[item][key]
					if (inDOM) elem.el.style.setProperty(key,valItem)
					thisObj.arg[key] = valItem
				}
			}
		}
		if (Obj.hasDefined(arg,item = 'id')) { // will be set later by atts.id
			if (!arg.atts) {
				arg.atts = {id: arg[item]} // use atts and modify id of obj in that way later in method
			} else {
				arg.atts.id = arg[item] // overwrite when directly given and defined from atts
			}
			if (!thisObj.arg.atts) {
				thisObj.arg.atts = {id: arg[item]} // use atts and modify id of obj in that way later in method
			} else {
				thisObj.arg.atts.id = arg[item] // overwrite when directly given and defined from atts
			}
		}
		if (Obj.hasDefined(arg,item = 'atts')) {
			for (const key in arg[item]) {
				if (Object.hasOwnProperty.call(arg[item],key)) {
					const valItem = arg[item][key]
					if (mode.remove) {
						if (inDOM) {
							if (valItem !== undefined && valItem.length > 0) { // if atts item:value is given and of string length more than 0
								if (elem.el.getAttribute(key) === valItem) elem.el.removeAttribute(key)
							} else {
								elem.el.removeAttribute(key)
							}
						}
						Obj.omit(thisObj.arg,key)
					} else {
						if (inDOM) elem.el.setAttribute(key,valItem)
						thisObj.arg[key] = valItem
					}
				}
			}
		}
		if (Obj.hasDefined(arg,item = 'evts')) { // TODO mount when at dom also at change
			for (const key in arg.evts) {
				if (Object.hasOwnProperty.call(arg.evts,key)) {
					const cbk = arg.evts[key]
					if (inDOM) elem.el.addEventListener(key,cbk)
					elem.evts.push({key,cbk})
				}
			}
		}
		// than attach additional elements
		if (Obj.hasDefined(arg,item = 'icon')) { // FEATURE handle multiple icon when array
			if (mode.change && elem.iconObj !== undefined) elem.iconObj.remove()
			/** holds optional icon @private, but in container as fontawesome, comment <i> out and add svg */
			elem.iconObj = new Html({parent: {obj: elem.obj},container: {html: 'span'},html: 'i',css: arg.icon}) // TODO dont care about existing icons at update
		}
		// than change elements contents, may be either sub element given by valhtml and val or just a textcontent in val
		// TODO valhtml is this used, otherwise remove it, do not work properly as valhtml is given as html
		if (Obj.hasDefined(arg,item = 'valhtml')) { // FEATURE plural-arr
			/** subelement given at create or change with valhtml and val */
			if (mode.change && thisObj.my.subElement !== undefined) thisObj.my.subElement.remove()
			thisObj.my.subElement = new Html({parent: {el: elem.el},html: arg.valhtml,val: arg.val})
		// you can use either valhtml or val so else
		} else if (Obj.hasDefined(arg,item = 'val')) { // FEATURE plural-arr
			if (inDOM && elem.el.localName == 'input') elem.el.value = arg.val
			else if (!inDOM && thisObj.arg.html == 'input') thisObj.arg.val = arg.val
			else {
				if (mode.change) {
					// take last node being Textnode
					if (inDOM) for (const node of elem.el.childNodes) {
						if (node.nodeType === 3) { // as in test Node.TEXT_NODE is not defined so use int
							elem.el.removeChild(node)
						}
					}
				}
				// TODO remove in val is not defined
				if (inDOM) elem.el.insertAdjacentHTML('beforeend',arg.val)
				thisObj.arg.val = arg.val
			}
		}
		if (inHtml && inDOM) Html.writeIdFromEl(thisObj) // if id would change, catch it here, only when called unstatic
		eloWatch.set(inDOM?elo.all:Obj.omit(thisObj.arg,'parent'))
		return eloWatch.changed
	}
	/**
	 * @typedef {object} Html~domadr common ways to address HTMLElement in DOM, choose only 1 of those
	 * @property {Html|HtmlElComp} obj optional to el and id of HTMLElement
	 * @property {HTMLElement} el direct address
	 * @property {string} id id of HTMLElement, optional to el
	 */
	/**
	 * get el from DOM addressed by an Object of different kind
	 * - you may use auto detection or attach Object to direct adress properties for faster access
	 * - but original Object may missed in obj for outer further purposes
	 * @param {Html~domadr} arg address parameter
	 * @returns {HTMLElement} gives .el of instance
	 * - null when nothing found
	 * - undefined if no arguments
	 */
	// TODO add getEl from event
	static getEl(arg) {
		if (arg == undefined) return undefined
		let el = null
		const objType = Vars.type(arg)
		const objHier = Vars.typeHier(arg)
		if (objHier.includes('Object')) { // faster access with no type detection // usual obj with multiple defined ways to adress Element in DOM
			if (!arg.el) { // find by other means, as el is not given
				if (arg.obj) {
					if (arg.obj.containerObj) el = arg.obj.containerObj.my.el // used for HtmlElComp
					else if (arg.obj.div) el = arg.obj.div // used for HtmlElComp
					else el = arg.obj.my.el // for Html
				} else if (arg.div) { // usally given by HtmlElComp (because it may be containerless)
					el = arg.div
				} else if (arg.id) {
					el = document.getElementById(arg.id)
				} else return // no id or el given
			} else {
				el = arg.el // given as el, so use it
			}
		} else if (objHier.includes('Element')) { // direct element may be special
			el = arg
		} else if (objType == 'Number') { // consider it as id
			el = document.getElementById(arg.toString())
		} else if (objType == 'String') { // consider it as id
			el = document.getElementById(arg)
		} else if (objHier.includes('HtmlElComp')) { // as it may extend Html use this sequence before matiching with Html
			el = arg.div
		} else if (objHier.includes('Html')) {
			el = arg.my.el
		}
		return el
	}
	/**
	 * add introduce child, automatically sets parent with this and construct it
	 * @param {object|Html} arg supply create()-like arg or already created Html
	 * @param {string} arg.name name of class member, if given it generate it, so you can use this child as .[name]
	 * @returns {Html} new produced child of this
	 */
	// TODO add test
	add(arg) {
		Obj.put(arg,['parent','obj'],this)
		let htmlObj = undefined
		if (Vars.typeHier(arg).includes('Html')) {
			htmlObj = arg
			// if parent is rendered, render now
			if (arg.parent.obj.domLater!==true) htmlObj.render({parent:{obj:this}}) // only give parent, as arg already contain populated arg in form of Html
		} else {
			htmlObj = new Html(arg)
		}
		// if parent not rendered, child wont render, unless it is in htmlChilds
		if (arg.parent.obj.domLater===true) arg.parent.obj.htmlChilds.push(htmlObj)

		// add as child, when .name is given
		if (Str.valid(arg.name)) this[arg.name] = htmlObj
		return htmlObj
	}
	/**
	 * add introduce child and form array, if called multiple times it extend the array, automatically sets parent with this and construct it
	 * @param {object} arg supply create()-like arg
	 * @param {string} arg.name name of class member, if given it generate it, so you can use this child as .[name]
	 * @returns {Html} new produced child of this
	 */
	addArr(arg) {
		Obj.put(arg,['parent','obj'],this)
		const htmlObj = new Html(arg)

		// add as child, when .name is given
		if (Str.valid(arg.name)) {
			if (this[arg.name] == undefined) this[arg.name] = []
			this[arg.name].push(htmlObj)
		}
		return htmlObj
	}
	/**
	 * get id from DOM, and write it to .my.atts (only if defined) and .my.id
	 * @param thisObj
	 * @returns {string} id as red from DOM, if not given return undefined
	 * @private
	 */
	static writeIdFromEl(thisObj) {
		/** if given show id */
		let id = thisObj.my.el.getAttribute('id')
		if (id !== null && id !== '') {
			/** the id if given at construction by .id or .atts */
			thisObj.my.id = id
			if (thisObj.my.atts == undefined) thisObj.my.atts = {}
			thisObj.my.atts.id = id // maybe overwrite if it was already there, when f.e. given by .atts instead .id
		} else if (id === null) id = undefined
		return id
	}
	/**
	 * set some textContent given by Parameter, do overwrite
	 * @param {string} str text to set textContent, if undefined change nothing
	 * @returns {boolean} true if content has changed
	 */
	textContentSet(str) {
		return Elem.textContentSet(this.my.el,str)
	}
	/**
	 * add some textContent given by Parameter, do not overwrite
	 * @param {string} str text to add adjacent to textContent, if undefined change nothing
	 */
	textContentAdd(str) {
		Elem.textContentAdd(this.my.el,str)
	}
	/**
	 * set class from List, and delete other used in List
	 * @param {string|number} css choose this class instead of other classes
	 * - optional ix in cssList
	 * - if undefined remove every item in cssList
	 * @param {string[]} cssList Array of classes, optional if css given
	 * @returns {number} cnt of removed in classList
	 */
	classStateSet(css,cssList) {
		return Elem.classStateSet(this.my.el,css,cssList)
	}
	/**
	 * get existent classes from List of Element
	 * @param {string[]} cssList Array of classes
	 * @returns {object[]} every item from cssList exist in el with .ix and .name
	 */
	classStateGet(cssList) {
		return Elem.classStateGet(this.my.el,cssList)
	}
	/**
	 * toggle or cycle through classes incrementally
	 * - if none of cssList is active, set first
	 * @param {string[]} cssList Array of classes
	 * @returns {object} with .name and .ix
	 * @throws error if more than 1 class of cssList active in element
	 */
	classStateIncr(cssList) {
		return Elem.classStateIncr(this.my.el,cssList)
	}
	timer(arg,time_ms) {
		const self = this
		// if existing, renew time
		const name = JSON.stringify(arg)
		// const existing = time => time.name ===name
		const timer = Arr.getItemFromArr(this.timers,'name',name)

		// if (this.timers.some(existing)) {
		if (timer !== undefined) {
			timer.set(time_ms)
		} else {
			this.timers.push(new Timer(
				() => self.append(arg),
				() => {
					self.remove(arg)
					Arr.removeItemFromArr(this.timers,'name',name)
				},
				time_ms,
				name
			))
		}
	}
	/**
	 * merge for HtmlElements
	 * - merge css linear in whitespace list way to any level like {div:{css:'2ndlevel'}}
	 * - merge Object atts, evts to any level like {div:{atts:{id:'3'}}}
	 * - if next obj[key] is undefined overwrite also, so you can disable defaults
	 * overwrite other
	 * @param {object[]} objs multiple to merge, the last dominates
	 * @returns {object} result of merging
	 */
	// TODO merge ids, SVG may use it intensively
	// TODO move logic to ObjObj, only specialize call here with enrichWith:[{css:' '},{internalName:' '}]}
	// eslint-disable-next-line no-unused-vars
	static mergeDatas(objs) {
		const ret = {}
		for (let i = 0; i < arguments.length; i++) {
			const arg = arguments[i]
			for (const key in arg) {
				if (Object.hasOwnProperty.call(arg,key)) {
					if (!ret[key]) { // missing item will be written
						ret[key] = arg[key]
					} else if (ret[key] instanceof Object) { // merge 2nd layer internals of objects
						if (Html.mergeAvailable(arg[key])) {
							ret[key] = Html.mergeDatas(ret[key],arg[key])
						} else {
							ret[key] = arg[key]
						}
					} else if (key == 'css') { // css will be joined
						ret[key] = Str.enrichList(' ',ret[key],arg[key])
					} else { // unknown will be overwritten
						ret[key] = arg[key]
					}
				}
			}
		}
		return ret
	}
	/**
	 * merge for HtmlElements, modify first argument which shall be an Object
	 * - merge css linear in whitespace list way to any level like {div:{css:'2ndlevel'}}
	 * - if next obj[key] is undefined overwrite also, so you can disable defaults
	 * - merge Object atts, evts to any level like {div:{atts:{id:'3'}}}
	 * overwrite other
	 * @param {object[]} objs multiple to merge, the last dominates
	 * @returns {object} result of merging, optional as first arg is also modified
	 */
	// eslint-disable-next-line no-unused-vars
	static mergeModDatas(objs) {
		if (!Obj.valid(arguments[0])) return undefined
		for (let i = 1; i < arguments.length; i++) {
			const arg = arguments[i]
			for (const key in arg) {
				if (Object.hasOwnProperty.call(arg,key)) {
					if (!arguments[0][key]) { // missing item will be written
						arguments[0][key] = arg[key]
					} else if (arguments[0][key] instanceof Object) { // merge 2nd layer internals of objects
						if (Html.mergeAvailable(arg[key])) {
							Html.mergeModDatas(arguments[0][key],arg[key])
						} else {
							arguments[0][key] = arg[key]
						}
					} else if (key == 'css') { // css will be joined
						arguments[0][key] = Str.enrichList(' ',arguments[0][key],arg[key])
					} else { // unknown will be overwritten
						arguments[0][key] = arg[key]
					}
				}
			}
		}
		return arguments[0]
	}
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * detect Object type and choose only Object and no Class
	 * @param {any} arg an argument to identify the type
	 * @returns {boolean} true, when merge is possible
	 */
	static mergeAvailable(arg) {
		const argItemType = Vars.type(arg)
		const argItemClasses = Vars.typeHier(arg)
		// console.log('Vars.type:'+argItemType+' Vars.typeHier:'+argItemClasses)
		const isAvailable = ((argItemType === 'Object' && argItemClasses[0] === 'Object') || argItemType === 'Function') // not merge foreign Class except Html
		return isAvailable
	}
}
export default Html
