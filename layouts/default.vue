<template>
  <v-app :style="{backgroundColor: this.bgcolor[Number(theme)]}">

    <!-- 左メニュー -->
    <v-navigation-drawer
      v-model="navigation_flag"
      fixed
      app
    >
      <!-- ユーザー情報 -->
      <v-list-item>

        <!-- アイコン -->
        <v-list-item-icon class="mr-3">
          <v-avatar v-if="auth==null || !my_data_copy.twitter_flag" color="primary" size="36">
            <v-icon dark>mdi-account</v-icon>
          </v-avatar>
          <v-avatar v-else size="36">
            <img :src="my_data_copy.icon_url" />
          </v-avatar>
        </v-list-item-icon>

        <!-- 名前 -->
        <v-list-item-content>
          <v-list-item-title v-if="auth==null">
            ゲスト
          </v-list-item-title>
          <v-list-item-title v-else-if="my_data_copy.twitter_flag">
            {{my_data_copy.twitter_name}}
          </v-list-item-title>
          <v-list-item-title v-else>
            {{my_data_copy.name}}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider/>
      
      <!-- メニュー項目 -->
      <v-list
        nav
      >
        <!-- 過去の回答(ログイン時のみ) -->
        <v-list-item v-if="auth!=null" :to='"/posts?user="+my_data_copy.uid' nuxt @click="navigation_flag=false"
        >
          <v-list-item-icon class="mr-4">
            <v-icon>mdi-account-details-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>過去の回答</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- ユーザー設定(ログイン時のみ) -->
        <v-list-item v-if="auth!=null" to="/setting" nuxt @click="navigation_flag=false">
          <v-list-item-icon class="mr-4">
            <v-icon>mdi-cog-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>ユーザー設定</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- ダークモード -->
        <v-list-item @click="theme_change()">
          <v-list-item-icon class="mr-4">
            <v-icon>mdi-brightness-6</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>ダークモード</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- お問い合わせ -->
        <v-list-item href="https://forms.gle/r36bKd8spqka9Bnd9" target="_blank">
          <v-list-item-icon class="mr-4">
            <v-icon>mdi-email-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>お問い合わせ</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider/>

        <!-- ログアウト(ログイン時のみ) -->
        <v-list-item v-if="auth!=null" to="/" @click="twitter_logout()">
          <v-list-item-icon class="mr-4">
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>

    </v-navigation-drawer>

    <!-- 上部バー -->
    <v-app-bar
      fixed
      app
    >
      <!-- 左メニュー表示切り替え -->
      <v-app-bar-nav-icon
        @click.stop="navigation_flag = !navigation_flag"
      />

      <v-toolbar-title class="text-h5">
        リバース大喜利
      </v-toolbar-title>

      <v-spacer/>
      <v-btn v-if="auth==null"
        color="primary"
        @click="twitter_login()"
        class="px-2"
      >
        ログイン
        <v-icon right>mdi-twitter</v-icon>
      </v-btn>
      
      <!-- 上部メニュータブ -->
      <template v-if="menu_tab.flag" v-slot:extension>
        <v-tabs
          v-model="menu_tab.state"
          centered
          center-active
          grow
          icons-and-text
          optional
        >
          <v-tab to="/">
            ホーム
            <v-icon>mdi-home-outline</v-icon>
          </v-tab>
          <v-tab to="/themes">
            お題を探す
            <v-icon>mdi-magnify</v-icon>
          </v-tab>
          <v-tab to="/posts">
            回答を見る
            <v-icon>mdi-comment-text-multiple-outline</v-icon>
          </v-tab>

        </v-tabs>
      </template>

    </v-app-bar>

    <!-- メイン -->
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    
    <!-- フッター -->
    <v-footer app>
      <v-container>
        <v-row justify="center">
          (c) 2022 コンソメ爆盛り六根清浄
          <nuxt-link
            to="/privacy_policy"
            class="ml-6 text-body-2"
          >
            privacy policy
          </nuxt-link>
          
        </v-row>
      </v-container>

    </v-footer>

    <!-- エラーメッセージ表示シート -->
    <v-bottom-sheet v-model="error_sheet.flag">
      <v-sheet
        class="text-center"
        min-height="100"
      >
        <v-btn
          class="mt-3"
          text
          color="error"
          @click="error_sheet.flag=false"
        >
          閉じる
        </v-btn>
        <div class="py-3 pb-5">
          {{error_sheet.text}}
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <!-- ローディング表示 -->
    <v-overlay
      :value="loading"
      absolute
    >
      <v-progress-circular
        size="100"
        width="6"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

  </v-app>
