;(function($) {
'use strict';

var
_settings = {
	editable: false
},
selectx = {
    init: function(select, options) {
        var settings = $.extend(true, {}, _settings, options),
        	editable = settings.editable === true ? true : false,
        	$select = $(select),
            $wrapper = $('<div/>').insertBefore($select),
            $block = $('<div/>').appendTo($wrapper),
            $input = $(editable ? '<input/>' : '<span></span>').appendTo($block),    // 显示option的text
            $value = $('<input type="hidden"/>').insertAfter($input),   // 保存select的value，提交到服务器的值
            $iconBlock = $('<div/>').appendTo($block),
            $icon = $('<div/>').appendTo($iconBlock),
            $list = $('<ul/>').insertAfter($block),
            border = $select.css('border') || '1px solid #ccc',
            focusBorder = '1px solid #999',
            listBorder = '1px solid #aaa',
            iconWidth = 18,
            expended = false,
            cursorOnList = false,
            cursorOnBlock = false,
            fadeTime = 10;
        
        if (!editable) {
        	$input.css('cursor', 'pointer').val = function(v) {
        		return $input.html(v);
        	};
        	
        	$(document).on('click', function(e) {
        		if (!cursorOnList && !cursorOnBlock && expended) {
        			downArrow();
        		}
        	});
        }

        $wrapper.css({
            display: 'inline-block',
            margin: 0,
            padding: 0,
            border: 'none'
        });
        
        $block.attr({
            'class': $select.attr('class')
        }).css({
            display: 'inline-block',
            border: border,
            width: $select.outerWidth(),
            height: $select.outerHeight(),
            padding: 0,
            margin: 0,
            float: 'left'
        }).hover(
            function() {
                cursorOnBlock = true;
            },
            function() {
                cursorOnBlock = false;
            }
        );;
        
        $iconBlock.css({
            display: 'inline-block',
            borderLeft: border,
            width: iconWidth,
            height: $block.height(),
            boxSizing: 'border-box',
            cursor: 'pointer',
            float: 'right'
        }).on('click', function(e) {
            e.preventDefault();
            $input.trigger('click');
        });
        
        $icon.css({
            width: 0,
            height: 0,
            position: 'relative',
            left: (iconWidth - 6) / 2,
            top: ($block.height() - 6) / 2
        });
        
        function downArrow() {
            $icon.css({
                borderLeft: '3px solid transparent',
                borderRight: '3px solid transparent', 
                borderTop: '6px solid #999',
                borderBottom: 'none'
            });
            $block.css('border', border);
            expended = false;
            hideList();
        }
        
        function upArrow() {
            $icon.css({
                borderLeft: '3px solid transparent',
                borderRight: '3px solid transparent', 
                borderTop: 'none',
                borderBottom: '6px solid #999'
            });
            $block.css({
                border: focusBorder,
                borderBottom: border
            });
            expended = true;
            showList();
        }
        
        $value.attr({
            id: $select.attr('id') + '_value',
            name: $select.attr('name')
        });
        $input.attr({
            id: $select.attr('id'),
            alt: $select.attr('alt'),
            title: $select.attr('title'),
            disabled: $select.attr('disabled'),
            tabindex: $select.attr('tabindex')
        }).css({
            border: 'none',
            display: 'inline-block',
            fontFamily: $select.css('fontFamily'),
            fontSize: $select.css('fontSize'),
            background: $select.css('background'),
            width: $block.innerWidth() - $iconBlock.outerWidth(),
            height: $block.height(),
            lineHeight: $select.css('lineHeight'),
            margin: 0,
            paddingLeft: $select.css('paddingLeft'),
            paddingRight: $select.css('paddingRight'),
            paddingTop: $select.css('paddingTop'),
            paddingBottom: $select.css('paddingBottom'),
            boxSizing: 'border-box',
            float: 'left'
        }).on('click', function() {
            prepareAllOption();
            if (expended) {
                downArrow();
            } else {
                upArrow();
            }
        }).on('focus', function() {
            $input.css({
                outline: 'none' 
            });
        }).on('blur', function() {
            if (!cursorOnList) {
                downArrow();
            }
        }).keyup(function(e){
            filterOptions($input.val());
            $value.val($input.val());
            showList();
        });
        // 保存值
        $value.val($select.val());
        $input.val($select.find('> option:selected').text());
        
        $list.css({
            display: 'none',
            listStyleType: 'none',
            width: $select.outerWidth(),
            padding: 0,
            margin: 0,
            border: listBorder,
            fontFamily: $select.css('fontFamily'),
            fontSize: $select.css('fontSize'),
            background: '#fff',
            float: 'left',
            marginTop: $block.outerHeight() - 1,
            position: 'absolute',
            zIndex: 1000000
        }).hover(
            function() {
                cursorOnList = true;
            },
            function() {
                cursorOnList = false;
            }
        );
        
        function highlightOption(opt) {
	        $(opt).css({
	        	backgroundColor: '#eee'
	        }).siblings().css({
	            backgroundColor: '#fff'
	        })
        }
        
        function prepareOption(text, value) {
            var liStart =  (undefined == value || null == value)
                            ? '<li>' : '<li data-value="' + value + '">',
                $opt = $(liStart + text + '</li>').appendTo($list);

            $opt.css({
            	display: 'list-item',
                padding: '3px',
                paddingLeft: $select.css('paddingLeft'),
                paddingRight: $select.css('paddingRight'),
                textAlign: 'left',
                cursor: 'pointer'
            }).hover(
                function() {
                	highlightOption($opt);
                }
            ).on('click', function() {
                $iconBlock.trigger('click');
                $input.val($opt.text());
                $value.val($opt.attr('data-value'));
            }).css({
                height: function() {
                    var
                    toNumber = function(pxVal) {
                        return parseInt(pxVal.substring(0, pxVal.length - 2)) || 0;
                    },
                    paddingHeight = toNumber($opt.css('paddingTop') || '0px') +
                             toNumber($opt.css('paddingBottom') || '0px'),
                    innerHeight = Math.max(
                    		toNumber($opt.css('fontSize') || '0px'),
	                    	Math.max(toNumber($opt.css('lineHeight') || '0px'), $select.height())
	                );
                    
                    return paddingHeight + innerHeight;
                }()
            });
        }
        
        function addOption(opt) {
            var $option = $(opt);
            prepareOption($option.text(), $option.val());
        }
        
        function prepareAllOption() {
            $list.children().remove();
            $select.children().each(function(i, e){
                addOption(e);
            });
        }
        
        function filterOptions(value) {
            $list.children().remove();
            $select.children().each(function(i, e) {
                if (($(e).val() || '').indexOf(value) >= 0) {
                    addOption(e);
                }
            });
        }
        
        function showList() {
            if ($list.children().length > 0) {
                var val = $value.val(),
                    optVal, $opt;
                $list.children().each(function(i, e) {
                    $opt = $(e);
                    optVal = $opt.attr('data-value');
                    if (optVal === val) {
                        $opt.css({
                            backgroundColor: '#eee'
                        });
                    } else {
                        $opt.css({
                            backgroundColor: '#fff'
                        });
                    }
                });
                $list.fadeIn(fadeTime);
            } else {
                $list.fadeOut(fadeTime);
                $block.css({borderBottom: focusBorder});
            }
        }
        
        function hideList() {
            $list.fadeOut(fadeTime);
        }
        
        // initialize the select
        downArrow();
        $select.removeAttr('id').removeAttr('name').hide();
        prepareAllOption();
    }
};

$.fn.selectx = function(options) {
    return $(this).each(function(i, e) {
        selectx.init(this, options);
    });
};
$.fn.selectx.settings = _settings;
})(jQuery);
