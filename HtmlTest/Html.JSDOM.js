/* eslint-disable no-undef */
import {JSDOM} from 'jsdom'

/**
 * create a virtual DOM for test purposes
 * - you can test me with Debug console: document.body.innerHTML
 * - when you test, it may be that in describe and it ther might be different content, cant find reason, better to access DOM in one only function, so it access shall be in variable before, in the same function where it created
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