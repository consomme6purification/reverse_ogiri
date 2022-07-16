<template>
  <v-container>
    <!-- 絞り込み時ユーザー表示 -->
    <v-card v-if="this.joke_post_data.length!=0 && query_user != ''" class="mt-2 mb-6">
      <p v-if="$global.user_data[query_user].twitter_flag" class="text-body-1 ml-7">
        <v-btn icon class="mr-5 my-7" style="pointer-events: none">
          <v-avatar size="64">
            <img :src="$global.user_data[query_user].icon_url"/>
          </v-avatar>
        </v-btn>
        {{$global.user_data[query_user].twitter_name}} の投稿
      </p>
      <p v-else class="text-body-1 ml-4">
        <v-btn fab color="#80808040" large depressed class="mr-1 my-4" style="pointer-events: none">
          <v-avatar size="64">
            <v-icon large>mdi-account</v-icon>
          </v-avatar>
        </v-btn>
        {{$global.user_data[query_user].name}} の投稿
      </p>
    </v-card>

    <!-- 絞り込み時お題表示 -->
    <v-card v-else-if="this.joke_post_data.length!=0 && query_theme != ''" class="mt-2 mb-6">
      <v-list-item-content class="mx-3">
        <v-list-item-title class="text-caption">
          {{$global.joke_theme_data[query_theme].date.toDate().getFullYear()}}/{{$global.joke_theme_data[query_theme].date.toDate().getMonth()+1}}/{{$global.joke_theme_data[query_theme].date.toDate().getDate()}}のお題
        </v-list-item-title>
        <p class="text-h5">
          「{{$global.joke_theme_data[query_theme].word}}」
        </p>
        <v-list-item-title class="text-body-1">
          が回答になる大喜利のお題は？
        </v-list-item-title>
      </v-list-item-content>

      <v-btn v-if="uid_copy != ''"
        class="ml-3 mb-3"
        color="primary"
        @click="dialog_display(query_theme)"
      >
        <v-icon left>mdi-pencil-plus-outline</v-icon>
        投稿する
      </v-btn>
    </v-card>
    

    <!-- ページ移動ボタン -->
    <v-row v-if="joke_post_data.length > 10"
      class="mt-5 mb-3"
    >
      <v-btn
        large
        class="ml-6"
        :disabled = "list_page == 0"
        @click="page_change(false)"
      >
        <v-icon left>mdi-chevron-left</v-icon>
        前のページ
      </v-btn>

      <v-spacer/>

      <v-btn
        large
        class="mr-6"
        :disabled = "(list_page*10) >= (joke_post_data.length-10)"
        @click="page_change(true)"
      >
        次のページ
        <v-icon right>mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>


    <!-- 回答リスト -->
    <v-card v-for="(item, i) in joke_post_data.slice(list_page*10,list_page*10+10)" :key="i"
      class="mt-2"
    >
      <v-list-item-content class="mx-3">
        <!-- 日付 -->
        <v-list-item-title class="text-caption">
          {{item.date.toDate().getFullYear()}}/{{item.date.toDate().getMonth()+1}}/{{item.date.toDate().getDate()}} {{item.date.toDate().getHours()}}:{{item.date.toDate().getMinutes()}}の投稿
        </v-list-item-title>

        <!-- お題 -->
        <p class="text-body-1">
          Q.「{{$global.joke_theme_data[item.theme_id].word}}」が回答になる大喜利のお題は？
        </p>

        <!-- お題にアクションをかけるボタン -->
        <p v-if="query_theme == ''" class="text-body-1">
          <v-btn v-if="uid_copy != ''"
            class="ml-1"
            color="primary"
            small
            @click="dialog_display(item.theme_id)"
          >
            <v-icon left>mdi-pencil-plus-outline</v-icon>
            このお題に投稿する
          </v-btn>

          <v-btn
            class="ml-1"
            color="secondary"
            small
            @click="check_posts(item.theme_id,false)"
          >
            <v-icon left>mdi-comment-text-multiple-outline</v-icon>
            このお題の他の投稿を見る
          </v-btn>
        </p>
        
        <!-- 投稿者情報 -->
        <p v-if="query_user == '' && $global.user_data[item.user_id].twitter_flag" class="text-body-1 mt-3">
          <v-btn icon @click="check_posts(item.user_id,true)">
            <v-avatar size="36">
              <img :src="$global.user_data[item.user_id].icon_url"/>
            </v-avatar>
          </v-btn>
          {{$global.user_data[item.user_id].twitter_name}} の投稿
        </p>
        <p v-else-if="query_user == ''" class="text-body-1 mt-3">
          <v-btn fab @click="check_posts(item.user_id,true)" color="#80808040" small depressed>
            <v-avatar size="36">
              <v-icon >mdi-account</v-icon>
            </v-avatar>
          </v-btn>
          {{$global.user_data[item.user_id].name}} の投稿
        </p>

        <p class="text-h5 mt-2 mb-1">
          A.{{item.joke}}
        </p>

        <!-- 回答にアクションをかけるボタン -->
        <p class="text-body-1">
          <v-btn v-if="uid_copy == item.user_id"
            class="ml-1"
            color="#ffa0a0"
            small
            light
            @click="delete_dialog_display(item.post_id)"
          >
            <v-icon left>mdi-trash-can-outline</v-icon>
            削除
          </v-btn>
          <v-btn v-else-if="uid_copy != ''"
            class="ml-1"
            color="#fff3aa"
            small
            light
            @click="like_push(item.post_id,i)"
          >
            <v-icon v-if="joke_post_data[i].like[uid_copy]" left>
              mdi-thumb-up
            </v-icon>
            <v-icon v-else left>
              mdi-thumb-up-outline
            </v-icon>
            ウケた ({{joke_post_data[i].like_count}})
          </v-btn>
        </p>

      </v-list-item-content>
      
    </v-card>

    <v-row v-if="joke_post_data.length == 0"
      class="text-h5"
      justify="center"
    >
      絞り込み条件に一致する回答が存在しません
    </v-row>
    

    <!-- ページ移動ボタン -->
    <v-row v-if="(joke_post_data.length - list_page*10 > 3) && (joke_post_data.length > 10)"
      class="mt-5 mb-3"
    >
      <v-btn
        large
        class="ml-6"
        :disabled = "list_page == 0"
        @click="page_change(false)"
      >
        <v-icon left>mdi-chevron-left</v-icon>
        前のページ
      </v-btn>

      <v-spacer/>

      <v-btn
        large
        class="mr-6"
        :disabled = "(list_page*10) >= (joke_post_data.length-10)"
        @click="page_change(true)"
      >
        次のページ
        <v-icon right>mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>

    <post_dialog
      :flag = "dialog_flag"
      :uid="uid_copy"
      :theme_id="select_theme_id"
      :theme_word="select_theme_word"
      :dark_theme="$vuetify.theme.dark"
      @result="dialog_response"
    />
    
    <v-overlay
      :value="delete_dialog_flag"
    >
      <v-card
        :light = "!$vuetify.theme.dark"
        elevation="5"
        class="mx-5"
      >
        <v-list-item-content class="mx-3">
          <v-list-item-title class="text-body-1">
            投稿を削除しますか？
          </v-list-item-title>
        </v-list-item-content>

        <v-btn
          class="ml-3 mb-3"
          color="error"
          @click="delete_post()"
        >
          削除する
        </v-btn>

        <v-btn
          class="mx-3 mb-3"
          @click="delete_dialog_flag = false"
        >
          削除しない
        </v-btn>

      </v-card>
    </v-overlay>

  </v-container>
