window.Jade = { Instances: [] };

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
            day_names_short:   [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
            day_names:         [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            month_names:       [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            month_names_short: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
        }
    },

    getFormatDate: function()
    {
        var date = this.selected_date;

        return date.getFullYear() + "." + ( date.getMonth() + 1 ) + "." + date.getDate();
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
            '<table class="b-datepicker-dates">' +
                '<tr class="b-datepicker-dates__names-row">'   + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
                '<tr class="b-datepicker-dates__items-row">' + tmpl_inner_row + '</tr>' +
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