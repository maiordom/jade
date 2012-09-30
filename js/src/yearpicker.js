/**
 * @lends Jade.DatePickerWidget.prototype
 */
Jade.YearPicker =
{
    initYearPicker: function()
    {
        this.initYearsTmpl();

        this.onYearsWidgetOpen( this );
        this.onYearsItemOpen( this );
        this.onYearsNavByYearsState( this );
    },

    onYearsWidgetOpen: function( self )
    {
        this.nodes.year_curr.click( function()
        {
            self.openYearsWidget();
        });
    },

    onYearsItemOpen: function( self )
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

    onYearsNavByYearsState: function( self )
    {
        this.nodes.parent.delegate( self._nav_left_by_years, "click", function()
        {
            self.navigateByYearsInterval( -1 );
        });

        this.nodes.parent.delegate( self._nav_right_by_years, "click", function()
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