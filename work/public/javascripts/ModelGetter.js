async function GetModel(url,params){
    const result = await axios.get(url,{params: params});
    return result
}

async function POSTData(url,data){
    const result = await axios.post(url,data);
    return result;
}

function init_model(url,params,get_func,err_func){
    GetModel(url,params)
    .then(x=>{
        if(x.data.message == null){
            x.data.message = {
                error: '',
                success: '',
            }
        }
        else{
            if(x.data.message.error == null){
                x.data.message.error = ''
            }
            if(x.data.message.success == null){
                x.data.message.success = ''
            }
        }
        get_func(x)
    })
    .catch(err=>err_func(err));
}

//時刻変換
function convert_time(str){
    let parse = Date.parse(str);
    let date_obj = new Date(parse);
    return date_obj.toLocaleString()
}