var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("list",{word: ""});
});

router.get("/Installation/:id",function(req,res,next){
  const id = req.params["id"]
  res.render("installation_view",{id: id,title: "AutoInstallaion Configs"})
});

router.get('/install-list',function(req, res, next) {
  let word = ""
  if(req.query.word != null){
    word = req.query.word;
  }
  res.render("list",{word: word});
});

router.get('/edit/:install_id', function(req, res, next) {
  const id = req.params["install_id"]
  res.render('InstallPlanEditView',{install_id:id});
});
module.exports = router;
