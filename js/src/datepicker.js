/**
 * @lends Jade.DatePickerWidget.prototype
 */
Jade.DatePicker =
{
    setVars: function( settings )
    {
        $.extend( this,
        {
            selected_date:  new Date(),
            today:          new Date(),
            is_mouseleave:  false,
            state:          null,
            first_date:     null,
            last_date:      null,
            prev_last_date: null,
            prev_dates:     null,
            prev_offset:    null
        });

        $.extend( this, settings );

        this.region = this.regions[ this.region_name ];
    },

    cacheNodes: function( date_field )
    {
        var
            parent   = date_field.parent().append( this.tmpl ),
            calendar = parent.find( ".b-datepicker__calendar" ),
            icon     = parent.find( ".b-datepicker__icon" );

        calendar.css( "top", parent.outerHeight() );
        date_field.attr( "data-datepicker-init", "true" );

        this.nodes =
        {
            date_field:  date_field,
            parent:      parent,
            icon:        icon,
            calendar:    calendar,
            month_curr:  calendar.find( ".b-datepicker-nav__month" ),
            year_curr:   calendar.find( ".b-datepicker-nav__year" ),
            dates_names: calendar.find( ".b-datepicker-dates__names-row td" ),
            dates_items: calendar.find( ".b-datepicker-dates__items-row td" ),
            dates_table: calendar.find( ".b-datepicker-dates" ),
            today:       calendar.find( ".b-datepicker-today" ),
            today_btn:   calendar.find( ".b-datepicker-today__btn" )
        };
    },

    initDaysPicker: function()
    {
        this.setDayNames();
        this.setCalendarState( "dates" );

        this.setMonthInterval( this.selected_date );
        this.setSelectedDate( this.selected_date.getDate() );
        this.updateDateTitle();
        this.setDatesByMonth();
        this.tryToDisplaySelectedDate();

        this.onTodaySet( this );
        this.onDaySelect( this );
        this.onIconClick( this );
        this.onDateFieldFocus( this );
        this.onDateFieldBlur( this );
        this.onMonthNavByDaysState( this );
        this.onKeyUp( this );

        this.nodes.date_field.val( this.getFormatDate() );
    },

    onKeyUp: function( self )
    {
         var event_name = $.browser.opera ? "keypress" : "keyup";

         this.nodes.date_field[ event_name ]( function( e )
         {
            switch( e.keyCode )
            {
                case 27: { self.hide(); } break;
            }
         });
    },

    onTodaySet: function( self )
    {
        this.nodes.today_btn.click( function()
        {
            self.hide();
            self.selectDate( self.today, self.today.getDate() );
        });
    },

    onDaySelect: function( self )
    {
        this.nodes.calendar.delegate( "." + this._dates_item, "click", function( e )
        {
            self.hide();
            self.selectDate( self.first_date, $( this ).text() );
        });

        this.nodes.calendar.delegate( "." + this._dates_item_selected, "click", function( e )
        {
            self.hide();
        });
    },

    onIconClick: function( self )
    {
        this.nodes.icon.click( function()
        {
            self.nodes.calendar.is( ":visible" ) ? self.hide() : self.nodes.date_field.focus();
        });
    },

    onDateFieldFocus: function( self )
    {
        this.nodes.date_field.focus( function()
        {
            self.show();
        });
    },

    onDateFieldBlur: function( self )
    {
        this.nodes.date_field.blur( function()
        {
            self.is_mouseleave ? self.hide() : null;
        });
    },

    onMouseMove: function( self )
    {
        this.nodes.parent.mouseleave( function( e )
        {
            self.is_mouseleave = true;
            self.nodes.date_field.focus();
        });

        this.nodes.parent.mouseenter( function( e )
        {
            self.is_mouseleave = false;
        });
    },

    onMonthNavByDaysState: function( self )
    {
        self.nodes.parent.delegate( self._nav_left_by_dates, "click", function()
        {
            self.navigateByMonth( -1 );
        });

        self.nodes.parent.delegate( self._nav_right_by_dates, "click", function()
        {
            self.navigateByMonth( 1 );
        });
    },

    navigateByMonth: function( offset )
    {
        this.setMonthByOffset( offset );
        this.updateDates();
        this.nodes.date_field.focus();
    },

    selectDate: function( date, date_number )
    {
        this.setMonthInterval( date );
        this.setSelectedDate( date_number );
        this.updateDates();
        this.nodes.date_field.val( this.getFormatDate() );
    },

    offMouseMove: function()
    {
        this.nodes.parent.off( "mouseleave mouseenter" );
    },

    tryToDisplaySelectedDate: function()
    {
        if ( this.isDisplaySelectedDate() )
        {
            this.nodes.calendar
                .find( "." + this._dates_item_selected )
                .attr( "class", this._dates_item );

            this.nodes.dates_items
                .eq( this.prev_offset + this.selected_date.getDate() )
                .attr( "class", this._dates_item_selected );
        }
    },

    setDayNames: function()
    {
        for ( var i = 0; i < 7; i++ )
        {
            this.nodes.dates_names.eq( i )
                .text( this.region.day_names_short[ i ] )
                .attr( "title", this.region.day_names[ i ] );
        }
    },

    updateDates: function()
    {
        this.updateDateTitle();
        this.setDatesByMonth();
        this.tryToDisplaySelectedDate();
    },

    setDatesByMonth: function()
    {
        var date, cl, last_date = this.last_date.getDate();

        for ( var i = 0; i < 42; i++ )
        {
            if ( i <= this.prev_offset )
            {
                date = this.prev_last_date - this.prev_offset + i;
                cl   = "b-datepicker-dates__item_blocked";
            }
            else if ( ( i > this.prev_offset && i <= ( this.prev_offset + last_date ) ) )
            {
                date = i - this.prev_offset;
                cl   = "b-datepicker-dates__item";
            }
            else
            {
                date = i - last_date - this.prev_offset;
                cl   = "b-datepicker-dates__item_blocked";
            }

            this.nodes.dates_items.eq( i ).text( date ).attr( "class", cl );
        }
    },

    setCalendarState: function( state )
    {
        this.nodes.calendar.attr( "class", "b-datepicker__calendar b-datepicker__calendar_" + state );
        this.state = state;
    },

    show: function()
    {
        if ( this.nodes.calendar.is( ":hidden" ) )
        {
            if ( !this.isDisplaySelectedDate() )
            {
                this.selectDate( this.selected_date, this.selected_date.getDate() );
            }

            this.updateDateTitle();
            this.setCalendarState( "dates" );
            this.onMouseMove( this );
            this.is_mouseleave = false;
            this.nodes.calendar.fadeIn( 200 );
        }
    },

    hide: function()
    {
        this.offMouseMove();
        this.nodes.calendar.fadeOut( 200 );
    },

    updateDateTitle: function()
    {
        this.nodes.month_curr.text( this.region.month_names[ this.first_date.getMonth() ] );
        this.nodes.year_curr.text( this.first_date.getFullYear() );
    }
};