import Model from '../../logic/Model/Model.js'
import Html from '../../logic/html/Html/Html.js'
import HtmlSelect from '../../logic/html/HtmlSelect/HtmlSelect.js'
import ArrList from '../../logic/html/comp/ArrList/ArrList.js'

/**
 * @class
 * create a list of items, that is extensible by user
 * consist of list and input
 */
class Tags extends HtmlSelect {
/**
 * @param {object} props instance properties
 * @param {string[]} names names to inherit to Model and Storage, keep unique
 */
	constructor(props,names) {
		super(props,names)

		/** properties, that will not change during operation */
		this.props = props
		this.model = new Model(this.props.vals,[names,'Tags'],this.props.storeEn)
	}
	/**
	 * creates Html
	 * @param {Html} parentHtml Html to attach to
	 * @param {HtmlSelect~props} propsAdd properties
	 * @param {Html~createArg} propsAdd.container arguments for creating container Html
	 * @param {Html~createArg} propsAdd.entry arguments for creating each item's Html
	 * @param {Html~createArg} propsAdd.input arguments for creating a input to add new item
	 * @returns {Html} Html of container or parentHtml if no container
	 * @throws {Error} if kind is not implemented
	 */
	dom(parentHtml,propsAdd) {
		const props = Html.mergeDatas(this.props,propsAdd)
		let html = undefined
		if (props.container !== undefined) {
			this.container = html = parentHtml.add(props.container) // TODO allow user defined
		} else {
			html = parentHtml
		}
		if (props.title && props.title.length > 0) html.add({h:`<h2>${props.title}</h2>`})
		if (props.entry === undefined) props.entry = item => {return {h:`<div>${item}</div>`}}

		// list of items
		this.list = new ArrList(html,props.entry)
		if (propsAdd.vals) { // only when propsAdd contains new vals, model will be updated
			this.model.val = propsAdd.vals
		}
		this.list.populate(this.model.val)
		this.refresh(this.list.htmls,props)

		if (props.input) {
			this.input = html.add(props.input)
			this.input.append({evts:{change:() => this.append(this.input.val,true)}})
		}
		return html
	}
	/**
	 * Adds a new item to the end of the list and updates the model.
	 * @param {string} val The value of the new item.
	 * @param {boolean} [selected] Whether the new item should be selected.
	 */
	append(val,selected=false) {
		this.list.append(val)
		const arr = this.model.val
		arr.push(val)
		this.model.val = arr
		this.refresh(this.list.htmls)
		if (selected) this.toggle(this.list.htmls.length-1)
	}
}
export default Tags