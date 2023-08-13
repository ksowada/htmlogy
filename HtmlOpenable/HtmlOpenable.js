import Vars from '../../Vars/Vars'
import Html from '../Html/Html'

/**
 * @class
 * @augments Html
 * for optionally visible Html f.e. for Models, or action-dependend visible containers as menu and panels
 */
class HtmlOpenable extends Html {
	static domArgAddition = {} // {domLater:true} // TODO just for commissioning
	static states = ['hidden','visible']
	/**
	 * will create a Html, but will add .domLater, so you must call dom() later
	 * - its intended and force to dom on demand for use in menus or dynamic panels
	 * @param {object} arg arguments for Html creation
	 * @param {object[]} childs these items get construcotr-args, and will be append as children of this
	 */
	constructor(arg,childs) {
		if (arg==undefined||arg=={}) {
			super(HtmlOpenable.domArgAddition,childs)
		} else {
			super({...arg,...HtmlOpenable.domArgAddition},childs)
		}
		// this.states = ['hidden','visible'] // TODO why forget this in method
		this.domArgAddition = HtmlOpenable.domArgAddition
	}
	/**
	 * add child for later dom()
	 * @param {Html | object} arg may supply Html or object to construct a Html
	 */
	// TODO move to Html, but use addLater
	add() {
		if (Vars.typeHier(arguments[0]).includes('Html')) {
			this.childs.push(arguments[0])
		} else {
			this.childs.push(new Html({...arguments,...this.domArgAddition}))
		}
	}
	/**
	 * write dom (itself and all added childs)
	 * @param {object} arg args for Html.dom()
	 * - shall supply .parent, as the menu will be dom() later
	 * @param {boolean} visibleEn defaults to false
	 * - true: visible after dom()
	 * - false: hidden after dom()
	 */
	dom(arg,visibleEn) {
		const stateIx = (visibleEn!==undefined) ? 1 : 0
		const argModed = Html.mergeModDatas(arg,{css:HtmlOpenable.states[stateIx]})
		super.render(argModed)
		this.childs.forEach(child => { // dom() all added childs
			child.render({parent:{obj:this}})
		})
	}
	// to override from Bits
	// ---------------------
	on() {
		// console.log('on()')
		this.open()
	}
	off() {
		// console.log('off()')
		this.close()
	}
	// to use in this or subclass
	// --------------------------
	open() { // TODO may this move to on? also as close
		this.classStateSet('visible',HtmlOpenable.states)
	}
	close() {
		this.classStateSet('hidden',HtmlOpenable.states)
	}
}
export default HtmlOpenable