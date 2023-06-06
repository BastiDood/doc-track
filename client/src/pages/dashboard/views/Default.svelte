<script>
import Container from '../../../components/ui/Container.svelte';
import { ContainerType } from '../../../components/types';
import { currentUser } from '../../../stores/UserStore';
import '../../../components/ui/itemrow/chip-style.css';
const imgNavigation = new URL('../../../assets/doctrack-navigation.tutorial.svg', import.meta.url);
const techstackIcon = new URL('../../../assets/icons/bootstrap/techstack.svg', import.meta.url);
</script>

<div id="heading">
	<h1>Welcome, {$currentUser.name ?? 'Guest'}, to DocTrack!</h1>
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
			<div class="centering">
				<a href="https://github.com/BastiDood/doc-track">
					<p>© 2023 Doctrack. All rights reserved.</p>
					<p>Powered by:</p>
					<img id="techstack" alt="Tech stack" src={techstackIcon.pathname} />
				</a>
			</div>
		</Container>
		<Container ty={ContainerType.Enumeration}>
			<Container ty={ContainerType.Divider}>
		  		<h2 class="chip category centering">Navigation tutorial</h2>
		  		<p>Ready to start? Click on the hamburger icon (beside the Logo) on the top left corner!</p>
		  		<img src={imgNavigation} alt="Navigation tutorial" />
			</Container>
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
			<Container ty={ContainerType.Divider}>
				<p>Start by creating an office. This is on the <b>Offices page</b> (see navigation panel). Join the office by refreshing the page and clicking the appropriate office on the <b>navigation panel</b>.</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>Create a category by looking at the <b>categories </b> page (see navigation panel).</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>Go to <b>Barcodes</b> and click on <b>Generate New Batch</b>. These are barcodes that will be used on the <b>tracking page</b>, as well as uniquely identify your document. You can download the barcodes as QR by clicking on <b>Download Stickers</b> button.</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>Go to the <b>outbox</b> and click on the <b>Register and Stage a New Document</b>. Input the necessary details such as the barcode generated.</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>Click on the ellipsis (triple dots) on the right of the row and click <b>Send Document</b>. Specify the target office and put some remarks and voila!</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>As a receiver, go to the <b>Inbox</b> page and click on the ellipsis (triple dots) on the document row. Click <b>Accept Document</b> and the document is now on your inbox. You may send the document to another office just like before!</p>
			</Container>
			<Container ty={ContainerType.Divider}>
				<p>You can also track your document. Anytime in the <b>Inbox/Outbox</b>, you can click on the white space of the document row to go to its tracking page. Alternatively, you can copy the barcode (the ID with the #) by highlighting it. Then, you can input the identifier on the sidebar or the home page and clicking the <i>Magnifying glass</i> icon. Alternatively, you can use the barcodes generated from the <b>Barcodes</b> page and click on the <i>Camera icon</i> to scan the generated QR code. Take note non-staff may view the tracking status of the document any time.</p>
			</Container>
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

	img {
		width: 100%;
	}

	li {
		margin: 0.75rem;
	}

	main {
		display: grid;
		grid-template-rows: auto;
		grid-gap: 5px;
		margin: 0 auto;
	}

	ol {
  		list-style-position: inside;
	}

	#techstack {
		width: 75%;
	}

	@media (min-width: 960px) {
		main {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
