import Arr from '../../logic/Arr/Arr'
import Obj from '../../logic/Obj/Obj'
import InputVar from './InputVar'

/**
 * represents multiple variables, stacked in an array
 * @class InputVarsArr
 */
class InputVarsArr {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {object} arg - object with variable names as keys and variable objects as values
 */
	constructor(arg) {
		this.varsName = Arr.copy(Object.keys(arg))
		this.varsName.forEach(varName => {
			this[varName] = [] // todo new InputVar(arg[key])
		})
		this.argCreate = Obj.copy(arg)
	}
	get len() {
		return this.size
	}
	set len(len) {
		this.varsName.forEach(varName => {
			while (this[varName].length > len) { this[varName].pop() }
			while (this[varName].length < len) { this[varName].push(new InputVar(this.argCreate[varName],varName,this[varName].length)) }
		})
		this.size = len
	}
}
export default InputVarsArr