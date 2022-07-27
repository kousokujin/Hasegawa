var express = require('express');
var router = express.Router();
var db = require("../models/index");
const { Op, InvalidConnectionError } = require("sequelize");
const crypto = require('crypto');
const validation = require('../lib/validation');
var unixcrypt = require("unixcrypt");

const Editor_Model_New = {
    //---- general ----
    install_id: {
        content: "",
        validate: ""
    },
    hostname: {
        content: "",
        validate: ""
    },
    username: {
        content: "",
        validate: "",
    },
    password: {
        content: "",
        validate: "",
    },
    password_retype: {
        content: "",
        validate: "",
    },
    enable_ssh: false,
    install_packages:[
        {
            id: 0,
            package_name: "",
            validate: "",
        }
    ],

    //---- Network ----
    default_gateway: {
        content: "",
        validate: ""
    },
    ip_addresses: [
        {
            id : 0,
            address: "",
            mask: "",
            validate: {
                address: "",
                mask: ""
            },
        }
    ],

    name_servers: [
        {
            id: 0,
            address: "",
            validate: "",
        }
    ],

    search_domains: [
        {
            id: 0,
            address: "",
            validate: "",
        }
    ],

    //---- routes ----
    routes: [

    ],
}

router.get('/installation/:id', function(req, res, next) {
    const id = req.params["id"];
    GetInstallations(id,{
        exist: function(data){
            const csrf = req.csrfToken();
            res.json({...data,...{_csrf: csrf}});
        },
        nodata: function(){
            const response = {
                "status": "err",
                "discription": "Data not find"
            };
            res.status(404).json(response);
        }
    })
});

router.get("/Search",function(req,res,next){
    let query = {}
    let word = "";
    if(req.query.word != null && req.query.word != ""){
        query['install_id'] = {
            [Op.like] : '%' + req.query.word + '%'
        }
        word = req.query.word;
    }
    db.installations.findAll({where: query}).then((result)=>{
        var datas = []
        result.forEach((value,index,array)=>{
            datas.push(value.dataValues);
        });
        datas.forEach((value,index,array)=>{
            datas[index].password = "";
        })
        res.json({
            Installations: datas,
            search_word: word
        });
    }).catch((err)=>{
        res.status(500).json(err);
    })
});

router.get("/edit_model/:id",function(req,res,next){
    const id = req.params["id"];
    const csrf = req.csrfToken();
    if(id == 'new'){
        res.json({...Editor_Model_New,...{_csrf: csrf}});
    }
    else{
        GetInstallations(id,{
            exist: function(data){
                const fix_keys = ['install_id','hostname','username'];
                fix_keys.forEach((value,index,array)=>{
                    data[value] = {
                        content: data[value],
                        validate: ""
                    };
                });

                data["password"] = {
                    content: "",
                    validate: "",
                };
                data["password_retype"] = {
                    content: "",
                    validate: ""
                }

                let default_gw_arr = data.routes.filter(x=> x.network == 'default');
                if(default_gw_arr.length > 0){
                    data['default_gateway'] = {
                        content: default_gw_arr[0].gateway,
                        validate: ""
                    };
                    data['routes'] = data.routes.filter(x => x.network != 'default');
                    data['routes'].forEach(value=>{
                        value['validate'] = {
                            "network": "",
                            "mask": "",
                            "gateway": "",
                            "metric": "",
                        };
                    });
                }else{
                    data['default_gateway'] = {
                        content: '',
                        validate: "",
                    }
                }

                if(data.ip_addresses.length == 0){
                    data.ip_addresses.push({
                        id: 0,
                        address: "",
                        mask: "",
                        validate: {
                            address: "",
                            mask: "",
                        }
                    });
                }
                else{
                    data.ip_addresses.forEach((value,index,array)=>{
                        value["validate"] = {
                            address: "",
                            mask: "",
                        }
                    });
                }

                if(data.search_domains.length == 0){
                    data.search_domains.push({
                        id: 0,
                        address: "",
                        validate: "",
                    });
                }
                else{
                    data.search_domains.forEach((value,index,array)=>{
                        value['validate'] = "";
                    });
                }

                if(data.name_servers.length == 0){
                    data.name_servers.push({
                        id: 0,
                        address: "",
                        validate: "",
                    });
                }
                else{
                    data.name_servers.forEach((value,index,array)=>{
                        value['validate'] = "";
                    });
                }

                if(data.install_packages.length == 0){
                    data.install_packages.push({
                        id: 0,
                        package_name: "",
                        validate: "",
                    });
                }
                else{
                    data.install_packages.forEach((value,index,array)=>{
                        value['validate'] = "";
                    })
                }
                data['_csrf'] = csrf;
                res.json(data);
            },
            nodata: function(){
                const response = {
                    "status": "err",
                    "discription": "Data not find"
                };
                res.status(404).json(response);
            }
        })
    }
});

