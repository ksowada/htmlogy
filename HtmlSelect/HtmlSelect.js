import Arr from '../../Arr/Arr'
import Bits from '../../Bits/Bits'
import HtmlState from '../HtmlState/HtmlState'

/**
 * @class
 * Container for 1 Combination of multiple similar childs consist of HtmlState
 * - these child-HtmlState have master in master.childs
	* adds a HtmlSelect for ease use of many similar items
	* - f.e. for a drop-down-menu, which vary at click-action and may be selected all or only 1 and more,
	* - parent as well as childs of parent are introduced after construction
 */
class HtmlSelect {
	/**
	 * @param {object} child_state_info contains states and actions on childs of obj like css,atts,etc.
	 * - each key in state_info (except of states) refers to a Html-Object of master
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in complete Array with size as states
	 * @param {object[]} menu_info info describe each item
	 * @param {number} mode a mode for select 1 or more Bits
	 */
	constructor(child_state_info,menu_info,mode) {
		/** {string} state in text */
		this.child_state_info = child_state_info

		/** info of each menu item */
		this.menu_info = menu_info

		/** HtmlState for each parent's child */
		this.htmlStates = []

		/** subs are subComponent, contains events that shall be fired at Bit change, of each item, which may handle .click() | on() | off() */
		this.subs = []

		/** use a logical bit-list for different modes and set-styles to use it otherplace also and to simplify this class */
		this.bits = new Bits({mode:mode,on:this.on.bind(this),off:this.off.bind(this)})
	}
	/**
	 * set all components given in state_info according to actual state
	 * @param {Html} parent optional and only used when child_state_info is given, if given Html-Object containing children, which are interpolated, via child_state_info
	 * @throws {Error} if parent is undefined
	 */
	refresh(parent) {
		if (parent!==undefined) this.parent = parent // remember me for call, if given
		if (this.parent == undefined) throw new Error('no parent is given, where shall I render childs?')
		Arr.resize(this.subs,this.parent.childs.length,{}) // resize without change, before fillUp needed

		// iterate over childs and refresh them
		for (let ix=0; ix<this.parent.childs.length; ix++) {
			// get first key of array-item
			const child_item = Object.values(this.parent.childs[ix])
			if (this.htmlStates[ix]==undefined) this.htmlStates[ix] = new HtmlState(child_item[0].childs,this.child_state_info)

			// TODO to ease this command, use unnamed object in menu_info
			const menu_info_item = Object.values(this.menu_info[ix]) // read info menu_item's object shall be according to array
			this.subs[ix] = menu_info_item[0].sub // set also subs in here as they might be changed (added,removed) in run-time
		}
		// fill this.bits to actual nr of items, uses callbacks on and off, so  htmlStates and subs shall be available
		this.bits.fillUp(this.parent.childs.length)
	}
	/**
	 * click on child which is self a HtmlState
	 * you can bind this as callback
	 * it finds item count on itself due to ancestor in master.childs[]
	 * @param {number} ix ix of item
	 * @public
	 */
	child_click(ix) {
		// toggle evt.ix in select-logic & in there handle sub specific
		this.bits.toggle(ix) // will fire multiple on & off-events
		const state_ix = this.bits.getIntOf(ix)
		this.htmlStates[ix].set_state_ix(state_ix)
	}
	on(menu_item_ix) {
		// console.log('on():'+menu_item_ix)
		this.htmlStates[menu_item_ix].set_state_ix(1)
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].on!==undefined) this.subs[menu_item_ix].on()
	}
	off(menu_item_ix) {
		// console.log('off():'+menu_item_ix)
		this.htmlStates[menu_item_ix].set_state_ix(0)
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].off!==undefined) this.subs[menu_item_ix].off()
	}
}
export default HtmlSelect