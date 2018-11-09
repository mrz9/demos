/**
 * 瞎yy的加载器
 */

;(function(){
    if(typeof window.zModule == 'undefined'){
        window.zModule = {
            load:function(url,sync){
                var xhr = new XMLHttpRequest();
                xhr.open('GET',url,false);
                xhr.onload = function(){
                    var rs = xhr.responseText;
                    if(typeof window.module_id_index == 'undefined') {
                        window.module_id_index = 0;
                    }
                    if(rs.trim()){
                        var module_index = module_id_index++;
                        var template = rs.match(/\<template\>([\s\S]*)\<\/template\>/);
                        var style = rs.match(/\<style\>([\s\S]*)\<\/style\>/);
                        var script = rs.match(/\<script\>([\s\S]*)\<\/script\>/);
                        
                        if(style && style[1].trim()){
                            var sty = document.createElement('style');
                            sty.setAttribute("type", "text/css");
                            sty.setAttribute("id", 'module_style_'+ module_index);
                            var css = style[1];
                            if (sty.styleSheet) { // IE
                                sty.styleSheet.cssText = css;
                            } else {
                                sty.appendChild(document.createTextNode(css));
                            }
                            document.querySelector('head').appendChild(sty);
                        }

                        if(template && template[1].trim()){
                            var div = document.createElement('div');
                            div.id = 'module_'+ module_index;
                            div.innerHTML = template[1];
                            document.body.appendChild(div);
                        }
                
                        if(script && style[1].trim()){
                            setTimeout(script[1],0);
                        }
                    }
                }
                xhr.onerror = function(){
                    console.error(err);
                }
                xhr.send(null);
            }
        } 
    }
})();