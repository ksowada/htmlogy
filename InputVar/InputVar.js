import ArrList from './ArrList.js'
import Model from '../../logic/Model/Model.js'
import Obj from '../../logic/Obj/Obj.js'
import Html from '../../logic/html/Html/Html.js'

/**
 * @class InputVar
 * represents a variable
 * - multiple DOM implementations are available
 * - extends Model
 *   - Storage (with initial,load,save) as extends Model
 *   - multiple events can be triggered on change
 * - direct access to value through get and set of 'val'
 * - read only or read-write text-fields
 * - Buttons with edge (simple) or state (toggle)
 * - min, max handling
 */
/**
 * @typedef {object} InputVar~props common ways to address HTMLElement in DOM, choose only 1 of those
 * @property {object} props parameter; all attributes of Html are directly inherited @see {@link Html~createarg}
 * @property {string} props.kind kind of element, important for dom(), also used as CSS-class
 *
 * supported:
 * - text
 * - int
 * - float
 * - currency
 * - range
 * - select
 * @property {string} [props.label] label for input, or button, (distinct from val, which is the val of this)
 * @property {any} [props.val] default value, when no storage value is available
 * @property {any[]} [props.vals] default values, for list items as select option
 * @property {object} [props.tooltip] optional object containing Html args @see {@link Html~createarg}, you may find it in .htmls[ix].tooltip for access and manipulation, and there is function set(val) implemented
 * @property {string} [props.storeEn] f.e. write: prohibit store and disable models listener, default is true
 * @property {number} [props.min] minimum value to bound
 * @property {number} [props.max] maximum value to bound
 */
