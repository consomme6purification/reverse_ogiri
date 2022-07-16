<template>
  <v-overlay
    :value="flag"
  >
    <v-card
      :light = "!dark_theme"
      elevation="5"
      class="mx-5"
    >
      <v-list-item-content class="mx-3">
        <p class="text-h5">
          「{{theme_word}}」
        </p>
        <v-list-item-title class="text-body-1">
          が回答になる大喜利のお題は？
        </v-list-item-title>
      </v-list-item-content>
      
      <v-textarea
        v-model="post_input"
        outlined
        class="mx-3 mt-3"
        label="答えを入力"
        clearable
        counter="200"
        maxlength="200"
        no-resize
        auto-grow
      ></v-textarea>

      <v-btn
        class="ml-3 mb-3"
        color="primary"
        @click="emit_post()"
      >
        投稿
      </v-btn>

      <v-btn
        class="ml-3 mb-3"
        @click="emit_cancel()"
      >
        キャンセル
      </v-btn>

    </v-card>

  </v-overlay>
</template>

<script>
  import firebase from "@/assets/firestore";

  export default {
    props: {
      /**
       * 表示フラグ
       * @type {boolean}
       */
      flag: false,

      /**
       * ユーザーid
       * @type {string}
       */
      uid: "",

       /**
       * お題id
       * @type {string}
       */
      theme_id: "",

      /**
       * お題テキスト
       * @type {string}
       */
      theme_word: "",

      /**
       * ダークモード用フラグ
       * @type {boolean}
       */
      dark_theme: false,
    },

    data () {
      return {
        /**
         * 回答テキスト
         * @type {string}
         */
        post_input: "",
      }
    },
        
    methods: {
      /**
       * 投稿した結果を返す
       * @module emit_post
       */
      emit_post() {
        // 回答idの作成
        var post_id = this.theme_id + "_" + this.uid + "_" + Date.now();

        // 回答データの作成
        this.$global.joke_post_data[post_id] = {
          post_id: post_id,
          theme_id: this.theme_id,
          user_id: this.uid,
          date: firebase.firestore.Timestamp.fromDate(new Date()),
          joke: this.post_input,
          like: {}
        };
        
        this.post_input = "";

        // 回答データの保存
        firebase.firestore().collection("data").doc("joke_post").set({
            [post_id]: this.$global.joke_post_data[post_id]
          }, { merge: true })
          .then(() => {
            console.log("回答データの保存に成功しました");
            this.$emit("result", {"res": true, "theme_id": this.theme_id});
          })
          .catch((error) => {
            console.log("回答データの保存に失敗しました");
            this.$emit("result", {"res": false, "theme_id": ""});
          });
      },

      /**
       * 投稿をキャンセルした結果を返す
       * @module emit_post
       */
      emit_cancel() {
        this.post_input = "";
        this.$emit("result", {"res": false, "theme_id": ""});
      },
    },
  }
</script>