/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Elem from './Elem.js'
import Html from './../Html/Html.js'
describe('Elem',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc
	describe('test empty node',() => {
		const body = create_dom('<div/>')
		const el = body.getElementsByTagName('div')[0]
		const elem = new Elem(el)
		it ('shall show name,id, and atts.id',() => {
			const ret = JSON.stringify(elem.all)
			expect(ret).to.eql('{"name":"DIV"}')
		})
	})
	describe('test empty node',() => {
		const body = create_dom('<input/>')
		const el = body.getElementsByTagName('input')[0]
		// const el = document.getElementById('myId')
		const elem = new Elem(el)
		el.id = '1'
		el.setAttribute('type','number')
		el.textContent = '300'
		el.style.backgroundColor = 'yellow'
		el.classList.add('blinking')
		it ('shall show every item',() => {
			const ret = JSON.stringify(elem.all)
			expect(ret).to.eql('{"name":"INPUT","css":"blinking","styles":"background-color: yellow;","id":"1","atts":{"id":"1","type":"number","style":"background-color: yellow;","class":"blinking"},"val":"300"}')
		})
	})
	describe('tag',() => {
		it ('closed htmltag',() => {
			const html = '<div/>'
			const ret = Elem.tag(html)
			expect(ret).to.eql('div')
		})
		it ('untrimmed html with atts',() => {
			const html = '  <div class="cherry" />'
			const ret = Elem.tag(html)
			expect(ret).to.eql('div')
		})
	})
	describe('omitEndTag',() => {
		it ('closed htmltag',() => {
			const ret = Elem.omitEndTag('<div/>')
			expect(ret).to.eql('<div/>')
		})
		it ('untrimmed html with atts',() => {
			const ret = Elem.omitEndTag('  <div class="cherry" />')
			expect(ret).to.eql('<div class="cherry" />')
		})
		it ('untrimmed html with atts and end tag',() => {
			const ret = Elem.omitEndTag('  <div class="cherry">E></div>')
			expect(ret).to.eql('<div class="cherry">E>')
		})

		it ('untrimmed html with atts and missing end tag',() => {
			const ret = Elem.omitEndTag('  <div class="cherry">E>')
			expect(ret).to.eql('<div class="cherry">E>')
		})
	})
	describe('textContentAdd',() => {
		describe('add some text at given no textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			Elem.textContentAdd(testEl,'🥕')
			it('returns only added content',() => {
				expect(testEl.textContent).to.be('🥕')
			})
		})
		describe('add some text at given some initial textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			testEl.textContent = '🐰'
			Elem.textContentAdd(testEl,'🥕')
			it('returns concated content',() => {
				expect(testEl.textContent).to.be('🐰🥕')
			})
		})
		describe('add undefined at given some initial textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			testEl.textContent = '🐰'
			Elem.textContentAdd(testEl,undefined)
			it('returns only original content',() => {
				expect(testEl.textContent).to.be('🐰')
			})
		})
		describe('add text content at an input with given value',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const inputEl = new Html({parent:{el: testEl},html:'input',val:'🐟',atts:{'type':'text'}})
			Elem.textContentAdd(inputEl.my.el,'🌊')
			it('input value becomes concatenated',() => {
				expect(inputEl.my.el.value).to.be('🐟🌊')
			})
		})
	})
	describe('textContentSet',() => {
		describe('set empty string at given textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			testEl.textContent = '🐰'
			const changed = Elem.textContentSet(testEl,'')
			it('returns true, as changed',() => {
				expect(changed).to.be(true)
			})
			it('content as expected',() => {
				expect(testEl.textContent).to.be('')
			})
		})
		describe('set empty string at given no textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const changed = Elem.textContentSet(testEl,'')
			it('returns false, as unchanged',() => {
				expect(changed).to.be(false)
			})
			it('returns new content',() => {
				expect(testEl.textContent).to.be('')
			})
		})
		describe('set some text at given no textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			Elem.textContentSet(testEl,'🥕')
			it('returns new content',() => {
				expect(testEl.textContent).to.be('🥕')
			})
		})
		describe('set some text at given some initial textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			testEl.textContent = '🐰'
			Elem.textContentSet(testEl,'🥕')
			it('returns new content',() => {
				expect(testEl.textContent).to.be('🥕')
			})
		})
		describe('set undefined at given some initial textContent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			testEl.textContent = '🐰'
			Elem.textContentSet(testEl,undefined)
			it('returns original content',() => {
				expect(testEl.textContent).to.be('🐰')
			})
		})
		describe('set text content at an input with given value',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const inputEl = new Html({parent:{el: testEl},html:'input',val:'🐟',atts:{'type':'text'}})
			Elem.textContentSet(inputEl.my.el,'🌊')
			it('input value changes',() => {
				expect(inputEl.my.el.value).to.be('🌊')
			})
		})
		describe('findActions',() => {
			create_dom(domContent)
			const headEl = document.head // implicitly created
			const search = {html:'title'}
			const edit = {val:'test'}
			Elem.findActions(headEl,search,edit,document)
			it('was empty el and has now created element',() => {
				expect(Elem.getChildsFirstVal(headEl,'title')).to.eql('test')
			})
		})
		describe('findActions replace existing element',() => {
			create_dom(domContent)
			const headEl = document.head // implicitly created
			const search = {html:'title'}
			const edit = {val:'test'}

			new Html({parent:{el:headEl},html:'title',val:'old title'})
			Elem.findActions(headEl,{html:'title'},{val:'new title'})
			it('title shall be replaced',() => {
				expect(Elem.getChildsFirstVal(headEl,'title')).to.eql('new title')
			})
		})
		describe('findActions',() => {
			describe('create a new element, as no existing found',() => {
				create_dom(domContent)
				const headEl = Elem.getElByNameFirst('head')
				const id = 'desc1'
				const description = 'a description'
				Elem.findActions(headEl,{html: 'meta',atts: {name: 'description'}},{atts: {content: description},id:id})
				const foundEl = document.head.getElementsByTagName('meta').item(0)
				it('description added',() => {
					expect(foundEl.getAttribute('name')).to.be('description')
					expect(foundEl.getAttribute('content')).to.be(description)
				})
			})
			describe('create a new element, 1 existing tag found, but not further atts found',() => {
				create_dom(domContent)
				const headEl = Elem.getElByNameFirst('head')
				new Html({parent:{el:headEl},html:'meta',atts: {name: 'keywords'}})
				const id = 'desc1'
				const description = 'a description'
				Elem.findActions(headEl,{html: 'meta',atts: {name: 'description'}},{atts: {content: description},id:id})
				const foundEl = document.head.getElementsByTagName('meta').item(1)
				it('description added',() => {
					expect(foundEl.getAttribute('name')).to.be('description')
					expect(foundEl.getAttribute('content')).to.be(description)
				})
			})
			describe('create a new element, but 1 existing tag with further serached att found, shall be replaced',() => {
				create_dom(domContent)
				const headEl = Elem.getElByNameFirst('head')
				new Html({parent:{el:headEl},html:'meta',atts: {name: 'description',content: 'old description'}})
				const id = 'desc1'
				const description = 'a description'
				Elem.findActions(headEl,{html: 'meta',atts: {name: 'description'}},{atts: {content: description},id:id})
				const foundEl = document.head.getElementsByTagName('meta').item(0)
				it('description added',() => {
					expect(foundEl.getAttribute('name')).to.be('description')
					expect(foundEl.getAttribute('content')).to.be(description)
				})
			})
		})
	})
})
