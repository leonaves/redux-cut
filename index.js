/**
 * Prefix for blocked actions (it's a no entry emoji in case you were wondering).
 */
const blockedActionPrefix = String.fromCharCode(55357, 57003) + ' ';

/**
 * Accepts an action and returns true if the action is one that was dispatched by
 * redux cut to indicate it had blocked another action. It does this by comparing
 * the prefix.
 *
 * //TODO: also attach a symbol to the actions for a slightly nicer way to check.
 *
 * @param {Object} action An action to check.
 *
 * @returns {Boolean}
 */
const isBlockedAction = action => action.type.startsWith(blockedActionPrefix);

/**
 * Returns the cut middleware.
 *
 * @param {Function} permitted A criteria function that is passed the current state
 * and the action dispatched and returns false if the action should not be permitted.
 *
 * @returns {Function} A redux middleware function that invokes every function
 * inside the passed object and returns false if any child criteria fail.
 */
const cut = permitted => store => next => action => {
    if (permitted(store.getState(), action) === false) {
        action = {
            type: blockedActionPrefix + action.type, 
            payload: action
        };
    }
    return next(action);
};

/**
 * Turns an object whose values are different criteria functions, into a single
 * criteria function. It will call every child criteria, and return false if
 * any of them return false
 *
 * @param {Object} criteria An object whose values correspond to different
 * criteria functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as criteria` syntax. The reducers may return anything,
 * but any value other than false (to block the passed action) will be ignored.
 *
 * @returns {Function} A criteria function that invokes every function inside the
 * passed object and returns false if any child criteria fail.
 */
export function combineCriteria(criteria) {
    var criteriaKeys = Object.keys(criteria);
    var finalCriteria = {};
    for (var i = 0; i < criteriaKeys.length; i++) {
        var key = criteriaKeys[i];
        if (typeof criteria[key] === 'function') {
            finalCriteria[key] = criteria[key]
        }
    }
    var finalCriteriaKeys = Object.keys(finalCriteria);

    return function combination(state = {}, action) {

        var isPermitted = undefined;

        for (var i = 0; i < finalCriteriaKeys.length; i++) {
            var criteria = finalCriteria[key];
            isPermitted = isPermitted !== false ? criteria(finalCriteriaKeys, action) : false;
            //TODO: Enable logging of which criteria failed.
        }
        return isPermitted;
    }
}

export {
    isBlockedAction,
    combineCriteria
};

export default cut;
