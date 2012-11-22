$.extend( Jade.DatePickerWidget.prototype, Jade.Core );
$.extend( Jade.DatePickerWidget.prototype, Jade.DatePicker );
$.extend( Jade.DatePickerWidget.prototype, Jade.MonthPicker );
$.extend( Jade.DatePickerWidget.prototype, Jade.YearPicker );

$.fn.jade = function( settings ) {
    var item, instance;

    $.each( this, function() {
        item = $( this );

        if ( item.data( "jade" ) ) {
            console.log( "jade already init: ", this );
            return false;
        }

        instance = new Jade.DatePickerWidget( item, settings );
        item.data( "jade", instance );

        Jade.Instances.push( instance );
    });
};