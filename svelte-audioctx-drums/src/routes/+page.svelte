<script lang="ts">
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { HANG_DRUM_SOUNDS } from '$lib/const';
	import { appMachine, type NoteMapping, type PlayableActor } from '$lib/actors/appMachine';

	$: fileToActorMap = {} as { [key: string]: PlayableActor }; // new Map() as Map<string, PlayableActor>;
	$: context = {};

	console.log('isBrowser', browser);
	if (browser) {
		var app = createActor(appMachine);

		app.start();

		app.subscribe((snapshot) => {
			console.log(snapshot.value, snapshot.context);
			fileToActorMap = snapshot.context.fileToActorMap;
			context = snapshot.context;
		});

		for (let idx = 0; idx < HANG_DRUM_SOUNDS.length; idx++) {
			app.send({
				type: 'loadSoundFile',
				noteConfig: {
					note: 36 + idx,
					audioFilePath: HANG_DRUM_SOUNDS[idx]
				}
			});
		}
	}

	const handlePlayClick = () => {
		app.send({ type: 'play', note: 36 });
	};
</script>

<button on:click={handlePlayClick}>play</button>

<!-- {Array.from(mappings)}

{#each Array.from(mappings) as mapping}
	<ul>
		<li>{mapping[0]} - {mapping[1].getSnapshot().context.progress}</li>
	</ul>
{/each} -->

{#each Object.entries(fileToActorMap) as [note, actor]}
	<ul>
		<li>{note} - {actor.getSnapshot().context.progress}</li>
	</ul>
{/each}
