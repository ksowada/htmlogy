// import Html from '../html/html/Html/Html.js'
import Html from '../Html/Html.js'
import HtmlOpenable from '../HtmlOpenable/HtmlOpenable.js'
import HtmlSelect from '../HtmlSelect/HtmlSelect.js'

/**
 * @class one set of menu-items, displayed all at once on one panel consist of a HtmlSelect for item selection, this cares also for .sub, which are described in menu_info and may contain items that will be opened at action on a item
 * @augments HtmlOpenable
 */
class MenuStage extends HtmlOpenable {
	/**
	 * @param {object[]} menu_info describe changes via Html-change interface
	 * - infos according to Html, they will used for Html generation of the container of each menu-items
	 * - may contain a .sub Object which manages SubMenu and actions, when Bits change, it may be
	 * - a callback
	 * - a Html based class which may handle .click() | on() | off()
	 * @param {string} menu_info.sub a class that may handle  on() | off(), as supplied from Bits of HtmlSelect
	 * @param {number} mode a mode for select 1 or more Bits
	 */
	constructor(menu_info,mode) {
		const state_items_arg = {
			a:{
				css:['','active']
			}
		}
		// domLater, cause parent supplied later with dom()
		super({html:'ul',css:'menu menu-horizontal bg-base-200 rounded-box w-full',domLater:true})

		/** info of each menu item */
		this.menu_info = menu_info

		/** a select over all items of this menu */
		this.select = new HtmlSelect(state_items_arg,this.menu_info,mode)
	}
	/**
	 * draw the menu instantly in the given Html, with every child
	 * @param {object} arg args for Html.dom(), supply .parent, where the menu will be created (layed into its DOM), may be modified
	 */
	dom(arg) {
		super.dom(arg)

		// iterate over each menu-item
		const mySelect = []
		this.menu_info.forEach((menu_item_obj,menu_item_ix) => {
			let menu_item = Object.values(menu_item_obj)[0] // use first value, and neglect key, key is only use when named access is needed
			const menu_item_li = new Html({parent:{obj:this},html:'li'})
			mySelect.push(this.add({li:menu_item_li}))

			const menu_item_a = new Html({parent:{obj:menu_item_li},html:'a',val:menu_item.title,icon:menu_item.icon,evts:{click:this.click.bind(this,menu_item_ix)}})
			if (menu_item.tooltip!==undefined) menu_item_a.change({css:'tooltip',atts:{'data-tip':menu_item.tooltip}})
			menu_item_li.add({a:menu_item_a})
		})
		this.select.refresh(mySelect)
	}
	/**
	 * handles click on a single item
	 * @param {number} menu_item_ix Menu item index
	 * @private
	 */
	// TODO handle states inherently,  Mouse-down --> glow, uni-or bistable so infer new kind of Bits and handle with sophisticated Bit
	click(menu_item_ix) {
		this.select.elementClick(menu_item_ix)
		// console.log('click:',this.select.bits.toString())
	}
	// to override from Bits
	// ---------------------
	on() {
		// console.log('on()')
		super.on()
		// remember [Option! per menu_item, may use select.mode] state of sub (to reopen them, when reopen this (in parent-role))
		this.select.val.forEach((bit,ix) => {
			if (bit==true && this.select.subs[ix]!==undefined && this.select.subs[ix].on!==undefined) this.select.subs[ix].on()
		})
	}
	off() {
		// console.log('off()')
		// also close subs, only MenuStage has these in select, as HtmlOpenable has no subs
		this.select.subs.forEach(sub => {
			if (sub.off!==undefined) sub.off()
		})
		super.off()
	}
}
export default MenuStage