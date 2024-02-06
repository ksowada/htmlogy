import Ids from '../../logic/Ids'
import Model from '../../logic/Model/Model'
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
	 * @param {number} props.min minimum value for variable
	 * @param {number} props.max maximum value for variable
	 * @param {string} props.label label for input, or button, (distinct from val, which is the val of this)
	 * @param {string} props.placeholder embedded placeholder in input
	 * @param {string} name (f.e. Storage)
	 * @param {number} [ix] (f.e. Storage)
	 */
	constructor(props,name, ix) {
		this.name = name
		this.ix = ix
		const val = Store.get(Ids.combineId(this.name, this.ix),props.is)

		/** stores actual value in val, and has capabilities for other vars bounded to this */
		this.model = new Model({val})

		this.props = Obj.copy(props)
	}
	get val() { return this.model.get('val') }
	/**
	 * creates Html (may be included in additional element) for InputVar and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} parentHtml Html to attach to
	 * @param {object} propsAdd properties to add to element, only for this html
	 * @returns {Html} Html of input or other element connected
	 */
	html(parentHtml,propsAdd) {
		// prepare html arg
		const props = Html.mergeDatas(this.props,propsAdd)
		const arg = Obj.omit(props,['label','min','max','type','change'])
		let myHtml = null

		// create html according to type
		if (props.type==='evt') {
			myHtml = parentHtml.add(Html.mergeDatas(arg,{html:'button',val:props.label}))
		} else if (props.type==='number'|| props.type==='text') {
			const argType = {html:'input',atts:{type:props.type,min:props.min,max:props.max,val:this.model.get('val'),'placeholder':props.placeholder}}
			if (!props.label) {
				myHtml = parentHtml.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered'}))
			} else {
				const join = parentHtml.add({html:'div',css:'flex items-center '})
				join.add({html:'button',css:'btn w-24 text-right pr-4',val:props.label})
				myHtml = join.add(Html.mergeDatas(arg,argType,{html:'input',css:'input input-bordered w-24'}))
			}
		}

		// attach events
		switch (props.type) {
		case 'evt': myHtml.append({evts:{'click':this.onChange.bind(this)}}); break
		default: myHtml.append({evts:{'input':this.onChange.bind(this)}}); break
		}
		/** the generated Html attached here */
		this.html = myHtml
		return myHtml
	}
	onChange() {
		const val = this.html.el.value
		this.model.set('val',val)
		Store.set(Ids.combineId(this.name, this.ix),val)
	}
}
export default InputVar