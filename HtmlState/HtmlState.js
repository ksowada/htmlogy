// import Int from '../../Int/Int' // TODO for dev and build: npm run test need .js extension, but not dev...
import Arr from '../../Arr/Arr.js'
import Bit from '../../Bit/Bit.js'
import Int from '../../Int/Int.js' // TODO for test: npm run test need .js extension, but not dev...
import Str from '../../Str/Str.js'

// TODO dont work, as btn may be carry 2 States at once, deactivate (but show other toggle state also ), allow mult master, as many states can involve 1 Html extends is not appropriate (extend container Html and), introduce .toggle() that introduce an event
/**
 * @class
 * Stateful Html
 * it may select one or more elements out of a sequential list of equal elements, even with subelements, f.e. for menu items, with multiple subelements which can be accesses or modified at once, due to select-state
 */
class HtmlState {
	/**
	 * @typedef {object} HtmlState~props
	 * @property {object} props properties
	 * @property {string[]} [props.states]
	 * - array of names of all available states in sequence with other actions
	 * - or if no named states are used (so you can select states only by set_state_ix) supply the count of states as integer
	 * - or if undefined then defaults to count of 2 states
	 * @property {object} props.state_items_arg contains states and actions on obj, but only .css is implemented
	 * - each key in state_items_arg (except of key='states') refers to a Html-Object of master
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in Array with size as states
	 * @property {object} props.state_item_arg contains states and actions on obj, but only .css is implemented
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in Array with size as states
	 * @property {any} [props.state] actual state at reset, when undefined or empty string it uses 1st state, either string for named states or number for unnamed states
	 */
	/**
	 * @param {object} master containing the Object whose Html-Object(s) may be changed, may also be Array, containing Objects with one key, used for address in state_items_arg (f.e. like in Html.childs)
	 * @param {HtmlState~props} props properties
	 * @throws Error is state_actual is not contained or multiple times in states
	 * @example
	 * this.replay_st = new HtmlState(this,{
	 * 	 states:['replay_on','replay_off'],
	 *   state:'replay_on',
	 * 	 items_arr:{replay_switch:{
	 * 		css:['btn-primary','btn-outline'],
	 * 		icon:['fa-repeat fa-solid fa-fw','fa-forward-step fa-solid fa-fw']}
	 * }})
	 * this.replay_st.refresh() // actualize all UI-Elements described through the state_items_arg
	 */
	constructor(master,props) {
		/**
		 * Html element in which all Html elements are included that change with state
		 * @type {Html}
		 */
		this.master = master

		/** properties, that will not change during operation */
		this.props = props

		// count of available states given for all alternating object
		if (this.props.states==undefined) {
			this.states_are_named = false
			this.state_cnt = 2
		} else if (Int.is(this.props.states)) {
			this.states_are_named = false
			this.state_cnt = this.props.states
		} else { // Expect this.props.states to be an Array of {string}
			this.states_are_named = true
			this.state_cnt = this.props.states.length
		}
		// set state if defined
		if (props.state==undefined||props.state==='') {
			this.set_state_ix(0)
		} else if (Str.is(props.state)) {
			this.set_state(props.state)
		} else if (Int.is(props.state) || Bit.is(props.state)) {
			this.set_state_ix(props.state)
		}
	}
	/**
	 * set all components given in state_items_arg according to actual state
	 * @throws {Error} if master do not contain state_items_arg's component
	 */
	refresh() {
		// go through all subelements mentioned in state_items_arg
		if (this.props.state_item_arg!==undefined) {
			this.switch(this.master,this.props.state_item_arg)
		} else if (this.props.state_items_arg!==undefined) {
			for (const [key,value] of Object.entries(this.props.state_items_arg)) {
			// find key in array of this.master's arr
			// only when key is in childs, otherwise directly in master's object
				let master_match = undefined
				if (Arr.is(this.master)) { // if master is Array
					let master_key_match_ixs =[]
					for (let ix = 0; ix < this.master.length; ix++) {
						if (Object.keys(this.master[ix])[0]===key) {
							master_key_match_ixs.push(ix)
						}
					}
					if (master_key_match_ixs.length==0) throw new Error('do not found given state-action in master:'+key)
					if (master_key_match_ixs.length>1) throw new Error('too much found given state-action in master:'+key)
					master_match = Object.values(this.master[master_key_match_ixs[0]])[0]
				} else { // if master is Object
				// change Html in master according to actual_state
					if (this.master[key] == undefined) throw new Error('do not found given state-action in master:'+key)
					master_match = this.master[key]
				}
				this.switch(master_match,value)
			}
		} else {
			throw new Error('neither state_items_arg nor state_item_arg defined in props:'+this.props)
		}
	}
	/**
	 * switch one Html element to desired state, only accept css key
	 * @param {Html} html Html element, which shall be switched
	 * @param {object} state_item_arg contains states and actions on obj, but only.css is implemented
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in Array with size as states
	 * @private
	 */
	switch(html,state_item_arg) {
		const obj = {}
		for (const [action_key,action_value] of Object.entries(state_item_arg)) {
			if (action_key==='css') { // use classStateSet to not enrich css class
				html.classStateSet(action_value[this.state_ix],action_value)
			} else {// TODO multiple atts for tooltip
				obj[action_key] = action_value[this.state_ix]
			}
		}
		html.change(obj)
	}
	/**
	 * set state and refresh automatically, if state changed
	 * @param {string} state the wished state
	 */
	set_state(state) {
		if (this.set_state_only(state)) this.refresh()
	}
	/**
	 * set state, without refresh
	 * @param {string} state state to set
	 * @returns {boolean} result of state change:
	 * - true, when state changed
	 * - false, when state is already active
	 * @throws {Error} when state set by name, but states are unnnamed
	 * @throws {Error} when state requested, is not available in state_items_arg object
	 * @private
	 */
	set_state_only(state) {
		if (!this.states_are_named) throw new Error('set state by name, but they are not given named, but numerically')
		if (this.state===state) return false// refresh only at state-changed

		// find out state_ix and throw error if not contained in states
		const state_ixs_are_actual = []
		for (let ix=0; ix<this.state_cnt; ix++) {
			if (this.props.states[ix]===state) {
				state_ixs_are_actual.push(ix)
			}
		}
		if (state_ixs_are_actual.length !== 1) throw new Error('state_actual is not equal 1. Found count:'+state_ixs_are_actual.length)
		/** state_ix as ix of states-array */
		this.state_ix = state_ixs_are_actual[0]

		/** only set when states are named */
		this.state = state
		return true
	}
	/**
	 * set state and refresh automatically, if state changed
	 * @param {string} state_ix the wished state index
	 */
	set_state_ix(state_ix) { // TODO eliminate refresh for easiness
		if (Bit.is(state_ix)) state_ix = Bit.toInt(state_ix)
		this.set_state_ix_only(state_ix)
		this.refresh()
	}
	/**
	 * set state, without refresh
	 * @param {string} state_ix the wished state index
	 * @returns {boolean} true, when state really changed
	 * @throws {Error} when state_ix is not in valid range
	 * @private
	 */
	set_state_ix_only(state_ix) {
		if (this.state_ix===state_ix) return false// refresh only at state-changed
		if (!Int.isInside(state_ix,0,this.state_cnt-1)) throw new Error('new state_ix is outside range')

		// set state according to new ix
		this.state_ix = state_ix
		if (this.states_are_named) this.state = this.props.states[this.state_ix]
		return true
	}
	/**
	 * increment state to next state, or turn round to zero after reached last state and refresh
	 */
	inc_state() {
		this.set_state_ix(Int.incr(this.state_ix,0,this.state_cnt-1))
	}
}
export default HtmlState