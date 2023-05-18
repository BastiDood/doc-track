<script lang="ts">
  import QRCode from 'qrcode';

  export let URL: string;

</script> 

{#await QRCode.toDataURL(URL)}
  <p>Generating QR Code...</p>
{:then dataUrl}
  <img src={dataUrl} alt="QR Code" />
{:catch error}
  <p>Failed to generate QR Code: {error.message}</p>
{/await}