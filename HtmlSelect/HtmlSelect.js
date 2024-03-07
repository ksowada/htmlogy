import Arr from '../../Arr/Arr.js'
import Bits from '../../Bits/Bits.js'
import Obj from '../../Obj/Obj.js'
import HtmlState from '../HtmlState/HtmlState.js'

/**
 * @class Container for 1 Combination of multiple similar childs consist of HtmlState
 * adds a HtmlSelect for ease use of many similar items
 * - f.e. for a drop-down-menu, which vary at click-action and may be selected all or only 1 and more,
 * - required: DOM-items are introduced after construction at refresh()
 * - events are handled by menu_info.subs and/or the implemented listener with event on|off for overall-items-events
 * @augments Bits
 */
class HtmlSelect extends Bits {
	/**
	 * @typedef {object} HtmlSelect~props
	 * - also pass props to each HtmlState instance @see {@link HtmlState~props}
	 * @property {object} props properties
	 * @property {object[]} [props.menu_info] info describe each item, and have subs that may implement individual .on()|.off() callback
	 * @property {string} [props.subKey] if defined, it will be used to address master's property to attach the click event, if undefined it will use master itself
	 * @property {number} [props.mode] a mode for select 1 or more Bits, see Bits for more information, defaults to MODE_MULTI_1
	 * @property {number} props.reactOnClick shall react to clicks to Html objects, 0=no, 1|undefined=single click, 2=double click
	 */

	/**
	 * create a new instance
	 * @param {HtmlSelect~props} props instance properties
	 * @param {string[]} names names to inherit to Model and Storage, keep unique
	 */
	constructor(props,names) {
		// use a BITS as logical bit-list for different modes and set-styles to use it otherplace also and to simplify this class
		super({mode:props.mode},names)

		props.reactOnClick = props.reactOnClick?props.reactOnClick:1
		props.mode = (props.mode!==undefined)?props.mode:Bits.MODE_MULTI_1

		/** properties, that will not change during operation */
		this.props = props

		/** HtmlState for each parent's child */
		this.htmlStates = []

		/**
		 * subs are subComponent, contains events that shall be fired at Bit change, of each item, which may handle .click() | on() | off()
		 * @deprecated use listener instead
		 */
		this.subs = []

		this.on('on',this.onSet.bind(this))
		this.on('off',this.onReset.bind(this))
	}
	/**
	 * essentially call it when DOM-Html are available as prepare
	 * set all components given in state_items_arg according to actual state
	 * @param {Html[]} htmlArr holds all DOM-item of select as named child according to state_items_arg
	 * - used when state_items_arg is given, if given Html-Object containing children, which are interpolated, via state_items_arg
	 * @param {object} propsAdd properties
	 * @param {string} [prevent] don't call this type of listeners
	 * @throws {Error} if parent is undefined
	 */
	refresh(htmlArr,propsAdd,prevent) {
		const props = Obj.mergeOverwrite(this.props,propsAdd)
		if (htmlArr == undefined) throw new Error('no parent is given, where shall I render childs?')

		Arr.resize(this.subs,htmlArr.length,{}) // resize without change, before refresh needed

		// iterate over childs and refresh them
		for (let ix=0; ix<htmlArr.length; ix++) {
			// get first key of array-item
			// const htmlItem = Object.values(htmlArr[ix])
			if (this.htmlStates[ix]==undefined) this.htmlStates[ix] = new HtmlState(htmlArr[ix],props)
			this.htmlStates[ix].refresh()
			if (props.menu_info!==undefined) {
				// TODO to ease this command, use unnamed object in menu_info
				const menu_info_item = Object.values(props.menu_info[ix]) // read info menu_item's object shall be according to array
				this.subs[ix] = menu_info_item[0].sub // set also subs in here as they might be changed (added,removed) in run-time
			} else {
				if (props.reactOnClick && props.reactOnClick>0)	{
					if (props.subKey!==undefined) {
						htmlArr[ix][props.subKey].append({evts:{click:this.elementClick.bind(this,ix)}})
					} else {
						htmlArr[ix].append({evts:{click:this.elementClick.bind(this,ix)}})
					}
				}
			}
		}
		// set bits and care for mode, by the way HtmlStates will be triggered at bit change, via .onSet() and .onReset()
		super.refreshBits(htmlArr.length,prevent)
	}
	/**
	 * click on child which is self a HtmlState
	 * you can bind this as callback
	 * it finds item count on itself due to ancestor in master.childs[]
	 * @param {number} ix ix of item
	 * @param {MouseEvent} evt DOM event
	 * @private
	 */
	elementClick(ix,evt) {
		if (evt.detail === this.props.reactOnClick) { // single or double click
		// toggle evt.ix in select-logic & in there handle sub specific
			this.toggle(ix) // will fire multiple on & off-events
			// const state_ix = this.getIntOf(ix)
			// this.htmlStates[ix].set_state_ix(state_ix)
		}
	}
	/**
	 * an item gets true, alias selected
	 * @param {number} menu_item_ix index of the menu item that was clicked
	 * @param {boolean} [refresh] whether to refresh the HTML element
	 * @private
	 */
	onSet(menu_item_ix,refresh) {
		this.htmlStates[menu_item_ix].set_state_ix(1,refresh)
		// super.changed('on')
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].on!==undefined) this.subs[menu_item_ix].on()
	}
	/**
	 * an item gets false, alias deselected
	 * @param {number} menu_item_ix index of the menu item that was clicked
	 * @param {boolean} [refresh] whether to refresh the HTML element
	 * @private
	 */
	onReset(menu_item_ix,refresh) {
		this.htmlStates[menu_item_ix].set_state_ix(0,refresh)
		// super.changed('off')
		if (this.subs[menu_item_ix]!==undefined && this.subs[menu_item_ix].off!==undefined) this.subs[menu_item_ix].off()
	}
}
export default HtmlSelect
