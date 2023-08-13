/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import El from './El.js'
describe('El',() => {
	describe('test empty node',() => {
		const body = create_dom('<div/>')
		const el = body.getElementsByTagName('div')[0]
		const elo = new El(el)
		it ('shall show name,id, and atts.id',() => {
			const ret = JSON.stringify(elo.all)
			expect(ret).to.eql('{"name":"DIV"}')
		})
	})
	describe('test empty node',() => {
		const body = create_dom('<input/>')
		const el = body.getElementsByTagName('input')[0]
		// const el = document.getElementById('myId')
		const elo = new El(el)
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
})
