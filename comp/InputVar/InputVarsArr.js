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
		/**
		 * contains all variables
		 * @type {Object.<string, object>}
		 */
		this.vars = {}
		this.varsName = Arr.copy(Object.keys(arg))
		this.varsName.forEach(varName => {
			this.vars[varName] = []
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
			while (this.vars[varName].length > len) { this.vars[varName].pop() }
			while (this.vars[varName].length < len) {
				this.vars[varName].push(InputVars.getInstance(this.argCreate[varName].kind,this.argCreate[varName],[this.id,varName,this.vars[varName].length]))
				this.vars[varName][this.vars[varName].length-1].on(Model.DEFAULT_KEY,this.onChange.bind(this,varName,this.vars[varName].length-1))}
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
	/**
	 * 
	 * @param {Html} html parent Html to mount 1 row of all variables
	 */
	dom(html,ix) {
		Object.keys(this.vars).forEach(varName => {
			this.vars[varName][ix].dom(html)
		})
	}
}
export default InputVarsArr