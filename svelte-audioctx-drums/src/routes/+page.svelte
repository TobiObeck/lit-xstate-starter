<script lang="ts">
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { HANG_DRUM_SOUNDS } from '$lib/const';
	import { appMachine, type NoteMapping, type PlayableActor } from '$lib/actors/appMachine';

	$: mappings = new Map() as Map<string, PlayableActor>;

	console.log('isBrowser', browser);
	if (browser) {
		var app = createActor(appMachine);

		app.start();

		app.subscribe((snapshot) => {
			console.log(snapshot.value, snapshot.context);
			mappings = snapshot.context.fileToActorMap;
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

{#each Array.from(mappings) as mapping}
	<ul>
		<li>{mapping[0]} - {mapping[1].getSnapshot().value}</li>
	</ul>
{/each}
