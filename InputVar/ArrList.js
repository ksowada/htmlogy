/**
 * @class
 * A list of items that can be displayed in HTML
 */
class ArrList {
/**
 * Create a new ArrList
 * @param {HTMLElement} html - The HTML element to display the list in
 * @param {Function} func function that creates HTML element by setting Html.create arguments for each item in the list
 * - parameter for function is (item, index)
 * @param {Function} funcGet - A function that returns the value of one item
 * @param {Function} funcSet - A function that sets the value of one item
 * - parameter for function is (value)
 */
	constructor(html,func,funcGet,funcSet) {
		this.html = html
		this.func = func
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
	set(arr) {
		this.html.removeChilds()
		/**
		 * if rendered here are all Html of items
		 * @type {Html[]}
		 */
		this.htmls = []
		arr.forEach((item,ix) => {
			this.htmls.push(this.html.add(this.func(item,ix)))
		})
		return this.htmls
	}
	/**
	 * Get the value of the list
	 * @returns {any} the value of the list
	 * @deprecated unused
	 */
	get value() {
		return this.funcGet()
	}
	/**
	 * Set the value of the list
	 * @param {any} val - The new value of the list
	 * @deprecated unused
	 */
	set value(val) {
		this.funcSet(val)
	}
}

export default ArrList