Jade.DatePicker = {

    onSelectDate: function() {},

    setVars: function( settings ) {
        $.extend( this, {
            init_daypicker:   true,
            init_monthpicker: true,
            init_yearpicker:  true,
            selected_date:    new Date(),
            today:            new Date(),
            is_mouseleave:    false,
            state:            null,
            first_date:       null,
            last_date:        null,
            prev_last_date:   null,
            prev_dates:       null,
            prev_offset:      null,
            date_value:       null
        });

        $.extend( this, settings );

        this.region_name ? null : this.region_name = this.default_region_name;
        this.region = this.regions[ this.region_name ];
        this.date_format = settings.format ? settings.format : this.date_format_patterns[ this.region_name ];
    },

    renderWrapper: function( date_field ) {
        var parent   = $( "<div class='jade'>" ).append( this.tmpl ),
            icon     = $( "<div class='jade__icon'>" ),
            calendar = parent.find( ".jade__calendar" );

        parent.insertBefore( date_field ).append( date_field, icon  ).width( date_field.outerWidth() + 17 );
        calendar.css( "top", parent.outerHeight() );
        date_field.attr( "data-datepicker-init", "true" );

        return { parent: parent, icon: icon, calendar: calendar, date_field: date_field };
    },

    cacheNodes: function( date_field, wrapper_obj ) {
        var calendar = wrapper_obj.calendar;

        this.nodes = {
            month_curr:  calendar.find( ".jade-nav__month" ),
            year_curr:   calendar.find( ".jade-nav__year" ),
            dates_names: calendar.find( ".jade-dates__names-row th" ),
            dates_items: calendar.find( ".jade-dates__items-row td" ),
            dates_table: calendar.find( ".jade-dates" ),
            today:       calendar.find( ".jade-today" ),
            today_btn:   calendar.find( ".jade-today__btn" )
        };

        $.extend( this.nodes, wrapper_obj );
    },

    initDaysPicker: function() {
        this.setDayNames();
        this.setCalendarState( "dates" );

        this.setMonthInterval( this.selected_date );
        this.setSelectedDate( this.selected_date.getDate() );
        this.updateDateTitle();
        this.setDatesByMonth();
        this.tryToDisplaySelectedDate();

        this.bindDayPickerEvents();

        this.date_value = this.getFormatDate();
        this.nodes.date_field.val( this.date_value );
    },

    bindDayPickerEvents: function() {
        var self = this;

        this.nodes.parent.delegate( this._nav_left,  "mousedown", function() { return false; } );
        this.nodes.parent.delegate( this._nav_right, "mousedown", function() { return false; } );

        this.nodes.today_btn.click( function() {
            self.hide();
            self.selectDate( self.today, self.today.getDate() );
        });

        this.nodes.icon.click( function() {
            self.nodes.calendar.is( ":visible" ) ? self.hide() : self.nodes.date_field.focus();
        });

        this.nodes.date_field[ this.keypress_event_name ]( function( e ) {
            switch( e.keyCode ) {
                case 27: { self.hide(); } break;
                default: { self.setDateByString(); }
            }
        });

        this.nodes.date_field.focus( function() {
            self.show();
        });

        this.nodes.date_field.blur( function() {
            self.is_mouseleave ? self.hide() : null;
        });

        this.nodes.calendar.delegate( "." + this._dates_item, "click", function() {
            self.hide();
            self.selectDate( self.first_date, $( this ).text() );
        });

        this.nodes.calendar.delegate( "." + this._dates_item_selected, "click", function() {
            self.hide();
        });

        this.nodes.parent.delegate( this._nav_left_by_dates, "click", function() {
            self.navigateByMonth( -1 );
        });

        this.nodes.parent.delegate( this._nav_right_by_dates, "click", function() {
            self.navigateByMonth( 1 );
        });
    },

    bindMouseMoveEvents: function( self ) {
        this.nodes.parent.mouseleave( function( e ) {
            self.is_mouseleave = true;
            self.nodes.date_field.focus();
        });

        this.nodes.parent.mouseenter( function( e ) {
            self.is_mouseleave = false;
        });
    },

    offMouseMoveEvents: function() {
        this.nodes.parent.off( "mouseleave mouseenter" );
    },

    setDateByString: function() {
        var date_value = this.nodes.date_field.val(), date;

        if ( this.nodes.date_field.val() !== this.date_value ) {
            try {
                date = this.parseDate( this.date_format, date_value );
            } catch( e ) {
                console.log( e );
            }

            if ( date ) {
                this.setMonthInterval( date );
                this.setSelectedDate( date.getDate() );
                this.updateDates();
            }
        }
    },

    navigateByMonth: function( offset ) {
        this.setMonthByOffset( offset );
        this.updateDates();
        this.nodes.date_field.focus();
    },

    selectDate: function( date, date_number ) {
        this.setMonthInterval( date );
        this.setSelectedDate( date_number );
        this.updateDates();
        this.date_value = this.getFormatDate();
        this.nodes.date_field.val( this.date_value );
        this.onSelectDate();
    },

    tryToDisplaySelectedDate: function() {
        if ( this.isDisplaySelectedDate() ) {
            this.nodes.calendar
                .find( "." + this._dates_item_selected )
                .attr( "class", this._dates_item );

            this.nodes.dates_items
                .eq( this.prev_offset + this.selected_date.getDate() )
                .attr( "class", this._dates_item_selected );
        }
    },

    setDayNames: function() {
        for ( var i = 0; i < 7; i++ ) {
            this.nodes.dates_names.eq( i )
                .text( this.region.day_names_short[ i ] )
                .attr( "title", this.region.day_names[ i ] );
        }
    },

    updateDates: function() {
        this.updateDateTitle();
        this.setDatesByMonth();
        this.tryToDisplaySelectedDate();
    },

    setDatesByMonth: function() {
        var date, cl, last_date = this.last_date.getDate();

        for ( var i = 0; i < 42; i++ ) {
            if ( i <= this.prev_offset ) {
                date = this.prev_last_date - this.prev_offset + i;
                cl   = this._dates_item_blocked;
            } else if ( ( i > this.prev_offset && i <= ( this.prev_offset + last_date ) ) ) {
                date = i - this.prev_offset;
                cl   = this._dates_item;
            } else {
                date = i - last_date - this.prev_offset;
                cl   = this._dates_item_blocked;
            }

            this.nodes.dates_items.eq( i ).text( date ).attr( "class", cl );
        }
    },

    setCalendarState: function( state ) {
        this.nodes.calendar.attr( "class", this._calendar + " " + this._calendar + "_" + state );
        this.state = state;
    },

    show: function() {
        if ( this.nodes.calendar.is( ":hidden" ) ) {
            if ( !this.isDisplaySelectedDate() ) {
                this.selectDate( this.selected_date, this.selected_date.getDate() );
            }

            this.updateDateTitle();
            this.setCalendarState( "dates" );
            this.bindMouseMoveEvents( this );
            this.is_mouseleave = false;
            this.nodes.calendar.fadeIn( 200 );
        }
    },

    hide: function() {
        this.offMouseMoveEvents();
        this.nodes.calendar.fadeOut( 200 );
    },

    updateDateTitle: function() {
        this.nodes.month_curr.text( this.region.month_names[ this.first_date.getMonth() ] );
        this.nodes.year_curr.text( this.first_date.getFullYear() );
    }
};