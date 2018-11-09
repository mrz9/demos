#瞎yy的模块加载方案


##可以类型vue单文件的方式写模块代码
```
<template>
    <div class="box">测试</div>
</template>

<script>
    document.querySelector('.box').addEventListener('click',function(){alert(1});
</script>

<style>
    .box {
        background-color:#fdfdfb;
    }
</style>
```