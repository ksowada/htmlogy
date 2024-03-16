import Button from '../Button/Button.js'
import Html from '../../Html/Html.js'
import HtmlComp from '../../HtmlComp/HtmlComp.js'
import List from '../List/List.js'
/**
 * @class
 * @augments HtmlComp
 */
// TODO replace with List
class Toolbar extends HtmlComp {
	constructor() {
		super(Html.mergeDatas.apply(null,arguments))
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		const valsObj = {}
		Object.keys(this.items).forEach(key => {
			valsObj[key] = new Button(this.items[key])
		})
		this.list = new List({parent:this.parent,container:{css:'btns'},inner:{valsObj:valsObj}})
	}
	update() {
		// super.update(Html.mergeDatas.apply(null,arguments))
		const items = Html.mergeDatas.apply(null,arguments)
		// this.items = Html.mergeDatas(this.items,items)
		this.list.update(items)
	}
}
export default Toolbar