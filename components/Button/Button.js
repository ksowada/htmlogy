import Obj from '../../../logic/Obj/Obj.js'
import Str from '../../../logic/Str/Str.js'
import Html from '../../Html/Html.js'
import Vars from '../../../logic/Vars/Vars.js'
import Elem from '../../Elem/Elem.js'

/**
 * @class Button use as HtmlComp
 * use <button> as Button, when html is not given,
 * - deactivate by internal state that controls class and click handler
 * - use mouseup as click, use event click for usual click
 * @augments HtmlComp
 */
class Button extends Html {
	static btnTypes = ['btn-primary','btn-secondary']
	static disabledTypes = ['enabled','disabled']
	static mouseState = ['mousedown','mouseup']

	/**
	 * @param {object} arg parameters for Button construction
	 * @param {HTMLElement} arg.el DomElement
	 * @param {string} arg.title a title for Button tooltip
	 * @param {boolean} arg.disabled disable function and show as disabled
	 * @param {Function} arg.clickCbk callback for click event
	 */
	constructor(arg) {
		Obj.assure(arg,'html','button')
		Obj.assure(arg,'disabled',false)
		let css = Str.listAssure(arg.css,' ','btn')
		css = Str.listAssure(css,' ',Button.btnTypes)
		css = Str.listAssure(css,' ',Button.disabledTypes,Vars.boolToInt(arg.disabled))
		Obj.assure(arg,'atts',{})
		if (Str.is1(arg.title)) arg.atts.title = arg.title // Tooltip
		Obj.assure(arg,'evts',{})
		super({...arg,css:css})
		this.clickCbk = arg.clickCbk
		this.change({evts:{mousedown:this.mousedown.bind(this),'mouseup':this.mouseup.bind(this)}})
		// add icon
		if (arg.icon) {
			this.add({name:'span',html:'span'})
			this.span.add({name:'icon',html: 'i',css: arg.icon})
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
	// TODO set Timeout for animation, even if its only clicked without long mousedown
	mousedown(evt) {
		const el = Elem.findParent(evt.target,this.el) // use parent may show incorrect when directing direct on <i> Logo
		if (!el) return
		if (!Elem.classStateIs(el,'disabled')) { // will only change something when enabled
			Elem.classStateSet(el,'mousedown',Button.mouseState)
		}
	}
	mouseup(evt) {
		const el = Elem.findParent(evt.target,this.el)
		if (!el) return
		Elem.classStateSet(el,'mouseup',Button.mouseState)
		if (Elem.classStateIs(el,'enabled')) { // will only change something when enabled
			if (this.clickCbk) this.clickCbk(this)
		}
	}
}
export default Button
