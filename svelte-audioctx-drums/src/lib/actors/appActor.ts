import { setup, createMachine, createActor } from 'xstate';

const appMachine = setup({}).createMachine({
	id: 'appMachine',
	initial: 'initial',
	states: {
		initial: {}
	}
});

export const appActor = createActor(appMachine);
