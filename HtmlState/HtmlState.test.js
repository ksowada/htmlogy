/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Html from '../Html/Html.js'
import HtmlState from './HtmlState.js'

describe('HtmlState',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc

	describe('refresh() named states',() => {
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		const htmlState = new HtmlState(masterObj,
			{states:['A','B'],
				createdEl:{
					css:['designA','designB'],
					val:['apple','banana']}},'A')
		htmlState.refresh()
		it('css is appended',() => {
			expect(masterObj.createdEl.my.el.classList.contains('designA')).to.be(true)
		})
		it('original css is maintained',() => {
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
		it('textContent is set',() => {
			expect(masterObj.createdEl.my.el.textContent==='apple').to.be(true)
		})
	})

	describe('refresh() numbered states with 1st zero-length css',() => {
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		const htmlState = new HtmlState(masterObj,
			{createdEl:{
				css:['','active']}})
		htmlState.refresh()
		it('css is untouched, due to zero-length css',() => {
			expect(masterObj.createdEl.my.el.classList.length).to.be(1)
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
	})
	describe('refresh() numbered states with 1st zero-length css',() => {
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		const htmlState = new HtmlState(masterObj,
			{createdEl:{
				css:['','active']}})
		htmlState.refresh()
		htmlState.inc_state()
		it('after inc_state(), css shall be set',() => {
			expect(masterObj.createdEl.my.el.classList.length).to.be(2)
			expect(masterObj.createdEl.my.el.classList.contains('active')).to.be(true)
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
	})
	describe('refresh() numbered states with 1st zero-length css',() => {
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		const htmlState = new HtmlState(masterObj,
			{createdEl:{
				css:['','active']}})
		htmlState.refresh()
		htmlState.inc_state()
		htmlState.inc_state()
		it('after 2nd inc_state(), css is restored to no-class, due to zero-length css',() => {
			expect(masterObj.createdEl.my.el.classList.length).to.be(1)
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
	})
	describe('inc_state',() => {
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		const htmlState = new HtmlState(masterObj,
			{states:['A','B'],
				createdEl:{
					css:['designA','designB'],
					val:['apple','banana']}},'A')
		htmlState.refresh()
		htmlState.inc_state()
		it('old css is changed',() => {
			expect(masterObj.createdEl.my.el.classList.contains('designA')).to.be(false)
		})
		it('new css is changed',() => {
			expect(masterObj.createdEl.my.el.classList.contains('designB')).to.be(true)
		})
		it('original css is maintained',() => {
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
		it('textContent is correctly reset',() => {
			expect(masterObj.createdEl.my.el.textContent==='banana').to.be(true)
		})
	})
})
