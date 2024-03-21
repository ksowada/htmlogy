/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../../HtmlTest/Html.JSDOM.js'
import InputVar from './InputVar.js'
import Html from '../../Html/Html.js'

describe('InputVar',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('dom for kind:range',() => {
		create_dom(domContent)
		const inputVar = new InputVar({kind:'range',min:0,val:2})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		inputVar.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirstHtml = inputVar.htmls[0]

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
	describe('change for kind:range',() => {
		create_dom(domContent)
		const inputVar = new InputVar({kind:'range',min:0,val:2})
		const parentHtml = new Html({parent:{id:myId},html:'div'})
		inputVar.dom(parentHtml,{css:'someclass'})

		// have to store vars here in it, it was another content from HtmlSelectTest
		const itemFirstHtml = inputVar.htmls[0]

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
	describe('kind:float; set float to empty string',() => {
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
	describe('kind:select',() => {
		describe('state after list populate',() => {
			localStorage.clear()
			create_dom(domContent)
			const inputVar = new InputVar({kind:'select'})
			const parentHtml = new Html({parent:{id:myId},html:'div'})
			inputVar.dom(parentHtml)
			const items = ['house','garden','fence']
			inputVar.set(items)

			it('inputVar.val show selected',() => {
				expect(inputVar.val).to.eql('house')
			})
			it('inputVar.lists[0].val show selected',() => {
				expect(inputVar.lists[0].val).to.eql('house')
			})
			it('inputVar.htmls[0].val show selected',() => {
				expect(inputVar.htmls[0].val).to.eql('house')
			})
			it('inputVar.htmls[0].el.value show selected',() => {
				expect(inputVar.htmls[0].el.value).to.eql('house')
			})
			it('inputVar.htmls[0].el.outerHTML as expected',() => {
				expect(inputVar.htmls[0].el.outerHTML).to.eql('<select><option>house</option><option>garden</option><option>fence</option></select>')
			})
		})
		describe('state after list populate and set other item',() => {
			localStorage.clear()
			create_dom(domContent)
			const inputVar = new InputVar({kind:'select'})
			const parentHtml = new Html({parent:{id:myId},html:'div'})
			inputVar.dom(parentHtml)
			const items = ['house','garden','fence']
			inputVar.set(items)
			inputVar.set('garden')

			it('inputVar.val show selected',() => {
				expect(inputVar.val).to.eql('garden')
			})
			it('inputVar.lists[0].val show selected',() => {
				expect(inputVar.lists[0].val).to.eql('garden')
			})
			it('inputVar.htmls[0].val show selected',() => {
				expect(inputVar.htmls[0].val).to.eql('garden')
			})
			it('inputVar.htmls[0].el.value show selected',() => {
				expect(inputVar.htmls[0].el.value).to.eql('garden')
			})
		})
		describe('select with label',() => {
			localStorage.clear()
			create_dom(domContent)
			const inputVar = new InputVar({kind:'select',label:'choose'})
			const parentHtml = new Html({parent:{id:myId},html:'div'})
			inputVar.dom(parentHtml)
			const items = ['house','garden','fence']
			inputVar.set(items)

			it('inputVar.val show selected',() => {
				expect(inputVar.val).to.eql('house')
			})
			it('inputVar.lists[0].val show selected',() => {
				expect(inputVar.lists[0].val).to.eql('house')
			})
			it('inputVar.htmls[0].val show selected',() => {
				expect(inputVar.htmls[0].val).to.eql('house')
			})
			it('inputVar.htmls[0].el.value show selected',() => {
				expect(inputVar.htmls[0].el.value).to.eql('house')
			})
			it('inputVar.htmls[0].el.outerHTML as expected',() => {
				expect(inputVar.htmls[0].el.outerHTML).to.eql('<select><option>house</option><option>garden</option><option>fence</option></select>')
			})
			it('parentHtml.el.innerHTML as expected',() => {
				expect(parentHtml.el.innerHTML).to.eql('<div><span>choose</span><select><option>house</option><option>garden</option><option>fence</option></select></div>')
			})
		})
		describe('evt with label',() => {
			const callback = () => {}
			create_dom(domContent)
			const input = new InputVar({kind:'evt',label:'reset!',change:callback,css:'btn btn-active btn-secondary'})
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
})
