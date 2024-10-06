<script lang="ts">
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { hang_drum_sounds } from '$lib/const';
	import { newAppMachine } from '$lib/new_actors/newAppMachine';

	console.log('isBrowser', browser);
	if (browser) {
		var app = createActor(newAppMachine);

		app.start();

		app.subscribe((snapshot) => {
			console.log(snapshot.value, snapshot.context);
		});

		app.send({
			type: 'loadSoundFile',
			noteConfig: {
				note: 36,
				audioFilePath: hang_drum_sounds[0]
			}
		});
		app.send({
			type: 'loadSoundFile',
			noteConfig: {
				note: 38,
				audioFilePath: hang_drum_sounds[1]
			}
		});
	}

	const handlePlayClick = ()=> {
		app.send({ type: 'play', note: 36 });
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<button on:click={handlePlayClick}>play</button>
