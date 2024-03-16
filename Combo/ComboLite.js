import Html from '../html/Html/Html.js'
import './Combo.scss'
import HtmlElComp from '../html/HtmlElComp.js'
import ListLite from '../List/ListLite.js'
import Arr from '../../logic/Arr/Arr.js'
// TODO have similar spell logic to merge tiperrs
// TODO remove, if unusable
/**
 * @class create a Combo element with some major features, like select , rename and delete
 * @augments HtmlElComp
 * ComboLite: a read-only select without controls for manipulating content, just select
 * - create a <select> with some <option>
 */
class ComboLite extends HtmlElComp {
	/**
	 * callback, called when selection changes
	 * @callback ComboLite#selection
	 * @param {number} ix index may be -1, if nothing is selected
	 * @param {string} val value of selection, is textContent of <option>
	 */
	/**
	 * @param {object} arg to construct base-class
	 * @param {ComboLite#selection} arg.selection callback, called when selection change
	 * @param {Function} arg.list callback if sth in rows changed like delete and rename
	 * @param {Function} arg.delete callback
	 * @param {Function} arg.rename callback
	 * @param {string[]} arg.rows items to select
	 * @param {string} arg.row optional: item from items selected
	 * @param {string} arg.placeholder placeholder at start
	 * @param {object} arg.extraBtns create info of additional buttons to add
	 */
	constructor(arg) {
		super(arg)
		if (this.rows==undefined) this.rows = []
		if (this.placeholder==undefined) this.placeholder = ''
		if (this.row==undefined) this.row = this.rows[0]
		this.selIx = this.rows.findIndex(e => e==this.row)
		if (this.selIx === undefined || this.selIx==-1) this.selIx=0
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		// TODO autocomplete may use mechanism keys as bash
		this.select = new ListLite({
			parent:{obj:this},container:{html:'select',evts:{'change':this.handleChange.bind(this)}},
			inner:{vals:this.rows,html:'option',css:'combo-item',select:{ix:this.selIx,atts:{'selected':'true'}}}})
	}
	/**
	 * take same data as dom() and refresh dom-created content
	 */
	update() {
		const obj = Html.mergeDatas.apply(null,arguments) // get arguments
		this.select.update(obj)
	}
	/**
	 * @returns {object} actual selected Item of <select>
	 * - .ix with the selected index
	 * - .val with the text content of selected item
	 */
	getSelected() {
		console.log('selected')
		const selIx = this.select.div.selectedIndex
		const selVal = (selIx==-1) ? undefined : this.select.div[selIx].innerText // if nothing selected, call back with val=undefined
		return {ix:selIx,val:selVal}
	}
	/**
	 * complete set of Combo content
	 * @param {Array} arr a array that take the content
	 */
	setData(arr) {
		this.rows = []
		if (!Arr.is(arr)) return
		this.rows = arr.slice() // copy array
	}
	/**
	 * internal handler for select events
	 * - calls callback if given
	 * @param {Event} evt a HTMLEvent
	 * @private
	 */
	handleChange(evt) {
		console.log('ComboLite:handleChange')
		if (evt.type=='change') { // check if evt.type=change, maybe unused
			const selIx = evt.target.selectedIndex
			const selVal = (selIx==-1) ? undefined : evt.target[selIx].innerText // if nothing selected, call back with val=undefined
			if (this.selection !== undefined) this.selection(selIx,selVal) // only call callback when given
		}
	}
}
export default ComboLite
