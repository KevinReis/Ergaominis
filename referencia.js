//se copiar o projeto, rodar:
// npm init
//npm install express --save
//npm install ejs --save
//npm install body-parser --save
//npm install sequilize mysql2
//npm install nodemon
//npm install --save bcryptjs
//npm install express-session --save

//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';

//SET GLOBAL time_zone = '-03:00'; ajustar o relogio do mysql

//Nessa versão para tratamento de usuário, vamos adicionar o campo email nas pergunta e respostas para salvar o autor da pergunta e respostas, vamos adicionar também o arquivo database, module Usuario com atributos email e senha, criar novo arquivo de login e alterar as rotas. separando a tela de login quando for novo cadastro ou login


const express = require("express");  // carregar o express
const app = express();// criando o app com funções express
const bodyParser = require("body-parser"); // carregando o body-parser para tradução sequelize
const knex = require("./database/database");

const bcrypt = require('bcryptjs');
const session = require("express-session");

// Estou dizendo para o Express usar o EJS como View engine
app.set('view engine','ejs');
app.use(express.static('public'));
// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(session({
    secret: "backend", cookie:{maxAge:36000000}
}))


async function testartoken(req,res,next){
    if (req.session.dados)   
    {
        let usuario = req.session.dados.usuario
        let token = req.session.dados.token
        const user= await knex("usuario").where("email",usuario)
        if (user[0]!=undefined) {
            if(user[0].token==token){
                next();
            } else res.redirect("/")
        }  else res.redirect("/") 
    } else res.redirect("/") 
    }


 // Rota home
 app.get("/", (req, res) => { //quando o servidor for requisitado arquivo login é chama
    res.render("login",{cadastrar:0})
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
         
         }else res.render("login",{ // se user nao retornou nada voltar para a tela de login
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
                let resposta = "consultar"
                let modo=0
                res.render("clientes",{modo:modo,user:resposta,usuario:usuario})
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







app.get("/pesquisarcliente", (req, res) => { //quando o servidor for requisitado arquivo login é chama
    
    res.render("clientes",{modo:0,exibir:0,user:"consultar"})
})

app.get("/cadastrarcliente", (req, res) => { //quando o servidor for requisitado arquivo login é chama
    
    res.render("clientes",{modo:1,user:"cadastrar",exibir:0})
})

app.get("/apagarcliente", (req, res) => { //quando o servidor for requisitado arquivo login é chama
    
    res.render("clientes",{modo:2,user:"apagar",exibir:0})
})

app.get("/editarcliente", (req, res) => { //quando o servidor for requisitado arquivo login é chama
    
    res.render("clientes",{modo:3,user:"editar",exibir:0})
})




// Rota consultar -cliente modo 0
app.post("/pesquisarcliente",async(req, res) => {
   
    let cpf = req.body.cpf
   
    if(cpf){ // testa se o formulário está em branco
           try {
            let user= await knex("cliente").where("cpf",cpf)
            if(user[0]!=undefined){  
            res.render("clientes",{modo:0,user:user[0],exibir:1})  
            }else res.render("clientes",{modo:0,user:"errocpf",exibir:0})
            
           } catch (error) {
            res.render("clientes",{modo:0,user:"errosistema",exibir:0})
           }
    }else {
          res.render("clientes",{modo:0,user:"errobranco",exibir:0}) 
          }
});





// Rota Criar-cliente modo 1
app.post("/criarcliente",async(req, res) => { //alterar para post
   
   let nome = req.body.nome
   let cpf = req.body.cpf
    let endereço = req.body.endereço

    if((nome)&&(cpf)&&(endereço)){
       
        
        try {
            let user= await knex("cliente").where("cpf",cpf) //select com filtro
           // console.log(user)
            if(user[0]!=undefined){
                res.render("clientes",{modo:1,user:"errocpf",exibir:0})
              
            }else {
                let novo = [{
                            cpf:cpf,
                            nome:nome,
                            endereço:endereço
                            }]
       
            await knex.insert(novo).into('cliente')
           res.render("clientes",{modo:1,user:"criado",exibir:0})
           
            }
            
           } catch (error) {
            res.render("clientes",{modo:1,user:"errosistema",exibir:0})
            
           }
    }else {
        res.render("clientes",{modo:1,user:"errobranco",exibir:0}) 
          
          }
})






// Rota Update cliente modo 3
app.post("/atualizarcliente",async(req, res) => {
   
    let nome = req.body.nome
    let cpf = req.body.cpf
    let endereço =  req.body.endereço
    if((nome)&&(cpf)&&(endereço)){

        try {
            let user= await knex("cliente").where("cpf",cpf)
            
            if(user[0]!=undefined){
                await knex("cliente").where("cpf",cpf).update({
                    nome:nome,
                    endereço:endereço
                }) 
                res.render("clientes",{modo:3,user:"atualizado",exibir:0}) 
            }else {
                
                res.render("clientes",{modo:3,user:"errocpf",exibir:0})
            }
            
           } catch (error) {
            res.render("clientes",{modo:3,user:"errosistema",exibir:0})
           }
    }else {
        res.render("clientes",{modo:3,user:"errobranco",exibir:0}) 
          }
});









// Rota Deletar-cliente modo 2
app.post("/deletarcliente",async(req, res) => {
   
    let cpf = req.body.cpf
    
    if(cpf){
        try {
            let user= await knex("cliente").where("cpf",cpf)
            
            if(user[0]!=undefined){
                await knex("cliente").where("cpf",cpf).del()
                res.render("clientes",{modo:2,user:"deletado",exibir:0})
            }else {
                
                res.render("clientes",{modo:2,user:"errocpf",exibir:0})
            }
            
           } catch (error) {
            res.render("clientes",{modo:2,user:"errosistema",exibir:0})
           }
      
    }else {
        res.render("clientes",{modo:2,user:"errobranco",exibir:0}) 
          }
});











//servidor
app.listen(80,()=>{console.log("App rodando!");})