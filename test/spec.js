import chai from 'chai';
import cutMiddleware, { isBlockedAction } from '../index';

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