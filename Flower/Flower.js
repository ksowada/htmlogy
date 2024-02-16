import './Flower.scss'
import Html from '../html/Html/Html.js'
import Arr from '../../logic/Arr/Arr.js'
import HtmlComp from '../html/HtmlComp.js'
import Elem from '../html/Elem/Elem.js'
import Toolbar from '../../HtmlComponents/Toolbar/Toolbar.js/index.js'
import Sizes from '../html/Sizes/Sizes.js'
import Times from '../../logic/Times'

/**
 * @class Flower of Live with SVG
 * @augments HtmlComp
 */
class Flower extends HtmlComp {
	constructor(arg) {
		super(arg)
		this.xmlns = 'http://www.w3.org/2000/svg'
		super.constructed()
	}
	dom() {
		Times.log('Flower.dom')
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		const toolbarItems = {} // TODO use style for set background-color with root.color
		toolbarItems['red'] = {css:'btn red',styles:{'background-color':'red'},evts:{'click':this.toolbarClick.bind(this)}}
		toolbarItems['blue'] = {css:'btn blue',styles:{'background-color':'blue'},evts:{'click':this.toolbarClick.bind(this)}}
		toolbarItems['green'] = {css:'btn green',styles:{'background-color':'green'},evts:{'click':this.toolbarClick.bind(this)}}
		this.btns = new Toolbar({parent:{obj:this.containerObj},items:toolbarItems})

		const dims = Elem.dimensions(this.containerObj.my.el)
		dims.min = Math.min(dims.width,dims.height)
		this.width = dims.min
		this.height = dims.min
		this.radius = dims.min/10
		this.stepAng = Math.PI * 2 / 6.0
		this.maxDepth = 2
		this.svg = new Html({parent:{obj:this.containerObj},html:'svg',htmlNS:this.xmlns,css:'flower content',atts:{width: this.width,height: this.height},evts:{'mouseover':this.mouseover.bind(this),'mouseout':this.mouseout.bind(this)}}) // TODO use obj everywhere else
		this.circles = []
		let circles = this.calcCircles(0,this.width / 2,this.height / 2,[])
		circles = Arr.unique(circles)
		circles.forEach(circle => {
			this.appendCircle(circle)
		})
		this.footer = new Html({parent:{obj:this.containerObj},html:'div',css:'footer',val:'ardoid.de'}) // TODO pkg.name
		// after all rows of page resize SVG
		Sizes.center(this.svg.my.el,this.width,this.height)
	}
	// TODO on resize update
	sin(x,i) {
		return Math.round((x + Math.sin(this.stepAng * i) * this.radius) * 100) / 100
	}
	cos(x,i) {
		return Math.round((x + Math.cos(this.stepAng * i) * this.radius) * 100) / 100
	}
	calcCircles(depth,x,y,coords) {
		if (depth++ > this.maxDepth) return
		for (var i = 0; i < 6; i++) {
			var newX = this.cos(x,i)
			var newY = this.sin(y,i)
			coords.push(newX + '-' + newY)
			this.calcCircles(depth,newX,newY,coords)
		}
		return coords
	}
	appendCircle(coord) {
		coord = coord.split('-')
		const atts = {
			'cx':coord[0],
			'cy':coord[1],
			'r':this.radius,
			'class':'circle'
		}
		this.circles.push(new Html({parent:{obj:this.svg},html:'circle',htmlNS:this.xmlns,atts}))
	}
	toolbarClick(evt,key) {
		Times.log('toolbarClick')
		Times.log(evt)
		Times.log(key)
	}
	mouseover(evt) {
		const evtPoint = [evt.offsetX,evt.offsetY]
		this.circles.forEach(e => {
			const circleCenter = [e.atts.cx,e.atts.cy]
			const dist = Arr.distArr(circleCenter,evtPoint)
			if (dist<=e.atts.r) {
				e.change({atts:{'fill':'red'}})
			}
		})
	}
	// eslint-disable-next-line no-unused-vars
	mouseout(evt) {

	}
}
export default Flower
