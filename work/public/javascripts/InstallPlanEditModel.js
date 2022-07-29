function get_target(data,item){
    switch(item){
        case "ip_address":
            return data.ip_addresses;
        case "name_server":
            return data.name_servers;
        case "search_domain":
            return data.search_domains;
        case "route":
            return data.routes;
        case "package":
            return data.install_packages;
        case "late_commands":
            return data.late_commands;
        default:
            return nuil;
    }
}

function data_seach(data,key,word){
    let target = -1;
    data.forEach((value,index,arr) => {
        if(value[key] == word){
            target = index;
        }
    });
    return target;
}

function data_to_array(data,key){
    let output_arr = [];
    data.forEach((value,index,arr) => {
        output_arr.push(value[key]);
    });

    return output_arr;
}

function Enable_Submit_button(data,password_check = true){
    let submit = true;
    if(data.install_id.content == '' || data.install_id.validate != ''){
        submit = false;
    }

    if(data.hostname.content == '' || data.hostname.validate != ''){
        submit = false;
    }

    if(data.username.content == '' || data.username.validate != ''){
        submit = false;
    }

    if(password_check == true){
        if(data.password.content == '' || data.password.validate != ''){
            submit = false;
        }

        if(data.password_retype.content == '' || data.password_retype.validate != ''){
            submit = false;
        }
    }

    return submit;

}

