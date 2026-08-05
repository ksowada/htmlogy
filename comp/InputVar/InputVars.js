// @ts-ignore
import InputInfo from './InputInfo'
import HtmlSelect from '../../HtmlSelect/HtmlSelect'
import Tags from '../Tags/Tags'
import Arr from '../../../logic/Arr/Arr'

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
		/** 
		 * contains every variable 
		 * @type {Object.<string, InputInfo_props>}
		 * */
		this.vars = {}
		Object.keys(arg).forEach(varName => {
			this[varName] = this.vars[varName] = InputVars.getInstance(arg[varName].kind,arg[varName],[id,varName]) // TODO as issue with typescript,. vars is the right way, this only appreviation, or mark this.members with _
		})
		this.varsName = Arr.copy(Object.keys(arg))
	}
	/**
	 * shortcut for default value, cautions as model may contain more than this 1 value
	 * Returns the value of the given model key for the given key, or the default value if the model key is not specified.
	 * @param {string} key - The key for which to retrieve the value.
	 * @param {string} [modelKey] - The model key for which to retrieve the value. If not specified, the default value for the given key will be returned.
	 * @returns {any} The value of the given model key for the given key, or the default value if the model key is not specified.
	 */
	get(key,modelKey) {
		if (modelKey===undefined) return this.vars[key].val
		return this.vars[key].get(modelKey)
	}
	/**
	 * Returns all the values of the given info
	 * @param {string} key - The key for which to retrieve the values.
	 * @returns {any} The values of the given info
	 */
	getAll(key) {
		return this.vars[key].getAll()
	}
	/**
	 * set value, only when model is available
	 * @param {string} key - The key for which to retrieve the values.
	 * @param {string} key - The key for which to retrieve the values.
	 * @param val
	 * @param modelKey
	 * @returns {boolean} true if model is available
	 */
	set(key,val,modelKey) {
		if (modelKey===undefined) return this.vars[key] && this.vars[key].set(val)
		return this.vars[key] && this.vars[key].vars[modelKey].set(val)
	}
	/**
	 * set multiple values of one keyed info, only when info is available, and val is not invalid
	 * @param {string} key - the key of the info
	 * @param {any} val - the value to set
	 * @returns {boolean} true if model is available
	 */
	setAll(key,val) {
		return this.vars[key] && val && this.vars[key].setAll(val)
	}
	/** 
	 * change or set general properties of all variables
	 * @param {object} props properties
	 */
	setProps(props) {
		/** additional properties */
		this.propsAdd = props
		Object.keys(this.vars).forEach(key => this.vars[key].change(this.propsAdd))
	}
	/**
	 * listens to a dataKey for all infos
	 * @param {string} dataKey - the key of the data to listen to
	 * @param {Function} callback - the function to call when the data changes
	 */
	on(dataKey,callback) {
		Object.keys(this.vars).forEach(key => this.vars[key].on(dataKey,callback))
	}
	/**
	 * onAll listens to all model changes, if not .disabled
	 * @param {Function} callback - the function to call when a model changes
	 */
	onAll(callback) {
		Object.keys(this.vars).forEach(key => {
			if (!this.vars[key].disabled===true) this.vars[key].onAll(callback) // dont listen to disabled inputs
		})
	}
	// /**
	//  * stores the current state of the infos in the storage, if not disabled
	//  */
	// store() {
	// 	Object.keys(this.vars).forEach(key => {
	// 		if (!this.vars[key].disabled===false) Store.set([this.storageId,key],this.getAll(key))})
	// }
	// /**
	//  * loads the stored data from the storage, if you use reset() you may set the model first to have valid init values
	//  */
	// load() {
	// 	Object.keys(this.vars).forEach(key => this.setAll(key,Store.get([this.storageId,key])))
	// }
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
		case 'Tags':
			return new Tags(arg,names)
		}
		return new InputInfo(arg,names)
	}
	static propsMerge(...props) {
		// TODO Obj.mergeJoin planned
	}
}
export default InputVars