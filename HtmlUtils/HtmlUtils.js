/**
 * @class
 * utilities for DOM elements
 */
class HtmlUtils {
	static getSelectionHtml() {
		var sel = ''
		var html = ''
		if (window.getSelection) {
			sel = window.getSelection()
			if (sel.rangeCount) {
				var frag = sel.getRangeAt(0).cloneContents()
				var el = document.createElement('div')
				el.appendChild(frag)
				html = el.innerHTML
			}
		} else if (document.selection && document.selection.type == 'Text') {
			html = document.selection.createRange().htmlText
		}
		return html
	}
	static searchParamToJson() {
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString)
		const rest = {}
		for(let pair of urlParams.entries()) {
			rest[pair[0]] = pair[1]
		}
		return rest
	}
}
export default HtmlUtils