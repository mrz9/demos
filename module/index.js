/**
 * 瞎yy的加载器
 */

;(function(){
    if(typeof window.zModule == 'undefined'){
        window.zModule = {
            load:function(url,sync){
                $.ajax({
                    url:url,
                    async:!sync
                }).done(function(rs){
                    if(typeof window.module_id_index == 'undefined') {
                        window.module_id_index = 0;
                    }
                    if($.trim(rs)){
                        var module_index = module_id_index++;
                        var template = rs.match(/\<template\>([\s\S]*)\<\/template\>/);
                        var style = rs.match(/\<style\>([\s\S]*)\<\/style\>/);
                        var script = rs.match(/\<script\>([\s\S]*)\<\/script\>/);
                
                        if(template && $.trim(template[1])){
                            $('body').append('<div id="module_'+ module_index +'">'+template[1]+'</div>');
                        }
                
                        if(style && $.trim(style[1])){
                            $('head').append('<style id="module_style_'+ module_index +'">'+style[1]+'</style>')
                        }
                
                        if(script && $.trim(script[1])){
                            eval(script[1]);
                        }
                    }
                }).fail(function(err){
                    console.error(err);
                })
            }
        } 
    }
})();