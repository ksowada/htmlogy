import Arr from '../../../logic/Arr/Arr'
import Listener from '../../../logic/Listener/Listener'
import Model from '../../../logic/Model/Model'
import Obj from '../../../logic/Obj/Obj'
import InputVars from './InputVars'

/**
 * represents multiple variables, stacked in an array
 * @class InputVarsArr
 * @augments Listener for easy adaption of multiple listeners for all items in array
 */
class InputVarsArr extends Listener {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {string} id - unique identifier for Storage, to store more than one App in 1 domain
 * @param {object[]} arg - object with variable names as keys and variable objects as values
 * - .kind determines the kind @see {@link InputVar}, or use the class name of an implementated class @see {@link InputVars#getInstance}
 * - .arg is parameter if other Class shall be instantiated
 */
	constructor(id,arg) {
		super()
		this.id = id
		this.varsName = Arr.copy(Object.keys(arg))
		this.varsName.forEach(varName => {
			this[varName] = []
		})
		this.argCreate = Obj.copy(arg)
	}
	/**
	 * length of array of every InputVar
	 * @returns {number} length of array
	 */
	get len() {
		return this.size
	}
	/**
	 * determines length of array of every InputVar
	 * @param {number} len length of array
	 */
	set len(len) {
		this.varsName.forEach(varName => {
			while (this[varName].length > len) { this[varName].pop() }
			while (this[varName].length < len) {
				this[varName].push(InputVars.getInstance(this.argCreate[varName].kind,this.argCreate[varName],[this.id,varName,this[varName].length]))
				this[varName][this[varName].length-1].on(Model.DEFAULT_KEY,this.onChange.bind(this,varName,this[varName].length))}
		})
		this.size = len
	}
	/**
	 * This function is called whenever the value of a variable in the InputVarsArr changes.
	 * @param {string} varName - the name of the variable that changed
	 * @param {number} ix - the index of the variable in the InputVarsArr
	 */
	onChange(varName,ix) {
		this.changed(Model.DEFAULT_KEY)
	}
}
export default InputVarsArr