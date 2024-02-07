import Obj from '../../logic/Obj/Obj.js'
import Str from '../../logic/Str/Str.js'
import HtmlComp from '../../logic/html/HtmlComp/HtmlComp.js'
import Vars from '../../logic/Vars/Vars.js'
import Html from '../../logic/html/Html/Html'

/**
 * @class Button use as HtmlComp
 * use <a> as Button
 * - deactivate by internal state that controls class and click handler
 * - use mouseup as click, use event click for usual click
 * @augments HtmlComp
 */
class Button extends HtmlComp {
	/**
	 * @param {object} arg parameters for Button construction
	 * @param {HTMLElement} arg.el DomElement
	 * @param {string} arg.title a title for Button tooltip
	 * @param {boolean} arg.disabled disable function and show as disabled
	 */
	// TODO search for html:'button'
	constructor(arg) {
		super(arg)
		this.btnTypes = ['btn-primary','btn-secondary']
		this.disabledTypes = ['enabled','disabled']
		this.mouseState = ['mousedown','mouseup']
		Obj.assure(this,'evts',{})
		this.evts.mousedown = this.mousedown.bind(this)
		this.evts.mouseup = this.mouseup.bind(this)
		// this.evts.click = this.click.bind(this)
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate({disabled:false})
		let css = Str.listAssure(this.css,' ','btn')
		css = Str.listAssure(css,' ',this.btnTypes)
		css = Str.listAssure(css,' ',this.disabledTypes,Vars.boolToInt(this.disabled))
		Obj.assure(this,'atts',{})
		if (Str.valid1(this.title)) this.atts.title = this.title // Tooltip
		// if (this.disabled) this.atts.disabled=true // an simple disabled is preferred but dont want to try another hack, besides false setting keeps disabled
		if (this.blob && this.blobFile) { // TODO try to use only one html-Element instead of a and div
			// TODO not implemented for update
			this.a = new Html({parent:this.parent,html:'a'})
			/** div is root HTMLElement of this item important for List */
			this.div = this.a.my.el
			this.btn = new Html({parent:{el:this.a},html:'div',css:css,val:this.val,atts:this.atts})
			this.a.setAttribute('href',window.URL.createObjectURL(this.blob))
			this.a.setAttribute('download',this.blobFile)
			this.a.dataset.downloadurl = [this.blob.type,this.a.download,this.a.href].join(':')
			this.a.draggable = true
			this.a.classList.add('dragout')
		} else {
			// updated if not already created
			if (!this.btn) this.btn = new Html(Html.mergeDatas(this,{html:'button',css:css}))
			else this.btn.change({...this,css:css})
			this.div = this.btn.my.el
		}
	}
	/**
	 * do anything but not create items
	 * @param {object} arg change parameters
	 */
	update(arg) {
		Obj.assure(arg,'atts',{})
		if (Str.valid1(arg.title)) arg.atts.title = arg.title // Tooltip
		// change css, via accessor not per change()
		if (arg.disabled!==undefined) {
			Html.classStateSet(this.btn.my.el,Vars.boolToInt(arg.disabled),this.disabledTypes)
		}
		if (this.blob && this.blobFile) {
			this.a.change(arg)
		} else {
			this.btn.change(arg)
		}
		Html.mergeModDatas(this,arg) // at the end remember changed data
	}
	// TODO set Timeout for animation, even if its only clicked without long mousedown
	mousedown(evt) {
		const el = Html.findParent(evt.target,this.div) // use parent may show incorrect when directing direct on <i> Logo
		if (!el) return
		if (!Html.classStateIs(el,'disabled')) { // will only change something when enabled
			Html.classStateSet(el,'mousedown',this.mouseState)
		}
	}
	mouseup(evt) {
		const el = Html.findParent(evt.target,this.div)
		if (!el) return
		Html.classStateSet(el,'mouseup',this.mouseState)
		if (Html.classStateIs(el,'enabled')) { // will only change something when enabled
			if (this.clickCbk) this.clickCbk()
		}
	}
}
export default Button