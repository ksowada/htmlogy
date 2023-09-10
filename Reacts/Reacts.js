import {flatten} from 'lodash-es'
import Ids from '../../Ids'
import Obj from '../../Obj/Obj'

/**
 * @class
 * to generate a map of elements gnerated by hierarchic id
 */
class Reacts {
	constructor(name) {
		this.name = name
		this.ids = {}
		this.els = {}
	}
	/**
	 * generate id and save hierarchically
	 * @param {...string|...number} keys set of keys to generate hierarchy
	 * @returns {string} generated id
	 */
	id(...keys) {
		const keysFlat = flatten([this.name,keys])
		const id = Ids.combineId(keysFlat)
		Obj.put(this.ids,keysFlat,id)
		return id
	}
	/**
	 * search document for elements
	 * @returns {object} hierarchy of DOM-elements, according to key-hierarchy given at id generation
	 */
	el() {
		Obj.mapFunc(this.ids,this.els,id => document.getElementById(id))
		return this.els
	}
	get(...keys) {
		const keysFlat = flatten([this.name,keys])
		return Obj.get(this.els,keysFlat)
	}
}
export default Reacts