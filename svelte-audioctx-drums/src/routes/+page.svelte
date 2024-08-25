<script lang="ts">
	import { appMachine } from '$lib/actors/appActor';
	import { browser } from '$app/environment';
	import { createActor } from 'xstate';
	import { hang_drum_sounds } from '$lib/const';

	console.log('test', browser);
	if (browser) {
		const appActor = createActor(appMachine);

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
