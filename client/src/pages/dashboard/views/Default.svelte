<script>
    import Container from "../../../components/ui/Container.svelte";
    import { ContainerType } from "../../../components/types";

</script>

<Container ty={ContainerType.Enumeration} class="center">
    <div id="heading">
        <h2>Heya, {`Name`}! Welcome to DocTrack</h2>
    </div>
</Container>
<Container ty={ContainerType.Divider} class="center">
    <main>
        <div class="division red">
            <h2>What is DocTrack; features</h2>
        </div>
        <div class="division green">
            <h2>Navigation tutorial</h2>
        </div>
        <div class="division blue">
            <h2>how to use</h2>
        </div>
    </main>
</Container>

<style>

    #heading {
        text-align: center;
        margin: 0px;
    }

	main {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		grid-gap: 5px;
		max-width: 960px;
		margin: 0 auto;
	}
	div {
		border: 3px solid;
		min-height: 250px;
	}
	.red {
		background-color: #ED1C24;
		grid-row: 1 / 3
	}
	.green {
		background-color: #B5E61D;
	}
	.blue {
		background-color: #99D9EA
	}
	@media (min-width: 600px) {
		main {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 100% 100%;
		}
		div {
			min-height: auto;
		}
	}
</style>