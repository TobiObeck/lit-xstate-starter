import {
	setup,
	createMachine,
	createActor,
	assign,
	spawnChild,
	sendTo,
	stopChild,
	fromPromise
} from 'xstate';

const fetchAudioFile = async (audioFilePath: string) => {
	console.log('fetch afPath', audioFilePath);
	const response = await fetch(audioFilePath);
	return response.arrayBuffer();
};

export const playableMachine = setup({
	types: {
		// input: {
		// 	audioFilePath: string
		// },
		context: {} as {
			audioFilePath: string;
			file: ArrayBuffer | null;
			error: any | null;
		},
		events: {} as
			| { type: 'play' }
			| { type: 'playAt'; timeStampInSec: number }
			| { type: 'pause' }
			| { type: 'stop' }
			| { type: 'loadSoundFile'; audioFilePath: string }
	},
	actors: {
		fetchAudio: fromPromise(async ({ input }: { input: { audioFilePath: string } }) => {
			const sound = await fetchAudioFile(input?.audioFilePath);
			return sound;
		})
	}
}).createMachine({
	id: 'appMachine',
	initial: 'initial',
	context: {
		audioFilePath: '',
		file: null,
		error: null
		// ({ input }) => {
		// return

		//{ audioFilePath: input.audioFilePath,}
	},
	states: {
		initial: {
			on: {
				loadSoundFile: {
					target: 'loading'
					// actions: assign(({ event }) => ({
					// 	audioFilePath: event.audioFilePath
					// }))
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
					actions: assign({ file: ({ event }) => event.output })
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
					actions: () => {
						console.log('playing');
					}
				}
			}
		},
		failure: {}
	}
});
