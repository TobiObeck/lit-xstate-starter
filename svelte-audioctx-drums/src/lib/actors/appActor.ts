import { setup, createMachine, createActor, assign, spawnChild, sendTo, stopChild } from 'xstate';
import { audioPlayerMachine, type TAudioPlayerMachine } from './audioPlayerActor';

export const appMachine = setup({
	types: {
		context: {} as {
			// audioPlayer: TAudioPlayerMachine | null
		},
		events: {} as { type: 'temp' } | { type: 'init' } | { type: 'loadFiles'; audioUrls: string[] }
	},
	actions: {}
	// actors: {} as { [x: string]: any }
	// actors: {} as { [x: string]: TAudioPlayer Actor }
}).createMachine({
	id: 'appMachine',
	initial: 'off',
	context: {
		// audioPlayer: null
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
				spawnChild(audioPlayerMachine, {
					systemId: 'audio-player'
				})
			],
			on: {
				// loadFiles: {
				// 	actions: sendTo(({ system, event }) => system.get('audio-player'), {
				// 		type: 'init',
				// 		audioUrls: event.audioUrls
				// 	})
				// }
				loadFiles: {
					actions: ({ event, self, system }) =>
						system.get('audio-player').send({
							type: 'init',
							audioUrls: event.audioUrls
						})
				}
			}
		}
	},
	on: {
		temp: {
			// actions: assign({
			// 	count: ({ context }) => context.count + 1
			// })
		}
	}
});
