/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Html from '../Html/Html.js'
import HtmlSelect from './HtmlSelect.js'
import Bits from '../../logic/Bits/Bits.js'
import Store from '../../logic/Store.js'
import Ids from '../../logic/Ids/Ids.js'
import Model from '../../logic/Model/Model.js'

describe('HtmlSelect',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('refresh() named states',() => {
		const storeName = 'HtmlSelect-Test-1'
		const el = create_dom(domContent)
		const createdEl = new Html({parent:{el},html:'div'})
		const selectEls = [
			{div:createdEl.add(new Html())},
			{div:createdEl.add(new Html())},
		]
		const htmlState = new HtmlSelect({state_items_arg:{div:{css:['designA','designB']}},mode:Bits.MODE_SINGLE_1},[storeName])
		htmlState.refresh(selectEls,{subKey:'div'})
		it('css is appended',() => {
			expect(selectEls[0].div.el.classList.contains('designA')).to.be(false)
			expect(selectEls[0].div.el.classList.contains('designB')).to.be(true)
		})
		it('css is appended',() => {
			expect(selectEls[1].div.el.classList.contains('designA')).to.be(true)
			expect(selectEls[1].div.el.classList.contains('designB')).to.be(false)
		})
		it('stores not at init',() => {
			const storeVal = Store.get(Ids.combineId(storeName,Model.DEFAULT_KEY))
			expect(storeVal).to.eql(null)
		})
	})
})
