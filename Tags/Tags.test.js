/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../logic/html/HtmlTest/Html.JSDOM.js'
import Tags from './Tags.js'
import Html from '../../logic/html/Html/Html.js'
import Bits from '../../logic/Bits/Bits.js'
// import Store from '../../Store.js'
// import Ids from '../../Ids.js'
// import Model from '../../Model/Model.js'

describe('Tags',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('refresh() named states',() => {
		const storeName = 'Tags-Test-1'
		const el = create_dom(domContent)
		const html = new Html({parent:{el},html:'div'})
		const tags = new Tags({title:'some-title',container:{html:'span'},vals:['rain','sun','outside'],mode:Bits.MODE_SINGLE_1},storeName)
		tags.dom(html,{state_item_arg:{css:['A','B']}})

		it ('builds list and selects the first one',() => {
			expect(html.el.innerHTML).to.eql('<span><div class="B">rain</div><div class="A">sun</div><div class="A">outside</div></span>')
		})
	})
})
