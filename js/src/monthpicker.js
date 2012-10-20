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

        this.nodes.month_curr.addClass( this._nav_item_active );
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