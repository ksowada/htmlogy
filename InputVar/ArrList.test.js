/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../logic/html/HtmlTest/Html.JSDOM.js'
import ArrList from './ArrList.js'
import Html from '../../logic/html/Html/Html.js'

describe('ArrList',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('set',() => {
		create_dom(domContent)
		const parentHtml = new Html({parent:{el:document.getElementById(myId)},html:'div'})
		const arrList = new ArrList(parentHtml,(item,ix) => {return {html:'span',id:ix,val:item}})
		const items = ['house','garden','fence']
		arrList.populate(items)

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirst = document.getElementById(0).innerHTML
		const itemCnt = parentHtml.el.childElementCount

		it('item created',() => {
			expect(itemFirst).to.eql('house')
			expect(itemCnt).to.eql(3)
		})
	})
})
