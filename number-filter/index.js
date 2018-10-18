;$(function(){

    //数字类型限制
    $('body').on('keyup','.filter-int',function(e){
        var maxlength = $(this).attr('maxlength');
        //safari改变值的情况光标会移到最后
        if(e.keyCode ==37 || e.keyCode == 39) return;
        var re = /^[0-9]*$/;
        if(!re.test(this.value)){
            // this.validform_lastval = +new Date;
            this.value=this.value.replace(/[^\d]/g,'');
        }
        if(typeof maxlength!=='undefined' && this.value.length > maxlength){
            this.value = this.slice(0,maxlength);
        }
        
    }).on('blur','.filter-int',function(){
        //检查是否有验证
        var form = $(this).closest('form');
        var idx = form.data('validIndex');
        if(isNaN(idx) || !$(this).attr('datatype')) return;
        if(window.valider && window.valider[idx]){
            window.valider[idx].check(false,this);
        }
    });

    //小数输入限制
    $('body').on('keyup', '.filter-float', function(e) {
        //默认限制小数点后两位
        var max = $(this).data('max') || 2;
        //safari改变值的情况光标会移到最后
        if (e.keyCode == 37 || e.keyCode == 39) return;
        if (!/^[0-9]+[\.]?[0-9]*$/.test(this.value)) {
            var value = this.value;
            value = value.replace(/[^\d|\.]/g, '');
            var arr = value.split('.');
            $.each(arr, function(i) {
                if (i > 1) return false;
                if (i === 0) {
                    value = '';
                }
                if (i === 0 && arr[i] === '' && arr.length > 1) {
                    arr[i] = '0';
                }
                value += i == 0 ? arr[i] : arr[i].substr(0, max) + '';
                if (i === 0 && arr.length > 1) value += '.'

            })
            this.value = value;
        } else {
            var arr = this.value.split('.');
            if (arr.length >= 2 && arr[1].length > max) {
                if (arr.length > 1 && arr[1].length >= 2) {
                    arr[1] = arr[1].substr(0, max)
                    this.value = arr.join('.');
                }
            }
        }

    }).on('blur', '.filter-float', function() {
        //格式过滤
        var arr = this.value.split('.');
        if (arr.length >= 2 && arr[1].length == 0) {
            this.value = parseInt(arr[0]) === 0 ? '' : arr[0];
        }
        //检查是否有验证
        var form = $(this).closest('form');
        var idx = form.data('validIndex');
        if(isNaN(idx) || !$(this).attr('datatype')) return;
        if (window.valider && window.valider[idx]) {
            window.valider[idx].check(false, this);
        }
    });
});