</template>

<script>
import firebase from "@/assets/firestore";

export default {

  data () {
    return {
      /**
       * ローディング表示
       * @type {boolean}
       */
      loading: true,

      /**
       * 認証がまだならnull、済んでいればツイッターアカウントの情報が入る
       * @type {null | string}
       */
      auth: null,

      /**
       * エラーメッセージ表示シートの情報
       * @type {object}
       */
      error_sheet:{
        /**
         * 表示フラグ
         * @type {boolean}
         */
        flag: false,

        /**
         * 内容
         * @type {string}
         */
        text: ""
      },

      /**
       * 左メニューの表示フラグ
       * @type {boolean}
       */
      navigation_flag: false,

      /**
       * メニュータブの情報
       * @type {object}
       */
      menu_tab:{
        /**
         * 表示フラグ
         * @type {boolean}
         */
        flag: true,

        /**
         * 状態
         * @type {number}
         */
        state: 0
      },

      /**
       * ダークモード用フラグ
       * @type {boolean}
       */
      theme: this.$store.state.theme,

      /**
       * 背景色 二番目はダークモード時の色
       * @type {Array.<string>}
       */
      bgcolor: ["rgba(235,236,247)","rgba(18,18,30)"],

      /**
       * @typedef {object} user_data - ユーザー情報の形式
       * 
       * @property {string} uid - ツイッターのuid
       * @property {boolean} twitter_flag - ツイッターの情報を使用するかどうか
       * @property {string} twitter_name - ツイッターのユーザー名
       * @property {string} name - ツイッター情報を使用しない場合のユーザー名
       * @property {string} icon_url - ツイッターのアイコン画像URL
       * 
       * @property {boolean} dark_flag - ダークモードフラグ
       */

      /**
       * 自分のユーザー情報の監視用コピー
       * @type {user_data}
       */
      my_data_copy:{
        uid: "",
        twitter_flag: true,
        twitter_name: "",
        name: "",
        icon_url: "",

        dark_flag:false,
      },
    }
  },

  watch: {
    theme() {
      this.$store.dispatch("theme", this.theme);
      this.$vuetify.theme.dark = this.theme;
    },
  },

  created() {
    // ログイン関係
    this.twitter_login_check();

    // お題と回答データ関係
    this.joke_theme_load();
    this.joke_post_load();
  },

  methods: {
    /**
     * エラーメッセージを表示し、コンソールにも出力する
     * @module draw_error
     * @param {string} error_text - エラーメッセージの内容
     */
    draw_error: function(error_text){
      this.error_sheet.text = "error:" + error_text;
      this.error_sheet.flag = true;
      console.log("error:" + error_text);
    },


    /**
     * ツイッターアカウントでのログイン画面に飛ばす
     * @module twitter_login
     */
    twitter_login: function(){
      var provider = new firebase.auth.TwitterAuthProvider();

      firebase
        .auth()
        .signInWithRedirect(provider)
        .then((result) => {
          /** @type {firebase.auth.OAuthCredential} */
          // var credential = result.credential;

          // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
          // You can use these server side with your app's credentials to access the Twitter API.
          // var token = credential.accessToken;
          // var secret = credential.secret;

          // The signed-in user info.
          this.auth = result.user; // ここの処理は成功したらTwitterログインページに飛ばされるので代入されない…ってコト!?
          // ...
          console.log("ログインに成功しました");
        }).catch((error) => {
          // Handle Errors here.
          // var errorCode = error.code;
          // var errorMessage = error.message;
          // The email of the user's account used.
          // var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          // var credential = error.credential;
          // ...
          if(error.code === "auth/auth-domain-config-required"){
            this.draw_error("初期化時にauthDomain構成が提供されていません");
          }else if(error.code === "auth/operation-not-supported-in-this-environment"){
            this.draw_error("この環境ではこの操作はサポートされていません");
          }else if(error.code === "auth/unauthorized-domain"){
            this.draw_error("アプリドメインがFirebaseプロジェクトのOAuth操作に対して承認されていません");
          }
        });
    },

    /**
     * ツイッターアカウントでのログインが完了して戻ってきたことを検知する
     * @module twitter_login_check
     */
    twitter_login_check: function(){
      firebase.auth()
        .getRedirectResult()
        .then((result) => {
          if (result.credential) {
            /** @type {firebase.auth.OAuthCredential} */
            // var credential = result.credential;

            // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
            // You can use these server side with your app's credentials to access the Twitter API.
            // var token = credential.accessToken;
            // var secret = credential.secret;
            // ...

            // ユーザー情報を取得
            this.auth = result.user;
            console.log("ログインしました");

            // ユーザーデータを取得
            this.get_firestore();

            // The signed-in user info.
            // var user = result.user;
          }else{
            console.log("ログインしていません");

            // 前回のログイン情報が半端に残っているとエラー吐きやすいので一応確実にログアウトしておく
            firebase.auth().signOut().then(() => {
              // Sign-out successful.
              this.get_firestore();
            }).catch((error) => {
              // An error happened.
              this.draw_error("ログイン情報の初期化に失敗しました");
            });

          }

        }).catch((error) => {
          // Handle Errors here.
          // var errorCode = error.code;
          // var errorMessage = error.message;
          // The email of the user's account used.
          // var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          // var credential = error.credential;
          // ...
          if(error.code === "auth/account-exists-with-different-credential"){
            this.draw_error("クレデンシャルによってアサートされた電子メールアドレスを持つアカウントがすでに存在しています");
          }else if(error.code === "auth/auth-domain-config-required"){
            this.draw_error("初期化時にauthDomain構成が提供されていません");
          }else if(error.code === "auth/credential-already-in-use"){
            this.draw_error("クレデンシャルに対応するアカウントがユーザー間にすでに存在する、またはFirebaseユーザーに既にリンクされています");
          }else if(error.code === "auth/email-already-in-use"){
            this.draw_error("クレデンシャルに対応する電子メールがユーザー間にすでに存在しています");
          }else if(error.code === "auth/operation-not-allowed"){
            this.draw_error("クレデンシャルに対応するアカウントの種類が有効になっていません");
          }else if(error.code === "auth/operation-not-supported-in-this-environment"){
            this.draw_error("この環境ではこの操作はサポートされていません");
          }else if(error.code === "auth/timeout"){
            this.draw_error("アカウントが承認されませんでした");
          }
          this.loading = false;
        });
    },

    /**
     * ログアウトする
     * @module twitter_logout
     */
    twitter_logout: function(){
      firebase.auth().signOut().then(() => {
        // Sign-out successful.
        this.auth = null;
        this.navigation_flag = false;
        this.$global.my_data.uid = "";
        console.log("ログアウトしました");
      }).catch((error) => {
        // An error happened.
        this.draw_error("ログアウトに失敗しました");
      });
    },

    /**
     * firebaseからデータを取得する
     * @module getFirestore
     */
    get_firestore: function() {
      // ユーザーデータ読込
      firebase.firestore().collection("data").doc("user").get().then((doc) => {
        if (doc.exists) {
          this.$global.user_data = doc.data();

          // ログイン済みの場合、自分のユーザーデータを取得or新規作成する
          if(this.auth !== null){

            if (typeof this.$global.user_data[this.auth.uid] === "undefined"){

              // 既存データが無ければ設定を保存
              this.$global.my_data.uid = this.auth.uid;
              this.$global.my_data.twitter_flag = true;
              this.$global.my_data.twitter_name = this.auth.displayName;
              this.$global.my_data.name = "";
              this.$global.my_data.icon_url = this.auth.photoURL;
              this.$global.my_data.dark_flag = false;
              
              this.$global.user_data[this.auth.uid] = this.$global.my_data;
              this.my_data_copy = this.$global.my_data;

              firebase.firestore().collection("data").doc("user").set({
                [this.$global.my_data.uid]: this.$global.my_data
              }, { merge: true })
              .then(() => {
                console.log("アカウントの新規作成に成功しました");
              })
              .catch((error) => {
                this.draw_error("アカウントの新規作成に失敗しました");
              });
            }else{
              // ユーザー登録済みの場合、ロードしつつツイッター情報の更新もする
              this.$global.user_data[this.auth.uid].twitter_name = this.auth.displayName;
              this.$global.user_data[this.auth.uid].icon_url = this.auth.photoURL;

              this.$global.my_data = this.$global.user_data[this.auth.uid];
              this.my_data_copy = this.$global.my_data;
              this.theme = this.$global.my_data.dark_flag;

              firebase.firestore().collection("data").doc("user").set({
                [this.$global.my_data.uid]: this.$global.my_data
              }, { merge: true })
              .then(() => {
                console.log("アカウントの情報更新に成功しました");
              })
              .catch((error) => {
                this.draw_error("アカウントの情報更新に失敗しました");
              });
            }
          }

          this.loading = false;

        } else {
          console.log("ユーザーデータが存在していません");
          this.loading = false;
        }
      }).catch((error) => {
        this.draw_error("ユーザーデータを取得できませんでした");
        this.loading = false;
      });

    },


    /**
     * ダークモードの切り替えとクラウドへのセーブ
     * @module theme_change
     */
    theme_change: function(){
      // 切り替え
      this.theme=!this.theme;

      // ログイン時は設定とクラウドに書き込み
      if(this.auth !== null){
        this.$global.user_data[this.auth.uid].dark_flag = this.theme;
        this.$global.my_data.dark_flag = this.theme;

        firebase.firestore().collection("data").doc("user").set({
          [this.$global.my_data.uid]: this.$global.my_data
        }, { merge: true })
        .then(() => {
          console.log("アカウントの情報更新に成功しました");
        })
        .catch((error) => {
          this.draw_error("アカウントの情報更新に失敗しました");
        });
      }
    },


    /**
     * お題の読み込みと必要に応じた更新
     * @module joke_theme_load
     */
    joke_theme_load: function(){

      // お題の読み込み
      firebase.firestore().collection("data").doc("joke_theme").get().then((doc) => {
        if (doc.exists) {
          this.$global.joke_theme_data = doc.data();
          console.log("お題データを取得しました");

          // 日付を取得する
          var date = new Date();

          // 十日前までのデータの隙間を埋める
          for(var i=0; i<10; i++){

            // 日付を算出
            var date_mem = new Date();
            date_mem.setDate(date.getDate()-i);
            var y = date_mem.getFullYear();
            var m = date_mem.getMonth()+1;
            var d = date_mem.getDate();

            // データのidを生成
            var id = ('0000'+y).slice(-4) + "_" + ('00'+m).slice(-2) + "_" + ('00'+d).slice(-2);

            if (typeof this.$global.joke_theme_data[id] === 'undefined'){
              this.joke_theme_create(id, date_mem);
            }

          }
        
        } else {
          console.log("お題データが存在していません");
        }
      }).catch((error) => {
        this.draw_error("お題データを取得できませんでした");
      });
    },

    /**
     * 回答の読み込み
     * @module joke_post_load
     */
    joke_post_load: function(){
      // 回答の読み込み
      firebase.firestore().collection("data").doc("joke_post").get().then((doc) => {
        if (doc.exists) {
          this.$global.joke_post_data = doc.data();
          console.log("回答データを取得しました");
        
        } else {
          console.log("回答データが存在していません");
        }
      }).catch((error) => {
        this.draw_error("回答データを取得できませんでした");
      });
    },

    /**
     * お題を作成する
     * @module joke_theme_create
     * @param {string} id - お題データid
     * @param {Date} date - 日時
     */
    async joke_theme_create(id, date){
      // wikipediaの記事をランダムに取得する
      var url = 'https://ja.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=info&inprop=url&indexpageids';

      await this.$axios.$get(url+"&origin=*")
        .then((response) => {
          var pageID = response.query.pageids;
          var pageTitle = response.query.pages[pageID].title;

          var time = firebase.firestore.Timestamp.fromDate(date);

          // データを更新する
          this.$global.joke_theme_data[id]={
            word: pageTitle,
            date: time
          };

          firebase.firestore().collection("data").doc("joke_theme").set({
                [id]: this.$global.joke_theme_data[id]
              }, { merge: true })
              .then(() => {
                console.log("お題データの作成に成功しました");
              })
              .catch((error) => {
                this.draw_error("お題データの作成に失敗しました");
              });
        })
        .catch((error) => {
          this.draw_error("お題データ用の情報取得に失敗しました");
        });
    }
  },

}
</script>