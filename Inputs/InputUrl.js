import Button from '../Button/Button.js'
import HtmlElComp from '../html/HtmlElComp.js'
import Html from '../html/Html/Html.js'

/**
 * @class
 * @augments HtmlElComp
 */
// TODO no use any more, so remove
class InputUrl extends HtmlElComp {
	/**
	 * @param {object} arg contains major data about this element; see {@link Html#create}
	 * @param {string} arg.title use as label
	 * @param {Function} arg.click use this callback function when clicked or hit enter or clicked the button
	 * @deprecated as individual styling seems to more efficient in calling class and less worth here
	 * support Bootstrap style as form-control, label and button
	 */
	constructor(arg) {
		super(arg)
		super.constructed()
	}
	/**
	 * @param {object} arg contains major data about this element; see {@link Html#create}
	 * @private
	 */
	dom(arg) {
		super.domCreate({container: {css: 'form-control'}},arg)
		// this.inputGroup = new Html({parent: {obj: this.containerObj},html:'label',css: 'input-group'})
		if (this.icon || this.title) this.label = new Html({parent: {obj: this.containerObj},html:'span',css: 'input-group-text',icon: this.icon,val: this.title})
		this.input = new Html({parent: {obj: this.containerObj},html:'input',css: 'input input-bordered',val: this.val,evts: {'change': this.change.bind(this)}})
		if (this.data != undefined) this.input.value = this.data
		this.buttonOpen = new Button({parent: {obj: this.containerObj},icon: 'fa-solid fa-folder-open',evts: {'click': this.buttonOpenClick.bind(this)}})
	}
	buttonOpenClick() {
		console.log('InputUrl:buttonOpenClick')
		if (this.click !== undefined) {
			this.click(this.get())
		} else {
			window.open(this.input.value,'_blank').focus() // TODO XSS problems
		}
	}
	change() {
		this.click(this.get())
	}
	get() {
		return this.input.my.el.value
	}
	set(text) {
		this.input.my.el.value = text
	}
}
export default InputUrl