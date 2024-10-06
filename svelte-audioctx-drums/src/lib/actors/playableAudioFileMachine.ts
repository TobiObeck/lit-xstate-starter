import { setup, assign, fromPromise } from 'xstate';

export const playableAudioFileMachine = setup({
	types: {
		context: {} as {
			audioFilePath: string;
			file: ArrayBuffer | null;
			error: any | null;
		},
		events: {} as
			| { type: 'play'; note: number }
			| { type: 'playAt'; timeStampInSec: number }
			| { type: 'pause' }
			| { type: 'stop' }
			| { type: 'loadSoundFile'; audioFilePath: string }
	},
	actors: {
		fetchAudio: fromPromise(async ({ input }: { input: { audioFilePath: string } }) => {
			console.log('fetch afPath', input.audioFilePath);
			const response = await fetch(input.audioFilePath);
			return response.arrayBuffer();
		})
	}
}).createMachine({
	id: 'appMachine',
	initial: 'initial',
	context: {
		audioFilePath: '',
		file: null,
		error: null
	},
	states: {
		initial: {
			on: {
				loadSoundFile: {
					target: 'loading',
					actions: [
						() => {
							console.log('playable actor loadSoundFile');
						},
						assign(({ event }) => ({
							audioFilePath: event.audioFilePath
						}))
					]
				}
			}
		},
		loading: {
			invoke: {
				id: 'invokeFile',
				src: 'fetchAudio',
				input: ({ context: { audioFilePath } }) => ({ audioFilePath }),
				onDone: {
					target: 'ready',
					actions: [
						({ event }) => {
							console.log('onDone!', event);
						},
						assign({ file: ({ event }) => event.output })
					]
				},
				onError: {
					target: 'failure',
					actions: assign({ error: ({ event }) => event.error })
				}
			}
		},
		ready: {
			on: {
				play: {
					actions: ({ event, context }) => {
						console.log('playing!!!!', event.note, context.file);
					}
				}
			}
		},
		failure: {}
	}
});
