<template>
  <v-container>

    <!-- ページ移動ボタン -->
    <v-row class="mt-5 mb-3">
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
        :disabled = "(list_page*10) >= (joke_theme_data.length-10)"
        @click="page_change(true)"
      >
        次のページ
        <v-icon right>mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>

    <!-- お題リスト -->
    <v-card v-for="(item, i) in joke_theme_data.slice(list_page*10,list_page*10+10)" :key="i"
      class="mt-2"
    >
      <v-list-item-content class="mx-3">
        <v-list-item-title class="text-caption">
          {{item.date.toDate().getFullYear()}}/{{item.date.toDate().getMonth()+1}}/{{item.date.toDate().getDate()}}のお題
        </v-list-item-title>
        <p class="text-h5">
          「{{item.word}}」
        </p>
        <v-list-item-title class="text-body-1">
          が回答になる大喜利のお題は？
        </v-list-item-title>
      </v-list-item-content>

      <v-btn v-if="uid_copy != ''"
        class="ml-3 mb-3"
        color="primary"
        @click="dialog_display(item.id)"
      >
        <v-icon left>mdi-pencil-plus-outline</v-icon>
        投稿する
      </v-btn>

      <v-btn
        class="ml-3 mb-3"
        color="secondary"
        @click="check_posts(item.id)"
      >
        <v-icon left>mdi-comment-text-multiple-outline</v-icon>
        皆の投稿を見る
      </v-btn>
    </v-card>

    <!-- ページ移動ボタン -->
    <v-row class="mt-5 mb-3">
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
        :disabled = "(list_page*10) >= (joke_theme_data.length-10)"
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

  </v-container>
    
</template>

<script>
import post_dialog from '~/components/post_dialog.vue'

export default {
  components: {
    'post_dialog': post_dialog,
  },
  
  data () {
    return {
      /**
       * @typedef {object} joke_theme_data - お題情報の形式
       * 
       * @property {string} word - お題となる単語
       * @property {string} date - 追加された日時
       * @property {string} id - お題のid
       */
      
      /**
       * お題情報の表示用配列_元データ
       * @type {Array.<joke_theme_data>}
       */
      joke_theme_data:[],

      /**
       * お題配列の表示ページ
       * @type {number}
       */
      list_page: 0,

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
    }
  },

  created() {
    this.uid_copy = this.$global.my_data.uid;

    // 読み込みや追加を手っ取り早く反映するため時間差をつけて何度か呼ぶ
    for(var i=0; i<20; i++){
      setTimeout(this.joke_theme_sort, i*500);
    }

    // リスト表示用情報をクエリパラメータから読み取る
    if(typeof this.$route.query.page !== "undefined"){ this.list_page = this.$route.query.page; }
  },
  
  methods: {
    
    /**
     * お題をソートして表示用の配列に保存
     * @module joke_theme_sort
     */
    joke_theme_sort: function(){
      // 新規順にソートされたキー名のリストを取得
      var array_mem = Object.keys(this.$global.joke_theme_data).sort().reverse();

      // リストを参考にしてグローバルのデータを持ってくる
      this.joke_theme_data = new Array();
      for(var i=0; i<array_mem.length; i++){
        this.joke_theme_data[i] = this.$global.joke_theme_data[array_mem[i]];
        this.joke_theme_data[i].id = array_mem[i];
      }

      // uidコピーの更新
      this.uid_copy = this.$global.my_data.uid;

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
      this.$router.push("/themes?page="+this.list_page);
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
      }
    },

    /**
     * 対象となるお題への回答一覧を見るページに移動する
     * @module check_posts
     * @param {string} theme_id - お題id
     */
    check_posts(theme_id){
      this.$router.push("/posts?theme="+theme_id);
    }
  },
}
</script>



