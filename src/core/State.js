import FactoryMaker from "./FactoryMaker.js";
import Logger from "./Logger.js";
function State(name, stateMachine) {
    const context = this.context;
    let transitions = new Map();
    let logger_, instance;
    function setup() {
        logger_ = Logger(context).getInstance().getLogger();
    }
    function getName() {
        return name;
    }
    function getStateMachine() {
        return stateMachine;
    }
    function getTransitions() {
        return transitions;
    }
    function activate() {
        return Promise.resolve(null);
    }
    function finishTransition() {
        return Promise.resolve(null);
    }
    function failHandler() {
        logger_.error(`Failed to transition State name:${name}`);
    }
    function deactivate() {
        return Promise.resolve(null);
    }
    instance = {
        getName,
        getStateMachine,
        getTransitions,
        activate,
        finishTransition,
        failHandler,
        deactivate
    }
    setup();
    return instance;
}

State.__asjs_factory_name = 'State';
const factory = FactoryMaker.getClassFactory(State);
export default factory;