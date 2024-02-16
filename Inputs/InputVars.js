import Arr from '../../logic/Arr/Arr'
import InputVar from './InputVar'

/**
 * represents multiple variables
 * @class InputVars
 */
class InputVars {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {string} id unique identifier for Storage, to store more than one App in 1 domain
 * @param {object} arg object with variable names as keys and variable objects as values
 */
	constructor(id,arg) {
		Object.keys(arg).forEach(key => {
			this[key] = new InputVar(id,arg[key],key)
		})
		this.varsName = Arr.copy(Object.keys(arg))
	}
}
export default InputVars