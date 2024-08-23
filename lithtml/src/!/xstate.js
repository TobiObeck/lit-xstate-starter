// @ts-ignore
import * as allXstate from 'https://esm.run/xstate'

/**
 * @type {import('xstate')}
 */
const xstate = allXstate

export const {
  createMachine,
  createActor,
  createEmptyActor,

  assign,
  fromCallback,
  fromEventObservable,
  fromObservable,
  fromPromise,
  fromTransition,
  toObserver,
  getNextSnapshot,
  setup,
  isMachineSnapshot,

  assertEvent,
  getInitialSnapshot,
  getStateNodes,
  toPromise,
  matchesState,
  pathToStateValue,
  waitFor,
  cancel,
  emit,
  enqueueActions,
  log,
  raise,
  forwardTo,
  sendParent,
  spawnChild,
  sendTo,
  stop,
  stopChild,

  stateIn,
  and,
  not,
  or,

  SimulatedClock,
  StateMachine,
  StateNode,
  Actor,
} = xstate
