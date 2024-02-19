import InputUrl from './InputUrl.js'
import InputText from './InputText.js'
import Obj from '../../logic/Obj/Obj.js'
import HtmlElComp from '../html/HtmlElComp.js'

/**
 * @class
 * @augments HtmlElComp
 * component that displays multiple input, that are implemented here
 */
class Inputs extends HtmlElComp {
	constructor(arg) {
		super(arg)
		this.dataTitles = ['page','selection','link','title','favicon','date','image']
		this.dataIcons = ['fa-solid fa-bookmark','fa-solid fa-section','fa-solid fa-square-up-right','fa-solid fa-heading','fa-solid fa-icons','fa-solid fa-plus','fa-solid fa-image']
		this.dataNames = ['pageUrl','selText','linkUrl','title','favIconUrl','datetime','srcUrl']
		super.constructed()
	}
	/**
	 * @param {object} arg see {@link Html#create}
	 */
	dom(arg) {
		super.domCreate(arg)
		if (!this.data) return
		for (let i = 0; i < this.dataNames.length; i++) {
			const dataName = this.dataNames[i]
			if (Vars.is(this.data[dataName])) {
				const title = this.dataTitles[i]
				const icon = this.dataIcons[i]
				switch (dataName) {
				case 'pageUrl': this.pageUrl = new InputUrl({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				case 'selText': this.selText = new InputText({parent:{obj:this.containerObj},html:'textarea',data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				case 'linkUrl': this.linkUrl = new InputUrl({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				case 'title': this.title = new InputText({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				case 'favIconUrl': this.favIconUrl = new InputUrl({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				case 'datetime': this.datetime = this.data.datetime; break // hidden from UI but Obj for common get to store data; break;
				case 'srcUrl': this.srcUrl = new InputUrl({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				default:this[dataName] = new InputText({parent:{obj:this.containerObj},data:this.data[dataName],title,icon,change:this.hdlChange.bind(this)}); break
				}
			}
		}
	}
	hdlChange() {
		if (this.change!=undefined) this.change(this.get())
	}
	getText() {
		let text = 'item'
		if (this.type=='link') return 'link' // TODO need more info about link
		if (this.type=='image') return 'image' // TODO need more info about link
		if (this.type=='selection') return this.selText.get()
		if (this.type=='page') return this.title.get()
		return text
	}
	get() {
		const json = {}
		for (let ix = 0; ix < this.dataNames.length; ix++) {
			const dataName = this.dataNames[ix]
			if (this[dataName]!==undefined) { // UI Inpout with get
				if (this[dataName].get != undefined) {
					json[dataName] = this[dataName].get()
				} else { // just data without UI appearance
					json[dataName] = this[dataName]
				}
			}
		}
		return json
	}
	set(data) {
		Obj.attach(this,'data',data)
		if (!Obj.attach(this,'type',data.type)) console.info('missing type')
		this.dom()
	}
}
export default Inputs