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
    //console.log(result);
    if(result == null){
        return null;
    }

    const id = result.dataValues.id;
    const install_package_db = await db.InstallPackeages.findAll({where: {installation_id: id}});
    let install_package = [];
    install_package_db.forEach((value,index,array)=>{
        install_package.push(value.dataValues.package_name);
    })

    const ssh = result.dataValues.ssh == true ? "yes" : "no";


    //network wget
    const fullUrl = url.format({
        protocol: req.protocol,
        host: req.get('Host'),
        pathname: "/api/auto-install/"+install_id+"/network",
    });
    let commands = [
        String("\"wget -O /target/etc/netplan/90-network.yaml " + fullUrl + "\"")
    ];

    const user_data_dict = {
        "autoinstall": {
            "version": 1,
            "identity": {
                "hostname": String("\"" + result.dataValues.hostname + "\""),
                "password": String("\"" + result.dataValues.password + "\""),
                "username": String("\"" + result.dataValues.username + "\""),
            },
            "ssh":{
                "install-server": ssh
            },
            "packages": install_package,
            "user-data":{
                "timezone": "\"Asia/Tokyo\"",
            },
            "late-commands":  commands
        }
    }
    return user_data_dict;
}

async function network_config_json(install_id){
    const result = await db.installations.findOne({where: {install_id: install_id}});
    if(result == null){
        return null;
    }
    const id = result.dataValues.id;

    const task = await Promise.all([
        db.ipaddrs.findAll({where: {installation_id: id}}),
        db.routings.findAll({where: {installation_id: id}}),
        db.SearchDomains.findAll({where: {installation_id: id}}),
        db.NameServers.findAll({where: {installation_id: id}}),
    ]);

    let addresses = [];
    task[0].forEach((value,index,array)=>{
        const ip = value.dataValues.address;
        const mask = value.dataValues.mask;
        addresses.push(ip+"/"+mask);
    })

    let nameservers = []
    task[3].forEach((value,index,array)=>{
        const ip = value.dataValues.address;
        nameservers.push(ip);
    });

    let searchdomains = []
    task[2].forEach((value,index,array)=>{
        const ip = value.dataValues.address;
        searchdomains.push(ip);
    });

    let routes = []
    task[1].forEach((value,index,array)=>{
        const network = value.dataValues.network;
        const mask = value.dataValues.mask;
        const gw = value.dataValues.gateway;
        const metric = value.dataValues.metric;

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

        routes.push(data);
    })

    const network_dict = {
        "network": {
            "ethernets": {
                "eth0": {
                    "addresses":addresses,
                    "nameservers":{
                        "addresses": nameservers,
                        "search": searchdomains
                    },
                    "routes": routes
                }
            }
        }
    }

    return network_dict;

}

    
    /*
    then(function(installation_result){
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
    */
module.exports = router;