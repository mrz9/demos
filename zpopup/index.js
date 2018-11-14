/**
 * 弹窗插件，通用版 1.0 
 * 目前父节点全选并非子节点的全选，其他类型后续扩展
 * 约束：
 * 1. 插件接受的数据格式（必须包含）
 * {
 *   id: 1,
 *   name: 'xx',
 *   type: 'xxx', //表示改项的类型，用于区分节点，如果后端数据不需要区分类型，可以在过滤方法添加固定值该属性，要保证能区分各个节点
 *   is_child: 1|0, // 1表示有下一级，0表示5无下级
 *   disabled: 1|0, // 1表示有表示不可编辑，0或者没有改字段表示可编辑
 *   is_checkbox:boolean , //当type =2的情况下需要此参数判断是否未复选框，改字段由前端构建即可
 * }
 * 
 * 2. 判断单前是否选中的规则
 * ‘type(_pid)?_id' //当前项的类型， 父节点的id（如果有的话），但前项目的id
 * 
 * single:boolean, //配置是否未单选，默认false
 * 
 * hideRootAll:boolean //是否隐藏第一层的全新按钮
 * 
 * effectParent:boolean //选择子级是否影响父级 只有type = 1的情况生效
 * 
 * methods:
 * init(cb),  //设置初始化数据，需要构建符合插件的格式，通过cb传回给插件使用
 * load(param,cb), //加载更多数据，param参数提供需要与后端交互的数据，需要构建符合插件的格式，通过cb传回给插件使用
 * callback(rs) //点击保存后返回已选的数据到页面
 */
