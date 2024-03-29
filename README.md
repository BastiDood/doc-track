<div align="center">

<img alt="DocTrack Logo" src="client/src/assets/logo/doctrack.svg" width="200" />

# DocTrack 

*A mobile-first document tracking system built for the modern age. 🚀*

![Runtimes](https://skillicons.dev/icons?i=svelte,ts,deno,postgres,html,css,&theme=light)

![Operation](docs/Operation.gif)

<a href="https://doctrack.deno.dev/">
    <img alt="Link to Website" src="./docs/web-anchor.png" width="40%"/>
</a>

</div>

# Introduction

**DocTrack** is a robust, open-source document tracking system that utilizes a modern web stack to meet the demands of document management in the modern age. It offers a powerful and intuitive platform to efficiently manage and monitor documents within an organization or in any collaborative environment.

With a strong focus on modern web development paradigms, DocTrack is a proof-of-concept on the usage of modern web technologies (such as [Svelte] + [Typescript] in the front-end and [Deno] + [PostgreSQL] in the back-end) to develop a Progressive Web Application that can handle offline usage, deferred operations, and resource caching.

The online version of DocTrack is hosted through [Deno Deploy] and is accessible [here][dtrack].

[dtrack]: https://doctrack.deno.dev/
[dcs]: https://dcs.upd.edu.ph/
[coe]: https://coe.upd.edu.ph/
[upd]: https://upd.edu.ph/

[Svelte]: https://svelte.dev/
[TypeScript]: https://www.typescriptlang.org/
[Deno]: https://deno.com/
[Deno Deploy]: https://deno.com/deploy/
[PostgreSQL]: https://www.postgresql.org/

<details open>
    <summary>
        Highlights
    </summary>
    <br />
    <div align="center">
        <img width="49%" src="./docs/features/doc-man.png" alt="doc-man" /> 
        &nbsp;
        <img width="49%" src="./docs/features/paper-trail.png" alt="paper-trail" /> 
    </div>
    <div align="center">
        <img width="49%" src="./docs/features/offline-usage.png" alt="ofline-usage" /> 
        &nbsp;
        <img width="49%" src="./docs/features/notifs-alert.png" alt="notifs-alert" /> 
    </div>
    <div align="center">
        <img width="49%" src="./docs/features/barcode-qr.png" alt="barcode-qr" /> 
        &nbsp;
        <img width="49%" src="./docs/features/qr-scan.png" alt="qr-scan" /> 
    </div>
    <div align="center">
        <img width="49%" src="./docs/features/office-man.png" alt="office-man" /> 
        &nbsp;
        <img width="49%" src="./docs/features/user-man.png" alt="user-man" /> 
    </div>
    <div align="center">
        <img width="49%" src="./docs/features/metrics.png" alt="metrics" /> 
        &nbsp;
        <img width="49%" src="./docs/features/categories.png" alt="categories" /> 
    </div>
</details>

# Program Features

1. **📄 Document Management** - Store, organize, and send documents between registered offices and organizations.
2. **🔍 Document Tracking** - Track the lifecycle of documents. Creation, transmission, reception, and termination times are archived in the _Paper Trail_. Gain visibility into document statuses and history for comprehensive audits.
3. **🔁 Offline Usage** - Create, receive, send, and terminate documents even when you are offline. Leveraging [Progressive Web App] technologies, DocTrack pushes changes to the server once an internet connection is established.
4. **🔔 Notification and Alerts** - Receive real-time notifications and alerts for document status updates. Stay informed about criticial activities to ensure timely actions.
5. **#️⃣ Barcodes and QR Generation** - Assign barcodes and QR codes that uniquely identify a document in the system. Stakeholders may uses these "tracking numbers" to check the status of their documents in real-time.
6. **📸 QR Code Scanning** - For more efficient workflow automation, DocTrack can scan physical documents for their unique system-assigned QR codes.
7. **💼 Office Management** - Manage offices and their staff, invite personnel, and assign granular permissions to individual staff members.
8. **📶 Metrics** - View metrics on individuals, offices, and system-wide operations for auditing purposes.
9. **📁 Categories** - Create categories to properly label files and documents in the entire system.
10. **👨🏻‍💼 User Management** - Grant system-wide permissions to other users that will manage the system.

[Progressive Web App]: https://web.dev/progressive-web-apps/

# Usage

To locally host `DocTrack`, see the respective `README.md` for the [client], [model], and [server] code.

[client]: ./client/README.md
[model]: ./model/README.md
[server]: ./server/README.md

# Project Members

> This is a course requirement for the CS 191/192 Software Engineering Courses of the [Department of Computer Science][dcs], [College of Engineering][coe], [University of the Philippines, Diliman][upd] under the guidance of [Ma. Rowena C. Solamo](https://dcs.upd.edu.ph/people/rowena-solamo/) for AY 2022-2023.

* [Macaraeg, Marc Gabriel C.](https://github.com/SporadicToast)
* [Ortiz, Sebastian Luis S.](https://github.com/BastiDood)
* [Ruaya, Justin Jose R.](https://github.com/justinruaya123)
* [Sarmiento, Alquen Antonio D.](https://github.com/Arukuen)
