import Html from '../../Html/Html.js'
import './Popup.css'

/**
 * Represents a popup component.
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
				this.add(Html.mergeDatas(item,{css:'popup-item'}))
			})
		}
	}
}
export default Popup