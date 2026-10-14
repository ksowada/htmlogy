import Html from '../../Html/Html'

export default class ButtonSwitch extends Html {

	constructor(args,vals,callback) {
		const arg = Html.mergeDatas({html:'button',val:vals[0]},args)
		super(arg)
		this.append({evts:{click:this.buttonEvt.bind(this)}})
		this.val = vals[0]
		this.vals = vals
		this.callback = callback
	}
	buttonEvt() {
		console.log('ButtonSwitch.buttonEvt')
		let ixIsState = this.vals.indexOf(this.val)
		if (++ixIsState >= this.vals.length) {
			ixIsState = 0
		}
		this.val = this.vals[ixIsState]
		this.change({val:this.val})
		if (this.callback) this.callback()
	}
}