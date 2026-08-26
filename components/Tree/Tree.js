/* eslint-disable no-new, require-jsdoc, jsdoc/require-param-description */
import Numbers from '../../../logic/Numbers/Numbers.js'
import Obj from '../../../logic/Obj/Obj.js'
import Html from '../../Html/Html.js'
import Toolbar from '../Toolbar/Toolbar.js'
import './Tree.css'
import Ids from '../../../logic/Ids/Ids.js'
import State from '../../../logic/State.js'
import Trees from '../../../logic/Trees/Trees.js'
import HtmlElComp from '../../HtmlComp/HtmlElComp.js'
import Elem from '../../Elem/Elem.js'
import {icons} from '../../../global'

/**
 * shows an tree from given data. data can be applied by method update
 * @class Tree
 * @augments HtmlElComp
 */
// TODO maintain sel state at restart
// TODO use all items of tree_info like descr
// TODO mode select only one, instead of multiple select as implemented
class Tree extends Html {
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

		super(arg)
		Html.mergeModDatas(this,{dataIxId:'id',dataChildId:'children',dataNameId:'text',selectable:false,editable:false,...arg})

		/** initially open to showlvl, afterwards at update, restore nodeIdState */
		this.initially = true

		/** remember for each node.id the nodeType to restore open/hide state */
		this.nodeIdsState = new Map();

		console.log('Tree:constructor')
		this.icons = {
			'selection': 'section',
			'link': 'square-up-right',
			'page': 'bookmark',
			'show': 'caret-down',
			'hide': 'caret-right',
			'leaf': 'leaf',
			'root': 'globe',
			'directory' : 'folder-closed',
			'file': 'file',
			'string': 'font',
			'default' : 'location',
			'none' : 'none'
		}
		this.nodeSelStates = []
		if (this.selectable) {
			this.nodeSelStates.push('sel')
			this.nodeSelStates.push('unsel')
		}
		if (this.editable) this.nodeSelStates.push('edit')
		this.nodeExpStates = ['show','hide','none']
		// const searchGroup = new Html({parent:{obj:this.containerObj},html:'div',css:'input-group',atts:{'role':'group','aria-label':'tree-search-group'}})
		// TODO color search icon use btn Style
		// new Html({parent:{obj:searchGroup},html:'div',css:'input-group-text',icon:'magnifying-glass',evts:{'click':this.btnCreate.bind(this)}})
		// TODO not needed when keytype (find by popup, but also use in parent navigation)
		// this.searchEl = new Html({parent:{obj:searchGroup},html:'input',css:'form-control',atts:{type:'text',placeholder:'search term'},evts:{'change':this.searchChange.bind(this)}})
		// TODO double-click, may rename node
		// TODO use Ctrl+C etc as keys
		// TODO btns for copy/paste
		// TODO DBG lines

