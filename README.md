jsTwitterOAuth
==============

ユーザースクリプト([Tampermonkey](http://tampermonkey.net/)等)もしくはブラウザ拡張機能（Chrome拡張機能もしくはFirefoxアドオン(WebExtensions)）上で、TwitterのOAuthによるユーザー認定およびAPIコールを実装するためのライブラリと、そのサンプル。  


ファイル構成
------------
- src  
    - js  
        - example-twitter-oauth.user.js  
            サンプルユーザースクリプト／拡張機能コンテンツスクリプト（共用）  
        - [jquery.min.js](https://github.com/jquery/jquery)  
          [The MIT License](https://jquery.org/license/)  
        - twitter-oauth  
            - [sha1.js](http://pajhome.org.uk/crypt/md5/sha1.html)  
              Copyright Paul Johnston 2000 - 2009  
              The BSD License
            - [oauth.js](https://web.archive.org/web/20130921042751/http://code.google.com/p/oauth/source/browse/code/javascript/oauth.js)  
              Copyright 2008 Netflix, Inc.  
              [The Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)  
            - jQuery.setAjaxTransport_GM_xmlhttpRequest.js  
              $.ajax()をGM_xmlhttpRequest()を使用して実行出来るようにするライブラリ(ユーザースクリプトでのCORS通信用)  
            - twitter-api.js  
              Twitter OAuthユーザー認定＆APIコール用ライブラリ  
    - manifest.json  
      サンプルブラウザ拡張機能用マニフェスト  


サンプルのインストール方法
--------------------------
### ユーザースクリプト

[Tampermonkey](http://tampermonkey.net/)導入済みのブラウザ（Google Chrome / Firefox）にて、  

> [サンプルユーザースクリプト](https://furyutei.github.io/jsTwitterOAuth/src/js/example-twitter-oauth.user.js)  

にアクセスし、インストール。  


### ブラウザ拡張機能

[本リポジトリ](https://github.com/furyutei/jsTwitterOAuth)からダウンロードもしくはクローンした状態で、ブラウザ（Google Chrome / Firefox）の拡張機能（アドオン）の画面から manifest.json を指定してインストール。


サンプルの動作確認
------------------
ユーザースクリプトもしくはブラウザ拡張機能をインストールした状態で、  

> [サンプルページ](https://furyutei.github.io/jsTwitterOAuth/example/)  

にアクセスし、表示されたボタン（[Login] / [Logout]）を押して、指示に従う。  
**ユーザー認定ではポップアップウィンドウが開くため、ポップアップブロックが有効の場合、サンプルページについては無効化すること。**  


ライセンス
----------
[MIT License](https://github.com/furyutei/jsTwitterOAuth/blob/master/LICENSE)  
© 2018 風柳 @furyutei  


参考
----
- [chrome-extension-twitter-oauth-example/twitter.js](https://github.com/lambtron/chrome-extension-twitter-oauth-example/blob/master/js/lib/twitter.js)  
- [MoonScript/jQuery-ajaxTransport-XDomainRequest: jQuery ajaxTransport extension that uses XDomainRequest for IE8 and IE9.](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest)
