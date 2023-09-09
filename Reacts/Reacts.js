import {Ids} from '../../Ids'
import Obj from '../../Obj/Obj'

/**
 * @class
 * to generate a map of elements gnerated by hierarchic id
 */
class Reacts {
	static ids = {}
	static els = {}
	/**
	 * generate id and save hierarchically
	 * @param {...string|...number} keys set of keys to generate hierarchy
	 * @returns {string} generated id
	 */
	static id(keys) {
		const id = Ids.combineId(keys)
		Obj.put(this.ids,keys,id)
		return id
	}
	/**
	 * search document for elements
	 * @returns {object} hierarchy of DOM-elements, according to key-hierarchy given at id generation
	 */
	static el() {
		Obj.mapFunc(this.ids,this.els,id => document.getElementById(id))
		return this.els
	}
}
export default Reacts