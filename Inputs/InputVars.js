import Arr from '../../logic/Arr/Arr'
import HtmlSelect from '../../logic/html/HtmlSelect/HtmlSelect'
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
		Object.keys(arg).forEach(varName => {
			this[varName] = InputVars.getInstance(arg[varName].kind,arg[varName],[id,varName])
		})
		this.varsName = Arr.copy(Object.keys(arg))
	}
	/**
	 * Returns an instance of the specified class based on the given arguments.
	 *
	 * - .kind is also in argument to any constructor
	 * @param {string} className - The name of the class to instantiate.
	 * @param {object} arg - The arguments to pass to the class constructor.
	 * @param {Array} names - names to identify the instance
	 * @returns {object} The instantiated class instance.
	 */
	static getInstance(className,arg,names) {
		switch (className) {
		case 'HtmlSelect':
			return new HtmlSelect(arg,names)
		}
		return new InputVar(arg,names)
	}
}
export default InputVars