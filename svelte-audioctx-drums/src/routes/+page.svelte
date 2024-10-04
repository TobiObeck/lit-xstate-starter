<script lang="ts">
	import { appMachine, appMachine2 } from '$lib/actors/appActor';
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { hang_drum_sounds } from '$lib/const';

	console.log('test', browser);
	if (browser) {
		// const appActor2 = createActor(appMachine2);

		// console.log('test', browser);
		// appActor2.start();

		// appActor2.subscribe((snapshot) => {
		// 	console.log(snapshot)
		// })

		// appActor2.send({type: 'loadSoundFile', audioFilePath: hang_drum_sounds[0]})


		// this one is at least loading audio
		const appActor = createActor(appMachine	);

		console.log('test', browser);
		appActor.start();

		appActor.subscribe((snapshot) => {
			console.log(snapshot)
		})

		appActor.send({type: 'init'})
		appActor.send({type: 'loadFiles', audioUrls: hang_drum_sounds})
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
