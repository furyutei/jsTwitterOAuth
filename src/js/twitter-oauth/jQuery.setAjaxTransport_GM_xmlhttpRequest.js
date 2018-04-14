/*
jQuery.setAjaxTransport_GM_xmlhttpRequest.js
============================================
The MIT License (MIT)

Copyright (c) 2018 furyu <furyutei@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


Required
--------
- In Userscript Header
  - @require <url of jQuery.setAjaxTransport_GM_xmlhttpRequest.js> (Mandatory)
    [@require](https://tampermonkey.net/documentation.php#_require)
  - @grant GM_xmlhttpRequest (Mandatory)
    [@grant](https://tampermonkey.net/documentation.php#_grant)
  - @connect <domains/subdomains which are allowed to be retrieved by GM_xmlhttpRequest> (Optional)
    [@connect](https://tampermonkey.net/documentation.php#_connect)


Usage
-----
```javascript
$.setAjaxTransport_GM_xmlhttpRequest();
````


References
----------
This script is based on  

- [MoonScript/jQuery-ajaxTransport-XDomainRequest: jQuery ajaxTransport extension that uses XDomainRequest for IE8 and IE9.](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest)
  Copyright (c) 2015 Jason Moon (@JSONMOON)
  [The MIT License](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest/blob/master/LICENSE.txt)
  
*/

