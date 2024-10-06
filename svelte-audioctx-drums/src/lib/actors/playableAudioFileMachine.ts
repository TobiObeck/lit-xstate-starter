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
			| { type: 'PROGRESS' }
	},
	actors: {
		fetchAudio: fromPromise(async ({ input }: { input: { audioFilePath: string } }) => {
			console.log('fetch afPath', input.audioFilePath);
			const response = await fetch(input.audioFilePath);
			return response.arrayBuffer();
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
					const reader = response.body.getReader();

					reader
						.read()
						// @ts-ignore
						.then(function processResult(result) {
							if (result.done) {
								sendBack({ type: 'DOWNLOAD_COMPLETE', result: result });
								return;
							}
							receivedLength += result.value.length;
							const progress = (receivedLength / contentLength) * 100;
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
						}
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
