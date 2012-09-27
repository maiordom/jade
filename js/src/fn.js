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