import chai from 'chai';
import cutMiddleware, { isBlockedAction, combineCriteria } from '../src/index';

describe('cut middleware', () => {
    const doDispatch = () => {};
    const doGetState = () => {};

    it('must return a function to handle next', () => {
        let permitted = () => true;
        let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

        chai.assert.isFunction(nextHandler);
        chai.assert.strictEqual(nextHandler.length, 1);
    });

    describe('handle next', () => {
        it('must return a function to handle action', () => {
            let permitted = () => true;
            let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

            const actionHandler = nextHandler();

            chai.assert.isFunction(actionHandler);
            chai.assert.strictEqual(actionHandler.length, 1);
        });

        describe('handle action', () => {

            it('must pass action to next as-is if permitted returns true', done => {
                let permitted = () => true;
                let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

                const actionObj = {};

                const actionHandler = nextHandler(action => {
                    chai.assert.strictEqual(action, actionObj);
                    done();
                });

                actionHandler(actionObj);
            });

            it('must return the return value of next', () => {
                let permitted = () => true;
                let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

                const expected = 'redux';
                const actionHandler = nextHandler(() => expected);

                const outcome = actionHandler();
                chai.assert.strictEqual(outcome, expected);
            });

            it('must call next with a blocked action if permitted returns false', done => {
                let permitted = () => false;
                let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

                const actionHandler = nextHandler(action => {
                    chai.assert.isTrue(isBlockedAction(action));
                    done();
                });

                actionHandler({});
            });

            it('must attach the original action as a payload to blocked actions', done => {
                let permitted = () => false;
                let nextHandler = cutMiddleware(permitted)({dispatch: doDispatch, getState: doGetState});

                const actionObj = {};

                const actionHandler = nextHandler(action => {
                    chai.assert.strictEqual(action.payload, actionObj);
                    done();
                });

                actionHandler(actionObj);
            });
        });
    });
});

describe('combineCriteria', () => {
    it('must return a new function when provided with an object of functions', () => {
        let criteriaFunctions = {
            truthy: () => true,
            falsey: () => false
        };

        let permitted = combineCriteria(criteriaFunctions);
        chai.assert.isFunction(permitted);
    });

    describe('combined function', () => {
        it('must return false if any of the child functions return false', () => {
            let criteriaFunctions = {
                truthy: () => true,
                falsey: () => false
            };

            let permitted = combineCriteria(criteriaFunctions);
            let isPermitted = permitted();

            chai.assert.strictEqual(isPermitted, false);

            criteriaFunctions = {
                falsey_one: () => false,
                falsey_two: () => false
            };

            permitted = combineCriteria(criteriaFunctions);
            isPermitted = permitted();

            chai.assert.strictEqual(isPermitted, false);
        });

        it('must return true if all of the child functions return true', () => {
            let criteriaFunctions = {
                truthy_one: () => true,
                truthy_two: () => true
            };

            let permitted = combineCriteria(criteriaFunctions);
            let isPermitted = permitted();

            chai.assert.strictEqual(isPermitted, true);
        });

        it('must return undefined if all of the child functions return undefined', () => {
            let criteriaFunctions = {
                undefined_one: () => undefined,
                undefined_two: () => undefined
            };

            let permitted = combineCriteria(criteriaFunctions);
            let isPermitted = permitted();

            chai.assert.strictEqual(isPermitted, undefined);
        });
    });
});