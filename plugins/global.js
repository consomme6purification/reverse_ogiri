export default(context, inject) => {

  var $global={
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
     * 自分のユーザー情報
     * @type {user_data}
     */
    my_data:{
      uid: "",
      twitter_flag: true,
      twitter_name: "",
      name: "",
      icon_url: "",

      dark_flag:false,
    },

    /**
     * ユーザー情報
     * @type {Object.<user_data>}
     */
    user_data:{},


    /**
     * @typedef {object} joke_theme_data - お題情報の形式
     * 
     * @property {string} word - お題となる単語
     * @property {Date} date - 追加された日時
     */

    /**
     * お題情報
     * @type {Object.<joke_theme_data>}
     */
    joke_theme_data: {},


    /**
    * @typedef {object} joke_post_data - 回答情報の形式
    * 
    * @property {string} theme_id - お題id
    * @property {string} user_id - 回答ユーザーid
    * @property {Date} date - 追加された日時
    * @property {string} joke - 内容
    * @property {Object.<Object>} like - 評価ボタンを押したユーザーidリスト
    */

    /**
    * 回答情報
    * @type {Object.<joke_post_data>}
    */
    joke_post_data: {},
  }

  inject("global",$global);
}