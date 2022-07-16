<template>
  <v-container>

    <!-- Twitter情報 -->
    <v-row>
      <v-card
        class="mx-5 mt-5"
        :elevation="3*Number(my_data_edit.twitter_flag)"
        width="100%"
        :disabled="!my_data_edit.twitter_flag"
        :outlined="!my_data_edit.twitter_flag"
        color="rgba(128,128,128,0.1)"
      >

        <!-- アイコン -->
        <v-row align="center" justify="center" no-gutters>
          <v-card flat class="ml-2 mt-2" color="#00000000">
            <v-avatar size="96">
              <img :src="my_data_copy.icon_url" />
            </v-avatar>
          </v-card>
        </v-row>

        <!-- 名前 -->
        <v-row align="center" no-gutters>
          <v-card flat color="#00000000">
            <v-card-title class="text-h5">
              {{my_data_copy.twitter_name}}
            </v-card-title>
          </v-card>
        </v-row>

      </v-card>
    </v-row>
    
    <!-- 設定 -->
    <v-row>
      <v-card
        class="mx-5 mt-5"
        elevation="3"
        width="100%"
        color="rgba(128,128,128,0.1)"
      >
        <!-- Twitter情報表示 -->
        <v-card-title class="text-h6">Twitterの名前とアイコンを使用する</v-card-title>

        <v-switch v-model="my_data_edit.twitter_flag" inset class="ml-10 mt-0"/>

        
        <!-- Twitter情報を表示しない場合の名前 -->
        <v-card v-if="!my_data_edit.twitter_flag"
          flat
          color="#00000000"
        >
          <v-card-title class="text-h6">表示する名前を設定する</v-card-title>
          <v-text-field
            outlined
            v-model="my_data_edit.name"
            counter="30"
            maxlength="30"
            class="mx-5 my-0"
            clearable
          />
        </v-card>
      </v-card>
    </v-row>

    <!-- 保存ボタン -->
    <v-row
      justify="center"
      class="my-8"
    >
      <v-btn
        color="primary"
        x-large
        :disabled = "
          this.my_data_edit.twitter_flag == this.my_data_copy.twitter_flag && 
          this.my_data_edit.name == this.my_data_copy.name"
        @click="edit_save()"
      >
        変更を保存
      </v-btn>
    </v-row>

  </v-container>
</template>

<script>
import firebase from "@/assets/firestore";

export default {

  data () {
    return {
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
      
      /**
       * 一時保存用設定データ:
       * @type {user_data}
       */
      my_data_edit:{
        twitter_flag: true,
        name: "",
      },
    }
  },
  
  created() {
    if(this.$global.my_data.uid == ""){
      // 非ログイン状態でこのページに来た場合はルールに戻す
      this.$router.push('/');

    }else{
      // 表示と編集用にグローバルのデータをローカルにコピー
      this.my_data_copy = this.$global.my_data;

      this.my_data_edit.twitter_flag = this.my_data_copy.twitter_flag;
      this.my_data_edit.name = this.my_data_copy.name;
    }
  },
  
  methods: {
    /**
     * 編集したデータを保存する
     * @module edit_save
     */
    edit_save: function(){

      // 編集用データを反映
      this.my_data_copy.twitter_flag = this.my_data_edit.twitter_flag;
      this.my_data_copy.name = this.my_data_edit.name;

      this.$global.my_data = this.my_data_copy;

      // クラウドにも保存
      firebase.firestore().collection("data").doc("user").set({
        [this.$global.my_data.uid]: this.$global.my_data
      }, { merge: true })
        .then(() => {
          console.log("アカウントの情報更新に成功しました");
        })
        .catch((error) => {
          this.draw_error("アカウントの情報更新に失敗しました");
        });
    },
  }

}
</script>
