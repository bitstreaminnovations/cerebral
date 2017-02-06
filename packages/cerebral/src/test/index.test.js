/* eslint-env mocha */
import {compute} from '..'
import {state, props} from '../tags'
import {runCompute, runAction, runSignal} from '.'
import assert from 'assert'

describe('test helpers', () => {
  describe('runCompute', () => {
    it('should test a compute that gets state', () => {
      const testCompute = compute(state`foo`, (foo) => foo)
      assert.equal(runCompute(testCompute, {state: {foo: 'bar'}}), 'bar')
    })
    it('should test a compute that gets props', () => {
      const testCompute = compute(props`foo`, (foo) => foo)
      assert.equal(runCompute(testCompute, {props: {foo: 'bar'}}), 'bar')
    })
  })

  describe('runAction', () => {
    it('should test an action that gets state', () => {
      const testAction = function testAction ({state}) {
        return {foo: state.get('foo')}
      }
      return runAction(testAction, {state: {foo: 'bar'}})
        .then(({output}) => assert.equal(output.foo, 'bar'))
    })
    it('should test an action that gets props', () => {
      const testAction = function testAction ({props}) {
        return {foo: props.foo}
      }
      return runAction(testAction, {props: {foo: 'bar'}})
        .then(({output}) => assert.equal(output.foo, 'bar'))
    })
    it('should test an action that sets state', () => {
      const testAction = function testAction ({state}) {
        state.set('foo', 'baz')
      }
      return runAction(testAction, {state: {foo: 'bar'}})
        .then(({state}) => assert.equal(state.foo, 'baz'))
    })
    it('should test async actions', () => {
      const testAction = function testAction () {
        return new Promise((resolve) => {
          setTimeout(() => resolve({foo: 'bar'}), 1)
        })
      }
      return runAction(testAction)
        .then(({output}) => assert.equal(output.foo, 'bar'))
    })
  })

  describe('runSignal', () => {
    it('should test a signal with named actions', () => {
      const testSignal = [
        function action1 ({props}) {
          return {bar: 'bar'}
        },
        function action2 ({props}) {
          return {baz: 'baz'}
        }
      ]
      return runSignal(testSignal, {props: {foo: 'foo'}}, {recordActions: 'byName'})
        .then(({action1, action2}) => {
          assert.equal(action1.props.foo, 'foo')
          assert.equal(action1.output.bar, 'bar')
          assert.equal(action2.props.bar, 'bar')
          assert.equal(action2.output.baz, 'baz')
        })
    })
    it('should test a signal with indexed actions', () => {
      const testSignal = [
        function action1 ({props}) {
          return {bar: 'bar'}
        },
        function action2 ({props}) {
          return {baz: 'baz'}
        }
      ]
      return runSignal(testSignal, {props: {foo: 'foo'}}, {recordActions: true})
        .then((response) => {
          assert.equal(response[0].props.foo, 'foo')
          assert.equal(response[0].output.bar, 'bar')
          assert.equal(response[1].props.bar, 'bar')
          assert.equal(response[1].output.baz, 'baz')
        })
    })
  })
})
