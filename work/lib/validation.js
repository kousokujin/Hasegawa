var db = require("../models/index");

function validation(input,validates){
    let output = "";
    validates.forEach(x => {
        if(output == ""){
            const result = x(input);
            if(result.status == false){
                output = result.message;
            }
        }
    });
    return output;
}

//--------------validations--------------

function required(input){
    if(input == null || input == ""){
        return {status: false,message: "この項目は必須項目です。"}
    }
    return {status: true};
}

function equel(str,invalid_message){
    return function(input){
        if(str != input){
            return {status: false,message:invalid_message}
        }
        return {status: true};
    }
}

function ascii(str){
    str = (str==null)?"":str;
    if(str.match(/^[\x20-\x7e]*$/)){
        return  {status: true};
    }
    else{
        return  {status: false,message: "半角英数で入力してください。"};
    }
}

function isdigit(min,max){
    return function(str){
        if(isNaN(str)){
            return {status: false, message: "数字を入力してください。"}
        }

        let convert_number = Number(str);

        if(min != null && convert_number < min){
            return {status:false, message: (min+"以上の数字を入れてください。")}
        }
        if(max != null && convert_number > max){
            return {status:false, message: (max + "以下の数字を入力してください。")}
        }

        return {status: true}
    }
}

function ipaddr(str){
    const ipv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
    if(ipv4.test(str) || ipv6.test(str)){
        return {status: true}
    }
    else{
        return {status: false, message: "IPアドレスを入力してください。"}
    }
}

function Char_length(min,max){
    if(max < 1){
        return function(str){
            if(str.length < min){
                return {status: false,message: (min+"文字以上入力してください。")}
            }
            return {status: true};
        }
    }
    else{
        return function(str){
            if(str.length < min){
                return {status: false,message: (min+"文字以上入力してください。")}
            }
            if(str.length > max){
                return {status: false,message: (max+"文字以内で入力してください。")}
            }

            return {status: true};
        }
    }
}

function validate_required_model(model,password_validate = true){
    let result = false;
    
    model.install_id.validate = validation(model.install_id.content,[
        required,
        ascii,
    ]);

    if(model.install_id.validate != ''){
        result = true;
    }

    model.hostname.validate = validation(model.hostname.content,[
        required,
        ascii,
    ]);
    if(model.hostname.validate != ''){
        result = true;
    }

    model.username.validate = validation(model.username.content,[
        required,
        ascii
    ]);
    if(model.username.validate != ''){
        result = true;
    }

    if(password_validate == true){
        model.password.validate = validation(model.password.content,[
            required,
            ascii,
            Char_length(8,0),
            equel(model.password_retype.content,"retypeと一致していません。")
        ]);
        if(model.password.validate != ''){
            result = true;
        }

        model.password_retype.validate = validation(model.password_retype.content,[
            required,
            ascii,
            Char_length(8,0),
            equel(model.password.content,"passwordと一致しません。"),
        ]);
        if(model.password_retype.validate != ''){
            result = true;
        }
    }

    return result;
}

function validate_model(model){
    model.timezone.validate = validation(model.timezone.content,[ascii]);
    model.locale.validate = validation(model.locale.content,[ascii]);
    
    model.install_packages.forEach(value=>{
        value.validate = validation(value.package_name,[ascii]);
    });

    model.late_commands.forEach(value=>{
        value.validate = validation(value.command,[ascii]);
    })

    model.default_gateway.validate = validation(model.default_gateway.content,[ipaddr]);
    
    model.ip_addresses.forEach(value=>{
        value.validate.address = validation(value.address,[ipaddr]);
        value.validate.mask = validation(value.mask,[isdigit(0,128)]);
    })

    model.name_servers.forEach(value=>{
        value.validate = validation(value.address,[ipaddr]);
    });

    model.search_domains.forEach(value=>{
        value.validate = validation(value.address,[ipaddr]);
    });

    model.routes.forEach(value=>{
        value.validate.network = validation(value.network,[ipaddr]);
        value.validate.gateway = validation(value.gateway,[ipaddr]);
        value.validate.mask = validation(value.mask,[isdigit(0,128)]);
        value.validate.metric = validation(value.metric,[isdigit(0,null)]);
    });
}

function validate_remove(model){
    if(model.timezone.validate != ""){
        model.timezone.content = "";
    }

    if(model.locale.validate != ""){
        model.locale.content = "";
    }

    model.install_packages = model.install_packages.filter(x=>(
        x.package_name != "" && x.validate == ""
    ));

    model.late_commands = model.late_commands.filter(x=>(
        x.command != "" && x.validate == ""
    ));
    
    if(model.default_gateway.validate != ''){
        model.default_gateway.content = '';
    }

    model.ip_addresses = model.ip_addresses.filter(x=>(
        x.address != '' &&
        x.mask != '' &&
        x.validate.address == '' &&
        x.validate.mask == ''
    ));

    model.name_servers = model.name_servers.filter(x=>(
        x.address != '' && x.validate == ''
    ));

    model.search_domains = model.search_domains.filter(x=>(
        x.address != '' && x.validate == ''
    ));

    model.routes = model.routes.filter(x=>(
        x.network != '' &&
        x.mask != '' &&
        x.gateway != '' &&
        x.validate.network == '' &&
        x.validate.mask == '' &&
        x.validate.gateway == '' &&
        x.validate.metric == ''
    ));
}

module.exports = {
    methods: {
        validate_required_model: validate_required_model,
        validate_model : validate_model,
        validate_remove : validate_remove
    }
}