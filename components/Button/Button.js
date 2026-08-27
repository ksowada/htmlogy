import Obj from '../../../logic/Obj/Obj.js'
import Str from '../../../logic/Str/Str.js'
import Html from '../../Html/Html.js'
import Vars from '../../../logic/Vars/Vars.js'
import Elem from '../../Elem/Elem.js'
import './Button.css'

/**
 * @class Button use as HtmlComp
 * use <button> as Button, when html is not given,
 * - deactivate by internal state that controls class and click handler
 * - use mouseup as click, use event click for usual click
 * @augments HtmlComp
 */
class Button extends Html {
	static disabledTypes = ['enabled','disabled']

	/**
	 * @param {object} arg parameters for Button construction
	 * @param {HTMLElement} arg.el DomElement
	 * @param {string} arg.title a title for Button tooltip
	 * @param {boolean} arg.disabled disable function and show as disabled
	 */
	constructor(arg) {
		Obj.assure(arg,'html','button')
		Obj.assure(arg,'disabled',false)
		let css = Str.listAssure(arg.css,' ','btn')
		css = Str.listAssure(css,' ',Button.disabledTypes,Vars.boolToInt(arg.disabled))
		Obj.assure(arg,'atts',{})
		if (Str.is1(arg.title)) arg.atts.title = arg.title // Tooltip
		Obj.assure(arg,'evts',{})
		if (arg.icon) {
			// put val in later <span> instead direct in <button>
			const valFlag = arg.val
			arg.val = ''
			super({...arg,css:css})
			arg.val = valFlag
		} else {
			super({...arg,css:css})
		}
		// this.change({evts:{mousedown:this.mousedown.bind(this),'mouseup':this.mouseup.bind(this)}})
		// add icon
		if (arg.icon) {
			this.add({h:`<img class="inline" src=${arg.icon} />`})
			this.add({html:'span',val:arg.val})
		}
	}
	/**
	 * do anything but not create items
	 * @param {object} arg change parameters
	 */
	update(arg) {
		Obj.assure(arg,'atts',{})
		if (Str.is1(arg.title)) arg.atts.title = arg.title // Tooltip
		// change css, via accessor not per change()
		if (arg.disabled!==undefined) {
			Elem.classStateSet(this.btn.my.el,Vars.boolToInt(arg.disabled),this.disabledTypes)
		}
		this.btn.change(arg)
		Html.mergeModDatas(this,arg) // at the end remember changed data
	}
}
export default Button