router.post("/apply/:id",async function(req,res,next){
    const model = req.body;
    const id = req.params["id"];
    const after_func = {
        then: function(result){
            const response = {
                status: "OK",
                installation_id: result.id,
                JumpPath: ("/Installation/" + result.id)
            }
            res.json(response);
        },
        err: function(result){
            res.status(400).json(result);
        }
    }

    if(id == "new"){
        let in_valid = validation.methods.validate_required_model(model);
        //本当はバリデーションでやりたい
        const exist_id = await exist_install_id(model.install_id.content);
        if(exist_id == true){
            model.install_id.validate = "すでに存在するinstall_idです"
            in_valid = true;
        }

        if(in_valid == true){
            res.status(400).json(model);
        }
        else{
            validation.methods.validate_model(model);
            validation.methods.validate_remove(model);
            NewInstallation_Regist(model,after_func);
        }
    }
    else{
        let validate_result = null;
        if(model.password.content == '' || model.password_retype.content == ''){
            validate_result =  validation.methods.validate_required_model(model,false);
        }
        else{
            validate_result =  validation.methods.validate_required_model(model,true);
        }
        if(validate_result == true){
            res.status(400).json(model);
        }
        else{
            validation.methods.validate_model(model);
            validation.methods.validate_remove(model);
            ModifyInstallation(model,after_func);
        }
    }
});

router.post("/delete",function(req,res,next){
    const install_id = req.body.install_id;

    db.installations.findOne({where: {install_id: install_id}}).then((result)=>{
        if(result == null){
            const response = {
                "status": "err",
                "discription": "Data not find"
            };
            res.status(404).json(response);
        }

        const db_name = ['ipaddrs','NameServers','SearchDomains','routings','InstallPackeages'];
        const id = result.dataValues.id;
        db_name.forEach((value,index,array)=>{
            db[value].destroy({
                where: {
                    installation_id: id
                }
            });
        });

        result.destroy();
    });
    
});

function NewInstallation_Regist(model,after_func){
    if(model.install_id.content == 'new'){
        const response = {
            "status": "err",
            "discription": "new is not forbidden"
        };
        after_func.err(response);
        return;
    }

    let password = model.password.content;
    let password_hash = ToHash(password);

    db.installations.create({
        install_id: model.install_id.content,
        hostname: model.hostname.content,
        username: model.username.content,
        password: password_hash.content,
        ssh: model.enable_ssh,
      }).then((result) => {         
        const ModelOutput = ModelToDB(result['id'],model);
        const new_data = ModelOutput[0];
        const db_name = ModelOutput[1];
        
        //DB書き込み
        let tasks = []
        Object.keys(new_data).forEach((value,index,array)=>{
            if(new_data[value].length > 0){
                tasks.push(db[db_name[index]].bulkCreate(new_data[value]));
            }
        });

        Promise.all(tasks).then(x=>{
            after_func.then(result);
        });
      }).catch((err)=>{
        console.log(err);
      });
}

