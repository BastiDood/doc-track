<script>
    import Container from '../../../components/ui/Container.svelte';
    import { ContainerType } from '../../../components/types';
	import Hamburger from '../../../components/icons/Hamburger.svelte';

	import '../../../components/ui/itemrow/chip-style.css';
</script>

<div id="heading">
	<h2>Heya, {'Name'}! Welcome to DocTrack</h2>
</div>
<Container ty={ContainerType.Divider}>
	<main>
	   <Container ty={ContainerType.Enumeration}>
		  <h2 class="chip category centering">What am I?</h2>
		  <Container ty={ContainerType.Divider}>
			 <p><b>DocTrack</b> is a robust, open-source document tracking system that utilizes a modern web stack to meet the demands of document management in the modern age. It offers a powerful and intuitive platform to efficiently manage and monitor documents within an organization or in any collaborative environment.</p>
		  </Container>
		  <Container ty={ContainerType.Divider}>
			 <p>With a strong focus on modern web development paradigms, DocTrack is a proof-of-concept on the usage of modern web technologies (such as Svelte + Typescript in the front-end and Deno + PostgreSQL in the back-end) to develop a Progressive Web Application that can handle offline usage, deferred operations, and resource caching.</p>
		  </Container>
	   </Container>
	   <Container ty={ContainerType.Enumeration}>
		  <h2 class="chip category centering">Navigation tutorial</h2>
		  Ready to start? Click on the 
		  <span>
			 <Hamburger />
		  </span>
		  icon on the top-left corner of the screen to open the navigation menu. From there, you click on the <b>Offices</b>
	   </Container>
	   <Container ty={ContainerType.Enumeration}>
		  <h2 class="chip category centering">Features</h2>
		  <Container ty={ContainerType.Divider}>
			<ol>
				<li><b class="chip doc">📄  Document Management</b> - Store, organize, and send documents between registered offices and organizations. </li>
				<li><b class="chip doc">🔍 Document Tracking</b> - Track the lifecycle of documents. Creation, transmission, reception, and termination times are archived in the Paper Trail. Gain visibility into document statuses and history for comprehensive audits. </li>
				<li><b class="chip doc">🔁 Offline Usage</b> - Create, receive, send, and terminate documents even when you are offline. Leveraging Progressive Web App technologies, DocTrack pushes changes to the server once an internet connection is established. </li>
				<li><b class="chip doc">🔔 Notification and Alerts</b> - Receive real-time notifications and alerts for document status updates. Stay informed about criticial activities to ensure timely actions. </li>
				<li><b class="chip doc">#️⃣ Barcodes and QR Generation</b> - Assign barcodes and QR codes that uniquely identify a document in the system. Stakeholders may uses these "tracking numbers" to check the status of their documents in real-time. </li>
				<li><b class="chip doc">📸 QR Code Scanning</b> - For more efficient workflow automation, DocTrack can scan physical documents for their unique system-assigned QR codes. </li>
				<li><b class="chip doc">💼 Office Management</b> - Manage offices and their staff, invite personnel, and assign granular permissions to individual staff members. </li>
				<li><b class="chip doc">📶 Metrics</b> - View metrics on individuals, offices, and system-wide operations for auditing purposes. </li>
				<li><b class="chip doc">📁 Categories</b> - Create categories to properly label files and documents in the entire system. </li>
				<li><b class="chip doc">👨🏻‍💼 User Management</b> - Grant system-wide permissions to other users that will manage the system. </li>
			</ol>
		</Container>
	   </Container>
	   <Container ty={ContainerType.Enumeration}>
		  <h2 class="chip category centering">Getting Started...</h2>
	   </Container>
	</main>
 </Container>

<style>
	.centering {
		text-align: center;
	}

    #heading {
        text-align: center;
        margin: 0px;
    }

	main {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto;
		grid-gap: 5px;
		margin: 0 auto;
	}

	ol {
  		list-style-position: inside;
  		padding-left: 0;
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