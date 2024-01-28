// @ts-check
// import Html from '../html/html/Html/Html'
// import HtmlOpenable from '../Html/HtmlOpenable/HtmlOpenable'
// import Arr from '../logic/Arr/Arr'
import Arr from '../../Arr/Arr'
import Html from '../Html/Html'
import HtmlOpenable from '../HtmlOpenable/HtmlOpenable'
import './Menu.scss'

/**
 * @class  create a menu system, consist of one or more stages as menus, may extend
 * - you shall supply a container element if you want common class or nesting in a single element; sequence dom from top-to-down or down-to-top for Top-Navigation, regular linear component or bottom-navigation
 * @augments Html
 */
class MenuStairs extends Html { // TODO may be Html or HtmlOpenable
	/**
	 * @param {object} arg root element for menu-generation
	 * @param {boolean} dirReverse direction of menu, if root element shall be mounted first or last, dependent of bottom up or top-bottom dir of layout
	 * - false indicated top to bottom layout
	 * - true indicated bottom to top layout
	 * - if not defined, defaults to true
	 */
	constructor(arg,dirReverse) {
		super(arg) // TODO unity may use local var in dom()
		this.dirReverse = (dirReverse!==undefined) ? dirReverse : false
		/**
		 * all menus that are added through add()
		 * @type {HtmlOpenable[]}
		 */
		this.menus = []
	}
	/**
	 * enrich the menu itertively with each item
	 * - they will dom() in add-order, when dirReverse is false, else otherwise
	 * - push main-menu (always visible) at last
	 * @param {HtmlOpenable} htmlOpenable a HtmlOpenable or subclass of it that represent a DOM-element to add to menu
	 */
	add(htmlOpenable) {
		this.menus.push(htmlOpenable)
	}
	/**
	 * parse added menu's and after that fetch as set in dirReverse and call dom() for all
	 */
	domMenu() {
		// TODO only show active menus & according to hierarchy
		let menus_to_dom = [] // build a copy of menus for sequence, but w/o modifying original, otherwise must reverse it twice
		if (this.dirReverse) {
			menus_to_dom = [...this.menus]
		} else {
			menus_to_dom = this.menus.toReversed()
		}
		menus_to_dom.forEach((menu,ix) => {
			menu.dom({parent:{obj:this}}) // TODO replace with add
			// if (this.dirReverse && (Arr.isLast(ix,menus_to_dom)) || !this.dirReverse && (Arr.isFirst(ix,menus_to_dom))) { // make visible
			if (Arr.isFirstWithReverse(ix,this.dirReverse,menus_to_dom)) { // make visible
				menu.on()
			}
		})
	}
}
export default MenuStairs