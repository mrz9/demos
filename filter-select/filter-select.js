/**
 * 过滤select的重复项，只考虑单选，多选的需要自行扩展
 * @param {*} name 
 * @param {*} data {value:'',text:'',...}
 */
function filterSelect(name,data){
    if(!window.filterSelectMap){
        window.filterSelectMap = {};
    }

    var fsItem = filterSelectMap[name];

    if(fsItem){
        return fsItem;
    }else{
        fsItem = {};
        filterSelectMap[name] = fsItem;
    }
    //添加是否有请选择这种空的初始项
    fsItem.hasEmpty = false; 
    $.each(data,function(idx,item){
        if(item.value === '' || item.value === null){
            fsItem.hasEmpty = true;
            fsItem.emptyItem = item;
            data.splice(idx,1);
            return false;
        }
    });
    
    fsItem.name = name;
    fsItem.origin = JSON.parse(JSON.stringify(data));
    //已使用的集合
    fsItem.used = [];

    //获取为选择的集合
    fsItem.getSafeList = function(){
        var arr = [];
        $.each(fsItem.origin,function(i,s){
            var str = JSON.stringify(s)
            if(fsItem.used.indexOf(str) === -1){
                arr.push(s);
            }
        });
        return arr;
    }

    //更新select的选项
    fsItem.update = function(){
        //每次update需要更新used数组
        fsItem.used = [];
        //每个select的options集合
        var selectHtmls = [];
        //第一次循环设定默认值
        $('select[filter-name="'+fsItem.name+'"]').each(function(idx){
            var self = this;
            var self_val = $(this).val();
            var options = fsItem.hasEmpty ? '<option  value="'+ fsItem.emptyItem.value +'">'+ fsItem.emptyItem.text+'</option>' : '' ;
            if(self_val !== '' && self_val !== null){
                var rs = getItemByValue(self_val);
                if(rs !== null){
                    var rs_string = JSON.stringify(rs);
                    if(fsItem.used.indexOf(rs_string) === -1){
                        fsItem.used.push(rs_string);
                    }
                    var data_str = '';
                    if(toString.call(rs.data) === '[object Object]'){
                        $.each(rs.data,function(key,val){
                            data_str += ' data-'+key+'='+val;
                        })
                    }
                    options += '<option selected="" value="'+ rs.value +'" '+ data_str +'>'+rs.text+'</option>';
                }
            }else{
                var safeList = fsItem.getSafeList();
                if(safeList.length>0){
                    var s = safeList[0];
                    if(!fsItem.hasEmpty){
                        fsItem.used.push(JSON.stringify(s));  
                        var data_str = '';
                        if(toString.call(s.data) === '[object Object]'){
                            $.each(s.data,function(key,val){
                                data_str += ' data-'+key+'='+val;
                            })
                        }
                        options += '<option selected="" value="'+ s.value +'"  '+ data_str +'>'+s.text+'</option>';
                    } 
                }
            }
            selectHtmls.push(options);
        });

        //获取为选择的option
        var safe_html = '';
        $.each(fsItem.getSafeList(),function(i,s){
            safe_html += '<option value="'+ s.value +'">'+s.text+'</option>';
        });
        //第二次循环补充可选的option
        $('select[filter-name="'+fsItem.name+'"]').each(function(idx){
            var html = selectHtmls[idx] + safe_html;
            $(this).html(html);
        });
    }

    //实例化
    init();
    /**
     * 内部方法
     */
    //初始化
    function init(){
        fsItem.update();
        //chang事件
        //需要优先执行
        document.body.addEventListener('change',function(e){
            if(e.target.tagName.toUpperCase() === 'SELECT' && e.target.getAttribute('filter-name') === fsItem.name){
                fsItem.update();
            }
        },true)

    }

    //根据值去的对应的item
    function getItemByValue(value){
        var item = null;
        $.each(fsItem.origin,function(i,s){
            if(s.value === value){
                item = s;
                return false;
            }
        });

        return item;
    }
}