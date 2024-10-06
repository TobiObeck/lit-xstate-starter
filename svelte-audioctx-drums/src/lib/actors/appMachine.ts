import { setup, assign, spawnChild, enqueueActions, type ActorRefFrom } from 'xstate';
import { playableAudioFileMachine } from './playableAudioFileMachine';

export const appMachine = setup({
	types: {
		context: {} as {
			noteMappings: {
				note: number;
				actorRef: ActorRefFrom<typeof playableAudioFileMachine>;
			}[];
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
	},
	actors: {
		playableAudioFileMachine
	},
	actions: {}
}).createMachine({
	id: 'appMachine',
	initial: 'idle',
	context: {
		noteMappings: []
	},
	states: {
		idle: {
			on: {
				loadSoundFile: {
					actions: enqueueActions(({ enqueue, context, event, system }) => {
						enqueue(
							spawnChild('playableAudioFileMachine', {
								systemId: `playable_${event.noteConfig.note}`
							})
						);
						enqueue(({ event, self, system }) => {
							system.get(`playable_${event.noteConfig.note}`).send({
								type: 'loadSoundFile',
								audioFilePath: event.noteConfig.audioFilePath
							});
						});

						enqueue(
							assign({
								noteMappings: ({ context, system }) =>
									context.noteMappings.concat({
										note: event.noteConfig.note,
										actorRef: system.get(`playable_${event.noteConfig.note}`)
									})
							})
						);
					})
				},
				play: {
					actions: [
						({ context, event, system }) => {
							console.log('app play', event.note);
							const actor = system.get(`playable_${event.note}`);
							console.log('playable actor from system', actor.getSnapshot().value);
							actor.send({
								type: 'play',
								note: event.note
							});
							const mapping = context.noteMappings.find((mapping) => mapping.note === event.note);
							console.log('playable actor from context', mapping?.actorRef.getSnapshot().value);
							mapping?.actorRef.send({
								type: 'play',
								note: event.note
							});
						}
					]
				}
			}
		}
	}
});
