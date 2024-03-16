class TimeDisplay {
	constructor(obj) {
	}
	dom(html, time) {
		const flex_css = 'flex flex-col p-2 bg-neutral rounded-box text-neutral-content'
		const digit_css = 'countdown font-mono text-5xl'
		this.grid = html.add({name:'grid',html:'div',css:'grid grid-flow-col gap-5 text-center auto-cols-max'})

		// use TimeRow.units

		this.grid.add({name:'flex_col',html:'div',css:flex_css,val:'hour'})
		this.grid.flex_col.add({name:'countdown',html:'span',css:digit_css})
		this.grid.flex_col.countdown.add({name:'span',html:'span',styles:{'--value':10}})

		this.grid.add({name:'p_2',html:'div',css:flex_css,val:'min'})
		this.grid.p_2.add({name:'countdown',html:'span',css:digit_css})
		this.grid.p_2.countdown.add({name:'span',html:'span',styles:{'--value':24}})

		this.grid.add({name:'bg_neutral',html:'div',css:flex_css,val:'sec'})
		this.grid.bg_neutral.add({name:'countdown',html:'span',css:digit_css})
		this.grid.bg_neutral.countdown.add({name:'span',html:'span',styles:{'--value':2}})
	}
}
export default TimeDisplay