const blockedActionPrefix = String.fromCharCode(55357, 57003) + ' ';

const isBlockedAction = action => action.type.startsWith(blockedActionPrefix);

const cut = permitted => store => next => action => {
    if (permitted(store.getState(), action) === false) {
        action = {
            type: blockedActionPrefix + action.type, 
            payload: action
        };
    }
    return next(action);
};

export {
    isBlockedAction
};

export default cut;
