/* eslint-disable no-new */
import Numbers from '../../logic/Numbers/Numbers.js'
import Obj from '../../logic/Obj/Obj.js'
import Html from '../html/Html/Html.js'
import Toolbar from '../../HtmlComponents/Toolbar/Toolbar.js/index.js'
import './Tree.scss'
import Ids from '../../logic/Ids.js'
import State from '../../logic/State.js'
import Trees from '../../logic/Trees.js'
import HtmlElComp from '../html/HtmlElComp.js'
import Elem from '../../logic/html/Elem/Elem.js'

/**
 * shows an tree from given data. data can be applied by method update
 * @class Tree
 * @augments HtmlElComp
 */
// TODO maintain sel state at restart
// TODO use all items of tree_info like descr
// TODO mode select only one, instead of multiple select as implemented
class Tree extends HtmlElComp {
	/**
	 * @param {object} arg tree creation parameters
	 * @param {string} arg.dataIxId default to id
	 * @param {string} arg.dataChildId name in JSON of subchilds Array, default to children
	 * @param {string} arg.dataNameId name or value of each tree item, default to text
	 * @param {HtmlEl} arg.parent see @link {Html~createarg}
	 * @param {HtmlEl} arg.container see @link {Html~createarg}
	 * @param {HtmlEl} arg.heading see @link {HtmlElComp}
	 * @param {Function} arg.change
	 * @param {Function} arg.create
	 * @param {Function} arg.select
	 * @param {Function} arg.delete
	 * @param {boolean} arg.selectable
	 * @param {boolean} arg.editable
	 */
	constructor(arg) {
		// supply some defaults when not applied by callee
		super({dataIxId:'id',dataChildId:'children',dataNameId:'text',selectable:true,editable:true,...arg})
		console.log('Tree:constructor')
		this.icons = {
			'selection': 'fa-solid fa-section red',
			'link': 'fa-solid fa-square-up-right blue',
			'page': 'fa-solid fa-bookmark green',
			'show': 'fa-solid fa-caret-right blue',
			'hide': 'fa-solid fa-caret-down blue',
			'leaf': 'fa-solid fa-leaf green',
			'root': 'fa-solid fa-globe blue',
			'date': 'fa-solid fa-calendar red',
			'datetime': 'fa-solid fa-clock red',
			'string': 'fa-solid fa-text red',
			'default' : 'fa-solid fa-location-pin gray'
		}
		this.nodeSelStates = ['unsel']
		if (this.selectable) this.nodeSelStates.push('sel')
		if (this.editable) this.nodeSelStates.push('edit')
		this.nodeExpStates = ['show','hide']
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		console.log('Tree:dom')
		// const searchGroup = new Html({parent:{obj:this.containerObj},html:'div',css:'input-group',atts:{'role':'group','aria-label':'tree-search-group'}})
		// TODO color search icon use btn Style
		// new Html({parent:{obj:searchGroup},html:'div',css:'input-group-text',icon:'fa-solid fa-magnifying-glass',evts:{'click':this.btnCreate.bind(this)}})
		// TODO not needed when keytype (find by popup, but also use in parent navigation)
		// this.searchEl = new Html({parent:{obj:searchGroup},html:'input',css:'form-control',atts:{type:'text',placeholder:'search term'},evts:{'change':this.searchChange.bind(this)}})
		// TODO double-click, may rename node
		// TODO use Ctrl+C etc as keys
		// TODO btns for copy/paste
		// TODO DBG lines
		this.dbgInput = new Html({parent:{obj:this.containerObj},html:'input',css:'show-inline',id:'dbg',val:'hihi-dbg'}) // root is founded in ul

		this.tree = new Html({parent:{obj:this.containerObj},html:'ul',css:'node show root'}) // root is founded in ul
		// deactivate if not possible
		const toolbarItems = {} // TODO color them
		toolbarItems['create'] = {icon:'fa-solid fa-plus',evts:{click:this.btnCreate.bind(this)}}
		toolbarItems['rename'] = {icon:'fa-solid fa-pen',evts:{click:this.btnRename.bind(this)}}
		toolbarItems['remove'] = {icon:'fa-solid fa-xmark',evts:{click:this.btnRemove.bind(this)}}
		toolbarItems['up'] = {icon:'fa-solid fa-caret-up',evts:{click:this.btnUp.bind(this)}}
		toolbarItems['dn'] = {icon:'fa-solid fa-caret-down',evts:{click:this.btnDn.bind(this)}}
		// TODO duplicate, and clipboard commands
		Obj.mergeModOverwrite(toolbarItems,this.extraBtns)
		this.toolContainer = new Html({parent:{obj:this.containerObj},html:'div'})
		this.btns = new Toolbar({parent:{obj:this.toolContainer},items:toolbarItems})
		if (this.data) this.update()
	}
	update() {
		Obj.mergeModOverwrite(this,Html.mergeDatas.apply(null,arguments))
		if (this.data) {
			this.ids = new Ids('n_')
			this.inflateLvl(this.tree,this.data,0) // iteratively develop all nodes of given tree in data
			if (this.selectable) this.selectNodeId(this.ids.first())
			// TODO comissioning lines:
			// this.nodeEditSet({el:document.getElementById(this.ids.first()),edit:true})
			this.toolbarCare()
		}
	}
	/**
	 * create DOM Elements out of data iterativelly,
	 * may create a tree
	 * @param {Html} htmlObj holds element of parent
	 * @param {object} data in specified form controlled by this convention, also defined by dataChildId, dataNameId
	 * @param {number} lvl actual iterationLevel incrementing beginning at 0
	 * @private
	 */
	inflateLvl(htmlObj,data,lvl) {
		if (data[this.dataNameId]) {
			data.el = htmlObj.my.el
			data.id = this.ids.next() // TODO is this necessary?
			data.type = (data.type) ? data.type : 'default' // TODO is this necessary?
			const nodeType = (data[this.dataChildId]) ? 'show' : 'leaf' // default: opened branch if it has childs
			let li_el = this.createNodeInt(htmlObj,data[this.dataNameId],nodeType,data.type,data.id)
			if (data[this.dataChildId]) {
				const ul_el = new Html({parent:{el:li_el.my.el},html:'ul',css:['show','lvl'+lvl]})
				for (let ix = 0; ix < data[this.dataChildId].length; ix++) {
					const dataChild = data[this.dataChildId][ix]
					this.inflateLvl(ul_el,dataChild,++lvl)
				}
			}
		}
	}
	createNodeInt(parent_ul_el,text,nodeType,type,id) {
		const li_el = new Html({parent:{obj:parent_ul_el},html:'li',css:State.initial(this.nodeSelStates),atts:{id}})
		new Html({parent:{obj:li_el},html:'i',css:[this.icons[nodeType],'collapse-btn'],evts:{'click':this.itemCollapse.bind(this)},atts:{draggable:'true'}})
		new Html({parent:{obj:li_el},html:'span',css:'icon-between',evts:{'click':this.itemClicked.bind(this)}})
		new Html({parent:{obj:li_el},html:'i',css:[this.icons[type],'node-icon'],evts:{'click':this.itemCollapse.bind(this)},atts:{draggable:'true'}})
		new Html({parent:{obj:li_el},html:'span',val:text,css:'node-value',evts:{'click':this.itemClicked.bind(this)}})
		if (this.editable) new Html({parent:{obj:li_el},html:'input',val:text,css:'hide',evts:{'keyup':this.itemInput.bind(this),'focusout':this.itemInputFocusOut.bind(this)}})
		return li_el
	}
	itemCollapse(evt) {
		console.log('itemCollapse')
		const liEl = Elem.findParent(evt.target,undefined,1) // find parent of <i> icon, should be li
		if (liEl==undefined) return
		const ulEl = Elem.getChilds(liEl,'ul')[0]
		const iEl = Elem.getChilds(liEl,'i')[0] // clickable collapse btn or icon is first child in li
		if (ulEl) {
			if (ulEl.classList.contains('show')) {
				Elem.classStateSet(ulEl,'hide',this.nodeExpStates)
				Html.change({node:{el:iEl},css:[this.icons.hide,'collapse-btn']})
			} else {
				Elem.classStateSet(ulEl,'show',this.nodeExpStates)
				Html.change({node:{el:iEl},css:[this.icons.show,'collapse-btn']})
			}
		}
	}
	itemClicked(evt) { // TODO use mode1 selected, mode2 edit (: achieve key < > v n)
		console.log('itemClicked')
		const liEl = Elem.findParent(evt.target) // FIXME untesteted
		if (liEl==undefined) return
		const state = this.getNodeState(liEl)
		const stateNew = State.forward(state,this.nodeSelStates)
		Elem.classStateSet(liEl,stateNew,this.nodeSelStates)
		if (stateNew == 'edit') this.nodeEditSet({el: liEl,edit: true})
	}
	itemInput(evt) {
		console.log('itemInput')
		const liEl = Elem.findParent(evt.target)
		if (liEl==undefined) return
		if (evt.key=='Enter') {
			this.nodeEditSet({el:liEl,edit:false,apply:true})
		} else if (evt.key=='Escape') {
			this.nodeEditSet({el:liEl,edit:false,apply:false})
		}
		Elem.classStateSet(liEl,'sel',this.nodeSelStates)
	}
	// TODO use also addEventListener('pagehide', event => { }); to not capture / modern tools capture in real-time, so why not save
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/unload_event
	// Especially on mobile, the unload event is not reliably fired. For example, the unload event is not fired at all in the following scenario:
	itemInputFocusOut(evt) {
		console.log('itemInputFocusOut')
		const liEl = Elem.findParent(evt.target)
		if (liEl == undefined) return
		this.nodeEditSet({el: liEl,edit: false,apply: true}) // tab switch, or F1 also loose focus, and than save typed data
		Elem.classStateSet(liEl,'unsel',this.nodeSelStates)
	}
	getNodeState(el) {
		const states = Elem.classStateGet(el,this.nodeSelStates)
		// eslint-disable-next-line no-undef
		if (states.length != 1) throw new Exception('so many states found')
		return states[0]
	}
	saveNodeState(el,val) {
		Elem.classStateSet(el,val,this.nodeSelStates)
	}
	selectNodeId(id,state) {
		const val = state ? state : 'sel'
		// deselect old
		if (val!=='unsel') {
			const selOldId = this.getSelectedId()
			if (selOldId!==undefined && selOldId!=id) {
				this.selectNodeId(selOldId,'unsel')
			}
		}
		const el = document.getElementById(id)
		Elem.classStateSet(el,val,this.nodeSelStates)
		this.setSelected(el)
	}
	/**
	 * set edit state for one li element
	 * @param {object} obj carry parameters for method
	 * @param {HTMLElement} obj.el li element to set edit state
	 * @param {boolean} obj.edit if true then set edit state, otherwise leave edit state and return to unsel
	 */
	nodeEditSet(obj) {
		const liEl = obj.el // TODO abbrev
		if (liEl==undefined) return
		const labelEl = Elem.getChilds(liEl,'span')[1]
		const inputEl = Elem.getChilds(liEl,'input')[0]
		if (obj.edit) {
			Elem.classStateSet(labelEl,'hide',this.nodeExpStates)
			Elem.classStateSet(inputEl,'show-inline',this.nodeExpStates)
			inputEl.value = labelEl.innerHTML
			inputEl.focus()
			this.setSelected(liEl)
		} else {
			if (obj.apply) labelEl.innerHTML = inputEl.value // save value when losing focus, only Escape discard value
			Elem.classStateSet(labelEl,'show-inline',this.nodeExpStates)
			Elem.classStateSet(inputEl,'hide',this.nodeExpStates)
			// deselect upper li after edit (FIXME untested, unseen or unused)
			const state = this.getNodeState(liEl)
			const stateNew = State.forward(state,this.nodeSelStates)
			Elem.classStateSet(liEl,stateNew,this.nodeSelStates)
			// sign for toolbarCare
			this.setSelected(undefined)
		}
	}
	createNode(parent,text,type) {
		console.log('Tree: createNode')
		console.log(parent)
		if (type===undefined) type='default'
		const ulEl = Elem.getChildsAssured(parent,'ul',{el:parent,html:'ul',css:'node show'})[0]
		// TODO fetch into data to find parent, need to attach type
		const newId = this.ids.next()
		this.createNodeInt(ulEl,text,'leaf',type,newId)
		Trees.parse({
			action:'create',
			childsId:this.dataChildId,
			key:this.dataIxId,
			keyVal:parent.id,
			newNode:{name:text,type:type,id:newId}
		},this.data)
		this.selectNodeId(newId)
		// TODO open parent and change icon from leaf to caret
		this.handleChange()
	}
	editNode(el) {
		this.nodeEditSet({el:el,edit:true})
	}
	deleteNode(el) {
		if (!Obj.has(el,'id')) return
		Trees.parse({
			action:'remove',
			childsId:this.dataChildId,
			key:this.dataIxId,
			keyVal:parent.id,
		},this.data)
		this.handleChange()
	}
	setSelected(el) { // TODO get selected a real getter
		this.selectedEl = el
		this.toolbarCare()
	}
	setSelectedId(id) {
		const el = document.getElementById(id)
		if (el===null) console.info('somebody wants unknown id:'+id)
		this.setSelected(el)
	}
	getSelected() { // TODO get selected a real getter
		return this.selectedEl
	}
	getSelectedId() {
		const selected = this.getSelected()
		if (!Obj.has(selected,'id')) return
		return selected.id
	}
	getSelectedPos() {
		const ret = {}
		const sel = this.getSelected()
		if (sel==undefined) return
		ret.sel = sel
		ret.selId = sel.id
		// TODO ret.selInfo = this.treeObj.get_node(ret.selId)
		if (ret.selId==this.ids.first()) {
			ret.root = true
		} else {
			ret.root = false
			ret.parent = ret.sel.parentElement.parentElement
			ret.parentId = ret.parent.id
		}
		// TODO ret.parentInfo = this.treeObj.get_node(ret.parentId)
		const child_ulEl = Elem.getChilds(ret.sel,'ul')[0]
		ret.children = Elem.getChilds(child_ulEl,'li')
		if (ret.children.length==0) return ret
		ret.selPos = -1 // usually not possible as itself must be contained in parents.children
		for (let ix = 0; ix < ret.children.length; ix++) {
			const e = ret.children[ix]
			if (e.id==ret.selId) {
				ret.selPos = ix
				break
			}
		}
		return ret
	}
	handleChange() {
		console.log('Tree:handleChange')
		this.toolbarCare()
		this.callbackChange(this.tree)
	}
	handleSelect(evt,obj) {
		console.log('Tree:handleSelect')
		this.toolbarCare()
		const state = this.treeObj.get_state()
		this.callbackSelect(obj.node.id,state)
	}
	toolbarCare() {
		const sel = this.getSelectedPos()
		let toolbarUpdate = {}
		toolbarUpdate['up'] = {disabled : (sel==undefined || sel.root || sel.selPos==0)}
		toolbarUpdate['dn'] = {disabled : (sel==undefined || sel.root || sel.selPos==sel.children.length-1)}
		toolbarUpdate['create'] = {disabled : (sel==undefined)}
		toolbarUpdate['remove'] = {disabled : (sel==undefined || sel.root)}
		toolbarUpdate['rename'] = {disabled : (sel==undefined)}
		// TODO extraBtns should be disabled when no sel
		this.btns.update(toolbarUpdate)
	}
	// special Obj to retrive id of created node
	handleCreate(evt,node) {
		if (this.createNodeTop) { // only when from top created
			this.callbackCreate(node)
			this.createNodeTop = false
		}
		this.handleChange() // std after tree mani
	}
	btnCreate() {
		console.log('Tree:btnCreate')
		let el = this.getSelected()
		this.createNode(el,'node')
		this.editNode(el)
	}
	btnRename() {
		console.log('Tree:btnRename')
		let el = this.getSelected()
		this.editNode(el)
	}
	btnRemove() {
		console.log('Tree:btnRemove')
		let sel = this.getSelectedPos()
		if (sel==undefined) return false
		if (sel.selId==this.ids.first()) return false // root may not be deleted, because it may not be revised
		// select next child or parent if none
		if (sel.children.length==1) { // one children is not enough, it will be deleted, so choose root
			this.setSelected(sel.parent)
		} else {
			let selNextId = -1
			let found = false
			for (let ix = 0; ix < sel.children.length; ix++) {
				const child = sel.children[ix]
				if (child==sel.selId) {
					found=true
				} else {
					selNextId = child // choose any id, before item and the next then break
					if (found==true) {
						break
					}
				}
			}
			this.setSelectedId(selNextId)
		}
		this.deleteNode(sel)
		this.handleChange()
		// TODO needed but later, this.callbackDelete(sel.selId)
	}
	btnUp() {
		console.log('Tree:btnUp')
		this.moveSel(false)
	}
	btnDn() {
		console.log('Tree:btnDn')
		this.moveSel(true)
	}
	moveSel(incr) {
		const sel = this.getSelectedPos()
		if (sel.root) return
		if (sel.children.length==1) return
		if (!incr && sel.selPos==0) return
		if (incr && sel.selPos==sel.children.length-1) return
		const selNewPos = Numbers.bound(incr?sel.selPos+1:sel.selPos-1,sel.children)
		// const newNode = Obj.filter(sel.selInfo, [this.dataIxId,this.dataNameId,'icon','state','type'])
		Trees.parse({
			action:'move',
			childsId:this.dataChildId,
			key:this.dataIxId,
			keyVal:parent.id,
			pos:selNewPos
		},this.data)
		this.handleChange()
	}
	handleEdit() {
		console.log('Tree:handleEdit')
		this.handleChange()
	}
}
export default Tree