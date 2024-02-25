import ArrList from './ArrList'
import Model from '../../logic/Model/Model'
import Numbers from '../../logic/Numbers/Numbers'
import Obj from '../../logic/Obj/Obj'
import Html from '../../logic/html/Html/Html'

/**
 * @class InputVar
 * represents a variable
 * - multiple DOM implementations are available
 * - Storage (with initial,load,save)
 * - Toolbox optional (copy,paste,reset,delete), or additional user-buttons
 * - direct access to value
 * - read only or read-write text-fields
 * - Buttons with edge (simple) or state (toggle)
 * - select
 * - multiple events can be triggered on change
 * - extends Model
 */
class InputVar extends Model {
	static typeIsNumber = kind => (kind==='int' || kind==='float' || kind==='currency')
	/**
	 * generate a Html appropriate to var kind
	 * @param {object} props parameter for variable, all attributes of Html are used {@link Html~createarg}
	 * @param {string} props.kind important for dom() and kind of element, and many other
	 * - text
	 * - int
	 * - float
	 * - currency
	 * @param {string} [props.label] label for input, or button, (distinct from val, which is the val of this)
	 * @param {any} [props.val] default value, when no storage value is available
	 * @param {any[]} [props.vals] default values, for list items as select option
	 * @param {object} [props.tooltip] optional object containing Html args {@link Html~createarg}, you may find it in .htmls[ix].tooltip for access and manipulation, and there is function set(val) implemented
	 * @param {string} [props.storeEn] f.e. write: prohibit store and disable models listener, default is tru
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

		Obj.assure(this.props,'atts',{}) // needed for min,max check etc.
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
		super.val = val
		this.setVal(val)
	}
	/**
	 * set actual value, with prevent for some trigger type
	 * @param {any} val	actual value
	 * @param {string} [prevent]	dont call this type of listener
	 */
	set(val,prevent) {
		super.set(val,undefined,prevent)
		this.setVal(val)
	}
	/**
	 * creates Html (may be included in additional element) for InputVar and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} parentHtml Html to attach to
	 * @param {object} propsAdd properties to add to element, only for this html, dont change this
	 * @returns {Html} Html of input or other element connected
	 * @throws {Error} if kind is not implemented
	 */
	dom(parentHtml,propsAdd) {
		if (propsAdd && propsAdd.val) this.val = propsAdd.val

		// prepare html arg
		const props = Html.mergeDatas(this.props,propsAdd)
		const arg = Obj.filter(props,Html.ARGS) // use all props that are included in Html
		let myHtml = null

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
	 * @param {object} props - properties to set
	 */
	change(props) {
		/** merges this properties with the current properties */
		Html.mergeModDatas(this.props,props)

		/** filters the properties that are used for the html element */
		const arg = Obj.filter(this.props,Html.ARGS)

		/** changes the html element with the filtered properties */

		this.htmls.forEach(html => html.change(arg))
		// this.onChange() // may change value, min, or max, etc.
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
			const valBound = Numbers.bound(val,this.props.atts.min,this.props.atts.max)
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
	setVal(val) {
		this.htmls.forEach(html => {
			html.el.value = val
		})
	}
}
export default InputVar
