import Arr from '../../logic/Arr/Arr'
import InputVar from './InputVar'

/**
 * represents multiple variables
 * @class InputVars
 */
class InputVars {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {object} arg - object with variable names as keys and variable objects as values
 */
	constructor(arg) {
		Object.keys(arg).forEach(key => {
			this[key] = new InputVar(arg[key],key)
		})
		this.varsName = Arr.copy(Object.keys(arg))
	}
}
export default InputVars