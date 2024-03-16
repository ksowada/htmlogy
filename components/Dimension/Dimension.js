import Combo from '../Combo/Combo.js'
import Store from '../../logic/Store.js'
import HtmlElComp from '../../html/HtmlComp/HtmlElComp.js'
import Html from '../../html/html/Html/Html.js'
/**
 * @class a Combo with implemented Store-interface
 * @augments HtmlElComp
 */
// TODO rename handle* to _*
// TODO extend Combo, seems possible
class Dimension extends HtmlElComp {
	/**
	 * @param {object} arg see also here {@link Html~createarg}
	 * @param {HTMLElement} arg.el to attach
	 * @param {string} arg.id id for Store, will use ids also as list
	 * @param {string} arg.label some man readible description
	 * @param {Function} arg.selection fired when selection
	 * @param {Function} arg.list fired when list changed
	 * @param {Function} arg.delete fired when deletion
	 * @param {Function} arg.rename fired when renaming
	 */
	constructor(arg) {
		super(arg)
		if (!this.id) console.info('no id given')
		this.ids = this.id+'s'
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		const selRow = Store.get(this.id)
		const selRows = Store.get(this.ids)
		const btnTree = {icon:'fa-solid fa-tree',title:'open Hierarchy',evts:{click:this.handleTreeClick.bind(this)}}
		this.select = new Combo({parent:{obj:this.containerObj},selection:this.handleSelect.bind(this),list:this.handleList.bind(this),delete:this.handleDelete.bind(this),rename:this.handleRename.bind(this),rows:selRows,row:selRow,idEn:true,placeholder:this.label,extraBtns:{btnTree:btnTree}})
	}
	getSelected() {
		return this.select.getSelected()
	}
	handleTreeClick() {
		console.log('handleTreeClick')
	}
	handleSelect(item) {
		console.log('handleSelect item:'+item)
		Store.set('prj',item)
		if (this.selection) this.selection(item)
	}
	handleList(items) {
		console.log('handleList items:'+items)
		Store.set('prjs',items)
		if (this.list) this.list(items)
	}
	handleDelete(item) {
		console.log('handleDelete item:'+item)
		if (this.delete) this.delete(item)
	}
	handleRename(item) {
		console.log('handleDelete item:'+item)
		// TODO if (this.rename) this.rename(itemOld, item)
	}
}
export default Dimension