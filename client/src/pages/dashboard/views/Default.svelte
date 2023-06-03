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
            <h2>Red</h2>
        </div>
        <div class="division green">
            <h2>Green</h2>
        </div>
        <div class="division blue">
            <h2>Blue</h2>
        </div>
    </main>
</Container>

<style>
    main {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		grid-gap: 5px;
		max-width: 960px;
		margin: 0 auto;
	}

	.division {
		border: 3px solid;
		min-height: 250px;
	}

    #heading {
        text-align: center;
        margin: 0px;
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
			grid-template-rows: 50% 50%;
		}
		.division {
			min-height: auto;
		}
	}
</style>