( function () {

'use strict';

var VERSION = '0.1.1';


function setAjaxTransport_GM_xmlhttpRequest( $, dataType ) {
    if ( ! dataType ) {
        dataType = '+*';
    }
    
    
    var is_support_type = ( function () {
            var reg_support_type = /^(?:GET|POST)/i;
            
            return function ( type ) {
                return reg_support_type.test( type );
            };
        } )(),
        
        is_support_url = ( function () {
            var reg_same_scheme = new RegExp( '^(?:\/\/|' + location.protocol + ')' ),
                reg_support_protocol = /^https?:\/\//;
            
            return function ( url ) {
                return reg_same_scheme.test( url ) && reg_support_protocol.test( url );
            };
        } )(),
        
        // [jQuery.ajaxTransport() | jQuery API Documentation](http://api.jquery.com/jquery.ajaxtransport/)
        handler = function ( options, originalOptions, jqXHR ) {
            // options: the request options
            // originalOptions:the options as provided to the $.ajax() method, unmodified and, thus, without defaults from ajaxSettings
            // jqXHR: the jqXHR object of the request
            
            if ( 
                ( ! options.async ) || // TODO: synchronous mode is not supported
                ( ! is_support_type( options.type ) ) ||
                ( ! is_support_url( options.url ) )
            ) {
                return;
            }
            
            var gm_ret = null,
                gm_overrideMimeType,
                orig_overrideMimeType = jqXHR.overrideMimeType;
            
            jqXHR.overrideMimeType = function ( mimeType ) {
                orig_overrideMimeType.apply( jqXHR, arguments );
                if ( typeof gm_overrideMimeType == 'function' ) {
                    gm_overrideMimeType = mimeType;
                }
            };
            
            return {
                send : function ( headers, completeCallback ) {
                    // headers: an object of (key-value) request headers that the transport can transmit if it supports it
                    // completeCallback: the callback used to notify Ajax of the completion of the request
                    //  function( status, statusText, responses, headers ) {...}
                    //      status: the HTTP status code of the response, like 200 for a typical success, or 404 for when the resource is not found.
                    //      statusText: the statusText of the response.
                    //      responses: (Optional) is An object containing dataType/value that contains the response in all the formats the transport could provide
                    //          (for instance, a native XMLHttpRequest object would set responses to { xml: XMLData, text: textData } for a response that is an XML document)
                    //      headers: (Optional) is a string containing all the response headers if the transport has access to them (akin to what XMLHttpRequest.getAllResponseHeaders() would provide)
                    
                    var gm_details = {
                            // [Tampermonkey • Documentation](https://tampermonkey.net/documentation.php#GM_xmlhttpRequest)
                            // method: one of GET, HEAD, POST
                            // url: the destination URL
                            // headers: ie. user-agent, referer, ... (some special headers are not supported by Safari and Android browsers)
                            // data: some string to send via a POST request
                            // binary: send the data string in binary mode
                            // timeout: a timeout in ms
                            // context: a property which will be added to the response object
                            // responseType:  one of arraybuffer, blob, json
                            // overrideMimeType: a MIME type for the request
                            // anonymous: don't send cookies with the requests (please see the fetch notes)
                            // fetch: (beta) use a fetch instead of a xhr request
                            //      (at Chrome this causes xhr.abort, details.timeout and xhr.onprogress to not work and makes xhr.onreadystatechange receive only readyState 4 events)
                            // username: a username for authentication
                            // password: a password
                            // onabort: callback to be executed if the request was aborted
                            // onerror: callback to be executed if the request ended up with an error
                            // onload: callback to be executed if the request was loaded
                            // onloadstart: callback to be executed if the request started to load
                            // onprogress: callback to be executed if the request made some progress
                            // onreadystatechange: callback to be executed if the request's ready state changed
                            // ontimeout: callback to be executed if the request failed due to a timeout
                        },
                        
                        user_dataType = ( originalOptions.dataType || '' ).toLowerCase();
                    
                    gm_details.method = options.type;
                    gm_details.url = options.url;
                    gm_details.headers = headers;
                    
                    if ( originalOptions.data ) {
                        gm_details.data = ( $.type( originalOptions.data ) == 'string' ) ? originalOptions.data : $.param( originalOptions.data );
                    }
                    else {
                        gm_details.data = '';
                    }
                    
                    // gm_details.binary = // TODO
                    
                    if ( /^\d+$/.test( originalOptions.timeout ) ) {
                        gm_details.timeout = originalOptions.timeout;
                    }
                    
                    if ( originalOptions.context ) {
                        gm_details.context = originalOptions.context;
                    }
                    
                    // gm_details.responseType = // TODO
                    
                    if ( typeof gm_overrideMimeType != 'undefined' ) {
                        gm_details.overrideMimeType = gm_overrideMimeType;
                    }
                    
                    if ( originalOptions.crossDomain ) {
                        gm_details.anonymous = true;
                    }
                    
                    if ( originalOptions.username ) {
                        gm_details.username = originalOptions.username;
                    }
                    
                    if ( originalOptions.password ) {
                        gm_details.password = originalOptions.password;
                    }
                    
                    //gm_details.onabort = function () { // TODO: Even if jqXHR.about() is called, gm_details.onabort() is ignored.
                    //    completeCallback( 0, 'abort' );
                    //};
                    
                    gm_details.onerror = function () {
                        completeCallback( 500, 'error', {
                            text: gm_details.responseText
                        } );
                    };
                    
                    gm_details.onload = function ( gm_response ) {
                        var gm_response_contentType = '',
                            status = {
                                code : gm_response.status,
                                message : ( gm_response.status == 200 ) ? 'success' : ( ( gm_response.statusText ) ? gm_response.statusText : 'error' )
                            },
                            responses = {
                                text: gm_response.responseText,
                                xml : gm_response.responseXML
                            };
                        
                        try {
                            gm_response_contentType = gm_response.responseHeaders.match( /Content-Type\s*:\s*([^\s]+)/i )[ 1 ];
                        }
                        catch ( error ) {
                        }
                        
                        try {
                            if ( ( user_dataType == 'html' ) || /text\/html/i.test( gm_response_contentType ) ) {
                                responses.html = gm_response.responseText;
                            }
                            else if ( ( user_dataType == 'json' ) || ( ( user_dataType != 'text' ) && /\/json/i.test( gm_response_contentType ) ) ) {
                                try {
                                    responses.json = $.parseJSON( gm_response.responseText );
                                }
                                catch ( error ) {
                                    //status.code = 500;
                                    //status.message = 'parseerror';
                                    //throw 'Invalid JSON: ' + gm_response.responseText;
                                }
                            }
                            else if ( ( responses.xml ) && ( ( user_dataType == 'xml' ) || ( ( user_dataType != 'text' ) && /\/xml/i.test( gm_response_contentType ) ) ) ) {
                                try {
                                    responses.xml = new DOMParser().parseFromString( gm_response.responseText, 'text/xml' );
                                }
                                catch ( error ) {
                                    //status.code = 500;
                                    //status.message = 'parseerror';
                                    //throw 'Invalid XML: ' + gm_response.responseText;
                                }
                            }
                        }
                        catch ( error ) {
                            throw error;
                        }
                        finally {
                            completeCallback( status.code, status.message, responses, gm_response.responseHeaders );
                        }
                    };
                    
                    // gm_details.onloadstart = // TODO
                    // gm_details.onprogress = // TODO
                    // gm_details.onreadystatechange = // TODO
                    
                    gm_details.ontimeout = function () {
                        completeCallback( 500, 'timeout' );
                    };
                    
                    gm_ret = GM_xmlhttpRequest( gm_details );
                },
                
                abort : function () {
                    if ( ( gm_ret ) && ( typeof gm_ret.abort == 'function' ) ) {
                        gm_ret.abort();
                    }
                }
            };
        };
    
    $.ajaxTransport( dataType, handler );
    
    return true;

} // end of setAjaxTransport_GM_xmlhttpRequest()


( function ( factory ) {
    if ( ( typeof define == 'function' ) && ( define.amd ) ) {
        // AMD. Register as anonymous module.
        define( [ 'jquery' ], factory );
    }
    else if ( ( typeof exports == 'object' ) && ( typeof module != 'undefined' ) ) {
        // CommonJS
        module.exports = factory( require( 'jquery' ) );
    }
    else {
        // Browser globals.
        var global_object;
        
        if ( typeof window != 'undefined' ) {
            global_object = window;
        }
        else if ( typeof global != 'undefined' ) {
            global_object = global;
        }
        else if ( typeof self != 'undefined' ) {
            global_object = self;
        }
        else {
            global_object = this;
        }
        
        factory( global_object.jQuery );
    }
} )( function ( $ ) {
    if ( ( ! $ ) || ( typeof $.ajaxTransport != 'function' ) || ( typeof GM_xmlhttpRequest != 'function' ) ) {
        return $;
    }
    
    var extend_function = function ( dataType ) {
            setAjaxTransport_GM_xmlhttpRequest( $, dataType );
        };
    
    extend_function.version = VERSION;
    
    $.extend( {
        setAjaxTransport_GM_xmlhttpRequest : extend_function
    } );
    
    return $;
} );

} )();
