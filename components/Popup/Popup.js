import Html from '../../Html/Html.js'
import './Popup.css'

/**
 * Represents a popup component.
 * @example
		this.app.add(this.dirlistRenameModal = new Popup({styles:{left:evt.pageX + 'px',top:evt.pageY + 'px'}}))
		this.dirlistRenameModal.add({name:'form',html:'form'}) // to capture submit btn at input enter
		this.dirlistRenameModal.form.add({name:'newName',html:'input',val:oldName,atts:{'autofocus':''}})
		this.dirlistRenameModal.form.newName.el.focus()
		this.dirlistRenameModal.form.add({name:'btns',css:'row'})
		this.dirlistRenameModal.form.btns.add({html:'button',val:'ok',atts:{type:'submit'},evts:{click:() => {callback(data,this.dirlistRenameModal.form.newName.el.value); this.dirlistRenameModal.close()}}})
		this.dirlistRenameModal.form.btns.add({html:'button',val:'cancel',evts:{click:() => {this.dirlistRenameModal.close()}}})
 */
class Popup extends Html {
	/**
	 * Creates a popup component.
	 * @param {object} arg Popup configuration.
	 * @param {Array} items Html attributes for each item
	 */
	constructor(arg,items) {
		super(Html.mergeDatas(arg,{css:'popup'}))
		if (items) {
			items.forEach(item => {
				this.add(item)
			})
		}
		// Schließen bei Klick außerhalb, first click is from opening, therefore ignoreNextClick
		this.ignoreFirstClick = true
		document.addEventListener('click',evt => {
			if (this.ignoreFirstClick) {
				this.ignoreFirstClick = false
				return // Öffnungs-Klick ignorieren
			}
			if (!this.el.contains(evt.target)) {
				this.close()
			}
		})
	}
	/**
	 * Closes the popup by removing it from the DOM.
	 */
	close() {
		this.remove()
	}
}
export default Popup