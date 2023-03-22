<script>
    export let name; 
    export let email;
</script>

<div>
    <div class="profilepicture"><p style="user-select: none">{name[0]}</p></div>
    <p style="float: left; user-select: none;">{name.split(" ")[name.split(" ").length-1]}</p>
</div>

<style>

    .profilepicture {
        border-radius: 50%;
        background-color: white;
        border: 10px;
        text-align: center;
        width: 30pt;
        height: 30pt;
    }

    .profilepicture:checked {
        background-color: red;
    }
</style>