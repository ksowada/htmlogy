import {icons} from '../../../global.js'
import InputVar from './InputVar.js'
import Obj from '../../../logic/Obj/Obj.js'
import Elem from '../../Elem/Elem.js'
import Html from '../../Html/Html.js'
import './InputInfo.css'

/**
 * @typedef InputInfo_props
 * @property {InputVar_props} [en] enable of this
 * @property {string} [label]
 * @property {string[]} [actions]
 * @property {any} [subs]
 */
/**
 * @typedef Action_props2
 * @property {string} kind kind of InputVar
 * @property {string} [icon]
 * @property {string} [label]
 * @property {Function} callback
 * @extends import("./InputVar").InputVarprops
 */
/**
 * @typedef {Action_props2 & import("./InputVar").InputVarprops} Action_props
 */

/**
 * @typedef InputVar_props
 * @property {any} val
 */

/**
 * @class
 * @augments InputVar
 * single or set of properties around one property, for example a text input with copy and paste buttons
 */
class InputInfo extends InputVar {
	/** properties not passed to super class: InputVar  */
	static propsMine = ['en','actions','subs','token','label','resetable']
	/**
	 * constructs a new InputInfo
	 * @param {InputInfo_props} props
	 * @param {string[]} ids
	 */
	constructor(props,...ids) {
		/**
		 * @type InputInfo_props
		 */
		let _props = Obj.defaults(props,{kind:'text',storeEn:false})
		super(Obj.omit(_props,InputInfo.propsMine),undefined,...ids)
		/**
		 * @type string[]
		 */
		this.ids = ids
		/**
		 * @type InputInfo_props
		 */
		this.props = props
		/**
		 * A map-like object that maps arbitrary `string` properties to `number`s.
		 * @type {Object.<string, Action_props>}
		 */
		this.action_subs = {
			clear:{kind:'evt',icon:icons('xmark'),tooltip:'clear',callback:this.inputsClear.bind(this)}, // TODO inputs rename to act...
			paste:{kind:'evt',icon:icons('clipboard'),tooltip:'paste',callback:this.inputsPaste.bind(this)}, // TODO callback rename to fill
			copy:{kind:'evt',icon:icons('copy'),tooltip:'copy',callback:this.inputsCopy.bind(this)},
			reset:{kind:'evt',icon:icons('rotate-left'),tooltip:'reset',callback:this.inputsReset.bind(this)},
		}
		/**
		 * @type {any}
		 */
		this.vars = {}
		/**
		 * @type {any}
		 */
		this.ui = {}
		this.vars_actions = {}
		this.vars_subs = {}
	}
	/**
	 * creates Html (may be included in additional element) and attach it to parent-Html
	 *
	 * may be called multiple times
	 * @param {Html} html Html to attach to
	 * @param {InputInfo_props} propsAdd properties to add to element, only for this html, dont change this
	 * @returns {InputInfo} this for chaining dom when wished
	 * @throws {Error} if kind is not implemented
	 */
	dom(html,propsAdd) {
		/**
		 * when no further elements are mounted, there will be no surrounding div element, parentHtml jumps in used div
		 */
		let parentHtml = html
		/**
		 * @type {any}
		 */
		const props = Html.mergeDatas(this.props,propsAdd)
		if (props.vals) {
			if (props.vals instanceof Array) { props.kind = 'select' }
		}
		parentHtml = html.add({h:'<div class="InputInfo">'})
		// TODO en is used even if not domed???
		/**
		 * @type InputVar
		 */
		const enVal = (!props.en || props.en.val)
		const enProps = Obj.defaults(props.en,{en:'bit',val:enVal,storeEn:this.props.storeEn})
		this.vars.en = new InputVar(enProps,this,[this.ids,'en'])
		this.vars.en.on(undefined,this.enChanged.bind(this))

		let args = Obj.copy(props)
		if (props.en && props.label) {
			let btnAtts = {}
			if (props.en == false) btnAtts = {atts:{disabled:'true'}}
			this.vars.en.dom(parentHtml,{kind:'bit',label:props.label,...props.en,...btnAtts})
			parentHtml = this.ui.form = parentHtml.add({html:'span',css:'enableble'})
			args = Obj.omit(args, 'label') // label is already mounted here
		}

		if (this.get()!==undefined && props.val!==null) {
			super.dom(parentHtml,Html.mergeDatas(args,{css:'InputVar'}))
		}
		/** @type string[] */
		const actions = props.actions
		if (actions) {
			actions.forEach(key => {
				this.vars_actions[key] = (new InputVar({storeEn:this.props.storeEn},this,[this.ids,key]).dom(parentHtml,this.action_subs[key]))
			})
		}

		/** @type {any} */
		const subs = props.subs
		for (var key in subs) {
			if (Object.hasOwn(subs,key)) {
				this.vars_subs[key] = (new InputVar({storeEn:this.props.storeEn},this,[this.ids,key]).dom(parentHtml,props.subs[key]))
			}
		}

		this.enChanged() // TODO important? or maybe with listener
		return this
	}

	/** 
	 * get val from this or if modelKey specifies, from subs or actions
	*/
	getSubVal(key) {
		if (Object.hasOwn(this.vars_actions, key)) return this.vars_actions[key].get()
		if (Object.hasOwn(this.vars_subs, key)) return this.vars_subs[key].get()
		if (key=='en') return this.vars['en'].get()
		return this.get(key)
	}
	/**
	 * Copies the current value of the input to the system clipboard.
	 */
	inputsCopy() {
		navigator.clipboard.writeText(this.val)
	}
	/**
	 * Reads the contents of the system clipboard as text.
	 * @returns {Promise<string>} A Promise that resolves to the text on the system clipboard.
	 */
	async inputsPaste() {
		const val = await navigator.clipboard.readText()
		this.val = String(val)
  		this.onEnter()
	}
	/**
	 * Clears the input value.
	 */
	inputsClear() {
		this.val = ''
		this.html.el.focus()
	}
	/**
	 * Resets the input value.
	 */
	inputsReset() {
		this.reset()
	}
	/**
	 * set main InputInfo, from sub vars, f.e. actions and subs
	 * @param {any} val value to set in InputInfo
	 */
	infoSet(val) {
		this.val = val
	}
	enChanged() {
		if (this.ui.form) { // maybe closed at startup
			Elem.classStateSet(this.ui.form.el,this.vars['en'].val,['hidden',''])
		}
	}
	/**
	 * react on inputLine Change by enter, focus leave, and paste
	 */
	watchEnter(callback) {
		this.callbackEnter = callback
		this.html.change({evts:{keydown:this.onEnter.bind(this),blur:this.onEnter.bind(this)}})
	}
	onEnter(event) {
		if (this.callbackEnter) { // only use when outer callback is there
			if (event == undefined || event.key == undefined || event.key === 'Enter') { // event at inputPaste call origins from other source, therefore event may be undefined
				this.callbackEnter(this.val)
			}
		}
	}
}

export default InputInfo