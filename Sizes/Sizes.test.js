/* eslint-disable no-undef */
import expect from 'expect.js'
import Sizes from './Sizes.js'

describe('Sizes',() => {
	let tv = {width:3840,height:2160} // f.e. from Philips 65OLED937 (4K Ultra HD OLED)
	let pal = {width:788,height:576} // from PAL at 4:3
	describe('matchBoundsKeepProp: bound PAL to 4K Ultra HD',() => {
		let pal_enlarged = Sizes.matchBoundsKeepProp(tv,pal)
		it('matches height to pal height',() => {
			expect(pal_enlarged.height).to.be(2160)
		})
		it('matches width to pal proportional',() => {
			expect(pal_enlarged.width).to.be(2955)
		})
	})
	describe('matchBoundsKeepProp: bound 4K Ultra HD into smaller PAL',() => {
		let pal_enlarged = Sizes.matchBoundsKeepProp(pal,tv)
		it('matches height to 4K proportion',() => {
			expect(pal_enlarged.height).to.be(443.25)
		})
		it('matches width to pal',() => {
			expect(pal_enlarged.width).to.be(788)
		})
	})
})