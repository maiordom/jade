<?php

$base_dir     = "js/src/";
$file_name    = "js/datepicker.js";
$file_content = "";

$files = Array( "core.js", "datepicker.js", "monthpicker.js", "yearpicker.js", "fn.js" );

for ( $i = 0, $ilen = count( $files ); $i < $ilen; $i++ )
{
    $file_content .= file_get_contents( $base_dir . $files[ $i ]  ) . "\r\n\r\n";
}

$file_content = preg_replace( "/window\\.Jade/", "global.Jade", $file_content );

$file_handle = fopen( $file_name, "w+" );
fwrite( $file_handle, "(function( global, $ )\r\n{\r\n" );
fwrite( $file_handle, $file_content );
fwrite( $file_handle, "})( window, jQuery );" );
fclose( $file_handle );