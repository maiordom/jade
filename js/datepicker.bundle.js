(function( global, $ )
{
global.Jade = { Instances: [] };

/**
 * @class Jade.DatePickerWidget
 */
Jade.DatePickerWidget = function( date_field, settings )
{
    this.setVars( settings );
    this.cacheNodes( date_field );
    this.initDaysPicker();
    this.initYearPicker();
    this.initMonthsPicker();
};

/**
 * @lends Jade.DatePickerWidget.prototype
 */
Jade.Core =
{
    _nav_left_by_dates:    ".b-datepicker__calendar_dates .b-datepicker-nav__icon-left",
    _nav_right_by_dates:   ".b-datepicker__calendar_dates .b-datepicker-nav__icon-right",
    _nav_left_by_months:   ".b-datepicker__calendar_months .b-datepicker-nav__icon-left",
    _nav_right_by_months:  ".b-datepicker__calendar_months .b-datepicker-nav__icon-right",
    _nav_left_by_years:    ".b-datepicker__calendar_years .b-datepicker-nav__icon-left",
    _nav_right_by_years:   ".b-datepicker__calendar_years .b-datepicker-nav__icon-right",

    _dates_item:           "b-datepicker-dates__item",
    _dates_item_selected:  "b-datepicker-dates__item_selected",
    _months_item:          "b-datepicker-months__item",
    _months_item_selected: "b-datepicker-months__item_selected",
    _years_item:           "b-datepicker-years__item",
    _years_item_selected:  "b-datepicker-years__item_selected",

    keypress_event_name: $.browser.opera ? "keypress" : "keyup",

    default_region_name: "en",

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
            day_names_short:   [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
            day_names:         [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            month_names:       [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            month_names_short: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        }
    },

    date_format_patterns:
    {
        en: "yy/mm/dd",
        ru: "dd/mm/yy"
    },

    parseDate: function ( format, value )
    {
        if ( !value ) { return null; }

        var region            = this.region,
            day_names_short   = region.day_names_short,
            day_names         = region.day_names,
            month_names_short = region.month_names_short,
            month_names       = region.month_names,
            year    = -1,
            month   = -1,
            day     = -1,
            literal = false, lookAhead, getNumber, checkLiteral;

        lookAhead = function( match )
        {
            var matches = ( i + 1 < format.length && format.charAt( i + 1 ) === match );

            if ( matches ) { i++; }

            return matches;
        };

        getNumber = function( match )
        {
            var is_doubled = lookAhead( match ),
                size       = match === "y" && is_doubled ? 4 : 2,
                digits     = new RegExp( "^\\d{1," + size + "}" ),
                num        = value.substring( i_value ).match( digits );

            if ( !num )
            {
                throw "Missing number at position " + i_value;
            }

            i_value += num[ 0 ].length;

            return parseInt( num[ 0 ], 10 );
        };

        checkLiteral = function()
        {
            if ( value.charAt( i_value ) !== format.charAt( i ) )
            {
                throw "Unexpected literal at position " + i_value;
            }

            i_value++;
        };

        var i_value = 0;

        for ( var i = 0; i < format.length; i++ )
        {
            switch ( format.charAt( i ) )
            {
                case "d": day   = getNumber( "d" ); break;
                case "m": month = getNumber( "m" ); break;
                case "y": year  = getNumber( "y" ); break;
                default: checkLiteral();
            }
        }

        if ( i_value < value.length )
        {
            var extra = value.substr( i_value );

            if ( !/^\s+/.test( extra ) )
            {
                throw "Extra/unparsed characters found in date: " + extra;
            }
        }

        if ( year === -1 )
        {
            year = new Date().getFullYear();
        }

        var date = new Date( year, month - 1, day );

        if ( date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day )
        {
            throw "Invalid date";
        }

        return date;
    },

    formatDate: function ( format, date )
    {
        var
            region            = this.region,
            day_names_short   = region.day_names_short,
            day_names         = region.day_names,
            month_names_short = region.month_names_short,
            month_names       = region.month_names,
            output = "", lookAhead, formatNumber, getYear;

        lookAhead = function( match )
        {
            var matches = ( index + 1 < format.length && format.charAt( index + 1 ) === match );

            if ( matches ) { index++; }

            return matches;
        };

        formatNumber = function( match, value, len )
        {
            var num = "" + value;

            if ( lookAhead( match ) )
            {
                while ( num.length < len ) { num = "0" + num; }
            }

            return num;
        };

        getYear = function()
        {
            return lookAhead( "y" ) ? date.getFullYear() : ( date.getYear() % 100 < 10 ? "0" : "" ) + date.getYear() % 100;
        }

        for ( var index = 0; index < format.length; index++ )
        {
            switch ( format.charAt( index ) )
            {
                case "d": output += formatNumber( "d", date.getDate(), 2 ); break;
                case "m": output += formatNumber( "m", date.getMonth() + 1, 2 ); break;
                case "y": output += getYear(); break;
                default:  output += format.charAt( index );
            }
        }

        return output;
    },

    getFormatDate: function()
    {
        var date = this.selected_date;

        return this.formatDate( this.date_format, this.selected_date );
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

    setSelectedDate: function( date )
    {
        this.selected_date = new Date( this.first_date );
        this.selected_date.setDate( date );
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

    isDisplaySelectedDate: function()
    {
        return this.first_date.getTime()    <= this.selected_date.getTime() &&
               this.selected_date.getTime() <= this.last_date.getTime();
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

        this.prev_last_date = new Date( this.first_date );
        this.prev_last_date.setDate( 0 );
        this.prev_last_date = this.prev_last_date.getDate();

        this.prev_dates  = ( this.first_date.getDay() + 6 ) % 7;
        this.prev_offset = ( ( this.prev_dates + 7 ) % 7 ) - 1;

        this.region_name === "ru" ? null : this.prev_offset++;
    },

    tmpl: (function()
    {
        var dates_row = "", names_row = "";

        for ( var i = 0; i < 7; i++ )
        {
            names_row += '<th><div></div></th>';
            dates_row += '<td><div></div></td>';
        }

        return "" +
        '<div class="b-datepicker__calendar">' +
            '<div class="b-datepicker-header">' +
                '<table class="b-datepicker-header__content">' +
                    '<tr class="b-datepicker-nav">' +
                        '<td class="b-datepicker-nav__cell-left">' +
                            '<div class="b-datepicker-nav__icon-left">◄</div>' +
                        '</td>' +
                        '<td class="b-datepicker-nav__title" colspan="5" align="center">' +
                            '<span class="b-datepicker-nav__month"></span>' +
                            '<span class="b-datepicker-nav__year"></span>' +
                        '</td>' +
                        '<td class="b-datepicker-nav__cell-right">' +
                            '<div class="b-datepicker-nav__icon-right">►</div>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
            '<table class="b-datepicker-dates">' +
                '<tbody>' +
                    '<tr class="b-datepicker-dates__names-row">' + names_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="b-datepicker-dates__items-row">' + dates_row + '</tr>' +
                '</tbody>' +
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
            prev_offset:    null,
            date_value:     null
        });

        $.extend( this, settings );

        this.region_name ? null : this.region_name = this.default_region_name;
        this.region = this.regions[ this.region_name ];
        this.date_format = this.date_format_patterns[ this.region_name ];
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
            dates_names: calendar.find( ".b-datepicker-dates__names-row th" ),
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

        this.bindDayPickerEvents();

        this.date_value = this.getFormatDate();
        this.nodes.date_field.val( this.date_value );
    },

    bindDayPickerEvents: function()
    {
        var self = this;

        this.nodes.today_btn.click( function()
        {
            self.hide();
            self.selectDate( self.today, self.today.getDate() );
        });

        this.nodes.icon.click( function()
        {
            self.nodes.calendar.is( ":visible" ) ? self.hide() : self.nodes.date_field.focus();
        });

        this.nodes.date_field[ this.keypress_event_name ]( function( e )
        {
            switch( e.keyCode )
            {
                case 27: { self.hide(); } break;
                default: { self.setDateByString(); }
            }
        });

        this.nodes.date_field.focus( function()
        {
            self.show();
        });

        this.nodes.date_field.blur( function()
        {
            self.is_mouseleave ? self.hide() : null;
        });

        this.nodes.calendar.delegate( "." + this._dates_item, "click", function()
        {
            self.hide();
            self.selectDate( self.first_date, $( this ).text() );
        });

        this.nodes.calendar.delegate( "." + this._dates_item_selected, "click", function()
        {
            self.hide();
        });

        this.nodes.parent.delegate( this._nav_left_by_dates, "click", function()
        {
            self.navigateByMonth( -1 );
        });

        this.nodes.parent.delegate( this._nav_right_by_dates, "click", function()
        {
            self.navigateByMonth( 1 );
        });
    },

    bindMouseMoveEvents: function( self )
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

    offMouseMoveEvents: function()
    {
        this.nodes.parent.off( "mouseleave mouseenter" );
    },

    setDateByString: function()
    {
        var date_value = this.nodes.date_field.val(), date;

        if ( this.nodes.date_field.val() !== this.date_value )
        {
            try
            {
                date = this.parseDate( this.date_format, date_value );
            }
            catch( e )
            {
                console.log( e );
            }

            if ( date )
            {
                this.setMonthInterval( date );
                this.setSelectedDate( date.getDate() );
                this.updateDates();
            }
        }
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
        this.date_value = this.getFormatDate();
        this.nodes.date_field.val( this.date_value );
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
            this.bindMouseMoveEvents( this );
            this.is_mouseleave = false;
            this.nodes.calendar.fadeIn( 200 );
        }
    },

    hide: function()
    {
        this.offMouseMoveEvents();
        this.nodes.calendar.fadeOut( 200 );
    },

    updateDateTitle: function()
    {
        this.nodes.month_curr.text( this.region.month_names[ this.first_date.getMonth() ] );
        this.nodes.year_curr.text( this.first_date.getFullYear() );
    }
};

/**
 * @lends Jade.DatePickerWidget.prototype
 */
Jade.MonthPicker =
{
    initMonthsPicker: function()
    {
        this.initMonthsTmpl();
        this.setMonths();
        this.bindMonthPickerEvents();
    },

    bindMonthPickerEvents: function()
    {
        this.bindMonthsWidgetOpen( this );
        this.bindMonthsItemOpen( this );
        this.bindYearsNavByMonthState( this );
    },

    bindMonthsWidgetOpen: function( self )
    {
        this.nodes.month_curr.click( function()
        {
            self.openMonthWidget();
        });
    },

    bindMonthsItemOpen: function( self )
    {
        this.nodes.months_table.delegate( "." + this._months_item, "click", function()
        {
            self.selectMonth( $( this ).data( "month" ) );
        });

        this.nodes.months_table.delegate( "." + this._months_item_selected, "click", function()
        {
            self.selectMonth( $( this ).data( "month" ) );
        });
    },

    bindYearsNavByMonthState: function( self )
    {
        this.nodes.parent.delegate( this._nav_left_by_months, "click", function()
        {
            self.navigateByYears( -1 );
        });

        this.nodes.parent.delegate( this._nav_right_by_months, "click", function()
        {
            self.navigateByYears( 1 );
        });
    },

    openMonthWidget: function()
    {
        this.clearActiveMonth();
        this.setMonthItemActive( this.getFirstDateMonth() );
        this.setCalendarState( "months" );
        this.nodes.date_field.focus();
    },

    selectMonth: function( month )
    {
        this.setCalendarState( "dates" );
        this.setMonthByNumber( month );
        this.updateDates();
        this.nodes.date_field.focus();
    },

    navigateByYears: function( offset )
    {
        this.setYearByOffset( offset );
        this.updateDates();
        this.nodes.date_field.focus();
    },

    setMonths: function()
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
        this.nodes.months_item_active = this.nodes.months_items.eq( num )
            .removeClass( this._months_item )
            .addClass( this._months_item_selected );
    },

    clearActiveMonth: function()
    {
        this.nodes.months_item_active
            .addClass( this._months_item )
            .removeClass( this._months_item_selected );
    },

    initMonthsTmpl: function()
    {
        $( this.nodes.today ).before( this.months_tmpl );

        this.nodes.months_item_active = $();
        this.nodes.months_table = this.nodes.calendar.find( ".b-datepicker-months" );
        this.nodes.months_items = this.nodes.calendar.find( ".b-datepicker-months__item" );
    },

    months_tmpl: (function()
    {
        var
            month = '<td class="b-datepicker-months__item"></td>',
            row   = '<tr class="b-datepicker-months__row">' + month + month + month + '</tr>';

        return '<table class="b-datepicker-months">' + row + row + row + row + '</table>';
    })()
};

/**
 * @lends Jade.DatePickerWidget.prototype
 */
Jade.YearPicker =
{
    initYearPicker: function()
    {
        this.initYearsTmpl();
        this.bindYearPickerEvents();
    },

    bindYearPickerEvents: function()
    {
        this.bindYearsWidgetOpen( this );
        this.bindYearsItemOpen( this );
        this.bindYearsNavByYearsState( this );
    },

    bindYearsWidgetOpen: function( self )
    {
        this.nodes.year_curr.click( function()
        {
            self.openYearsWidget();
        });
    },

    bindYearsItemOpen: function( self )
    {
        this.nodes.years_table.delegate( "." + this._years_item, "click", function()
        {
            self.selectYear( $( this ).attr( "data-year" ) );
        });

        this.nodes.years_table.delegate( "." + this._years_item_selected, "click", function()
        {
            self.selectYear( $( this ).attr( "data-year" ) );
        });
    },

    bindYearsNavByYearsState: function( self )
    {
        this.nodes.parent.delegate( this._nav_left_by_years, "click", function()
        {
            self.navigateByYearsInterval( -1 );
        });

        this.nodes.parent.delegate( this._nav_right_by_years, "click", function()
        {
            self.navigateByYearsInterval( 1 );
        });
    },

    openYearsWidget: function()
    {
        if ( this.state === "years" )
        {
            this.setCalendarState( "dates" );
            this.updateDateTitle();
        }
        else
        {
            this.years_interval.offset = 0;
            this.setYearsInterval( 0 );
            this.setCalendarState( "years" );
            this.updateYears();
        }

        this.nodes.date_field.focus();
    },

    selectYear: function( year )
    {
        this.setYearByNumber( year );
        this.setCalendarState( "dates" );
        this.updateDates();
        this.nodes.date_field.focus();
    },

    navigateByYearsInterval: function( offset )
    {
        this.setYearsInterval( offset );
        this.updateYears();
        this.nodes.date_field.focus();
    },

    setYearsInterval: function( offset )
    {
        this.years_interval.offset += offset;
        this.years_interval.left    = this.getFirstDateYear() - 9  + 20 * this.years_interval.offset,
        this.years_interval.right   = this.getFirstDateYear() + 10 + 20 * this.years_interval.offset;
    },

    updateYears: function()
    {
        this.updateYearsIntervalTitle();
        this.clearActiveYear();
        this.setYearsItems();
        this.setYearItemActive( this.getFirstDateYear() );
    },

    updateYearsIntervalTitle: function()
    {
        this.nodes.year_curr.text( this.years_interval.left + "-" + this.years_interval.right );
    },

    setYearsItems: function( offset )
    {
        var year = this.years_interval.left;

        for ( var i = 0, ilen = this.nodes.years_items.length; i < ilen; i++ )
        {
            this.nodes.years_items.eq( i ).text( year ).attr( "data-year", year );

            year++;
        }
    },

    setYearItemActive: function( number )
    {
        this.nodes.years_item_active = this.nodes.years_items
            .filter( "[data-year='" + number + "']" )
            .removeClass( this._years_item )
            .addClass( this._years_item_selected );
    },

    clearActiveYear: function()
    {
        this.nodes.years_item_active
            .removeClass( this._years_item_selected )
            .addClass( this._years_item );
    },

    initYearsTmpl: function()
    {
        $( this.nodes.today ).before( this.years_tmpl );

        this.years_interval = { left: null, right: null, offset: 0 };
        this.nodes.years_item_active = $();
        this.nodes.years_table = this.nodes.calendar.find( ".b-datepicker-years" );
        this.nodes.years_items = this.nodes.calendar.find( ".b-datepicker-years__item" );
    },

    years_tmpl: (function()
    {
        var
            year = '<td class="b-datepicker-years__item"></td>',
            row  = '<tr class="b-datepicker-years__row">' + year + year + year + year + year + '</tr>';

        return '<table class="b-datepicker-years">' + row + row + row + row + '</table>';
    })()
};

$.extend( Jade.DatePickerWidget.prototype, Jade.Core );
$.extend( Jade.DatePickerWidget.prototype, Jade.DatePicker );
$.extend( Jade.DatePickerWidget.prototype, Jade.MonthPicker );
$.extend( Jade.DatePickerWidget.prototype, Jade.YearPicker );

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

        instance = new Jade.DatePickerWidget( $( this ), settings );

        Jade.Instances.push( instance );
    });
};

})( window, jQuery );