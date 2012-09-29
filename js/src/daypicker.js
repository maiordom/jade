/**
 * @lends Jade.Datepicker.prototype
 */
Jade.DayPicker =
{
    setVars: function( settings )
    {
        $.extend( this,
        {
            is_mouseleave: false,
            state:         null,
            first_date:    null,
            last_date:     null,
            last_day:      null,
            prev_last_day: null,
            prev_days:     null,
            prev_offset:   null,
            selected_date: new Date(),
            today:         new Date()
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
            date_field:    date_field,
            parent:     parent,
            icon:       icon,
            calendar:   calendar,
            month_curr: calendar.find( ".b-datepicker-nav__month" ),
            year_curr:  calendar.find( ".b-datepicker-nav__year" ),
            days_table: calendar.find( ".b-datepicker-days" ),
            day_names:  calendar.find( ".b-datepicker-days__names-row td" ),
            day_items:  calendar.find( ".b-datepicker-days__numbers-row td" ),
            today:      calendar.find( ".b-datepicker-today" ),
            today_btn:  calendar.find( ".b-datepicker-today__btn" )
        };
    },

    initDaysPicker: function()
    {
        this.setDayNames();
        this.setCalendarState( "days" );

        this.onDaysNav();
        this.onDateFieldBlur();
        this.onDateFieldFocus();
        this.onDaySelect();
        this.onIconClick();
        this.onTodaySet();

        this.nodes.date_field.val( this.getSelectedDate( this.selected_date.getDate() ) );
    },

    onTodaySet: function()
    {
        var self = this;

        self.nodes.today_btn.click( function()
        {
            self.hide();
            self.setCalendarState( "days" );
            self.selectDate( self.today );
            self.nodes.date_field.val( self.getSelectedDate( self.selected_date.getDate() ) );
        });
    },

    onDaySelect: function()
    {
        var self = this;

        self.nodes.calendar.delegate( "." + this._day_item, "click", function( e )
        {
            var day = $( this );
            self.hide();
            self.setSelectedDate( day.text() );
            self.nodes.date_field.val( self.getSelectedDate( day.text() ) );
        });

        self.nodes.calendar.delegate( "." + this._day_item_selected, "click", function( e )
        {
            self.hide();
        });
    },

    onIconClick: function()
    {
        var self = this;

        self.nodes.icon.click( function()
        {
            self.nodes.calendar.is( ":visible" ) ? self.hide() : self.nodes.date_field.focus();
        });
    },

    onDateFieldFocus: function()
    {
        var self = this;

        self.nodes.date_field.focus( function()
        {
            self.show();
            self.tryToDisplaySelectedDate();
        });
    },

    onDateFieldBlur: function()
    {
        var self = this;

        self.nodes.date_field.blur( function()
        {
            self.is_mouseleave ? self.hide() : null;
        });
    },

    offMouseMove: function()
    {
        this.nodes.parent.off( "mouseleave mouseenter" );
    },

    onMouseMove: function()
    {
        var self = this;

        self.nodes.parent.mouseleave( function( e )
        {
            self.is_mouseleave = true;
            self.nodes.date_field.focus();
        });

        self.nodes.parent.mouseenter( function( e )
        {
            self.is_mouseleave = false;
        });
    },

    onDaysNav: function()
    {
        var self = this;

        self.nodes.parent.delegate( self._nav_left_by_days, "click", function()
        {
            self.setMonthByOffset( -1 );
            self.displayDaysWidgetItems();
            self.nodes.date_field.focus();
        });

        self.nodes.parent.delegate( self._nav_right_by_days, "click", function()
        {
            self.setMonthByOffset( 1 );
            self.displayDaysWidgetItems();
            self.nodes.date_field.focus();
        });
    },

    tryToDisplaySelectedDate: function()
    {
        if ( this.selected_date === null )
        {
            return false;
        }

        if ( this.first_date.getTime()    <= this.selected_date.getTime() &&
             this.selected_date.getTime() <= this.last_date.getTime() )
        {
            this.nodes.calendar
                .find( "." + this._day_item_selected )
                .attr( "class", this._day_item );

            this.nodes.day_items
                .eq( this.prev_offset + this.selected_date.getDate() )
                .attr( "class", this._day_item_selected );
        }
    },

    setDayNames: function()
    {
        for ( var i = 0; i < 7; i++ )
        {
            this.nodes.day_names
                .eq( i )
                .text( this.region.day_names_short[ i ] )
                .attr( "title", this.region.day_names[ i ] );
        }
    },

    selectDate: function( date )
    {
        this.selected_date = date;
        this.setMonthInterval( this.selected_date );
        this.displayDaysWidgetItems();
    },

    displayDaysWidgetItems: function()
    {
        this.showDate();
        this.setDatesByMonth();
        this.tryToDisplaySelectedDate();
    },

    setDatesByMonth: function()
    {
        var day, cl;

        for ( var i = 0; i < 42; i++ )
        {
            if ( i <= this.prev_offset )
            {
                day = this.prev_last_day - this.prev_offset + i;
                cl  = "b-datepicker-days__day_blocked";
            }
            else if ( ( i > this.prev_offset && i <= ( this.prev_offset + this.last_day ) ) )
            {
                day = i - this.prev_offset;
                cl  = "b-datepicker-days__day";
            }
            else
            {
                day = i - this.last_day - this.prev_offset;
                cl  = "b-datepicker-days__day_blocked";
            }

            this.nodes.day_items.eq( i ).text( day ).attr( "class", cl );
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
            if ( this.selected_date )
            {
                this.selectDate( this.selected_date );
            }

            this.setCalendarState( "days" );
            this.onMouseMove();
            this.is_mouseleave = false;
            this.nodes.calendar.fadeIn( 200 );
        }
    },

    hide: function()
    {
        this.offMouseMove();
        this.nodes.calendar.fadeOut( 200 );
    },

    showDate: function()
    {
        this.nodes.month_curr.text( this.region.month_names[ this.first_date.getMonth() ] );
        this.nodes.year_curr.text( this.first_date.getFullYear() );
    }
};