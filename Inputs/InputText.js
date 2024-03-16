import HtmlElComp from '../html/HtmlElComp.js'
import Html from '../html/Html/Html.js'
// TODO no use any more, so remove
/**
 * @class
 * @augments HtmlElComp
 */
class InputText extends HtmlElComp {
	/**
	 * @param {object} arg see {@link Html~createarg}
	 */
	constructor(arg) {
		super(arg)
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate({container:{css:'input-url'}},Html.mergeDatas.apply(null,arguments))
		if (this.html==undefined) this.html = 'input'
		this.label = new Html({parent:{obj:this.containerObj},html:'label',css:'input-group-text',icon:this.icon,val:this.title})
		let options = {}
		if (this.html=='textarea') options = {rows:3}
		this.input = new Html({parent:{obj:this.containerObj},html:this.html,css:'form-control',val:this.data,atts:options,evts:{'change':this.change.bind(this)}})
	}
	get() {
		return this.input.my.el.value
	}
	set(text) {
		this.input.my.el.value = text
	}
	change() {
		this.click(this.get())
	}
}
export default InputText