// @ts-check
import {icons} from '../../../global'
import InputVar from './InputVar'
import Obj from '../../../logic/Obj/Obj'
import Elem from '../../Elem/Elem'
import Html from '../../Html/Html'

/**
 * @typedef InputInfo_props
 * @prop {any} [subs]
 * @prop {string[]} [actions]
 * @prop {string} [label]
 * @prop {InputVar_props} [en] enable of this
 */
/**
 * @typedef Action_props2
 * @prop {Function} callback
 * @prop {string} [label]
 * @prop {string} [icon]
 * @prop {string} kind kind of InputVar
 * @extends import("./InputVar").InputVarprops
 */
/**
 * @typedef {Action_props2 & import("./InputVar").InputVarprops} Action_props
 */

/**
 * @typedef InputVar_props
 * @prop {any} val
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
		 *
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
		 * @type {any}
		 */
		const props = Html.mergeDatas(this.props,this.propsAdd,propsAdd)

		this.ui.container = html.add({h:'<div class="InputInfo">'})

		// TODO en is used even if not domed???
		/**
		 * @type InputVar
		 */
		const enVal = (!props.en || props.en.val)
		const en = Obj.defaults(props.en,{en:'bit',val:enVal})
		this.vars.en = new InputVar(en,[this.ids,'en'])
		this.vars.en.on('en',this.enChanged.bind(this))

		if (props.label) {
			this.vars.en.dom(this.ui.container,{kind:'bit',label:props.label,atts:{disabled:!props.en},...props.en})
		}
		this.ui.form = this.ui.container.add({h:'<div>'})

		if (this.get()!==undefined) {
			// this.vars.is = this
			super.dom(this.ui.form,props)
		}
		/** @type string[] */
		const actions = props.actions
		if (actions) {
			actions.forEach(key => {
				this.vars_actions.push(new InputVar({},[this.ids,key]).dom(this.ui.form,this.action_subs[key]))
			})
		}

		/** @type {any} */
		const subs = props.subs
		for (var key in subs) {
			this.vars_subs.push(new InputVar({},[this.ids,key]).dom(this.ui.form,props.subs[key]))
		}


		this.enChanged() // TODO important? or maybe with listener
		return this
	}
	inputsCopy() {
		navigator.clipboard.writeText(this.val)
	}
	async inputsPaste() {
		const val = await navigator.clipboard.readText()
		this.val = val
	}
	inputsClear() {
		this.val = ''
	}
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