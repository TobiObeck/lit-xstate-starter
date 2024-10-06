import { setup, assign, fromPromise, sendParent, fromCallback, type AnyEventObject } from 'xstate';

export const playableAudioFileMachine = setup({
	types: {
		context: {} as {
			audioFilePath: string;
			progress: number;
			file: ArrayBuffer | null;
			error: any | null;
		},
		events: {} as
			| { type: 'play'; note: number }
			| { type: 'playAt'; timeStampInSec: number }
			| { type: 'pause' }
			| { type: 'stop' }
			| { type: 'loadSoundFile'; audioFilePath: string }
			| { type: 'DOWNLOAD_COMPLETE'; result: any }
			| { type: 'PROGRESS', progress: number }
	},
	actors: {
		fetchAudio: fromPromise(async ({ input }: { input: { audioFilePath: string } }) => {
			console.log('fetch afPath', input.audioFilePath);
			const response = await fetch(input.audioFilePath);
			const buffer = await response.arrayBuffer()
			console.log('buffer', buffer)
			return buffer
		}),
		fetchAudioInChunks: fromCallback(
			({
				input,
				sendBack
			}: {
				input: { audioFilePath: string };
				sendBack: (event: AnyEventObject) => void;
			}) => {
				fetch(input.audioFilePath).then((response) => {
					if (!response.body) return;
					let receivedLength = 0;
					const contentLength = Number(response.headers.get('Content-Length'));
					const contentType = response.headers.get('Content-Type') || 'audio/mp3';
					const reader = response.body.getReader();
					const chunks: Uint8Array[] = []

					reader
						.read()
						// @ts-ignore
						.then(async function processResult(result) {
							if (result.done) {
								const buffer = await new Blob(chunks, { type: contentType }).arrayBuffer()
								sendBack({ type: 'DOWNLOAD_COMPLETE', result: buffer });
								return;
							}
							receivedLength += result.value.length;
							const progress = (receivedLength / contentLength) * 100;
							chunks.push(result.value)
							sendBack({ type: 'PROGRESS', progress });

							// const temp = reader.read().then(processResult);
							// return temp;
							return reader.read().then(processResult);
						})
						.catch((error) => {
							sendBack({ type: 'ERROR', error });
						});
				});

				// console.log('fetch in chunks afPath', input?.audioFilePath);
				// const response = await fetch(input?.audioFilePath);

				// return response.arrayBuffer();
			}
		)
	}
}).createMachine({
	id: 'appMachine',
	initial: 'initial',
	context: {
		audioFilePath: '',
		progress: 0,
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
				
				src: 'fetchAudioInChunks',
				input: ({ context: { audioFilePath } }) => ({ audioFilePath })

				// src: 'fetchAudio',
				// input: ({ context: { audioFilePath } }) => ({ audioFilePath }),
				// onDone: {
				// 	target: 'ready',
				// 	actions: [
				// 		({ event }) => {
				// 			console.log('onDone!', event);
				// 		},
				// 		assign({ file: ({ event }) => event.output }),
				// 		sendParent(({ self }) => ({ type: 'finishedLoading', actorRef: self.system }))
				// 	]
				// },
				// onError: {
				// 	target: 'failure',
				// 	actions: assign({ error: ({ event }) => event.error })
				// }
			},
			on: {
				DOWNLOAD_COMPLETE: {
					actions: [
						({ event }) => {
							console.log('donwload complete', event);
						}
					]
				},
				PROGRESS: {
					actions: [
						({ event }) => {
							console.log('progress', event);
						},
						assign(({event}) => ({
							progress: event.progress
						}))
					]
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
