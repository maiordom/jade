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

        self.nodes.months_table.delegate( "." + this._month_item, "click", function()
        {
            var month_number = $( this ).data( "month" );

            self.setCalendarState( "days" );
            self.setMonthByNumber( month_number );
            self.displayDaysWidgetItems();
        });

        self.nodes.months_table.delegate( "." + this._month_item_selected, "click", function()
        {
            self.setCalendarState( "days" );
            self.displayDaysWidgetItems();
        });
    },

    onYearsNavByMonthState: function()
    {
        var self = this;

        self.nodes.parent.delegate( self._nav_left_by_months, "click", function()
        {
            self.setYearByOffset( -1 );
            self.showDate();
            self.nodes.date_field.focus();
        });

        self.nodes.parent.delegate( self._nav_right_by_months, "click", function()
        {
            self.setYearByOffset( 1 );
            self.showDate();
            self.nodes.date_field.focus();
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
            .removeClass( this._month_item )
            .addClass( this._month_item_selected );
    },

    clearActiveMonth: function()
    {
        this.nodes.months_item_active
            .addClass( this._month_item )
            .removeClass( this._month_item_selected );
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