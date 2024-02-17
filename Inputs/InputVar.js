import ArrList from '../../logic/Arr/ArrList'
import Ids from '../../logic/Ids'
import Model from '../../logic/Model/Model'
import Numbers from '../../logic/Numbers/Numbers'
import Obj from '../../logic/Obj/Obj'
import Store from '../../logic/Store'
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
 * - implements Model
 */
class InputVar {
	typeIsNumber = kind => (kind==='int' || kind==='float' || kind==='currency')
	/**
	 * generate a Html appropriate to var kind
	 *
	 * other data may use prefix .user
	 * @param {string} id - unique identifier for Storage, to store more than one App in 1 domain
	 * auto-load
	 * @param {object} props parameter for variable, all attributes of Html are used @link {Html#create}
	 * @param {string} props.label label for input, or button, (distinct from val, which is the val of this)
	 * @param {any} props.val default value, when no storage value is available
	 * @param {string} props.kind important for dom() and kind of element, and many other
	 * - text
	 * - int
	 * - float
	 * - currency
	 * @param {string} props.dir f.e. write: prohibit store and disable models listener
	 * @param {string} name (f.e. Storage)
	 * @param {number} [ix] (f.e. Storage)
	 */
	constructor(id,props,name,ix) {
		this.id = id

		/** as needed for Storage */
		this.name = name

		/** if needed in arrays */
		this.ix = ix

		/**
		 * all DOM implementations of this
		 * @type {Html[]}
		 */
		this.htmls = []

		const writeEn = (props.dir && props.dir==='write')
		this.storeEn = !(writeEn || (props.kind && props.kind==='btn'))

		const fallbackVal = props.val?props.val:this.typeIsNumber(props.kind)?0:''

		const val = (this.storeEn) ? Store.get(Ids.combineId(this.id,this.name,this.ix),fallbackVal) : fallbackVal

		/** stores actual value in val, and has capabilities for other vars bounded to this */
		this.model = new Model({val},writeEn) // if not storage enable it wont trigger

		this.props = Obj.copy(props)

		Obj.assure(this.props,'atts',{}) // needed for min,max check etc.
	}
	/**
	 * get actual value
	 * @returns {any}	actual value
	 */
	get val() { return this.model.get('val') }
	/**
	 * set actual value
	 * @param {any} val	actual value
	 */
	set val(val) {
		this.model.set('val',val)
		this.setVal(val)
	}
	/**
	 * creates Html (may be included in additional element) for InputVar and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} parentHtml Html to attach to
	 * @param {object} propsAdd properties to add to element, only for this html, dont change this
	 * @param implName
	 * @returns {Html} Html of input or other element connected
	 * @throws {Error} if kind is not implemented
	 */
	dom(parentHtml,propsAdd,implName) {
		// prepare html arg
		const props = Html.mergeDatas(this.props,propsAdd)
		const arg = Obj.filter(props,Html.ARGS) // use all props that are included in Html
		let myHtml = null

		// create html according to kind
		if (props.kind==='evt') {
			myHtml = parentHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
		} else if (props.kind==='select') {
			parentHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
			myHtml = parentHtml.add(Html.mergeDatas(arg,{html:'select',val:props.label}))
			this.list = new ArrList(
				myHtml,item => new Html({html:'option',val:item}),
				() => {return myHtml.el.value},
				val => {myHtml.el.value = val})
		} else if (props.kind==='int'||props.kind==='float'|| props.kind==='currency'|| props.kind==='text') {
			const kind = (props.kind==='int'||props.kind==='float')?'number':'text'
			let val = this.model.get('val')
			if (kind==='currency') val = val.toLocaleString(undefined,{style: 'currency',currency: 'EUR'})
			const argType = {html:'input',atts:{type:kind},val}
			if (!props.label) {
				myHtml = parentHtml.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered'}))
			} else {
				const join = parentHtml.add({html:'div',css:'flex items-center'})
				join.add({html:'button',css:'btn w-24 text-right pr-4',val:props.label})
				myHtml = join.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered w-24'}))
			}
		} else {
			myHtml = parentHtml.add(Html.mergeDatas(arg,{html:'input',atts:{type:props.kind},css:props.kind}))
		}
		if (!myHtml) throw new Error('no known kind so extract no HTML')

		// attach events
		switch (props.kind) {
		case 'evt': myHtml.append({evts:{'click':this.onChange.bind(this)}}); break
		default: myHtml.append({evts:{'change':this.onChange.bind(this)}}); break
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
	 * @param event
	 */
	onChange(event) {
		let val = event.target.value
		console.log('onChange:',this.name,this.ix,val)
		if (this.props.kind==='int'||this.props.kind==='float') {
			if (this.props.kind==='int') val = Number.parseInt(val)
			if (this.props.kind==='float') val = Number.parseFloat(val)
			const valBound = Numbers.bound(val,this.props.atts.min,this.props.atts.max)
			if (val!==valBound) event.target.value = valBound
			val = valBound
		}
		this.val = val
		if (this.storeEn) Store.set(Ids.combineId(this.id,this.name,this.ix),val)
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