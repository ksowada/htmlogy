import Html from '../../Html/Html.js'
import './Combo.scss'
import Arr from '../../../logic/Arr/Arr.js'
import List from '../List/List.js'

// TODO have similar spell logic to merge tiperrs
// TODO remove, if unusable
/**
 * @class create a Combo element with some major features, like select , rename and delete
 * @augments Html
 * ComboLite: a read-only select without controls for manipulating content, just select
 * - create a <select> with some <option>
 */
class ComboLite extends List {
	/**
	 * callback, called when selection changes
	 * @callback ComboLite#selection
	 * @param {number} ix index may be -1, if nothing is selected
	 * @param {string} val value of selection, is textContent of <option>
	 */
	/**
	 * @param {object} arg to construct base-class
	 * @param {ComboLite#selection} arg.selection callback, called when selection change, also on update
	 * @param {Function} arg.list callback if sth in vals changed like delete and rename
	 * @param {Function} arg.delete callback
	 * @param {Function} arg.rename callback
	 * @param {string[]} arg.vals items to select
	 * @param {string} arg.row optional: item from items selected
	 * @param {string} arg.placeholder placeholder at start
	 * @param {object} arg.extraBtns create info of additional buttons to add
	 */
	constructor(arg={}) {
		
		if (arg.vals==undefined) arg.vals = []
		if (arg.placeholder==undefined) arg.placeholder = ''
		if (arg.row==undefined) arg.row = arg.vals[0]
		arg.selIx = arg.vals.findIndex(e => e==arg.row)
		if (arg.selIx === undefined || arg.selIx==-1) arg.selIx=0
		
		// TODO autocomplete may use mechanism keys as bash
		super({container:{html:'select'},inner:{vals:arg.vals,html:'option',css:'combo-item'}})

		this.vals = arg.vals
		if (arg.selection) this.selection = arg.selection
		this.change({evts:{'change':this.handleChange.bind(this)}})
	}
	update(arg) {
		super.update(arg)
		if (this.el) {
			const selIx = this.el.selectedIndex
			const selVal = (selIx==-1) ? undefined : this.el[selIx].innerText // if nothing selected, call back with val=undefined

			if (this.selection !== undefined) this.selection(selIx,selVal) 
		}
	}
	/**
	 * @returns {object} actual selected Item of <select>
	 * - .ix with the selected index
	 * - .val with the text content of selected item
	 */
	getSelected() {
		console.log('selected')
		const selIx = this.el.selectedIndex
		const selVal = (selIx==-1) ? undefined : this.el[selIx].innerText // if nothing selected, call back with val=undefined
		return {ix:selIx,val:selVal}
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
