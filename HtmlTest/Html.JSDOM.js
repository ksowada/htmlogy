/* eslint-disable no-undef */
import {JSDOM} from 'jsdom'
/**
 * create a virtual DOM for test purposes
 * - you can test me with Debug console: document.body.innerHTML
 * @param {string} content the initial text or html for created DOM
 * @returns {Element} body of created DOM
 */
export function create_dom(content) {
	// if (!content) content = '<main id="test">hola</main>'
	const dom = new JSDOM(content,{includeNodeLocations: true})
	global.window = dom.window
	global.document = dom.window.document
	return global.document.body
}
// export function reset_dom(content) {
// 	if (!content) content = '<main id="test">hola</main>'
// 	const dom = new JSDOM(content,{includeNodeLocations: true})
// 	global.window = dom.window
// 	global.document = dom.window.document
// 	return global.document.getElementById('test')
// }
