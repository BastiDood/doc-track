<script lang="ts">
  import QRCode from 'qrcode';

  export let URL: string;

</script> 

{#await QRCode.toDataURL(URL) then dataUrl}
  <img src={dataUrl} alt="QR Code" />
{/await}