		this.tree = new Html({parent:{obj:this},html:'ul',css:'node show root'}) // root is founded in ul
		// deactivate if not possible
		const toolbarItems = {} // TODO color them
		toolbarItems['create'] = {icon:'plus',evts:{click:this.btnCreate.bind(this)}}
		toolbarItems['rename'] = {icon:'pen',evts:{click:this.btnRename.bind(this)}}
		toolbarItems['remove'] = {icon:'xmark',evts:{click:this.btnRemove.bind(this)}}
		toolbarItems['up'] = {icon:'caret-up',evts:{click:this.btnUp.bind(this)}}
		toolbarItems['dn'] = {icon:'caret-down',evts:{click:this.btnDn.bind(this)}}
		// TODO duplicate, and clipboard commands
		Obj.mergeModOverwrite(toolbarItems,this.extraBtns)
		this.toolContainer = new Html({parent:{obj:this},html:'div'})
		this.btns = new Toolbar({parent:{obj:this.toolContainer},items:toolbarItems})
		if (this.data) this.update()
	}
	/**
	 * when data is ready update(),
	 * @param {object} arguments as constructor
	 */
	update() {
		this.tree.removeChilds()
		Obj.mergeModOverwrite(this,Html.mergeDatas.apply(null,arguments))

		// data is missing at update, add initial data
		if (!this.data) {
			this.data = {}
			this.data[this.dataNameId] = 'empty'
		}
		this.ids = new Ids('n_')
		this.inflateLvl(this.tree,this.data,0,(this.initially==true)?1:undefined) // iteratively develop all nodes of given tree in data
		if (this.selectable) this.selectNodeId(this.ids.first())
		// TODO comissioning lines:
		// this.nodeEditSet({el:document.getElementById(this.ids.first()),edit:true})
		this.toolbarCare()
		this.initially = false // only after 1st update, initially is done
	}
	/**
	 * create DOM Elements out of data iterativelly,
	 * may create a tree
	 * @param {Html} htmlObj holds element of parent
	 * @param {object} data in specified form controlled by this convention, also defined by dataChildId, dataNameId
	 * @param {number} lvl actual iterationLevel incrementing beginning at 0
	 * @param {number} lvlToShow level to show initially, if undefined try to read open/hide state from nodeIdsState
	 * @private
	 */
	inflateLvl(htmlObj,data,lvl,lvlToShow=undefined) {
		if (data[this.dataNameId]) {
			data.el = htmlObj.my.el
			data.id = this.ids.next()

			let nodeType = 'none'
			let collapsible = false
			if (lvlToShow==undefined) { // no initial routine, so check for open or close in map
				nodeType = this.nodeIdsState.get(data.id)
				collapsible = !(nodeType=='none')
			} else {
				if (!data[this.dataChildId] || data[this.dataChildId].length==0) {
					nodeType = 'none'
					collapsible = false
				} else {
					collapsible = true
					if (lvl>=lvlToShow) {
						nodeType = 'hide'
					} else {
						nodeType = 'show'
					}
				}
				this.nodeIdsState.set(data.id,nodeType)
			}

			// use custom nodeTypes for data.type icon by data attributes given from top
			if (!data.type) {
				if (this.nodeTypes) {
					Object.keys(this.nodeTypes).forEach((nodeType => {
						const [key, value] = Object.entries(this.nodeTypes[nodeType])[0];
						if (key in data && data[key] == value) {
							data.type = nodeType
						}
					}))
				}
				if (!data.type) data.type = 'default'
			}
			data.type = (data.type) ? data.type : 'default' // TODO is this necessary?
			const li_el = new Html({parent:{obj:htmlObj},html:'li',css:['lvl'+lvl,nodeType,State.initial(this.nodeSelStates)],id:data.id})
			if (collapsible) {
				new Html({parent:{obj:li_el},html:'img',atts:{src:icons(this.icons[nodeType]),draggable:'true'},css:'collapse-btn icon',evts:{'click':this.itemCollapse.bind(this)}})
				new Html({parent:{obj:li_el},html:'img',atts:{src:icons(this.icons[data.type]),draggable:'true'},css:'collapse-btn icon',evts:{'click':this.itemCollapse.bind(this)}})
			} else {
				new Html({parent:{obj:li_el},html:'img',atts:{src:icons(this.icons[nodeType]),draggable:'true'},css:'icon'})
				new Html({parent:{obj:li_el},html:'img',atts:{src:icons(this.icons[data.type]),draggable:'true'},css:'icon'})
			}
			new Html({parent:{obj:li_el},html:'span',val:data[this.dataNameId],css:'node-value',evts:{'click':this.contextmenu.bind(this,data)}})
			if (this.editable) new Html({parent:{obj:li_el},html:'input',val:data[this.dataNameId],css:'hide',evts:{'keyup':this.itemInput.bind(this),'focusout':this.itemInputFocusOut.bind(this)}})

			if (data[this.dataChildId] && data[this.dataChildId].length>0) {
				const ul_el = new Html({parent:{el:li_el.my.el},html:'ul'})
				for (let ix = 0; ix < data[this.dataChildId].length; ix++) {
					const dataChild = data[this.dataChildId][ix]
					this.inflateLvl(ul_el,dataChild,lvl+1,lvlToShow)
				}
			}
		}
	}
	itemCollapse(evt) {
		console.log('itemCollapse')
		const liEl = Elem.findParent(evt.target,undefined,1) // find parent of <i> icon, should be li
		if (liEl==undefined) return

		const ulEl = Elem.getChilds(liEl,'ul')[0] // check for ul for child collection
		const nodeTypeEl = Elem.getChilds(liEl,'img')[0] // clickable collapse btn or icon is first child in li
		if (ulEl) {
			const showState = liEl.classList.contains('show') ? 'hide' : 'show'
			Elem.classStateSet(liEl,showState,this.nodeExpStates)
			Html.changeEl(nodeTypeEl,{atts:{src:icons(this.icons[showState])},css:['icon',this.icons.show,'collapse-btn']})
			this.nodeIdsState.set(liEl.id,showState)
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
	// createNode(parent,text,type) {
	// 	console.log('Tree: createNode')
	// 	console.log(parent)
	// 	if (type===undefined) type='default'
	// 	const ulEl = Elem.getChildsAssured(parent,'ul',{el:parent,html:'ul',css:'node show'})[0]
	// 	// TODO fetch into data to find parent, need to attach type
	// 	const newId = this.ids.next()
	// 	this.createNodeInt(ulEl,text,'leaf',type,newId)
	// 	Trees.parse({
	// 		action:'create',
	// 		childsId:this.dataChildId,
	// 		key:this.dataIxId,
	// 		keyVal:parent.id,
	// 		newNode:{name:text,type:type,id:newId}
	// 	},this.data)
	// 	this.selectNodeId(newId)
	// 	// TODO open parent and change icon from leaf to caret
	// 	this.handleChange()
	// }
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
		// this.createNode(el,'node') // createNode to remake
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