function run(model){
    var ip_addrs = new Vue({
        el: '#app',
        data: model.data,
        methods: {
            col_add_btn: function(item) {
                let target_data = get_target(this,item);
                if(target_data == null){
                    return;
                }

                let number_index = data_to_array(target_data,"id").map(x => parseInt(x,10));
                let max = 0;
                if(number_index.length > 0){
                    max = Math.max.apply(null,number_index);
                }

                target_data.push({
                    id : max + 1,
                    address: "",
                    validate: ""
                });

            },
            col_del_btn: function(item,idx){
                let target_data = get_target(this,item);
                if(target_data == null){
                    return;
                }
                target = data_seach(target_data,"id",idx);

                if(target > -1){
                    target_data.splice(target,1);
                }
            },
            add_addr: function(){
                let number_index = data_to_array(this.ip_addresses,"id");
                let next_value = 0;
                if(number_index.length > 0){
                    next_value = Math.max.apply(null,number_index) + 1;
                }

                this.ip_addresses.push({
                    id: next_value,
                    address: "",
                    mask: "",
                    validate: {
                        address: "",
                        mask: ""
                    },
                });
            },
            add_route: function(){
                let number_index = data_to_array(this.routes,"id");
                let next_value = 0;
                if(number_index.length > 0){
                    next_value = Math.max.apply(null,number_index) + 1;
                }

                this.routes.push({
                    id: next_value,
                    network: "",
                    mask: "",
                    gateway: "",
                    metric: "",
                    validate: {
                        network: "",
                        gateway: "",
                        mask: "",
                        metric: ""
                    }
                });
            },
            add_package: function(){
                let number_index = data_to_array(this.install_packages,"id");
                let next_value = 0;
                if(number_index.length > 0){
                    next_value = Math.max.apply(null,number_index) + 1;
                }

                this.install_packages.push({
                    id: next_value,
                    package_name: "",
                    validate: ""
                });
            },

            add_command: function(){
                let number_index = data_to_array(this.late_commands,"id");
                let next_value = 0;
                if(number_index.length > 0){
                    next_value = Math.max.apply(null,number_index) + 1;
                }

                this.late_commands.push({
                    id: next_value,
                    command: "",
                    validate: ""
                });
            },

            submit: function(){
                axios.post("/api/apply/"+install_id,this.$data).then(function(res){
                    if(res.data.status == "OK"){
                        //this.$router.push(res.data.JumpPath)
                        window.location.href = res.data.JumpPath;
                    }
                    else{
                        console.log(res.data);
                    }
                }).catch((result)=>{
                    console.log(result);
                    if(result.response.status == 400){
                        const response = result.response.data;
                        this.install_id.validate = response.install_id.validate;
                        this.hostname.validate = response.hostname.validate;
                        this.username.validate = response.username.validate;
                        this.password.validate = response.password.validate;
                        this.password_retype.validate = response.password_retype.validate;
                        this.submit_disable = !Enable_Submit_button(this);
                        //this = result.response.data;
                    }
                    else{
                        this.message.error = result.message;
                    }
                });
            },

            //----------Validate-----------
            vfunc_install_id: function(){
                this.install_id.validate = validation(this.install_id.content,[
                    required,
                    ascii
                ]);
                this.submit_disable = !Enable_Submit_button(this);
            },

            vfunc_hostname: function(){
                this.hostname.validate = validation(this.hostname.content,[
                    required,
                    ascii,
                ]);
                this.submit_disable = !Enable_Submit_button(this);
            },

            vfunc_username: function(){
                this.username.validate = validation(this.username.content,[
                    required,
                    ascii
                ]);
                this.submit_disable = !Enable_Submit_button(this);
            },
            vfunc_timezone: function(){
                this.timezone.validate = validation(this.timezone.content,[
                    ascii
                ]);
            },
            vfunc_locale: function(){
                this.locale.validate = validation(this.locale.content,[
                    ascii
                ]);
            },

            vfunc_password: function(){
                this.password.validate = validation(this.password.content,[
                    required,
                    ascii,
                    Char_length(8,0),
                    equel(this.password_retype.content,"retypeと一致していません。")
                ]);

                this.password_retype.validate = validation(this.password_retype.content,[
                    equel(this.password.content,"passwordと一致しません。"),
                    ascii,
                    Char_length(8,0),
                ]);
                this.submit_disable = !Enable_Submit_button(this);
            },

            vfunc_retype: function(){
                this.password_retype.validate = validation(this.password_retype.content,[
                    required,
                    ascii,
                    Char_length(8,0),
                    equel(this.password.content,"passwordと一致しません。")
                ]);

                this.password.validate = validation(this.password.content,[
                    equel(this.password_retype.content,"retypeと一致しません。"),
                    ascii,
                    Char_length(8,0),
                ]);
                this.submit_disable = !Enable_Submit_button(this);
            },

            vfunc_package: function(id){
                let target = data_seach(this.install_packages,"id",id);
                this.install_packages[target].validate = validation(this.install_packages[target].package_name,[
                    ascii
                ]);
            },

            vfunc_late_commands: function(id){
                let target = data_seach(this.late_commands,"id",id);
                this.late_commands[target].validate = validation(this.late_commands[target].command,[
                    ascii
                ]);
            },

            v_func_ipaddr: function(id){
                let target = data_seach(this.ip_addresses,"id",id);
                this.ip_addresses[target].validate.address = validation(this.ip_addresses[target].address,[
                    ipaddr
                ]);
            },
            v_func_ipmask: function(id){
                let target = data_seach(this.ip_addresses,"id",id);
                this.ip_addresses[target].validate.mask = validation(this.ip_addresses[target].mask,[
                    isdigit(0,128)
                ]);
            },

            vfunc_defaultgw: function(){
                this.default_gateway.validate = validation(this.default_gateway.content,[
                    ipaddr
                ]);
            },
            vfunc_nameserver: function(id){
                let target = data_seach(this.name_servers,"id",id);
                this.name_servers[target].validate = validation(this.name_servers[target].address,[
                    ipaddr
                ])
            },
            vfunc_searchdomain: function(id){
                let target = data_seach(this.search_domains,"id",id);
                this.search_domains[target].validate = validation(this.search_domains[target].address,[
                    ipaddr
                ])
            },

            //routing
            vfunc_route_network: function(id){
                let target = data_seach(this.routes,"id",id);
                this.routes[target].validate.network = validation(this.routes[target].network,[
                    ipaddr
                ])
            },
            vfunc_route_mask: function(id){
                let target = data_seach(this.routes,"id",id);
                this.routes[target].validate.mask = validation(this.routes[target].mask,[
                    isdigit(0,128)
                ])
            },
            vfunc_route_gateway: function(id){
                let target = data_seach(this.routes,"id",id);
                this.routes[target].validate.gateway = validation(this.routes[target].gateway,[
                    ipaddr
                ])
            },
            vfunc_route_metric: function(id){
                let target = data_seach(this.routes,"id",id);
                this.routes[target].validate.metric = validation(this.routes[target].metric,[
                    isdigit(0,null)
                ])
            },


        },
        computed:{

            title: function(){
                if(this.install_id.content == null || this.install_id.content == ""){
                    return "noname"
                }
                else{
                    return this.install_id.content
                }
            },
            //----------------validate-------------
            validateclass_install_id: function(){
                return this.install_id.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_hostname: function(){
                return this.hostname.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_username: function(){
                return this.username.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_timezone: function(){
                return this.timezone.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_locale: function(){
                return this.locale.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_password: function(){
                return this.password.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_password_retype: function(){
                return this.password_retype.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_package: function(){ 
                return (id)=>{
                    let target = data_seach(this.install_packages,"id",id);
                    return this.install_packages[target].validate == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },
            validateclass_late_command: function(){ 
                return (id)=>{
                    let target = data_seach(this.late_commands,"id",id);
                    return this.late_commands[target].validate == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_ipaddr: function(){
                return (id)=>{
                    let target = data_seach(this.ip_addresses,"id",id);
                    return this.ip_addresses[target].validate.address == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_ipmask: function(){
                return (id)=>{
                    let target = data_seach(this.ip_addresses,"id",id);
                    return this.ip_addresses[target].validate.mask == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_defaultgw: function(){
                return this.default_gateway.validate == '' ? "form-control" : "form-control is-invalid"
            },
            validateclass_nameserver: function(){
                return (id)=>{
                    let target = data_seach(this.name_servers,"id",id);
                    return this.name_servers[target].validate == '' ? "form-control" : "form-control is-invalid"
                }
            },
            validateclass_searchdomain: function(){
                return (id)=>{
                    let target = data_seach(this.search_domains,"id",id);
                    return this.search_domains[target].validate == '' ? "form-control" : "form-control is-invalid"
                }
            },

            // route
            validateclass_route_network: function(){
                return (id) =>{
                    let target = data_seach(this.routes,"id",id); 
                    return this.routes[target].validate.network == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_route_mask: function(){
                return (id) =>{
                    let target = data_seach(this.routes,"id",id); 
                    return this.routes[target].validate.mask == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_route_gateway: function(){
                return (id) =>{
                    let target = data_seach(this.routes,"id",id); 
                    return this.routes[target].validate.gateway == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            },

            validateclass_route_metric: function(){
                return (id) =>{
                    let target = data_seach(this.routes,"id",id); 
                    return this.routes[target].validate.metric == '' ? "form-control form-control-sm" : "form-control form-control-sm is-invalid"
                }
            }

        },
        created(){
            this.submit_disable = true;
        },
        mounted(){
            if(install_id != 'new'){
                this.submit_disable = !Enable_Submit_button(this,false);
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
                error: "データが見つかりません"
            }
        }
    })
}

init_model("/api/edit_model/"+install_id,{},run,err);