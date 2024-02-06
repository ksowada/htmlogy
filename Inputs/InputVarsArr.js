import Arr from '../../logic/Arr/Arr'
import Listener from '../../logic/Listener/Listener'
import Obj from '../../logic/Obj/Obj'
import InputVar from './InputVar'

/**
 * represents multiple variables, stacked in an array
 * @class InputVarsArr
 * @augments Listener for easy adaption of multiple listeners for all items in array
 */
class InputVarsArr extends Listener {
/**
 * initialize all variables and set name gathered from keys for further purposes (f.e. Store)
 * @param {object} arg - object with variable names as keys and variable objects as values
 */
	constructor(arg) {
		super()
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
			while (this[varName].length < len) {
				this[varName].push(new InputVar(this.argCreate[varName],varName,this[varName].length)) }
			this[varName][this[varName].length-1].model.on('val',this.onChange.bind(this,varName,this[varName].length))
		})
		this.size = len
	}
	/**
	 * This function is called whenever the value of a variable in the InputVarsArr changes.
	 * @param {string} varName - the name of the variable that changed
	 * @param {number} ix - the index of the variable in the InputVarsArr
	 */
	onChange(varName,ix) {
		console.log('onChange',varName,ix)
		this.changed('val')
	}
}
export default InputVarsArr