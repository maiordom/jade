(function( global, $ )
{
global.Jade = { Instances: [] };

/**
 * @class Jade.DatePicker
 */
Jade.DatePicker = function( handler, settings )
{
    this.setVars( handler, settings );
    this.initDaysPicker();
    this.initYearPicker();
    this.initMonthsPicker();
};

/**
 * @lends Jade.Datepicker.prototype
 */
Jade.Core =
{
    nav_left_by_days:    ".b-datepicker__calendar_days .b-datepicker-nav__icon-left",
    nav_right_by_days:   ".b-datepicker__calendar_days .b-datepicker-nav__icon-right",
    nav_left_by_months:  ".b-datepicker__calendar_months .b-datepicker-nav__icon-left",
    nav_right_by_months: ".b-datepicker__calendar_months .b-datepicker-nav__icon-right",
    nav_left_by_years:   ".b-datepicker__calendar_years .b-datepicker-nav__icon-left",
    nav_right_by_years:  ".b-datepicker__calendar_years .b-datepicker-nav__icon-right",

    region_name: "en",

    regions:
    {
        ru:
        {
            day_names_short:   [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ],
            day_names:         [ "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье" ],
            month_names:       [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
            month_names_short: [ "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек" ]
        },

        en:
        {
            day_names_short:   [ "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su" ],
            day_names:         [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
            month_names:       [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            month_names_short: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        }
    },

    getSelectedDate: function( day )
    {
        var date = this.selected_date;

        return date.getFullYear() + "." + ( date.getMonth() + 1 ) + "." + day;
    },

    getSelectedDateYear: function()
    {
        return this.selected_date.getFullYear();
    },

    getFirstDateYear: function()
    {
        return this.first_date.getFullYear();
    },

    getFirstDateMonth: function()
    {
        return this.first_date.getMonth();
    },

    setSelectedDate: function( day )
    {
        this.selected_date = new Date( this.first_date );
        this.selected_date.setDate( day );
        this.selected_date.setHours( 0, 0, 0, 0 );
    },

    setYearByOffset: function( offset )
    {
        var year = this.getFirstDateYear() + offset;

        this.setYearByNumber( year );
    },

    setYearByNumber: function( number )
    {
        this.first_date.setFullYear( number );
        this.setMonthInterval( this.first_date );
    },

    setMonthByOffset: function( offset )
    {
        var month_number = this.getFirstDateMonth() + offset;

        this.setMonthByNumber( month_number );
    },

    setMonthByNumber: function( number )
    {
        this.first_date.setMonth( number );
        this.setMonthInterval( this.first_date );
    },

    setMonthInterval: function( date )
    {
        this.first_date = new Date( date );
        this.first_date.setDate( 1 );
        this.first_date.setHours( 0, 0, 0, 0 );

        this.last_date = new Date( this.first_date );
        this.last_date.setMonth( this.last_date.getMonth() + 1 );
        this.last_date.setDate( 0 );
        this.last_date.setHours( 0, 0, 0, 0 );

        this.last_day = this.last_date.getDate();

        this.prev_last_day = new Date( this.first_date );
        this.prev_last_day.setDate( 0 );
        this.prev_last_day = this.prev_last_day.getDate();

        this.prev_days   = ( this.first_date.getDay() + 6 ) % 7;
        this.prev_offset = ( ( this.prev_days + 7 ) % 7 ) - 1;
    },

    tmpl: (function()
    {
        var tmpl_inner_row = "";

        for ( var i = 0; i < 7; i++ )
        {
            tmpl_inner_row += '<td><div></div></td>';
        }

        return "" +
        '<div class="b-datepicker__calendar">' +
            '<div class="b-datepicker-header">' +
                '<table class="b-datepicker-header__content">' +
                    '<tr class="b-datepicker-nav">' +
                        '<td class="b-datepicker-nav__cell-left">' +
                            '<div class="b-datepicker-nav__icon-left">◄</div>' +
                        '</td>' +
                        '<td colspan="5" align="center">' +
                            '<span class="b-datepicker-nav__month"></span>' +
                            '<span class="b-datepicker-nav__year"></span>' +
                        '</td>' +
                        '<td class="b-datepicker-nav__cell-right">' +
                            '<div class="b-datepicker-nav__icon-right">►</div>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
            '<table class="b-datepicker-days">' +
                '<tr class="b-datepicker-days__names-row">'   + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-days__numbers-row">' + tmpl_inner_row + '</tr>' +
            '</table>' +
            '<table class="b-datepicker-today">' +
                '<tr>' +
                    '<td align="center">' +
                        '<span class="b-datepicker-today__btn">Today</span>' +
                    '</td>' +
                '</tr>' +
            '</div>' +
        '</div>';
    })()
};

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

/**
 * @lends Jade.Datepicker.prototype
 */
Jade.MonthPicker =
{
    initMonthsPicker: function()
    {
        this.initMonthsTmpl();
        this.displayMonthsWidgetItems();

        this.onMonthsWidgetOpen();
        this.onMonthsItemOpen();
        this.onYearsNavByMonthState();
    },

    onMonthsWidgetOpen: function()
    {
        var self = this;

        self.nodes.month_curr.click( function()
        {
            self.clearActiveMonth();
            self.setMonthItemActive( self.getFirstDateMonth() );
            self.setCalendarState( "months" );
        });
    },

    onMonthsItemOpen: function()
    {
        var self = this;

        self.nodes.months_table.delegate( ".b-datepicker-months__month", "click", function()
        {
            var month_number = $( this ).data( "month" );

            self.setCalendarState( "days" );
            self.setMonthByNumber( month_number );
            self.displayDaysWidgetItems();
        });
    },

    onYearsNavByMonthState: function()
    {
        var self = this;

        self.nodes.parent.delegate( self.nav_left_by_months, "click", function()
        {
            self.setYearByOffset( -1 );
            self.displayDaysWidgetItems();
            self.nodes.handler.focus();
        });

        self.nodes.parent.delegate( self.nav_right_by_months, "click", function()
        {
            self.setYearByOffset( 1 );
            self.displayDaysWidgetItems();
            self.nodes.handler.focus();
        });
    },

    displayMonthsWidgetItems: function()
    {
        for ( var i = 0, ilen = this.nodes.months_items.length; i < ilen; i++ )
        {
            this.nodes.months_items.eq( i )
                .text( this.region.month_names_short[ i ] )
                .attr( "data-month", i );
        }
    },

    setMonthItemActive: function( num )
    {
        this.nodes.months_item_active = this.nodes.months_items
            .eq( num )
            .removeClass( "b-datepicker-months__month" )
            .addClass( "b-datepicker-months__month_selected" );
    },

    clearActiveMonth: function()
    {
        this.nodes.months_item_active
            .addClass( "b-datepicker-months__month" )
            .removeClass( "b-datepicker-months__month_selected" );
    },

    initMonthsTmpl: function()
    {
        $( this.nodes.today ).before( this.months_tmpl );

        this.nodes.months_item_active = $();
        this.nodes.months_table = this.nodes.calendar.find( ".b-datepicker-months" );
        this.nodes.months_items = this.nodes.calendar.find( ".b-datepicker-months__month" );
    },

    months_tmpl: (function()
    {
        var
            month = '<td class="b-datepicker-months__month"></td>',
            row   = '<tr class="b-datepicker-months__row">' + month + month + month + '</tr>';

        return '<table class="b-datepicker-months">' + row + row + row + row + '</table>';
    })()
};

/**
 * @lends Jade.Datepicker.prototype
 */
Jade.YearPicker =
{
    initYearPicker: function()
    {
        this.initYearsTmpl();

        this.onYearsWidgetOpen();
        this.onYearsItemOpen();
        this.onYearsNavByYearsState();
    },

    onYearsWidgetOpen: function()
    {
        var self = this;

        self.nodes.year_curr.click( function()
        {
            self.setCalendarState( "years" );
            self.displayYearsWidgetItems( self.getFirstDateYear() );
        });
    },

    onYearsItemOpen: function()
    {
        var self = this;

        self.nodes.years_table.delegate( ".b-datepicker-years__year", "click", function()
        {
            var year = $( this ).attr( "data-year" );

            self.setYearByNumber( year );
            self.setCalendarState( "days" );
            self.displayDaysWidgetItems();
        });
    },

    onYearsNavByYearsState: function()
    {
        var self = this;

        self.nodes.parent.delegate( self.nav_left_by_years, "click", function()
        {
            self.setYearByOffset( -1 );
            self.displayYearsWidgetItems( self.getSelectedDateYear() );
            self.nodes.handler.focus();
        });

        self.nodes.parent.delegate( self.nav_right_by_years, "click", function()
        {
            self.setYearByOffset( 1 );
            self.displayYearsWidgetItems( self.getSelectedDateYear() );
            self.nodes.handler.focus();
        });
    },

    displayYearsWidgetItems: function( year )
    {
        this.setYearsItems();
        this.clearActiveYear();
        this.setYearItemActive( year );
        this.showYearsInterval();
    },

    showYearsInterval: function()
    {
        this.nodes.year_curr.text( ( this.getFirstDateYear() - 9 ) + "-" + ( this.getFirstDateYear() +  10 ) );
    },

    setYearsItems: function()
    {
        var year = this.getFirstDateYear() - 9;

        for ( var i = 0, ilen = this.nodes.years_items.length; i < ilen; i++ )
        {
            this.nodes.years_items.eq( i ).text( year ).attr( "data-year", year );

            year++;
        }
    },

    initYearsTmpl: function()
    {
        $( this.nodes.today ).before( this.years_tmpl );

        this.nodes.years_item_active = $();
        this.nodes.years_table = this.nodes.calendar.find( ".b-datepicker-years" );
        this.nodes.years_items = this.nodes.calendar.find( ".b-datepicker-years__year" );
    },

    setYearItemActive: function( number )
    {
        this.nodes.years_item_active = this.nodes.years_items
            .filter( "[data-year='" + number + "']" )
            .removeClass( "b-datepicker-years__year" )
            .addClass( "b-datepicker-years__year_selected" );
    },

    clearActiveYear: function()
    {
        this.nodes.years_item_active
            .addClass( "b-datepicker-years__year" )
            .removeClass( "b-datepicker-years__year_selected" );
    },

    years_tmpl: (function()
    {
        var
            year = '<td class="b-datepicker-years__year"></td>',
            row  = '<tr class="b-datepicker-years__row">' + year + year + year + year + year + '</tr>';

        return '<table class="b-datepicker-years">' + row + row + row + row + '</table>';
    })()
};

$.extend( Jade.DatePicker.prototype, Jade.MonthPicker );
$.extend( Jade.DatePicker.prototype, Jade.YearPicker );
$.extend( Jade.DatePicker.prototype, Jade.Core );
$.extend( Jade.DatePicker.prototype, Jade.DayPicker );

$.fn.datepicker = function( settings )
{
    var item, instance;

    $.each( this, function()
    {
        item = $( this );

        if ( item.data( "datepicker-init" ) )
        {
            console.log( "datepicker already init: ", this );
            return false;
        }

        instance = new Jade.DatePicker( $( this ), settings );

        Jade.Instances.push( instance );
    });
};

})( window, jQuery );