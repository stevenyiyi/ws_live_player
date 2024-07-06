import FactoryMaker from "./FactoryMaker.js";
import State from "./State.js";
function StateMachine() {
  const context = this.context;
  let currentState = null;
  let states = new Map();
  let instance;
  function addState(name, { activate, finishTransition, deactivate }) {
    let state = State(context).create(name, instance);
    if (activate) state.activate = activate;
    if (finishTransition) state.finishTransition = finishTransition;
    if (deactivate) state.deactivate = deactivate;
    states.set(name, state);
  }

  function addTransition(fromName, toName) {
    if (!states.has(fromName)) {
      throw ReferenceError(
        `No such state: ${fromName} while connecting to ${toName}`
      );
    }
    if (!states.has(toName)) {
      throw ReferenceError(
        `No such state: ${toName} while connecting from ${fromName}`
      );
    }
    states.get(fromName).transitions.add(toName);
    return this;
  }
  function _promisify(res) {
    let promise;
    try {
      promise = res;
      if (!promise.then) {
        promise = Promise.resolve(res);
      }
    } catch (e) {
      promise = Promise.reject(e);
    }
    return promise;
  }
  function transitionTo(stateName) {
    if (currentState == null) {
      let state = states.get(stateName);
      return _promisify(
        state.activate
          .call(state)
          .then((data) => {
            currentState = state;
            return data;
          })
          .then(state.finishTransition.bind(state))
          .catch((e) => {
            state.failHandler();
            throw e;
          })
      );
    }
    if (currentState.name === stateName) return Promise.resolve();
    if (currentState.getTransitions().has(stateName)) {
      let state = states.get(stateName);
      return _promisify(
        currentState.deactivate
          .call(currentState)
          .then((data) => {
            currentState = state;
            return data;
          })
          .then(state.activate.bind(state))
          .catch((e) => {
            state.failHandler();
            throw e;
          })
      );
    } else {
      return Promise.reject(
        `No such transition: ${currentState.name} to ${stateName}`
      );
    }
  }
  instance = {addState, addTransition, transitionTo};
  return instance;
}

StateMachine.__asjs_factory_name = 'StateMachine';
export default FactoryMaker.getClassFactory(StateMachine);
