/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Html from '../Html/Html.js'
import HtmlSelect from './HtmlSelect.js'
import Bits from '../../Bits/Bits.js'

// window.localStorage = {
// 	get() {return null},
// 	set(value) {return null},
// }

describe('HtmlSelect',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('refresh() named states',() => {
		const el = create_dom(domContent)
		const createdEl = new Html({parent:{el},html:'div'})
		const selectEls = [
			{div:createdEl.add(new Html())},
			{div:createdEl.add(new Html())},
		]
		const htmlState = new HtmlSelect({div:{css:['designA','designB']}},undefined,Bits.MODE_SINGLE_1,0)
		htmlState.refresh(selectEls,'div')
		it('css is appended',() => {
			expect(selectEls[0].div.el.classList.contains('designA')).to.be(false)
			expect(selectEls[0].div.el.classList.contains('designB')).to.be(true)
		})
		it('css is appended',() => {
			expect(selectEls[1].div.el.classList.contains('designA')).to.be(true)
			expect(selectEls[1].div.el.classList.contains('designB')).to.be(false)
		})
	})
})
