var express = require('express');
var router = express.Router();
var db = require("../models/index");
const YAML = require('yaml')
const url = require('url');

/*
=============================
/api/autoinstall
=============================
*/
router.get("/:install_id/user-data",async function(req,res,next){
    const install_id = req.params["install_id"];
    const result = await User_data_json(install_id,req);
    
    var yaml_str = "#cloud-config";
    yaml_str = yaml_str + "\n" + YAML.stringify(result);
    yaml_str = yaml_str.replace(/\'/g,"");
    yaml_str = yaml_str.replace(/<s>/g," ");
    

    res.set('content-type', 'text/plain');
    res.send(yaml_str);
    //res.json(result);
});

router.get("/:install_id/meta-data",(req,res,next)=>{
    res.set('content-type', 'text/plain');
    res.send("");
})

router.get("/:install_id/network",async function(req,res,next){
    const install_id = req.params["install_id"];
    const result = await network_config_json(install_id);
    const toyaml = YAML.stringify(result);

    res.set('content-type', 'text/plain');
    res.send(toyaml);
});

async function User_data_json(install_id,req){
    const result = await db.installations.findOne({where: {install_id: install_id}});
    if(result == null){
        return null;
    }

    const id = result.dataValues.id;
    const task = await Promise.all([
        db.InstallPackeages.findAll({where: {installation_id: id}}),
        db.late_commands.findAll({where: {installation_id: id}}),
    ]);
    
    let install_package = [];
    task[0].forEach((value,index,array)=>{
        install_package.push(value.dataValues.package_name);
    });

    //network wget
    const fullUrl = url.format({
        protocol: req.protocol,
        host: req.get('Host'),
        pathname: "/api/auto-install/"+install_id+"/network",
    });

    let commands = [];
    
    if(await isNetworkConfig(id) == true){
        commands.push("wget -O /target/etc/netplan/90-network.yaml " + fullUrl);
    }

    task[1].forEach((value,index,array)=>{
        commands.push(value.dataValues.command);
    });

    const ssh = result.dataValues.ssh == true ? "yes" : "no";

    let user_data_dict = {
        "autoinstall": {
            "version": 1,
            "identity": {
                "hostname": String("\"" + result.dataValues.hostname + "\""),
                "password": String("\"" + result.dataValues.password + "\""),
                "username": String("\"" + result.dataValues.username + "\""),
            },
            "ssh":{
                "install-server": ssh
            }
        }
    }

    if(install_package.length > 0){
        user_data_dict.autoinstall['packages'] = install_package;
    }

    if(commands.length > 0){
        user_data_dict.autoinstall['late-commands'] = [];
        commands.forEach(x=>{
            user_data_dict.autoinstall['late-commands'].push("\"" + x + "\"");
        });
    }

    if(result.dataValues.timezone != null && result.dataValues.timezone != ''){
        user_data_dict.autoinstall['user-data'] = {
            "timezone": "\"" + result.dataValues.timezone + "\"",
        }
    }

    if(result.dataValues.locale != null && result.dataValues.locale != ''){
        user_data_dict['locale'] = "\"" + result.dataValues.locale + "\"";
    }

    return user_data_dict;
}

async function network_config_json(install_id){
    const result = await db.installations.findOne({where: {install_id: install_id}});
    if(result == null){
        return null;
    }
    const id = result.dataValues.id;
    
    const network = await GetNetworks(id);
    
    let network_dict = {
        "network": {
            "ethernets": {
                "eth0": {}
            },
            "version": 2
        }
    }

    if(network.SearchDomains.length > 0 || network.NameServers.length > 0){
        network_dict.network.ethernets.eth0['nameservers'] = {}
        if(network.NameServers.length > 0){
            network_dict.network.ethernets.eth0.nameservers["addresses"] = network.NameServers;
        }
        if(network.SearchDomains.length > 0){
            network_dict.network.ethernets.eth0.nameservers['search'] = network.SearchDomains;
        }
    }

    if(network.ipaddrs.length > 0){
        network_dict.network.ethernets.eth0["addresses"] = network.ipaddrs;
    }

    if(network.routings.length > 0){
        network_dict.network.ethernets.eth0["routes"] = network.routings;
    }

    return network_dict;
}

async function GetNetworks(id){
    const item_list = ['ipaddrs','routings','SearchDomains','NameServers'];

    let que = [];
    item_list.forEach(x=>{
        que.push(db[x].findAll({where: {installation_id: id}}));
    });

    const task = await Promise.all(que);
    let output = {};

    item_list.forEach((value,index,array)=>{
        output[value] = [];
        if(value == 'ipaddrs'){
            task[index].forEach(x=>{
                const ip = x.dataValues.address;
                const mask = x.dataValues.mask;
                output[value].push(ip+"/"+mask);
            });
        }
        if(value == "routings"){
            task[index].forEach(x=>{
                const network = x.dataValues.network;
                const mask = x.dataValues.mask;
                const gw = x.dataValues.gateway;
                const metric = x.dataValues.metric;

                let network_str = "";
                if(mask == null){
                    network_str = network;
                }
                else{
                    network_str = (network + "/" + mask)
                }

                let data = {
                    "to": network_str,
                    "via": gw
                }
                if(metric != null && metric != ""){
                    data["metric"] = metric;
                }

                output[value].push(data);
            });
        }
        if(value == "SearchDomains"){
            task[index].forEach(x=>{
                output[value].push(x.dataValues.address);
            });
        }
        if(value == "NameServers"){
            task[index].forEach(x=>{
                output[value].push(x.dataValues.address);
            });
        }
    });

    return output;
}

async function isNetworkConfig(id){
    const result = await GetNetworks(id);
    const count = result.ipaddrs.length + result.routings.length + result.SearchDomains.length + result.NameServers.length;

    return count > 0 ? true : false;
}
module.exports = router;