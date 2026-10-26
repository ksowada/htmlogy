import Arr from '../../../logic/Arr/Arr'
import Html from '../../Html/Html'

/**
 * @class
 * ButtonSwitch is a regular Button that switch content when clicked
 */
export default class ButtonSwitch extends Html {

	#callback
	#ixEn
	#callOnlyAtClick

	/**
	 * create a Button with value change by click
	 * @param {object} args Html args
	 * @param {string[]} vals values to switch through
	 * @param {object} options additonal options
	 * @param {string} [options.icon] contains the src of img
	 * @param {boolean} [options.ixEn=false] controls optional ix
	 * @param {boolean} [callOnlyAtClick=false] when given true it calls callvack not at set and constructor with vals
	 * @param {Function} callback is called with parameters(val, ix); callback is called at constructor
	 */
	constructor(args,vals,options={},callOnlyAtClick=false,callback) {
		let val = vals?vals[0]:''
		const ixEn = options.ixEn ? options.ixEn : false
		val = val + (ixEn?` (0)`:'')
		const arg = Html.mergeDatas({html:'button',val},args)

		super(arg)

		const icon = options.icon
		this.#ixEn = ixEn
		this.#callOnlyAtClick = callOnlyAtClick

		this.append({evts:{click:this.#buttonEvt.bind(this)}})

		/** {number} index of selected entry */
		this.index = 0

		/** {string} values to switch through */
		this.vals = vals

		/** {string} value of selected entry */
		this.val = val

		if (icon) this.add({html:'img',css:'icon',atts:{src:icon}})

		this.#callback = callback
		if (!this.#callOnlyAtClick && this.#callback && vals) queueMicrotask(() => {
			this.#callback(this.val,this.index)
		})
	}
	/**
	 * sets vals, choose 1st index and render it
	 * @param {string[]} vals values to switch through
	 */
	setVals(vals) {
		if (Arr.equals(vals,this.vals)) return
		this.vals = vals
		this.index = 0
		this.val = this.vals[this.index]
		const val = this.val + (this.#ixEn?` (${this.index})`:'')
		this.change({val})
		if (!this.#callOnlyAtClick && this.#callback) this.#callback(this.val,this.index)
	}
	#buttonEvt() {
		let ixIsState = this.vals.indexOf(this.val)
		if (++ixIsState >= this.vals.length) {
			ixIsState = 0
		}
		this.index = ixIsState
		this.val = this.vals[this.index]
		const val = this.val + (this.#ixEn?` (${this.index})`:'')
		this.change({val})
		if (this.#callback) this.#callback(this.val,this.index)
	}
}