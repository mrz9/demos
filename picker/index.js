/**
 * color picker
 * 源数据放在data-data 里，如果没有则读取window.colorData；
 */
;$(function(){
    $('[data-plugin=color]').each(function(){
        var input = $(this);
        var value = input.val();
        //数据源
        var origin_data = $(this).data('data');
        if(origin_data && window[origin_data]){
            origin_data = window[origin_data];
        }else{
            origin_data = window.colorData || [];
        }
        var pickerData = JSON.parse(JSON.stringify(origin_data));
        var isAddon = true;
        //是否显示addon按钮
        if($(this).data('btn') == false){
            isAddon = false;
        }

        //是否可以重复选择
        var repeat = true;
        if($(this).data('repeat') === false){
            repeat = false;
        }
        //为了统一传入数据的类型
        var selected = value === '' ? [] : (function(){
                var rs = [];
                var arr =  value.split(',');
                $.each(arr,function(i,v){
                    rs.push(parseInt(v));
                })
                return rs;
            })();

        var el,selection,container;

        var dom = '<div class="color-picker"><div class="color-picker-wrap ' + ( isAddon ? 'color-picker-addon input-group' : '') + '"><div class="color-picker-container clearfix"></div>' + ( isAddon ? '<div class="color-picker-btn input-group-addon"><i class="fa fa-cube"></i></div>' : '') + '</div><div class="color-picker-selection clearfix"></div></div>';
        var el = $(dom)
        selection = el.find('.color-picker-selection');
        container = el.find('.color-picker-container');
        
        //判断初始化input是否提供宽度
        var width = input[0].style.width;
        if(width){
            el.css('width',width);
        }
        createStyle();
        renderContainer();
        renderSelection();
        eventBind();
        input.parent().append(el);
        input.attr('type','hidden');
        
        //事件绑定
        function eventBind(){
            el.on('click','span',function(){
                var value = parseInt($(this).data('value'));
                var parent = $(this).parent();
                var idx = selected.indexOf(value);
                if(parent.hasClass('color-picker-container')){//container
                    if(repeat){
                        idx = $(this).index();
                    }
                    if(idx !== -1){
                        selected.splice(idx,1);
                    }
                }else if(parent.hasClass('color-picker-selection')){//selection
                    if(repeat || idx === -1){
                        selected.push(value);
                    }
                }

                updateSelected();
            }).on('click','.color-picker-container',function(e){
                if(e.currentTarget === e.target){
                    $(this).find('.color-picker-search__field').focus();
                }
            }).on('focus','.color-picker-search__field',function(){
                selection.show();
            }).on('keydown','.color-picker-search__field',function(e){
                if(e.keyCode == 8){
                    selected.pop();

                    updateSelected();
                }else{
                    e.stopPropagation();
                    e.preventDefault();
                }
            }).on('click','.color-picker-btn',function(){
                el.find('.color-picker-search__field').focus();
            })
            
            $('body').on('click.color.picker',function(e){
                var picker = $(e.target).closest('.color-picker');
                if(picker.length === 0 || picker[0] !== el[0]){
                    selection.hide();
                }
            })
        }

        //渲染已选择
        function renderContainer(){
            var html = '';
            $.each(selected,function(idx,val){
                var item = getItemByValue(val);
                if(item){
                    html += "<span data-value='"+item.value+"' style='background-color:"+item.text+"'><i>×</i></span>";
                }
            });
            html += '<input class="color-picker-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="textbox" aria-autocomplete="list" placeholder="" style="width: 0.75em;" />'
            container.html(html);
        }

        //根据value获取item
        function getItemByValue(value){
            var rs;
            $.each(pickerData,function(idx,item){
                if(parseInt(item.value) === parseInt(value)){
                    rs = item;
                    return false;
                }
            });
            return rs;
        }

        //渲染选项
        function renderSelection(){
            var html = '';
            $.each(pickerData,function(idx,item){
                if(repeat || selected.indexOf(item.value) === -1){
                    html += "<span data-value='"+item.value+"' style='background-color:"+item.text+"'></span>";
                }
            });
            selection.html(html);
        }

        //更新选中值
        function updateSelected(){
            input.val(selected.join(','))
            renderContainer();
            renderSelection();

            if(input.attr('datatype')){
                var form = input.closest('form');
                var idx = form.data('validIndex');
                valider[idx] && valider[idx].check(false,input);
            }
        }

        //添加样式
        function createStyle(){
            var cssString = '.color-picker{position:relative}.color-picker-container{border:solid #ddd 1px;background-color:white;border-radius:4px;cursor:text;min-height:32px}.has-error>.color-picker .color-picker-container{border-color:#a94442!important}.has-success>.color-picker .color-picker-container{border-color:#3c763d}.color-picker-container,.color-picker-selection{padding:0 5px 5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.color-picker-wrap.color-picker-addon{display:table}.color-picker-addon .color-picker-container{border-top-right-radius:0;border-bottom-right-radius:0}.color-picker-container>span i{font-style:normal}.color-picker-container>span,.color-picker-selection>span{border:1px solid #eaeaea;color:#fff;border-radius:3px;cursor:default;float:left;margin-right:5px;margin-top:5px;padding:2px 6px;width:25px;height:25px;text-align:center;float:left}.color-picker-selection{display:none;position:absolute;z-index:99999;left:0;right:0;border:solid #ddd 1px;background-color:#fff}.color-picker-search__field{background:transparent;border:none!important;outline:0;box-shadow:none;-webkit-appearance:textfield;font-size:100%;margin-top:5px;padding:0;float:left}';

            if($('style#color-picker-style').length == 0){
                var style = document.createElement("style");	
                style.setAttribute("type", "text/css");
                style.setAttribute('id','color-picker-style')	
                if(style.styleSheet){// IE		
                    style.styleSheet.cssText = cssString;	
                } else {// w3c		
                    var cssText = document.createTextNode(cssString);		
                    style.appendChild(cssText);
                } 	

                var heads = document.getElementsByTagName("head");	
                if(heads.length){
                    heads[0].appendChild(style);
                }else{
                    document.documentElement.appendChild(style);
                }
            }
        }
    })
});