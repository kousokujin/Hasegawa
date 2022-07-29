function Run(model){
    Convert_Datetime(model.data);
    var ip_addrs = new Vue({
        el: '#app',
        data: model.data,
        methods: {
            delete_btn: function(){
                const data = {
                    id: this.$data.id,
                    _csrf: this.$data._csrf,
                }
                POSTData('/api/delete',data);
                window.location.href = "/install-list";
            }
        },
    });
}

function err(result){
    var err_model = new Vue({
        el: '#app',
        data: {
            install_id: null,
            message: {
                error: "データが見つかりません"
            }
        }
    })
}

function Convert_Datetime(model){
    model.createdAt = convert_time(model.createdAt);
    model.updatedAt = convert_time(model.updatedAt);
    console.log(model);
}
init_model("/api/installation/"+id,{},Run,err);