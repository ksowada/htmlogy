/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Elem from './Elem.js'
describe('Elem',() => {
	describe('test empty node',() => {
		const body = create_dom('<div/>')
		const el = body.getElementsByTagName('div')[0]
		const elo = new Elem(el)
		it ('shall show name,id, and atts.id',() => {
			const ret = JSON.stringify(elo.all)
			expect(ret).to.eql('{"name":"DIV"}')
		})
	})
	describe('test empty node',() => {
		const body = create_dom('<input/>')
		const el = body.getElementsByTagName('input')[0]
		// const el = document.getElementById('myId')
		const elo = new Elem(el)
		el.id = '1'
		el.setAttribute('type','number')
		el.textContent = '300'
		el.style.backgroundColor = 'yellow'
		el.classList.add('blinking')
		it ('shall show every item',() => {
			const ret = JSON.stringify(elo.all)
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
})
