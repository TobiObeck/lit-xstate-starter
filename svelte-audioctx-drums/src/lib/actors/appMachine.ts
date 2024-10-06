import { setup, assign, spawnChild, enqueueActions, type ActorRefFrom } from 'xstate';
import { playableAudioFileMachine } from './playableAudioFileMachine';

export type NoteMapping = {
	note: number;
	actorRef: ActorRefFrom<typeof playableAudioFileMachine>;
};

export type PlayableActor = ActorRefFrom<typeof playableAudioFileMachine>;

export const appMachine = setup({
	types: {
		context: {} as {
			// noteToFileMap: Map<number, string>;
			noteToFileMap: { [key: number]: string}
			// fileToActorMap: Map<string, PlayableActor>;
			fileToActorMap: { [key: string]: PlayableActor}
		},
		events: {} as
			| {
					type: 'loadSoundFile';
					noteConfig: {
						note: number;
						audioFilePath: string;
					};
			  }
			| { type: 'play'; note: number }
			| { type: 'finishedLoading'; actorRef: PlayableActor }
	},
	actors: {
		playableAudioFileMachine
	},
	actions: {}
}).createMachine({
	id: 'appMachine',
	initial: 'idle',
	context: {
		// fileToActorMap: new Map<string, PlayableActor>([]),
		fileToActorMap: {},
		// noteToFileMap: new Map<number, string>([]),
		noteToFileMap: {},
	},
	states: {
		idle: {
			on: {
				loadSoundFile: {
					actions: enqueueActions(({ enqueue, context, event, system }) => {
						enqueue(
							spawnChild('playableAudioFileMachine', {
								systemId: `playable_${event.noteConfig.audioFilePath}`
							})
						);
						enqueue(({ event, self, system }) => {
							system.get(`playable_${event.noteConfig.audioFilePath}`).send({
								type: 'loadSoundFile',
								audioFilePath: event.noteConfig.audioFilePath
							});
						});

						enqueue(
							assign({
								fileToActorMap: ({ context, system }) => {
									return context.fileToActorMap = {
										...context.fileToActorMap,
										[event.noteConfig.audioFilePath]: system.get(`playable_${event.noteConfig.audioFilePath}`)
									}
									// return context.fileToActorMap.set(
									// 	event.noteConfig.audioFilePath,
									// 	system.get(`playable_${event.noteConfig.audioFilePath}`)
									// );
								},
								noteToFileMap: ({ context }) => {
									return context.noteToFileMap = {
										...context.noteToFileMap,
										[event.noteConfig.note]: event.noteConfig.audioFilePath
									}	
									
									// return context.noteToFileMap.set(
									// 	event.noteConfig.note,
									// 	event.noteConfig.audioFilePath
									// );
								}
							})
						);
					})
				},
				play: {
					actions: [
						({ context, event, system }) => {
							console.log('app play', event.note);
							const fileName = context.noteToFileMap[event.note] // .get(event.note);
							if (!fileName) return;
							const actor = context.fileToActorMap[fileName] //.get(fileName);
							if (!actor) return;

							console.log('playable actor from system', actor.getSnapshot().value);
							actor.send({
								type: 'play',
								note: event.note
							});
						}
					]
				},
				finishedLoading: {
					actions: [
						({ event }) => {
						console.log('finished loading!', event.actorRef);
					}
					]
				}
			}
		}
	}
});
