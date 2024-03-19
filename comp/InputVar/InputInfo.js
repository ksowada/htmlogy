// @ts-check

import {icons} from '../../../global'
import InputVar from './InputVar'
import Obj from '../../../logic/Obj/Obj'
import Elem from '../../Elem/Elem'
import Html from '../../Html/Html'

/**
 * @typedef InputInfo_props
 * @property {any} [subs]
 * @property {string[]} [actions]
 * @property {string} [label]
 * @property {InputVar_props} [en] enable of this
 */
/**
 * @typedef Action_props
 * @property {Function} callback
 * @property {string} [label]
 * @property {string} [icon]
 * @property {string} kind kind of InputVar
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
		 * @type {any}
		 */
		this.action_subs = {
			clear:{kind:'btn',icon:icons('xmark'),label:'clear',callback:this.inputsClear.bind(this)}, // TODO inputs rename to act...
			paste:{kind:'btn',icon:icons('clipboard'),label:'paste',callback:this.inputsPaste.bind(this)}, // TODO callback rename to fill
			copy:{kind:'btn',icon:icons('copy'),label:'copy',callback:this.inputsCopy.bind(this)},
			reset:{kind:'btn',icon:icons('rotate-left'),label:'reset',callback:this.inputsReset.bind(this)},
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
		// actions
		// this.actions = {}
		// if (props.actions) {
		// 	props.actions.forEach(actionKey => {
		// 		this.actions[actionKey] = this.actionSubs[actionKey]
		// 	})
		// }
		// subs

		// this.subs = {}
		// if (_props.subs!==undefined) {
		// 	const keys = Object.keys(_props.subs)
		// 	// keys.forEach(subKey => this.subs[subKey] = _props.subs?[subKey])
		// 	for (var attr in _props.subs) {
		// 		if (_props.subs.hasOwnProperty(attr)) this.subs[attr] = _props.subs[attr]
		// 	}
		// }
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
		const props = Html.mergeDatas(this.props,propsAdd)

		this.ui.container = html.add({h:'<div class="InputInfo">'})

		// TODO en is used even if not domed???
		/**
		 * @type InputVar
		 */
		const enVal = (!props.en || props.en.val)
		const en = Obj.defaults(props,{en:'bit',val:enVal})
		this.vars.en = new InputVar(en,[this.ids,'en'])
		this.vars.en.on('en',this.enChanged.bind(this))
		// this.vars.en.set()

		if (props.label) {
			this.vars.en.dom(this.ui.container,{kind:'bit',label:props.label,atts:{disabled:!props.en},...props.en})
		}
		this.ui.form = this.ui.container.add({h:'<div>'})

		if (this.get()!==undefined) {
			// this.vars.is = this
			super.dom(this.ui.container,props)
		}
		// for (var actionKey in props.actions) {
		// 	if (this.actionSubs.hasOwnProperty(actionKey)) {
		// 		const action = new InputVar({},actionKey)
		// 		action.dom(this.ui.container,this.actionSubs[actionKey])
		// 		this.vars_actions.push(action)
		// 	}
		// }
		/** @type string[] */
		const actions = props.actions
		if (actions) {
			actions.forEach(key => {
				this.vars_actions.push(new InputVar({},[this.ids,key]).dom(this.ui.container,this.action_subs[key]))
			})
		}
		// if (props.subs) {
		// 	Object.keys(props.subs).forEach(key => {
		// 		this.vars_subs.push(new InputVar({},[this.ids,key]).dom(this.ui.container,{...props.subs[key]}))
		// 	})
		// }

		/** @type {any} */
		const subs = props.subs
		for (var key in subs) {
			// if (subs.hasOwnProperty(key)) {
			// const action = new InputVar({},key)
			// action.dom(this.ui.container,props.subs[key])
			this.vars_subs.push(new InputVar({},[this.ids,key]).dom(this.ui.container,props.subs[key]))
			// }
		}

		// this.vars_subs = Object.keys(props.subs).map(subKey => new InputVar({},subKey).dom(this.ui.container,{...props.subs[subKey],callback:{props.subs[subKey].callback && props.subCallback.bind(this,props.subs[subKey].callback)}}))

		this.enChanged() // TODO important? or maybe with listener
		return this
	}
	inputsCopy() {
		navigator.clipboard.writeText(this.vars.is.val)
	}
	async inputsPaste() {
		const val = await navigator.clipboard.readText()
		this.vars.is.val = val
	}
	inputsClear() {
		this.vars.is.val = ''
	}
	inputsReset() {
		this.vars.is.reset() // this.reset('is')
	}
	/**
	 * call callback from info and put return value into value
	 * @param {Function} subCallbackOrig Callback from TOP component to call at value changes
	 * @private
	 */
	subCallback(subCallbackOrig) {
		if (subCallbackOrig) {
			const ret = subCallbackOrig()
			if (ret!==undefined) this.vars.is.val = ret
		}
	}
	enChanged() {
		Elem.classStateSet(this.ui.form.el,this.get('en'),['hidden',''])
	}
}

export default InputInfo