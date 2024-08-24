<script lang="ts">
	import { appActor } from '$lib/actors/appActor';

	appActor.start();

	appActor.subscribe((snapshot) => {
        console.log(snapshot)
    });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
