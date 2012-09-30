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