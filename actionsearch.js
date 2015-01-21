;(function ( $, window, document, undefined ) {

  var pluginName = "ActionSearch",
      defaults = {
        search_trigger_link_class: ".action-search-trigger",
        search_show_keycode: 46,
        search_hide_keycode: 27,
        list_max_count: 6
      };

  function Plugin ( element, options ) {
      this.element = element;
      this.$el = $(element);
      this.$input = this.$el.find('input');
      this.settings = $.extend( {}, defaults, options );
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
  }

  Plugin.prototype = {
    init: function () {
      this.$el.hide();
      $('li', this.$el).hide();
      $('li:lt(' + this.settings.list_max_count + ')', this.$el).show();

      $(document).on('click', this.settings.search_trigger_link_class, this.showSearch(this, 'toggle'))
                 .on('keypress', this.bindKeyCode(this.settings.search_show_keycode, this.showSearch(this, 'show')))
                 .on('keyup', this.bindKeyCode(this.settings.search_hide_keycode, this.showSearch(this, 'hide')));

      $(this.$el).on('keyup', 'input', $.proxy(this.clearSelected, this))
                 .on('keypress keyup keydown click', 'input', this.search(this));

      $(this.$el).on('keydown', this.handleSelection(this));
      this.$input.attr('autocomplete', 'off');
    },

    showSearch: function(_this, mode) {
      return function() {
        _this.$el.toggle(300, function() {
          if(_this.$el.css('display')!=='none') {
            _this.$input.focus();
          }
        });
        _this.$el.find('.selected').removeClass('selected');
      };
    },

    search: function(_this) {
      return function() {
        var $this = $(this),
            query = $this.val().toLowerCase(),
            lis = $('li', _this.$el),
            count = 0;

        if(query.trim() === '') {
          lis.hide();
          $('li:lt(' + _this.settings.list_max_count + ')', this.$el).show();
          return;
        }

        possibilities = query.split(' ');
        lis.hide().filter(function(){
          console.log(count);
          if(count < _this.settings.list_max_count) {
            for(var i=0; i<possibilities.length;    i++) {
              if($(this).text().toLowerCase().indexOf(possibilities[i]) > 0 ){
                count++;
                return true;
              };
            }
          }
        }).show();
      }
    },

    clearSelected: function(e) {
      var ENTER =13,
          UP = 38,
          DOWN = 40;
          key = e.keyCode || e.which;

        if([ENTER, DOWN, UP].indexOf(key) < 0) {
          this.$el.find('.selected').removeClass('selected');
        }
    },

    handleSelection: function(_this) {
      var ENTER =13,
          UP = 38,
          DOWN = 40;

      return function(e) {
        var key = e.keyCode || e.which,
            lis = $('li', _this.$el),
            visible_lis = lis.filter(function(){return $(this).css('display')!=='none';});  

        if([ENTER, DOWN, UP].indexOf(key) > 0) {
          e.stopPropagation();
        }

        if(key === ENTER) {
          var selected = $('.selected a', _this.$el)
          if(selected.length > 0 ) {
            _this.$input.val(selected.text().trim()).attr('disabled', 'disabled');
            document.location.href = selected.attr('href');
          }
        }

        if(visible_lis.filter('.selected').length === 0) {
          if(key === DOWN) {
            visible_lis.first().addClass('selected');
          }
          if(key === UP) {
            visible_lis.last().addClass('selected');
          }
        } else {
          if(key === DOWN) {
            if (visible_lis.filter('.selected').removeClass('selected').nextAll(':visible').first().addClass('selected').length === 0) {
              visible_lis.last().removeClass('selected');
              visible_lis.first().addClass('selected');
            }
          }
          if(key === UP) {
            if (visible_lis.filter('.selected').removeClass('selected').prevAll(':visible').first().addClass('selected').length === 0 ) {
              visible_lis.first().removeClass('selected');
              visible_lis.last().addClass('selected');
            }
          }
        }
      }
    },

    bindKeyCode: function(keycode, func) {
      return function(e) {
        var code = e.keyCode || e.which;
        if(code == keycode) {
          func.apply(this);
        }
      }
    }
  };

  $.fn[ pluginName ] = function ( options ) {
      this.each(function() {
          if ( !$.data( this, "plugin_" + pluginName ) ) {
              $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
          }
      });
      return this;
  };

})( jQuery, window, document );