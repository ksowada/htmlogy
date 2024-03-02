/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../logic/html/HtmlTest/Html.JSDOM.js'
import InputVar from './InputVar.js'
import Html from '../../logic/html/Html/Html.js'

describe('InputVar',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('dom',() => {
		create_dom(domContent)
		const inputVar = new InputVar({kind:'range',min:0,val:2})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		inputVar.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirstHtml = inputVar.htmls[0]

		console.log('DOM',itemFirstHtml.el.innerHTML)

		it('value of DOM',() => {
			expect(itemFirstHtml.el.value).to.eql('2')
		})
		it('value of Model',() => {
			expect(inputVar.val).to.eql(2)
		})
		it('attribute:min',() => {
			expect(itemFirstHtml.el.getAttribute('min')).to.eql(0)
		})
		it('class',() => {
			expect(itemFirstHtml.el.classList.contains('someclass')).to.be(true)
			expect(itemFirstHtml.el.classList.contains('range')).to.be(true)
			expect(itemFirstHtml.el.classList.length).to.be(2)
		})
	})
	describe('change',() => {
		create_dom(domContent)
		const inputVar = new InputVar({kind:'range',min:0,val:2})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		inputVar.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirstHtml = inputVar.htmls[0]

		console.log('DOM',itemFirstHtml.el.innerHTML)

		inputVar.change({max:1})
		it('value of DOM',() => {
			expect(itemFirstHtml.el.value).to.eql('1')
		})
		it('value of Model',() => {
			expect(inputVar.val).to.eql(1)
		})
		it('attribute:min',() => {
			expect(itemFirstHtml.el.getAttribute('min')).to.eql(0)
		})
		it('attribute:max',() => {
			expect(itemFirstHtml.el.getAttribute('max')).to.eql(1)
		})
		it('class',() => {
			expect(itemFirstHtml.el.classList.contains('someclass')).to.be(true)
			expect(itemFirstHtml.el.classList.contains('range')).to.be(true)
			expect(itemFirstHtml.el.classList.length).to.be(2)
		})
	})
	describe('set float to empty string',() => {
		create_dom(domContent)
		const inputVar = new InputVar({kind:'float'})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		inputVar.dom(parentHtml)

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirstHtml = inputVar.htmls[0]

		inputVar.val = ''
		it('value of DOM',() => {
			expect(itemFirstHtml.el.value).to.eql('')
		})
		it('value of Model',() => {
			expect(inputVar.val).to.eql('')
		})
	})
})
