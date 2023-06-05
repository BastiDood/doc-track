<script>
    import Container from '../../../components/ui/Container.svelte';
    import { ContainerType } from '../../../components/types';
</script>

<Container ty={ContainerType.Enumeration} class="center">
	<div id="heading">
		<h2>Heya, {'Name'}! Welcome to DocTrack</h2>
	</div>
	<Container ty={ContainerType.Divider}>
		<main>
			<Container ty={ContainerType.Enumeration}>
				<h2>What am I?</h2>
				<p>DocTrack is a robust, open-source document tracking system that utilizes a modern web stack to meet the demands of document management in the modern age. It offers a powerful and intuitive platform to efficiently manage and monitor documents within an organization or in any collaborative environment.</p>
				<p>With a strong focus on modern web development paradigms, DocTrack is a proof-of-concept on the usage of modern web technologies (such as Svelte + Typescript in the front-end and Deno + PostgreSQL in the back-end) to develop a Progressive Web Application that can handle offline usage, deferred operations, and resource caching.</p>
			</Container>
			<Container ty={ContainerType.Enumeration}>
				<h2>Navigation tutorial</h2>
			</Container>
			<Container ty={ContainerType.Enumeration}>
				<h2>What does it do?</h2>
			</Container>
			<Container ty={ContainerType.Enumeration}>
				<h2>Getting Started...</h2>
			</Container>
		</main>
	</Container>
</Container>

<style>

    #heading {
        text-align: center;
        margin: 0px;
    }

	h2 {
		
	}

	main {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		grid-gap: 5px;
		/* max-width: 960px; */
		margin: 0 auto;
	}
	@media (min-width: 960px) {
		main {
			grid-template-columns: 1fr 1fr;
		}
		div {
			min-height: auto;
		}
	}
</style>