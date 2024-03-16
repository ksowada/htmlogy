import Html from '../../htmlogy/Html/Html'
import './Combo.scss'
import Modal from '../Modal/Modal.js'
import Toolbar from '../Toolbar/Toolbar.js'
import HtmlElComp from '../../htmlogy/HtmlComp/HtmlElComp.js'
import List from '../List/List.js'
import Arr from '../../logic/Arr/Arr.js'
// TODO have similar spell logic to merge tiperrs

/**
 * @class create a Combo element with some major features, like select , rename and delete
 * @augments HtmlElComp
 */
class Combo extends HtmlElComp {
	// TODO use show/hidden input as alternative to
	/**
	 * callback, called when selection changes
	 * @callback Combo#selection
	 * @param {string} val value of selection, is textContent of <option>
	 */
	/**
	 * @param {object} arg to construct base-class
	 * @param {Combo#selection} arg.selection callback, called when selection change
	 * @param {Function} arg.list callback if sth in rows changed like delete and rename
	 * @param {Function} arg.delete callback
	 * @param {Function} arg.rename callback
	 * @param {string[]} arg.rows items to select
	 * @param {string} arg.row optional: item from items selected
	 * @param {string} arg.placeholder placeholder at start
	 * @param {object} arg.extraBtns create info of additional buttons to add
	 */
	constructor(arg) {
		super(arg)
		if (this.rows==undefined) this.rows = []
		if (this.placeholder==undefined) this.placeholder = ''
		if (this.row==undefined) this.row = this.rows[0]
		this.selIx = this.rows.findIndex(e => e==this.row)
		if (this.selIx === undefined || this.selIx==-1) this.selIx=0
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate({container:{css:'combo'}})
		this.inpModal = new Modal({parent:this.parent,type:'id',placeholder:this.placeholder})
		// TODO autocomplete may use mechanism keys as bash
		const comboDiv = new Html({parent:{obj:this.containerObj},html:'div',css:'combo-div'})
		this.inp = new Html({parent:{obj:comboDiv},html:'input',css:'combo-input',val:this.row,evts:{'keyup':this.inpKeyEvent.bind(this)}})
		this.select = new List({
			parent:{obj:comboDiv},container:{css:'combo-hidden',html:'div',evts:{'change':this.handleChange.bind(this)}},
			inner:{vals:this.rows,html:'div',css:'combo-item',select:{ix:this.selIx,atts:{'selected':'true'},mode:'singleForce'}}})
		comboDiv.add({icon:'fa-solid fa-caret-down',evts:{'click':this.comboOpen.bind(this)}})
		const toolbarItems = {}
		toolbarItems['create'] = {css:'btn btn-primary active',icon:'fa-solid fa-plus',title:'create item',evts:{'click':this.handleCreate.bind(this)}}
		toolbarItems['rename'] = {css:'btn btn-primary',icon:'fa-solid fa-pen',title:'edit item',evts:{'click':this.handleRename.bind(this)}}
		toolbarItems['remove'] = {css:'btn btn-primary',icon:'fa-solid fa-xmark',title:'remove item',evts:{'click':this.handleRemove.bind(this)}}
		Html.mergeModDatas(toolbarItems,this.extraBtns)
		this.btns = new Toolbar({parent:{obj:this.containerObj},items:toolbarItems})
	}
	getSelected() {
		if (this.rows == undefined) return
		const selIx = this.select.getSelecteds()[0]
		if (selIx==-1) return
		this.selIx = selIx
		return this.rows[selIx]
	}
	setSelected(ix) {
		this.selIx = ix
		this.select.setSelectedIx(this.selIx)
	}
	/**
	 * complete set of Combo content
	 * @param {Array} arr a array that take the content
	 */
	setData(arr) {
		this.rows = []
		if (!Arr.is(arr)) return
		this.rows = arr.slice()
	}
	handleChange() {
		console.log('Combo:handleChange')
		const selectedIndex = this.select.getSelecteds()[0]
		if (selectedIndex==-1) return
		const inpVal = this.select.options[selectedIndex].value
		this.selection(inpVal)
	}
	handleCreate() {
		console.log('Combo:handleCreate')
		this.inpModal.open({onEnter:this.create.bind(this),rows:this.rows,placeholder:'create '+this.placeholder,autocomplete:true})
	}
	create(val) {
		console.log('Combo:create:'+val)
		this.rows.push(val)
		this.select.add(val)
		// this.update() // TODO unknown if usable // select must have option, before set Selected
		this.setSelected(this.rows.length-1) // select created item
		this.selection(val) // new val must be selected
		this.list(this.rows)
	}
	handleRename() {
		console.log('Combo:handleRename')
		this.inpModal.open({onEnter:this.renameInt.bind(this),rows:this.rows,value:this.getSelected(),autocomplete:true})
	}
	/**
	 * rename selected
	 * @param {string} val new value for the selected
	 * @private
	 */
	renameInt(val) {
		const selectedIndex = this.select.getSelecteds()[0]
		if (selectedIndex==-1) return
		console.log('Combo:rename:'+val)
		const valOld = this.getSelected()
		this.rows[selectedIndex] = val
		this.rename(valOld,val)
		this.selection(val)
		this.list(this.rows)
		this.dom()
	}
	handleRemove() {
		console.log('Combo:handleRemove')
		if (this.rows.length) {
			const selectedIndex = this.select.getSelecteds()[0]
			this.rows = this.rows.filter((item,ix) => (ix!=selectedIndex))
			this.setSelected(Arr.boundIx(this.selIx+1,this.rows))
			this.selection(this.rows[this.selIx])
			this.list(this.rows)
			this.delete(this.selIx)
			this.dom()
		}
	}
	// eslint-disable-next-line no-unused-vars
	inpKeyEvent(evt) {
		console.log('Combo:inpKeyEvent')
	}
	// eslint-disable-next-line no-unused-vars
	comboOpen(evt) {
		console.log('Combo:comboOpen')
	}
}
export default Combo
