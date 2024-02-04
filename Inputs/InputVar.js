import Obj from "../../logic/Obj/Obj"
import Store from "../../logic/Store"
import Html from "../../logic/html/Html/Html"

/**
 * represents a variable 
 * - Storage (with initial,load,save)
 * 
 */
class InputVar extends Html {
	constructor(arg,name,initial) {
		const val = Store.get(name,initial)
		const argNew = Html.mergeDatas(arg,{val})
    super(argNew)
		this.append({evts:{'input':this.onChange.bind(this)}})
		this.name = name
		this.argNew = Obj.copy(arg)
		this.initial = initial
	}
	onChange() {
		const val = this.my.el.value
		Store.set(this.name,this.initial)
		this.val = val
	}

}
export default InputVar