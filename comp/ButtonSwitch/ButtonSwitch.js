import Html from '../../Html/Html'

/**
 * @class
 * ButtonSwitch is a regular Button that switch content when clicked
 */
export default class ButtonSwitch extends Html {

	#callback

	/**
	 * create a Button with value change by click
	 * @param {object} args Html args
	 * @param {string[]} vals values to switch through
	 * @param {Function} callback is called with parameters(val, ix); callback is called at constructor
	 * @param {string} [logo] contains the src of img
	 */
	constructor(args,vals,logo,callback) {
		const val = vals?vals[0]:''
		const arg = Html.mergeDatas({html:'button',val},args)
		super(arg)
		this.append({evts:{click:this.#buttonEvt.bind(this)}})

		/** {number} index of selected entry */
		this.index = 0

		/** {string} values to switch through */
		this.vals = vals

		/** {string} value of selected entry */
		this.val = val

		if (logo) this.add({html:'img',css:'icon',atts:{src:logo}})

		this.#callback = callback
		if (this.#callback && vals) queueMicrotask(() => {
			this.#callback(this.val,this.index)
		})
	}
	/**
	 * sets vals, choose 1st index and render it	 
	 * @param {string[]} vals values to switch through
	 */
	setVals(vals) {
		this.vals = vals
		this.index = 0
		this.val = this.vals[this.index]
		this.change({val:this.val})
		if (this.#callback) this.#callback(this.val,this.index)
	}
	#buttonEvt() {
		let ixIsState = this.vals.indexOf(this.val)
		if (++ixIsState >= this.vals.length) {
			ixIsState = 0
		}
		this.index = ixIsState
		this.val = this.vals[this.index]
		this.change({val:this.val})
		if (this.#callback) this.#callback(this.val,this.index)
	}
}