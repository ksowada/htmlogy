import Arr from '../../Arr/Arr.js'
import Bit from '../../Bit/Bit.js'
import Int from '../../Int/Int.js'
import Numbers from '../../Numbers.js'
import Obj from '../../Obj/Obj.js'
import ObjObj from '../../Obj/ObjObj.js'
import Str from '../../Str/Str.js'
import Timer from '../../Timer/Timer.js'
import Vars from '../../Vars/Vars.js'
import El from '../El/El.js'
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
	/**
	 * creates dynamic HTMLElement
	 * @param {object} arg supply create()-like arg @see {@link this.create}
	 * @param {boolean} arg.domLater if non-existent or false, don't render() directly
	 * @param {Html~domadr} arg.parent if not given, don't render() directly
	 * @param {object[]} childs these items get constructor-args, and will be append as children of this
	 */
	constructor(arg,childs=[]) {
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
		 * @type {El}
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

		// existing .domLater or no parent given indiciate later processing
		if (Obj.hasEql(this,['arg','domLater'],true) || this.arg.parent==undefined) {
			this.domLater = true
		} else {
			this.domLater = false
			this.render(this.arg)
		}
		childs.forEach(child => this.add(child)) // just a abbreviation to shorten calls
	}
	/**
	 * create dom from parameters given in constructor and here as arg. Use to create the constructed Html
	 * @param {object} arg Html-parameters as described in constructor
	 */
	render(arg) {
		Html.mergeModDatas(this.arg,arg,{doming:true}) // merge args
		this.create(this.arg)
	}
	/**
	 * create DOMElement
	 * @param {object} arg may be segmented in different arguments, obj will be merged with last-win
	 * @param {Html~domadr} arg.parent address info for accessing HTMLElement
	 * - if el not given it will not be appended to dom
	 * - for use when manually appended or inserted on certain pos
	 * @param {Html} arg.parent.obj optional to el and id of HTMLElement; when parent given this way, it enable backtrace of dom-hierarchy, it create htmlParent in this object, and  add htmlChilds in its parent
	 * @param {object} arg.container optional container
	 * @param {string} arg.container.html container, div if unused
	 * @param {string} arg.container.htmlNS html Namespace, f.e. svg Element
	 * @param {string} arg.html htmlTagName, div if unused
	 * @param {string} arg.htmlNS html Namespace, f.e. svg Element
	 * @param {string|Array} arg.css row of CSSClass (str space-separated or arr of classes)
	 * @param {object} arg.styles extra inline styles, like background-color
	 * @param {string} arg.val value (input use value else use innerText)
	 * @param {string} arg.valhtml optional subelement with and instead for val, f.e. use to center with val in grid use extra div
	 * @param {object} arg.atts attributes of HTMLElement
	 * @param {object} arg.evts events of HTMLElelement (an element must be on DOM to be triggered)
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
		// also involve childs when doming (before change arg)
		// TODO may integrate List
		if (arg.doming==true) {
			this.htmlChilds.forEach(child => {
				child.create({...child.arg,doming:true})
			})
		}
		// if it is already domed cancel
		if (this.domed) return

		// find matching HTMLElement to operate
		arg.el = Html.getEl(arg.parent)
		if (!arg.html) arg.html = 'div' // if html not given create a div
		arg.html = arg.html.toLowerCase()

		const htmlNamespaceParent = ObjObj.childsHasDefined(arg,['parent','obj'],'htmlParent','htmlNamespace')
		if (htmlNamespaceParent) { // inherit namespace from parent
			this.htmlNamespace = htmlNamespaceParent
		}
		if (arg.html==='svg') { // auto build svg namespace
			this.htmlNamespace = 'http://www.w3.org/2000/svg'
		}

		// if (arg.htmlNS) { // manual given namespace
		// 	this.my.el = document.createElementNS(arg.htmlNS,arg.html)
		// } else if (this.htmlNamespace) { // auto or inherit namespace
		// 	this.my.el = document.createElementNS(arg.htmlNS,this.htmlNamespace)
		// } else { // usual tag without namespace
		// 	this.my.el = document.createElement(arg.html)
		// }
		this.createEl(this.my,arg,this.htmlNamespace)
		// TODO container may be unused or duplicate with HtmlElComp.container
		// TODO use new Html for Container creation
		if (arg.container) {
			if (!arg.container.html) arg.container.html = 'div' // if html not given create a div
			// if (arg.container.htmlNS) {
			// 	this.top.el = document.createElementNS(arg.container.htmlNS,arg.container.html)
			// } else {
			// 	/** if container in use its {HTMLElement} is attached in this, parallal to my.el */
			// 	this.top.el = document.createElement(arg.container.html)
			// }

			if (arg.container.html==='svg') { // auto build svg namespace
				arg.container.htmlNamespace = 'http://www.w3.org/2000/svg'
			}

			this.createEl(this.top,arg.container,arg.container.htmlNamespace)
			this.top.el.appendChild(this.my.el)
			if (arg.el) arg.el.appendChild(this.top.el)
			this.edit(this.top,arg.container,{append:true})
		} else {
			this.top.el = this.my.el
			if (arg.el) {
				arg.el.appendChild(this.my.el)
			}
		}
		this.el = this.my.el
		this.elo = new El(this.el)
		this.edit(this.my,arg,{append:true}) // TODO this.my is not type Html
		this.domed = true
		this.doming = false
	}
	/**
	 * @param parentObj
	 * @param arg
	 * @param htmlNamespace
	 * @private
	 */
	createEl(parentObj,arg,htmlNamespace) {
		// if (arg.html==='svg') { // auto build svg namespace
		// 	this.htmlNamespace = 'http://www.w3.org/2000/svg'
		// }
		if (arg.htmlNS) { // manual given namespace
			parentObj.el = document.createElementNS(arg.htmlNS,arg.html)
		} else if (htmlNamespace) { // auto or inherit namespace
			parentObj.el = document.createElementNS(arg.htmlNS,htmlNamespace)
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
	change(arg) {return this.edit(this.my,arg,{change:true})}
	/**
	 * append Html, this create or add given parameters to existing
	 * see details for change {@link Html#edit}
	 * @param {object} arg same arguments as create @see {@link this.create}
	 * @returns {boolean} true when html has changed (do not notify changes on events)
	 */
	append(arg) {return this.edit(this.my,arg,{append:true})}
	/**
	 * remove HTMLElement or if given in argument, some item of it
	 * - removeEventHandler before remove from DOM
	 * - remove optional icon
	 * - remove optional top
	 * @param {object} arg arguments so you can Html.obj.parameters as .atts, .val, .evts, see @link {Html#edit}
	 */
	remove(arg) {
		if (Obj.valid(arg) && Object.keys(arg).length) { // if given Object it will remove these item of it, if existing
			this.edit(this.my,arg,{remove:true})
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
	 * edit given HTMLElement, may attach to new, change or remove
	 * - class from .css: at change: remove all given css class and then edit new
	 * - style from .styles: at change: enrich given style
	 * - various attributes from .atts: at change: enrich given HTMLElement
	 * - events from .evts: at change: enrich given events
	 * - i from .icon: at change: replace given icon
	 * - subHTMLElement from .valhtml: at change: remove and add new
	 * in mode remove
	 * @param {Html} topObj usually this.my or this.el
	 * - important to modify this item later on or remove
	 * - contains sub-variables to modify, adapt or remove
	 * @param {object} arg data to edit
	 * @param {object} mode may contain 1 item of these set to true:
	 * - append [default]
	 * - change
	 * - remove
	 * - if atts:{item:value} is given: only delete if it is equal to value
	 * - if atts:{item:''} | atts:{item:undefined} remove attribute
	 * @returns {boolean} true when html has changed (do not notify changes on events)
	 * @private
	 */
	// TODO at id make auto atts to appreviate and overwrite defined from atts
	// TODO topObj is not Html, but .my or .top
	// TODO remove not implemented for any item, just css
	edit(topObj,arg,mode) {
		const elo = new El(topObj.el) // build own elo, instead of this, cause at construction not existent, and topObj may vary between my or top
		const eloWatch = new Vars(elo.all)
		let item = undefined

		if (Obj.hasDefined(arg,item = 'css')) {
			if (mode.remove) {
				const key = arg[item]
				topObj.el.classList.remove(key)
			} else {
				if (mode.change) {
					topObj.el.removeAttribute('class') // at change, delete old classes, only use new given
				}
				let csss = []
				csss = Str.enrichList(' ',arg[item]) // add arrays or list of whitespace seperated str
				csss = Str.split(csss,' ') // convert into Array
				csss.forEach(e => topObj.el.classList.add(e))
			}
		}
		if (Obj.hasDefined(arg,item = 'styles')) {
			for (const key in arg[item])
				if (Object.hasOwnProperty.call(arg[item],key)) {
					const valItem = arg[item][key]
					topObj.el.style.setProperty(key,valItem)
				}
		}
		if (Obj.hasDefined(arg,item = 'id')) {
			if (!arg.atts) {
				arg.atts = {'id':arg[item]} // use atts and modify id of obj in that way later in method
			} else {
				arg.atts.id = arg[item] // overwrite when directly given and defined from atts
			}
		}
		if (Obj.hasDefined(arg,item = 'atts')) {
			for (const key in arg[item])
				if (Object.hasOwnProperty.call(arg[item],key)) {
					let valItem = arg[item][key]
					if (mode.remove) {
						if (valItem!==undefined && valItem.length>0) { // if atts item:value is given and of string length more than 0
							if (topObj.el.getAttribute(key)===valItem) topObj.el.removeAttribute(key)
						} else {
							topObj.el.removeAttribute(key)
						}
					} else {
						topObj.el.setAttribute(key,valItem)
					}
				}
		}
		if (Obj.hasDefined(arg,item = 'evts')) {// TODO mount when at dom also at change
			for (const key in arg.evts)
				if (Object.hasOwnProperty.call(arg.evts,key)) {
					const cbk = arg.evts[key]
					topObj.el.addEventListener(key,cbk)
					topObj.evts.push({key:key,cbk:cbk})
				}
		}
		// than attach additional elements
		if (Obj.hasDefined(arg,item = 'icon')) { // FEATURE handle multiple icon when array
			if (mode.change && topObj.iconObj!==undefined) topObj.iconObj.remove()
			/** holds optional icon @private, but in container as fontawesome, comment <i> out and add svg */
			topObj.iconObj = new Html({parent:{el:topObj.el},container:{html:'span'},html:'i',css:arg.icon}) // TODO dont care about existing icons at update
		}
		// than change elements contents, may be either sub element given by valhtml and val or just a textcontent in val
		// TODO valhtml is this used, otherwise remove it
		if (Obj.hasDefined(arg,item = 'valhtml')) { // FEATURE plural-arr
			/** subelement given at create or change with valhtml and val */
			if (mode.change && this.my.subElement !== undefined) this.my.subElement.remove()
			this.my.subElement = new Html({parent:{el:topObj.el},html:arg.valhtml,val:arg.val})
		// you can use either valhtml or val so else
		} else if (Obj.hasDefined(arg,item = 'val')) { // FEATURE plural-arr
			if (topObj.el.localName=='input') topObj.el.value = arg.val
			else {
				if (mode.change) {
					// take last node being Textnode
					for (const node of topObj.el.childNodes) {
						if (node.nodeType === 3) { // as in test Node.TEXT_NODE is not defined so use int
							topObj.el.removeChild(node)
						}
					}
				}
				topObj.el.insertAdjacentHTML('beforeend',arg.val)
			}
		}
		this.writeIdFromEl() // if id would change, catch it here
		eloWatch.set(elo.all)
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
		if (arg==undefined) return undefined
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
		} else if (objType=='Number') { // consider it as id
			el = document.getElementById(arg.toString())
		} else if (objType=='String') { // consider it as id
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
	 * @param {object} arg supply create()-like arg
	 * @param {string} arg.name name of class member, if given it generate it, so you can use this child as .[name]
	 * @returns {Html} new produced child of this
	 */
	// TODO add test
	add(arg) {
		Obj.put(arg,['parent','obj'],this)
		const html = new Html(arg)

		// add as child, when .name is given
		if (Str.valid(arg.name)) this[arg.name] = html
		return html
	}
	/**
	 * add introduce child and form array, if called multiple times it extend the array, automatically sets parent with this and construct it
	 * @param {object} arg supply create()-like arg
	 * @param {string} arg.name name of class member, if given it generate it, so you can use this child as .[name]
	 * @returns {Html} new produced child of this
	 */
	addArr(arg) {
		Obj.put(arg,['parent','obj'],this)
		const html = new Html(arg)

		// add as child, when .name is given
		if (Str.valid(arg.name)) {
			if (this[arg.name]==undefined) this[arg.name] = []
			this[arg.name].push(html)
		}
		return html
	}
	/**
	 * get id from DOM, and write it to .my.atts (only if defined) and .my.id
	 * @returns {string} id as red from DOM, if not given return undefined
	 * @private
	 */
	writeIdFromEl() {
		/** if given show id */
		let id = this.my.el.getAttribute('id')
		if (id!==null && id!=='') {
			/** the id if given at construction by .id or .atts */
			this.my.id = id
			if (this.my.atts==undefined) this.my.atts = {}
			this.my.atts.id = id // maybe overwrite if it was already there, when f.e. given by .atts instead .id
		} else if (id===null) id = undefined
		return id
	}
	/**
	 * compare may compare 2 or more element
	 * use getEl internally
	 * @param {object[]} objs must have at least 1 argument to comply and then accept unity and return true,
	 * use same parameter as @see {@link this.El}
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
	// TODO no more working, as change is no more static
	/**
	 * find element by tag name and additional atts and change element according to edit
	 * @param {object} search object with certain arguments
	 * @param {string} search.html HTMLElement to search
	 * @param {object} search.atts a obj of HTMLAttribute (all atts must be found)
	 * @param {object} edit Object to change HTMLElement
	 * @param {object} el HTMLElement to attach created, and start point for search, if not found
	 * @param {boolean} create set to create a new Html
	 * @returns {Html} if created, otherwise undefined
	 * @throws {Error} if search.html is not found
	 */
	static findActions(search,edit,el,create) { // TODO optional create, use it also for find
		if (!search.html) throw new Error('html not given but needed')
		const foundEls = Html.getChilds(el,search.html)
		let changeCnt = 0
		for (let ix = 0; ix < foundEls.length; ix++) {
			const foundEl = foundEls[ix]
			let found_atts = 0
			const search_attsArr = Object.keys(search.atts)
			for (const attKey in search_attsArr) {
				if (Object.hasOwnProperty.call(search_attsArr,attKey)) {
					// const element = search_attsArr[attKey]; // TODO only use attKey?
					const foundElAtt = foundEl.getAttribute(attKey)
					if (foundElAtt!==null && foundElAtt==search.atts[attKey]) found_atts++
				}
			}
			if (found_atts==search_attsArr.length) {
				Html.change({html:foundEl},edit) // TODO shall change el, but static change is deleted
				changeCnt++
			}
		}
		if (changeCnt>1) console.info('multiple elements changed, expected 1, found:'+changeCnt)
		if (create && changeCnt==0) return new Html({parent:{el},...search,...edit})
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
	 * set some textContent given by Parameter, do overwrite
	 * if el is input set str to value, do not overwrite if no change is detected
	 * @param {HTMLElement} el an Element to modify
	 * @param {string} str text to set textContent, if undefined change nothing
	 * @returns {boolean} true if content has changed
	 */
	static textContentSet(el,str) {
		if (!Str.valid(str)) return undefined
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
	 * set some textContent given by Parameter, do overwrite
	 * @param {string} str text to set textContent, if undefined change nothing
	 * @returns {boolean} true if content has changed
	 */
	textContentSet(str) {
		return Html.textContentSet(this.my.el,str)
	}
	/**
	 * add some textContent given by Parameter, do not overwrite
	 * if el is input add str to value
	 * @param {HTMLElement} el an Element to modify
	 * @param {string} str text to add adjacent to textContent, if undefined change nothing
	 */
	static textContentAdd(el,str) {
		if (!Str.valid1(str)) return
		const isInput = (el.localName==='input')
		const oldContent = (isInput)?el.value:el.textContent
		if (isInput) {
			el.value = oldContent + str
		} else {
			el.textContent = oldContent + str
		}
	}
	/**
	 * add some textContent given by Parameter, do not overwrite
	 * @param {string} str text to add adjacent to textContent, if undefined change nothing
	 */
	textContentAdd(str) {
		Html.textContentAdd(this.my.el,str)
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
		const childs = Html.getChilds(el,tag)
		if (childs.length==0) {
			const childHtml = new Html(htmlObj)
			childs.push(childHtml.my.el)
		}
		return childs
	}
	// TODO move static functions like  HtmlUtils or EL
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
		if (!Obj.valid(el)) return undefined
		if (typeof css==='number') { // css must be an index in cssList
			if (!Arr.valid1(cssList)) return undefined
			css = cssList[css].trim()
		} else if (typeof css==='boolean') { // css must be a boolean in cssList
			if (!Arr.valid1(cssList)) return undefined
			css = cssList[Bit.toInt(css)].trim()
		} else if (css==undefined) {
			css = ''
		}else{
			css = css.trim()
		}
		let removeCnt = 0
		if (Arr.valid1(cssList)) {
			cssList.forEach(e => {
				if (e.length>0 && el.classList.contains(e)) {
					el.classList.remove(e)
					removeCnt++
				}
			})
		}
		if (Str.valid1(css)) el.classList.add(css)
		return removeCnt
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
		return Html.classStateSet(this.my.el,css,cssList)
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
	 * get existent classes from List of Element
	 * @param {string[]} cssList Array of classes
	 * @returns {object[]} every item from cssList exist in el with .ix and .name
	 */
	classStateGet(cssList) {
		return Html.classStateGet(this.my.el,cssList)
	}
	timer(arg,time_ms) {
		const self = this
		// if existing, renew time
		const name = JSON.stringify(arg)
		// const existing = time => time.name ===name
		const timer = Arr.getItemFromArr(this.timers,'name',name)

		// if (this.timers.some(existing)) {
		if (timer!==undefined) {
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
		const cssActives = Html.classStateGet(el,cssList)
		if (cssActives.length==0) { // if none of cssList is active, set first
			Html.classStateSet(el,0,cssList)
			return {name:cssList[0],ix:0}
		} else if (cssActives.length==1) {
			const ix = cssActives[0].ix
			const ixNext = Int.incr(ix,0,cssList.length-1)
			Html.classStateSet(el,ixNext,cssList)
			return {name:cssList[ixNext],ix:ixNext}
		}
		throw new Error('more than 1 state active in classList')
	}
	/**
	 * toggle or cycle through classes incrementally
	 * - if none of cssList is active, set first
	 * @param {string[]} cssList Array of classes
	 * @returns {object} with .name and .ix
	 * @throws error if more than 1 class of cssList active in element
	 */
	classStateIncr(cssList) {
		return Html.classStateIncr(this.my.el,cssList)
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
	static getElByNameFirst(html) {
		const els = document.getElementsByTagName(html)
		return els.item(0)
	}
	static removeAttributes(el) {
		while(el.attributes.length > 0) {
			el.removeAttribute(el.attributes[0].name)
		}
	}
	/**
	 * automize input reading and back writing after bounding return bounded value
	 * @param {string} formName name of the form in document
	 * @param {string} inputName name of the input in form
	 * @param {number} min required
	 * @param {number} max required
	 * @returns {number} bounded value between min and max
	 * @deprecated unnatural usage and mixin of dom speciality with form and bound
	 */
	static getBoundOfInput(formName,inputName,min,max) {
		var readed = Numbers.getFloatOfText(document[formName][inputName].value)
		var bounded = Numbers.bound(readed,min,max)
		// var rounded = Numbers.round(bounded)
		document[formName][inputName].value = Numbers.getTextOfFloat(bounded)
		return bounded
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
					} else if (ret[key] instanceof Object) {// merge 2nd layer internals of objects
						if (Html.mergeAvailable(arg[key])) {
							ret[key] = Html.mergeDatas(ret[key],arg[key])
						} else {
							ret[key] = arg[key]
						}
					} else if (key=='css') { // css will be joined
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
					} else if (key=='css') { // css will be joined
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
		const isAvailable = ((argItemType==='Object' && argItemClasses[0]==='Object')||argItemType==='Function') // not merge foreign Class except Html
		return isAvailable
	}
}
export default Html