</template>

<script>
import firebase from "@/assets/firestore";
import post_dialog from '~/components/post_dialog.vue'
import goTo from 'vuetify/lib/services/goto'

export default {
  components: {
    'post_dialog': post_dialog,
  },

  data () {
    return {
      /**
      * @typedef {object} joke_post_data - 回答情報の形式
      * 
      * @property {string} post_id - 投稿id
      * @property {string} theme_id - お題id
      * @property {string} user_id - 回答ユーザーid
      * @property {Date} date - 追加された日時
      * @property {string} joke - 内容
      * @property {Object.<string>} like - 評価ボタンを押したユーザーidリスト
      * @property {number} like_count - 評価ボタンを押したユーザーidリストの長さ
      */
      
      /**
       * 回答情報の表示用配列_元データ
       * @type {Object.<joke_post_data>}
       */
      joke_post_data:[],

      /**
       * 回答配列の表示ページ
       * @type {number}
       */
      list_page: 0,

      /**
       * 絞り込み表示_ユーザー
       * @type {string}
       */
      query_user: "",

      /**
       * 絞り込み表示_お題
       * @type {string}
       */
      query_theme: "",

      /**
       * 投稿ボタンの表示フラグと投稿に使うユーザーid
       * @type {string}
       */
      uid_copy: "",

      /**
       * 選択したお題id
       * @type {string}
       */
      select_theme_id: "",

      /**
       * 選択したお題ワード
       * @type {string}
       */
      select_theme_word: "",

      /**
       * 投稿ダイアログ表示フラグ
       * @type {boolean}
       */
      dialog_flag: false,

      /**
       * 削除ダイアログ表示フラグ
       * @type {boolean}
       */
      delete_dialog_flag: false,

      /**
       * 削除ダイアログ用選択回答id
       * @type {string}
       */
      delete_post_id: "",
    }
  },

  created() {
    this.uid_copy = this.$global.my_data.uid;

    // リスト表示用情報をクエリパラメータから読み取る
    if(typeof this.$route.query.page !== "undefined"){ this.list_page = this.$route.query.page; }
    if(typeof this.$route.query.user !== "undefined"){ this.query_user = this.$route.query.user; }
    if(typeof this.$route.query.theme !== "undefined"){ this.query_theme = this.$route.query.theme; }

    // 読み込みや追加を手っ取り早く反映するため時間差をつけて何度か呼ぶ
    for(var i=0; i<20; i++){
      setTimeout(this.joke_post_sort, i*500);
    }
  },
  
  watch: {
    // ルートの変更の検知
    $route(to, from) {
      this.list_page = 0;
      this.query_user="";
      this.query_theme="";
      if(typeof this.$route.query.page !== "undefined"){ this.list_page = this.$route.query.page; }
      if(typeof this.$route.query.user !== "undefined"){ this.query_user = this.$route.query.user; }
      if(typeof this.$route.query.theme !== "undefined"){ this.query_theme = this.$route.query.theme; }
      this.joke_post_sort();
    }
  },
  
  methods: {
    /**
     * お題をソートして表示用の配列に保存
     * @module joke_post_sort
     */
    joke_post_sort: function(){
      // 新規順にソートされたリストを取得
      var array_mem = this.$global.joke_post_data;
      var array_result = Object.keys(array_mem).map(function (key) {return array_mem[key];})
        .sort(function(a, b) {
          return (a.date < b.date) ? -1 : 1;
        }).reverse();

      // 絞り込み用クエリパラメータがあれば絞り込む
      if(this.query_user != ""){
        var text = this.query_user;
        this.joke_post_data = array_result.filter( function( item ) {
          return item.user_id == text;
        })
      }else if(this.query_theme != ""){
        var text = this.query_theme;
        this.joke_post_data = array_result.filter( function( item ) {
            return item.theme_id == text;
        })
      }else{
        this.joke_post_data = array_result;
      }

      // uidコピーの更新
      this.uid_copy = this.$global.my_data.uid;

      // ログイン時は各投稿の評価数を算出
      if(this.uid_copy != ""){
        for(var i=0; i<this.joke_post_data.length; i++){

          if(typeof this.joke_post_data[i].like[this.uid_copy] === "undefined"){
            // 情報がない場合は作成
            this.joke_post_data[i].like[this.uid_copy] = false;
            this.joke_post_data[i].like_count = 0;
          }else{
            // 情報がある場合はカウント
            this.joke_post_data[i].like_count = 0;
            var key_array = Object.keys(this.joke_post_data[i].like);
            for(var j=0; j<key_array.length; j++){
              if(this.joke_post_data[i].like[key_array[j]])this.joke_post_data[i].like_count++;
            }
          }
        }
      }

    },

    /**
     * お題の表示ページを変える
     * @module page_change
     * @param {boolean} type - trueなら次、falseなら前
     */
    page_change: function(type){
      if(type){
        this.list_page++;
      }else{
        this.list_page--;
      }
      var url = "/posts?";
      if(this.query_user!=""){ url += "user="+this.query_user+"&" }
      else if(this.query_theme!=""){ url += "theme="+this.query_theme+"&" }
      this.$router.push(url+"page="+this.list_page);
    },


    /**
     * 投稿ダイアログの表示
     * @module dialog_response
     * @param {string} theme_id - 選択したお題
     */
    dialog_display(theme_id){
      this.select_theme_id = theme_id;
      this.select_theme_word = this.$global.joke_theme_data[theme_id].word;
      this.dialog_flag = true;
    },

    /**
     * 投稿ダイアログの結果を処理する
     * @module dialog_response
     * @param {Object} obj - 結果
     */
    dialog_response(obj){
      this.dialog_flag = false;

      if(obj.res){
        // 回答を投稿した場合はお題ページに移動
        this.$router.push("/posts?theme="+obj.theme_id);
        this.list_page = 0;
        this.query_theme = obj.theme_id;
        this.query_user = "";

        this.joke_post_sort();
        goTo(0);
      }
    },

    /**
     * 対象となる回答一覧を見るページに移動する
     * @module check_posts
     * @param {string} id - ユーザーかお題のid
     * @param {boolean} mode - trueならユーザー、falseならお題
     */
    check_posts(id,mode){
      this.list_page = 0;

      if(mode){
        this.$router.push("/posts?user="+id);
        this.query_theme = "";
        this.query_user = id;
      }else{
        this.$router.push("/posts?theme="+id);
        this.query_theme = id;
        this.query_user = "";
      }
      
      this.joke_post_sort();
      goTo(0);
    },

    /**
     * 回答削除ダイアログを表示する
     * @module delete_dialog_display
     * @param {string} id - 回答id
     */
    delete_dialog_display(id){
      this.delete_dialog_flag = true;
      this.delete_post_id = id;
    },

    /**
     * 回答削除ダイアログを表示する
     * @module delete_post
     */
    delete_post(){
      this.delete_dialog_flag = false;
      delete this.$global.joke_post_data[this.delete_post_id];

      firebase.firestore().collection("data").doc("joke_post").update({
          [this.delete_post_id]: firebase.firestore.FieldValue.delete()
        })
        .then(() => {
          console.log("回答データの削除に成功しました");
          this.joke_post_sort();

          if((this.list_page*10) >= (this.joke_post_data.length))this.list_page--;
        })
        .catch((error) => {
          console.log("回答データの削除に失敗しました");
        });
    },

    /**
     * ウケたボタンを押す
     * @module like_push
     * @param {string} id - 回答id
     * @param {string} array_i - 配列内番号
     */
    like_push(id,array_i){
      this.joke_post_data[array_i].like[this.uid_copy] = !this.joke_post_data[array_i].like[this.uid_copy];
      this.$global.joke_post_data[id].like[this.uid_copy] = this.joke_post_data[array_i].like[this.uid_copy];

      if(this.joke_post_data[array_i].like[this.uid_copy]){
        this.joke_post_data[array_i].like_count ++;
      }else{
        this.joke_post_data[array_i].like_count --;
      }

      firebase.firestore().collection("data").doc("joke_post").update({
          [id] : this.$global.joke_post_data[id]
        }, { merge: true })
        .then(() => {
          console.log("回答データの更新に成功しました");
        })
        .catch((error) => {
          console.log("回答データの更新に失敗しました");
        });

      this.joke_post_sort();
    }
  },
}
</script>