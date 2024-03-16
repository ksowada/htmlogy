import Obj from '../../logic/Obj/Obj.js'
import Str from '../../logic/Str/Str.js'
import Vars from '../../logic/Vars/Vars.js'
import Html from '../html/Html/Html.js'
import HtmlElComp from '../html/HtmlElComp.js'
import './List.scss'
/**
 * dynamic Container for Lists
 * - builds Html for each item
 * - container is an optional main element holding other props (when no html is given it will use <span>)
 * - you may strip container, but be aware when elements later are appended
 * - items may be Object with data for Html, or explicit HtmlComp (el and attach will be created here)
 * - only one item is selected, this correspondends with classic <select>
 * - no class is defined for selected or deselected item
 * - internally not mirror items, but use HTML for access
 * @class
 * @augments HtmlElComp
 */
class ListLite extends HtmlElComp {
	/**
	 * @param {object} arg carries properties
	 * @param {object} arg.inner.select if missing no selection
	 * @param {object[]|HtmlComp[]} arg.inner.vals items, these HtmlComp shall implement this.div
	 * @param {object} arg.inner.valsObj items with name as key, for use when single update is essential, better to address as with index
	 */
	// TODO att container focus , use key to autocomplete items
	// TODO use processes to amplify speed when creating childs and wait for them
	constructor(arg) {
		super(arg)
		this.selectModes = ['none','single','singleForce','multi']
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		Html.mergeModDatas(this,Html.mergeDatas.apply(null,arguments))
		if (this.container!==undefined) { // if container not given from arguments, dont install one
			Html.mergeModDatas({container:{html:'span'}},this,{container:{css:'list'}}) // add 'list' css-class when container is already given, and use span (when not given) for item wrap instead of div (is a block)
		}
		super.domCreate(this)
		if (this.inner) {
			if (this.inner.select) {
				if (!this.inner.select.ix) this.inner.select.ix = 0
			}
			if (this.inner.valsObj) { // vals given per Object
				/** if an Object gives the list of items, use its name for update purposes */
				let ix=-1
				for (const valKey in this.inner.valsObj) {
					if (Object.hasOwnProperty.call(this.inner.valsObj,valKey)) {
						++ix
						const valObj = this.inner.valsObj[valKey]
						this.add(valObj,ix,valKey) // TODO valKey is not used in function
					}
				}
			} else if (this.inner.vals) { // vals given as Array
				this.inner.vals.forEach((val,ix) => {
					this.add(val,ix)
				})
			}
		}
	}
	/**
	 * update given items, when not already added don't change or create
	 * @param {object} obj parameters
	 * @param {object} obj.inner holds values that are meant to change
	 * @param {string[]} obj.inner.vals values to update, will overwrite all existing items
	 */
	update(obj) {
		if (obj.inner) {
			if (obj.inner.vals) { // vals given as Array
				this.removeChilds()
				obj.inner.vals.forEach((val,ix) => {
					this.add(val,ix)
				})
			}
		}
		Html.mergeModDatas(this,obj) // remember changes
	}
	/**
	 * iterate over one item in list
	 * @param {object|HtmlComp} item an Object considered to be 1 list item
	 * @param {number} pos the ix of sequence in list
	 * @returns {Html} the created item
	 */
	add(item,pos) {
		if (item==undefined) return undefined
		const inner = Html.mergeDatas(this.inner)
		Obj.assure(inner,'atts',{})
		if (inner.select && inner.select.atts) {
			if (pos==inner.select.ix) {
				Html.mergeModDatas(inner,{atts:inner.select.atts})
			}
		}
		inner.css = Str.enrichList(' ',inner.css,'list-item')
		Obj.assure(inner,'evts',{})
		const itemClassHier = Vars.typeHier(item)
		let htmlObj = undefined
		if (itemClassHier.includes('HtmlComp')) {
			item.dom(inner,item,{parent:{el:this.div}})
			htmlObj = item
		} else {
			htmlObj = new Html({...inner,parent:{el:this.div},val:item})
		}
		return htmlObj
	}
}
export default ListLite
