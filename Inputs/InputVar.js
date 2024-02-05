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
class InputVar extends Html {
	/**
	 * generate a Html appropriate to var type
	 * auto-load
	 * @param {object} arg parameter for variable
	 * @param {number} arg.min minimum value for variable
	 * @param {number} arg.max maximum value for variable
	 * @param {Function} arg.change event when variable changes, from user or program
	 * @param {string} arg.label label for input, or button, (distinct from val, which is the val of this)
	 * @param {string} name (f.e. Storage)
	 */
	constructor(arg,name) {
		const val = Store.get(name,arg.is)
		// let argOfNew = Html.mergeDatas(arg,{val})
		let argOfType = {}
		switch (arg.type) {
		case 'evt': argOfType = {html:'button',val:arg.label}; break
		}
		let argOfNew = Html.mergeDatas(arg,{val},argOfType)
		argOfNew = Obj.omit(argOfNew,['label','min','max','type','change'])

		super(argOfNew)

		// changes of this now allowed
		switch (arg.type) {
		case 'evt': this.append({evts:{'click':this.onChange.bind(this)}}); break
		default: this.append({evts:{'input':this.onChange.bind(this)}})
		}

		/** name of var */
		this.name = name

		/** creation arg */
		this.argNew = Obj.copy(argOfNew)

		this.change = arg.change
	}
	onChange() {
		const val = this.my.el.value
		Store.set(this.name,this.initial)
		this.val = val
		if (this.change) this.change() // call outer event handler
	}
	load() {
		const val = Store.get(this.name,this.argNew.is)
		this.val = val
		return val
	}
}
export default InputVar