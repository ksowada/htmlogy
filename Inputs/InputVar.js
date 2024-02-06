import Ids from '../../logic/Ids'
import Model from '../../logic/Model/Model'
import Numbers from '../../logic/Numbers/Numbers'
import Obj from '../../logic/Obj/Obj'
import Store from '../../logic/Store'
import Html from '../../logic/html/Html/Html'

/**
 * @class InputVar
 * represents a variable
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
	/**
	 * generate a Html appropriate to var type
	 * auto-load
	 * @param {object} props parameter for variable
	 * @param {string} props.label label for input, or button, (distinct from val, which is the val of this)
	 * @param {any} props.is default value, when no storage value is available
	 * @param {string} props.type important for dom() and kind of element, and many other
	 * @param {string} name (f.e. Storage)
	 * @param {number} [ix] (f.e. Storage)
	 */
	constructor(props,name,ix) {
		/** as needed for Storage */
		this.name = name

		/** if needed in arrays */
		this.ix = ix

		const fallbackVal = props.is?props.is:(props.type==='int'||props.type==='float')?0:''

		const val = Store.get(Ids.combineId(this.name,this.ix),fallbackVal)

		/** stores actual value in val, and has capabilities for other vars bounded to this */
		this.model = new Model({val})

		this.props = Obj.copy(props)

		Obj.assure(this.props,'atts',{}) // needed for min,max check etc.
	}
	get val() { return this.model.get('val') }
	/**
	 * creates Html (may be included in additional element) for InputVar and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} parentHtml Html to attach to
	 * @param {object} propsAdd properties to add to element, only for this html, dont change this
	 * @returns {Html} Html of input or other element connected
	 */
	dom(parentHtml,propsAdd) {
		// prepare html arg
		const props = Html.mergeDatas(this.props,propsAdd)

		// const arg = Obj.omit(props,['label','min','max','type','change','is'])
		const arg = Obj.filter(props,Html.ARGS)
		let myHtml = null

		// create html according to type
		if (props.type==='evt') {
			myHtml = parentHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
		} else if (props.type==='int'||props.type==='float'|| props.type==='text') {
			const type = (props.type==='int'||props.type==='float')?'number':'text'
			const argType = {html:'input',atts:{type:type},val:this.model.get('val')}
			if (!props.label) {
				myHtml = parentHtml.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered'}))
			} else {
				const join = parentHtml.add({html:'div',css:'flex items-center'})
				join.add({html:'button',css:'btn w-24 text-right pr-4',val:props.label})
				myHtml = join.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered w-24'}))
			}
		}

		// attach events
		switch (props.type) {
		case 'evt': myHtml.append({evts:{'click':this.onChange.bind(this)}}); break
		default: myHtml.append({evts:{'change':this.onChange.bind(this)}}); break
		}
		/** the generated Html attached here */
		this.html = myHtml
		return myHtml
	}
	/**
	 * sets the properties of the input variable
	 * @param {object} props - properties to set
	 */
	setProps(props) {
		/** merges this properties with the current properties */
		Html.mergeModDatas(this.props,props)

		/** filters the properties that are used for the html element */
		const arg = Obj.filter(this.props,Html.ARGS)

		/** changes the html element with the filtered properties */
		this.html.change(arg)
		this.onChange() // may change value, min, or max, etc.
	}
	onChange() {
		let val = this.html.el.value
		console.log('onChange:',this.name,this.ix,val)
		if (this.props.type==='int'||this.props.type==='float') {
			if (this.props.type==='int') val = Number.parseInt(val)
			if (this.props.type==='float') val = Number.parseFloat(val)
			const valBound = Numbers.bound(val,this.props.atts.min,this.props.atts.max)
			if (val!==valBound) this.html.el.value = valBound
			val = valBound
		}
		this.model.set('val',val)
		Store.set(Ids.combineId(this.name,this.ix),val)
	}
}
export default InputVar