// ==UserScript==
// @name            example-twitter-oauth
// @description     Example UserScript for jsTwitterOAuth
// @version         0.1.3
// @namespace       https://furyutei.github.io/jsTwitterOAuth
// @author          furyu
// @include         https://furyutei.github.io/jsTwitterOAuth/example/*
// @include         https://api.twitter.com/oauth/*
// @include         https://twitter.com/account/*
// @include         https://furyutei.github.io/jsTwitterOAuth/callback/*
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @connect         api.twitter.com
// @require         https://furyutei.github.io/jsTwitterOAuth/src/js/jquery.min.js
// @require         https://furyutei.github.io/jsTwitterOAuth/src/js/twitter-oauth/sha1.js
// @require         https://furyutei.github.io/jsTwitterOAuth/src/js/twitter-oauth/oauth.js
// @require         https://furyutei.github.io/jsTwitterOAuth/src/js/twitter-oauth/jQuery.setAjaxTransport_GM_xmlhttpRequest.js
// @require         https://furyutei.github.io/jsTwitterOAuth/src/js/twitter-oauth/twitter-api.js
// ==/UserScript==


( function () {

'use strict';

if ( ( typeof browser == 'undefined' ) && ( typeof window != 'undefined' ) ) {
    window.browser = ( typeof chrome != 'undefined' ) ? chrome : null;
}

var TARGET_PAGE = 'https://furyutei.github.io/jsTwitterOAuth/example/',
    AUTOSTART_AUTH_PROCESS_ON_PAGE_LOADED = false,
    IS_BROWSER_EXTENSION = ( browser && browser.runtime && ( typeof browser.runtime.getURL == 'function' ) ),
    IS_FIREFOX = ( 0 <= navigator.userAgent.toLowerCase().indexOf( 'firefox' ) );

// Use parameters described on your [Twitter Application Management](https://apps.twitter.com/) {
var CONSUMER_KEY = 'vcPW8q5vBXDoQG5Cgh39MUwvd',
    CONSUMER_SECRET = 'wCenoH2UYjwUjrCWHpA4bAKMuqPhJTgC6SSLWhWeL4nLcNlidj',
    CALLBACK_URL = ( IS_BROWSER_EXTENSION && ( ! IS_FIREFOX ) ) ? browser.runtime.getURL( 'html/callback.html' ) : 'https://furyutei.github.io/jsTwitterOAuth/callback/';
    // TODO: In Firefox, if you specify the URL obtained with browser.runtime.getURL() as a callback, it will not work. (Firefox 59.0.2)
    //  When redirected to the URL (for example, "moz-extension://.../html/callback.html?oauth_token=...&oauth_verifier=..."), the popup window will forget informations of the open side.
    //  - 'window.name' is changed to empty
    //  - 'window.opener' is changed to null
    //  - 'window.closed' becomes true only for a moment
    //  Therefore, the opened side can not communicate with the popup window.
//}


if ( is_target_page() ) {
    // In the web page using Twitter API
    target_page_main();
}
else {
    // In the popup window
    popup_main();
}

return;


function is_target_page( url ) {
    if ( ! url ) {
        url = location.href;
    }
    
    return ( url.indexOf( TARGET_PAGE ) == 0 );
} // end of is_target_page()


function target_page_main() {
    if ( typeof $.setAjaxTransport_GM_xmlhttpRequest == 'function' ) {
        $.setAjaxTransport_GM_xmlhttpRequest(); // CORS ajax request is enabled, even if no 'Access-Control-Allow-Origin' header is present on the requested resource.
    }
    
    Twitter.initialize( {
        consumer_key : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        callback_url : CALLBACK_URL,
        use_separate_popup_window : true // true: in popup window / false: in tab
    } );
    
    if ( AUTOSTART_AUTH_PROCESS_ON_PAGE_LOADED ) {
        Twitter.authenticate()
        .done( function ( api ) {
            show_wellcome( api );
        } )
        .fail( function( error ){
            show_login_form();
        } );
    }
    else {
        Twitter.isAuthenticated()
        .done( function ( api ) {
            show_wellcome( api );
        } )
        .fail( function ( error ) {
            show_login_form();
        } );
    }
} // end of page_main()


function popup_main() {
    Twitter.initialize();
} // end of popup_main()


function show_wellcome( api ) {
    api( 'account/verify_credentials', 'GET' )
    .done( function( account_info ) {
        var user_name = account_info.name,
            screen_name = account_info.screen_name,
            tweet_date,
            tweet_html = [
                '<h3>Your last tweet</h3>',
                '<div class="tweet-container">',
                '  <blockquote class="twitter-tweet"><p dir="ltr"></p>&mdash; #user_name# (@#screen_name#) <a>#tweet_date#</a></blockquote>',
                '  <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
                '</div>'
            ].join( '' ).replace( /#user_name#/g, user_name ).replace( /#screen_name#/g, screen_name ),
            tweet_id,
            user_url = 'https://twitter.com/#screen_name#/'.replace( '#screen_name#', screen_name ),
            
            $info = $( '#info' ).empty(),
            $header = $( '<h2>Wellcome <a class="user_link"><span class="user_name"></span>(@<span class="screen_name"></span>)</a> !!&nbsp;&nbsp;<button class="logout">Logout</button></h2>' ),
            $logout_button = $header.find( 'button.logout' ).css( {
                'cursor' : 'pointer'
            } ),
            
            get_tweet_gadget = function ( screen_name, tweet_info ) {
                var tweet_url = 'https://twitter.com/#screen_name#/status/#tweet_id#',
                    $tweet;
                
                try {
                    tweet_id = tweet_info.id_str;
                    tweet_date = new Date( tweet_info.created_at ).toLocaleString();
                    tweet_url = tweet_url.replace( '#screen_name#', screen_name ).replace( '#tweet_id#', tweet_id );
                    
                    $tweet = $( tweet_html.replace( '#tweet_date#', tweet_date ) );
                    $tweet.find( 'p[dir]' ).text( tweet_info.text );
                    $tweet.find( 'a:last' ).attr( 'href', tweet_url );
                }
                catch ( error ) {
                    $tweet = $( tweet_html );
                    $tweet.siblings( '.tweet-container' ).html( '<p>(no tweet)</p>' );
                }
                
                return $tweet;
            },
            
            $tweet = get_tweet_gadget( screen_name, account_info.status ),
            
            $post_form = $( '<form id="post_form"><textarea name="status"></textarea><button class="post_button">Post status</button></form>' ),
            $post_button = $post_form.find( 'button.post_button').css( {
                'cursor' : 'pointer'
            } ),
            $post_status = $post_form.find( 'textarea[name="status"]' ).css( {
                'width' : '540px',
                'height' : '100px'
            } );
        
        $header.find( 'a.user_link' ).attr( 'href', user_url );
        $header.find( '.user_name' ).text( user_name );
        $header.find( '.screen_name' ).text( screen_name );
        
        $logout_button.on( 'click', function ( event ) {
            event.stopPropagation();
            event.preventDefault();
            
            Twitter.logout()
            .done( function () {
                show_login_form();
            } );
        } );
        
        $post_button.on( 'click', function ( event ) {
            event.stopPropagation();
            event.preventDefault();
            
            $post_button.prop( 'disabled', true );
            
            post_status( api, $post_status.val() )
            .done( function ( data, textStatus, jqXHR ) {
                var $new_tweet = get_tweet_gadget( data.user.screen_name, data );
                
                $tweet.remove();
                $post_form.after( $new_tweet );
                
                $tweet = $new_tweet;
                $post_status.val( '' );
                
                $post_button.prop( 'disabled', false );
            } )
            .fail( function ( jqXHR, textStatus, errorThrown ) {
                console.error( jqXHR, textStatus, errorThrown );
                alert( 'Post failure: ' + jqXHR.status + ' ' + jqXHR.statusText );
                $post_button.prop( 'disabled', false );
            } );
        } );
        
        $info.append( $header, $post_form, $tweet );
    } )
    .fail( function ( error ) {
        alert( error );
        show_login_form();
    } );
} // end of show_wellcome()


function show_login_form() {
    var $info = $( '#info' ).empty(),
        $header = $( '<h2><button class="login">Login</button></h2>' ),
        $error_message = $( '<div class="error-message"></div>' ).css( {
            'color' : 'red',
            'font-weight' : 'bolder'
        } ),
        $login_button = $header.find( 'button.login' ).css( {
            'cursor' : 'pointer'
        } ),
        enable_login_button = function ( error_message ) {
            if ( error_message ) {
                $error_message.text( error_message );
            }
            $login_button.prop( 'disabled', false );
        },
        disable_login_button = function () {
            $login_button.prop( 'disabled', true );
        };
    
    $login_button.on( 'click', function ( event ) {
        disable_login_button();
        
        event.stopPropagation();
        event.preventDefault();
        
        Twitter.authenticate( {
            force_login : true
        } )
        .done( function ( api ) {
            show_wellcome( api );
        } )
        .fail( function( error ){
            if ( /refused/i.test( error ) ) {
                error = 'Authorization refused by user';
            }
            enable_login_button( error );
        } );
    } );
    
    $info.append( $header, $error_message );
} // end of show_login_form()


function post_status( api, status ) {
    var $deferred = new $.Deferred(),
        $promise = $deferred.promise();
    
    api( 'statuses/update', 'POST', {
        status : status
    } )
    .done( function () {
        $deferred.resolve.apply( this, arguments );
    } )
    .fail( function () {
        $deferred.reject.apply( this, arguments );
    } );
    
    return $promise;
} // end of post_status()


} )();
