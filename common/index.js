//创建弹窗
function createLayer(opt){
    var layerEl;
    if(!opt || !opt.content){
        throw new TypeError('必须传入content属性');
    }
    var _default = {
        title:'提示',
        width:'600px',
        height:'500px',
        success:function(el,index){
            if(el.find('form.form-horizontal')){
                $call.validform(el.find('form'));
            }
            layerEl = el;
            if(option.height === 'auto'){
                //自适应高度
                layer.iframeAuto(index);
            }
            
        }
    }
    if(opt.success){
        var f = opt.success;
        opt.success = function(el,index){
            if(el.find('form.form-horizontal')){
                $call.validform(el.find('form'));
            }
            layerEl = el;
            f.call(null,el,index);
            if(option.height === 'auto'){
                //自适应高度
                layer.iframeAuto(index);
            }
        }
    }
    var option = $.extend(_default,opt||{});

    if(option.height === 'auto') delete option.height;
    layer.open({
        type: 1,
        title: option.title,
        shade: 0.3,
        maxmin: true,
        shadeClose: true,
        area: [option.width, option.height],
        content: option.content,
        scrollbar:true,
        yes:option.yes||function(){},
        success: option.success,
        cancel:function(index){
            layerEl.find('select[data-plugin="filter-select"]').each(function(){
                var name = $(this).attr('filter-name');
                if(name && window.filterSelectMap[name]){
                    delete window.filterSelectMap[name];
                }
            });
        }
    });
}