;(function(){
    function _Popup(target,option){
        this.el = target;
        this.$uid = 0;
        this.$map = {};

        //记录状态
        this.status = {
            hasInit:false,
        }
        //配置项目
        this.$opt = {
            /**
             * 1: 父节点可选，但是非子节点的全选
             * 2: 父节点不可选
             */
            type:1,
            title:"弹窗",
            content: $(".z-popup"),
            hideRootAll:false,
            effectParent:false,
            single:false, //是否单选
        }

        //结果保存集合
        this.selectArr = [];

        $.extend(this.$opt,option);

        if(this.$opt.init){
            this.$init = this.$opt.init;
        }

        if(this.$opt.callback){
            this.$callback = this.$opt.callback;
        }

        this.bind();
    }
    /**
     * $map 操作集合
     */
    _Popup.prototype.getUid = function(){
        return this.$uid++;
    }
    _Popup.prototype.add = function(item){
        var uid = this.getUid();
        return this.set(uid,item);
    }
    _Popup.prototype.set = function(id,item){
        item.uid = id;
        this.$map[id] = item;
        return id;
    }

    _Popup.prototype.get = function(id){
        return this.$map[id];
    }

    /**
     * 绑定事件，主要ui逻辑在此方法处理
     */
    _Popup.prototype.bind = function(){
        var self = this;
        var $origin = $(this.$opt.content).find('.origin');
        var $selected = $(this.$opt.content).find('.selected');
        //绑定触发元素
        $(this.el).on("click",function(){
            layer.open({
                type: 1,
                title: self.$opt.title,
                shade: 0.3,
                maxmin: true,
                shadeClose: false,
                area: ['780px','600px'],
                content: self.$opt.content,
                btn: ['保存', '关闭'],
                btnAlign: 'c',
                yes:function(index, layero){
                    //成功回调
                    var rs = [];
                    $.each(self.selectArr,function(i,id){
                        var item = self.get(id);
                        if(item) rs.push(item);
                    })
                    if(rs.length!=0){
                        $(self.el).closest("div").removeClass("has-error").find("span.Validform_checktip").remove();
                        $(self.el).closest("div").siblings("label").css("color","#555");
                    }
                    typeof self.$callback == 'function' && self.$callback(rs);
                    layer.close(index);
                },
                success: function () {
                    if(!self.status.hasInit){
                        //初始化操作
                        self.status.hasInit = true;
                        typeof self.$init== 'function' && self.$init(function(rs){
                            //init 构建的uid一律为负数,注意需要构建match字段，通过此字段来确定是否勾选
                            var idx = -2;
                            $.each(rs,function(i,item){
                                if(!self.$opt.single || i<1)
                                self.selectArr.push(self.set(idx--,item));
                            })
                           
                            leftCreate();
                        });
                        typeof self.$opt.load == 'function' && self.$opt.load({first:true},function(data){
                            //渲染
                            $origin.html(render(-1,data));
                            //检查是否已勾选
                            checkCheck($origin);
                            
                        });
                    }
                }
            });
        });

        //单选
        $origin.on("change",".check",function(e,ignoreCheckAll,ignoreRender){
            e.preventDefault();
            var _this = $(this),
                id = _this.val(),
                uid = _this.closest('li').data('uid');

            var item = self.get(uid);
            if(item.disabled){
                $(this).prop('checked',!this.checked)
                return false;
            }

            var p =_this.closest("ul").children(".checkall").find("input");
            var pid = p.val();

            var siblings = _this.closest('li').siblings('.child');
            if(this.checked){
                //单选时先把以选择的干掉
                !ignoreRender && this.checked && self.$opt.single && arrRemoveAll(),$(this).prop('checked',true);
                objToArr(uid);
                if(!ignoreCheckAll){
                    var flag = true;
                    siblings.each(function(){
                        var input = $(this).find('>label>input')
                        if(input.length>0 && !input.is(':checked')){
                            flag = false;
                        }
                    });
                    p.prop('checked',flag);
                }
                self.$opt.type == 1 && self.$opt.effectParent && $(this).closest('.child').parents('.child').find('>label>input').prop('checked',true).trigger('change');
            }else{
               
                if(self.$opt.type == 1 && self.$opt.effectParent){
                    var flag = false;
                    siblings.each(function(){
                        var input = $(this).find('>label>input')
                        if(input.length>0 && input.is(':checked')){
                            flag = true;
                            return false;
                        }
                    });
                    !flag && $(this).closest('.child').parents('.child').eq(0).find('>label>input').prop('checked',false).trigger('change');


                    //如果点击父节点的情况，需要取消所有子节点
                    var ul = $(this).parent().siblings('ul');
                    if(ul.length >0){
                        var match = $(this).data('match');
                        ul.find('input').each(function(e){
                            var uid = $(this).closest('li').data('uid');
                            //find if it has parent 
                            if(!isNaN(uid)){
                                arrRemove(uid);
                            }
                            $(this).prop('checked',false);
                        });
                    }
                    
                    var skip = checkChildEffect(self.selectArr,_this.val());
                    $.each(skip,function(idx,id){
                        arrRemove(id);
                    })

                    
                }else{
                    arrRemove(uid);
                }

                p.prop('checked',false);
               
            }
            !ignoreRender && leftCreate();
        });

        //effectParent
        function checkChildEffect(arr,id){
            var skipArr = [];
            $.each(arr,function(idx,uid){
                var item = self.get(uid);
                if(!item){
                    skipArr.push(uid);
                }
                var matchArr = item.match.split('_');
                if(matchArr[1] == id){
                    skipArr.push(uid);
                    if(item.type == 'department'){
                        var nextArr = skipArr.length > 0 ? [] : arr;
                        skipArr.length > 0 && $.each(arr,function(nidx,nuid){
                            if(skipArr.indexOf(nuid) == -1) nextArr.push(nuid);
                        });
                        skipArr = skipArr.concat(checkChildEffect(nextArr,item.id));
                    }
                }
            });

            return skipArr;
        }

        //展开下级
        $origin.on("click",".get-next",open);

        //全选操作
        $origin.on('change',".checkall input",function(){
            //单选时不应该出现全选，防止一下还是加个return好
            if(self.$opt.single) return false;

            var checkboxs = $(this).closest('li').siblings(".child").find('>label>.check');
            if(this.checked){
                checkboxs.each(function(i){
                    if(!this.checked){
                        $(this).prop('checked',true).trigger('change',true);
                    }
                })
            }else{
                checkboxs.each(function(i){
                    if(this.checked){
                        $(this).prop('checked',false).trigger('change',true);
                    }
                })
            }
        });

        //左侧删除
        $selected.on("click",".fa-close",function(){
            var _this = $(this);
            _this.parents("li").remove();
            var uid = _this.closest('li').data('uid');
            var match = _this.closest('li').data('match');
            arrRemove(uid);
            $origin.find("[data-match='"+match+"']").prop('checked',false).trigger('change');
        });

        //加载下一级数据
        function open(){
            var _this = $(this),
                _parent = _this.closest("li"),
                uid = _parent.data('uid');
            
            if(_this.hasClass('load-empty')){
                layer.msg('没有下级数据');
                return false;
            }

            if(_parent.hasClass("open")){
                _parent.removeClass("open");
            }else{
                //不关闭已展开的，感觉页面交互有点怪
                // _parent.siblings("li").removeClass("open");
                _parent.addClass("open");

            }
            if(!_this.hasClass('load-done')){

                var uitem = self.get(uid);
                if(!uitem) return false;

                typeof self.$opt.load == 'function' && self.$opt.load(uitem,function(data){
                    if(!data.length){
                        _this.addClass('load-empty');
                        layer.msg('没有下级数据');
                        return false;
                    }
                    var html = render(uid,data);
                    if(html){
                        _this.siblings("ul").html( html);
                        _this.addClass('load-done');
                        checkCheck(_this.siblings('ul'));
                    }
                })
            }else{
                checkCheck(_this.siblings('ul'));
            }
        }

        /**
         * 渲染树
         * @param {Int} uid 被插入节点的uid，如果没有上级则约定等于 -1
         * @param {Array} data 数组
         */
        function render(uid,data){
            var html= '';
            if(data && data.length){
                if(uid == -1 && self.$opt.hideRootAll){

                }else{
                    !self.$opt.single && (html += '<li class="checkall"><label ><input type="checkbox">全选</label></li>');
                }
                $.each(data,function(i,item){
                    var match = item.type + '_' ;
                    if(uid !== -1){//存在父级的情况
                        var parent = self.get(uid);
                        item.parent = parent;
                        match += parent.id +'_'
                    }
                    match += item.id;
                    item.match = match;
                    var suid = self.add(item);
                    html += '<li class="item child" data-uid="'+suid+'">';

                    var hasChildData = item.child && item.child.length;
                    var hasShowNext = item.is_child == 1 || hasChildData;
                    
                    switch(self.$opt.type){
                        case 1:
                            html += '<label ><input type="checkbox" class="check" value="'+item.id+'" data-match="'+item.match+'">'+item.name+'</label> ';
                            if(hasShowNext){//有下一级的情况
                                html +='<a href="javascript:;" class="has-child2 get-next ' + (hasChildData ? 'load-done':'') +'"></a><ul>'
                                if(hasChildData){
                                    html += render(suid,item.child);
                                }
                                html +='</ul></li>'
                            }
                            break;
                        case 2:
                            if(!item.is_checkbox){
                                var dclass = !hasShowNext ? 'load-empty' : hasChildData ? 'load-done':'';
                                html += '<a href="javascript:;" class="has-child get-next ' + dclass +'"><i class="fa popup-font"></i>'+item.name+'</a>'
                                if(hasShowNext){//有下一级的情况
                                    html +='<ul>';
                                    if(hasChildData){
                                        html += render(suid,item.child);
                                    }
                                    html +='</ul></li>'
                                }
                            }else{
                                html += '<label ><input type="checkbox" '+ (!!item.disabled ? "disabled" : "") +' class="check" value="'+item.id+'" data-match="'+item.match+'">'+item.name+'</label> ';
                            }
                            break;
                    }
                    
                    
                });
            }
            
            return html;
        }

        /**
         * 判断是否以加入数组中
         * 检查勾选的规则是
         * type(_pid)?_id
         * 这种规则适合有type类型返回并且同级不可能存在类型和id相同，
         * 或者不同级别的情况（此处就记录两级），不可能存在类型且上下两级的id同时相同的数据
         */
        function checkCheck(_this){
            var li = $selected.find('ul>li');
            li.each(function(){
                var ck = _this.find('[type=checkbox][data-match="'+$(this).data('match')+'"]');
                if(ck.size()>0){
                    var uid = ck.closest('li').data('uid');
                    var ouid = $(this).data('uid');
                    var oitem = self.get(ouid);
                    var item = self.get(uid);
                    
                    $(this).attr('data-uid',uid);

                    arrRemove(ouid);
                    objToArr(uid);

                    ck.prop('checked',true).trigger('change',[false,true]);
                    if(typeof oitem.disabled !== undefined){
                        item.disabled = oitem.disabled
                        if(item.disabled){
                            ck.prop('disabled',true);
                        }
                    }
                }
            })
        }
    
         //del
        function arrRemove(uid){
            //不能用id删除，有可能id相同
            var index = self.selectArr.indexOf(uid);
            if(index!=-1)
            self.selectArr.splice(index, 1)

        }

        //全删除
        function arrRemoveAll(){
            self.selectArr = [];
            $origin.find(':checkbox').prop('checked',false);
            leftCreate();
        }

        //push
        function objToArr(uid){
            var index = self.selectArr.indexOf(uid);
            if(index == -1 ) self.selectArr.push(uid);
        }
        //左侧
        function leftCreate(){
            var leftstr = "";
            $.each(self.selectArr,function(i,id){
                var item = self.get(id);
                leftstr += '<li class="left-item" data-uid="'+item.uid+'" data-match="'+ item.match+'"><span>'+ (item.parent ? item.parent.name  + ' ' : '') + item.name + '</span>'+ (!item.disabled ? '<i class="fa fa-close"></i>' : '') +'</li>'
            })
            $selected.find("ul").html(leftstr);
        }
    }

    /**
     * 清楚所有数据，同时实例变成未初始化状态
     */
    _Popup.prototype.$destory = function(){
        $(this.$opt.content).find('.origin>ul').html('');
        $(this.$opt.content).find('.selected>ul').html('');
        this.selectArr = [];
        this.$map = {}
        this.$uid = 0;
        this.status.hasInit = false;
    }

    $.fn.zPopup = function(option){
        //便于调试
        window.zPopup = window.zPopup || [];
        var instance = new _Popup(this,option);
        window.zPopup.push(instance);
        return instance;
    }
})();

