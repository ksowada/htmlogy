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
	 */
	constructor(args,vals,callback) {
		const arg = Html.mergeDatas({html:'button',val:vals[0]},args)
		super(arg)
		this.append({evts:{click:this.#buttonEvt.bind(this)}})

		/** {number} index of selected entry */
		this.index = 0

		/** {string} value of selected entry */
		this.val = vals[this.index]
		this.vals = vals
		this.#callback = callback
		if (this.#callback) queueMicrotask(() => {
			this.#callback(this.val,this.index)
		})
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