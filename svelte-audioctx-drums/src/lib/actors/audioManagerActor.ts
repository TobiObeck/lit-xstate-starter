import { setup, assign, spawnChild, type ActorRefFrom, enqueueActions, fromPromise } from 'xstate';

// idle

// loading load each aduio file
//  sub actor for each file?

// error
// loaded

// sub actor playing
// sub actor mute, pause, continue play, start playing at second X...

const fetchAudioFile = async (audioFilePath: string) => {
	console.log('fetch', audioFilePath);
	const response = await fetch(audioFilePath);
	return response.arrayBuffer();
};

export type TAudioManagerMachine = ActorRefFrom<typeof audioManagerMachine>;
export const audioManagerMachine = setup({
	types: {
		context: {} as {
			audioContext: AudioContext | null;
			audioBuffer: AudioBuffer | null;
			// state: 'pending' | 'loaded' | 'error',
			bufferSources: AudioBufferSourceNode[];
			nodes: GainNode[];
		},
		events: {} as { type: 'init'; audioUrls: string[]; volume?: number }
	},
	actions: {
		initialize: enqueueActions(({ enqueue, context, event }) => {
			console.log('initialize enque stuff');
			const audioCtx = new AudioContext();

			enqueue(
				assign({
					audioContext: audioCtx
				})
			);
			enqueue(
				assign({
					nodes: [
						...context.nodes,
						new GainNode(audioCtx, {
							gain: event.volume ? event.volume : 0.5
						})
					]
				})
			);

			for (const audioFilePath of event.audioUrls) {
				enqueue.spawnChild(
					fromPromise(async () => {
						console.log('fromPromise', audioFilePath);
						const audioFile = await fetchAudioFile(audioFilePath);
						return audioFile;
					})
				);
			}
		})
	}
	// actors: {}
}).createMachine({
	id: 'audioManager',
	initial: 'idle',
	context: {
		audioContext: null, //new AudioContext(),
		audioBuffer: null,
		bufferSources: [],
		nodes: []
	},
	states: {
		idle: {
			entry: () => {
				console.log('audio machine idle');
			},
			on: {
				init: {
					target: 'initialize'
				}
			}
		},
		initialize: {
			entry: ['initialize']
		}
	}
});
