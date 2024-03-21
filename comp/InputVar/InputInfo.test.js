/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../HtmlTest/Html.JSDOM.js'
import InputInfo from './InputInfo.js'
import Html from '../../Html/Html.js'

describe('InputInfo',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('dom for select',() => {
		create_dom(domContent)
		const input = new InputInfo({kind:'select',vals:['house','mouse','touch'],css:'sel'})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		input.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const domed = input.htmls[0]

		it('value of DOM',() => {
			expect(domed.el.value).to.eql('house')
		})
		it('value of Model',() => {
			expect(domed.val).to.eql('house')
		})
		it('class',() => {
			expect(domed.el.classList.contains('sel')).to.be(true)
			expect(domed.el.classList.contains('someclass')).to.be(true)
			expect(domed.el.classList.length).to.be(2)
		})
		it('outerHTML',() => {
			expect(parentHtml.el.innerHTML).to.eql('<select class="sel someclass"><option>house</option><option>mouse</option><option>touch</option></select>')
		})
	})
	describe('dom for select with label',() => {
		create_dom(domContent)
		const input = new InputInfo({kind:'select',label:'choose',vals:['house','mouse','touch'],css:'sel'})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		input.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const domed = input.htmls[0]

		it('value of DOM',() => {
			expect(domed.el.value).to.eql('house')
		})
		it('value of Model',() => {
			expect(domed.val).to.eql('house')
		})
		it('class',() => {
			expect(domed.el.classList.contains('sel')).to.be(true)
			expect(domed.el.classList.contains('someclass')).to.be(true)
			expect(domed.el.classList.length).to.be(2)
		})
		it('outerHTML',() => {
			expect(parentHtml.el.innerHTML).to.eql('<div><span>choose</span><select class="sel someclass"><option>house</option><option>mouse</option><option>touch</option></select></div>')
		})
	})
	describe('dom for evt with label',() => {
		const callback = () => {}
		create_dom(domContent)
		const input = new InputInfo({kind:'evt',label:'reset!',change:callback,css:'btn btn-active btn-secondary'})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		input.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const domed = input.htmls[0]

		it('value of DOM',() => {
			expect(domed.el.value).to.eql('')
		})
		it('value of Model',() => {
			expect(domed.val).to.eql('')
		})
		it('outerHTML',() => {
			expect(parentHtml.el.innerHTML).to.eql('<button class="btn btn-active btn-secondary someclass"><span>reset!</span></button>')
		})
	})
})
