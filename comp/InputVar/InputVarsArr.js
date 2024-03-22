import Listener from '../../../logic/Listener/Listener'
import Match from '../../../logic/Match'
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
	 * @param {ArrObj} struct structure with id and other properties may be hierarchical 
	 * - .kind determines the kind @see {@link InputVar}, or use the class name of an implementated class @see {@link InputVars#getInstance}
	 * - .arg is parameter if other Class shall be instantiated
	 */
	constructor(id,struct) {
		super()
		this.id = id
		/**
		 * contains all variables
		 * @type {Object.<string, object>}
		 */
		this.vars = {}

		/**
		 * contains all variables, in structured object
		 * @type any
		 */
		this.varsStruct = {}

		/**
		 * contains all props of each object
		 * @type any
		 */
		this.argCreate = {}

		this.varsName = []
		Obj.crawl(struct,{
			onObj: obj => {
				if (obj.kind) {
					const varName = obj._id
					this.varsName.push(varName)
					this.vars[varName] = []
					this.argCreate[varName] = obj
				}
			}
		})
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
				this.vars[varName].push(InputVars.getInstance(this.argCreate[varName].kind,Obj.omit(this.argCreate[varName],Match.startsWith('_')),[this.id,varName,this.vars[varName].length]))
				Obj.put(this.varsStruct,this.argCreate[varName]._ids,this.vars[varName][this.vars[varName].length - 1])
				this.vars[varName][this.vars[varName].length - 1].on(Model.DEFAULT_KEY,this.onChange.bind(this,varName,this.vars[varName].length - 1))
			}
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
	 * mount a row of all variables into dom, if a variable has dom() function
	 * @param {Html} html parent Html to mount 1 row of all variables
	 * @param [number} ix index of row
	 */
	dom(html,ix) {
		this.varsName.forEach(varName => {
			if (this.vars[varName][ix].dom) this.vars[varName][ix].dom(html) // some InputVars may have no dom as HtmlSelect
		})
	}
}
export default InputVarsArr