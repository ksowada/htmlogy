// import Int from '../../Int/Int' // TODO for dev and build: npm run test need .js extension, but not dev...
import Arr from '../../Arr/Arr.js'
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
	 * @param {object} master containing the Object whose Html-Object(s) may be changed, may also be Array, containing Objects with one key, used for address in state_info (f.e. like in Html.childs)
	 * @param {object} state_info contains states and actions on obj, but only .css is implemented
	 * - each key in state_info (except of key='states') refers to a Html-Object of master
	 * - in it you can describe changes to Html-Objects and there actions on Html with each state bundled in complete Array with size as states
	 * @param {string[]} state_info.states optional
	 * - array of names of all available states in sequence with other actions
	 * - or if no named states are used (so you can select states only by set_state_ix) supply the count of states as integer
	 * - or if undefined then defaults to count of 2 states
	 * @param {any} state actual state at reset, when undefined it uses the 1st state, either string for named states or number for unnamed states
	 * @throws Error is state_actual is not contained or multiple times in state_info.states
	 * @example
	 * this.replay_st = new HtmlState(this,{
	 * 	 states:['replay_on','replay_off'],
	 * 	 replay_switch:{
	 * 		css:['btn-primary','btn-outline'],
	 * 		icon:['fa-repeat fa-solid fa-fw','fa-forward-step fa-solid fa-fw']}
	 * },'replay_on')
	 * this.replay_st.refresh() // actualize all UI-Elements described through the state_info
	 */
	constructor(master,state_info,state) {
		this.master = master
		this.state_info = state_info

		/** count of available states given for all alternating object */
		if (this.state_info.states==undefined) {
			this.states_are_named = false
			this.state_cnt = 2
		} else if (Int.is(this.state_info.states)) {
			this.states_are_named = false
			this.state_cnt = this.state_info.states
		} else { // Expect this.state_info.states to be an Array of {string}
			this.states_are_named = true
			this.state_cnt = this.state_info.states.length
		}
		if (state==undefined) {
			this.set_state_ix(0)
		} else if (Str.valid(state)) {
			this.set_state(state)
		} else if (Int.is(state)) {
			this.set_state_ix(state)
		}
	}
	/**
	 * set all components given in state_info according to actual state
	 * @throws {Error} if master do not contain state_info's component
	 */
	refresh() {
		// go through all of state_info, except states
		for (const [key,value] of Object.entries(this.state_info)) {
			if (key==='states') continue // no usable state-action

			// find key in array of this.master's arr
			// only when key is in childs, otherwise directly in master's object
			let master_match = undefined
			if (Arr.valid(this.master)) { // if master is Array
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

			// configure change obj
			const obj = {}
			for (const [action_key,action_value] of Object.entries(value)) {
				if (action_key==='css') { // use classStateSet to not enrich css class
					master_match.classStateSet(action_value[this.state_ix],action_value)
				} else {// TODO multiple atts for tooltip
					obj[action_key] = action_value[this.state_ix]
				}
			}
			master_match.change(obj)
		}
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
	 * @throws {Error} when state requested, is not available in state_info object
	 * @private
	 */
	set_state_only(state) {
		if (!this.states_are_named) throw new Error('set state by name, but they are not given named, but numerically')
		if (this.state===state) return false// refresh only at state-changed

		// find out state_ix and throw error if not contained in states
		const state_ixs_are_actual = []
		for (let ix=0; ix<this.state_cnt; ix++) {
			if (this.state_info.states[ix]===state) {
				state_ixs_are_actual.push(ix)
			}
		}
		if (state_ixs_are_actual.length !== 1) throw new Error('state_actual is not equal 1. Found count:'+state_ixs_are_actual.length)
		/** state_ix as ix of state_info.states-array */
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
		if (this.states_are_named) this.state = this.state_info.states[this.state_ix]
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