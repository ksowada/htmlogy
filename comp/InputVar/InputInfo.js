// @ts-check
import {icons} from '../../../global.js'
import InputVar from './InputVar.js'
import Obj from '../../../logic/Obj/Obj.js'
import Elem from '../../Elem/Elem.js'
import Html from '../../Html/Html.js'

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
		let _props = Obj.defaults(props,{kind:'text'})
		super(Obj.omit(_props,InputInfo.propsMine),...ids)
		/**
		 * @type string[]
		 */
		this.ids = ids
		/**
		 * @type InputInfo_props
		 */
		this.props = props
		/**
		 * @type string[]
		 */
		this.renderSequence = ['en','label','this','actions','actionsUser']
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
		/**
		 * @type {InputVar[]}
		 */
		this.vars_actions = []
		/**
		 * @type {InputVar[]}
		 */
		this.vars_subs = []
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

		if ((props.subs && Object.keys(props.subs).length > 0) || (props.actions && props.actions.length > 0)) {
			parentHtml = this.ui.container = html.add({h:'<div class="InputInfo">'})
		}
		// TODO en is used even if not domed???
		/**
		 * @type InputVar
		 */
		const enVal = (!props.en || props.en.val)
		const en = Obj.defaults(props.en,{en:'bit',val:enVal})
		this.vars.en = new InputVar(en,[this.ids,'en'])
		this.vars.en.on('en',this.enChanged.bind(this))

		let args = Obj.copy(props)
		if (props.en && props.label) {
			this.vars.en.dom(parentHtml,{kind:'bit',label:props.label,atts:{disabled:!props.en},...props.en})
			parentHtml = this.ui.form = parentHtml.add({h:'<div>'})
			args = Obj.omit(args, 'label') // label is already mounted here
		}

		if (this.get()!==undefined) {
			// this.vars.is = this
			super.dom(parentHtml,args)
		}
		/** @type string[] */
		const actions = props.actions
		if (actions) {
			actions.forEach(key => {
				this.vars_actions.push(new InputVar({},[this.ids,key]).dom(parentHtml,this.action_subs[key]))
			})
		}

		/** @type {any} */
		const subs = props.subs
		for (var key in subs) {
			if (Object.hasOwn(subs,key)) {
				this.vars_subs.push(new InputVar({},[this.ids,key]).dom(parentHtml,props.subs[key]))
			}
		}

		// this.enChanged() // TODO important? or maybe with listener
		return this
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
		this.val = val
	}
	/**
	 * Clears the input value.
	 */
	inputsClear() {
		this.val = ''
	}
	/**
	 * Resets the input value.
	 */
	inputsReset() {
		this.reset() // this.reset('is')
	}
	/**
	 * call callback from info and put return value into value
	 * @param {Function} subCallbackOrig Callback from TOP component to call at value changes
	 * @private
	 */
	subCallback(subCallbackOrig) {
		if (subCallbackOrig) {
			const ret = subCallbackOrig()
			if (ret!==undefined) this.val = ret
		}
	}
	enChanged() {
		Elem.classStateSet(this.ui.form.el,this.get('en'),['hidden',''])
	}
}

export default InputInfo