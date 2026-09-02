import Arr from '../../../logic/Arr/Arr.js'
import Obj from '../../../logic/Obj/Obj.js'
import Str from '../../../logic/Str/Str.js'
import Elem from '../../Elem/Elem.js'
import Html from '../../Html/Html.js'
/**
 * dynamic Container for Lists
 * - builds Html for each item
 * - container is an optional main element holding other props (when no html is given it will use <span>)
 * - you may strip container, but be aware when elements later are appended
 * - items may be Object with data for Html, or explicit HtmlComp (el and attach will be created here)
 * - use selectCare() after construction when inner.select is given
 * @class
 * @augments Html
 */
class List extends Html {
	/**
	 * inner multiple items that are included in the list
	 * @typedef {object} List~inner
	 * @property {List~select} select if missing no selection
	 * @property {object[]|HtmlComp[]} vals items, these HtmlComp shall implement this.my.el
	 * @property {object} valsObj items with name as key, for use when single update is essential, better to address as with index
	 */
	/**
	 * @typedef {object} List~select
	 * @property {number} ix optional selected index, name as key, for use when single update is essential, better to address as with index
	 * @property {string} mode supported modes: ['none'],'single','singleForce','multi'
	 * - mode: singleForce: select always one, if ix not given will select first, if given vals
	 */
	/**
	 * @param {object} arg carries properties {@link Html~createarg}
	 * @param {object} arg.container optional container for inner, if not given there will not be a common top span with given parameters like css see {@link HtmlElComp}
	 * @param {List~inner} arg.inner additional info for item-html
	 * @param {Function} arg.selection optional: called when selection in List changes, or when list items removed or added
	 * - you may add it after dom(), because it may need this list getSelecteds implementation
	 * - call it yourself after dom()
		 */
	// TODO select mode, none => cursor no pointer
	// TODO att container focus , use key to autocomplete items
	// TODO use processes to amplify speed when creating childs and wait for them
	constructor(arg={}) {
		if (arg.container!==undefined) { // if container not given from arguments, dont install one
			arg.container = Html.mergeDatas({container:{html:'span'}},arg.container,{container:{css:'list'}},{name:arg.name}) // add 'list' css-class when container is already given, and use span (when not given) for item wrap instead of div (is a block)
		}
		super(arg.container) // defaults to div, but may be given as span or other
		this.inner = (arg.inner!==undefined) ? arg.inner : {} // clone to keep original data
		this.selectStates = ['deselected','selected']
		this.selectModes = ['none','single','singleForce','multi']

		this.update(arg)

		if (arg.selection) this.selection = arg.selection
	}
	/**
	 * update given items, when not already added don't change or create
	 * @param {object} arg object carrying changes
	 * @param {object} arg.inner holds values that are meant to change
	 * @param {object} arg.inner.valObj update or create items within object
	 */
	update(arg) {
		Html.mergeModDatas(this,arg) // remember changes
		this.removeChilds() // remove all items, because we don't know if they are still valid, f.e. when valsObj is given and some keys are removed^

		/** need objects of List in htmls for add and remove */
		this.htmls = []
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
						this.addNext(valObj)
					}
				}
			} else if (this.inner.vals) { // vals given as Array
				this.inner.vals.forEach((val,ix) => {
					this.addNext(val)
				})
			}
			if (this.inner.select) {
				if (this.inner.select.mode=='singleForce') {
					this.setSelectedIx(this.inner.select.ix)
				}
			}
		}
	}	
	dragEnable(callback) {
		const list = this.el
		let draggedButton = undefined
		let draggedButtonIx = undefined
		list.addEventListener('dragstart', (e) => {
			draggedButton = e.target;
			draggedButtonIx = [...list.children].indexOf(e.target)
			draggedButton.classList.add('dragging');
		});

		list.addEventListener('dragend', (e) => {
			e.target.classList.remove('dragging');
			draggedButton = null;
			const vals = []
			list.childNodes.forEach(item => {
				vals.push(item.childNodes[0].textContent)
			})
			console.log('dragend:',vals)
			this.inner.vals = vals
			callback(vals)
		});

		list.addEventListener('dragover', (e) => {
			e.preventDefault();

			const target = e.target.closest('button');

			if (!target || target === draggedButton) {
				return;
			}
			const targetIx = [...list.children].indexOf(target)

			const rect = target.getBoundingClientRect();
			const middle = rect.left + rect.width / 2;

			if (e.clientX < middle) {
				// Vor den Button
				list.insertBefore(draggedButton, target);
				// this.inner.vals.splice(targetIx,0,draggedButtonVal)
				// this.inner.vals.splice(draggedButtonIx,1)
				// console.log('after drag before:',this.inner.vals)
			} else {
				// Nach den Button
				list.insertBefore(draggedButton, target.nextSibling);
				// this.inner.vals.splice(targetIx+1,0,draggedButtonVal)
				// this.inner.vals.splice(draggedButtonIx,1)
				// console.log('after drag after:',this.inner.vals)
			}
		});
	}
	/**
	 * iterate over one item in list
	 * @param {object|HtmlComp} item an Object considered to be 1 list item
	 * @param {number} pos the ix of sequence in list
	 * @param {string} name the name of item in list, this is recommended if vals is given by valsObj
	 */
	addNext(item,name) {
		if (item==undefined) return
		const pos=this.htmls.length
		// merge inner and use optional select for further atts
		// const inner = Html.mergeDatas(this.inner)
		Obj.assure(this.inner,'atts',{})
		if (this.inner.select && this.inner.select.atts) {
			if (pos==this.inner.select.ix) {
				Html.mergeModDatas(this.inner,{atts:this.inner.select.atts,css:'selected'})
			} else {
				Html.mergeModDatas(this.inner,{css:'deselected'})
			}
		}
		this.inner.css = Str.enrichList(' ',this.inner.css,'list-item')
		if (this.inner.select) {
			this.inner.css = Str.enrichList(' ',this.inner.css,this.selectStates[0])
		}
		Obj.assure(this.inner,'evts',{})
		Obj.mergeModOverwrite(this.inner,{evts:{'click':this.evtSelect.bind(this)}})
		// decide how item will be instantiated
		let htmlObj = undefined
		if (item instanceof Html) {
			htmlObj = item
			htmlObj.change(this.inner)
		} else {
			htmlObj = this.add({...this.inner,val:item})
		}
		// refresh mirror
		this.htmls.push(htmlObj)
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
				const itemMirrored = this.htmls[id]
				if (el==undefined || !el.isSameNode(itemMirrored.my.el)) {
					Elem.classStateSet(itemMirrored.my.el,'deselected',this.selectStates)
				}
			}
		}
	}
	/**
	 * @returns {number[]} selected ix of item in order from bottom to top
	 */
	getSelecteds() {
		const selectedsIx = []
		this.htmls.forEach((item,ix) => {
			const selectState = Elem.classStateGet(this.htmls[ix].el,this.selectStates)[0].name
			if (selectState=='selected') selectedsIx.push(ix)
		})
		selectedsIx.sort((a,b) => b - a) // sort from behind to top
		return selectedsIx
	}
	getSelectedVal() {
		const selecteds = this.getSelecteds()
		const selected0text = this.htmls[selecteds[0]].el.childNodes[0].textContent
		return selected0text
	}
	/**
	 * set selected index
	 * @param {number} ix when not given select first
	 * @param {boolean} [noCallback=false] set it to true, if you want to prevent callback
	 */
	setSelectedIx(ix,noCallback=false) {
		if (ix==undefined) ix=0
		if (ix>this.htmls.length-1) return
		if (this.inner.select==undefined) return
		if (this.inner.select.mode=='none') return
		if (this.inner.select.mode=='single'||this.inner.select.mode=='singleForce') this.removeSelection()
		Elem.classStateSet(this.htmls[ix].el,'selected',this.selectStates)
		if (!noCallback && this.selection) this.selection()
	}
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * internal click handler
	 */
	evtSelect(evt) {
		if (this.inner.select==undefined) return
		if (this.inner.select.mode=='none') return
		const el = evt.target
		const selectState = Elem.classStateGet(el,this.selectStates)[0].name
		if (this.inner.select.mode=='single'||this.inner.select.mode=='singleForce') this.removeSelection(0,el)
		if (selectState==undefined || selectState=='deselected') {
			Elem.classStateSet(el,'selected',this.selectStates)
		} else if (this.inner.select.mode=='single' && selectState=='selected') {
			Elem.classStateSet(el,'deselected',this.selectStates)
		}
		if (this.selection) this.selection()
	}
}
export default List
