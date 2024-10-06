<script lang="ts">
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { HANG_DRUM_SOUNDS } from '$lib/const';
	import { appMachine, type NoteMapping } from '$lib/actors/appMachine';

	$: mappings = [] as NoteMapping[];

	console.log('isBrowser', browser);
	if (browser) {
		var app = createActor(appMachine);

		app.start();

		app.subscribe((snapshot) => {
			console.log(snapshot.value, snapshot.context);
			mappings = snapshot.context.noteMappings;
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

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={handlePlayClick}>play</button>

{#each mappings as mapping}
	<ul>
		<li>{mapping.note} - {mapping.actorRef.getSnapshot().value}</li>
	</ul>
{/each}
