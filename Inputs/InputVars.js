import Arr from "../../logic/Arr/Arr"
import Obj from "../../logic/Obj/Obj"
import InputVar from "./InputVar"

/**
 * represents multiple variables
 * @class InputVars
 */
class InputVars {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {Object} arg - object with variable names as keys and variable objects as values
 */
	constructor(arg) {
		Object.keys(arg).forEach(key => {
			this[key] = new InputVar(arg[key])
		})
		this.varsName = Arr.copy(Object.keys(arg))
	}
  /**
   * loads the variables and returns them as an array
   * @returns {Array} - the loaded variables
   */
	load() {
		const loaded = []
		this.varsName.forEach(varName => {
			loaded.push(this[varName].load())
		})
		return loaded
	}
}
export default InputVars