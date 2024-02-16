import Arr from '../../Arr/Arr.js'
import Bits from '../../Bits/Bits.js'
import Listener from '../../Listener/Listener.js'
import HtmlState from '../HtmlState/HtmlState.js'

/**
 * @class
 * Container for 1 Combination of multiple similar childs consist of HtmlState
 * adds a HtmlSelect for ease use of many similar items
 * - f.e. for a drop-down-menu, which vary at click-action and may be selected all or only 1 and more,
 * - required: DOM-items are introduced after construction at refresh()
 * - events are handled by menu_info.subs and/or the implemented listener with event on|off for overall-items-events
 */
class HtmlSelect extends Listener {
	/**
	 * @param {object} items_states_info contains states and actions on childs of obj like css,atts,etc.
	 * - each key in state_info (except of states) refers to a Html-Object of master
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in complete Array with size as states
	 * @param {object[]} [menu_info] info describe each item, and have subs that may implement individual .on()|.off() callback
	 * @param {number} mode a mode for select 1 or more Bits
	 * @param {number} reactOnClick shall react to clicks to Html objects, 0|undefined=no, 1=single click, 2=double click
	 */
	constructor(items_states_info,menu_info,mode,reactOnClick=0) {
		super()
		/** {string} state in text */
		this.items_states_info = items_states_info

		/** info of each menu item */
		this.menu_info = menu_info

		/** HtmlState for each parent's child */
		this.htmlStates = []

		/** subs are subComponent, contains events that shall be fired at Bit change, of each item, which may handle .click() | on() | off() */
		this.subs = []

		/** use a logical bit-list for different modes and set-styles to use it otherplace also and to simplify this class */
		this.bits = new Bits({mode:mode,on:this.on.bind(this),off:this.off.bind(this)})

		this.reactOnClick = reactOnClick
	}
	/**
	 * essentially call it when DOM-Html are available as prepare
	 * set all components given in state_info according to actual state
	 * @param {Html[]} htmlArr holds all DOM-item of select as named child according to items_states_info
	 * - used when items_states_info is given, if given Html-Object containing children, which are interpolated, via items_states_info
	 * @param {string} subKey as HtmlState needs a key at Html-object to modify Html, you may pass the key if items_states_info consist of single object
	 * @throws {Error} if parent is undefined
	 */
	refresh(htmlArr,subKey) {
		if (htmlArr == undefined) throw new Error('no parent is given, where shall I render childs?')
		Arr.resize(this.subs,htmlArr.length,{}) // resize without change, before fillUp needed

		// iterate over childs and refresh them
		for (let ix=0; ix<htmlArr.length; ix++) {
			// get first key of array-item
			// const htmlItem = Object.values(htmlArr[ix])
			if (this.htmlStates[ix]==undefined) this.htmlStates[ix] = new HtmlState(htmlArr[ix],this.items_states_info)

			if (this.menu_info!==undefined) {
				// TODO to ease this command, use unnamed object in menu_info
				const menu_info_item = Object.values(this.menu_info[ix]) // read info menu_item's object shall be according to array
				this.subs[ix] = menu_info_item[0].sub // set also subs in here as they might be changed (added,removed) in run-time
			} else {
				if (this.reactOnClick && this.reactOnClick>0)	{
					if (subKey!==undefined) {
						htmlArr[ix][subKey].append({evts:{click:this.elementClick.bind(this,ix)}})
					} else {
						htmlArr[ix].append({evts:{click:this.elementClick.bind(this,ix)}})
					}
				}
			}
		}
		// fill this.bits to actual nr of items, uses callbacks on and off, so  htmlStates and subs shall be available
		this.bits.fillUp(htmlArr.length)
	}
	elementClick(ix,evt) {
		if (evt.detail === this.reactOnClick) { // single or double click
			this.child_click(ix)
		}
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
	on(menu_item_ix,refresh) {
		this.htmlStates[menu_item_ix].set_state_ix(1,refresh)
		super.changed('on')
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].on!==undefined) this.subs[menu_item_ix].on()
	}
	off(menu_item_ix,refresh) {
		this.htmlStates[menu_item_ix].set_state_ix(0,refresh)
		super.changed('off')
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].off!==undefined) this.subs[menu_item_ix].off()
	}
}
export default HtmlSelect