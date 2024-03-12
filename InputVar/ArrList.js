/**
 * @class
 * A list of items that can be displayed in HTML
 */
class ArrList {
/**
 * Create a new ArrList, with val for selected
 * @param {HTMLElement} html - The HTML element to display the list in
 * @param {Function} func function that creates HTML element by setting Html.create arguments for each item in the list
 * - parameter for function is (item, index)
 * @param {Function} [funcGet] - A function that returns the value (selected state) of parent element, defaults to element.value
 * @param {Function} [funcSet] - A function that sets the value (selected state) of parent element, defaults to element.value
 * - parameter for function is (value)
 */
	constructor(html,func,funcGet,funcSet) {
		this.html = html
		this.func = func

		if (funcGet===undefined) {
			funcGet = () => {return this.html.el.value}
		}
		if (funcSet===undefined) {
			funcSet = val => {this.html.el.value = val}
		}
		this.funcGet = funcGet
		this.funcSet = funcSet
	}
	/**
	 * (re-)create items in the list, according to arr
	 * - always remove all items before
	 * - use .func to create Html creation arguments
	 * @param {Array} arr - The array of items to set
	 * @returns {Html[]} Array of Html objects created
	 */
	populate(arr) {
		this.html.removeChilds()
		/**
		 * if rendered here are all Html of items
		 * @type {Html[]}
		 */
		this.htmls = []
		arr.forEach((item,ix) => {
			this.append(item,ix)
		})
		return this.htmls
	}
	/**
	 * Adds an item to the end of the list.
	 * @param {any} item - The item to add to the list.
	 * @param {number} [index] - The index at which to add the item. If omitted, the item will be added to the end of the list.
	 * @returns {Html} The HTML element that was added to the list.
	 */
	append(item,index) {
		if (index===undefined) index=this.htmls.length
		const html = this.html.add(this.func(item,index))
		this.htmls.push(html)
		return html
	}
	/**
	 * Get the value of the list
	 * @returns {any} the value of the list - unused
	 */
	get val() {
		return this.funcGet()
	}
	/**
	 * Set the value of the list
	 * @param {any} val - The new value of the list
	 */
	set val(val) {
		this.funcSet(val)
	}
}

export default ArrList
