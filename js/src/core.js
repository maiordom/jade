window.Jade = {
    Instances: []
};

Jade.DatePickerWidget = function( date_field, settings ) {
    this.setVars( settings );
    this.cacheNodes( date_field, this.renderWrapper( date_field ) );

    this.init_daypicker   ? this.initDaysPicker()   : null;
    this.init_monthpicker ? this.initMonthsPicker() : null;
    this.init_yearpicker  ? this.initYearPicker()   : null;
};

Jade.Core = {
    _nav_left:             ".jade-nav__icon-left",
    _nav_right:            ".jade-nav__icon-right",
    _nav_left_by_dates:    ".jade__calendar_dates .jade-nav__icon-left",
    _nav_right_by_dates:   ".jade__calendar_dates .jade-nav__icon-right",
    _nav_left_by_months:   ".jade__calendar_months .jade-nav__icon-left",
    _nav_right_by_months:  ".jade__calendar_months .jade-nav__icon-right",
    _nav_left_by_years:    ".jade__calendar_years .jade-nav__icon-left",
    _nav_right_by_years:   ".jade__calendar_years .jade-nav__icon-right",

    _nav_item_active:      "jade-nav__item_active",
    _calendar:             "jade__calendar",
    _dates_item_blocked:   "jade-dates__item_blocked",
    _dates_item:           "jade-dates__item",
    _dates_item_selected:  "jade-dates__item_selected",
    _months_item:          "jade-months__item",
    _months_item_selected: "jade-months__item_selected",
    _years_item:           "jade-years__item",
    _years_item_selected:  "jade-years__item_selected",

    keypress_event_name: $.browser.opera ? "keypress" : "keyup",

    default_region_name: "en",

    regions: {
        ru: {
            day_names_short:   [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ],
            day_names:         [ "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье" ],
            month_names:       [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
            month_names_short: [ "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек" ]
        },

        en: {
            day_names_short:   [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
            day_names:         [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            month_names:       [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            month_names_short: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        }
    },

    date_format_patterns: {
        en: "yy/mm/dd",
        ru: "dd/mm/yy"
    },

    parseDate: function ( format, value ) {
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

        lookAhead = function( match ) {
            var matches = ( i + 1 < format.length && format.charAt( i + 1 ) === match );
            if ( matches ) { i++; }
            return matches;
        };

        getNumber = function( match ) {
            var is_doubled = lookAhead( match ),
                size       = match === "y" && is_doubled ? 4 : 2,
                digits     = new RegExp( "^\\d{1," + size + "}" ),
                num        = value.substring( i_value ).match( digits );

            if ( !num ) {
                throw "Missing number at position " + i_value;
            }

            i_value += num[ 0 ].length;

            return parseInt( num[ 0 ], 10 );
        };

        checkLiteral = function() {
            if ( value.charAt( i_value ) !== format.charAt( i ) ) {
                throw "Unexpected literal at position " + i_value;
            }

            i_value++;
        };

        var i_value = 0;

        for ( var i = 0; i < format.length; i++ ) {
            switch ( format.charAt( i ) ) {
                case "d": day   = getNumber( "d" ); break;
                case "m": month = getNumber( "m" ); break;
                case "y": year  = getNumber( "y" ); break;
                default: checkLiteral();
            }
        }

        if ( i_value < value.length ) {
            var extra = value.substr( i_value );

            if ( !/^\s+/.test( extra ) ) {
                throw "Extra/unparsed characters found in date: " + extra;
            }
        }

        if ( year === -1 ) {
            year = new Date().getFullYear();
        }

        var date = new Date( year, month - 1, day );

        if ( date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day ) {
            throw "Invalid date";
        }

        return date;
    },

    formatDate: function ( format, date )
    {
        var region            = this.region,
            day_names_short   = region.day_names_short,
            day_names         = region.day_names,
            month_names_short = region.month_names_short,
            month_names       = region.month_names,
            output = "", lookAhead, formatNumber, getYear;

        lookAhead = function( match ) {
            var matches = ( index + 1 < format.length && format.charAt( index + 1 ) === match );

            if ( matches ) {
                index++;
            }

            return matches;
        };

        formatNumber = function( match, value, len )
        {
            var num = "" + value;

            if ( lookAhead( match ) ) {
                while ( num.length < len ) {
                    num = "0" + num;
                }
            }

            return num;
        };

        getYear = function()
        {
            return lookAhead( "y" ) ?
                date.getFullYear() :
                ( date.getYear() % 100 < 10 ? "0" : "" ) + date.getYear() % 100;
        }

        for ( var index = 0; index < format.length; index++ ) {
            switch ( format.charAt( index ) ) {
                case "d": output += formatNumber( "d", date.getDate(), 2 ); break;
                case "m": output += formatNumber( "m", date.getMonth() + 1, 2 ); break;
                case "y": output += getYear(); break;
                default:  output += format.charAt( index );
            }
        }

        return output;
    },

    getFormatDate: function() {
        return this.formatDate( this.date_format, this.selected_date );
    },

    getFirstDateYear: function() {
        return this.first_date.getFullYear();
    },

    getFirstDateMonth: function() {
        return this.first_date.getMonth();
    },

    setSelectedDate: function( date ) {
        this.selected_date = new Date( this.first_date );
        this.selected_date.setDate( date );
        this.selected_date.setHours( 0, 0, 0, 0 );
    },

    setYearByOffset: function( offset ) {
        var year = this.getFirstDateYear() + offset;

        this.setYearByNumber( year );
    },

    setYearByNumber: function( number ) {
        this.first_date.setFullYear( number );
        this.setMonthInterval( this.first_date );
    },

    setMonthByOffset: function( offset ) {
        var month_number = this.getFirstDateMonth() + offset;

        this.setMonthByNumber( month_number );
    },

    isDisplaySelectedDate: function() {
        return this.first_date.getTime()    <= this.selected_date.getTime() &&
               this.selected_date.getTime() <= this.last_date.getTime();
    },

    setMonthByNumber: function( number ) {
        this.first_date.setMonth( number );
        this.setMonthInterval( this.first_date );
    },

    setMonthInterval: function( date ) {
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

    tmpl: (function()  {
        var dates_row = "", names_row = "";

        for ( var i = 0; i < 7; i++ ) {
            names_row += '<th><div></div></th>';
            dates_row += '<td><div></div></td>';
        }

        return "" +
        '<div class="jade__calendar">' +
            '<div class="jade-header">' +
                '<table class="jade-header__content">' +
                    '<tr class="jade-nav">' +
                        '<td class="jade-nav__cell-left">' +
                            '<div class="jade-nav__icon-left">◄</div>' +
                        '</td>' +
                        '<td class="jade-nav__title" colspan="5" align="center">' +
                            '<span class="jade-nav__month"></span>' +
                            '<span class="jade-nav__year"></span>' +
                        '</td>' +
                        '<td class="jade-nav__cell-right">' +
                            '<div class="jade-nav__icon-right">►</div>' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
            '</div>' +
            '<table class="jade-dates">' +
                '<tbody>' +
                    '<tr class="jade-dates__names-row">' + names_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                    '<tr class="jade-dates__items-row">' + dates_row + '</tr>' +
                '</tbody>' +
            '</table>' +
            '<table class="jade-today">' +
                '<tr>' +
                    '<td align="center">' +
                        '<span class="jade-today__btn">Today</span>' +
                    '</td>' +
                '</tr>' +
            '</div>' +
        '</div>';
    })()
};