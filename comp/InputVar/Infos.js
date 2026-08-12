import Ids from '../../../logic/Ids/Ids'
import Model from '../../../logic/Model/Model'
import Store from '../../../logic/Store'

class Infos {
	/**
	 * @class Infos handles multiple infos
	 *
	 * might watch infos with .onAll()
	 *
	 * disabled will not be handled at .onAll() and .store()
	 * @param {string[]} keys keys for storage
	 * @param {object} infos describes infos for InputInfo
	 */
	constructor(keys,infos) {
		this.keys = keys
		this.storageId = Ids.combineId(this.keys)
		this.infos = infos
		Object.keys(this.infos).forEach(key => this.infos[key].model = new Model())
	}
	/**
	 * shortcut for default value, cautions as model may contain more than this 1 value
	 * Returns the value of the given model key for the given key, or the default value if the model key is not specified.
	 * @param {string} key - The key for which to retrieve the value.
	 * @param {string} [modelKey] - The model key for which to retrieve the value. If not specified, the default value for the given key will be returned.
	 * @returns {any} The value of the given model key for the given key, or the default value if the model key is not specified.
	 */
	get(key,modelKey) {
		if (modelKey===undefined) return this.infos[key].model.get('is')
		return this.infos[key].model.get(modelKey)
	}
	/**
	 * Returns all the values of the given info
	 * @param {string} key - The key for which to retrieve the values.
	 * @returns {any} The values of the given info
	 */
	getAll(key) {
		return this.infos[key].model.getAll()
	}
	/**
	 * set value, only when model is available
	 * @param key
	 * @param val
	 * @returns {boolean} true if model is available
	 */
	set(key,val) {
		return this.infos[key] && this.infos[key].model.set(val,'is')
	}
	/**
	 * set multiple values of one keyed info, only when info is available, and val is not invalid
	 * @param {string} key - the key of the info
	 * @param {any} val - the value to set
	 * @returns {boolean} true if model is available
	 */
	setAll(key,val) {
		return this.infos[key] && val && this.infos[key].model.setAll(val)
	}
	/**
	 * listens to a dataKey for all infos
	 * @param {string} dataKey - the key of the data to listen to
	 * @param {Function} callback - the function to call when the data changes
	 */
	on(dataKey,callback) {
		Object.keys(this.infos).forEach(key => this.infos[key].model.on(dataKey,callback))
	}
	/**
	 * onAll listens to all model changes, if not .disabled
	 * @param {Function} callback - the function to call when a model changes
	 */
	onAll(callback) {
		Object.keys(this.infos).forEach(key => {
			if (!this.infos[key].disabled===true) this.infos[key].model.onAll(callback) // dont listen to disabled inputs
		})
	}
	/**
	 * stores the current state of the infos in the storage, if not disabled
	 */
	store() {
		Object.keys(this.infos).forEach(key => {
			if (!this.infos[key].disabled===false) Store.set([this.storageId,key],this.getAll(key))})
	}
	/**
	 * loads the stored data from the storage, if you use model.reset() you may set the model first to have valid init values
	 */
	load() {
		Object.keys(this.infos).forEach(key => this.setAll(key,Store.get([this.storageId,key])))
	}
}
export default Infos
