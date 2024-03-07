import Html from '../../logic/html/Html/Html.js'
import HtmlSelect from '../../logic/html/HtmlSelect/HtmlSelect.js'
import ArrList from '../InputVar/ArrList.js'

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
	}/**
		 * creates Html
		 * @param {Html} parentHtml Html to attach to
		 * @param {HtmlSelect~props} propsAdd properties
		 * @param {Html~createArg} propsAdd.entry arguments for creating Html instance for each item in the list
		 * @returns {Html} Html of input or other element connected
		 * @throws {Error} if kind is not implemented
		 */
	dom(parentHtml,propsAdd) {
		const props = Html.mergeDatas(this.props,propsAdd)
		const html = parentHtml.add() // TODO allow user defined
		if (props.title && props.title.length > 0) html.add({h:`<h2>${props.title}</h2>`})
		if (props.entry === undefined) props.entry = item => {return {h:`<div>${item}</div>`}}
		this.list = new ArrList(html,props.entry)
		if (props.vals) this.list.set(props.vals)
		this.refresh(this.list.htmls,props)
		return html
	}
}
export default Tags