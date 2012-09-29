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
            if ( self.state === "years" )
            {
                self.setCalendarState( "days" );
                self.showDate();
            }
            else
            {
                self.years_interval.offset = 0;
                self.setYearsInterval( 0 );
                self.setCalendarState( "years" );
                self.displayYearsWidgetItems();
            }
        });
    },

    onYearsItemOpen: function()
    {
        var self = this;

        self.nodes.years_table.delegate( "." + this._year_item, "click", function()
        {
            var year = $( this ).attr( "data-year" );

            self.setYearByNumber( year );
            self.setCalendarState( "days" );
            self.displayDaysWidgetItems();
        });

        self.nodes.years_table.delegate( "." + this._year_item_selected, "click", function()
        {
            self.setCalendarState( "days" );
            self.showDate();
        });
    },

    onYearsNavByYearsState: function()
    {
        var self = this;

        self.nodes.parent.delegate( self._nav_left_by_years, "click", function()
        {
            self.setYearsInterval( -1 );
            self.displayYearsWidgetItems();
            self.nodes.date_field.focus();
        });

        self.nodes.parent.delegate( self._nav_right_by_years, "click", function()
        {
            self.setYearsInterval( 1 );
            self.displayYearsWidgetItems();
            self.nodes.date_field.focus();
        });
    },

    setYearsInterval: function( offset )
    {
        this.years_interval.offset += offset;
        this.years_interval.left    = this.getFirstDateYear() - 9  + 20 * this.years_interval.offset,
        this.years_interval.right   = this.getFirstDateYear() + 10 + 20 * this.years_interval.offset;
    },

    displayYearsWidgetItems: function()
    {
        this.showYearsInterval();
        this.clearActiveYear();
        this.setYearsItems();
        this.setYearItemActive( this.getFirstDateYear() );
    },

    showYearsInterval: function()
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

    initYearsTmpl: function()
    {
        $( this.nodes.today ).before( this.years_tmpl );

        this.years_interval = { left: null, right: null, offset: 0 };
        this.nodes.years_item_active = $();
        this.nodes.years_table = this.nodes.calendar.find( ".b-datepicker-years" );
        this.nodes.years_items = this.nodes.calendar.find( ".b-datepicker-years__year" );
    },

    setYearItemActive: function( number )
    {
        this.nodes.years_item_active = this.nodes.years_items
            .filter( "[data-year='" + number + "']" )
            .removeClass( this._year_item )
            .addClass( this._year_item_selected );
    },

    clearActiveYear: function()
    {
        this.nodes.years_item_active
            .removeClass( this._year_item_selected )
            .addClass( this._year_item );
    },

    years_tmpl: (function()
    {
        var
            year = '<td class="b-datepicker-years__year"></td>',
            row  = '<tr class="b-datepicker-years__row">' + year + year + year + year + year + '</tr>';

        return '<table class="b-datepicker-years">' + row + row + row + row + '</table>';
    })()
};