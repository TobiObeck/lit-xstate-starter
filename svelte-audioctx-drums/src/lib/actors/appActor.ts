import { setup, createMachine, createActor, assign, spawnChild, sendTo, stopChild } from 'xstate';
import { audioManagerMachine, type TAudioManagerMachine } from './audioManagerActor';
import { playableMachine } from './playableActor';

export const appMachine2 = setup({
	types: {
		context: {} as {},
		events: {} as { type: 'loadSoundFile'; audioFilePath: string }
	},
	actors: {
		playableMachine
	},
	actions: {
		// params somehow doesn't work. Seems like `spawnChild` must be called directly
		// without the (_, params: { audioFilePath: string }) => ... function
		spawnPlayableActor: spawnChild('playableMachine', {
			systemId: `playable_`
			// systemId: `playable_${event.audioFilePath}`
			// input: params.audioFilePath
		})
	}
}).createMachine({
	id: 'appMachine',
	initial: 'idle',
	context: {},
	states: {
		idle: {
			on: {
				loadSoundFile: {
					entry: 'spawnPlayableActor',
					actions: ({ event, self, system }) => {
						system.get('playable_').send({
							type: 'loadSoundFile',
							audioFilePath: event.audioFilePath
						});
					}
				}
				// loadSoundFile: {
				// 	target: 'loading',
				// 	actions: [
				// 		{
				// 			type: 'spawnPlayableActor'
				// 			// params: ({ event }) => ({
				// 			// 	audioFilePath: event.audioFilePath
				// 			// })
				// 		}
				// 	]
				// }
			}
		},
		loading: {
			// entry: [
			// 	({ event, self, system }) => {
			// 		system.get('playable_').send({
			// 			type: 'loadSoundFile',
			// 			audioFilePath: event.audioFilePath
			// 		});
			// 	}
			// ]
		}
	}
});

export const appMachine = setup({
	types: {
		context: {} as {
			// audioManager: TAudioManagerMachine | null
		},
		events: {} as { type: 'temp' } | { type: 'init' } | { type: 'loadFiles'; audioUrls: string[] }
	},
	actions: {}
	// actors: {} as { [x: string]: any }
	// actors: {} as { [x: string]: TAudioManager Actor }
}).createMachine({
	id: 'appMachine',
	initial: 'off',
	context: {
		// audioManager: null
	},
	states: {
		off: {
			on: {
				init: {
					target: 'initializing'
				}
			}
		},
		initializing: {
			// this breaks server in SSR mode if AudioContext
			// is assigned directly in initial context (bc doesn't exist in browser)
			entry: [
				spawnChild(audioManagerMachine, {
					systemId: 'audio-manager'
				})
			],
			on: {
				loadFiles: {
					actions: ({ event, self, system }) =>
						system.get('audio-manager').send({
							type: 'init',
							audioUrls: event.audioUrls
						})
				}
			}
		}
	}
});

/*
this didnt work somhoew
on: {
	loadFiles: {
		actions: sendTo(({ system, event }) => system.get('audio-manager'), {
			type: 'init',
			audioUrls: event.audioUrls
		})
	}
}
*/
