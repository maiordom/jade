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