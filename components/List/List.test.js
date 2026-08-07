/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../HtmlTest/Html.JSDOM.js'
import Html from '../../Html/Html.js'
import List from './List.js'
import Elem from '../../Elem/Elem.js'
describe('List',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc
	describe('container only',() => {
		const el = create_dom(domContent)
		const html = new Html({parent:{el},html:'div'})
		const list = new List({container:{css:'frame'}})
		html.add(list)
		it('created tag with css',() => {
			expect(html.el.innerHTML).to.eql('<div class="frame"></div>')
		})
	})
	describe('test elements',() => {
		const el = create_dom(domContent)
		const html = new Html({parent:{el},html:'div'})
		const list = new List({container:{css:'frame'},inner:{vals:['A','B','C']}})
		html.add(list)
		it('check first element to be A and count of elements',() => {
			expect(Elem.getChildsFirstVal(list.el,'div')).to.eql('A')
			expect(Elem.getChilds(list.el,'div').length).to.eql(3)
		})
	})
})