class InputVar extends Model {
	static typeIsNumber = kind => (kind==='int' || kind==='float' || kind==='currency' || kind==='range')
	/**
	 * a variable (described by props) get initialized, so it can be mounted multiple times in DOM later, it use Html-Instances
	 * @param {InputVar~props} props parameter; all attributes of Html are directly inherited @see {@link Html~createarg}
	 * @param {string|number} ids (f.e. Storage)
	 */
	constructor(props,...ids) {
		const val = props.val?props.val:InputVar.typeIsNumber(props.kind)?0:''
		const storeEn = (props.storeEn!==undefined)?props.storeEn:!(props.kind && props.kind==='btn') // true is default, but props.kind=btn
		super(val,ids,storeEn)

		/**
		 * all DOM implementations of this
		 * @type {Html[]}
		 */
		this.htmls = []

		this.props = Obj.copy(props)
	}
	/**
	 * get actual value
	 * @returns {any}	actual value
	 */
	get val() { return super.val }
	/**
	 * set actual value
	 * @param {any} val	actual value
	 */
	set val(val) {
		let valIntern = val
		if (InputVar.typeIsNumber(this.props.kind)) valIntern = Number.parseFloat(val)
		valIntern = this.checkBound(valIntern)
		super.val = valIntern
		this.setDoms(valIntern)
	}
	/**
	 * set actual value, with prevent for some trigger type
	 * @param {any} val	actual value
	 * @param {string} [prevent]	dont call this type of listener
	 */
	set(val,prevent) {
		super.set(val,undefined,prevent)
		this.setDoms(val)
	}
	/**
	 * creates Html (may be included in additional element) for InputVar and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} parentHtml Html to attach to
	 * @param {InputVar~props} propsAdd properties to add to element, only for this html, dont change this
	 * @returns {Html} Html of input or other element connected
	 * @throws {Error} if kind is not implemented
	 */
	dom(parentHtml,propsAdd) {
		if (propsAdd && propsAdd.val) this.val = propsAdd.val

		// prepare html arg
		const props = Html.mergeDatas(this.props,propsAdd)
		const arg = Obj.filter(props,Html.ARGS) // use all props that are included in Html
		let myHtml = null

		this.setArg(props,arg)

		let workHtml = null
		let tooltip = undefined
		if (props.tooltip) {
			const tooltipArg = Html.mergeDatas({html:'div',css:'tooltip'},props.tooltip,{atts:{'data-tip':props.tooltip.val}})
			/** here you have the Html of tooltip, if requested */
			delete tooltipArg.val
			tooltip = workHtml = parentHtml.add(tooltipArg)
		} else {
			workHtml = parentHtml
		}

		// create html according to kind
		// evt (button)
		if (props.kind==='evt') {
			myHtml = workHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
		} else if (props.kind==='select') {
			workHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
			myHtml = workHtml.add(Html.mergeDatas(arg,{html:'select',val:this.val}))
			// set <select> <option>
			this.list = new ArrList(
				myHtml,item => new Html({html:'option',val:item}),
				() => {return myHtml.el.value},
				val => {myHtml.el.value = val})

			// if vals defined set list
			if (props.vals) {
				this.list.set(props.vals)
				if (props.val) myHtml.el.value = props.val
			}
		} else if (props.kind==='int'||props.kind==='float'|| props.kind==='currency'|| props.kind==='text') {
			const kind = (props.kind==='int'||props.kind==='float')?'number':'text'
			let val = this.val
			if (kind==='currency') val = val.toLocaleString(undefined,{style: 'currency',currency: 'EUR'})
			const argType = {html:'input',atts:{type:kind},val}
			if (!props.label) {
				myHtml = workHtml.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered'}))
			} else {
				const join = workHtml.add({html:'div',css:'flex items-center'})
				join.add({html:'button',css:'btn w-24 text-right pr-4',val:props.label})
				myHtml = join.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered w-24'}))
			}
		} else {
			myHtml = workHtml.add(Html.mergeDatas(arg,{html:'input',val:this.val,atts:{type:props.kind},css:props.kind}))
		}
		if (!myHtml) throw new Error('no known kind so extract no HTML')

		// attach events
		switch (props.kind) {
		case 'evt': myHtml.append({evts:{'click':this.onChange.bind(this)}}); break
		case 'range': myHtml.append({evts:{'input':this.onChange.bind(this)}}); break
		default: myHtml.append({evts:{'change':this.onChange.bind(this)}}); break
		}

		// attach optional tooltip to Html object
		if (tooltip) {
			myHtml.tooltip = tooltip
			myHtml.tooltip.set = val => myHtml.tooltip.change({atts:{'data-tip':val}})
		}

		/** the generated Html attached here */
		// remember dom implementation, ⚠️ forget propsAdd
		this.htmls.push(myHtml)

		return myHtml
	}
	/**
	 * sets the properties of the input variable at all DOM implementations
	 * this is called from top-level
	 * @param {object} props - properties to set
	 */
	change(props) { // TODO max and min @range shall limit value and set atts, but how???
		/** merges this properties with the current properties */
		Html.mergeModDatas(this.props,props)

		/** filters the properties that are used for the html element */
		const arg = Obj.filter(props,Html.ARGS)

		// props that are args, keep them for bound checks the vars as props
		this.setArg(props,arg)

		if (arg.val!==undefined) {
			arg.val = this.checkBound(arg.val)
			this.val = arg.val
		}

		/** changes the html element with the filtered properties */
		this.htmls.forEach(html => html.change(arg))
		// eslint-disable-next-line no-self-assign
		this.val = this.val // call set val for boundcheck
	}
	/**
	 * This function is called when the value of the input element changes.
	 * It checks if the value is an integer or a float, and if so, it ensures that it is within the specified minimum and maximum values.
	 * If the value is outside the specified range, it is adjusted to the nearest value within the range.
	 * The adjusted value is then stored in the model and in the local storage.
	 * @param {Event} event to identify the event targets value
	 */
	onChange(event) {
		let val = event.target.value
		if (this.props.kind==='int'||this.props.kind==='float') {
			if (this.props.kind==='int') val = Number.parseInt(val)
			if (this.props.kind==='float') val = Number.parseFloat(val)
			const valBound = this.checkBound(val,this.props)
			if (val!==valBound) event.target.value = valBound
			val = valBound
		}
		this.val = val
	}
	/**
	 * sets the value of the DOM element, if already existing
	 * @param {any} val a value to set in DOM element
	 * @private
	 */
	setDoms(val) {
		this.htmls.forEach(html => {
			html.el.value = val
		})
	}
	/**
	 * props that are also args, are setted in arg
	 * @param {object} props props containing arguments for Html
	 * @param {object} arg Html.arg
	 * @private
	 */
	setArg(props,arg) {
		if (props.min!==undefined) Obj.put(arg,['atts','min'],props.min)
		if (props.max!==undefined) Obj.put(arg,['atts','max'],props.max)
	}
	/**
	 * checks value against min and max values
	 * @param {number} valOld original value
	 * @returns {number} bounded value
	 * @private
	 */
	checkBound(valOld) {
		let valNew = valOld
		if (this.props.min!==undefined && valNew < this.props.min) valNew = this.props.min
		if (this.props.max!==undefined && valNew > this.props.max) valNew = this.props.max
		return valNew
	}
}
export default InputVar
