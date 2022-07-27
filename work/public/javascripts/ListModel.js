function Run(model){
    //日付変換
    Convert_Datetime(model.data);
    var SearchModel = new Vue({
        el: '#app',
        data: model.data,
        methods:{
            search_btn: function(){
                GetModel("/api/Search",{
                    params: {
                        word: this.search_word
                    }
                }).then((res)=>{
                    this.Installations = res.data.Installations;
                    this.search_word = res.data.search_word;
                })
            }
        }
    });
}

function err(result){
    var err_model = new Vue({
        el: '#app',
        data: {
            install_id: null,
            message: {
                error: "インストールのリストの取得に失敗しました。"
            }
        }
    })
}

function Convert_Datetime(model){
    model.Installations.forEach(value=>{
        value.updatedAt = convert_time(value.updatedAt);
        value.createdAt = convert_time(value.createdAt);
    });

    console.log(model);
}
init_model("/api/Search",{word: word},Run,err)