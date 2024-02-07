import Arr from '../../logic/Arr/Arr.js'
import Obj from '../../logic/Obj/Obj.js'
import Str from '../../logic/Str/Str.js'
import Vars from '../../logic/Vars/Vars.js'
import Html from '../../logic/html/Html/Html.js'
import HtmlElComp from '../../logic/html/HtmlComp/HtmlElComp.js'
import './List.scss'
/**
 * dynamic Container for Lists
 * - builds Html for each item
 * - container is an optional main element holding other props (when no html is given it will use <span>)
 * - you may strip container, but be aware when elements later are appended
 * - items may be Object with data for Html, or explicit HtmlComp (el and attach will be created here)
 * @class
 * @augments HtmlElComp
 */
class List extends HtmlElComp {
	/**
	 * inner multiple items that are included in the list
	 * @typedef {object} List~inner
	 * @property {List~select} select if missing no selection
	 * @property {object[]|HtmlComp[]} vals items, these HtmlComp shall implement this.div
	 * @property {object} valsObj items with name as key, for use when single update is essential, better to address as with index
	 */
	/**
	 * @typedef {object} List~select
	 * @property {number} ix optional selected index, name as key, for use when single update is essential, better to address as with index
	 * @property {string} mode supported modes: ['none'],'single','singleForce','multi'
	 * - mode: singleForce: select always one, if ix not given will select first, if given vals
	 */
	/**
	 * @param {object} arg carries properties {@link Html#create}
	 * @param {object} arg.container optional container for inner, if not given there will not be a common top div with given parameters like css see {@link HtmlElComp}
	 * @param {List~inner} arg.inner additional info for item-html
	 * @param {Function} arg.selection optional: called when selection in List changes, or when list items removed or added
	 * - you may add it after dom(), because it may need this list getSelecteds implementation
	 * - call it yourself after dom()
	 */
	// TODO select mode, none => cursor no pointer
	// TODO att container focus , use key to autocomplete items
	// TODO use processes to amplify speed when creating childs and wait for them
	constructor(arg) {
		super(arg)
		this.selectStates = ['deselected','selected']
		this.selectModes = ['none','single','singleForce','multi']
		super.constructed()
	}
	/**
	 * @param {object} arg same as constructor {@link List}
	 * @private
	 */
	dom(arg) {
		Html.mergeModDatas(this,arg)
		if (this.container!==undefined) { // if container not given from arguments, dont install one
			Html.mergeModDatas({container:{html:'span'}},this,{container:{css:'list'}}) // add 'list' css-class when container is already given, and use span (when not given) for item wrap instead of div (is a block)
		}
		super.domCreate(this)
		/** need objects of List in itemsMirrored for add and remove */
		this.itemsMirrored = []
		this.itemsMirroredNames = []
		if (this.inner) {
			if (this.inner.select) {
				if (!this.inner.select.mode) this.inner.select.mode = this.selectModes[0]
				if (!this.inner.select.ix) this.inner.select.ix = 0
			}
			if (this.inner.valsObj) { // vals given per Object
				/** if an Object gives the list of items, use its name for update purposes */
				let ix=-1
				for (const valKey in this.inner.valsObj) {
					if (Object.hasOwnProperty.call(this.inner.valsObj,valKey)) {
						++ix
						const valObj = this.inner.valsObj[valKey]
						this.add(valObj,ix,valKey)
					}
				}
			} else if (this.inner.vals) { // vals given as Array
				this.inner.vals.forEach((val,ix) => {
					this.add(val,ix)
				})
			}
			if (this.inner.select) {
				if (this.inner.select.mode=='singleForce') {
					this.setSelectedIx(this.inner.select.ix)
				}
			}
		}
	}
	/**
	 * update given items, when not already added don't change or create
	 * @param {object} arg object carrying changes
	 * @param {object} arg.inner holds values that are meant to change
	 * @param {object} arg.inner.valObj update or create items within object
	 */
	update(arg) {
		if (arg.inner) {
			// TODO if used change select.mode and force selections here, but right now not used
			// TODO determine if Object or Array
			if (arg.inner.valsObj) {
				for (const itemName in arg.inner.valsObj) {
					if (Object.hasOwnProperty.call(arg.inner.valsObj,itemName)) {
						const itemObj = arg.inner.valsObj[itemName]
						// get ix of key
						const itemIx = this.itemsMirroredNames.indexOf(itemName)
						// call update of item
						// if ix not found, it was not created, so not update it, just neglect
						if (itemIx!==-1) {
							const itemMirroredType = Vars.typeHier(this.itemsMirrored[itemIx])
							if (itemMirroredType.includes('Html')) {
								this.itemsMirrored[itemIx].change(itemObj)
							} else if (itemMirroredType.includes('HtmlComp')) {
								this.itemsMirrored[itemIx].update(itemObj)
							} else {
								console.error('not implemented yet in other way')
							}
						}
					}
				}
			}
		}
		Html.mergeModDatas(this,arg) // remember changes
	}
	/**
	 * iterate over one item in list
	 * @param {object|HtmlComp} item an Object considered to be 1 list item
	 * @param {number} pos the ix of sequence in list
	 * @param {string} name the name of item in list, this is recommended if vals is given by valsObj
	 */
	add(item,pos,name) {
		if (item==undefined) return
		if (pos==undefined) pos=this.itemsMirrored.length
		pos = Arr.boundIx(pos,this.itemsMirrored)
		// merge inner and use optional select for further atts
		const inner = Obj.copy(this.inner)
		// Obj.assure(inner,'atts',{})
		if (inner.select && inner.select.atts) {
			if (pos==inner.select.ix) {
				Html.mergeModDatas(inner,{atts:inner.select.atts,css:'selected'})
			} else {
				Html.mergeModDatas(inner,{css:'deselected'})
			}
		}
		inner.css = Str.enrichList(' ',inner.css,this.selectStates[0],'list-item')
		// Obj.assure(inner,'evts',{})
		Html.mergeModDatas(inner,{evts:{'click':this.evtSelect.bind(this)}})
		// decide how item will be instantiated
		const itemClassHier = Vars.typeHier(item)
		let htmlObj = undefined
		if (itemClassHier.includes('HtmlComp')) {
			item.dom(inner,item,{parent:{el:this.div}})
			htmlObj = item
		} else {
			htmlObj = new Html({...inner,parent:{el:this.div},val:item})
		}
		// decide how to attach to DOM
		if (pos==this.itemsMirrored.length) {
			this.div.appendChild(getEl(htmlObj)) // append item on div
		} else {
			this.div.insertBefore(getEl(this.itemsMirrored[pos]),getEl(htmlObj)) // insert before succesor
		}
		// refresh mirror
		this.itemsMirrored.splice(pos,0,htmlObj)
		if (name && this.itemsMirroredNames!==undefined) this.itemsMirroredNames.splice(pos,0,name)
		this.selectCare()
	}
	edit(val,pos) {
		if (pos==undefined) {
			pos = this.getSelecteds()[0]
			console.log(pos)
		}
	}
	remove(pos) {
		if (this.itemsMirrored.length==0) return // cannot delete if nothing inserted
		pos = Arr.boundIx(pos,this.itemsMirrored)
		this.itemsMirrored[pos].remove() // remove item from DOM
		this.itemsMirrored.splice(pos,1) // change array
		if (this.itemsMirroredNames!==undefined) this.itemsMirroredNames.splice(pos,1)
		this.selectCare()
	}
	/** after items change, call me to select correct */
	selectCare() {
		if (this.inner && this.inner.select && this.inner.select.mode=='singleForce') {
			const selecteds = this.getSelecteds()
			if (selecteds.length==0) {
				this.setSelectedIx()
			}
		}
		if (this.selection) this.selection()
	}
	removeSelections() {
		const selectedsIx = this.getSelecteds()
		selectedsIx.forEach(ix => this.remove(ix))
	}
	/**
	 * @param {number} leaveCnt if given leave the count of selection, for use when switch to single-
	 * @param {HTMLElement} el dont delete this item, only others
	 */
	removeSelection(leaveCnt,el) {
		if (leaveCnt==undefined) leaveCnt=0
		const selecteds = this.getSelecteds()
		for (let ix = 0; ix < selecteds.length; ix++) {
			if (ix>=leaveCnt) {
				const id = selecteds[ix]
				const itemMirrored = this.itemsMirrored[id]
				if (el==undefined || !el.isSameNode(itemMirrored.my.el)) {
					Html.classStateSet(itemMirrored.my.el,'deselected',this.selectStates)
				}
			}
		}
	}
	/**
	 * @returns {number[]} selected ix of item in order from bottom to top
	 */
	getSelecteds() {
		const selectedsIx = []
		this.itemsMirrored.forEach((item,ix) => {
			const el = getEl(this.itemsMirrored[ix])
			const selectState = Html.classStateGet(el,this.selectStates)
			if (selectState=='selected') selectedsIx.push(ix)
		})
		selectedsIx.sort((a,b) => b - a) // sort from behind to top
		return selectedsIx
	}
	/**
	 * set selected index
	 * @param {number} ix when not given select first
	 */
	setSelectedIx(ix) {
		if (ix==undefined) ix=0
		if (ix>this.itemsMirrored.length-1) return
		if (this.inner.select==undefined) return
		if (this.inner.select.mode=='none') return
		if (this.inner.select.mode=='single') this.removeSelection()
		const itemMirroredEl = getEl(this.itemsMirrored[ix])
		Html.classStateSet(itemMirroredEl,'selected',this.selectStates)
	}
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * internal click handler
	 */
	evtSelect(evt) {
		if (this.inner.select==undefined) return
		if (this.inner.select.mode=='none') return
		const el = Html.findParent(evt.target,undefined,1)
		const selectState = Html.classStateGet(el,this.selectStates)[0]
		if (this.inner.select.mode=='single'||this.inner.select.mode=='singleForce') this.removeSelection(0,el)
		if (selectState==undefined || selectState=='deselected') {
			Html.classStateSet(el,'selected',this.selectStates)
		} else if (this.inner.select.mode=='single' && selectState=='selected') {
			Html.classStateSet(el,'deselected',this.selectStates)
		}
		if (this.selection) this.selection()
	}
}
/**
 * @param {HtmlComp|Html} htmlObj input
 * @returns {HTMLElement} get element of object
 * @private
 */
function getEl(htmlObj) {
	const itemClassHier = Vars.typeHier(htmlObj)
	if (itemClassHier.includes('HtmlComp')) return htmlObj.div
	if (itemClassHier.includes('Html')) return htmlObj.top.el
	return undefined
}
export default List
