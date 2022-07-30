var page = 0;

function Run(model){
    //日付変換
    Convert_Datetime(model.data);
    //console.log(model);
    var SearchModel = new Vue({
        el: '#app',
        data: model.data,
        methods:{
            search_btn: async function(){
                page = -1;
                this.Installations.splice(0);
                this.nextpage = true;
                await this.nextload();
                await this.reload();
            },
            Scroll: async function(){
                const document_h = document.documentElement.scrollHeight;
                const scroll_h = window.scrollY + document.documentElement.clientHeight;
                if(document_h - 50 < scroll_h){
                    await this.nextload();
                }
            },
            nextload: async function(){
                if(this.nextpage == true){
                    page++;
                    
                    let result = await GetModel("/api/Search",{
                        word: this.search_word,
                        page: page,
                    });
                    Convert_Datetime(result.data);
                    this.nextpage = result.data.nextpage;
                    result.data.Installations.forEach(x=>{
                        this.Installations.push(x);
                    });
                }
            },
            reload: async function(){
                while(this.nextpage == true && document.documentElement.clientHeight >= document.documentElement.scrollHeight){
                    await this.nextload();
                }
            }
        },
        async mounted(){   
            await this.reload();
            window.addEventListener("scroll", this.Scroll);
            console.log(this.nextpage);
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
}
init_model("/api/Search",{word: word,page: page},Run,err)