function ModifyInstallation(model,after_func){
    const id = model.id;
    return db.installations.findOne({where: {id: id}}).then((result)=>{
        if(result == null){
            after_func.nodata();
            return;
        }

        result.install_id = model.install_id.content;
        result.hostname = model.hostname.content;
        result.username = model.username.content;
        result.ssh = model.enable_ssh;

        if(model.password.content != ''){
            console.log("password-modify");
            let hash_pass = ToHash(model.password.content);
            result.password = hash_pass;
        }

        result.save();

        const ModelOutput = ModelToDB(id,model);
        const new_data = ModelOutput[0];
        const db_name = ModelOutput[1];
        
        //DB書き込み
        let tasks = []
        Object.keys(new_data).forEach((value,index,array)=>{
            //一回delete
            db[db_name[index]].destroy({
                where: {
                    installation_id: id
                }
            });

            if(new_data[value].length > 0){
                tasks.push(db[db_name[index]].bulkCreate(new_data[value]));
            }
        });

        Promise.all(tasks).then(x=>{
            after_func.then(result);
        })
    });
}

function ModelToDB(id,model){
    const item_list = ['ipaddr','nameservers','searchdomain','routing_table','install_packages'];
    const db_names = ['ipaddrs','NameServers','SearchDomains','routings','InstallPackeages'];

    let new_data = {};

    item_list.forEach((value,index,array)=>{
        new_data[value] = []
    })

    // ip address
    model.ip_addresses.forEach((value,index,arr) => {
        if(value['address'] != '' && value['mask'] != ''){
            let item = {
                installation_id: id,
                address: value['address'],
                mask: value['mask']
            }
            new_data.ipaddr.push(item);
        }
    });

    // nameserver
    model.name_servers.forEach((value,index,arr) => {
    if(value['address'] != ''){
        let item = {
            installation_id: id,
            address: value['address'],
        }
        new_data.nameservers.push(item);
    }
    });

    // searchdomain
    model.search_domains.forEach((value,index,arr) => {
        if(value['address'] != ''){
            let item = {
                installation_id: id,
                address: value['address'],
            }
            new_data.searchdomain.push(item);
        }
    });

    // routing
    if(model.default_gateway.content.length > 0){
        let gw = {
            installation_id: id,
            network: "default",
            gateway: model.default_gateway.content,
        }
        new_data.routing_table.push(gw);
    }
    model.routes.forEach((value,index,arr) => {
        if(value["network"] != '' && value["gateway"] != '' && value['mask'] != ''){
            let item = {
                    installation_id: id,
                    network: value["network"],
                    mask: value["mask"],
                    gateway: value["gateway"],
                }

                if(value["metric"] != ''){
                item.metric = value["metric"]
            }
            new_data.routing_table.push(item);
        }
    });
    // install package
    model.install_packages.forEach((value,index,arr)=>{
        if(value['package_name'] != ''){
            let item = {
                installation_id: id,
                package_name: value['package_name']
            }
            new_data.install_packages.push(item);
        }
    });

    return [new_data,db_names];
}

function GetInstallations(request_id,after_func){
    return db.installations.findOne({where: {id: request_id}}).then(function(installation_result){
        if(installation_result == null){
            after_func.nodata();
            return;
        }
        const id = installation_result.dataValues.id;
        const task = Promise.all([
            db.ipaddrs.findAll({where: {installation_id: id}}),
            db.routings.findAll({where: {installation_id: id}}),
            db.SearchDomains.findAll({where: {installation_id: id}}),
            db.NameServers.findAll({where: {installation_id: id}}),
            db.InstallPackeages.findAll({where: {installation_id: id}}),
        ]).then((result) => {
            const attributes = ['ip_addresses','routes','search_domains','name_servers','install_packages']
            const install = installation_result.dataValues;
            let output_data = {
                id: install.id,
                install_id: install.install_id,
                hostname: install.hostname,
                username: install.username,
                password: install.password,
                enable_ssh: install.ssh,
                createdAt: install.createdAt,
                updatedAt: install.updatedAt,
            };

            result.forEach((value,index,array) => {
                output_data[attributes[index]] = [];
                value.forEach((value2,index2,array2) => {
                    output_data[attributes[index]].push(value2.dataValues);
                });
            });
            after_func.exist(output_data);
            Promise.resolve(output_data);
        })
        Promise.resolve(task);        
    });
}

async function exist_install_id(install_id){
    const exist = await db.installations.findOne({where: {install_id: install_id}});
    if(exist == null){
        return false;
    }
    else{
        return  true;
    }
}

function ToHash(str){
    return unixcrypt.encrypt(str);

    //return crypto.createHash("sha512").update(str,'utf8').digest('base64url');
}

module.exports = router;