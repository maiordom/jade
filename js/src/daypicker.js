/**
 * @lends Jade.Datepicker.prototype
 */
Jade.DayPicker =
{
    setVars: function( handler, settings )
    {
        var
            parent   = handler.parent().append( this.tmpl ),
            calendar = parent.find( ".b-datepicker__calendar" ),
            icon     = parent.find( ".b-datepicker__icon" );

        calendar.css( "top", parent.height() + 2 );
        handler.attr( "data-datepicker-init", "true" );

        this.nodes =
        {
            handler:       handler,
            parent:        parent,
            icon:          icon,
            calendar:      calendar,
            month_curr:    calendar.find( ".b-datepicker-nav__month" ),
            year_curr:     calendar.find( ".b-datepicker-nav__year" ),
            days_table:    calendar.find( ".b-datepicker-days" ),
            day_names_obj: calendar.find( ".b-datepicker-days__names-row td" ),
            day_cells_obj: calendar.find( ".b-datepicker-days__numbers-row td" ),
            today:         calendar.find( ".b-datepicker-today" ),
            today_btn:     calendar.find( ".b-datepicker-today__btn" ),
        };

        $.extend( this,
        {
            is_mouseleave: false,
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

    initDaysPicker: function()
    {
        this.setDayNames();
        this.setCalendarState( "days" );

        this.onDaysNav();
        this.onHandlerBlur();
        this.onHandlerFocus();
        this.onDaySelect();
        this.onIconClick();
        this.onTodaySet();

        this.nodes.handler.val( this.getSelectedDate( this.selected_date.getDate() ) );
    },

    onTodaySet: function()
    {
        var self = this;

        self.nodes.today_btn.click( function()
        {
            self.hide();
            self.setCalendarState( "days" );
            self.selectDate( self.today );
            self.nodes.handler.val( self.getSelectedDate( self.selected_date.getDate() ) );
        });
    },

    onDaySelect: function()
    {
        var self = this;

        self.nodes.calendar.delegate( ".b-datepicker-days__day", "click", function( e )
        {
            var day = $( this );
            self.hide();
            self.setSelectedDate( day.text() );
            self.nodes.handler.val( self.getSelectedDate( day.text() ) );
        });
    },

    onIconClick: function()
    {
        var self = this;

        self.nodes.icon.click( function()
        {
            self.nodes.calendar.is( ":visible" ) ? self.hide() : self.nodes.handler.focus();
        });
    },

    onHandlerFocus: function()
    {
        var self = this;

        self.nodes.handler.focus( function()
        {
            self.show();
            self.tryToDisplaySelectedDate();
        });
    },

    onHandlerBlur: function()
    {
        var self = this;

        self.nodes.handler.blur( function()
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
            self.nodes.handler.focus();
        });

        self.nodes.parent.mouseenter( function( e )
        {
            self.is_mouseleave = false;
        });
    },

    onDaysNav: function()
    {
        var self = this;

        self.nodes.parent.delegate( self.nav_left_by_days, "click", function()
        {
            self.setMonthByOffset( -1 );
            self.displayDaysWidgetItems();
            self.nodes.handler.focus();
        });

        self.nodes.parent.delegate( self.nav_right_by_days, "click", function()
        {
            self.setMonthByOffset( 1 );
            self.displayDaysWidgetItems();
            self.nodes.handler.focus();
        });
    },

    setCalendarState: function( state )
    {
        this.nodes.calendar.attr( "class", "b-datepicker__calendar b-datepicker__calendar_" + state );
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
                .find( ".b-datepicker-days__day_selected" )
                .attr( "class", "b-datepicker-days__day" );

            this.nodes.day_cells_obj
                .eq( this.prev_offset + this.selected_date.getDate() )
                .attr( "class", "b-datepicker-days__day_selected" );
        }
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

    setDayNames: function()
    {
        for ( var i = 0; i < 7; i++ )
        {
            this.nodes.day_names_obj.eq( i ).text( this.region.day_names_short[ i ] );
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

    showDate: function()
    {
        this.nodes.month_curr.text( this.region.month_names[ this.first_date.getMonth() ] );
        this.nodes.year_curr.text( this.first_date.getFullYear() );
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

            this.nodes.day_cells_obj.eq( i ).text( day ).attr( "class", cl );
        }
    }
};