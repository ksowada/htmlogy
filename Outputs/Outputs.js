import Store from '../../logic/Store.js'
import Obj from '../../logic/Obj/Obj.js'
import Html from '../html/Html/Html.js'
import './Outputs.css'
import Arr from '../../logic/Arr/Arr.js'
import HtmlElComp from '../html/HtmlElComp.js'
import Button from '../Button/Button.js'
/**
 * export tree data
 * @class
 * @augments HtmlElComp
 */
class Outputs extends HtmlElComp {
	// constructor(el, tree, data, click) {
	constructor() {
		super(Html.mergeDatas.apply(null,arguments))
		super.constructed()
	}
	/**
	 * @private
	 */
	dom() {
		super.domCreate(Html.mergeDatas.apply(null,arguments))
		if (!this.data) return
		if (!this.prj) return
		console.log(this.data)
		const xmlDoc = this.createXMLFromTreeData(this.data,this.prj)
		let serializer = new XMLSerializer()
		let xmltext = serializer.serializeToString(xmlDoc)
		let filename = this.prj+'.xml'
		const downloadXmlMIME = 'application/xml'
		const blob = new Blob([xmltext],{type: downloadXmlMIME})
		// eslint-disable-next-line no-new
		new Button({parent:{el:this.el},val:'download XML',blob:blob,blobFile:filename})
		this.ul = new Html({parent:{el:this.el},html:'ul',css:'outputs'})
		this.treeLvl = -1
		this.setIt(this.data,this.prj,this.ul)
	}
	change() {
		this.click(this.get())
	}
	set(data,prj) {
		Obj.attach(this,'data',data)
		Obj.attach(this,'prj',prj)
		this.dom()
	}
	// eslint-disable-next-line jsdoc/require-param
	/**
	 * @private
	 */
	setIt(data,prj,elIt) {
		this.treeLvl++
		const li = new Html({parent:{el:elIt},html:'li',css:'output depth-'+this.treeLvl})
		const divText = new Html({parent:{el:li},html:'div',css:'output depth-'+this.treeLvl,val:data.text})
		if (Arr.valid1(data.children)) {
			const ul = new Html({parent:{el:li},html:'ul',css:'output depth-'+this.treeLvl})
			for (let childIx = 0; childIx < data.children.length; childIx++) {
				const child = data.children[childIx]
				this.setIt(child,prj,ul)
			}
		}
		const json = Store.getPrjAndLeaf('treeLeafData',prj,data.id)
		// if (data.type)
		// if (data.children)
		// TODO create Blob to download page
		// https://stackoverflow.com/questions/6427576/javascript-jquery-html-export-dom-structure-page-to-html-file-or-text
	}
	createXMLFromTreeData(treeData,prj) {
		this.xmlDoc = document.implementation.createDocument(null,'recherche') // TODO get it from pkg
		let projectNode = this.xmlDoc.createElement('project')
		projectNode.innerHTML = prj
		this.xmlDoc.documentElement.appendChild(projectNode)
		this.createXMLFromTreeDataIt(projectNode,treeData,prj)
		return this.xmlDoc
	}
	createXMLFromTreeDataIt(xml,treeSnippet,prj) {
		let node = this.xmlDoc.createElement('node')
		xml.appendChild(node)
		node.innerHTML = treeSnippet.text
		node.setAttribute('type',treeSnippet.type)
		let data = Store.getPrjAndLeaf('treeLeafData',prj,node.id)
		console.log(data)
		if (treeSnippet.children != undefined) {
			treeSnippet.children.forEach(child => {
				this.createXMLFromTreeDataIt(node,child)
			})
		}
		return node
	}
}
export default Outputs