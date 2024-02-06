/* eslint-disable no-undef */
import expect from 'expect.js'
import {create_dom} from '../HtmlTest/Html.JSDOM.js'
import Html from './Html.js'
import HtmlElComp from '../HtmlComp/HtmlElComp.js'
import Elem from '../Elem/Elem.js'
describe('Html',() => {
	const myId = 'myId'
	const domContent = '<main id="'+myId+'"></main>' // will be surrounded from html/body etc
	describe('mergeDatas',() => {
		const test={html:'video',css:'aspect-ratio',atts:{id:'vimeo',draggable:true}}
		const enrich={css:'HQ',html:'iframe',atts:{id:'youtube',title:'long-version'}}
		const ret = Html.mergeDatas(undefined,test,{},enrich)
		it('overwrite single string item from right',() => {
			expect(ret.html).to.be('iframe')
		})
		it('concat css to list',() => {
			expect(ret.css).to.be('aspect-ratio HQ')
		})
		it('overwrite 2nd level item from right',() => {
			expect(ret.atts.id).to.be('youtube')
		})
		it('attach unknown 2nd level item',() => {
			expect(ret.atts.draggable).to.be(true)
		})
	})
	describe('mergeDatas 2nd level',() => {
		const test={container:{html:'video',css:'aspect-ratio',atts:{id:'vimeo',draggable:true}}}
		const enrich={container:{css:'HQ',html:'iframe',atts:{id:'youtube',title:'long-version'}}}
		const ret = Html.mergeDatas(undefined,test,{},enrich)
		it('overwrite single string item from right',() => {
			expect(ret.container.html).to.be('iframe')
		})
		it('concat css to list',() => {
			expect(ret.container.css).to.be('aspect-ratio HQ')
		})
		it('overwrite 3nd level item from right',() => {
			expect(ret.container.atts.id).to.be('youtube')
		})
		it('attach unknown 3nd level item',() => {
			expect(ret.container.atts.draggable).to.be(true)
		})
	})
	describe('mergeModDatas',() => {
		const test={html:'video',css:'aspect-ratio',atts:{id:'vimeo',draggable:true}}
		const enrich={css:'HQ',html:'iframe',atts:{id:'youtube',title:'long-version'}}
		const ret = {}
		Html.mergeModDatas(ret,undefined,test,{},enrich)
		it('overwrite single string item from right',() => {
			expect(ret.html).to.be('iframe')
		})
		it('concat css to list',() => {
			expect(ret.css).to.be('aspect-ratio HQ')
		})
		it('overwrite 2nd level item from right',() => {
			expect(ret.atts.id).to.be('youtube')
		})
		it('attach unknown 2nd level item',() => {
			expect(ret.atts.draggable).to.be(true)
		})
	})
	describe('constructor only',() => {
		const el = create_dom(domContent)
		// eslint-disable-next-line no-new
		new Html({parent:{el},html:'div',val:'test'})
		it('created tag with val',() => {
			expect(Elem.getChildsFirstVal(el,'div')).to.eql('test')
		})
	})
	describe('use of .domLater',() => {
		describe('constructor will not dom()',() => {
			const el = create_dom(domContent)
			// eslint-disable-next-line no-new
			new Html({parent:{el},html:'div',val:'test',domLater:true})
			it('created no element in DOM',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.be(undefined)
			})
		})
		describe('call dom() later',() => {
			const el = create_dom(domContent)
			// eslint-disable-next-line no-new
			const html = new Html({parent:{el},html:'div',val:'test',domLater:true})
			html.render()
			it('created element in DOM',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('test')
			})
		})
		describe('call dom() later, with some additional arguments',() => {
			const el = create_dom(domContent)
			const html = new Html({html:'div',val:'test',domLater:true})
			html.render({parent:{el}})
			it('created soemthing in DOM',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('test')
			})
		})
		describe('call dom() later, but have prepared childs',() => {
			const el = create_dom(domContent)
			// eslint-disable-next-line no-new
			const html = new Html({parent:{el},html:'div',val:'test',domLater:true})
			html.add({id:'boy'})
			html.add({id:'girl'})
			html.render()
			it('created element in DOM',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('test')
			})
			it('have succesive boy and girl childs',() => {
				expect(Elem.getChilds(html.my.el)[0].id).to.eql('boy')
				expect(Elem.getChilds(html.my.el)[1].id).to.eql('girl')
			})
		})
		describe('call dom() later, but have prepared childs, deliver parent later at render',() => {
			const el = create_dom(domContent)
			// eslint-disable-next-line no-new
			const html = new Html({html:'div',val:'test',domLater:true})
			html.add({id:'boy'})
			html.add({id:'girl'})
			html.render({parent:{el}})
			it('created element in DOM',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('test')
			})
			it('have succesive boy and girl childs',() => {
				expect(Elem.getChilds(html.my.el)[0].id).to.eql('boy')
				expect(Elem.getChilds(html.my.el)[1].id).to.eql('girl')
			})
		})
		// TODO deliver parent with render()
	})
	describe('constructor creates a var',() => {
		create_dom(domContent)
		const testEl = document.getElementById(myId)
		const myTestId = 'another-id'
		const createdHtml = new Html({parent:{el: testEl},css:['a',undefined,'new testClass '],val:'citrone',id:myTestId})
		it('add {id} to created Element',() => {
			expect(createdHtml.my.el.id).to.be(myTestId)
		})
		it('add {id} to atts',() => {
			expect(createdHtml.arg.atts.id).to.be(myTestId)
		})
		it('leave {id}',() => {
			expect(createdHtml.arg.id).to.be(myTestId)
		})
		it('check for html content in .my.el',() => {
			expect(createdHtml.my.el.textContent).to.be('citrone')
		})
		it('check for html content in .top.el',() => {
			expect(createdHtml.top.el.textContent).to.be('citrone')
		})
		it('check for css class "a"',() => {
			// expect(createdEl.my.el.getAttribute('class')).to.be('a new test')
			expect(createdHtml.my.el.classList.contains('a')).to.be(true)
		})
		it('check for css class "new"',() => {
			expect(createdHtml.my.el.classList.contains('new')).to.be(true)
		})
		it('check for css class "testClass"',() => {
			expect(createdHtml.my.el.classList.contains('testClass')).to.be(true)
		})
		it('check for css class "notIncluded"',() => {
			expect(createdHtml.my.el.classList.contains('notIncluded')).to.be(false)
		})
		it('check for css class count',() => {
			// expect(createdEl.my.el.getAttribute('class')).to.be('a new test')
			expect(createdHtml.my.el.classList.length).to.be(3)
		})
	})
	describe('create2 alternative',() => { // just extra test, because issues in HtmlState.test.js
		const el = create_dom(domContent)
		const masterObj = {}
		masterObj.createdEl = new Html({parent:{el},html:'div',css:'styleful',val:'so wordly'})
		it('css is set',() => {
			expect(masterObj.createdEl.my.el.classList.contains('styleful')).to.be(true)
		})
		it('css is 1-class only',() => {
			expect(masterObj.createdEl.my.el.classList.length).to.be(1)
		})
		// it('Html.css shall contain given css only',() => {
		// 	expect(masterObj.createdEl.css).to.be('styleful')
		// })
	})
	describe('construct Html by existing id via .my',() => { // just extra test, because issues in HtmlState.test.js
		create_dom(domContent)
		const newHtml = new Html({my:{id:myId}})
		const addedHtml = newHtml.add({id:'aId'})
		it('add element to existing element',() => {
			expect(addedHtml.my.el.id).to.be('aId')
		})
	})
	describe('construct by add()',() => { // tested also in other case
		describe('with arg',() => {
			create_dom(domContent)
			const newHtml = new Html({my:{id:myId}})
			const addedHtml = newHtml.add({id:'aId'})
			it('add {id} to created Element',() => {
				expect(addedHtml.my.el.id).to.be('aId')
			})
		})
		describe('with Html',() => {
			create_dom(domContent)
			const newHtml = new Html({my:{id:myId}})
			const addHtml = new Html({id:'aId'})
			const addedHtml = newHtml.add(addHtml)
			it('add {id} to created Element',() => {
				expect(addedHtml.my.el.id).to.be('aId')
			})
		})
	})
	describe('change',() => {
		describe('change val',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',val:'citrone'})
			const changed = createdEl.change({val:'cherry'})
			it('sets value',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('cherry')
			})
			it('detect change',() => {
				expect(changed).to.eql(true)
			})
		})
		describe('changed val to original',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',val:'citrone'})
			const changed = createdEl.change({val:'citrone'})
			it('sets value',() => {
				expect(Elem.getChildsFirstVal(el,'div')).to.eql('citrone')
			})
			it('detect change',() => {
				expect(changed).to.eql(false)
			})
		})
		it('add {id} to atts',() => {
			const el = create_dom(domContent)
			const id = 3
			const createdEl = new Html({parent:{el},val:'citrone',id:id})
			expect(createdEl.arg.atts.id).to.eql(id)
		})
		it('changed css',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',css:'style1',val:'citrone'})
			createdEl.change({css:'style2',val:'cherry'})
			expect(createdEl.my.el.classList.contains('style1')).to.be(false)
			expect(createdEl.my.el.classList.contains('style2')).to.be(true)
		})
		it('created & changed icon',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',icon:'star',val:'citrone'})
			expect(createdEl.my.el.firstChild.localName=='span').to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.localName=='i').to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.classList.contains('star')).to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.classList.length==1).to.be(true)

			createdEl.change({icon:'galaxy',val:'cherry'})
			expect(createdEl.my.el.firstChild.localName=='span').to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.localName=='i').to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.classList.contains('galaxy')).to.be(true)
			expect(createdEl.my.el.firstChild.firstChild.classList.length==1).to.be(true)
		})
		it ('change atts=""',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el}})
			createdEl.change({atts:{autoplay:''}})
			expect(createdEl.my.el.getAttribute('autoplay')).to.be('')
		})
	})
	describe('remove',() => {
		it('remove atts by \'\'',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',atts:{title:'lemon',id:'3'}})
			// expect(createdEl.my.el.getAttribute('title')).to.be('lemon')
			createdEl.remove({atts:{title:undefined}})
			expect(createdEl.my.el.getAttribute('title')).to.be(null)
			expect(createdEl.my.el.getAttribute('id')).to.be('3')
		})
		it('remove atts by undefined',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',val:'citrone',atts:{title:'lemon'}})
			expect(createdEl.my.el.getAttribute('title')).to.be('lemon')
			createdEl.remove({atts:{title:undefined}})
			expect(createdEl.my.el.getAttribute('title')).to.be(null)
		})
		it('remove atts when it is existing',() => {
			const el = create_dom(domContent)
			const createdEl = new Html({parent:{el},html:'div',val:'citrone',atts:{title:'lemon'}})
			expect(createdEl.my.el.getAttribute('title')).to.be('lemon')
			createdEl.remove({atts:{title:'citronella'}})
			expect(createdEl.my.el.getAttribute('title')).to.be('lemon')
			createdEl.remove({atts:{title:'lemon'}})
			expect(createdEl.my.el.getAttribute('title')).to.be(null)
		})
	})
	describe('classStateSet',() => {
		describe('change with ix',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'off',val:'citrone'})
			const cssList = ['on','off']
			Elem.classStateSet(createdEl.my.el,0,cssList)
			it('setted new Class',() => {
				expect(createdEl.my.el.classList.contains('on')).to.eql(true)
			})
			it('removed old Class',() => {
				expect(createdEl.my.el.classList.contains('off')).to.eql(false)
			})
		})
		describe('change with string from List',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'off',val:'citrone'})
			const cssList = ['on','off']
			Elem.classStateSet(createdEl.my.el,'on',cssList)
			it('setted new Class',() => {
				expect(createdEl.my.el.classList.contains('on')).to.eql(true)
			})
			it('removed old Class',() => {
				expect(createdEl.my.el.classList.contains('off')).to.eql(false)
			})
		})
		describe('set with filled string from List with 2nd empty',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'',val:'citrone'})
			const cssList = ['mono','']
			Elem.classStateSet(createdEl.my.el,'mono',cssList)
			it('setted new Class',() => {
				expect(createdEl.my.el.classList.contains('mono')).to.eql(true)
			})
		})
		describe('set with empty string from List with 2nd empty',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'static',val:'citrone'})
			const cssList = ['uno','']
			Elem.classStateSet(createdEl.my.el,'',cssList)
			it('setted new class',() => {
				expect(createdEl.my.el.classList.contains('uno')).to.eql(false)
			})
			it('classList has old class and no more',() => {
				expect(createdEl.my.el.classList.contains('static')).to.eql(true)
				expect(createdEl.my.el.classList.length).to.eql(1)
			})
			it('cssList is unchanged',() => {
				expect(cssList.length).to.eql(2) // had been cleaned by Str.clean1, thats caused this test
			})
		})
		describe('set with number from List with 2nd empty',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'static',val:'citrone'})
			const cssList = ['','due']
			Elem.classStateSet(createdEl.my.el,1,cssList)
			it('setted new class',() => {
				expect(createdEl.my.el.classList.contains('due')).to.eql(true)
			})
			it('cssList is unchanged',() => {
				expect(cssList.length).to.eql(2) // had been cleaned by Str.clean1, thats caused this test
			})
		})
		describe('change with string and no List',() => {
			const parentEl = create_dom(domContent)
			// document.getElementById('a')
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'off',val:'citrone'})
			Elem.classStateSet(createdEl.my.el,'on')
			it('setted new Class',() => {
				expect(createdEl.my.el.classList.contains('on')).to.eql(true)
			})
			it('could not remove old Class',() => {
				expect(createdEl.my.el.classList.contains('off')).to.eql(true)
			})
		})
	})
	describe('classStateGet',() => {
		describe('change with ix',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'off',val:'citrone'})
			const cssList = ['on','off']
			const cssGiven = Elem.classStateGet(createdEl.my.el,cssList)
			it('only item found',() => {
				expect(cssGiven[0].name).to.eql('off')
				expect(cssGiven.length).to.eql(1)
			})
		})
	})
	describe('classStateIncr',() => {
		describe('toggle from A to B',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'A',val:'citrone'})
			const cssList = ['A','B']
			const stateInfo = Elem.classStateIncr(createdEl.my.el,cssList)
			it('incremented to B',() => {
				expect(stateInfo.ix).to.eql(1)
				expect(stateInfo.name).to.eql('B')
				expect(createdEl.my.el.classList.contains('A')).to.eql(false)
				expect(createdEl.my.el.classList.contains('B')).to.eql(true)
			})
		})
		describe('toggle from B to A',() => {
			const parentEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: parentEl},html:'div',css:'B',val:'citrone'})
			const cssList = ['A','B']
			const stateInfo = Elem.classStateIncr(createdEl.my.el,cssList)
			it('incremented to A (overflowed)',() => {
				expect(stateInfo.ix).to.eql(0)
				expect(stateInfo.name).to.eql('A')
				expect(createdEl.my.el.classList.contains('A')).to.eql(true)
				expect(createdEl.my.el.classList.contains('B')).to.eql(false)
			})
		})
	})
	describe('getEl',() => {
		const testId = 'oneId'
		it('supply Element',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',id:testId})
			const el = Html.getEl(createdEl.my.el)
			expect(el.isSameNode(createdEl.my.el)).to.be(true)
		})
		it('supply id as string',() => {
			create_dom('<p id="3">cherry</p>')
			const el = Html.getEl('3')
			expect(el).not.to.be(null)
		})
		it('supply id as integer',() => {
			create_dom('<p id="3">cherry</p>')
			const el = Html.getEl(3)
			expect(el).not.to.be(null)
		})
		it('adressing wrong id, return null',() => {
			create_dom('<p id="3">cherry</p>')
			const el = Html.getEl(2)
			expect(el).to.be(null)
		})
		it('supply Html',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',id:testId})
			const el = Html.getEl(createdEl)
			expect(el.isSameNode(createdEl.my.el)).to.be(true)
		})
		it('supply HtmlElComp',() => {
			const rootEl = create_dom(domContent)
			const comp = new HtmlElComp({parent:{el: rootEl},html:'div',val:'citrone',id:'oneId'})
			const el = Html.getEl(comp)
			expect(el.isSameNode(comp.div)).to.be(true)
		})
		it('supply nothing, return undefined',() => {
			create_dom(domContent)
			const el = Html.getEl(undefined)
			expect(el).to.be(undefined)
		})
		// it('compare Element taken from Html with fresh founded in document',() => {
		// 	const equalEl = Elem.equalEl(createdEl.my.el,document.getElementById('oneId'))
		// 	expect(equalEl).to.be(true)
		// })
		// it('compare Element with id given as string',() => {
		// 	const equalEl = Elem.equalEl(document.getElementById('oneId'),'oneId'))
		// 	expect(equalEl).to.be(false)
		// })
	})
	describe('equalEl',() => {
		it('compare identic Element with Html',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},container:{},html:'div',val:'citrone',atts:{id:'oneId'}})
			const equalEl = Elem.equalEl(createdEl.my.el,createdEl)
			expect(equalEl).to.be(true)
		})
		it('escalate when adressing could not found Element',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',atts:{id:'oneId'}})
			const equalEl = Elem.equalEl(createdEl.my,createdEl.containerObj)
			expect(equalEl).to.be(undefined)
		})
		it('escalate when adressing could not found Element',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',atts:{id:'oneId'}})
			const equalEl = Elem.equalEl(createdEl.my,createdEl.containerObj)
			expect(equalEl).to.be(undefined)
		})
		it('escalate when 1 item is undefined',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',atts:{id:'oneId'}})
			const equalEl = Elem.equalEl(createdEl.my,undefined)
			expect(equalEl).to.be(undefined)
		})
		it('true when only 1 item is given',() => {
			const rootEl = create_dom(domContent)
			const createdEl = new Html({parent:{el: rootEl},container:{},html:'div',val:'citrone',atts:{id:'oneId'}})
			const equalEl = Elem.equalEl(createdEl.my)
			expect(equalEl).to.be(true)
		})
	})
	describe('findParent',() => {
		describe('call with no el given',() => {
			create_dom(domContent)
			const retEl = Elem.findParent()
			it('returns undefined',() => {
				expect(retEl).to.be(undefined)
			})
		})
		describe('call with only el when el has parent',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const subEl = new Html({parent:{obj: createdEl},html:'div',val:'citrone'})
			const retEl = Elem.findParent(subEl.my.el)
			it('returns its parent',() => {
				expect(Elem.equalEl(retEl,createdEl)).to.be(true)
			})
		})
		describe('call with only el when el has no parent',() => {
			create_dom()
			const testEl = document.getElementsByTagName('html').item(0)
			const retEl = Elem.findParent(testEl)
			it('returns undefined',() => {
				expect(retEl).to.be(undefined)
			})
		})
		describe('call with parentStop',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const el1 = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const el2 = new Html({parent:{obj: el1},html:'div',val:'citrone'})
			const el3 = new Html({parent:{obj: el2},html:'div',val:'limette'})
			const retEl = Elem.findParent(el3.my.el,el1.my.el)
			it('returns the given parent',() => {
				expect(Elem.equalEl(retEl,el1)).to.be(true)
			})
		})
		describe('call with parentStop, but parentEl is el',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const el1 = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const retEl = Elem.findParent(el1.my.el,el1.my.el)
			it('returns itself',() => {
				expect(Elem.equalEl(retEl,el1)).to.be(true) // TODO not right
			})
		})
		describe('call with parentStop, but parentEl is not valid parent of el',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const el1 = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const el1_1 = new Html({parent:{obj: el1},html:'div',val:'citrone'})
			const el1_2 = new Html({parent:{obj: el1},html:'div',val:'lemone'})
			const retEl = Elem.findParent(el1_1.my.el,el1_2.my.el)
			it('returns undefined, as parentEl is not parent of el ',() => {
				expect(retEl).to.be(undefined)
			})
		})
		describe('call with no parentDepth',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},container:{id:'div-lvl-1'},html:'div',val:'grapefruit'})
			const parentEl = Elem.findParent(createdEl.my.el)
			it('returns parent',() => {
				expect(Elem.equalEl(parentEl,createdEl.top.el)).to.be(true)
			})
		})
		describe('call with parentDepth:0',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			// eslint-disable-next-line no-unused-vars
			const subEl = new Html({parent:{obj: createdEl},html:'div',val:'citrone'})
			const retEl = Elem.findParent(createdEl.my.el,undefined,0)
			it('returns itself',() => {
				expect(Elem.equalEl(retEl,createdEl)).to.be(true)
			})
		})
		describe('call with parentDepth:1',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			// eslint-disable-next-line no-unused-vars
			const subEl = new Html({parent:{obj: createdEl},html:'div',val:'citrone'})
			const retEl = Elem.findParent(createdEl.my.el,undefined,1)
			it('returns its grandPa',() => {
				expect(Elem.equalEl(retEl,testEl)).to.be(true)
			})
		})
		describe('call with parentDepth:2',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const subEl = new Html({parent:{obj: createdEl},html:'div',val:'citrone'})
			const retEl = Elem.findParent(subEl.my.el,undefined,2)
			it('returns its grandGrandPa',() => {
				expect(Elem.equalEl(retEl,testEl)).to.be(true)
			})
		})
		describe('call with parentDepth:4 but there is no parent more available',() => {
			create_dom(domContent)
			const testEl = document.getElementById(myId)
			const createdEl = new Html({parent:{el: testEl},html:'div',val:'grapefruit'})
			const retEl = Elem.findParent(createdEl.my.el,undefined,4)
			it('returns undefined',() => {
				expect(retEl).to.be(undefined)
			})
		})
	})
})
