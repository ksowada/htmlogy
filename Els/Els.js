import {flattenDeep} from 'lodash-es'
import Ids from '../../logic/Ids/Ids'
import Obj from '../../logic/Obj/Obj'

/**
 * @class
 * to generate a map of DOM-elements generated by hierarchic id
 * a unique name is given at construction and completed at the generating id() method and the get() method
 */
class Els {
	/**
	 * @param {string} name a unique name for separating the generated ids from other objects and element
	 * @param {...string|...number} subKeys set of keys to generate further hierarchy
	 */
	constructor(name,subKeys) {
		this.name = name
		this.subKeys = (subKeys!==undefined)?subKeys:[]
		this.ids = {}
		this.els = {}
	}
	/**
	 * create a sub-instance with the given name and given further keys
	 * @param {...string|...number} keys set of keys to generate hierarchy
	 * @returns {Els} a new Els instance with the given keys concatenated to the current instance's keys
	 */
	sub(...keys) {
		return new Els(this.name,this.subKeys.concat(flattenDeep(keys)))
	}
	/**
	 * generate id and save hierarchically
	 * @param {...string|...number} keys set of keys to generate hierarchy
	 * @returns {string} generated id
	 */
	id(...keys) {
		const keysFlat = flattenDeep([this.name,this.subKeys,keys])
		const id = Ids.combineId(keysFlat)
		Obj.put(this.ids,keysFlat,id)
		return id
	}
	/**
	 * search document for elements, all requested ids will be searched and then you may access them via get() method, .els directly
	 * @returns {object} hierarchy of DOM-elements, according to key-hierarchy given at id generation
	 */
	el() {
		Obj.mapFunc(this.ids,this.els,id => document.getElementById(id))
		return this.els
	}
	/**
	 * get DOM-element in respect to the given object name, to abbreviate call
	 * @param {...string|...number} keys set of keys to generate hierarchy
	 * @returns {HTMLElement} the DOM-Element
	 */
	get(...keys) {
		const keysFlat = flattenDeep([this.name,this.subKeys,keys])
		return Obj.get(this.els,keysFlat)
	}
}
export default Els