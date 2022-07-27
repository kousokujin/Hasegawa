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