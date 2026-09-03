/* eslint-disable jsdoc/check-alignment */
import List from "../List/List"
import {icons} from '../../../global'
import './TagsList.css'
import Popup from "../Popup/Popup"



/**
 * @class
 * create a list of items,
 * - each items get a X for remove
 * - at the end of list there is a + for add
 * - there might be a badge for each item
 */
class TagsList extends List {
	/**
	 * constructs TagsList
	 * @param {object} arg usual List parameters
	 * @param {function} onChange callback for changes in listData
     * @param {boolean} confirmOnRemove if true confirm on remove
     */
	constructor(arg,app,onChange,confirmOnRemove=true) {
		super(arg)
		this.app = app
		this.onChange = onChange
		this.confirmOnRemove = confirmOnRemove
	}
	/**
     * enables badge function
     * @param {Function} onBadgeClick on click on badge call function(ix of badge) 
     */
	enBadges(onBadgeClick) {
		this.badgeEn = true
		this.onBadgeClick = onBadgeClick
	}
	prepare(listArr) {
		if (listArr) this.listData = listArr // may be left off, when nothing has changed
		this.update({inner:{vals:this.listData}})

		// push a + button at the end of the List, without influence other List entries
		const newBtn = document.createElement('button')
		newBtn.classList.add('btn', 'btn-primary')
		newBtn.onclick = this.itemAdd.bind(this)
		this.el.appendChild(newBtn)

		const iconImg = document.createElement('img')
		iconImg.classList.add('inline')
		iconImg.src = icons('plus')
		newBtn.appendChild(iconImg)

		// add empty badges for each dimension
		this.badges = []
		this.listData.forEach((dimension,ix) => {
			this.htmls[ix].add({html:'span',css:'btn',val:'x',evts:{click:this.itemRemove.bind(this,ix)}})
			if (this.badgeEn) this.badges[ix] = this.htmls[ix].add({html:'span',css:'badge',val:'0',evts:{click:this.onBadgeClick.bind(this,ix)}})
		})
	}
	itemAdd(evt) {
		this.popupNewName(evt,'',this.itemAddGiven.bind(this))
	}
	itemAddGiven(name) {
		this.listData.push(name)
		this.prepare()
		if (this.onChange) this.onChange(this.listData)
	}
	itemRemove(ix,evt) {
		evt.stopPropagation()
		console.log('TagsList:_removeItem ix:',ix)
		if (!this.confirmOnRemove || confirm('Do you really want ro remove tree: '+this.listData[ix])) {
			this.listData.splice(ix,1)
			const lastSelectedVal = this.getSelectedVal()
			if (!this.listData.includes(lastSelectedVal)) this.setSelectedIx()
			this.prepare()
			if (this.onChange) this.onChange(this.listData)
		}
	}
	/**
	 * Opens a dialog to rename a directory listing entry
	 * @param {object} data Directory listing entry to rename
	 * @param {Event} evt give event to find out click position
	 * @param {string} [oldName=''] default value in name input
	 * @param {Function} callback at OK calls callback, with (newName)
	 */
	popupNewName(evt,oldName='',callback) {
		this.app.add(this.renamePopup = new Popup({styles:{left:evt.pageX + 'px',top:evt.pageY + 'px'}}))
		this.renamePopup.add({name:'form',html:'form'}) // to capture submit btn at input enter
		this.renamePopup.form.add({name:'newName',html:'input',val:oldName,atts:{'autofocus':''},evts:{'keydown':(event) => {
			if (event.key === 'Escape') this.renamePopup.close()
		}}})
		this.renamePopup.form.newName.el.focus()
		this.renamePopup.form.add({name:'btns',css:'row'})
		this.renamePopup.form.btns.add({html:'button',val:'ok',css:'btn-primary',atts:{type:'submit'},evts:{click:() => {callback(this.renamePopup.form.newName.el.value); this.renamePopup.close()}}})
		this.renamePopup.form.btns.add({html:'button',val:'cancel',evts:{click:() => {this.renamePopup.close()}}})
	}
}
export default TagsList