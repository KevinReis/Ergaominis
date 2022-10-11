
const express = require("express");  // carregar o express
const app = express();// criando o app com funções express
const bodyParser = require("body-parser"); // carregando o body-parser para tradução sequelize
const knex = require("./database/database");
const lodash= require("lodash");

const bcrypt = require('bcryptjs');
const session = require("express-session");





// Estou dizendo para o Express usar o EJS como View engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(session({
    secret: "backend", cookie:{maxAge:36000000}
}))



app.get("/", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("login", {cadastrar:0})
})


app.get("/telaloginadm",async(req, res) => {
  
    res.render("login",{
        cadastrar:2
      })

})


   // Rota login admin
   app.post("/loginadm",async(req, res) => {
     
    let usuario = req.body.usuario; // recebendo o que o usuário digitou
    let senha = req.body.senha;
    
    //verificar se os campos não estão vazios
   if((usuario)&&(senha)){
    try {
        
        let user= await knex("usuario").where("email",usuario)
        if(user[0]!=undefined){
            //let teste = bcrypt.compareSync(senha,user[0].senha);
            if(user[0].email==usuario&&user[0].senha==senha){// teste de usuário e senha
                let salt = bcrypt.genSaltSync(10)
                let token = bcrypt.hashSync(usuario,salt)
                //let token = jwt.sign(usuario,"teste")
                req.session.dados = {usuario:usuario,
                                      token:token}
                    
                await knex("usuario").where("email",usuario).update({
                     token:token
                })                                          
                res.render("login",{cadastrar:1})
            }else {
                  res.render("login",{cadastrar:0})
            } 
         
         }else 
         res.render("login",{ // se user nao retornou nada voltar para a tela de login
           cadastrar:0 // continuamos na tela de login
         
         })
        
       } catch (error) {
        res.render("login",{cadastrar:0})
       }

}else {res.render("login",{
        cadastrar:0
       })}  //se usuário ou senha vazio voltar tela login
})




 // Rota login 
 app.post("/login",async(req, res) => {
    let usuario = req.body.usuario; // recebendo o que o usuário digitou
    let senha = req.body.senha;
    //verificar se os campos não estão vazios
   if((usuario)&&(senha)){


    try {
        let user= await knex("usuario").where("email",usuario)
        if(user[0]!=""){
            let teste = bcrypt.compareSync(senha,user[0].senha);
            if(user[0].email==usuario&&teste==true){// teste de usuário e senha
                let salt = bcrypt.genSaltSync(10)
                let token = bcrypt.hashSync(usuario,salt)
                //let token = jwt.sign(usuario,"teste")
                req.session.dados = {usuario:usuario,
                                      token:token}
                    
                await knex("usuario").where("email",usuario).update({
                     token:token
                })                                          
                
                /*res.render("clientes",{modo:modo,user:resposta,usuario:usuario})*/
                res.render("erga",{usuario:usuario})

            }else {
                  res.render("login",{ // se user nao retornou nada voltar para a tela de login
                  cadastrar:0 // continuamos na tela de login
                  })
            } 
         
         }else res.render("login",{ // se user nao retornou nada voltar para a tela de login
           cadastrar:0 // continuamos na tela de login
         })
        
       } catch (error) {
        res.render("login",{cadastrar:0})
       }
}else  res.render("login",{cadastrar:0})
})


//rota cadastrar
app.post("/cadastro",async (req, res) => {
    //done by KR 24/09/2022
    let usuario = req.body.usuario;
    let senha = req.body.senha;
    let senha2 = req.body.senha2;
    if(((usuario)&&(senha)&&(senha2))&&(senha==senha2)){

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(senha,salt)
        let token = bcrypt.hashSync(usuario,salt)

        try {
            let user= await knex("usuario").where("email",usuario)
            
            if(user[0]!=undefined){
                res.redirect("/") 
            }else {
                let novo = [{
                           email:usuario,
                           senha:hash,
                           token:token
                            }]
       
            await knex.insert(novo).into('usuario')
            res.redirect("/")
            }
            
           } catch (error) {
            res.redirect("/")
           }
         
    }else {
        res.redirect("/")
          }
})



















app.get("/erga", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("erga")
})

app.get("/about", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("about")
})

app.get("/contact", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("contact")
})

app.get("/courses", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("courses")
})

app.get("/camera", (req, res) => { //quando o servidor for requisitado arquivo login é chamado

    res.render("camera")
})

//servidor
app.listen(process.env.PORT ||  8181, () => { console.log("App rodando!"); })