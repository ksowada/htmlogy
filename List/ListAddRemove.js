import Str from '../../logic/Str/Str.js'
import Button from '../Button/Button.js'
import Html from '../../htmlogy/Html/Html.js'
import HtmlElComp from '../../htmlogy/HtmlComp/HtmlElComp.js'
import List from './List.js'
import './ListAddRemove.scss'
/**
 * dynamic Container for Lists
 * - builds Html for each item
 * - you may strip container
 * - items may be Object with data for Html, or explicit HtmlComp (el and attach will be created here)
 * @class
 * @augments HtmlElComp
 */
class ListAddRemove extends HtmlElComp {
	/**
	 * @param {object} arg multiple carries properties
	 * @param {object} arg.inner additional info for item-html
	 * @param {object} arg.inner.select if missing no selection
	 * @param {object[]|HtmlComp[]} arg.inner.vals items, these HtmlComp shall implement this.div
	 * @param {object} arg.inner.valsObj items with name as key, for use when single update is essential, better to address as with index
	 * @param {number} arg.inner.select.ix optional selected index
	 * @param {string} arg.inner.select.mode supported modes: ['none'],'single','singleForce','multi'
	 * - mode: singleForce: select always one, if ix not given will select first, if given vals
	 */
	// TODO extends List to ease handling
	constructor(arg) {
		super(arg)
		this.toolbarItems = {
			'create':new Button({css:'btn btn-primary active',icon:'fa-solid fa-plus',title:'create item',clickCbk:this.hdl_add.bind(this)}),
		}
		if (this.inner.select!==undefined && this.inner.select.mode!==undefined && this.inner.select.mode!=='none') { // push changing btns only when selection enabled
			this.toolbarItems['rename'] = new Button({css:'btn btn-primary',icon:'fa-solid fa-pen',title:'edit item',clickCbk:this.hdl_edit.bind(this)})
			this.toolbarItems['remove'] = new Button({css:'btn btn-primary',icon:'fa-solid fa-xmark',title:'remove item',clickCbk:this.hdl_del.bind(this)})
		}
		this.fruits = '🍏🍎🍐🍊🍋🍌🍉🍇🫐🍓🍈🍒🍑🥭🍍🥥🥝🍅🥑🥒'
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		Html.mergeModDatas(this,Html.mergeDatas.apply(null,arguments))
		super.domCreate(this,{container:{css:'frame'}})
		// remove container and heading for following containers in dom
		this.container = {}
		this.heading = {}
		const div = new Html({parent:{obj:this.containerObj},css:'tags-bar'})
		this.btns = new List({parent:{obj:div},container:{css:'btns'},inner:{valsObj:this.toolbarItems}})
		this.list = new List({parent:{obj:div},container:{css:'tags'},inner:{...this.inner,css:'tag',valhtml:'div'},heading:undefined})
		this.list.selection = () => {
			const sel = this.list.getSelecteds()
			this.btns.update({inner:{valsObj:{
				create:{disabled : false},
				remove:{disabled : (sel.length==0)},
				rename:{disabled : (sel.length!==1)},
			}}})
		}
		this.list.selection()
	}
	hdl_add() {
		this.list.add(Str.pickCharRandom(this.fruits))
	}
	hdl_del() {
		this.list.removeSelections()
	}
	hdl_edit() {
		this.list.edit(Str.pickCharRandom(this.fruits))
	}
}
export default ListAddRemove